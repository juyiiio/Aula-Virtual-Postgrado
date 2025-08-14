import api from './api';

const assignmentService = {
  // Obtener todas las tareas
  getAssignments: async (params = {}) => {
    try {
      const response = await api.get('/assignments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tarea por ID
  getAssignmentById: async (id) => {
    try {
      const response = await api.get(`/assignments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear tarea
  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar tarea
  updateAssignment: async (id, assignmentData) => {
    try {
      const response = await api.put(`/assignments/${id}`, assignmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar tarea
  deleteAssignment: async (id) => {
    try {
      const response = await api.delete(`/assignments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tareas por curso
  getAssignmentsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/assignments/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener entregas de una tarea
  getAssignmentSubmissions: async (assignmentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear entrega de tarea
  createSubmission: async (assignmentId, submissionData) => {
    try {
      const formData = new FormData();
      
      if (submissionData.file) {
        formData.append('file', submissionData.file);
      }
      
      if (submissionData.submissionText) {
        formData.append('submissionText', submissionData.submissionText);
      }

      const response = await api.post(`/assignments/${assignmentId}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar entrega de tarea
  updateSubmission: async (assignmentId, submissionId, submissionData) => {
    try {
      const formData = new FormData();
      
      if (submissionData.file) {
        formData.append('file', submissionData.file);
      }
      
      if (submissionData.submissionText) {
        formData.append('submissionText', submissionData.submissionText);
      }

      const response = await api.put(`/assignments/${assignmentId}/submissions/${submissionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Calificar entrega
  gradeSubmission: async (assignmentId, submissionId, gradeData) => {
    try {
      const response = await api.post(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener entrega del estudiante
  getStudentSubmission: async (assignmentId, studentId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}/submissions/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tareas del estudiante
  getStudentAssignments: async (studentId) => {
    try {
      const response = await api.get(`/assignments/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default assignmentService;
