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
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import Settings from '@/pages/Settings';
import { Users as AdminDashboard } from '@/pages/Users';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';
import { RouteTransition } from '@/components/RouteTransition';
import AdminRoute from '@/components/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RouteTransition>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </RouteTransition>
    ),
  },
  {
    path: '/register',
    element: (
      <RouteTransition>
        <PublicRoute>
          <Register />
        </PublicRoute>
      </RouteTransition>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RouteTransition>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </RouteTransition>
    ),
  },
  {
    path: '/projects',
    element: (
      <RouteTransition>
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </RouteTransition>
    ),
  },
  {
    path: '/settings',
    element: (
      <RouteTransition>
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </RouteTransition>
    ),
  },
  {
    path: '/admin',
    element: (
      <RouteTransition>
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </RouteTransition>
    ),
  },
  {
    path: '*',
    element: (
      <RouteTransition>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </RouteTransition>
    ),
  },
]); 