import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SiteContextType = {
  siteId: string;
  siteName: string;
  setSiteId: (id: string, name?: string) => void;
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteId, setSiteIdState] = useState<string>('0');
  const [siteName, setSiteName] = useState<string>('Todos los sites');

  const setSiteId = (id: string, name?: string) => {
    setSiteIdState(id);
    document.cookie = `selectedSite=${id}; path=/`;
    if (name !== undefined) {
      setSiteName(name);
      document.cookie = `selectedSiteName=${encodeURIComponent(name)}; path=/`;
    } else if (id === '0') {
      setSiteName('Todos los sites');
      document.cookie = `selectedSiteName=Todos%20los%20sites; path=/`;
    }
    // Forzar actualización inmediata del estado local
    // Esto asegura que el contexto refleje el cambio sin esperar al efecto
    setSiteIdState(id);
    setSiteName(name ?? (id === '0' ? 'Todos los sites' : ''));
  };

  useEffect(() => {
    const matchId = document.cookie.match(/(^| )selectedSite=([^;]+)/);
    const matchName = document.cookie.match(/(^| )selectedSiteName=([^;]+)/);
    if (matchId) {
      setSiteIdState(matchId[2]);
    } else {
      setSiteIdState('0');
      document.cookie = "selectedSite=0; path=/";
    }
    if (matchName) {
      setSiteName(decodeURIComponent(matchName[2]));
    } else {
      setSiteName('Todos los sites');
    }
  }, []);

  const value = useMemo(() => ({ siteId, siteName, setSiteId }), [siteId, siteName]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within <SiteProvider>');
  return ctx;
};