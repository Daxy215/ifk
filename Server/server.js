require('dotenv').config({ path: '/home/pguser/pg/.env' });
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const pg = require('pg');
const fs = require('fs');
const PgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const {
    DB_CONNECTION_STRING,
    DB_CA_CERT_PATH,
    SESSION_SECRET,
    NODE_ENV,
    SERVER_PORT = 1234,
    CLIENT_ORIGIN
} = process.env;

console.log(CLIENT_ORIGIN);

const app = express();
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
        }
    },
    hsts: NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false
}));
app.use(express.json());
app.use(cookieParser());

const allowedOrigin = CLIENT_ORIGIN;
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 100,             // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

let sslOptions = false;

if (NODE_ENV === 'production') {
    if (!DB_CA_CERT_PATH) {
        console.warn('Warning: DB_CA_CERT_PATH not set. Using rejectUnauthorized: false.');
        sslOptions = { rejectUnauthorized: false };
    } else {
        sslOptions = {
            rejectUnauthorized: true,
            ca: fs.readFileSync(DB_CA_CERT_PATH).toString()
        };
    }
}

const pool = new pg.Pool({
    connectionString: DB_CONNECTION_STRING,
    ssl: sslOptions,
    secret: SESSION_SECRET,
});

app.use(session({
    store: new PgSession({ pool, tableName: 'session' }),
    name: 'ifk_sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
}));

app.use(csurf({ cookie: { httpOnly: true, secure: NODE_ENV === 'production', sameSite: 'strict' } }));

/*if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }

        next();
    });
}*/

// Error handling
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

/*app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin, credentials: true }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

const pool = new pg.Pool({ connectionString: DB_CONNECTION_STRING });

app.use(session({
    store: new PgSession({ pool, tableName: 'session' }),
    name: 'sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));*/

async function query(sql, params) {
    const client = await pool.connect();
    try { return await client.query(sql, params); }
    finally { client.release(); }
}

async function getUserByUsername(username) {
    const r = await query('SELECT * FROM users WHERE username=$1', [username]);

    return r.rows[0];
}

async function getUserPermissions(userId) {
    const r = await query(`
        SELECT p.perm_name
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.perm_id = p.perm_id
        WHERE ur.user_id = $1
      `, [userId]);

    return r.rows.map(x => x.perm_name);
}

async function getUserRoles(userId) {
    const r = await query(`
        SELECT r.role_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = $1
      `, [userId]);

    return r.rows.map(x => x.role_name);
}

function ensureLoggedIn(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

function requirePermission(permName) {
    return async (req, res, next) => {
        if (!req.session.userId) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        try {
            const perms = await getUserPermissions(req.session.userId);

            if (!perms.includes(permName)) {
                return res.status(403).json({error: 'Forbidden'});
            }

            next();
        } catch { res.status(500).json({ error: 'Server error' }); }
    };
}

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await query('SELECT 1 FROM users WHERE username=$1 OR email=$2', [username, email]);
    if (existing.rowCount > 0) return res.status(400).json({ error: 'User/email exists' });

    const password_hash = await bcrypt.hash(password, 12);
    const ins = await query('INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3) RETURNING user_id', [username, email, password_hash]);

    const userId = ins.rows[0].user_id;
    const roleRow = await query('SELECT role_id FROM roles WHERE role_name=$1', ['pending']);
    if (roleRow.rowCount > 0) await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2)', [userId, roleRow.rows[0].role_id]);

    res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
    const { username, password, token } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await getUserByUsername(username);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    /*if (user.totp_secret) {
        if (!token) return res.status(400).json({ error: '2FA token required' });

        const verified = speakeasy.totp.verify({ secret: user.totp_secret, encoding: 'base32', token, window: 1 });
        if (!verified) return res.status(403).json({ error: 'Invalid 2FA token' });
    }*/

    req.session.userId = user.user_id;
    const perms = await getUserPermissions(user.user_id);

    req.session.permissions = perms;
    const roles = await getUserRoles(user.user_id);

    res.json({ ok: true, user: { username: user.username, userId: user.user_id }, permissions: perms, roles });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => { res.clearCookie('sid'); res.json({ ok: true }); });
});

app.get('/api/me', async (req, res) => {
    if (!req.session.userId) return res.json({ authenticated: false });

    const u = await query('SELECT user_id, username, email, created_at, totp_secret IS NOT NULL AS has_2fa FROM users WHERE user_id=$1', [req.session.userId]);
    const perms = await getUserPermissions(req.session.userId);
    const roles = await getUserRoles(req.session.userId);

    res.json({ authenticated: true, user: u.rows[0], permissions: perms, roles });
});

app.get('/api/2fa/setup', ensureLoggedIn, async (req, res) => {
    const secret = speakeasy.generateSecret({ length: 20, name: `App (${req.session.userId})`, issuer: 'App' });
    req.session.temp_totp_secret = secret.base32;

    const qr = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qr, base32: secret.base32 });
});

app.post('/api/2fa/verify', ensureLoggedIn, async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const temp = req.session.temp_totp_secret;
    if (!temp) return res.status(400).json({ error: 'No pending 2FA setup' });

    const ok = speakeasy.totp.verify({ secret: temp, encoding: 'base32', token, window: 1 });
    if (!ok) return res.status(400).json({ error: 'Invalid token' });

    await query('UPDATE users SET totp_secret=$1 WHERE user_id=$2', [temp, req.session.userId]);
    delete req.session.temp_totp_secret;

    res.json({ ok: true });
});

app.post('/api/2fa/disable', ensureLoggedIn, async (req, res) => {
    const { token } = req.body;

    const u = await query('SELECT totp_secret FROM users WHERE user_id=$1', [req.session.userId]);

    if (u.rowCount === 0 || !u.rows[0].totp_secret) return res.status(400).json({ error: '2FA not enabled' });
    const ok = speakeasy.totp.verify({ secret: u.rows[0].totp_secret, encoding: 'base32', token, window: 1 });

    if (!ok) return res.status(400).json({ error: 'Invalid token' });
    await query('UPDATE users SET totp_secret=NULL WHERE user_id=$1', [req.session.userId]);

    res.json({ ok: true });
});

app.get('/api/site-content', requirePermission('view_site'), (req, res) => {
    res.json({ content: 'protected' });
});

app.get('/api/admin/pending', requirePermission('manage_users'), async (req, res) => {
    const r = await query(`
        SELECT u.user_id, u.username, u.email, u.created_at
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.user_id
        JOIN roles r ON r.role_id = ur.role_id
        WHERE r.role_name = 'pending'
      `);

    res.json({ users: r.rows });
});

app.post('/api/admin/approve', requirePermission('manage_users'), async (req, res) => {
    const { userId, role } = req.body;

    if (!userId || !role) return res.status(400).json({ error: 'Missing fields' });
    const roleRow = await query('SELECT role_id FROM roles WHERE role_name=$1', [role]);

    if (roleRow.rowCount === 0) return res.status(400).json({ error: 'Invalid role' });
    await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, roleRow.rows[0].role_id]);

    res.json({ ok: true });
});

app.listen(SERVER_PORT, "127.0.0.1",() => {
    console.log(`Running at http://127.0.0.1:${SERVER_PORT}`)
});
