import React from "react";
import { NotesFields } from "./NoteFields";
import { AddressButton } from "./AddressButton";

interface BreadcrumbActionsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  setFieldError: (name: string, msg: string | null) => void;
  t: (key: string, params?: Record<string, any>) => string;
  disabled?: boolean;
  onAddressModalChange?: (isOpen: boolean) => void;
}

export const BreadcrumbActions: React.FC<BreadcrumbActionsProps> = ({
  formData,
  setFormData,
  setFieldError,
  t,
  disabled = false,
  onAddressModalChange,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <NotesFields
        formData={formData}
        setFormData={setFormData}
        setFieldError={setFieldError}
        t={t}
        disabled={disabled}
      />
      <AddressButton
        formData={formData}
        setFormData={setFormData}
        t={t}
        disabled={disabled}
        onModalChange={onAddressModalChange}
      />
    </div>
  );
};
