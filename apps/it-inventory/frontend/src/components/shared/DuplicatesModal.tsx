import Modal from './Modal';
import { ActionButton } from './ActionButton';

interface DuplicatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicates: any[];
  columns: { key: string; label: string; render?: (item: any) => any }[];
  title?: string;
  message?: string;
}

export default function DuplicatesModal({
  isOpen,
  onClose,
  onConfirm,
  duplicates,
  columns,
  title = 'Duplicados Detectados',
  message = 'Los siguientes registros ya existen en la base de datos. ¿Deseas actualizarlos con los datos del archivo?',
}: DuplicatesModalProps) {
  if (!isOpen || !duplicates || duplicates.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6">
        <p className="text-gray-700 dark:text-gray-300 text-md">
          Se encontraron {duplicates.length} registro{duplicates.length > 1 ? 's' : ''} que ya existe{duplicates.length > 1 ? 'n' : ''} en el sistema.
        </p>

        {/* Contenedor amarillo con scroll */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-md text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
            Registros duplicados:
          </p>
          <ul className="mt-2 text-md text-yellow-700 dark:text-yellow-300 list-disc list-inside max-h-60 overflow-y-auto space-y-1">
            {duplicates.map((item: any, index: number) => {
              // Generar texto resumido del duplicado
              const displayText = columns
                .filter(col => col.key !== 'idExistente') // No mostrar ID en la lista
                .map(col => {
                  const value = col.render ? col.render(item) : item[col.key];
                  return `${col.label}: ${value}`;
                })
                .join(' | ');

              return (
                <li key={index} className="text-sm">
                  {displayText}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-md">
          {message}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <ActionButton variant="cancel" onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton variant="save" onClick={onConfirm}>
            Actualizar Todos
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
