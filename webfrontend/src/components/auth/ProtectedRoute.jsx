import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../common';
import { ROUTES } from '../../constants/routes';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission, hasActiveSubscription } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen text="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check subscription status
  if (!hasActiveSubscription()) {
    // Allow access to subscription page even without active subscription
    if (location.pathname !== ROUTES.SUBSCRIPTION && location.pathname !== ROUTES.PROFILE) {
      return <Navigate to={ROUTES.SUBSCRIPTION} replace />;
    }
  }

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
