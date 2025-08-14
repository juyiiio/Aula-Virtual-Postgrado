import api from './api';

const forumService = {
  // Obtener todos los foros
  getForums: async (params = {}) => {
    try {
      const response = await api.get('/forums', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener foro por ID
  getForumById: async (id) => {
    try {
      const response = await api.get(`/forums/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear foro
  createForum: async (forumData) => {
    try {
      const response = await api.post('/forums', forumData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar foro
  updateForum: async (id, forumData) => {
    try {
      const response = await api.put(`/forums/${id}`, forumData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar foro
  deleteForum: async (id) => {
    try {
      const response = await api.delete(`/forums/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener foros por curso
  getForumsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/forums/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener posts del foro
  getForumPosts: async (forumId, params = {}) => {
    try {
      const response = await api.get(`/forums/${forumId}/posts`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener post por ID
  getPostById: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear post
  createPost: async (forumId, postData) => {
    try {
      const response = await api.post(`/forums/${forumId}/posts`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Responder a post
  replyToPost: async (postId, replyData) => {
    try {
      const response = await api.post(`/posts/${postId}/replies`, replyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar post
  updatePost: async (postId, postData) => {
    try {
      const response = await api.put(`/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fijar post
  pinPost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/pin`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Desfijar post
  unpinPost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/unpin`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default forumService;
