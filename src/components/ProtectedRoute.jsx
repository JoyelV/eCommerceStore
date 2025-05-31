import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthHook';

function ProtectedRoute({ children, redirectIfAuthenticated = false }) {
  const { user } = useAuth();

  if (redirectIfAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  if (!redirectIfAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;