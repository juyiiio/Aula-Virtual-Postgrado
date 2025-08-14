import api from './api';

export const forumService = {
  // Get all forums with filters
  getAllForums: (params = {}) => {
    return api.get('/forums', { params });
  },

  // Get forum by ID
  getForumById: (id) => {
    return api.get(`/forums/${id}`);
  },

  // Create new forum
  createForum: (forumData) => {
    return api.post('/forums', forumData);
  },

  // Update forum
  updateForum: (id, forumData) => {
    return api.put(`/forums/${id}`, forumData);
  },

  // Delete forum
  deleteForum: (id) => {
    return api.delete(`/forums/${id}`);
  },

  // Get forum categories
  getForumCategories: () => {
    return api.get('/forum-categories');
  },

  // Get popular topics
  getPopularTopics: (params = {}) => {
    return api.get('/topics/popular', { params });
  },

  // Get recent forum activity
  getRecentActivity: (params = {}) => {
    return api.get('/forums/activity', { params });
  },

  // Get forum topics
  getForumTopics: (forumId, params = {}) => {
    return api.get(`/forums/${forumId}/topics`, { params });
  },

  // Create new topic
  createTopic: (forumId, topicData) => {
    return api.post(`/forums/${forumId}/topics`, topicData);
  },

  // Get topic by ID
  getTopicById: (topicId) => {
    return api.get(`/topics/${topicId}`);
  },

  // Update topic
  updateTopic: (topicId, topicData) => {
    return api.put(`/topics/${topicId}`, topicData);
  },

  // Delete topic
  deleteTopic: (topicId) => {
    return api.delete(`/topics/${topicId}`);
  },

  // Pin/Unpin topic
  pinTopic: (topicId, isPinned) => {
    return api.put(`/topics/${topicId}/pin`, { isPinned });
  },

  // Lock/Unlock topic
  lockTopic: (topicId, isLocked) => {
    return api.put(`/topics/${topicId}/lock`, { isLocked });
  },

  // Like/Unlike topic
  likeTopic: (topicId, isLiked) => {
    return api.put(`/topics/${topicId}/like`, { isLiked });
  },

  // Get topic posts
  getTopicPosts: (topicId, params = {}) => {
    return api.get(`/topics/${topicId}/posts`, { params });
  },

  // Create new post
  createPost: (topicId, postData) => {
    return api.post(`/topics/${topicId}/posts`, postData);
  },

  // Update post
  updatePost: (postId, postData) => {
    return api.put(`/posts/${postId}`, postData);
  },

  // Delete post
  deletePost: (postId) => {
    return api.delete(`/posts/${postId}`);
  },

  // Like/Unlike post
  likePost: (postId, isLiked) => {
    return api.put(`/posts/${postId}/like`, { isLiked });
  },

  // Report post
  reportPost: (postId, reportData) => {
    return api.post(`/posts/${postId}/report`, reportData);
  },

  // Search forums
  searchForums: (query, params = {}) => {
    return api.get('/forums/search', { 
      params: { q: query, ...params } 
    });
  },

  // Search topics
  searchTopics: (query, params = {}) => {
    return api.get('/topics/search', { 
      params: { q: query, ...params } 
    });
  },

  // Search posts
  searchPosts: (query, params = {}) => {
    return api.get('/posts/search', { 
      params: { q: query, ...params } 
    });
  },

  // Get user's forum statistics
  getUserForumStats: (userId) => {
    return api.get(`/users/${userId}/forum-stats`);
  },

  // Join forum (for private forums)
  joinForum: (forumId) => {
    return api.post(`/forums/${forumId}/join`);
  },

  // Leave forum
  leaveForum: (forumId) => {
    return api.post(`/forums/${forumId}/leave`);
  },

  // Get forum members
  getForumMembers: (forumId, params = {}) => {
    return api.get(`/forums/${forumId}/members`, { params });
  },

  // Add forum moderator
  addModerator: (forumId, userId) => {
    return api.post(`/forums/${forumId}/moderators`, { userId });
  },

  // Remove forum moderator
  removeModerator: (forumId, userId) => {
    return api.delete(`/forums/${forumId}/moderators/${userId}`);
  },

  // Get forum statistics
  getForumStatistics: (forumId) => {
    return api.get(`/forums/${forumId}/statistics`);
  },

  // Subscribe to topic notifications
  subscribeToTopic: (topicId) => {
    return api.post(`/topics/${topicId}/subscribe`);
  },

  // Unsubscribe from topic notifications
  unsubscribeFromTopic: (topicId) => {
    return api.delete(`/topics/${topicId}/subscribe`);
  }
};
