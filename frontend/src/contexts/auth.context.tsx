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
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserStatus } from '@/types/user';
import { CreateUserDto, BiometricRegistrationOptions } from '@/types/auth';
//import {BiometricAuthenticationOptions} from '@/types/auth';
import { authApi } from '@/services/api.service';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: CreateUserDto) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateAuthSettings: (settings: { requiresAdditionalAuth: boolean }) => Promise<void>;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (token: string) => Promise<void>;
  enable2FA: () => Promise<void>;
  disable2FA: () => Promise<void>;
  is2FAEnabled: boolean;
  setupBiometrics: () => Promise<BiometricRegistrationOptions>;
  disableBiometrics: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPublicRoute = useMemo(() => {
    return PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));
  }, [location.pathname]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 Checking authentication status...');
      try {
        const token = localStorage.getItem('accessToken');
        console.log('📝 Token status:', token ? 'Found' : 'Not found');
        
        if (!token) {
          console.log('⚠️ No token found, setting loading to false');
          setLoading(false);
          if (!isPublicRoute) {
            console.log('🔄 Redirecting to login page');
            navigate('/login');
          }
          return;
        }

        console.log('🔄 Fetching current user data...');
        const userData = await authApi.getCurrentUser();
        console.log('✅ User data retrieved:', { id: userData.id, username: userData.username });
        setUser({
          ...userData,
          status: UserStatus.ACTIVE,
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('❌ Auth check failed:', err);
        localStorage.removeItem('accessToken');
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        if (!isPublicRoute) {
          console.log('🔄 Redirecting to login page due to error');
          navigate('/login');
        }
        
        // Log additional error details
        if (axios.isAxiosError(err)) {
          console.error('🌐 API Error Details:', {
            status: err.response?.status,
            data: err.response?.data,
            config: {
              url: err.config?.url,
              method: err.config?.method,
              baseURL: err.config?.baseURL
            }
          });
        }
      } finally {
        console.log('🏁 Auth check completed');
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate, isPublicRoute]);

  const login = async (username: string, password: string, rememberMe?: boolean) => {
    console.log('🔐 Attempting login...', { username, rememberMe });
    try {
      setLoading(true);
      setError(null);

      const { access_token, user: userData } = await authApi.login(username, password, rememberMe || false);
      console.log('✅ Login successful, setting token and user data');
      localStorage.setItem('accessToken', access_token);
      setUser({
        ...userData,
        status: UserStatus.ACTIVE,
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      
      // Log additional error details
      if (axios.isAxiosError(err)) {
        console.error('🌐 API Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            baseURL: err.config?.baseURL
          }
        });
      }
      
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
      setUser({
        ...userData,
        status: UserStatus.ACTIVE,
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.requestPasswordReset(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.resetPassword(token, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.updatePassword(oldPassword, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAuthSettings = async (settings: { requiresAdditionalAuth: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.updateAuthSettings(settings);
      setUser(prev => prev ? { ...prev, requiresAdditionalAuth: settings.requiresAdditionalAuth } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settings update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      return await authApi.setup2FA();
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA setup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.verify2FA(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      await authApi.enable2FA();
      setUser(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA enable failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      await authApi.disable2FA();
      setUser(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA disable failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setupBiometrics = async () => {
    try {
      setLoading(true);
      setError(null);
      return await authApi.setupBiometrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Biometrics setup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disableBiometrics = async () => {
    try {
      setLoading(true);
      setError(null);
      await authApi.disableBiometrics();
      setUser(prev => prev ? { ...prev, isBiometricsEnabled: false } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Biometrics disable failed');
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
      register,
      requestPasswordReset,
      resetPassword,
      updatePassword,
      updateAuthSettings,
      setup2FA,
      verify2FA,
      enable2FA,
      disable2FA,
      is2FAEnabled: user?.twoFactorEnabled ?? false,
      setupBiometrics,
      disableBiometrics
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