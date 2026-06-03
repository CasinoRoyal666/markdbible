import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            setIsAuthorized(decoded.exp > now);
        } catch {
            setIsAuthorized(false);
        }
    }, []);

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }
    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
