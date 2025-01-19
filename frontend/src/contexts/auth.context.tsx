import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isAdmin: boolean;
}

interface Device {
  id: string;
  name: string;
  lastActive: string;
  current: boolean;
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

const STORAGE_KEY = 'ghostly:session';
const BIOMETRICS_KEY = 'ghostly:biometrics';
const TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const PERSISTENT_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const [session, setSession] = useState<Session | null>(null);

  // Check if biometrics is available
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        if ('credentials' in navigator && 'PublicKeyCredential' in window) {
          // Check if platform authenticator is available
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricsAvailable(available);
          
          // Check if biometrics was previously enabled
          const biometricsEnabled = localStorage.getItem(BIOMETRICS_KEY);
          setIsBiometricsEnabled(!!biometricsEnabled);
        }
      } catch (error) {
        console.error('Biometrics not supported:', error);
        setIsBiometricsAvailable(false);
      }
    };
    checkBiometrics();
  }, []);

  // Function to check if token is expired or about to expire
  const isTokenExpired = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp <= currentTime + TOKEN_REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  }, []);

  // Function to get device name
  const getDeviceName = useCallback(() => {
    const ua = navigator.userAgent;
    const browser = ua.match(/(chrome|safari|firefox|opera|edge)/i)?.[1] || 'browser';
    const os = ua.match(/(mac|win|linux|android|ios)/i)?.[1] || 'unknown';
    return `${browser} on ${os}`;
  }, []);

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    if (!session?.refreshToken) return;

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: session.refreshToken,
        deviceId: session.deviceId
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      const decoded = jwtDecode<TokenPayload>(newToken);
      
      setSession(prev => prev ? {
        ...prev,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: decoded.exp * 1000
      } : null);

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Store updated session
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...session,
          token: newToken,
          refreshToken: newRefreshToken,
          expiresAt: decoded.exp * 1000
        }));
      }

      // Schedule next refresh
      scheduleTokenRefresh(decoded.exp * 1000);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout(session.deviceId);
    }
  }, [session]);

  // Function to schedule token refresh
  const scheduleTokenRefresh = useCallback((expiresAt: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const currentTime = Date.now();
    const timeUntilRefresh = Math.max(0, expiresAt - currentTime - TOKEN_REFRESH_THRESHOLD * 1000);

    refreshTimeoutRef.current = setTimeout(refreshToken, timeUntilRefresh);
  }, [refreshToken]);

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

  // Restore session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as Session;
        const currentTime = Date.now();

        // Check if session is expired
        if (session.expiresAt < currentTime) {
          localStorage.removeItem(STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        // Set up session
        setSession(session);
        setUser(session.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;

        // Schedule token refresh if needed
        if (isTokenExpired(session.token)) {
          refreshToken();
        } else {
          scheduleTokenRefresh(session.expiresAt);
        }

        // Fetch active devices
        fetchDevices();
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, [isTokenExpired, refreshToken, scheduleTokenRefresh, fetchDevices]);

  // Clean up refresh timer
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const login = async (username: string, password: string, rememberMe = false) => {
    try {
      const deviceName = getDeviceName();
      const response = await api.post('/auth/login', { 
        username, 
        password,
        rememberMe,
        deviceName
      });

      const { user, token, refreshToken, deviceId } = response.data;
      const decoded = jwtDecode<TokenPayload>(token);
      
      // Calculate session expiration
      const expiresAt = decoded.exp * 1000;
      const sessionDuration = rememberMe ? PERSISTENT_SESSION_DURATION : SESSION_DURATION;
      const sessionExpiresAt = Math.min(expiresAt, Date.now() + sessionDuration);

      const session = { 
        user, 
        token, 
        refreshToken,
        expiresAt: sessionExpiresAt,
        deviceId,
        deviceName
      };

      // Store session
      setSession(session);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

      // Schedule token refresh
      scheduleTokenRefresh(sessionExpiresAt);

      // Fetch active devices
      await fetchDevices();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
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

      setSession(session);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      scheduleTokenRefresh(decoded.exp * 1000);
      await fetchDevices();
    } catch (error) {
      console.error('Biometric login failed:', error);
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
            name: 'Ghostly',
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
    } catch (error) {
      console.error('Failed to setup biometrics:', error);
      throw error;
    }
  };

  const disableBiometrics = async () => {
    try {
      await api.post('/auth/biometrics/disable');
      localStorage.removeItem(BIOMETRICS_KEY);
      setIsBiometricsEnabled(false);
    } catch (error) {
      console.error('Failed to disable biometrics:', error);
      throw error;
    }
  };

  const logout = async (deviceId?: string) => {
    try {
      if (session?.refreshToken) {
        // Invalidate refresh token on the server
        await api.post('/auth/logout', {
          refreshToken: session.refreshToken,
          deviceId: deviceId || session.deviceId
        }).catch(console.error);
      }

      // If logging out current device, clear local session
      if (!deviceId || deviceId === session?.deviceId) {
        setSession(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem(STORAGE_KEY);
        
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      } else {
        // Just refresh the devices list
        await fetchDevices();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const logoutAllDevices = async () => {
    try {
      await api.post('/auth/logout/all');
      setSession(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem(STORAGE_KEY);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    } catch (error) {
      console.error('Logout all devices failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      const { user: newUser } = response.data;

      // Automatically log in after registration
      await login(data.username, data.password, false);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
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
        disableBiometrics
      }}
    >
      {children}
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