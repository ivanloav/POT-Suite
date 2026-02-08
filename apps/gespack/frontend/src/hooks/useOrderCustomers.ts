import { useState, useEffect } from 'react';
import { useSelectedSite } from "./useSelectedSite"

interface OrderCustomer {
  customerId: number;
  customerCode: number;
  customerFirstName: string;
  customerLastName: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddressLine3?: string;
  shippingAddressLine4?: string;
  shippingAddressCp?: string;
  shippingAddressCity?: string;
  phone: string;
  shippingMobilePhone: string;
  email: string;

}

export const useOrderCustomers = () => {
  const [customers, setCustomers] = useState<OrderCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();

  const fetchCustomers = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/customers?siteId=${currentSite.siteId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las acciones');
      }

      const result = await response.json();
      setCustomers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos
      .trim();
  };

  const localFilterCustomers = (q: string): OrderCustomer[] => {
    const term = normalizeText(q);
    return customers.filter(c => {
      // Buscar por código de cliente (convertir a string)
      const codeMatch = String(c.customerCode).includes(term);
      
      // Buscar por nombre (individual)
      const firstNameMatch = normalizeText(c.customerFirstName || '').includes(term);
      
      // Buscar por apellido (individual)
      const lastNameMatch = normalizeText(c.customerLastName || '').includes(term);
      
      // Buscar por nombre completo
      const fullNameMatch = normalizeText(`${c.customerFirstName || ''} ${c.customerLastName || ''}`).includes(term);
      
      // Buscar por apellido + nombre
      const reverseNameMatch = normalizeText(`${c.customerLastName || ''} ${c.customerFirstName || ''}`).includes(term);
      
      return codeMatch || firstNameMatch || lastNameMatch || fullNameMatch || reverseNameMatch;
    });
  };

  const searchCustomers = async (q: string): Promise<OrderCustomer[]> => {
    if (!currentSite.siteId || currentSite.siteId === 0) return [];
    const term = q.trim();
    if (term.length < 1) return customers; // muestra defaults si no hay término

    // 1) Intenta con ?search=
    try {
      const r1 = await fetch(`/api/orders/customers?siteId=${currentSite.siteId}&search=${encodeURIComponent(term)}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (r1.ok) {
        const j1 = await r1.json();
        if (Array.isArray(j1.data) && j1.data.length) return j1.data;
      }
    } catch {}

    // 2) Intenta con ?q=
    try {
      const r2 = await fetch(`/api/orders/customers?siteId=${currentSite.siteId}&q=${encodeURIComponent(term)}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (r2.ok) {
        const j2 = await r2.json();
        if (Array.isArray(j2.data) && j2.data.length) return j2.data;
      }
    } catch {}

    // 3) Fallback: filtra en cliente
    return localFilterCustomers(term);
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentSite.siteId]);

  return { customers, loading, error, refetch: fetchCustomers, searchCustomers };
};