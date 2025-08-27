import React, { useState, useContext } from 'react';
import { UserContext } from '../Context/UserContext';

export default function TwoFASetup() {
    const { refresh, user } = useContext(UserContext);
    const [qr, setQr] = useState(null);
    const [base32, setBase32] = useState(null);
    const [token, setToken] = useState('');
    const [msg, setMsg] = useState(null);

    async function startSetup() {
        setMsg(null);
        const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/2fa/setup`, { credentials: 'include' });
        const j = await res.json();
        if (!res.ok) setMsg(j.error || 'failed');
        else { setQr(j.qr); setBase32(j.base32); }
    }

    async function verify() {
        setMsg(null);
        const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/2fa/verify`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const j = await res.json();
        if (!res.ok) setMsg(j.error || 'failed');
        else { setMsg('enabled'); await refresh(); }
    }

    async function disable() {
        setMsg(null);
        const t = prompt('Enter current 2FA code to disable');
        if (!t) return;
        const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/2fa/disable`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: t })
        });
        const j = await res.json();
        if (!res.ok) setMsg(j.error || 'failed');
        else { setMsg('disabled'); setQr(null); setBase32(null); await refresh(); }
    }

    return (
        <div>
            <h3>2FA</h3>
            {!user?.has_2fa && !qr && <button onClick={startSetup}>Start 2FA setup</button>}
            {qr && (
                <div>
                    <img src={qr} alt="qr" />
                    <div>{base32}</div>
                    <input value={token} onChange={e=>setToken(e.target.value)} placeholder="Enter code" />
                    <button onClick={verify}>Verify</button>
                </div>
            )}
            {user?.has_2fa && <button onClick={disable}>Disable 2FA</button>}
            {msg && <div>{msg}</div>}
        </div>
    );
}
