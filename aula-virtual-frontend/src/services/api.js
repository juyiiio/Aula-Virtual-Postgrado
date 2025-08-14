import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';

// Crear instancia de axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
