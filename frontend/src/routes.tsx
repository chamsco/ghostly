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
import { AppProviders } from '@/providers';

import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Onboarding } from '@/pages/Onboarding';
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
    element: (
      <AppProviders>
        <DashboardLayout />
      </AppProviders>
    ),
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
    element: (
      <AppProviders>
        <Login />
      </AppProviders>
    )
  },
  {
    path: 'register',
    element: (
      <AppProviders>
        <Register />
      </AppProviders>
    )
  },
  {
    path: 'onboarding',
    element: (
      <AppProviders>
        <Onboarding />
      </AppProviders>
    )
  },
  {
    path: 'forgot-password',
    element: (
      <AppProviders>
        <ForgotPassword />
      </AppProviders>
    )
  },
  {
    path: 'reset-password',
    element: (
      <AppProviders>
        <ResetPassword />
      </AppProviders>
    )
  }
]); 