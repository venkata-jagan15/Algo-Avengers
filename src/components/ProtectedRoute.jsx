import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const userString = localStorage.getItem('innotrack_user');

    if (!userString) {
        // Redirect to login but save the attempted URL to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
