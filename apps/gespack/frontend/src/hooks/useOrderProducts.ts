// src/hooks/useOrderProducts.ts
import { useEffect, useState } from "react";
import { useSelectedSite } from "./useSelectedSite";
import { fetchProductsBySite, type OrderProduct } from "../api/products";

// Re-exportar para compatibilidad
export type { OrderProduct };

export const useOrderProducts = () => {
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentSite = useSelectedSite();

  const fetchProducts = async () => {
    if (!currentSite.siteId || currentSite.siteId === 0) return;
    setLoading(true);
    setError(null);
    try {
      // Usar la función del API que ya corrige la ruta
      const data = await fetchProductsBySite(currentSite.siteId);
      setProducts(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const localFilter = (q: string) => {
    const t = normalize(q);
    return products.filter(
      p =>
        p.productRef.toLowerCase().includes(t) ||
        normalize(p.description || "").includes(t)
    );
  };

  const searchProducts = async (q: string): Promise<OrderProduct[]> => {
    if (!currentSite.siteId || currentSite.siteId === 0) return [];
    const term = q.trim();
    
    // Si no hay término de búsqueda, devolver todos los productos
    if (!term) return products;

    // 1) server ?search=
    try {
      const r1 = await fetch(
        `/api/orders/products?siteId=${currentSite.siteId}&search=${encodeURIComponent(term)}`,
        { method: "GET", credentials: "include" }
      );
      if (r1.ok) {
        const j1 = await r1.json();
        if (Array.isArray(j1.data) && j1.data.length) return j1.data;
      }
    } catch {}
    // 2) fallback local
    return localFilter(term);
  };

  useEffect(() => { fetchProducts(); }, [currentSite.siteId]);

  return { products, loading, error, refetch: fetchProducts, searchProducts };
};