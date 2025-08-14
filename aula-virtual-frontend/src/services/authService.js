import api from './api';

const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token', token);
      }
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Registrar usuario
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token');
  },

  // Obtener perfil del usuario actual
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refrescar token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token', token);
      }
      
      return token;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Olvidé mi contraseña
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token');
    return !!token;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem(process.env.REACT_APP_TOKEN_STORAGE_KEY || 'aula_virtual_token');
  }
};

export default authService;
