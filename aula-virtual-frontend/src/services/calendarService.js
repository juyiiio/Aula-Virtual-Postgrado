import api from './api';

const calendarService = {
  // Obtener todos los eventos
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/calendar/events', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener evento por ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/calendar/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear evento
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar evento
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/calendar/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar evento
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/calendar/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos por curso
  getEventsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/calendar/events/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos por fecha
  getEventsByDate: async (startDate, endDate) => {
    try {
      const response = await api.get('/calendar/events/date-range', {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos del día actual
  getTodayEvents: async () => {
    try {
      const response = await api.get('/calendar/events/today');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos de la semana
  getWeekEvents: async () => {
    try {
      const response = await api.get('/calendar/events/week');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos del mes
  getMonthEvents: async (year, month) => {
    try {
      const response = await api.get('/calendar/events/month', {
        params: {
          year,
          month
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener eventos próximos
  getUpcomingEvents: async (limit = 10) => {
    try {
      const response = await api.get('/calendar/events/upcoming', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default calendarService;
