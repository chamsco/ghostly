import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  lastUsed: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devices: Device[];
  isBiometricsAvailable: boolean;
  isBiometricsEnabled: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (deviceId?: string) => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  setupBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  enable2FA: (token: string) => Promise<void>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  registerBiometrics: () => Promise<void>;
  verifyBiometrics: (credentialId: string, token: string) => Promise<void>;
  updateAuthSettings: (requiresAdditionalAuth: boolean) => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

interface Session {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  deviceId: string;
  deviceName: string;
}

interface TokenPayload {
  exp: number;
  sub: string;
  deviceId: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'squadron:session';
const BIOMETRICS_KEY = 'squadron:biometrics';
const TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PERSISTENT_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check auth status on mount and when token changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<User>('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
        await fetchDevices();
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

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

  const login = async (username: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', {
        username,
        password,
        rememberMe,
        deviceName: navigator.userAgent
      });

      const { user } = response.data;
      
      setUser(user);
      setIsAuthenticated(true);
      
      navigate('/dashboard');
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || 'Invalid credentials';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorMessage,
        });
      } else {
        setError('An unexpected error occurred');
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (deviceId?: string) => {
    try {
      await api.post('/auth/logout', { deviceId });
      
      setUser(null);
      setIsAuthenticated(false);
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
      setError(message);
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
      setError(message);
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
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(STORAGE_KEY);
      
      toast({
        title: 'Success',
        description: 'Logged out from all devices',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Logout all devices failed';
      console.error('Logout all devices failed:', error);
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post('/auth/register', data);

      toast({
        title: 'Success',
        description: 'Registration successful! Please log in.',
      });

      navigate('/login');
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Registration failed';
      setError(message);
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
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
      } else {
        console.error('Auth check failed:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
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

  const verify2FA = async (token: string) => {
    try {
      await api.post('/auth/2fa/verify', { token });
      toast({
        title: 'Success',
        description: '2FA verification successful',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : '2FA verification failed';
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

  const registerBiometrics = async () => {
    try {
      await api.post('/auth/biometrics/register');
      await checkAuth();
      toast({
        title: 'Success',
        description: 'Biometric registration successful',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Biometric registration failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const verifyBiometrics = async (credentialId: string, token: string) => {
    try {
      await api.post('/auth/biometrics/verify', { credentialId, token });
      toast({
        title: 'Success',
        description: 'Biometric verification successful',
      });
    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Biometric verification failed';
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

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated,
        isLoading,
        devices,
        isBiometricsAvailable,
        isBiometricsEnabled,
        login,
        loginWithBiometrics,
        register,
        logout,
        logoutAllDevices,
        setupBiometrics,
        disableBiometrics,
        loading,
        error,
        checkAuth,
        enable2FA,
        verify2FA,
        disable2FA,
        registerBiometrics,
        verifyBiometrics,
        updateAuthSettings
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