import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/components/ui/use-toast';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, authStatus, authError } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Show loading state while checking authentication
  if (isLoading || authStatus === 'LOADING') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error states
  if (authStatus === 'ERROR' && authError) {
    toast({
      title: "Authentication Error",
      description: authError.message,
      variant: "destructive",
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated || authStatus === 'UNAUTHENTICATED') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
} 