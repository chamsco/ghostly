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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
); 