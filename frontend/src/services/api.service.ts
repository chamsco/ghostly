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
import type { Project, CreateProjectDto, Resource, CreateResourceDto } from '@/types/project';
import type { Environment, CreateEnvironmentDto } from '@/types/environment';
import type { Server, CreateServerDto } from '@/types/server';
import { apiInstance, authApiInstance } from '@/lib/axios';
import type { RegisterDto, LoginDto } from '@/types/auth';

// Get the base URL from environment or use default
const BASE_URL = import.meta.env.VITE_API_URL || 'http://168.119.111.140:3000';
const API_TIMEOUT = 10000; // 10 seconds

// Add request logging and auth token
const addRequestInterceptor = (axiosInstance: typeof apiInstance) => {
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
const addResponseInterceptor = (axiosInstance: typeof apiInstance) => {
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
addRequestInterceptor(apiInstance);
addRequestInterceptor(authApiInstance);
addResponseInterceptor(apiInstance);
addResponseInterceptor(authApiInstance);

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    try {
      const response = await authApiInstance.post('/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    try {
      const response = await authApiInstance.post('/login', data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApiInstance.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  me: async (): Promise<User> => {
    try {
      const response = await authApiInstance.get('/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
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

/**
 * Projects API endpoints
 */
export const projectsApi = {
  create: async (data: CreateProjectDto): Promise<Project> => {
    try {
      const response = await apiInstance.post('/projects', data);
      return response.data;
    } catch (error) {
      console.error('Project creation error:', error);
      throw error;
    }
  },

  findAll: async (): Promise<Project[]> => {
    try {
      const response = await apiInstance.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Fetch projects error:', error);
      throw error;
    }
  },

  findOne: async (id: string): Promise<Project> => {
    try {
      const response = await apiInstance.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fetch project ${id} error:`, error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiInstance.patch(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Update project ${id} error:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiInstance.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Delete project ${id} error:`, error);
      throw error;
    }
  },

  start: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiInstance.post<Project>(`/projects/${id}/deploy`);
      return response.data;
    } catch (error) {
      console.error(`Start project ${id} error:`, error);
      return null;
    }
  },

  stop: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiInstance.post<Project>(`/projects/${id}/stop`);
      return response.data;
    } catch (error) {
      console.error(`Stop project ${id} error:`, error);
      return null;
    }
  },

  restart: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiInstance.post<Project>(`/projects/${id}/restart`);
      return response.data;
    } catch (error) {
      console.error(`Restart project ${id} error:`, error);
      return null;
    }
  },

  logs: async (id: string): Promise<string[]> => {
    try {
      const response = await apiInstance.get<string[]>(`/projects/${id}/logs`);
      return response.data;
    } catch (error) {
      console.error(`Get project ${id} logs error:`, error);
      return [];
    }
  },

  // Resource methods
  createResource: async (projectId: string, data: CreateResourceDto): Promise<Resource> => {
    try {
      const response = await apiInstance.post(`/projects/${projectId}/resources`, data);
      return response.data;
    } catch (error) {
      console.error('Resource creation error:', error);
      throw error;
    }
  },

  getResources: async (projectId: string): Promise<Resource[]> => {
    try {
      const response = await apiInstance.get<Resource[]>(`/projects/${projectId}/resources`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      return [];
    }
  },

  updateResource: async (resourceId: string, data: Partial<Resource>): Promise<Resource | null> => {
    try {
      const response = await apiInstance.patch<Resource>(`/resources/${resourceId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update resource:', error);
      return null;
    }
  },

  deleteResource: async (resourceId: string): Promise<void> => {
    try {
      await apiInstance.delete(`/resources/${resourceId}`);
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  },

  // Environment methods
  createEnvironment: async (projectId: string, data: CreateEnvironmentDto): Promise<Environment> => {
    try {
      const response = await apiInstance.post(`/projects/${projectId}/environments`, data);
      return response.data;
    } catch (error) {
      console.error('Environment creation error:', error);
      throw error;
    }
  },

  getEnvironments: async (projectId: string): Promise<Environment[]> => {
    try {
      const response = await apiInstance.get<Environment[]>(`/projects/${projectId}/environments`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch environments:', error);
      return [];
    }
  },

  updateEnvironment: async (environmentId: string, data: Partial<Environment>): Promise<Environment | null> => {
    try {
      const response = await apiInstance.patch<Environment>(`/environments/${environmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update environment:', error);
      return null;
    }
  },

  deleteEnvironment: async (environmentId: string): Promise<void> => {
    try {
      await apiInstance.delete(`/environments/${environmentId}`);
    } catch (error) {
      console.error('Failed to delete environment:', error);
    }
  },

  getResource: async (id: string): Promise<Resource | null> => {
    try {
      const { data } = await authApiInstance.get(`/resources/${id}`);
      return data;
    } catch (err) {
      handleAxiosError(err);
      return null;
    }
  }
};

export const serversApi = {
  create: async (data: CreateServerDto): Promise<Server> => {
    try {
      console.log('Creating server with data:', data);
      const response = await apiInstance.post('/servers', data);
      console.log('Server created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Server creation error:', error);
      throw error;
    }
  },

  findAll: async (): Promise<Server[]> => {
    try {
      console.log('Fetching all servers');
      const response = await apiInstance.get('/servers');
      console.log('Servers fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch servers error:', error);
      throw error;
    }
  },

  findOne: async (id: string): Promise<Server> => {
    try {
      console.log('Fetching server:', id);
      const response = await apiInstance.get(`/servers/${id}`);
      console.log('Server fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Fetch server ${id} error:`, error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Server>): Promise<Server> => {
    try {
      console.log('Updating server:', id, data);
      const response = await apiInstance.put(`/servers/${id}`, data);
      console.log('Server updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Update server ${id} error:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      console.log('Deleting server:', id);
      await apiInstance.delete(`/servers/${id}`);
      console.log('Server deleted successfully');
    } catch (error) {
      console.error(`Delete server ${id} error:`, error);
      throw error;
    }
  },

  checkConnection: async (id: string): Promise<{ status: boolean }> => {
    try {
      console.log('Checking server connection:', id);
      const response = await apiInstance.get(`/servers/${id}/check-connection`);
      console.log('Connection check result:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Check connection error for server ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Authentication API endpoints
 */
export const authApiService = {
  async register(data: RegisterDto): Promise<{ access_token: string }> {
    try {
      const response = await authApiInstance.post<{ access_token: string }>('/register', data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async login(data: LoginDto): Promise<{ access_token: string }> {
    try {
      const response = await authApiInstance.post<{ access_token: string }>('/login', data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async me(): Promise<User> {
    try {
      const response = await authApiInstance.get<User>('/me');
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await authApiInstance.post('/logout');
      localStorage.removeItem('accessToken');
    } catch (error) {
      throw handleAxiosError(error);
    }
  }
};

// Helper function to handle axios errors
const handleAxiosError = (error: any): never => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  throw new Error(message);
};