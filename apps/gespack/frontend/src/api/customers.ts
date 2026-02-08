// frontend/src/api/customers.ts
import { api } from "../services/axiosConfig";

export interface Customer {
  id?: number;
  name?: string;
  [key: string]: any;
}

// ===== Customer Operations =====

export async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await api.get('/customers');
  return data;
}

// ===== Dashboard Data (mover a dashboard.ts si prefieres) =====

export async function fetchTopProducts(): Promise<any> {
  const { data } = await api.get('/dashboard/top-products');
  return data;
}

export async function fetchSalesData(): Promise<any> {
  const { data } = await api.get('/dashboard/sales-data');
  return data;
}