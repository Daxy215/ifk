import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
    const [pending, setPending] = useState([]);

    async function fetchPending() {
        const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/admin/pending`, { credentials: 'include' });
        const j = await res.json();
        setPending(j.users || []);
    }

    async function approve(userId) {
        await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/admin/approve`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role: 'approved_user' })
        });
        await fetchPending();
    }

    useEffect(() => { fetchPending(); }, []);

    return (
        <div>
            <h2>Admin</h2>
            <ul>
                {pending.map(u => (
                    <li key={u.user_id}>
                        {u.username} <button onClick={() => approve(u.user_id)}>Approve</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
