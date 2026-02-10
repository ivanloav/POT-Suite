import { useEffect } from 'react';
import { SUITE_LOGIN_URL } from '@/config';

export default function Login() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.assign(SUITE_LOGIN_URL);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Redirigiendo al portal
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Espera un momento...
        </p>
      </div>
    </div>
  );
}
