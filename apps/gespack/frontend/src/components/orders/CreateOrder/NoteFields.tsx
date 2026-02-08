import React, { useState } from "react";
import "./NoteFields.css";

interface NotesFieldsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  setFieldError: (name: string, msg: string | null) => void;
  t: (key: string, params?: Record<string, any>) => string;
  disabled?: boolean;
}

export const NotesFields: React.FC<NotesFieldsProps> = ({
  formData,
  setFormData,
  setFieldError,
  t,
  disabled = false,
}) => {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [tempNotesData, setTempNotesData] = useState({
    internalNotes: formData.internalNotes || "",
    externalNotes: formData.externalNotes || "",
  });

  // Verificar si hay observaciones configuradas
  const hasNotes = !!(formData.internalNotes || formData.externalNotes);
  
  // Contador de caracteres para mostrar en tiempo real
  const getCharacterCount = (type: 'internal' | 'external') => {
    const text = tempNotesData[type === 'internal' ? 'internalNotes' : 'externalNotes'];
    const maxLength = type === 'internal' ? 255 : 100;
    return `${text.length}/${maxLength}`;
  };

  const handleOpenModal = () => {
    // Inicializar datos temporales con valores actuales
    setTempNotesData({
      internalNotes: formData.internalNotes || "",
      externalNotes: formData.externalNotes || "",
    });
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = () => {
    // Guardar datos en el formulario principal
    setFormData({
      ...formData,
      internalNotes: tempNotesData.internalNotes.trim(),
      externalNotes: tempNotesData.externalNotes.trim(),
    });
    
    // Limpiar errores si hay contenido
    if (tempNotesData.internalNotes.trim()) {
      setFieldError("internalNotes", null);
    }
    if (tempNotesData.externalNotes.trim()) {
      setFieldError("externalNotes", null);
    }
    
    setIsNotesModalOpen(false);
  };

  const handleInputChange = (type: 'internal' | 'external', value: string) => {
    const maxLength = type === 'internal' ? 255 : 100;
    
    // Limitar caracteres
    if (value.length <= maxLength) {
      setTempNotesData(prev => ({
        ...prev,
        [type === 'internal' ? 'internalNotes' : 'externalNotes']: value
      }));
    }
  };

  return (
    <div>
      <div className="notes-field-container" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          className={`notes-button${hasNotes ? ' notes-button--has-content' : ''}`}
          onClick={handleOpenModal}
          disabled={disabled}
        >
          <span style={{ fontSize: "14px" }}>📝</span>
          {hasNotes 
            ? `✓ ${t("orderForm.notes.hasNotes")}` 
            : t("orderForm.notes.addNotes")
          }
        </button>
      </div>
      {/* Modal para observaciones */}
      {isNotesModalOpen && (
        <div className="notes-modal-overlay">
          <div className="notes-modal-content">
            <div className="notes-modal-header">
              <h2>{t("orderForm.notes.modalTitle")}</h2>
              <button className="notes-modal-close" onClick={() => setIsNotesModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="notes-modal-tabs">
              <button
                className={`notes-tab ${activeTab === 'internal' ? 'active' : ''}`}
                onClick={() => setActiveTab('internal')}
              >
                📋 {t("orderForm.notes.internal")} (255)
              </button>
              <button
                className={`notes-tab ${activeTab === 'external' ? 'active' : ''}`}
                onClick={() => setActiveTab('external')}
              >
                👁️ {t("orderForm.notes.external")} (100)
              </button>
            </div>

            <div className="notes-modal-body">
              {activeTab === 'internal' && (
                <div className="notes-form-group">
                  <label>{t("orderForm.notes.internalLabel")}</label>
                  <textarea
                    value={tempNotesData.internalNotes}
                    onChange={(e) => handleInputChange('internal', e.target.value)}
                    placeholder={t("orderForm.notes.internalPlaceholder")}
                  />
                  <div className={`notes-character-count ${tempNotesData.internalNotes.length > 240 ? 'warning' : ''}`}>
                    {getCharacterCount('internal')}
                  </div>
                </div>
              )}
              {activeTab === 'external' && (
                <div className="notes-form-group">
                  <label>{t("orderForm.notes.externalLabel")}</label>
                  <textarea
                    value={tempNotesData.externalNotes}
                    onChange={(e) => handleInputChange('external', e.target.value)}
                    placeholder={t("orderForm.notes.externalPlaceholder")}
                  />
                  <div className={`notes-character-count ${tempNotesData.externalNotes.length > 85 ? 'warning' : ''}`}>
                    {getCharacterCount('external')}
                  </div>
                </div>
              )}
            </div>

            <div className="notes-modal-footer">
              <button className="notes-btn-cancel" onClick={() => setIsNotesModalOpen(false)}>
                {t("actions.cancel")}
              </button>
              <button className="notes-btn-save" onClick={handleSaveNotes}>
                {t("actions.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
