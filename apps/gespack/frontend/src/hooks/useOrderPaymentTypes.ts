import { useState, useEffect } from 'react';
import { useSelectedSite } from "./useSelectedSite"

import type { PaymentTypeField } from "../components/orders/CreateOrderForm";

export interface OrderPaymentTypes {
  orderPaymentTypeId: number;
  siteId: number;
  paymentType: string;
  description?: string;
  isActive?: boolean;
  fields: PaymentTypeField[];
}

export const useOrderPaymentTypes = () => {
  const [paymentTypes, setPaymentTypes] = useState<OrderPaymentTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();

  const fetchPaymentTypes = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/paymentTypes?siteId=${currentSite.siteId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos de envíos prioritarios');
      }

      const result = await response.json();
      setPaymentTypes(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPaymentTypes([]);
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

  const localFilterPaymentTypes = (q: string): OrderPaymentTypes[] => {
    const term = normalizeText(q);
    return paymentTypes.filter(c => {
      // Buscar por código de cliente (convertir a string)
      const codeMatch = String(c.orderPaymentTypeId).includes(term);

      // Buscar por nombre (individual)
      const firstNameMatch = normalizeText(c.paymentType || '').includes(term);

      return codeMatch || firstNameMatch;
    });
  };

  const searchPaymentTypes = async (q: string): Promise<OrderPaymentTypes[]> => {
    if (!currentSite.siteId || currentSite.siteId === 0) return [];
    const term = q.trim();
    if (term.length < 1) return paymentTypes; // muestra defaults si no hay término

    // 1) Intenta con ?search=
    try {
      const r1 = await fetch(`/api/orders/paymentTypes?siteId=${currentSite.siteId}&search=${encodeURIComponent(term)}`, {
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
      const r2 = await fetch(`/api/orders/paymentTypes?siteId=${currentSite}&q=${encodeURIComponent(term)}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (r2.ok) {
        const j2 = await r2.json();
        if (Array.isArray(j2.data) && j2.data.length) return j2.data;
      }
    } catch {}

    // 3) Fallback: filtra en cliente
    return localFilterPaymentTypes(term);
  };

  useEffect(() => {
    fetchPaymentTypes();
  }, [currentSite.siteId]);

  return { paymentTypes, loading, error, refetch: fetchPaymentTypes, searchPaymentTypes };
};