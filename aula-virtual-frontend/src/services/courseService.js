import api from './api';

const courseService = {
  // Obtener todos los cursos
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/courses', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener curso por ID
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear curso
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar curso
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar curso
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener cursos del estudiante
  getStudentCourses: async (studentId) => {
    try {
      const response = await api.get(`/courses/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener cursos del instructor
  getInstructorCourses: async (instructorId) => {
    try {
      const response = await api.get(`/courses/instructor/${instructorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Inscribir estudiante en curso
  enrollStudent: async (courseId, studentId) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`, { studentId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Desinscribir estudiante del curso
  unenrollStudent: async (courseId, studentId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/enroll/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estudiantes inscritos
  getEnrolledStudents: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/students`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener unidades del curso
  getCourseUnits: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/units`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear unidad del curso
  createCourseUnit: async (courseId, unitData) => {
    try {
      const response = await api.post(`/courses/${courseId}/units`, unitData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar unidad del curso
  updateCourseUnit: async (courseId, unitId, unitData) => {
    try {
      const response = await api.put(`/courses/${courseId}/units/${unitId}`, unitData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar unidad del curso
  deleteCourseUnit: async (courseId, unitId) => {
    try {
      const response = await api.delete(`/courses/${courseId}/units/${unitId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default courseService;
