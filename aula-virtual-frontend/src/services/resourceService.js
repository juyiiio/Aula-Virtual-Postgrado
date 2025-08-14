import api from './api';

export const resourceService = {
  // Get all resources with filters
  getAllResources: (params = {}) => {
    return api.get('/resources', { params });
  },

  // Get resource by ID
  getResourceById: (id) => {
    return api.get(`/resources/${id}`);
  },

  // Upload new resource
  uploadResource: (formData, options = {}) => {
    return api.post('/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options
    });
  },

  // Update resource
  updateResource: (id, resourceData) => {
    return api.put(`/resources/${id}`, resourceData);
  },

  // Delete resource
  deleteResource: (id) => {
    return api.delete(`/resources/${id}`);
  },

  // Download resource
  downloadResource: (id) => {
    return api.get(`/resources/${id}/download`, {
      responseType: 'blob'
    }).then(response => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },

  // Track resource view
  trackView: (id) => {
    return api.post(`/resources/${id}/view`);
  },

  // Get resource categories
  getResourceCategories: () => {
    return api.get('/resource-categories');
  },

  // Create resource category
  createResourceCategory: (categoryData) => {
    return api.post('/resource-categories', categoryData);
  },

  // Update resource category
  updateResourceCategory: (id, categoryData) => {
    return api.put(`/resource-categories/${id}`, categoryData);
  },

  // Delete resource category
  deleteResourceCategory: (id) => {
    return api.delete(`/resource-categories/${id}`);
  },

  // Get resource statistics
  getResourceStatistics: () => {
    return api.get('/resources/statistics');
  },

  // Add to favorites
  addToFavorites: (resourceId) => {
    return api.post(`/resources/${resourceId}/favorites`);
  },

  // Remove from favorites
  removeFromFavorites: (resourceId) => {
    return api.delete(`/resources/${resourceId}/favorites`);
  },

  // Get user's favorite resources
  getUserFavorites: (userId, params = {}) => {
    return api.get(`/users/${userId}/favorite-resources`, { params });
  },

  // Search resources
  searchResources: (query, params = {}) => {
    return api.get('/resources/search', { 
      params: { q: query, ...params } 
    });
  },

  // Get resources by category
  getResourcesByCategory: (categoryId, params = {}) => {
    return api.get(`/resource-categories/${categoryId}/resources`, { params });
  },

  // Get resources by tag
  getResourcesByTag: (tag, params = {}) => {
    return api.get('/resources/by-tag', { 
      params: { tag, ...params } 
    });
  },

  // Get user's uploaded resources
  getUserResources: (userId, params = {}) => {
    return api.get(`/users/${userId}/resources`, { params });
  },

  // Share resource
  shareResource: (resourceId, shareData) => {
    return api.post(`/resources/${resourceId}/share`, shareData);
  },

  // Get resource sharing analytics
  getResourceAnalytics: (resourceId) => {
    return api.get(`/resources/${resourceId}/analytics`);
  },

  // Bulk upload resources
  bulkUploadResources: (formData, options = {}) => {
    return api.post('/resources/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options
    });
  },

  // Bulk delete resources
  bulkDeleteResources: (resourceIds) => {
    return api.delete('/resources/bulk-delete', { 
      data: { resourceIds } 
    });
  },

  // Get resource versions (if versioning is supported)
  getResourceVersions: (resourceId) => {
    return api.get(`/resources/${resourceId}/versions`);
  },

  // Update resource version
  uploadResourceVersion: (resourceId, formData, options = {}) => {
    return api.post(`/resources/${resourceId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options
    });
  },

  // Generate resource thumbnail
  generateThumbnail: (resourceId) => {
    return api.post(`/resources/${resourceId}/thumbnail`);
  },

  // Get resource comments/reviews
  getResourceComments: (resourceId, params = {}) => {
    return api.get(`/resources/${resourceId}/comments`, { params });
  },

  // Add resource comment/review
  addResourceComment: (resourceId, commentData) => {
    return api.post(`/resources/${resourceId}/comments`, commentData);
  },

  // Update resource comment
  updateResourceComment: (commentId, commentData) => {
    return api.put(`/resource-comments/${commentId}`, commentData);
  },

  // Delete resource comment
  deleteResourceComment: (commentId) => {
    return api.delete(`/resource-comments/${commentId}`);
  },

  // Export resources list
  exportResources: (params = {}) => {
    return api.get('/resources/export', { 
      params,
      responseType: 'blob'
    });
  },

  // Get resource usage statistics
  getResourceUsageStats: (params = {}) => {
    return api.get('/resources/usage-stats', { params });
  },

  // Check storage quota
  getStorageQuota: (userId) => {
    return api.get(`/users/${userId}/storage-quota`);
  },

  // Optimize resource (compress, convert format, etc.)
  optimizeResource: (resourceId, optimizationOptions) => {
    return api.post(`/resources/${resourceId}/optimize`, optimizationOptions);
  }
};
