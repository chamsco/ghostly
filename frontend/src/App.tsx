/**
 * Main Application Component
 * 
 * This is the root component of the application that sets up:
 * - React Router for client-side routing
 * - React Query for server state management
 * - Theme provider for dark/light mode
 * - Authentication context for user session management
 * - Protected routes and layouts
 * - Error boundaries for graceful error handling
 */

import { AuthProvider } from '@/contexts/auth.context';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { Users } from '@/pages/Users';
import { Profile } from '@/pages/Profile';
import Settings from '@/pages/Settings';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectErrorBoundary } from '@/components/ProjectErrorBoundary';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { ProjectCreationForm } from '@/pages/ProjectCreationForm';
import { ProjectList } from '@/pages/ProjectList';
import { Layout } from '@/components/layout/Layout';

// Configure React Query client with custom defaults
// - Disable automatic retries on failed requests
// - Disable automatic refetching when window regains focus
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Higher-order component that wraps the dashboard layout with React Router's Outlet
 * This allows child routes to be rendered within the dashboard layout while maintaining
 * the persistent navigation sidebar and header
 */
const ProtectedDashboardLayout = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

/**
 * Root App Component
 * 
 * This is the root component of the application:
 * - Provides error boundaries for error handling
 * - Provides toast notifications for feedback
 * - Provides theme provider for styling
 * - Provides authentication context for user management
 * - Provides projects context for project management
 */
export function App({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthErrorBoundary>
        {children}
        <Toaster />
      </AuthErrorBoundary>
    </ErrorBoundary>
  );
} 