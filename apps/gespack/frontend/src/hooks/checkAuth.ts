import { SUITE_LOGIN_URL } from "../config";

export const handleLogout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

  } catch {}

  window.location.assign(SUITE_LOGIN_URL);
};
