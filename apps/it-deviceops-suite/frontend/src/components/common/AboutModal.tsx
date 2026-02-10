import Modal from '../shared/Modal';
import packageJson from '../../../package.json';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acerca de"
      size="md"
    >
      <div className="flex flex-col items-center py-6 text-center">
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="IT Inventory Logo" 
          className="h-32 w-32 mb-6"
        />

        {/* App Name & Version */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          IT Inventory
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Versión {packageJson.version}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Sistema de gestión de inventario de activos de TI. 
          Gestiona equipos, asignaciones, empleados y catálogos de hardware de forma centralizada.
        </p>

        {/* Technologies */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full max-w-md mb-8">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Tecnologías utilizadas
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded">React</span>
            <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded">TypeScript</span>
            <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded">NestJS</span>
            <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded">PostgreSQL</span>
            <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded">TailwindCSS</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t dark:border-gray-700 pt-4 w-full">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2026 Iván López Ávila
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Todos los derechos reservados
          </p>
        </div>
      </div>
    </Modal>
  );
}
