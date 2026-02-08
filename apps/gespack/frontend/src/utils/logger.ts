/**
 * Utilidades para logging en desarrollo y producción
 * En producción, los logs están deshabilitados automáticamente
 */

const isDevelopment = import.meta.env.DEV;

export const devLog = {
  /**
   * Log para desarrollo - no aparece en producción
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Error para desarrollo y producción
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Warning para desarrollo y producción
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Info para desarrollo - no aparece en producción
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Debug para desarrollo - no aparece en producción
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
