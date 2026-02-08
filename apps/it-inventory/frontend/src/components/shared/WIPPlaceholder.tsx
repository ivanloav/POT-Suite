import { AlertTriangle } from 'lucide-react';

export default function WIPPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2 text-yellow-700">🚧 Página en desarrollo</h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md">
        Esta sección está en construcción. Pronto estará disponible con todas sus funcionalidades.
      </p>
    </div>
  );
}
