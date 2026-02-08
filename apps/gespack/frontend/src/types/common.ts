/**
 * Tipos compartidos generales de la aplicación
 */

export interface Site {
  siteId: number;
  siteName: string;
  isActive?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface SelectOption<T = any> {
  value: T;
  label: string;
  [key: string]: any;
}
