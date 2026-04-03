import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;