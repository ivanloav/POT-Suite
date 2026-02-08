/**
 * Componente que representa un campo de formulario con etiqueta, contenido, indicador de requerido y mensaje de error.
 *
 * @param label - Etiqueta descriptiva del campo.
 * @param children - Elementos hijos que representan el contenido del campo (por ejemplo, un input).
 * @param required - Indica si el campo es obligatorio.
 * @param error - Mensaje de error asociado al campo.
 * @param className - Clases CSS adicionales para personalizar el estilo del campo.
 */
 
/**
 * Componente que representa un formulario base, permitiendo personalizar el contenido y manejar el evento de envío.
 *
 * @param onSubmit - Función que se ejecuta al enviar el formulario.
 * @param children - Elementos hijos que representan los campos y contenido del formulario.
 * @param className - Clases CSS adicionales para personalizar el estilo del formulario.
 */
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "./BaseForm.css";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  required = false,
  error,
  className = ""
}) => {
  return (
    <div className={`base-form-group ${className} ${error ? 'error' : ''}`}>
      <label className="base-form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="base-form-input-wrapper">
        {children}
        {error && <span className="base-form-error">{error}</span>}
      </div>
    </div>
  );
};

export interface BaseFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
}

export const BaseForm: React.FC<BaseFormProps> = ({
  onSubmit,
  children,
  className = ""
}) => {
  return (
    <form 
      className={`base-form ${className}`} 
      onSubmit={onSubmit}
      noValidate
    >
      {children}
    </form>
  );
};

export interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
  className = "",
  disabled = false
}) => {
  return (
    <div className={`base-checkbox-field ${className}`}>
      <label className="base-checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="base-checkbox-input"
        />
        <span className="base-checkbox-text">{label}</span>
      </label>
    </div>
  );
};

// 👈 NUEVO: SelectField  
export interface SelectOption {
  value: string | number | boolean;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  className = "",
  placeholder = "Selecciona una opción..."
}) => {
  return (
    <FormField 
      label={label} 
      required={required} 
      error={error}
      className={`select-field ${className}`}
    >
      <select
        value={String(value)}
        onChange={(e) => {
          const option = options.find(opt => String(opt.value) === e.target.value);
          if (option) {
            onChange(option.value);
          }
        }}
        required={required}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option 
            key={index} 
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

// 👈 NUEVO: BooleanSelectField (Sí/No específico)
export interface BooleanSelectFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
  error?: string;
  className?: string;
  trueLabel?: string;
  falseLabel?: string;
  placeholder?: string;
}

export const BooleanSelectField: React.FC<BooleanSelectFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  className = "",
  trueLabel = "Sí",
  falseLabel = "No",
  placeholder = "Selecciona..."
}) => {
  const options: SelectOption[] = [
    { value: true, label: trueLabel },
    { value: false, label: falseLabel }
  ];

  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      error={error}
      className={`boolean-select ${className}`}
      placeholder={placeholder}
    />
  );
};

export interface MultiSelectOption {
  value: number;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectFieldProps {
  label: string;
  selectedValues: number[];
  onChange: (selectedValues: number[]) => void;
  options: MultiSelectOption[];
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  size?: number; // Número de líneas visibles
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  selectedValues,
  onChange,
  options,
  required = false,
  error,
  className = "",
  placeholder,
  size = 6
}) => {
  const { t } = useTranslation("common");

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const values = selectedOptions.map(option => Number(option.value));
    onChange(values);
  };

  return (
    <FormField 
      label={label} 
      required={required} 
      error={error}
      className={`multi-select-field ${className}`}
    >
      <div className="multi-select-wrapper">
        <select
          multiple
          value={selectedValues.map(String)}
          onChange={handleSelectionChange}
          className="multi-select-input"
          size={Math.min(options.length, size)}
          required={required}
        >
          {options.length === 0 && (
            <option disabled>
              {placeholder || t("multiSelect.noOptions", { 
                defaultValue: "Sin opciones disponibles" 
              })}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {selectedValues.length > 0 && (
          <div className="multi-select-info">
            {t("multiSelect.selectedItems", { 
              count: selectedValues.length,
              defaultValue: "{{count}} elemento seleccionado",
              defaultValue_plural: "{{count}} elementos seleccionados"
            })}
          </div>
        )}
        <div className="multi-select-hint">
          {t("multiSelect.hint", { 
            defaultValue: "Mantén Ctrl presionado para seleccionar múltiples" 
          })}
        </div>
      </div>
    </FormField>
  );
};