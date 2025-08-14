import api from './api';

const userService = {
  // Obtener todos los usuarios
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear usuario
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subir foto de perfil
  updateProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuarios por rol
  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener instructores
  getInstructors: async () => {
    try {
      const response = await api.get('/users/instructors');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estudiantes
  getStudents: async () => {
    try {
      const response = await api.get('/users/students');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar estado del usuario
  changeUserStatus: async (id, status) => {
    try {
      const response = await api.patch(`/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Asignar rol a usuario
  assignRole: async (userId, roleId) => {
    try {
      const response = await api.post(`/users/${userId}/roles`, { roleId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remover rol de usuario
  removeRole: async (userId, roleId) => {
    try {
      const response = await api.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar usuarios
  searchUsers: async (searchTerm) => {
    try {
      const response = await api.get('/users/search', {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;
