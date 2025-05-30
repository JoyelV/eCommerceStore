import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

function ProtectedRoute({ children, redirectIfAuthenticated = false }) {
  const { user } = useAuth();

  // If redirectIfAuthenticated is true (e.g., for /login), redirect authenticated users to /
  if (redirectIfAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  // If redirectIfAuthenticated is false (e.g., for protected routes like /checkout), redirect unauthenticated users to /login
  if (!redirectIfAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;