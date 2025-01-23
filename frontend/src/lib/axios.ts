/**
 * Axios Configuration Module
 * 
 * Sets up configured axios instances for making HTTP requests with:
 * - Dynamic base URL configuration based on environment
 * - Default headers and timeout
 * - Request/response interceptors
 * - Error handling
 * - Authentication token management
 */
import axios from 'axios';
//import { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  CreateUserDto, 
  AuthResponse, 
  TwoFactorResponse, 
  BiometricRegistrationOptions 
} from '@/types/auth';
//import type { AxiosRequestConfig } from 'axios';
import type { User } from '@/types/user';
import type { Project, CreateProjectDto } from '@/types/project';
import { toast } from 'sonner';

// Get base URL from environment variable with fallback
const BASE_URL = import.meta.env.VITE_API_URL || 'http://168.119.111.140:3000';
console.log('🌐 Initializing API with base URL:', BASE_URL);

// Create axios instances with different base URLs
export const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

export const authApiInstance = axios.create({
  baseURL: `${BASE_URL}/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for debugging
apiInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 Outgoing Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    });

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth token to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', {
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response Success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      headers: error.config?.headers,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseHeaders: error.response?.headers,
      responseData: error.response?.data,
      stack: error.stack
    });

    // Only redirect to login if not already on an auth route
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/auth')) {
      console.log('🔒 Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add the same interceptors to authApiInstance
authApiInstance.interceptors.request.use(
  (config) => {
    console.log('🔐 Auth Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials
    });
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth token to request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Auth Request Error:', {
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

authApiInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Auth Response Success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Auth Response Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      headers: error.config?.headers,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseHeaders: error.response?.headers,
      responseData: error.response?.data,
      stack: error.stack
    });

    // Only redirect to login if not already on an auth route
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/auth')) {
      console.log('🔒 Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Log instance creation for debugging
console.log('📡 API Instances Created:', {
  apiBaseURL: apiInstance.defaults.baseURL,
  authBaseURL: authApiInstance.defaults.baseURL,
  headers: apiInstance.defaults.headers
});

export const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    toast.error(message);
  }
  return null;
};

// Auth API endpoints
export const authApiEndpoints = {
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