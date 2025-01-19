import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://168.119.111.140:3000/api',
  withCredentials: true, // Important for cookies
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
); 