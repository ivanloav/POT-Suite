/**
 * Constantes globales de la aplicación
 */

// Fuente predeterminada para código de barras/QR
export const DEFAULT_CB_SOURCE = "CORREO";

// Descuento por privilegio (10%)
export const PRIVILEGE_DISCOUNT_RATE = 0.1;

// Tarifa del club
export const CLUB_FEE = 3;

// Timeouts
export const SEARCH_DEBOUNCE_MS = 300;
export const FOCUS_DELAY_MS = 100;
export const BLUR_DELAY_MS = 150;

// Paginación
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Validación
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PHONE_LENGTH = 15;
export const MAX_EMAIL_LENGTH = 100;

// Formato de números
export const DECIMAL_PLACES = 4;
export const CURRENCY_DECIMAL_PLACES = 2;

// Locales soportados
export const SUPPORTED_LOCALES = ['es', 'en', 'fr'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CUSTOMER: 'customer',
} as const;

// Estados de pedido
export const ORDER_STATUS = {
  RECEIVED: 'received',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;
