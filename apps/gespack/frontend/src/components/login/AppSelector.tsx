import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/axiosConfig";
import "./loginForm.css";
import "./appSelector.css";

type AppInfo = {
  code: string;
  name: string;
};

const getBaseUrl = (code: string): string => {
  const envMap: Record<string, string | undefined> = {
    gespack: import.meta.env.VITE_APP_GESPACK_URL,
    it: import.meta.env.VITE_APP_IT_URL,
  };
  const envUrl = envMap[code]?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  if (code === "gespack") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  if (code === "it") return "http://localhost:5173";
  return typeof window !== "undefined" ? window.location.origin : "";
};

const getDefaultPath = (code: string): string => {
  if (code === "gespack") return "/user/dashboard";
  if (code === "it") return "/sso";
  return "/";
};

const buildAppUrl = (code: string): string => `${getBaseUrl(code)}${getDefaultPath(code)}`;

export function AppSelector() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      try {
        const { data } = await api.get("/auth/apps");
        const list = data?.data?.apps ?? [];
        if (isMounted) setApps(Array.isArray(list) ? list : []);
      } catch (e) {
        if (isMounted) setError("No se pudieron cargar las apps disponibles");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchApps();
    return () => {
      isMounted = false;
    };
  }, []);

  const redirectToApp = (app: AppInfo) => {
    const url = buildAppUrl(app.code);
    const sameOrigin =
      typeof window !== "undefined" &&
      (() => {
        try {
          return new URL(url, window.location.origin).origin === window.location.origin;
        } catch {
          return false;
        }
      })();

    if (sameOrigin) {
      const path = url.replace(window.location.origin, "");
      navigate(path || "/", { replace: true });
      return;
    }
    window.location.assign(url);
  };

  useEffect(() => {
    if (!loading && !error && apps.length === 1) {
      redirectToApp(apps[0]);
    }
  }, [apps, loading, error]);

  return (
    <div className="login-container">
      <div className="login-root app-select-root">
        {loading && (
          <div className="loadingOverlay">
            <div className="spinner"></div>
          </div>
        )}
        <img src="images/GesPack.png" alt="Logo" className="logo" />
        <div className="inputsButtonContainer app-select-card">
          <h1>Selecciona una aplicación</h1>
          <p className="app-select-subtitle">
            Tienes acceso a varias aplicaciones. Elige con cuál quieres entrar.
          </p>

          {error && <p className="app-select-error">{error}</p>}

          {!loading && !error && apps.length === 0 && (
            <p className="app-select-error">No tienes apps asignadas.</p>
          )}

          {!loading && !error && apps.length > 0 && (
            <div className="app-select-grid">
              {apps.map((app) => (
                <button
                  key={app.code}
                  type="button"
                  className="app-select-btn"
                  onClick={() => redirectToApp(app)}
                >
                  <span className="app-select-name">{app.name || app.code}</span>
                  <span className="app-select-code">{app.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
