import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

import { useAuth } from '../../Context/AuthContext';
import { useNotification } from '../../Context/NotificationContext';

const Login = () => {
    const { t, i18n } = useTranslation();
    
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { showNotification } = useNotification();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const result = await login(credentials);
        
        if (result.success) {
            showNotification('تم تسجيل الدخول بنجاح!');
        } else {
            showNotification(result.error, true);
        }
        
        setIsLoading(false);
    };
    
    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };
    
    return (
        <div dir="rtl" className="font-sans bg-gray-100 center-vh">
            <div className="bg-white login-card">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {t("login.title")}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("login.email")}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("login.password")}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    >
                        {isLoading ? t("login.loading") : t("login.title")}
                    </button>
                </form>
                <p className="text-center mt-4">
                    {t("login.noAccount")}{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        {t("register.title")}
                    </Link>
                </p>
            </div>
        </div>
        
        /*<div dir="rtl" className="font-sans bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">البريد الإلكتروني</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">كلمة المرور</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    >
                        {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                    </button>
                </form>
                <p className="text-center mt-4">
                    ليس لديك حساب؟{' '}
                    <a href="/register" className="text-blue-600 hover:underline">
                        إنشاء حساب جديد
                    </a>
                </p>
            </div>
        </div>*/
    );
};

export default Login;