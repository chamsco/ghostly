/**
 * Application Routes
 * 
 * Defines all routes in the application:
 * - Public routes (login, register)
 * - Protected routes (dashboard, projects)
 * - Admin-only routes (users)
 * - Nested routes (project details)
 * 
 * Each route is configured with:
 * - Path
 * - Element (component to render)
 * - Layout (optional wrapper component)
 * - Protection (auth/admin guards)
 */
import { createBrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectErrorBoundary } from '@/components/ProjectErrorBoundary';

import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import Settings from '@/pages/Settings';

// Configure React Query client with custom defaults
// - Disable automatic retries on failed requests
// - Disable automatic refetching when window regains focus
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    errorElement: <ProjectErrorBoundary />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },
  {
    path: 'login',
    element: <Login />
  },
  {
    path: 'register',
    element: <Register />
  },
  {
    path: 'forgot-password',
    element: <ForgotPassword />
  },
  {
    path: 'reset-password',
    element: <ResetPassword />
  }
]); 