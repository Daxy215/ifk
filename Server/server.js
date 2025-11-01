//require('dotenv').config({ path: '../.env' });
//require('dotenv').config({ path: '/home/pguser/pg/ifk-project-management/.env' });

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
const multer = require('multer');
const path = require('path');
const TASK_STATUS = require("../Shared/Enums/TaskStatus");

/*const speakeasy = require('speakeasy');
const qrcode = require('qrcode');*/

const {
    DB_HOST,
    DB_PORT,
    DB_USR,
    DB_USR_PASSWORD,
    DB_CONNECTION_STRING,
    DB_CA_CERT_PATH,
    SESSION_SECRET,
    NODE_ENV,
    VITE_SERVER_PORT = 1234,
    CLIENT_ORIGIN
} = process.env;

const app = express();

app.use("/api/health", (req, res) => {
    res.json({ ok: true });
})

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"],
        }
    },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xContentTypeOptions: true,
    frameguard: { action: 'deny' },
    /*crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },*/
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
}));

app.use(express.json( { limit: '50mb', strict: true } ));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

const allowedOrigin = CLIENT_ORIGIN;
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

const limiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 500,             // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

let sslOptions = false;
const sameSite = 'none';
const secure = true;

if (!DB_CA_CERT_PATH) {
    console.warn('Warning: DB_CA_CERT_PATH not set. Using rejectUnauthorized: false.');
    sslOptions = { rejectUnauthorized: false };
} else {
    sslOptions = {
        rejectUnauthorized: true,
        ca: fs.readFileSync(DB_CA_CERT_PATH).toString()
    };
}

const pool = new pg.Pool({
    connectionString: DB_CONNECTION_STRING,
    ssl: sslOptions,
});

app.use(session({
    store: new PgSession({ pool, tableName: 'sessions' }),
    name: 'pg_sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
        httpOnly: true,
        secure,
        sameSite,
        /*domain: CLIENT_ORIGIN,*/
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
}));

const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        secure,
        sameSite,
        /*domain: CLIENT_ORIGIN,*/
    }
});
app.use(csrfProtection);

app.use((req, res, next) => {
    if (!['GET','POST','PUT','DELETE', 'PATCH'].includes(req.method)) {
        return res.status(405).end();
    }
    
    next();
});

/*if (NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        
        next();
    });
}*/

app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        console.log(err.code);
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    console.error(err.stack || err);
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

async function getUserByEmail(email) {
    const r = await query('SELECT * FROM users WHERE email=$1', [email]);
    
    return r.rows[0];
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
            console.log("bro has no id??? ", req.session);
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

const registerLimitter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: { error: "Too many register attempts, please try again later." }
});

app.post('/api/register', registerLimitter, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            console.log(req.body);
            return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
        }
        
        const existing = await query(
            'SELECT username, email FROM users WHERE username=$1 OR email=$2',
            [username, email]
        );
        
        if (existing.rowCount > 0) {
            const conflictFields = [];
            
            existing.rows.forEach(row => {
                if (row.username === username) conflictFields.push('اسم المستخدم');
                if (row.email === email) conflictFields.push('البريد الإلكتروني');
            });
            
            return res.status(400).json({ error: `هذا ${conflictFields.join(' و ')} مستخدم بالفعل` });
        }
        
        const password_hash = await bcrypt.hash(password, 12);
        
        const ins = await query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
            [username, email, password_hash]
        );
        
        const userId = ins.rows[0].user_id;
        
        const roleRow = await query('SELECT role_id FROM roles WHERE role_name=$1', ['pending']);
        if (roleRow.rowCount > 0) {
            await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2)', [userId, roleRow.rows[0].role_id]);
        }
        
        res.json({ ok: true, userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: "Too many login attempts, please try again later." }
});

