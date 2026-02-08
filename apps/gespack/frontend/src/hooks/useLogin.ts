import { useState } from "react";
// import { API_BASE_URL } from "../config";

interface LoginResponse {
  success: boolean;
  message?: string;
}

export const useLogin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<boolean> => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data: LoginResponse = await response.json();
      if (response.ok && data.success) {
        // No storage: cookie httpOnly ya contiene la sesión
        return true;
      } else {
        setError(data.message || 'Error en login');
        return false;
      }
    } catch (e) {
      setError('No se pudo conectar con el servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  };
};