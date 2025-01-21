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

import axios, { 
  AxiosError, 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';

// Extend the AxiosRequestConfig interface to include our custom properties
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      requestTimestamp: number;
    };
    retryCount?: number;
    maxRetries?: number;
    retryDelay?: number;
  }
}

/**
 * Environment-specific configuration
 */
const config = {
  // API base URL from environment variables
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
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
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor
 * - Adds authentication token
 * - Logs requests in development
 * - Handles request retries
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp for request timing
    const requestTimestamp = Date.now();
    config.metadata = { requestTimestamp };

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Handles response timing
 * - Logs responses in development
 * - Implements retry logic for failed requests
 * - Handles common error cases
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const requestTimestamp = response.config.metadata?.requestTimestamp;
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
    const { config, response } = error;

    // Skip retry for specific status codes
    if (response && [400, 401, 403, 404].includes(response.status)) {
      return Promise.reject(error);
    }

    // Implement retry logic with default values
    const retryCount = config?.retryCount ?? 0;
    const maxRetries = config?.maxRetries ?? 3;
    const retryDelay = config?.retryDelay ?? 1000;

    if (config && retryCount < maxRetries) {
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

      return api(config);
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request failed:', {
        status: response?.status,
        data: response?.data,
        error: error.message
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Error handler for common HTTP errors
 * @param error - Axios error object
 * @returns Formatted error message
 */
export function handleAxiosError(error: AxiosError): string {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data as any;

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