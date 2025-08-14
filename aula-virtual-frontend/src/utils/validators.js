// Funciones de validación

/**
 * Valida si un campo es requerido
 */
export const required = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Este campo es requerido';
  }
  return null;
};

/**
 * Valida email
 */
export const validateEmail = (email) => {
  if (!email) return 'El email es requerido';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Ingrese un email válido';
  }
  return null;
};

/**
 * Valida contraseña
 */
export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  
  if (password.length > 50) {
    return 'La contraseña no puede tener más de 50 caracteres';
  }
  
  return null;
};

/**
 * Valida confirmación de contraseña
 */
export const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation) return 'Confirme la contraseña';
  
  if (password !== confirmation) {
    return 'Las contraseñas no coinciden';
  }
  
  return null;
};

/**
 * Valida nombre de usuario
 */
export const validateUsername = (username) => {
  if (!username) return 'El nombre de usuario es requerido';
  
  if (username.length < 3) {
    return 'El nombre de usuario debe tener al menos 3 caracteres';
  }
  
  if (username.length > 20) {
    return 'El nombre de usuario no puede tener más de 20 caracteres';
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
  }
  
  return null;
};

/**
 * Valida nombre
 */
export const validateName = (name, fieldName = 'nombre') => {
  if (!name) return `El ${fieldName} es requerido`;
  
  if (name.length < 2) {
    return `El ${fieldName} debe tener al menos 2 caracteres`;
  }
  
  if (name.length > 50) {
    return `El ${fieldName} no puede tener más de 50 caracteres`;
  }
  
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nameRegex.test(name)) {
    return `El ${fieldName} solo puede contener letras y espacios`;
  }
  
  return null;
};

/**
 * Valida teléfono
 */
export const validatePhone = (phone) => {
  if (!phone) return null; // Opcional
  
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Ingrese un número de teléfono válido';
  }
  
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length < 9 || digits.length > 15) {
    return 'El teléfono debe tener entre 9 y 15 dígitos';
  }
  
  return null;
};

/**
 * Valida código de curso
 */
export const validateCourseCode = (code) => {
  if (!code) return 'El código del curso es requerido';
  
  if (code.length < 3) {
    return 'El código debe tener al menos 3 caracteres';
  }
  
  if (code.length > 20) {
    return 'El código no puede tener más de 20 caracteres';
  }
  
  const codeRegex = /^[A-Z0-9]+$/;
  if (!codeRegex.test(code.toUpperCase())) {
    return 'El código solo puede contener letras y números';
  }
  
  return null;
};

/**
 * Valida fecha
 */
export const validateDate = (date, fieldName = 'fecha') => {
  if (!date) return `La ${fieldName} es requerida`;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Ingrese una ${fieldName} válida`;
  }
  
  return null;
};

/**
 * Valida que una fecha sea futura
 */
export const validateFutureDate = (date, fieldName = 'fecha') => {
  const dateValidation = validateDate(date, fieldName);
  if (dateValidation) return dateValidation;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return `La ${fieldName} debe ser futura`;
  }
  
  return null;
};

/**
 * Valida URL
 */
export const validateUrl = (url) => {
  if (!url) return null; // Opcional
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Ingrese una URL válida';
  }
};

/**
 * Valida archivo
 */
export const validateFile = (file, maxSize = 10485760, allowedTypes = []) => {
  if (!file) return 'Seleccione un archivo';
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1048576);
    return `El archivo no puede ser mayor a ${maxSizeMB}MB`;
  }
  
  if (allowedTypes.length > 0) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `Solo se permiten archivos: ${allowedTypes.join(', ')}`;
    }
  }
  
  return null;
};

/**
 * Valida número
 */
export const validateNumber = (value, min, max, fieldName = 'valor') => {
  if (value === null || value === undefined || value === '') {
    return `El ${fieldName} es requerido`;
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `Ingrese un ${fieldName} válido`;
  }
  
  if (min !== undefined && num < min) {
    return `El ${fieldName} debe ser mayor o igual a ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `El ${fieldName} debe ser menor o igual a ${max}`;
  }
  
  return null;
};

/**
 * Valida longitud de texto
 */
export const validateLength = (value, min, max, fieldName = 'texto') => {
  if (!value) return `El ${fieldName} es requerido`;
  
  if (value.length < min) {
    return `El ${fieldName} debe tener al menos ${min} caracteres`;
  }
  
  if (value.length > max) {
    return `El ${fieldName} no puede tener más de ${max} caracteres`;
  }
  
  return null;
};

/**
 * Valida que un valor esté en una lista
 */
export const validateInList = (value, list, fieldName = 'valor') => {
  if (!value) return `El ${fieldName} es requerido`;
  
  if (!list.includes(value)) {
    return `El ${fieldName} no es válido`;
  }
  
  return null;
};
