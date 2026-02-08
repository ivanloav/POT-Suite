import { useState, useEffect } from 'react';
import { useSelectedSite } from "./useSelectedSite"

interface LastOrderReference {
  siteId: number;
  orderId: number;
  orderReference: string;
}

export const useLastOrderReference = () => {
  const [lastOrderReference, setLastOrderReference] = useState<LastOrderReference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();

  const fetchLastOrderReference = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      //console.log("Fetching last order reference for siteId:", currentSite.siteId);
      const response = await fetch(`/api/orders/last-reference?siteId=${currentSite.siteId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las referencias de pedidos');
      }

      const result = await response.json();
      setLastOrderReference(result.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLastOrderReference(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastOrderReference();
  }, [currentSite.siteId]);

  const searchLastOrderReference = () => {
    fetchLastOrderReference();
  }

  return {
    lastOrderReference,
    loading,
    error,
    searchLastOrderReference,
  };
};