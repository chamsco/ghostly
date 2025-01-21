/**
 * Public Route Component
 * 
 * Higher-order component that protects public routes by:
 * - Checking authentication status
 * - Redirecting authenticated users to dashboard
 * - Handling loading states during auth check
 * 
 * Example usage:
 * ```tsx
 * <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 * ```
 */
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { LoadingScreen } from '@/components/LoadingScreen';

interface Props {
  children: ReactNode;
}

export function PublicRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
} 