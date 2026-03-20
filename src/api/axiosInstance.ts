/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lookrooms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Handle token refresh logic here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
