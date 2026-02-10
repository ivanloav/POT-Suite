import React, { useState } from "react";

export type AppOption = {
  code: string;
  name: string;
};

export type OperationsHubLoginProps = {
  onSubmit: (email: string, password: string, appCode?: string) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  buttonLabel?: string;
  apps?: AppOption[];
  onAppChange?: (appCode: string) => void;
};

export function OperationsHubLogin({
  onSubmit,
  loading = false,
  error,
  title = "Operations Hub",
  subtitle = "Inicia sesión para continuar",
  logoSrc,
  buttonLabel = "Iniciar sesión",
  apps = [],
  onAppChange,
}: OperationsHubLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  const hasMultipleApps = apps.length > 1;
  const selectedAppName = apps.find(app => app.code === selectedApp)?.name;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setLocalError("Email y contraseña son obligatorios");
      return;
    }

    if (hasMultipleApps && !selectedApp) {
      setLocalError("Por favor selecciona una aplicación");
      return;
    }

    await onSubmit(trimmedEmail, password, selectedApp || undefined);
  };

  const handleAppChange = (appCode: string) => {
    setSelectedApp(appCode);
    onAppChange?.(appCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        {logoSrc ? (
          <div className="flex justify-center mb-8">
            <img 
              className="h-16 w-auto" 
              src={logoSrc} 
              alt="Operations Hub" 
            />
          </div>
        ) : null}
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" 
                  htmlFor="pot-login-email"
                >
                  Email
                </label>
                <input
                  id="pot-login-email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" 
                  htmlFor="pot-login-password"
                >
                  Contraseña
                </label>
                <input
                  id="pot-login-password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                />
              </div>

              {hasMultipleApps && (
                <div className="pt-2 animate-fadeIn">
                  <label 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" 
                    htmlFor="pot-login-app"
                  >
                    Aplicación
                  </label>
                  <select
                    id="pot-login-app"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-50 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                    value={selectedApp}
                    onChange={(e) => handleAppChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Selecciona una aplicación</option>
                    {apps.map((app) => (
                      <option key={app.code} value={app.code}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(error || localError) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                    {error || localError}
                  </p>
                </div>
              )}

              <button 
                className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:shadow-none" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : hasMultipleApps && selectedAppName ? (
                  `Acceder a ${selectedAppName}`
                ) : (
                  buttonLabel
                )}
              </button>
            </form>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Operations Hub. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
