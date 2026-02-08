
/**
 * Componente modal base reutilizable para mostrar contenido superpuesto en la interfaz.
 * 
 * @param isOpen Indica si el modal está abierto.
 * @param isClosing Indica si el modal está en proceso de cierre (útil para animaciones).
 * @param onClose Función que se ejecuta al cerrar el modal.
 * @param title Título que se muestra en la cabecera del modal.
 * @param children Contenido principal del modal.
 * @param actions Elementos de acción (botones, etc.) que se muestran en el pie del modal.
 * @param className Clases CSS adicionales para personalizar el modal.
 * @param maxWidth Ancho máximo del modal.
 * @param showCloseButton Indica si se muestra el botón de cierre en la cabecera.
 * 
 * Este componente gestiona el cierre al hacer clic fuera del contenido y permite personalización mediante props.
 */
import React, { ReactNode } from "react";
import "./BaseModal.css";

export interface BaseModalProps {
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  //maxWidth?: string;
  showCloseButton?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  isClosing = false,
  onClose,
  title,
  children,
  actions,
  className = "",
  //maxWidth = "800px",
  showCloseButton = true
}) => {
  if (!isOpen && !isClosing) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`base-modal-overlay ${isClosing ? 'closing' : ''} ${className}`} 
      onClick={handleOverlayClick}
    >
      <div 
        className="base-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="base-modal-header">
          <h2>{title}</h2>
          {showCloseButton && (
            <button className="base-modal-close" onClick={onClose} type="button">
              ×
            </button>
          )}
        </div>

        <div className="base-modal-body">
          {children}
        </div>

        {actions && (
          <div className="base-modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};