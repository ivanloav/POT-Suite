import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  forceSidebarCollapse: boolean;
  setForceSidebarCollapse: (collapse: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [forceSidebarCollapse, setForceSidebarCollapse] = useState(false);

  return (
    <SidebarContext.Provider value={{ forceSidebarCollapse, setForceSidebarCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};