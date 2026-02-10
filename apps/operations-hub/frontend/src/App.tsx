import React, { useState } from "react";
import { OperationsHubLogin, AppOption } from "@pot/ui-kit";

const getBaseUrl = (code: string): string => {
  const envMap: Record<string, string | undefined> = {
    gespack: import.meta.env.VITE_APP_GESPACK_URL,
    it: import.meta.env.VITE_APP_IT_URL,
  };
  const envUrl = envMap[code]?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  if (code === "gespack") return "http://localhost:3001";
  if (code === "it") return "http://localhost:5173";
  return "http://localhost:3001";
};

const getDefaultPath = (code: string): string => {
  if (code === "gespack") return "/user/dashboard";
  if (code === "it") return "/sso";
  return "/";
};

const buildAppUrl = (code: string): string => `${getBaseUrl(code)}${getDefaultPath(code)}`;

export function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apps, setApps] = useState<AppOption[]>([]);

  const handleLogin = async (email: string, password: string, appCode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/suite-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        setError(data?.message || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      const list: AppOption[] = data?.data?.apps ?? [];
      
      // Si solo tiene 1 app, redirigir directamente
      if (list.length === 1) {
        window.location.assign(buildAppUrl(list[0].code));
        return;
      }

      // Si tiene múltiples apps
      if (list.length > 1) {
        // Si ya seleccionó una app, redirigir
        if (appCode) {
          window.location.assign(buildAppUrl(appCode));
          return;
        }
        // Si no ha seleccionado, mostrar el select
        setApps(list);
        setLoading(false);
        return;
      }

      // Si no tiene apps
      setError("No tienes aplicaciones asignadas");
      setLoading(false);
    } catch (e) {
      setError("No se pudo conectar con el servidor");
      setLoading(false);
    }
  };

  return (
    <OperationsHubLogin
      onSubmit={handleLogin}
      loading={loading}
      error={error}
      title="Operations Hub"
      subtitle="Accede con tu usuario corporativo"
      apps={apps}
    />
  );
}
