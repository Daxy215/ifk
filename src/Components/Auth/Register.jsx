import React, { useState } from 'react';
import {Link} from "react-router-dom";

import { useAuth } from '../../Context/AuthContext';
import { useNotification } from '../../Context/NotificationContext';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const { t } = useTranslation();
    
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const { showNotification } = useNotification();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (userData.password !== userData.confirmPassword) {
            showNotification(t('register.passwordMismatch'), true);
            return;
        }
        
        setIsLoading(true);
        const result = await register(userData);
        
        if (result.success) {
            showNotification(t('register.success'));
            
            // Redirect to login or clear form
            setUserData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
        } else {
            showNotification(result.error, true);
        }
        
        setIsLoading(false);
    };
    
    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };
    
    return (
        <div className="bg-gray-100 center-vh">
            <div className="bg-white register-card">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('register.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">{t('register.username')}</label>
                        <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">{t('register.email')}</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">{t('register.password')}</label>
                        <input
                            type="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">{t('register.confirmPassword')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={userData.confirmPassword}
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
                        {isLoading ? t('register.loading') : t('register.submit')}
                    </button>
                </form>
                
                <p className="text-center mt-4">
                    {t('register.alreadyHaveAccount')}{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        {t('register.login')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
