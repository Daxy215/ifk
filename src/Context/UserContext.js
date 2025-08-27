import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchMe() {
        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_ORIGIN || ''}/api/me`, { credentials: 'include' });
            const j = await res.json();
            if (j.authenticated) {
                setUser(j.user);
                setPermissions(j.permissions || []);
                setRoles(j.roles || []);
            } else {
                setUser(null);
                setPermissions([]);
                setRoles([]);
            }
        } catch {
            setUser(null);
            setPermissions([]);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchMe(); }, []);

    return (
        <UserContext.Provider value={{ user, permissions, roles, loading, refresh: fetchMe }}>
            {children}
        </UserContext.Provider>
    );
}