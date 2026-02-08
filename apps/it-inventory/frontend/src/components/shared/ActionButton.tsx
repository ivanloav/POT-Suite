import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export type ActionButtonVariant = 
  | 'create'      // Verde - Crear/Nuevo
  | 'export'      // Verde - Exportar
  | 'import'      // Naranja - Importar
  | 'template'    // Púrpura - Plantilla
  | 'refresh'     // Azul - Refrescar
  | 'save'        // Azul - Guardar
  | 'cancel'      // Gris - Cancelar
  | 'delete'      // Rojo - Eliminar
  | 'edit'        // Amarillo - Editar
  | 'primary';    // Azul primario - Acción principal

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ActionButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ActionButtonVariant, string> = {
  create: 'btn btn-secondary flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  export: 'btn btn-secondary flex items-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
  import: 'btn btn-secondary flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  template: 'btn btn-secondary flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  refresh: 'btn btn-secondary flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  save: 'btn btn-secondary flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  cancel: 'btn btn-secondary flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  delete: 'btn btn-secondary flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  edit: 'btn btn-secondary flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  primary: 'btn btn-primary flex items-center gap-2'
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ variant, icon: Icon, loading, loadingText, children, className, disabled, ...props }, ref) => {
    const baseStyles = variantStyles[variant];
    const combinedClassName = className ? `${baseStyles} ${className}` : baseStyles;

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {Icon && <Icon className="h-5 w-5" />}
        {loading ? loadingText : children}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';
