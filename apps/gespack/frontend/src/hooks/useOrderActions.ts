import { useState, useEffect } from 'react';
import { useSelectedSite } from "./useSelectedSite"

interface OrderAction {
  actionId: number;
  actionName: string;
}

export const useOrderActions = () => {
  const [actions, setActions] = useState<OrderAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();
  
  const fetchActions = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/actions?siteId=${currentSite.siteId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener las acciones');
      }

      const result = await response.json();
      setActions(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [currentSite.siteId]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos
      .trim();
  };

  const localFilterActions = (q: string): OrderAction[] => {
    const term = normalizeText(q);
    return actions.filter(a => {
      const nameMatch = normalizeText(a.actionName || '').includes(term);
      const idMatch = String(a.actionId).includes(term);
      return nameMatch || idMatch;
    });
  };

  const searchActions = async (searchTerm: string): Promise<OrderAction[]> => {
    if (!currentSite.siteId || currentSite.siteId === 0) return [];
    
    const term = searchTerm.trim();
    if (term.length < 1) return actions; // muestra defaults si no hay término
    
    // 1) Intenta con el servidor
    try {
      const response = await fetch(`/api/orders/actions?siteId=${currentSite.siteId}&search=${encodeURIComponent(term)}`, {
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
      console.warn('Error searching actions on server:', err);
    }

    // 2) Fallback: filtro local
    return localFilterActions(term);
  };

  return { actions, loading, error, refetch: fetchActions, searchActions };
};