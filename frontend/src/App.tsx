import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { ThemeProvider } from '@/contexts/theme.context';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { useEffect } from 'react';
import { api } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: userCheck } = useQuery({
    queryKey: ['checkUsers'],
    queryFn: async () => {
      const response = await api.get('/auth/check-users');
      return response.data;
    },
  });

  useEffect(() => {
    if (userCheck && !userCheck.hasUsers && !isAuthenticated) {
      navigate('/register');
    }
  }, [userCheck, isAuthenticated, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? <Register /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 