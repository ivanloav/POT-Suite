import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export const usePageTitle = (): string => {
  const location = useLocation();

  const getTitle = (): string => {
    switch (location.pathname) {
      case "/login":
        return "Iniciar Sesión";
      case "/user/dashboard":
        return "Dashboard";
      case "/user/order-entry":
        return "Grabación de Pedidos";
      case "/user/Products":
        return "Productos";
      case "/user/inventario":
        return "Inventario";
      case "/user/clientes":
        return "Clientes";
      default:
        return "Default Title";
    }
  };

  const title = getTitle();

  useEffect(() => {
    document.title = `${title} - GesPack`;
  }, [title]);

  return title;
};
