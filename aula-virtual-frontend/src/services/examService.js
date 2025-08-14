import api from './api';

export const examService = {
  // Get all exams with filters
  getAllExams: (params = {}) => {
    return api.get('/exams', { params });
  },

  // Get exam by ID
  getExamById: (id) => {
    return api.get(`/exams/${id}`);
  },

  // Create new exam
  createExam: (examData) => {
    return api.post('/exams', examData);
  },

  // Update exam
  updateExam: (id, examData) => {
    return api.put(`/exams/${id}`, examData);
  },

  // Delete exam
  deleteExam: (id) => {
    return api.delete(`/exams/${id}`);
  },

  // Get exams for student
  getStudentExams: (studentId, params = {}) => {
    return api.get(`/exams/student/${studentId}`, { params });
  },

  // Get exams for instructor
  getInstructorExams: (instructorId, params = {}) => {
    return api.get(`/exams/instructor/${instructorId}`, { params });
  },

  // Get student's courses
  getStudentCourses: (studentId) => {
    return api.get(`/users/${studentId}/courses`);
  },

  // Get instructor's courses
  getInstructorCourses: (instructorId) => {
    return api.get(`/users/${instructorId}/courses`);
  },

  // Start exam attempt
  startExamAttempt: (examId) => {
    return api.post(`/exams/${examId}/attempts`);
  },

  // Save exam answers (auto-save)
  saveExamAnswers: (attemptId, answersData) => {
    return api.put(`/exam-attempts/${attemptId}/answers`, answersData);
  },

  // Submit exam attempt
  submitExamAttempt: (attemptId, submissionData) => {
    return api.put(`/exam-attempts/${attemptId}/submit`, submissionData);
  },

  // Get exam attempt by ID
  getExamAttempt: (attemptId) => {
    return api.get(`/exam-attempts/${attemptId}`);
  },

  // Get exam with grades
  getExamWithGrades: (examId) => {
    return api.get(`/exams/${examId}/grades`);
  },

  // Adjust exam grade
  adjustExamGrade: (attemptId, gradeData) => {
    return api.put(`/exam-attempts/${attemptId}/grade`, gradeData);
  },

  // Export exam grades
  exportExamGrades: (examId, format = 'xlsx') => {
    return api.get(`/exams/${examId}/export-grades`, {
      params: { format },
      responseType: 'blob'
    });
  },

  // Get exam statistics
  getExamStatistics: (examId) => {
    return api.get(`/exams/${examId}/statistics`);
  },

  // Get exam results for student
  getStudentExamResults: (examId, studentId) => {
    return api.get(`/exams/${examId}/results/${studentId}`);
  },

  // Get all exam attempts
  getExamAttempts: (examId) => {
    return api.get(`/exams/${examId}/attempts`);
  },

  // Reset exam attempt
  resetExamAttempt: (attemptId) => {
    return api.post(`/exam-attempts/${attemptId}/reset`);
  },

  // Extend exam time
  extendExamTime: (attemptId, additionalMinutes) => {
    return api.post(`/exam-attempts/${attemptId}/extend`, { additionalMinutes });
  }
};
