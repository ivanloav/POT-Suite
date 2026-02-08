import { useState, useEffect, useMemo } from 'react';

const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null; 
  }
  return null;
};

export const useSelectedSite = () => {
  const [siteId, setSiteId] = useState<number>(0);
  const [siteName, setSiteName] = useState<string>('Todos los sites');

  useEffect(() => {
    const updateSite = () => {
      const selectedSite = getCookieValue('selectedSite');
      const newSiteId = selectedSite ? selectedSite : '0';
      const selectedSiteName = getCookieValue('selectedSiteName');
      const newSiteName = selectedSiteName ? decodeURIComponent(selectedSiteName) : (newSiteId === '0' ? 'Todos los sites' : '');
      setSiteId(Number(newSiteId));
      setSiteName(newSiteName);
    };
    updateSite();
    window.addEventListener('siteChanged', updateSite);
    return () => {
      window.removeEventListener('siteChanged', updateSite);
    };
  }, []);

  const selectedSite = useMemo(() => ({ siteId, siteName }), [siteId, siteName]);
  return selectedSite;
};