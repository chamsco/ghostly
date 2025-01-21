/**
 * Axios Configuration Module
 * 
 * Sets up a configured axios instance for making HTTP requests with:
 * - Base URL configuration
 * - Default headers
 * - Request/response interceptors
 * - Error handling
 * - Authentication token management
 * - Retry logic for failed requests
 * - Request/response logging in development
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  CreateUserDto, 
  AuthResponse, 
  TwoFactorResponse, 
  BiometricRegistrationOptions 
} from '@/types/auth';
import type { AxiosRequestConfig } from 'axios';
import type { User } from '@/types/user';
import type { Project, CreateProjectDto } from '@/types/project';

// Extend the AxiosRequestConfig interface to include our custom properties
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: {
    requestTimestamp: number;
  };
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Environment-specific configuration
 */
const config = {
  // API base URL - use environment variable or fallback to proxy path
  baseURL: import.meta.env.VITE_API_URL || '',
  
  // Request timeout in milliseconds
  timeout: 10000,
  
  // Maximum number of retry attempts
  maxRetries: 3,
  
  // Delay between retries (in milliseconds)
  retryDelay: 1000
};

/**
 * Creates a configured axios instance
 */
export const api: AxiosInstance = axios.create({
  baseURL: config.baseURL || '/api',
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create auth API instance
export const authInstance: AxiosInstance = axios.create({
  baseURL: config.baseURL ? `${config.baseURL}/auth` : '/auth',
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor configuration
 */
const configureInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add timestamp for request timing
      const requestTimestamp = Date.now();
      (config as CustomAxiosRequestConfig).metadata = { requestTimestamp };

      // Log requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: config.headers
        });
      }

      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      const config = response.config as CustomAxiosRequestConfig;
      const requestTimestamp = config.metadata?.requestTimestamp;
      const responseTimestamp = Date.now();
      const duration = requestTimestamp ? responseTimestamp - requestTimestamp : 0;

      // Log responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Response:', {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
          headers: response.headers
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      if (!error.config) {
        return Promise.reject(error);
      }

      const config = error.config as CustomAxiosRequestConfig;

      // Skip retry for specific status codes
      if (error.response?.status && [400, 401, 403, 404].includes(error.response.status)) {
        if (error.response.status === 401) {
          // Clear token and redirect only if not already on login page
          localStorage.removeItem('accessToken');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }

      // Implement retry logic
      const retryCount = config.retryCount ?? 0;
      const maxRetries = config.maxRetries ?? config.maxRetries ?? 3;
      const retryDelay = config.retryDelay ?? config.retryDelay ?? 1000;

      if (retryCount < maxRetries) {
        config.retryCount = retryCount + 1;

        // Exponential backoff
        const delay = retryCount * retryDelay;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Log retry attempt
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Retrying request:', {
            attempt: config.retryCount,
            url: config.url,
            method: config.method
          });
        }

        return instance(config);
      }

      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Request failed:', {
          status: error.response?.status,
          data: error.response?.data,
          error: error.message
        });
      }

      return Promise.reject(error);
    }
  );
};

// Configure interceptors for both instances
configureInterceptors(api);
configureInterceptors(authInstance);

/**
 * Error handler for common HTTP errors
 */
export function handleAxiosError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { message?: string };

      switch (status) {
        case 400:
          return data.message || 'Invalid request';
        case 401:
          return 'Authentication required';
        case 403:
          return 'Access denied';
        case 404:
          return 'Resource not found';
        case 422:
          return data.message || 'Validation error';
        case 429:
          return 'Too many requests';
        case 500:
          return 'Internal server error';
        default:
          return `Server error (${status})`;
      }
    } else if (error.request) {
      // Request made but no response received
      return 'No response from server';
    } else {
      // Error in request configuration
      return error.message || 'Request failed';
    }
  }
  return 'An unknown error occurred';
}

// Create axios instances
const authApiInstance = axios.create({
  baseURL: '/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
[authApiInstance, apiInstance].forEach(instance => {
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle auth errors
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error?.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
});

// Auth API endpoints
export const authApi = {
  async register(data: CreateUserDto): Promise<AuthResponse> {
    const response = await authApiInstance.post<AuthResponse>('/register', data);
    return response.data;
  },

  async login(username: string, password: string, rememberMe = false): Promise<AuthResponse> {
    const response = await authApiInstance.post<AuthResponse>('/login', {
      username,
      password,
      rememberMe
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await authApiInstance.post('/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await authApiInstance.get<User>('/me');
    return response.data;
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

  async verifyBiometrics(data: {
    id: string;
    response: {
      attestationObject: string;
      clientDataJSON: string;
    };
  }): Promise<void> {
    await authApiInstance.post('/biometrics/verify', data);
  },

  async disableBiometrics(): Promise<void> {
    await authApiInstance.post('/biometrics/disable');
  }
};

// Projects API endpoints
export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    const response = await apiInstance.get<Project[]>('/projects');
    return response.data;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await apiInstance.post<Project>('/projects', data);
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await apiInstance.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async startProject(id: string): Promise<Project> {
    const response = await apiInstance.post<Project>(`/projects/${id}/start`);
    return response.data;
  },

  async stopProject(id: string): Promise<Project> {
    const response = await apiInstance.post<Project>(`/projects/${id}/stop`);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiInstance.delete(`/projects/${id}`);
  }
};

// Export the base API instance with a different name
export { apiInstance as baseApi }; 