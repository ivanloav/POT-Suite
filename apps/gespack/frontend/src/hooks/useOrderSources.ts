import { useState, useEffect } from 'react';
import { useSelectedSite } from "./useSelectedSite"

interface OrderSource {
  orderSourceId: number;
  sourceName: string;
}

export const useOrderSources = () => {
  const [sources, setSources] = useState<OrderSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();
  
  const fetchSources = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/sources?siteId=${currentSite.siteId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las fuentes');
      }

      const result = await response.json();
      setSources(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [currentSite.siteId]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos
      .trim();
  };

  const localFilterSources = (q: string): OrderSource[] => {
    const term = normalizeText(q);
    return sources.filter(s => {
      const nameMatch = normalizeText(s.sourceName || '').includes(term);
      const idMatch = String(s.orderSourceId).includes(term);
      return nameMatch || idMatch;
    });
  };

  const searchSources = async (searchTerm: string): Promise<OrderSource[]> => {
    if (!currentSite.siteId || currentSite.siteId === 0) return [];
    
    const term = searchTerm.trim();
    if (term.length < 1) return sources; // muestra defaults si no hay término

    // No llamar setLoading(true) para evitar isDisabled=true durante búsqueda
    setError(null);

    // 1) Intenta con el servidor
    try {
      const response = await fetch(`/api/orders/sources?siteId=${currentSite.siteId}&search=${encodeURIComponent(term)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.data) && result.data.length) {
          return result.data;
        }
      }
    } catch (err) {
      console.warn('Error searching sources on server:', err);
    }

    // 2) Fallback: filtro local
    return localFilterSources(term);
  };

  return { sources, loading, error, refetch: fetchSources, searchSources };
};