import React from 'react';
import { Navigate } from 'react-router-dom';

const withAuthorization = (allowedRoles) => (WrappedComponent) => {
    return (props) => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
            return <Navigate to="/" replace />;
        }

        let userRole = null;
        try {
            const user = JSON.parse(userStr);
            userRole = user.role;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return <Navigate to="/" replace />;
        }

        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuthorization;