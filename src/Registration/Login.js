import React, { useState, useContext } from 'react';
import { UserContext } from '../Context/UserContext';

export default function Login() {
    const { refresh } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [err, setErr] = useState(null);

    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);

        const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, token })
        });

        const j = await res.json();

        if (!res.ok) setErr(j.error || 'Login failed')

        else await refresh();
    }

    return (
        <form onSubmit={onSubmit}>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required />
            <input value={token} onChange={e=>setToken(e.target.value)} placeholder="2FA token (if enabled)" />
            <button type="submit">Login</button>
            {err && <div style={{color:'red'}}>{err}</div>}
        </form>
    );
}