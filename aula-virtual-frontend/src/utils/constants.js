// Constantes de la aplicación

// Roles del sistema
export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
  COORDINATOR: 'COORDINATOR',
  SUPPORT: 'SUPPORT'
};

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

// Estados de cursos
export const COURSE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  COMPLETED: 'COMPLETED'
};

// Estados de inscripción
export const ENROLLMENT_STATUS = {
  ENROLLED: 'ENROLLED',
  DROPPED: 'DROPPED',
  COMPLETED: 'COMPLETED'
};

// Tipos de recursos
export const RESOURCE_TYPES = {
  PDF: 'PDF',
  VIDEO: 'VIDEO',
  LINK: 'LINK',
  DOCUMENT: 'DOCUMENT',
  PRESENTATION: 'PRESENTATION'
};

// Tipos de examen
export const EXAM_TYPES = {
  PARCIAL: 'PARCIAL',
  FINAL: 'FINAL',
  SUSTITUTORIO: 'SUSTITUTORIO',
  EXTRAORDINARIO: 'EXTRAORDINARIO'
};

// Estados de examen
export const EXAM_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED'
};

// Estados de calificación de examen
export const EXAM_GRADE_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  GRADED: 'GRADED'
};

// Tipos de foro
export const FORUM_TYPES = {
  GENERAL: 'GENERAL',
  Q_AND_A: 'Q_AND_A',
  DISCUSSION: 'DISCUSSION'
};

// Tipos de evento del calendario
export const EVENT_TYPES = {
  CLASS: 'CLASS',
  EXAM: 'EXAM',
  ASSIGNMENT_DUE: 'ASSIGNMENT_DUE',
  MEETING: 'MEETING',
  OTHER: 'OTHER'
};

// Plataformas de videoconferencia
export const VIDEO_PLATFORMS = {
  ZOOM: 'ZOOM',
  MEET: 'MEET',
  TEAMS: 'TEAMS',
  CUSTOM: 'CUSTOM'
};

// Estados de videoconferencia
export const CONFERENCE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED'
};

// Prioridades de anuncios
export const ANNOUNCEMENT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Estados de anuncios
export const ANNOUNCEMENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  EXPIRED: 'EXPIRED'
};

// Tipos de envío de tareas
export const SUBMISSION_TYPES = {
  FILE: 'FILE',
  TEXT: 'TEXT',
  BOTH: 'BOTH'
};

// Estados de envío de tareas
export const SUBMISSION_STATUS = {
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
  LATE: 'LATE'
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10485760, // 10MB
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'zip', 'rar']
};

// Rutas de la API
export const API_ROUTES = {
  AUTH: '/auth',
  USERS: '/users',
  COURSES: '/courses',
  ASSIGNMENTS: '/assignments',
  EXAMS: '/exams',
  FORUMS: '/forums',
  CALENDAR: '/calendar',
  ANNOUNCEMENTS: '/announcements',
  RESOURCES: '/resources',
  VIDEOCONFERENCE: '/videoconference'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};

// Mensajes del sistema
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada correctamente',
    SAVE: 'Guardado exitosamente',
    DELETE: 'Eliminado exitosamente',
    UPDATE: 'Actualizado exitosamente'
  },
  ERROR: {
    LOGIN: 'Error en el inicio de sesión',
    NETWORK: 'Error de conexión',
    UNAUTHORIZED: 'No autorizado',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION: 'Error de validación'
  }
};
