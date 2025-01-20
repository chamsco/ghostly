import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
} 