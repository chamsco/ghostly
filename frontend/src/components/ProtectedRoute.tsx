/**
 * Protected Route Component
 * 
 * Higher-order component that protects routes by:
 * - Checking authentication status
 * - Redirecting unauthenticated users to login
 * - Preserving attempted URL for post-login redirect
 * - Handling loading states during auth check
 * 
 * Example usage:
 * ```tsx
 * <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 * ```
 */
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { LoadingScreen } from '@/components/LoadingScreen';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 