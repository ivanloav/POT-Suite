// frontend/src/api/orders.ts
import { api } from "../services/axiosConfig";

export type Order = {
  id?: number;
  status?: string;
  [key: string]: any;
};

export type OrderStatus = "received" | "processing" | "shipped" | "delivered";

export type OrderStatistics = {
  received: number;
  processing: number;
  shipped: number;
  delivered: number;
  labels: string[];
};

// ===== CRUD Operations =====

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await api.get('/orders');
  return data;
}

export async function fetchOrderById(orderId: number): Promise<Order> {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
}

export async function fetchLastOrderReference(siteId: number, prefix: string): Promise<string | null> {
  const { data } = await api.get(`/orders/last-reference`, {
    params: { siteId, prefix }
  });
  return data;
}

export async function createOrder(order: Order & { scannedDocument?: File, siteName?: string, section?: string }): Promise<Order> {
  // Si hay un documento escaneado, usar FormData
  if (order.scannedDocument) {
    const formData = new FormData();
    
    if (order.siteName) formData.append('siteName', order.siteName);
    if (order.section) formData.append('section', order.section);

    Object.entries(order).forEach(([key, value]) => {
      if (key !== 'scannedDocument' && key !== 'siteName' && key !== 'section' && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    // Agregar el archivo
    formData.append('scannedDocument', order.scannedDocument);
    console.log('Archivo a enviar:', order.scannedDocument);
    const { data } = await api.post('/orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } else {
    const cleanOrder = {
      ...order,
      siteId: Number(order.siteId),
      actionId: Number(order.actionId),
      orderReference: typeof order.orderReference === 'string' ? order.orderReference : '',
      status: order.status || 'pending', // valor por defecto si no se asigna
    };
    // Si no hay archivo, usar el método normal
    const { data } = await api.post('/orders', cleanOrder);
    return data;
  }
}

export async function updateOrder(orderId: number, orderData: Order): Promise<Order> {
  const { data } = await api.put(`/orders/${orderId}`, orderData);
  return data;
}

export async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
  const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
  return data;
}

export async function deleteOrder(orderId: number): Promise<void> {
  await api.delete(`/orders/${orderId}`);
}

// ===== Statistics =====

export async function fetchOrdersStatistics(): Promise<OrderStatistics> {
  const orders = await fetchOrders();

  return {
    received: orders.filter(order => order.status === "received").length,
    processing: orders.filter(order => order.status === "processing").length,
    shipped: orders.filter(order => order.status === "shipped").length,
    delivered: orders.filter(order => order.status === "delivered").length,
    labels: ["Recibidos", "En proceso", "Enviados", "Entregados"],
  };
}