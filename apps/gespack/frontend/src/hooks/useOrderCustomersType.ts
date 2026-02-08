import { useState, useEffect } from 'react';
import { useSelectedSite } from "./useSelectedSite"

interface OrderCustomerType {
  customerTypeId: number;
  typeCode: number;
  typeName: string;
}

export const useOrderCustomerTypes = () => {
  const [customerTypes, setCustomerTypes] = useState<OrderCustomerType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();

  const fetchCustomers = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/customerTypes?siteId=${currentSite.siteId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las acciones');
      }

      const result = await response.json();
      setCustomerTypes(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCustomerTypes([]);
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

  const localFilterCustomers = (q: string): OrderCustomerType[] => {
    const term = normalizeText(q);
    return customerTypes.filter(c => {
      // Buscar por código de cliente (convertir a string)
      const codeMatch = String(c.typeCode).includes(term);

      // Buscar por nombre (individual)
      const firstNameMatch = normalizeText(c.typeName || '').includes(term);
      
      return codeMatch || firstNameMatch;
    });
  };

  const searchCustomerTypes = async (q: string): Promise<OrderCustomerType[]> => {
    if (!currentSite.siteId || currentSite.siteId === 0) return [];
    const term = q.trim();
    if (term.length < 1) return customerTypes; // muestra defaults si no hay término

    // 1) Intenta con ?search=
    try {
      const r1 = await fetch(`/api/orders/customerTypes?siteId=${currentSite.siteId}&search=${encodeURIComponent(term)}`, {
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
      const r2 = await fetch(`/api/orders/customerTypes?siteId=${currentSite.siteId}&q=${encodeURIComponent(term)}`, {
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

  return { customerTypes, loading, error, refetch: fetchCustomers, searchCustomerTypes };
};