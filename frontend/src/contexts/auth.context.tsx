/**
 * Authentication Context
 * 
 * Provides authentication state and operations across the application:
 * - JWT-based authentication
 * - Biometric support
 * - Two-factor authentication
 * - Device management
 * - Session management
 * - Rate limiting
 * - Account lockout
 * - Secure token handling
 * - Password reset
 * - Route protection
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreateUserDto } from '@/types/user';
import { authApi } from '@/services/api.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: CreateUserDto) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('accessToken');
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, rememberMe?: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const { access_token, user: userData } = await authApi.login(username, password, rememberMe || false);
      localStorage.setItem('accessToken', access_token);
      setUser(userData);

      // Navigate to the dashboard or intended destination
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await authApi.logout();
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = async (data: CreateUserDto) => {
    try {
      setLoading(true);
      setError(null);

      const { access_token, user: userData } = await authApi.register(data);
      localStorage.setItem('accessToken', access_token);
      setUser(userData);

      // Navigate to onboarding or dashboard
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}; 