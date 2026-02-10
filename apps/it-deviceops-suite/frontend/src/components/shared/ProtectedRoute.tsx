import { useAuthStore } from '@/store/authStore';
import { SUITE_LOGIN_URL } from '@/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export default function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthChecked, hasPermission } = useAuthStore();

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = SUITE_LOGIN_URL;
    }
    return null;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
