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
import { Project, CreateProjectDto } from '@/types/project';
import { User, CreateUserDto } from '@/types/user';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: '/auth',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  /**
   * Login with username and password
   */
  async login(username: string, password: string, rememberMe = false) {
    const { data } = await api.post('/login', {
      username,
      password,
      rememberMe
    });
    return data;
  },

  /**
   * Register a new user
   */
  async register(userData: CreateUserDto) {
    const { data } = await api.post('/register', userData);
    return data;
  },

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<User> {
    const { data } = await api.get('/me');
    return data;
  },

  /**
   * Logout current user
   */
  async logout() {
    await api.post('/logout');
  }
};

// Projects API endpoints
export const projectsApi = {
  /**
   * List all projects for the authenticated user
   */
  async list(): Promise<Project[]> {
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },

  /**
   * Create a new project
   */
  async create(project: CreateProjectDto): Promise<Project> {
    const { data } = await api.post<Project>('/projects', project);
    return data;
  },

  /**
   * Get project details by ID
   */
  async get(id: string): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  /**
   * Start a project
   */
  async start(id: string): Promise<Project> {
    const { data } = await api.post<Project>(`/projects/${id}/start`);
    return data;
  },

  /**
   * Stop a project
   */
  async stop(id: string): Promise<Project> {
    const { data } = await api.post<Project>(`/projects/${id}/stop`);
    return data;
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
}; 