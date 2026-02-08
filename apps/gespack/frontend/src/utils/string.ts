/**
 * Utilidades para trabajar con strings
 */

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte un string a formato título (primera letra de cada palabra en mayúscula)
 */
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Trunca un string a una longitud máxima añadiendo puntos suspensivos
 */
export const truncate = (str: string, maxLength: number, suffix = '...'): string => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Elimina espacios en blanco al inicio y final, y múltiples espacios internos
 */
export const normalizeWhitespace = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Convierte un string a slug (URL-friendly)
 */
export const slugify = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-'); // Elimina guiones múltiples
};

/**
 * Verifica si un string contiene otro string (case insensitive)
 */
export const includesIgnoreCase = (str: string, search: string): boolean => {
  return str.toLowerCase().includes(search.toLowerCase());
};

/**
 * Genera un string aleatorio de longitud especificada
 */
export const randomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};

/**
 * Formatea un número como string con padding de ceros
 */
export const padNumber = (num: number, length: number): string => {
  return String(num).padStart(length, '0');
};

/**
 * Extrae iniciales de un nombre completo
 */
export const getInitials = (name: string, maxLength = 2): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .substring(0, maxLength)
    .toUpperCase();
};
