import React, { createContext, useState, useContext } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        error: false,
    });
    
    const showNotification = (message, error = false) => {
        setNotification({ show: true, message, error });
        setTimeout(() => setNotification({ show: false, message: "", error: false }), 3000);
    };
    
    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div
                className={`notification ${notification.show ? "show" : ""} ${
                    notification.error ? "error" : "success"
                }`}
            >
                <i
                    className={`fas ${
                        notification.error ? "fa-exclamation-circle" : "fa-check-circle"
                    }`}
                ></i>
                <div>{notification.message}</div>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
