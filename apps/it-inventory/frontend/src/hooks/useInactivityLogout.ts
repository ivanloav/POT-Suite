import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos

export function useInactivityLogout(onLogout: () => void) {
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    // Iniciar el timer
    resetTimer();

    // Agregar listeners para todos los eventos
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [onLogout]);
}
