import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const { t } = useTranslation();
    
    /*const [user                   , setUser           ] = useState(null );*/
    /*const [permissions      , setPermissions    ] = useState([]   );
    const [roles            , setRoles          ] = useState([]   );*/
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading      , setIsLoading      ] = useState(true );
    const [csrfToken              , setCsrfToken      ] = useState(null );
    
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
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}` + url, {
                ...options,
                credentials: 'include',
                headers,
            });
            
            //console.log("GOT; ", res);
            const data = await res.json().catch(() => null);
            return { ok: res.ok, status: res.status, data };
        } catch(err) {
            console.error(err);
        }
    };
    
    async function fetchMe() {
        try {
            const res = await apiFetch(`/api/me`, {method: 'GET'});
            
            const data = res.data;
            
            if (data.authenticated) {
                /*setUser(data.user);
                setPermissions(data.permissions || []);
                setRoles(data.roles || []);*/
                setIsAuthenticated(true);
            } else {
                /*setUser(null);
                setPermissions([]);
                setRoles([]);*/
                setIsAuthenticated(false);
            }
        } catch {
            /*setUser(null);
            setPermissions([]);
            setRoles([]);*/
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        async function init() {
            await fetchMe();
        }

        init();
    }, []);
    
    const login = async (credentials) => {
        try {
            const response = await apiFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
            
            console.log("So; ", response);
            
            if (response.ok) {
                await fetchMe();
                
                setIsAuthenticated(true);
                
                return { success: true };
            } else {
                const error = await response.data.error;
                return { success: false, error: error || t('auth.loginFailed') };
            }
        } catch (error) {
            console.log(error);
            return { success: false, error: t('auth.networkError') };
        }
    };
    
    const register = async (userData) => {
        try {
            const response = await apiFetch('/api/register', {
                method: 'POST',
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
                const error = await response.data;
                return { success: false, error: error || t('auth.registerFailed') };
            }
        } catch (error) {
            return { success: false, error: t('auth.networkError') };
        }
    };
    
    const logout = async () => {
        try {
            await apiFetch('/api/logout', {
                method: 'POST',
            });
        } catch (e) {
            console.warn(t('auth.logoutFailed'));
        }
        
        /*setUser(null);
        setPermissions([]);
        setRoles([]);*/
        setIsAuthenticated(false);
    };
    
    const uploadAttachments = async (files, { project_id, task_id }) => {
        if (!files || files.length === 0) return [];
        
        const uploaded = [];
        
        for (const file of files) {
            if(file.size === 0) continue;
            
            const formData = new FormData();
            formData.append("attachment", file);
            
            if (project_id) formData.append("project_id", project_id);
            if (task_id) formData.append("||", task_id);
            
            formData.append("name", file.name);
            formData.append("type", file.type);
            
            const res = await apiFetch("/api/attachments", {
                method: "POST",
                body: formData,
            });
            
            if (!res.ok) throw new Error(t('auth.uploadFailed'));
            
            uploaded.push(res.data.attachment);
        }
        
        return uploaded;
    };
    
    const value = {
        /*user,
        roles,
        permissions,*/
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
