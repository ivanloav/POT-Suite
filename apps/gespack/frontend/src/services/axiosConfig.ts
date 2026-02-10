// frontend/src/services/axiosConfig.ts - VERSIÓN ESPECÍFICA
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { API_BASE_URL, SUITE_LOGIN_URL } from "../config";

const resolvedBaseURL =
  API_BASE_URL && API_BASE_URL.trim().length > 0
    ? API_BASE_URL
    : (typeof window !== "undefined" ? `${window.location.origin}/api` : "/api");

// 👈 FUNCIÓN más específica para tus cookies
const clearAuthCookies = () => {
  if (typeof document !== "undefined") {
    // Obtener el dominio actual para limpiar correctamente
    const domain = window.location.hostname;
    
    // Limpiar selectedSite (ajusta el nombre exacto)
    document.cookie = `selectedSite=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    
    // Limpiar otras cookies de autenticación que uses
    document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    //document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    //document.cookie = `session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  }
};

export const api: AxiosInstance = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Limpiar todas las cookies de autenticación
      clearAuthCookies();
      
      // Redirigir a login si no estamos ya ahí
      if (typeof window !== "undefined" && !window.location.href.includes(SUITE_LOGIN_URL)) {
        window.location.href = SUITE_LOGIN_URL;
      }
    }
    return Promise.reject(error);
  }
);
