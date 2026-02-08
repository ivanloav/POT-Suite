// src/components/layout/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resetea el scroll al cambiar de ruta.
 * - Si existe un contenedor con id="main-scroll", resetea ese.
 * - Además fuerza el scroll del window para cubrir cualquier caso.
 */
export default function ScrollToTop({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (el) {
      el.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return <>{children}</>;
}