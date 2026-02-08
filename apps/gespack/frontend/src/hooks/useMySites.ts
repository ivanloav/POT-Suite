// src/hooks/useMySites.ts
import { useEffect, useState } from 'react';

export type MySite = { siteId: number; siteName: string };

export function useMySites() {
  const [data, setData] = useState<MySite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/sites/my', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Convertir siteId a number
        const sites = (json.data ?? []).map((site: any) => ({
          ...site,
          siteId: Number(site.siteId)
        }));
        if (!cancelled) setData(sites);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}