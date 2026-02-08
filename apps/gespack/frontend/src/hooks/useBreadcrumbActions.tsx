// src/hooks/useBreadcrumbActions.tsx
import { useEffect } from 'react';
import { useBreadcrumbActions } from '../context/BreadcrumbActionsContext';
import { ReactNode } from 'react';
import React from 'react';

export const useSetBreadcrumbActions = (actions: ReactNode) => {
  const { setActions, clearActions } = useBreadcrumbActions();
  const actionsRef = React.useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
    setActions(actionsRef.current);

    // Limpiar cuando el componente se desmonte
    return () => clearActions();
  }, [actions]);
};