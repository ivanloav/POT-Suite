// frontend/src/api/sites.ts
import { api } from '../services/axiosConfig';

export interface Site {
  siteId: number;
  siteName: string;
}

export async function fetchAllSites(): Promise<Site[]> {
  const { data } = await api.get('/sites');
  return data.data || data;
}
/*
// Mantener compatibilidad con el patrón objeto si lo prefieres
export const sitesService = {
  getAllSites: fetchAllSites, // Alias para compatibilidad
};*/