app.post('/api/login', loginLimiter, async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    
    const perms = await getUserPermissions(user.user_id);
    const roles = await getUserRoles(user.user_id);
    
    try {
        await query('DELETE FROM sessions WHERE sess::json->>\'userId\' = $1', [user.user_id.toString()]);
        
        req.session.regenerate(async (err) => {
            if (err) {
                console.error(err);
                return next(err);
            }
            
            req.session.userId = user.user_id;
            req.session.permissions = perms;
            req.session.roles = roles;
            
            await new Promise(resolve => req.session.save(resolve));
            
            res.json({
                ok: true,
                user: { username: user.username, userId: user.user_id },
                permissions: perms,
                roles
            });
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => { res.clearCookie('pg_sid'); res.json({ ok: true }); });
});

app.post('/api/reset-password', ensureLoggedIn, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
    }
    
    try {
        const user = await query('SELECT user_id, password_hash FROM users WHERE user_id=$1', [req.user.user_id]);
        if (user.rowCount === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });
        
        const valid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
        if (!valid) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
        
        const newHash = await bcrypt.hash(newPassword, 12);
        await query('UPDATE users SET password_hash=$1 WHERE user_id=$2', [newHash, user.rows[0].user_id]);
        
        res.json({ ok: true, message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

app.get('/api/me', async (req, res) => {
    if (!req.session.userId) return res.json({ authenticated: false });
    
    //const u = await query('SELECT user_id, username, email, created_at, totp_secret IS NOT NULL AS has_2fa FROM users WHERE user_id=$1', [req.session.userId]);
    const u = await query('SELECT user_id, username, email, created_at FROM users WHERE user_id=$1', [req.session.userId]);
    const perms = await getUserPermissions(req.session.userId);
    const roles = await getUserRoles(req.session.userId);
    
    res.json({ authenticated: true, user: u.rows[0], permissions: perms, roles });
});

// Checks if user can view site
app.get('/api/site-content', requirePermission('view_site'), (req, res) => {
    res.json({ ok: true });
});

/*app.get('/api/admin/pending', requirePermission('manage_users'), async (req, res) => {
    const r = await query(`
        SELECT u.user_id, u.username, u.email, u.created_at
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.user_id
        JOIN roles r ON r.role_id = ur.role_id
        WHERE r.role_name = 'pending'
      `);

    res.json({ users: r.rows });
});*/

/*app.post('/api/admin/approve', requirePermission('manage_users'), async (req, res) => {
    const { userId, role } = req.body;

    if (!userId || !role) return res.status(400).json({ error: 'Missing fields' });
    const roleRow = await query('SELECT role_id FROM roles WHERE role_name=$1', [role]);

    if (roleRow.rowCount === 0) return res.status(400).json({ error: 'Invalid role' });
    await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, roleRow.rows[0].role_id]);

    res.json({ ok: true });
});*/

// Projects bs

// Get all projects
app.get('/api/projects', requirePermission('view_site'), async (req, res) => {
    try {
        const isPriv =
            req.session.permissions?.includes('manage_users') ||
            req.session.permissions?.includes('edit_content');
        
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        if (limit > 10) limit = 10; // safety cap
        const offset = (page - 1) * limit;
        
        let sql = `
            SELECT p.*,
                   c.name AS client_name,
                   e.name AS assignee_name,
                   COALESCE(
                           json_agg(
                                   json_build_object(
                                           'attachment_id', a.attachment_id,
                                           'name', a.name,
                                           'type', a.type
                                   )
                           ) FILTER (WHERE a.attachment_id IS NOT NULL), '[]'
                   ) AS attachments
            FROM projects p
                     LEFT JOIN clients c ON p.client_id = c.client_id
                     LEFT JOIN employees e ON p.assignee_id = e.employee_id
                     LEFT JOIN attachments a ON a.project_id = p.project_id
            
        `;
        
        // WHERE p.deleted_at IS NULL
        
        let params = [];
        if (!isPriv) {
            sql += ` AND p.assignee_id = $1`;
            params.push(req.session.userId);
        }
        
        sql += ` GROUP BY p.project_id, c.name, e.name
                 ORDER BY p.project_id DESC
                 LIMIT ${limit} OFFSET ${offset}`;
        
        const r = await query(sql, params);
        
        let countSql = `
            SELECT COUNT(*) AS total
            FROM projects p
        `;
        
        //  WHERE p.deleted_at IS NULL
        
        let countParams = [];
        if (!isPriv) {
            countSql += ` AND p.assignee_id = $1`;
            countParams.push(req.session.userId);
        }
        
        const countResult = await query(countSql, countParams);
        
        res.json({
            data: r.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total, 10),
                page,
                limit,
                totalPages: Math.ceil(countResult.rows[0].total / limit),
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a project
// TODO; ??
app.post('/api/projects', requirePermission('edit_content'), async (req, res) => {
    const { clientId, type, number, name, assigneeId, status } = req.body;
    
    const r = await query(`
        INSERT INTO projects (client_id, type, number, name, assignee_id, status)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
    `, [clientId, type, number || null, name, assigneeId, status || 'مسودة']);
    
    res.json(r.rows[0]);
});

app.post('/api/deleteProjects', requirePermission('edit_content'), async (req, res) => {
    const r = await query(`
        DELETE FROM projects;
    `);
    
    res.json( { ok: true } );
})

app.get('/api/projects/search', requirePermission('edit_content'), async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === "") {
        return res.json([]);
    }
    
    try {
        const r = await query(`
            SELECT project_id, number, name, status
            FROM projects
            WHERE status != 'مغلقة'
              AND number ILIKE $1
            ORDER BY project_id DESC
            LIMIT 20
        `, [`%${q}%`]);
        
        res.json(r.rows);
    } catch (err) {
        console.error("Project search failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})

// Get project
app.get('/api/projects/:id', requirePermission('edit_content'), async (req, res) => {
    const { id } = req.params;
    
    try {
        const r = await query(`
            SELECT *
            FROM projects
            WHERE project_id=$1
        `, [id]);
        
        if (r.rows.length === 0) {
            //return res.status(404).json({ error: "Project not found" });
            return res.json({});
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error("Fetch project failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update project
app.put('/api/projects/:id', requirePermission('edit_content'), async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    let i = 1;
    
    for (const [key, value] of Object.entries(updates)) {
        let column = key;
        if (key === "clientId") column = "client_id";
        if (key === "assigneeId") column = "assignee_id";
        if (key === "closedAt") column = "closed_at";
        
        const safeValue = (value === undefined || value === "") ? null : value;
        
        fields.push(`${column}=$${i}`);
        values.push(safeValue);
        i++;
    }
    
    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }
    
    values.push(id);
    
    try {
        const r = await query(`
            UPDATE projects
            SET ${fields.join(", ")}
            WHERE project_id=$${i}
            RETURNING *
        `, values);
        
        if (r.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error("Update project failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete project
app.delete('/api/projects/:id', requirePermission('edit_content'), async (req, res) => {
    await query('DELETE FROM projects WHERE project_id=$1', [req.params.id]);
    res.json({ ok: true });
});

// Tasks bs

// Get all tasks
app.get('/api/tasks', requirePermission('view_site'), async (req, res) => {
    try {
        const perms = req.session.permissions || [];
        const isPriv = perms.includes('manage_users') || perms.includes('edit_content');
        
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        if (limit > 10) limit = 10; // safety cap
        const offset = (page - 1) * limit;
        
        const params = [];
        let sql = `
          SELECT t.*,
                 p.name AS project_name,
                 e.name AS assignee_name,
                 COALESCE(
                   json_agg(
                     json_build_object(
                       'attachment_id', a.attachment_id,
                       'name', a.name,
                       'type', a.type
                     )
                   ) FILTER (WHERE a.attachment_id IS NOT NULL), '[]'
                 ) AS attachments
          FROM tasks t
          LEFT JOIN projects p ON t.project_id = p.project_id
          LEFT JOIN employees e ON t.assignee_id = e.employee_id
          LEFT JOIN attachments a ON a.task_id = t.task_id
        `;
        
        // WHERE t.deleted_at IS NULL
        
        if (!isPriv) {
            sql += ` AND t.created_by = $1`;
            params.push(req.session.userId);
        }
        
        sql += ` GROUP BY t.task_id, p.name, e.name
                 ORDER BY t.task_id DESC
                 LIMIT ${limit} OFFSET ${offset}`;
        
        const r = await query(sql, params);
        
        let countSql = `
          SELECT COUNT(*) AS total
          FROM tasks t
        `;
        
        //WHERE t.deleted_at IS NULL
        
        let countParams = [];
        if (!isPriv) {
            countSql += ` AND t.created_by = $1`;
            countParams.push(req.session.userId);
        }
        
        const countResult = await query(countSql, countParams);
        
        res.json({
            data: r.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total, 10),
                page,
                limit,
                totalPages: Math.ceil(countResult.rows[0].total / limit),
            },
        });
    } catch (e) {
        console.error('Error fetching tasks:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List tasks for a project
app.get('/api/projects/:id/tasks', requirePermission('edit_content'), async (req, res) => {
    const r = await query(`
        SELECT t.*, e.name AS assignee_name
        FROM tasks t
        LEFT JOIN employees e ON t.assignee_id = e.employee_id
        WHERE t.project_id=$1
        ORDER BY t.task_id
    `, [req.params.id]);
    
    res.json(r.rows);
});

// Add task
app.post('/api/tasks', requirePermission('edit_content'), async (req, res) => {
    const { project_id, description, assignee_id, duration, status } = req.body;
    
    const r = await query(`
        INSERT INTO tasks (project_id, description, assignee_id, duration, status)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
    `, [project_id, description, assignee_id || null, duration, status || TaskStatus.ACTIVE]);
    
    res.json(r.rows[0]);
});

// Update task
app.patch('/api/tasks/:id', requirePermission('edit_content'), async (req, res) => {
    const allowedFields = ['description', 'assignee_id', 'duration', 'status', 'updated_at'];
    
    const fields = [];
    const values = [];
    let i = 1;
    
    for (const [key, value] of Object.entries(req.body)) {
        if (!allowedFields.includes(key)) continue;
        
        fields.push(`${key} = $${i}`);
        values.push(value);
        
        i++;
    }
    
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    values.push(req.params.id);
    
    const queryText = `
        WITH updated AS (
        UPDATE tasks t
        SET ${fields.join(", ")}
        WHERE t.task_id = $${i}
            RETURNING t.*
    )
        SELECT
            u.*,
            p.number AS project_number,
            c.name AS client_name,
            e.name AS assignee_name
        FROM updated u
                 LEFT JOIN projects p ON u.project_id = p.project_id
                 LEFT JOIN clients c ON p.client_id = c.client_id
                 LEFT JOIN employees e ON u.assignee_id = e.employee_id
    `;
    
    try {
        const r = await query(queryText, values);
        
        if (r.rows.length === 0) {
            //return res.status(404).json({ error: 'Task not found' });
            return res.status(404).json({});
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete task
app.delete('/api/tasks/:id', requirePermission('edit_content'), async (req, res) => {
    await query('DELETE FROM tasks WHERE task_id=$1', [req.params.id]);
    res.json({ ok: true });
});

// Employees bs
app.get('/api/employees', requirePermission('manage_users'), async (req, res) => {
    const r = await query('SELECT * FROM employees ORDER BY employee_id');
    
    res.json(r.rows);
});

app.post('/api/employees', requirePermission('manage_users'), async (req, res) => {
    const { name, jobTitle, email, phone, contactOfficer } = req.body;
    
    const r = await query(`
        INSERT INTO employees (name, job_title, email, phone, contact_officer)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
    `, [name, jobTitle, email, phone, contactOfficer]);
    
    res.json(r.rows[0]);
});

app.get('/api/employees/search', requirePermission('manage_users'), async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === "") {
        return res.json([]);
    }
    
    try {
        const r = await query(`
            SELECT employee_id, name
            FROM employees
            WHERE name ILIKE $1
            ORDER BY employee_id DESC
            LIMIT 20
        `, [`%${q}%`]);
        
        res.json(r.rows);
    } catch (err) {
        console.error("Employee search failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get employee by id
app.get('/api/employees/:id', requirePermission('manage_users'), async (req, res) => {
    const { id } = req.params;
    
    try {
        const r = await query(`
            SELECT employee_id, name, job_title, email, phone, contact_officer
            FROM employees
            WHERE employee_id = $1
        `, [id]);
        
        if (r.rows.length === 0) {
            /*return res.status(404).json({ error: "الموظف غير موجود" });*/
            return res.json({});
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error("Error fetching employee by ID:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update employee by id
app.put('/api/employees/:id', requirePermission('manage_users'), async (req, res) => {
    const { id } = req.params;
    const { name, jobTitle, email, phone, contactOfficer } = req.body;
    
    try {
        const r = await query(`
            UPDATE employees
            SET name = $1,
                job_title = $2,
                email = $3,
                phone = $4,
                contact_officer = $5
            WHERE employee_id = $6
            RETURNING *
        `, [name, jobTitle, email, phone, contactOfficer, id]);
        
        if (r.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Clients bs
app.get('/api/clients', requirePermission('manage_users'), async (req, res) => {
    const r = await query('SELECT * FROM clients ORDER BY client_id');
    res.json(r.rows);
});

app.post('/api/clients', requirePermission('manage_users'), async (req, res) => {
    const { name, email, phone, contactOfficer } = req.body;
    
    const r = await query(`
        INSERT INTO clients (name, email, phone, contact_officer)
        VALUES ($1,$2,$3,$4)
        RETURNING *
    `, [name, email, phone, contactOfficer]);
    
    res.json(r.rows[0]);
});

app.get('/api/clients/search', requirePermission('manage_users'), async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === "") {
        return res.json([]);
    }
    
    try {
        const r = await query(`
            SELECT client_id, name
            FROM clients
            WHERE name ILIKE $1
            ORDER BY client_id DESC
            LIMIT 20
        `, [`%${q}%`]);
        
        res.json(r.rows);
    } catch (err) {
        console.error("Client search failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get client by id
app.get('/api/clients/:id', requirePermission('manage_users'), async (req, res) => {
    const { id } = req.params;
    
    try {
        const r = await query(`
            SELECT client_id, name, email, phone, contact_officer
            FROM clients
            WHERE client_id = $1
        `, [id]);
        
        if (r.rows.length === 0) {
            /*return res.status(404).json({ error: "الموظف غير موجود" });*/
            return res.json({});
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error("Error fetching client by ID:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update client by id
app.put('/api/clients/:id', requirePermission('manage_users'), async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, contactOfficer } = req.body;
    
    try {
        const r = await query(`
            UPDATE clients
            SET name = $1,
                email = $2,
                phone = $3,
                contact_officer = $4
            WHERE client_id = $5
            RETURNING *
        `, [name, email, phone, contactOfficer, id]);
        
        if (r.rows.length === 0) {
            return res.status(404).json({ error: "Client not found" });
        }
        
        res.json(r.rows[0]);
    } catch (err) {
        console.error("Error updating client:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Attachment bs
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeName = file.fieldname + '-' + Date.now() + ext;
        cb(null, safeName);
    }
});

/*const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});*/

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.png','.jpg','.jpeg','.pdf','.doc','.docx','.xlsx','.txt'];
    
    if (!allowedTypes.includes(path.extname(file.originalname).toLowerCase())) {
        return cb(new Error('نوع الملف غير مدعوم'), false);
    }
    
    cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});

app.post('/api/attachments', ensureLoggedIn, upload.single('attachment'), async (req, res) => {
    try {
        const { projectId, taskId, name, type } = req.body;
        
        if (!req.file) return res.status(400).json({ error: 'يرجى إرفاق ملف' });
        if (!projectId && !taskId) return res.status(400).json({ error: 'يجب تحديد مشروع أو مهمة' });
        
        if (projectId) {
            const project = await query('SELECT * FROM projects WHERE project_id=$1', [projectId]);
            if (!project.rows[0]) return res.status(404).json({ error: 'المشروع غير موجود' });
        }
        
        if (taskId) {
            const task = await query('SELECT * FROM tasks WHERE task_id=$1', [taskId]);
            if (!task.rows[0]) return res.status(404).json({ error: 'المهمة غير موجودة' });
        }
        
        const r = await query(`
            INSERT INTO attachments (project_id, task_id, name, type, path)
            VALUES ($1,$2,$3,$4,$5)
                RETURNING *
        `, [projectId || null, taskId || null, name || req.file.originalname, type || req.file.mimetype, req.file.filename]);
        
        res.json({ ok: true, attachment: r.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// TODO; MAKE SURE USER HAS ACCESS TO IT!!
app.get('/api/attachments/:id', ensureLoggedIn, async (req, res) => {
    try {
        const r = await query('SELECT * FROM attachments WHERE attachment_id=$1', [req.params.id]);
        if (r.rows.length === 0) return res.status(404).json({ error: 'المرفق غير موجود' });
        
        const file = path.join(uploadDir, r.rows[0].path);
        
        console.log("Serarching for;", file);
        
        if (!fs.existsSync(file)) return res.status(404).json({ error: 'الملف غير موجود على الخادم' });
        
        res.sendFile(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

app.delete('/api/attachments/:id', requirePermission('edit_content'), async (req, res) => {
    try {
        const r = await query('SELECT * FROM attachments WHERE attachment_id=$1', [req.params.id]);
        if (r.rows.length === 0) return res.status(404).json({ error: 'المرفق غير موجود' });
        
        const file = path.join(uploadDir, r.rows[0].name);
        if (fs.existsSync(file)) fs.unlinkSync(file);
        
        await query('DELETE FROM attachments WHERE attachment_id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

/*app.listen(VITE_SERVER_PORT, "127.0.0.1",() => {
    console.log(`Running at http://127.0.0.1:${VITE_SERVER_PORT}`)
});*/
app.listen(VITE_SERVER_PORT, "0.0.0.0",() => {
    console.log(`Running at http://127.0.0.1:${VITE_SERVER_PORT}`)
});
