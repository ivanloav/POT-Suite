/**
 * Utilidades de validación de formularios
 */

/**
 * Valida un email
 * @param email Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida un nombre (no vacío, al menos 2 caracteres)
 * @param name Nombre a validar
 * @returns true si es válido
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

/**
 * Validaciones de seguridad de contraseña
 */
export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

/**
 * Valida una contraseña según requisitos de seguridad
 * @param password Contraseña a validar
 * @returns Objeto con resultados de cada validación
 */
export function validatePassword(password: string): PasswordValidation {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  
  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid
  };
}

/**
 * Valida un formulario de usuario
 * @param formData Datos del formulario
 * @param requirePassword Si la contraseña es obligatoria (true para crear, false para editar)
 * @returns Objeto con errores (vacío si no hay errores)
 */
export function validateUserForm(
  formData: {
    name: string;
    email: string;
    password?: string;
  },
  requirePassword: boolean = true
): { [key: string]: string } {
  const errors: { [key: string]: string } = {};
  
  if (!isValidName(formData.name)) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
  }
  
  if (!formData.email.trim()) {
    errors.email = "El email es requerido";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Email inválido";
  }
  
  if (requirePassword) {
    if (!formData.password?.trim()) {
      errors.password = "La contraseña es requerida";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = "La contraseña no cumple los requisitos de seguridad";
      }
    }
  } else if (formData.password && formData.password.trim()) {
    // Si no es requerida pero se proporciona, validarla
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = "La contraseña no cumple los requisitos de seguridad";
    }
  }
  
  return errors;
}

/**
 * Valida que un campo no esté vacío
 * @param value Valor a validar
 * @param fieldName Nombre del campo para el mensaje de error
 * @returns Mensaje de error o null
 */
export function validateRequired(value: string | number | null | undefined, fieldName: string): string | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${fieldName} es requerido`;
  }
  return null;
}

/**
 * Valida que un número esté en un rango
 * @param value Valor numérico
 * @param min Valor mínimo
 * @param max Valor máximo
 * @param fieldName Nombre del campo para el mensaje de error
 * @returns Mensaje de error o null
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): string | null {
  if (value < min || value > max) {
    return `${fieldName} debe estar entre ${min} y ${max}`;
  }
  return null;
}

/**
 * Valida la longitud de un string
 * @param value String a validar
 * @param minLength Longitud mínima
 * @param maxLength Longitud máxima (opcional)
 * @param fieldName Nombre del campo para el mensaje de error
 * @returns Mensaje de error o null
 */
export function validateLength(
  value: string, 
  minLength: number, 
  maxLength?: number, 
  fieldName: string = 'Campo'
): string | null {
  if (value.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  if (maxLength && value.length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`;
  }
  return null;
}
