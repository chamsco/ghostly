import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';

export function AdminRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
} 