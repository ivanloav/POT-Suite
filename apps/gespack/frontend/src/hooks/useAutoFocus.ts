import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook para gestionar el foco automático en elementos después del renderizado
 */
export const useAutoFocus = (
  shouldFocus: boolean,
  onFocused: () => void,
  targetRef?: RefObject<HTMLElement>
) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldFocus) return;

    timerRef.current = window.setTimeout(() => {
      if (targetRef?.current) {
        const firstInput = targetRef.current.querySelector<HTMLInputElement>(
          'input, textarea, select'
        );
        if (firstInput) {
          firstInput.focus();
          onFocused();
        }
      }
    }, 100);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [shouldFocus, targetRef, onFocused]);
};
