import api from './api';

const announcementService = {
  // Obtener todos los anuncios
  getAnnouncements: async (params = {}) => {
    try {
      const response = await api.get('/announcements', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener anuncio por ID
  getAnnouncementById: async (id) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear anuncio
  createAnnouncement: async (announcementData) => {
    try {
      const response = await api.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar anuncio
  updateAnnouncement: async (id, announcementData) => {
    try {
      const response = await api.put(`/announcements/${id}`, announcementData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar anuncio
  deleteAnnouncement: async (id) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener anuncios por curso
  getAnnouncementsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/announcements/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener anuncios globales
  getGlobalAnnouncements: async () => {
    try {
      const response = await api.get('/announcements/global');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener anuncios recientes
  getRecentAnnouncements: async (limit = 5) => {
    try {
      const response = await api.get('/announcements/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener anuncios por prioridad
  getAnnouncementsByPriority: async (priority) => {
    try {
      const response = await api.get(`/announcements/priority/${priority}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Publicar anuncio
  publishAnnouncement: async (id) => {
    try {
      const response = await api.post(`/announcements/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Despublicar anuncio
  unpublishAnnouncement: async (id) => {
    try {
      const response = await api.post(`/announcements/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default announcementService;
