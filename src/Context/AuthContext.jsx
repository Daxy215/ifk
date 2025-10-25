import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const { t } = useTranslation();
    
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [csrfToken, setCsrfToken]           = useState(null);
    
    const getCsrfToken = async() => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/csrf-token`, { credentials: "include" });
            const j = await res.json();
            
            setCsrfToken(j.csrfToken);
            
            return j.csrfToken;
        } catch {
            return null;
        }
    }
    
    const apiFetch = async (url, options = {}) => {
        const tkn = csrfToken || await getCsrfToken();
        
        const headers = {
            'CSRF-Token': tkn,
            ...(options.headers || {}),
        };
        
        // Only set JSON header if body is not FormData
        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}` + url, {
            ...options,
            credentials: 'include',
            headers,
        });
        
        if (!res.ok) {
            let err;
            
            try {
                err = await res.json();
            } catch {
                err = { error: t('auth.requestFailed', { status: res.status }) };
            }
            
            throw new Error(err.error || t('auth.unknownError'));
        }
        
        return res.json();
    };
    
    async function fetchMe(token) {
        try {
            const res = await apiFetch(`/api/me`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const j = await res.json();

            if (j.authenticated) {
                setUser(j.user);
                setPermissions(j.permissions || []);
                setRoles(j.roles || []);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setPermissions([]);
                setRoles([]);
                setIsAuthenticated(false);
            }
        } catch {
            setUser(null);
            setPermissions([]);
            setRoles([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        /*const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');*/

        async function init() {
            const token = await getCsrfToken();
            await fetchMe(token);
        }

        init();

        /*if (token && userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        
        setIsLoading(false);*/
    }, []);

    const login = async (credentials) => {
        const tkn = csrfToken || await getCsrfToken();

        try {
            const response = await apiFetch('/api/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': tkn,
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const newToken = await getCsrfToken();
                await fetchMe(newToken);

                setIsAuthenticated(true);
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, error: error.message || t('auth.loginFailed') };
            }
        } catch (error) {
            return { success: false, error: t('auth.networkError') };
        }
    };

    const register = async (userData) => {
        const tkn = csrfToken || await getCsrfToken();
        
        try {
            const response = await apiFetch('/api/register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': tkn,
                },
                body: JSON.stringify(userData),
            });
            
            if (response.ok) {
                const loginResult = await login({
                    email: userData.email,
                    password: userData.password,
                });
                
                return loginResult.success
                    ? { success: true }
                    : { success: false, error: t('auth.registerLoginFailed') };
            } else {
                const error = await response.json();
                return { success: false, error: error.message || t('auth.registerFailed') };
            }
        } catch (error) {
            return { success: false, error: t('auth.networkError') };
        }
    };

    const logout = async () => {
        try {
            await apiFetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            console.warn(t('auth.logoutFailed'));
        }

        setUser(null);
        setPermissions([]);
        setRoles([]);
        setIsAuthenticated(false);
    };

    const uploadAttachments = async (files, { projectId, taskId }) => {
        if (!files || files.length === 0) return [];

        const uploaded = [];

        for (const file of files) {
            const formData = new FormData();
            formData.append("attachment", file);

            if (projectId) formData.append("projectId", projectId);
            if (taskId) formData.append("taskId", taskId);

            formData.append("name", file.name);
            formData.append("type", file.type);

            const res = await apiFetch("/api/attachments", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(t('auth.uploadFailed'));

            const data = await res;
            uploaded.push(data.attachment);
        }

        return uploaded;
    };

    const value = {
        user,
        roles,
        permissions,
        isAuthenticated,
        isLoading,
        uploadAttachments,
        getCsrfToken,
        apiFetch,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
