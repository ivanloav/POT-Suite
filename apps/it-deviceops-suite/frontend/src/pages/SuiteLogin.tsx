import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { SUITE_LOGIN_URL } from '@/config';

export default function SuiteLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runSuiteLogin = async () => {
      try {
        const response = await authService.suiteLogin();
        if (!isMounted) return;
        setAuth(response.user as any, response.token);
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        if (!isMounted) return;
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'No se pudo iniciar sesión';
        toast.error(errorMessage);
        window.location.href = SUITE_LOGIN_URL;
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    runSuiteLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Accediendo a IT Inventory
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? 'Validando sesión...' : 'Redirigiendo...'}
        </p>
      </div>
    </div>
  );
}
