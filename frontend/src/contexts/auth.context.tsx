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
import { User, UserStatus } from '@/types/user';
import { CreateUserDto, BiometricRegistrationOptions } from '@/types/auth';
//import {BiometricAuthenticationOptions} from '@/types/auth';
import { authApi } from '@/services/api.service';

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
      setUser({
        ...userData,
        status: UserStatus.ACTIVE,
        isAdmin: userData.role === 'admin',
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

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
      setUser({
        ...userData,
        status: UserStatus.ACTIVE,
        isAdmin: userData.role === 'admin',
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
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