// Funciones de formateo de datos

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount, currency = 'PEN') => {
  if (amount === null || amount === undefined) return '';
  
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '';
  
  const formatter = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return formatter.format(number);
};

/**
 * Formatea un porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';
  
  const percentage = parseFloat(value);
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formatea el tamaño de archivo
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formatea un código de curso
 */
export const formatCourseCode = (code) => {
  if (!code) return '';
  return code.toUpperCase();
};

/**
 * Formatea un nombre completo
 */
export const formatFullName = (firstName, lastName, maternalSurname) => {
  const parts = [firstName, lastName, maternalSurname].filter(part => part && part.trim());
  return parts.join(' ');
};

/**
 * Formatea las iniciales de un nombre
 */
export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

/**
 * Formatea un número de teléfono
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remover todos los caracteres que no sean números
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según el patrón peruano
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone;
};

/**
 * Formatea un email para mostrar
 */
export const formatEmailForDisplay = (email) => {
  if (!email) return '';
  
  const [username, domain] = email.split('@');
  if (username.length <= 3) {
    return email;
  }
  
  const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
};

/**
 * Formatea el estado de un elemento
 */
export const formatStatus = (status) => {
  const statusMap = {
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'SUSPENDED': 'Suspendido',
    'ENROLLED': 'Inscrito',
    'DROPPED': 'Retirado',
    'COMPLETED': 'Completado',
    'DRAFT': 'Borrador',
    'PUBLISHED': 'Publicado',
    'EXPIRED': 'Expirado',
    'SCHEDULED': 'Programado',
    'LIVE': 'En vivo',
    'ENDED': 'Terminado',
    'CANCELLED': 'Cancelado',
    'SUBMITTED': 'Entregado',
    'GRADED': 'Calificado',
    'LATE': 'Tardío',
    'NOT_STARTED': 'No iniciado',
    'IN_PROGRESS': 'En progreso'
  };
  
  return statusMap[status] || status;
};

/**
 * Formatea el tipo de rol
 */
export const formatRole = (role) => {
  const roleMap = {
    'ADMIN': 'Administrador',
    'INSTRUCTOR': 'Instructor',
    'STUDENT': 'Estudiante',
    'COORDINATOR': 'Coordinador',
    'SUPPORT': 'Soporte'
  };
  
  return roleMap[role] || role;
};

/**
 * Formatea el tipo de recurso
 */
export const formatResourceType = (type) => {
  const typeMap = {
    'PDF': 'Documento PDF',
    'VIDEO': 'Video',
    'LINK': 'Enlace web',
    'DOCUMENT': 'Documento',
    'PRESENTATION': 'Presentación'
  };
  
  return typeMap[type] || type;
};

/**
 * Formatea la prioridad de anuncios
 */
export const formatPriority = (priority) => {
  const priorityMap = {
    'LOW': 'Baja',
    'MEDIUM': 'Media',
    'HIGH': 'Alta',
    'URGENT': 'Urgente'
  };
  
  return priorityMap[priority] || priority;
};

/**
 * Formatea una calificación
 */
export const formatGrade = (grade, maxGrade = 20) => {
  if (grade === null || grade === undefined) return 'Sin calificar';
  
  const numericGrade = parseFloat(grade);
  const numericMaxGrade = parseFloat(maxGrade);
  
  return `${numericGrade.toFixed(1)}/${numericMaxGrade}`;
};

/**
 * Formatea una dirección
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  // Capitalizar cada palabra
  return address
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea un periodo académico
 */
export const formatAcademicPeriod = (period) => {
  if (!period) return '';
  
  // Formato esperado: "2024-1" -> "2024 - I"
  const parts = period.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const semester = parts[1] === '1' ? 'I' : 'II';
    return `${year} - ${semester}`;
  }
  
  return period;
};

/**
 * Formatea duración en minutos a formato legible
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
};

/**
 * Formatea un código de usuario
 */
export const formatUserCode = (code) => {
  if (!code) return '';
  return code.toUpperCase();
};

/**
 * Trunca texto con puntos suspensivos
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
