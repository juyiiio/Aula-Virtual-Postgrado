import api from './api';

export const assignmentService = {
  // Get all assignments with filters
  getAllAssignments: (params = {}) => {
    return api.get('/assignments', { params });
  },

  // Get assignment by ID
  getAssignmentById: (id) => {
    return api.get(`/assignments/${id}`);
  },

  // Create new assignment
  createAssignment: (assignmentData) => {
    return api.post('/assignments', assignmentData);
  },

  // Update assignment
  updateAssignment: (id, assignmentData) => {
    return api.put(`/assignments/${id}`, assignmentData);
  },

  // Delete assignment
  deleteAssignment: (id) => {
    return api.delete(`/assignments/${id}`);
  },

  // Get assignments for student
  getStudentAssignments: (studentId, params = {}) => {
    return api.get(`/assignments/student/${studentId}`, { params });
  },

  // Get assignments for instructor
  getInstructorAssignments: (instructorId, params = {}) => {
    return api.get(`/assignments/instructor/${instructorId}`, { params });
  },

  // Get student's courses
  getStudentCourses: (studentId) => {
    return api.get(`/users/${studentId}/courses`);
  },

  // Get instructor's courses
  getInstructorCourses: (instructorId) => {
    return api.get(`/users/${instructorId}/courses`);
  },

  // Submit assignment
  submitAssignment: (assignmentId, formData) => {
    return api.post(`/assignments/${assignmentId}/submissions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get student submission
  getStudentSubmission: (assignmentId, studentId) => {
    return api.get(`/assignments/${assignmentId}/submissions/student/${studentId}`);
  },

  // Update submission
  updateSubmission: (submissionId, formData) => {
    return api.put(`/submissions/${submissionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all submissions for assignment
  getAssignmentSubmissions: (assignmentId) => {
    return api.get(`/assignments/${assignmentId}/submissions`);
  },

  // Grade submission
  gradeSubmission: (submissionId, gradeData) => {
    return api.put(`/submissions/${submissionId}/grade`, gradeData);
  },

  // Get assignment statistics
  getAssignmentStatistics: (assignmentId) => {
    return api.get(`/assignments/${assignmentId}/statistics`);
  },

  // Bulk grade submissions
  bulkGradeSubmissions: (assignmentId, gradesData) => {
    return api.post(`/assignments/${assignmentId}/bulk-grade`, gradesData);
  },

  // Export assignment grades
  exportGrades: (assignmentId, format = 'xlsx') => {
    return api.get(`/assignments/${assignmentId}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }
};
