import { AuthProvider } from '@/contexts/auth.context';
import { ThemeProvider } from '@/contexts/theme.context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthErrorBoundary>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  <Route path="/" element={<ProtectedRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  <Route path="/users" element={<AdminRoute />}>
                    <Route index element={<Users />} />
                  </Route>
                </Routes>
                <Toaster />
              </AuthProvider>
            </AuthErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
} 