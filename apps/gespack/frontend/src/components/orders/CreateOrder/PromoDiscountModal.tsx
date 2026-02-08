import "./PromoDiscountModal.css";
import React from "react";

interface PromoDiscountModalProps {
  open: boolean;
  step: 'ask' | 'input';
  input: string;
  onClose: () => void;
  onStepChange: (step: 'ask' | 'input') => void;
  onInputChange: (value: string) => void;
  onDiscountChange?: (discount: number) => void; // Nuevo callback para actualizar en tiempo real
  onApply: (discount: number) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

export const PromoDiscountModal: React.FC<PromoDiscountModalProps> = ({
  open,
  step,
  input,
  onClose,
  onStepChange,
  onInputChange,
  onDiscountChange,
  onApply,
  t,
}) => {
  if (!open) return null;

  return (
    <div 
      className="promo-modal-overlay"
      onClick={(e) => {
        // Bloquear clicks fuera del modal, pero NO cerrar
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // Bloquear mousedown también (para inputs y dropdowns)
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div 
        className="promo-modal-content"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="promo-modal-body">
          {step === 'ask' ? (
            <div
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onStepChange('input');
                } else if (e.key === 'Escape' || e.key.toLowerCase() === 'n') {
                  onClose();
                } else if (e.key.toLowerCase() === 's') {
                  onStepChange('input');
                }
              }}
            >
              <h3 className="promo-modal-title">
                {t("orderForm.promotionsModal.firstModalTitle")}
              </h3>
              <p className="promo-modal-text">
                {t("orderForm.promotionsModal.firstModalText")}
              </p>
              <div className="promo-modal-buttons">
                <button
                  type="button"
                  className="promo-modal-btn promo-modal-btn-secondary"
                  onClick={onClose}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onClose();
                    }
                  }}
                >
                  <u>{t("orderForm.promotionsModal.initialNo")}</u>{t("orderForm.promotionsModal.restNo")}
                </button>
                <button
                  type="button"
                  className="promo-modal-btn promo-modal-btn-primary"
                  ref={(el) => {
                    if (el && step === 'ask') {
                      setTimeout(() => el.focus(), 50);
                    }
                  }}
                  onClick={() => onStepChange('input')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onStepChange('input');
                    }
                  }}
                >
                  <u>{t("orderForm.promotionsModal.initialYes")}</u>{t("orderForm.promotionsModal.restYes")}
                </button>
              </div>
            </div>
          ) : (
            <div
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  onApply(Number(input) || 0);
                } else if (e.key === 'Escape') {
                  onStepChange('ask');
                  onInputChange("");
                }
              }}
            >
              <h3 className="promo-modal-title">
                {t("orderForm.promotionsModal.secondModalTitle")}
              </h3>
              <p className="promo-modal-text-small">
                {t("orderForm.promotionsModal.secondModalText")}
              </p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={input}
                onChange={(e) => {
                  const value = e.target.value;
                  onInputChange(value);
                  // Actualizar el descuento en tiempo real sin cerrar el modal
                  if (onDiscountChange) {
                    onDiscountChange(Number(value) || 0);
                  }
                }}
                placeholder="0.00"
                className="promo-modal-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onApply(Number(input) || 0);
                  }
                }}
              />
              <div className="promo-modal-buttons">
                <button
                  type="button"
                  className="promo-modal-btn promo-modal-btn-secondary"
                  onClick={() => {
                    onStepChange('ask');
                    onInputChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onStepChange('ask');
                      onInputChange("");
                    }
                  }}
                >
                  {t("orderForm.promotionsModal.return")}
                </button>
                <button
                  type="button"
                  className="promo-modal-btn promo-modal-btn-primary"
                  onClick={() => onApply(Number(input) || 0)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onApply(Number(input) || 0);
                    }
                  }}
                >
                  {t("orderForm.promotionsModal.apply")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
