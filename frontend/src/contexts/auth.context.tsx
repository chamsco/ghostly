import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

// Security utilities
const securityUtils = {
  encryptToken: (token: string): string => {
    // TODO: Implement actual encryption
    return token;
  },
  
  decryptToken: (encryptedToken: string): string => {
    // TODO: Implement actual decryption
    return encryptedToken;
  },
  
  isTokenValid: (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Error types
interface AuthError extends Error {
  code: 'AUTH_FAILED' | 'NETWORK_ERROR' | 'TOKEN_EXPIRED' | 'INVALID_TOKEN' | 'SESSION_EXPIRED';
  details?: unknown;
}

// Auth status enum
enum AuthStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ERROR = 'ERROR'
}

interface SecureSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  deviceId: string;
  deviceName: string;
  lastActivity: number;
  sessionDuration: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  isBiometricsEnabled: boolean;
  requiresAdditionalAuth: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  lastUsed: Date;
}

interface TokenPayload {
  exp: number;
  sub: string;
  deviceId: string;
}

// Constants
const STORAGE_KEY = 'squadron:session';
const BIOMETRICS_KEY = 'squadron:biometrics';
const TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PERSISTENT_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devices: Device[];
  isBiometricsAvailable: boolean;
  isBiometricsEnabled: boolean;
  authStatus: AuthStatus;
  authError: AuthError | null;
  isLocked: boolean;
  remainingAttempts: number;
  sessionInfo: {
    expiresIn: number;
    lastActivity: Date;
    currentDevice: Device;
  } | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  register: (userData: { username: string; email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  setupBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  enable2FA: (code: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  updateAuthSettings: (requiresAdditionalAuth: boolean) => Promise<void>;
  refreshSession: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Rate limiting utility
const createRateLimiter = (limit: number, windowMs: number) => {
  const requests: number[] = [];
  
  return () => {
    const now = Date.now();
    requests.push(now);
    
    // Remove old requests
    while (requests.length && requests[0] < now - windowMs) {
      requests.shift();
    }
    
    return requests.length <= limit;
  };
};

const loginRateLimiter = createRateLimiter(5, 60000); // 5 requests per minute

// Add route validation cache
const validatedRoutes = new Set<string>();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.IDLE);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [sessionInfo, setSessionInfo] = useState<AuthContextType['sessionInfo']>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to get device name
  const getDeviceName = useCallback(() => {
    const ua = navigator.userAgent;
    const browser = ua.match(/(chrome|safari|firefox|opera|edge)/i)?.[1] || 'browser';
    const os = ua.match(/(mac|win|linux|android|ios)/i)?.[1] || 'unknown';
    return `${browser} on ${os}`;
  }, []);

  // Function to fetch active devices
  const fetchDevices = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/auth/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  }, [user]);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BIOMETRICS_KEY);
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
      setIsBiometricsEnabled(false);
      navigate('/login');
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  // Check auth status on mount and when token changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        setAuthStatus(AuthStatus.LOADING);
        
        // Check localStorage first
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (!sessionStr) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthStatus(AuthStatus.UNAUTHENTICATED);
          return;
        }

        try {
          const session = JSON.parse(sessionStr);
          if (!session.token || !session.refreshToken || !session.expiresAt) {
            throw new Error('Invalid session data');
          }

          // Check if session has expired
          if (Date.now() > session.expiresAt) {
            throw new Error('Session expired');
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
        } catch (e) {
          // If session data is invalid or expired, clear it
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(BIOMETRICS_KEY);
          api.defaults.headers.common['Authorization'] = '';
          setIsBiometricsEnabled(false);
          setUser(null);
          setIsAuthenticated(false);
          setAuthStatus(AuthStatus.UNAUTHENTICATED);
          return;
        }

        const response = await api.get<User>('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
        setAuthStatus(AuthStatus.AUTHENTICATED);
        await fetchDevices();
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate, fetchDevices]);

  // Token refresh mechanism
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const sessionStr = localStorage.getItem(STORAGE_KEY);
      if (!sessionStr) return;

      const session = JSON.parse(sessionStr);
      const now = Date.now();
      const timeUntilExpiry = session.expiresAt - now;

      if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD * 1000) {
        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: session.refreshToken
          });
          
          const { token, refreshToken } = response.data;
          const decoded = jwtDecode<TokenPayload>(token);
          
          const newSession = {
            ...session,
            token,
            refreshToken,
            expiresAt: decoded.exp * 1000
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          // If refresh fails, log out
          logout();
        }
      }
    };

    const interval = setInterval(checkAndRefreshToken, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [logout]);

  // Check if biometrics is available
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        if (typeof window !== 'undefined' && 
            'credentials' in navigator && 
            'PublicKeyCredential' in window &&
            typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricsAvailable(available);
          const biometricsEnabled = localStorage.getItem(BIOMETRICS_KEY);
          setIsBiometricsEnabled(!!biometricsEnabled);
        } else {
          setIsBiometricsAvailable(false);
          setIsBiometricsEnabled(false);
        }
      } catch (error) {
        console.error('Biometrics check failed:', error);
        setIsBiometricsAvailable(false);
        setIsBiometricsEnabled(false);
      }
    };
    checkBiometrics();
  }, []);

  // Add activity monitoring
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let lastActivity = Date.now();
    
    const updateLastActivity = () => {
      lastActivity = Date.now();
      const sessionStr = localStorage.getItem(STORAGE_KEY);
      if (sessionStr) {
        const session: SecureSession = JSON.parse(sessionStr);
        session.lastActivity = lastActivity;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setSessionInfo(prev => prev ? {
          ...prev,
          lastActivity: new Date(lastActivity)
        } : null);
      }
    };

    const checkInactivity = () => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        logout();
        toast({
          title: 'Session Expired',
          description: 'You have been logged out due to inactivity',
          variant: 'destructive'
        });
      }
    };

    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    
    const intervalId = setInterval(checkInactivity, 60000);

    return () => {
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const login = async (username: string, password: string, rememberMe = false) => {
    try {
      // Check rate limiting and lockout
      if (!loginRateLimiter()) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      if (lockoutUntil && Date.now() < lockoutUntil) {
        const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
        throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
      }

      setAuthStatus(AuthStatus.LOADING);
      setIsLoading(true);
      
      console.log('🔄 Attempting login for user:', username);
      
      const response = await api.post('/auth/login', {
        username,
        password,
        rememberMe,
        deviceName: getDeviceName()
      });

      console.log('✅ Login response received:', {
        status: response.status,
        hasToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refreshToken,
        hasUser: !!response.data.user
      });

      const { user, access_token: token, refreshToken, deviceId } = response.data;
      const decoded = jwtDecode<TokenPayload>(token);
      
      console.log('🔑 Decoded token:', {
        exp: new Date(decoded.exp * 1000),
        sub: decoded.sub,
        isAdmin: user.isAdmin
      });
      
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      setLockoutUntil(null);
      
      // Store session data
      const session: SecureSession = {
        user,
        token: securityUtils.encryptToken(token),
        refreshToken: securityUtils.encryptToken(refreshToken),
        expiresAt: decoded.exp * 1000,
        deviceId,
        deviceName: getDeviceName(),
        lastActivity: Date.now(),
        sessionDuration: rememberMe ? PERSISTENT_SESSION_DURATION : SESSION_DURATION
      };
      
      console.log('💾 Storing session data:', {
        expiresAt: new Date(session.expiresAt),
        deviceId: session.deviceId,
        username: session.user.username
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      setAuthStatus(AuthStatus.AUTHENTICATED);
      
      // Update session info
      setSessionInfo({
        expiresIn: decoded.exp * 1000 - Date.now(),
        lastActivity: new Date(),
        currentDevice: {
          id: deviceId,
          name: getDeviceName(),
          type: 'current',
          lastUsed: new Date()
        }
      });

      console.log('🔄 Fetching devices...');
      await fetchDevices();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });

      console.log('🚀 Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        status: axios.isAxiosError(err) ? err.response?.status : undefined,
        data: axios.isAxiosError(err) ? err.response?.data : undefined
      });

      // Handle failed login attempts
      setFailedAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_DURATION);
          toast({
            variant: "destructive",
            title: "Account locked",
            description: `Too many failed attempts. Please try again in ${LOCKOUT_DURATION / 60000} minutes.`,
          });
        }
        return newAttempts;
      });

      setAuthStatus(AuthStatus.ERROR);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Invalid credentials';
        setAuthError({
          name: 'LoginError',
          message: errorMessage,
          code: 'AUTH_FAILED',
          details: err
        });
        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorMessage,
        });
      } else {
        setAuthError({
          name: 'LoginError',
          message: 'An unexpected error occurred',
          code: 'NETWORK_ERROR',
          details: err
        });
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "An unexpected error occurred",
        });
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithBiometrics = async () => {
    if (!isBiometricsAvailable || !isBiometricsEnabled) {
      throw new Error('Biometrics not available or not enabled');
    }

    try {
      // Get the challenge from the server
      const response = await api.post('/auth/biometrics/challenge');
      const { challenge, rpId } = response.data;

      // Create the credentials
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rpId,
          userVerification: 'required',
          timeout: 60000
        }
      }) as PublicKeyCredential;

      // Send the assertion to the server
      const assertionResponse = await api.post('/auth/biometrics/login', {
        id: credential.id,
        response: credential.response
      });

      // Handle the login response similar to regular login
      const { user, token, refreshToken, deviceId } = assertionResponse.data;
      const decoded = jwtDecode<TokenPayload>(token);
      
      const session = { 
        user, 
        token, 
        refreshToken,
        expiresAt: decoded.exp * 1000,
        deviceId,
        deviceName: getDeviceName()
      };

      setUser(user);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      await fetchDevices();

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Biometric login failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const setupBiometrics = async () => {
    if (!isBiometricsAvailable) {
      throw new Error('Biometrics not available on this device');
    }

    try {
      // Get registration options from the server
      const response = await api.post('/auth/biometrics/register');
      const { challenge, rpId, user } = response.data;

      // Create the credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(challenge),
          rp: {
            name: 'Squadron',
            id: rpId
          },
          user: {
            id: new Uint8Array(user.id),
            name: user.username,
            displayName: user.fullName
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          }
        }
      }) as PublicKeyCredential;

      // Send the attestation to the server
      await api.post('/auth/biometrics/register/complete', {
        id: credential.id,
        response: credential.response
      });

      // Enable biometrics locally
      localStorage.setItem(BIOMETRICS_KEY, 'true');
      setIsBiometricsEnabled(true);

      toast({
        title: 'Success',
        description: 'Biometric registration successful',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to setup biometrics';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disableBiometrics = async () => {
    try {
      await api.post('/auth/biometrics/disable');
      await checkAuth();
      toast({
        title: 'Success',
        description: 'Biometrics disabled successfully',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Biometric disablement failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logoutAllDevices = async () => {
    try {
      await api.post('/auth/logout/all');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BIOMETRICS_KEY);
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      setIsAuthenticated(false);
      setIsBiometricsEnabled(false);
      navigate('/login');
      
      toast({
        title: 'Success',
        description: 'Logged out from all devices',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Logout all devices failed';
      console.error('Logout all devices failed:', error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (userData: { username: string; email: string; password: string; fullName: string }) => {
    try {
      await api.post('/auth/register', userData);

      toast({
        title: 'Success',
        description: 'Registration successful! Please log in.',
      });

      navigate('/login');
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Registration failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(BIOMETRICS_KEY);
        api.defaults.headers.common['Authorization'] = '';
        setIsBiometricsEnabled(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const enable2FA = async (token: string) => {
    try {
      await api.post('/auth/2fa/enable', { token });
      await checkAuth();
      toast({
        title: 'Success',
        description: '2FA enabled successfully',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : '2FA enablement failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disable2FA = async () => {
    try {
      await api.post('/auth/2fa/disable');
      await checkAuth();
      toast({
        title: 'Success',
        description: '2FA disabled successfully',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : '2FA disablement failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAuthSettings = async (requiresAdditionalAuth: boolean) => {
    try {
      await api.patch('/auth/settings', { requiresAdditionalAuth });
      await checkAuth();
      toast({
        title: 'Success',
        description: 'Authentication settings updated successfully',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update authentication settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const validateSession = async () => {
    try {
      console.log('🔍 Validating session...');
      const sessionStr = localStorage.getItem(STORAGE_KEY);
      if (!sessionStr) {
        console.log('❌ No session found in localStorage');
        setIsAuthenticated(false);
        setUser(null);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        return false;
      }

      const session: SecureSession = JSON.parse(sessionStr);
      const now = Date.now();

      console.log('📦 Session data:', {
        expiresAt: new Date(session.expiresAt),
        now: new Date(now),
        isExpired: now >= session.expiresAt,
        deviceId: session.deviceId,
        user: session.user
      });

      // Check if session is expired
      if (now >= session.expiresAt) {
        console.log('⏰ Session expired');
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
        setUser(null);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        return false;
      }

      // Set token before validation
      const token = securityUtils.decryptToken(session.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Set authorization header');

      // If we already have a valid user and token, and not near expiry, skip backend validation
      if (isAuthenticated && user && now < session.expiresAt - 5 * 60 * 1000) {
        console.log('✅ Using cached authentication state');
        return true;
      }

      // Validate with backend
      console.log('🔄 Validating session with backend...');
      const response = await api.get('/auth/me');
      console.log('✅ Backend validation successful:', response.data);
      
      setUser(response.data);
      setIsAuthenticated(true);
      setAuthStatus(AuthStatus.AUTHENTICATED);
      return true;
    } catch (error) {
      console.error('❌ Session validation error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        data: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      
      // Only clear session if not on login page and it's a 401 error
      if (!window.location.pathname.includes('/login') && 
          axios.isAxiosError(error) && 
          error.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
        setUser(null);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
      }
      return false;
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      setAuthStatus(AuthStatus.LOADING);
      const sessionStr = localStorage.getItem(STORAGE_KEY);
      if (!sessionStr) throw new Error('No session found');

      const session: SecureSession = JSON.parse(sessionStr);
      const response = await api.post('/auth/refresh', {
        refreshToken: session.refreshToken
      });
      
      const { token, refreshToken } = response.data;
      const decoded = jwtDecode<TokenPayload>(token);
      
      const newSession: SecureSession = {
        ...session,
        token,
        refreshToken,
        expiresAt: decoded.exp * 1000,
        lastActivity: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthStatus(AuthStatus.AUTHENTICATED);
      
      // Update session info
      setSessionInfo({
        expiresIn: decoded.exp * 1000 - Date.now(),
        lastActivity: new Date(newSession.lastActivity),
        currentDevice: devices.find(d => d.id === decoded.deviceId) || {
          id: decoded.deviceId,
          name: newSession.deviceName,
          type: 'unknown',
          lastUsed: new Date()
        }
      });
    } catch (error) {
      setAuthStatus(AuthStatus.ERROR);
      setAuthError({
        name: 'RefreshError',
        message: 'Failed to refresh session',
        code: 'TOKEN_EXPIRED',
        details: error
      });
      await logout();
    }
  };

  const clearError = () => {
    setAuthError(null);
    setAuthStatus(AuthStatus.IDLE);
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setAuthStatus(AuthStatus.LOADING);
      await api.post('/auth/password/change', {
        oldPassword,
        newPassword
      });
      
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      
      setAuthStatus(AuthStatus.AUTHENTICATED);
    } catch (error) {
      setAuthStatus(AuthStatus.ERROR);
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update password';
      
      setAuthError({
        name: 'PasswordUpdateError',
        message,
        code: 'AUTH_FAILED',
        details: error
      });
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setAuthStatus(AuthStatus.LOADING);
      await api.post('/auth/password/reset-request', { email });
      
      toast({
        title: 'Success',
        description: 'Password reset instructions have been sent to your email',
      });
      
      setAuthStatus(AuthStatus.IDLE);
    } catch (error) {
      setAuthStatus(AuthStatus.ERROR);
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to request password reset';
      
      setAuthError({
        name: 'PasswordResetRequestError',
        message,
        code: 'AUTH_FAILED',
        details: error
      });
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setAuthStatus(AuthStatus.LOADING);
      
      // Validate inputs
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }

      // For now, we'll store these in localStorage and navigate to reset page
      // In the future, this will be an API call to verify the token and reset the password
      const resetData = { token, newPassword, timestamp: Date.now() };
      localStorage.setItem('reset:data', JSON.stringify(resetData));
      
      navigate('/reset-password');
      
      toast({
        title: 'Info',
        description: 'Please enter your username to reset your password.',
      });
      
      setAuthStatus(AuthStatus.UNAUTHENTICATED);
    } catch (error) {
      setAuthStatus(AuthStatus.ERROR);
      const message = 'Failed to process password reset';
      
      setAuthError({
        name: 'PasswordResetError',
        message,
        code: 'AUTH_FAILED',
        details: error
      });
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      // Clean up stored reset data after 5 minutes
      setTimeout(() => {
        localStorage.removeItem('reset:data');
      }, 5 * 60 * 1000);
    }
  };

  // Update request interceptors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        console.log('🔄 Request interceptor:', {
          url: config.url,
          method: config.method,
          isAuthEndpoint: config.url?.includes('/auth/'),
          currentPath: window.location.pathname
        });

        // Skip validation for auth endpoints and public routes
        if (
          config.url?.includes('/auth/login') ||
          config.url?.includes('/auth/register') ||
          config.url?.includes('/auth/password/reset')
        ) {
          return config;
        }

        // For auth/me endpoint, only attach token if available
        if (config.url?.includes('/auth/me')) {
          const sessionStr = localStorage.getItem(STORAGE_KEY);
          if (sessionStr) {
            const session: SecureSession = JSON.parse(sessionStr);
            const token = securityUtils.decryptToken(session.token);
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        }

        // For protected routes, validate session
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (!sessionStr) {
          console.log('❌ No session found for protected route');
          if (!window.location.pathname.includes('/login')) {
            console.log('🔄 Redirecting to login');
            navigate('/login', { state: { from: window.location.pathname } });
          }
          throw new Error('No session found');
        }

        const session: SecureSession = JSON.parse(sessionStr);
        const token = securityUtils.decryptToken(session.token);
        config.headers.Authorization = `Bearer ${token}`;

        // Skip validation if route was recently validated
        const routeKey = `${config.method}-${config.url}`;
        if (validatedRoutes.has(routeKey)) {
          console.log('✅ Using cached validation for route:', routeKey);
          return config;
        }

        // Skip validation if we're already authenticated and session is not near expiry
        if (isAuthenticated && Date.now() < session.expiresAt - 5 * 60 * 1000) {
          validatedRoutes.add(routeKey);
          console.log('✅ Using cached auth state for request');
          return config;
        }

        // Only validate session for non-auth endpoints
        if (!config.url?.includes('/auth/')) {
          console.log('🔍 Validating session before request...');
          const isValid = await validateSession();
          if (isValid) {
            validatedRoutes.add(routeKey);
          } else if (!window.location.pathname.includes('/login')) {
            console.log('❌ Session invalid, redirecting to login');
            navigate('/login', { state: { from: window.location.pathname } });
            throw new Error('Session invalid');
          }
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Clear validation cache every minute
    const clearCacheInterval = setInterval(() => {
      validatedRoutes.clear();
    }, 60000);

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      clearInterval(clearCacheInterval);
    };
  }, [refreshSession, logout, navigate, isAuthenticated]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated,
        isLoading,
        devices,
        isBiometricsAvailable,
        isBiometricsEnabled,
        authStatus,
        authError,
        isLocked: !!lockoutUntil && Date.now() < lockoutUntil,
        remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts),
        sessionInfo,
        login,
        loginWithBiometrics,
        register,
        logout,
        logoutAllDevices,
        setupBiometrics,
        disableBiometrics,
        enable2FA,
        disable2FA,
        updateAuthSettings,
        refreshSession,
        validateSession,
        clearError,
        updatePassword,
        requestPasswordReset,
        resetPassword
      }}
    >
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 