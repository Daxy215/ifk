import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './Context/UserContext';
import PermissionGate from './Registration/PermissionGate';

export default function Dashboard() {
    const { user, permissions } = useContext(UserContext);
    const [content, setContent] = useState(null);

    useEffect(() => {
        async function load() {
            console.log(process.env.REACT_APP_SERVER_ORIGIN);

            const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/site-content`, { credentials: 'include' });

            if (res.ok) {
                const j = await res.json();

                setContent(j.content);
            } else {
                setContent(null);
            }
        }
        load();
    }, [user]);

    return (
        <div>
            <h1>{user ? `Hello ${user.username}` : 'Guest'}</h1>
            <PermissionGate permissions={permissions} required="view_site">
                <div>{content}</div>
            </PermissionGate>
        </div>
    );
}
