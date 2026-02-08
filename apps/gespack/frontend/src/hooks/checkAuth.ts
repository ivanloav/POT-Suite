import { NavigateFunction } from "react-router-dom";

export const handleLogout = async (navigate: NavigateFunction): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

  } catch {}

  navigate("/login", { state: { successMessage: "Sesión cerrada correctamente" } });
  window.location.reload();
};