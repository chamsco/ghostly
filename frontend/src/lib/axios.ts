import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://168.119.111.140:3000/api',
  withCredentials: true, // Important for cookies
});

// Add request interceptor to add token from session
api.interceptors.request.use((config) => {
  const session = localStorage.getItem('squadron:session');
  if (session) {
    const { token } = JSON.parse(session);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or the request was for refreshing token, reject
    if (error.response?.status !== 401 || originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const session = localStorage.getItem('squadron:session');
        if (!session) {
          throw new Error('No session found');
        }

        const { refreshToken, deviceId } = JSON.parse(session);
        const response = await api.post('/auth/refresh', {
          refreshToken,
          deviceId
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Update session in localStorage
        const updatedSession = {
          ...JSON.parse(session),
          token: newToken,
          refreshToken: newRefreshToken,
        };
        localStorage.setItem('squadron:session', JSON.stringify(updatedSession));

        // Update Authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process all queued requests
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear session and redirect to login
        localStorage.removeItem('squadron:session');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Add failed request to queue
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }).catch((err) => {
      return Promise.reject(err);
    });
  }
); 