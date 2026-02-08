// frontend/src/api/products.ts
import { api } from "../services/axiosConfig";
/*
export interface Product {
  id?: number;
  name?: string;
  [key: string]: any;
}
*/
export interface OrderProduct {
  productId: string;
  siteId?: string;
  productRef: string;
  description?: string | null;
  price?: string | null;
  weight: number | null;
  vatType?: number; // 1 o 2
  vatValue?: number | string | null; // porcentaje VAT (ej: 21)
}

// ===== CRUD Operations =====

export async function fetchProducts(): Promise<OrderProduct[]> {
  const { data } = await api.get('/orders/products');
  return data;
}

export async function fetchProductsBySite(siteId: number): Promise<OrderProduct[]> {
  const { data } = await api.get(`/orders/products?siteId=${siteId}`);
  return data.data || data; // El backend puede envolver en un objeto "data"
}
/*
export async function createProduct(product: Product): Promise<Product> {
  const { data } = await api.post('/products', product);
  return data;
}

export async function updateProduct(productId: number, updatedData: Product): Promise<Product> {
  const { data } = await api.put(`/products/${productId}`, updatedData);
  return data;
}

export async function deleteProduct(productId: number): Promise<void> {
  await api.delete(`/products/${productId}`);
}

// ===== Inventory =====

export async function fetchInventory(): Promise<any> {
  const { data } = await api.get('/inventory');
  return data;
}*/