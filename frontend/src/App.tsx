import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { ThemeProvider } from '@/contexts/theme.context';
import { Toaster } from '@/components/ui/toaster';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-lg animate-pulse">Loading...</div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />,
    },
    {
      path: '/register',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />,
    },
    {
      path: '/dashboard',
      element: !isAuthenticated ? <Navigate to="/login" replace /> : (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      ),
    }
  ]);

  return <RouterProvider router={router} fallbackElement={<LoadingScreen />} />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
} 