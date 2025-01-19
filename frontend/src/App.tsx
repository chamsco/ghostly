import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { ThemeProvider } from '@/contexts/theme.context';
import { Toaster } from '@/components/ui/toaster';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { useState, useEffect } from 'react';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-lg animate-pulse">Loading...</div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const [router, setRouter] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      const newRouter = createBrowserRouter([
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
      setRouter(newRouter);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !router) {
    return <LoadingScreen />;
  }

  return <RouterProvider router={router} />;
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