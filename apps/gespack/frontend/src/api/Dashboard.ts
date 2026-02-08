// frontend/src/api/Dashboard.ts - AÑADIR MÁS LOGS
import { api } from "../services/axiosConfig";

export type KpisResponse = {
  ordersPendingInvoicing: number;
  productsPendingInvoicing: number;
  productsOutOfStock: number;
  ordersRecorded: number;
  ordersPendingPayment: number;
  ordersInvoiced: number;
};

export async function fetchDashboardKpis(siteId: number): Promise<KpisResponse> {
  const { data } = await api.get('/dashboard/kpis', {
    headers: {
      'x-site-id': String(siteId ?? 0),
    }
  });
  
  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta inválida del servidor');
  }
  
  return data.data as KpisResponse;
}

// ===== Dashboard Config =====
export interface DashboardConfig {
  cardOrder: string[];
}

export const fetchDashboardConfig = async (siteId: number): Promise<DashboardConfig> => {
  try {
    const { data } = await api.get('/dashboard/config', {
      params: { site_id: siteId }
    });
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const saveDashboardConfig = async (siteId: number, cardOrder: string[]): Promise<void> => {
  try {
    const { data } = await api.post('/dashboard/config', {
      site_id: siteId,
      card_order: cardOrder
    });
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const resetDashboardConfig = async (siteId: number): Promise<void> => {
  try {
    const { data } = await api.delete('/dashboard/config', {
      params: { site_id: siteId }
    });
    
    return data;
  } catch (error) {
    throw error;
  }
};

// ===== Otras funciones =====
export async function fetchDashboardData(): Promise<any> {
  const { data } = await api.get('/dashboard');
  return data;
}

export async function fetchTopProducts(): Promise<any> {
  const { data } = await api.get('/dashboard/top-products');
  return data;
}

export async function fetchSalesData(): Promise<any> {
  const { data } = await api.get('/dashboard/sales-data');
  return data;
}