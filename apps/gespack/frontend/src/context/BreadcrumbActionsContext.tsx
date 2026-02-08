// BreadcrumbActionsContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface BreadcrumbActionsContextType {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
  clearActions: () => void;
}

const BreadcrumbActionsContext = createContext<BreadcrumbActionsContextType | undefined>(undefined);

export const BreadcrumbActionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<ReactNode>(null);

  const clearActions = useCallback(() => setActions(null), []);
  const setActionsCallback = useCallback((newActions: ReactNode) => setActions(newActions), []);

  const value = React.useMemo(() => ({
    actions,
    setActions: setActionsCallback,
    clearActions
  }), [actions, setActionsCallback, clearActions]);

  return (
    <BreadcrumbActionsContext.Provider value={value}>
      {children}
    </BreadcrumbActionsContext.Provider>
  );
};

export const useBreadcrumbActions = () => {
  const context = useContext(BreadcrumbActionsContext);
  if (!context) {
    throw new Error('useBreadcrumbActions must be used within BreadcrumbActionsProvider');
  }
  return context;
};