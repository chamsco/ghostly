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
import { createContext, useContext, useState, useEffect} from 'react';
//import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/types/user';
//import {UserStatus} from   '@/types/user' 
//import { CreateUserDto} from '@/types/auth';
import { BiometricRegistrationOptions } from '@/types/auth';
//import {BiometricAuthenticationOptions} from '@/types/auth';
import { authApi } from '@/services/api.service';
import type { LoginDto, RegisterDto } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
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

//const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  //const navigate = useNavigate();
  //const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  //const isPublicRoute = useMemo(() => {
  //  return PUBLIC_ROUTES.some(route => location.pathname.startsWith(route));
  //}, [location.pathname]);

  // Check auth status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth state...');
      if (accessToken) {
        try {
          setLoading(true);
          const userData = await authApi.me();
          console.log('✅ User data fetched:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Failed to get user data:', error);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('accessToken');
          setAccessToken(null);
        } finally {
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        console.log('ℹ️ No access token found');
        setIsAuthenticated(false);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [accessToken, isInitialized]);

  const login = async (data: LoginDto): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔑 Attempting login...');
      
      // Add device information to the login request
      const deviceName = window.navigator.platform || 'Unknown Device';
      const userAgent = window.navigator.userAgent;
      const ip = window.location.hostname || 'unknown';
      const loginData = {
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe || false,
        deviceName,
        userAgent,
        ip
      };  
      const response = await authApi.login(loginData);
      console.log('✅ Login successful');
      
      if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
        setAccessToken(response.access_token);
        setIsAuthenticated(true);
      }
      
      setError(null);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError('Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔒 Logging out...');
      await authApi.logout();
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      setLoading(false);
      console.log('✅ Logout complete');
    }
  };

  const register = async (data: RegisterDto): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Attempting registration...');
      const response = await authApi.register(data);
      if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
        setAccessToken(response.access_token);
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ Registration successful');
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setIsAuthenticated(false);
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
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
      isAuthenticated,
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