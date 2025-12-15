import { Navigate, useLocation } from 'react-router-dom';
import useAdminAuthStore from '../stores/useAdminAuthStore';

/**
 * ProtectedRoute component
 * Wraps admin routes to require authentication
 * Redirects to login page if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;