import api from './api';

const examService = {
  // Obtener todos los exámenes
  getExams: async (params = {}) => {
    try {
      const response = await api.get('/exams', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener examen por ID
  getExamById: async (id) => {
    try {
      const response = await api.get(`/exams/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear examen
  createExam: async (examData) => {
    try {
      const response = await api.post('/exams', examData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar examen
  updateExam: async (id, examData) => {
    try {
      const response = await api.put(`/exams/${id}`, examData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar examen
  deleteExam: async (id) => {
    try {
      const response = await api.delete(`/exams/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener exámenes por curso
  getExamsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/exams/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Iniciar examen
  startExam: async (examId) => {
    try {
      const response = await api.post(`/exams/${examId}/start`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Finalizar examen
  finishExam: async (examId, answers) => {
    try {
      const response = await api.post(`/exams/${examId}/finish`, { answers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener calificaciones del examen
  getExamGrades: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}/grades`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Calificar examen
  gradeExam: async (examId, studentId, gradeData) => {
    try {
      const response = await api.post(`/exams/${examId}/grades/${studentId}`, gradeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener calificación del estudiante
  getStudentGrade: async (examId, studentId) => {
    try {
      const response = await api.get(`/exams/${examId}/grades/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener exámenes del estudiante
  getStudentExams: async (studentId) => {
    try {
      const response = await api.get(`/exams/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estado del examen para estudiante
  getExamStatus: async (examId, studentId) => {
    try {
      const response = await api.get(`/exams/${examId}/status/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default examService;
