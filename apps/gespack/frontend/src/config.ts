// config.js en el frontend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const BaseImgURL = import.meta.env.VITE_IMG_BASE_URL as string;
export const SUITE_LOGIN_URL =
  (import.meta.env.VITE_SUITE_LOGIN_URL as string) || "http://localhost:3002";
