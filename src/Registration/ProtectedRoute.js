import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';

export default function ProtectedRoute({ required, children }) {
    const { permissions, loading } = useContext(UserContext);

    if (loading) return null;
    if (!permissions.includes(required)) return <Navigate to="/forbidden" replace />;

    return children;
}
