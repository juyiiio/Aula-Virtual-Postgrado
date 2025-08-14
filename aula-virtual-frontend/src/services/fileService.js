import api from './api';

const fileService = {
  // Subir archivo
  uploadFile: async (file, folder = 'general') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Descargar archivo
  downloadFile: async (fileId) => {
    try {
      const response = await api.get(`/files/download/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar archivo
  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener información del archivo
  getFileInfo: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}/info`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener archivos por curso
  getFilesByCourse: async (courseId) => {
    try {
      const response = await api.get(`/files/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener recursos del curso
  getCourseResources: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/resources`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear recurso del curso
  createCourseResource: async (courseId, resourceData) => {
    try {
      const formData = new FormData();
      
      if (resourceData.file) {
        formData.append('file', resourceData.file);
      }
      
      Object.keys(resourceData).forEach(key => {
        if (key !== 'file') {
          formData.append(key, resourceData[key]);
        }
      });

      const response = await api.post(`/courses/${courseId}/resources`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar recurso del curso
  updateCourseResource: async (courseId, resourceId, resourceData) => {
    try {
      const response = await api.put(`/courses/${courseId}/resources/${resourceId}`, resourceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar recurso del curso
  deleteCourseResource: async (courseId, resourceId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validar tipo de archivo
  validateFileType: (file, allowedTypes) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(fileExtension);
  },

  // Validar tamaño de archivo
  validateFileSize: (file, maxSize) => {
    return file.size <= maxSize;
  },

  // Obtener URL de vista previa
  getPreviewUrl: (fileId) => {
    return `${api.defaults.baseURL}/files/preview/${fileId}`;
  },

  // Obtener URL de descarga
  getDownloadUrl: (fileId) => {
    return `${api.defaults.baseURL}/files/download/${fileId}`;
  }
};

export default fileService;
