import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
// BrowserRouter

import { useTranslation } from "react-i18next";

import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import MainApp from './Components/MainApp';
import { useAuth } from "./Context/AuthContext"; // @??

import './App.css';

function App() {
    const { i18n } = useTranslation();
    
    const { isAuthenticated, isLoading } = useAuth();
    
    //let isAuthenticated = true;
    
    // Update page direction based on language
    useEffect(() => {
        // Set HTML direction based on current language
        
        // Only Arabic and English will ever exist,
        // so no need for further checks
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
        //console.log(document.documentElement.dir);
    }, [i18n.language]);
    
    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route
                        path="/login"
                        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/register"
                        element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/*"
                        element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />}
                    />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
