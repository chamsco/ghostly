/**
 * API Service
 *
 * Handles all API requests with:
 * - Base URL configuration
 * - Authentication headers
 * - Error handling
 * - Response transformation
 */
import axios from 'axios';
import type { CreateUserDto, AuthResponse, TwoFactorResponse, BiometricRegistrationOptions } from '@/types/auth';
//import type { LoginData } from '@/types/auth';
import type { User } from '@/types/user';
import type { Project, CreateProjectDto } from '@/types/project';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(username: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      username,
      password,
      rememberMe
    });
    return response.data;
  },

  async register(data: CreateUserDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/password-reset/request', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/password-reset/reset', { token, password });
  },

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/password/update', { oldPassword, newPassword });
  },

  async updateAuthSettings(settings: { requiresAdditionalAuth: boolean }): Promise<void> {
    await api.patch('/auth/settings', settings);
  },

  async setup2FA(): Promise<TwoFactorResponse> {
    const response = await api.post<TwoFactorResponse>('/auth/2fa/setup');
    return response.data;
  },

  async verify2FA(token: string): Promise<void> {
    await api.post('/auth/2fa/verify', { token });
  },

  async disable2FA(): Promise<void> {
    await api.post('/auth/2fa/disable');
  },

  async enable2FA(): Promise<void> {
    await api.post('/auth/2fa/enable');
  },

  async setupBiometrics(): Promise<BiometricRegistrationOptions> {
    const response = await api.post<BiometricRegistrationOptions>('/auth/biometrics/setup');
    return response.data;
  },

  async disableBiometrics(): Promise<void> {
    await api.post('/auth/biometrics/disable');
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