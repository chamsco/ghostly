/**
 * API Service
 *
 * Handles all API requests with:
 * - Base URL configuration
 * - Authentication headers
 * - Error handling
 * - Response transformation
 */
import axios, { AxiosError } from 'axios';
//import type { AxiosInstance } from 'axios';
import type { CreateUserDto, AuthResponse, TwoFactorResponse, BiometricRegistrationOptions } from '@/types/auth';
//import type { LoginData } from '@/types/auth';
import type { User } from '@/types/user';
import type { Project, CreateProjectDto } from '@/types/project';

// Get the base URL from environment or use default
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance for auth-related endpoints
const authApiInstance = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api/auth` : '/api/auth',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance for protected endpoints
const api = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api` : '/api',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging and auth token
const addRequestInterceptor = (axiosInstance: typeof api | typeof authApiInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log('🚀 Outgoing Request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers
      });

      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added auth token to request');
      }
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );
};

// Add response logging and error handling
const addResponseInterceptor = (axiosInstance: typeof api | typeof authApiInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('✅ Response received:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error: AxiosError) => {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Handle authentication errors
      if (error.response?.status === 401) {
        console.log('🚫 Authentication error detected, clearing token');
        localStorage.removeItem('accessToken');
        
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
        if (!authPaths.some(path => currentPath.startsWith(path))) {
          console.log('↩️ Redirecting to login page');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
};

// Add interceptors to both instances
addRequestInterceptor(api);
addRequestInterceptor(authApiInstance);
addResponseInterceptor(api);
addResponseInterceptor(authApiInstance);

export const authApi = {
  async login(username: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
    console.log('🔐 Attempting login request');
    try {
      const response = await authApiInstance.post<AuthResponse>('/login', {
        username,
        password,
        rememberMe
      });
      console.log('✅ Login successful');
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  async register(data: CreateUserDto): Promise<AuthResponse> {
    console.log('📝 Attempting registration');
    try {
      const response = await authApiInstance.post<AuthResponse>('/register', data);
      console.log('✅ Registration successful');
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    console.log('🔄 Attempting logout');
    try {
      await authApiInstance.post('/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    } finally {
      // Always clear the token
      localStorage.removeItem('accessToken');
    }
  },

  async getCurrentUser(): Promise<User> {
    console.log('🔄 Fetching current user');
    try {
      const response = await authApiInstance.get<User>('/me');
      console.log('✅ Current user fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch current user:', error);
      throw error;
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    await authApiInstance.post('/password-reset/request', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await authApiInstance.post('/password-reset/reset', { token, password });
  },

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    await authApiInstance.post('/password/update', { oldPassword, newPassword });
  },

  async updateAuthSettings(settings: { requiresAdditionalAuth: boolean }): Promise<void> {
    await authApiInstance.patch('/settings', settings);
  },

  async setup2FA(): Promise<TwoFactorResponse> {
    const response = await authApiInstance.post<TwoFactorResponse>('/2fa/setup');
    return response.data;
  },

  async verify2FA(token: string): Promise<void> {
    await authApiInstance.post('/2fa/verify', { token });
  },

  async disable2FA(): Promise<void> {
    await authApiInstance.post('/2fa/disable');
  },

  async enable2FA(): Promise<void> {
    await authApiInstance.post('/2fa/enable');
  },

  async setupBiometrics(): Promise<BiometricRegistrationOptions> {
    const response = await authApiInstance.post<BiometricRegistrationOptions>('/biometrics/setup');
    return response.data;
  },

  async disableBiometrics(): Promise<void> {
    await authApiInstance.post('/biometrics/disable');
  }
};

// Projects API endpoints
export const projectsApi = {
  async list(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async create(data: CreateProjectDto): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async get(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async start(id: string): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/start`);
    return response.data;
  },

  async stop(id: string): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/stop`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
};