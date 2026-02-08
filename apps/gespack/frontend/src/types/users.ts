/**
 * Tipos compartidos para usuarios
 */

export interface User {
  userId: number;
  email: string;
  userName?: string | null;
  isCustomer?: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  isCB?: boolean;
  isList?: boolean;
  totalSite?: number;
  sendDailyOrdersReport?: number;
  createdAt?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  locale: string;
  isCustomer: boolean;
  isAdmin: boolean;
  isActive: boolean;
  isCB: boolean;
  isList: boolean;
  isDailyOrdersReport: boolean;
  selectedSites: number[];
}

export interface UserSite {
  userId: number;
  siteId: number;
  siteName?: string;
}
