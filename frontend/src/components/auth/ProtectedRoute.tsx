import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check admin access if required
  if (requireAdmin && !user?.isAdmin) {
    console.log('⛔ Admin access required but user is not admin');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 