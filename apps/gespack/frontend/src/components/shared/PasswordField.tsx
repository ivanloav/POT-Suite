/**
 * Componente de campo de contraseña con validación visual.
 * 
 * Muestra un campo de entrada para contraseñas y, opcionalmente, una lista de requisitos
 * que la contraseña debe cumplir (longitud mínima, mayúsculas, minúsculas, números y caracteres especiales).
 * Actualiza el estado de validación en tiempo real según el valor ingresado.
 *
 * @param label Etiqueta del campo de contraseña.
 * @param value Valor actual de la contraseña.
 * @param onChange Función que se llama al cambiar el valor de la contraseña.
 * @param required Indica si el campo es obligatorio.
 * @param showValidation Muestra los requisitos de la contraseña si es true.
 * @param className Clases CSS adicionales para el campo.
 */
 
/**
 * Interfaz para el estado de validación de la contraseña.
 * 
 * Representa si la contraseña cumple con los requisitos mínimos:
 * longitud, mayúsculas, minúsculas, números y caracteres especiales.
 */
 
/**
 * Hook personalizado para validar contraseñas en formularios.
 * 
 * Proporciona el estado de validación y una función para validar contraseñas.
 * Actualiza el estado de validación según el valor de la contraseña ingresada.
 *
 * @returns Un objeto con el estado de validación y la función de validación.
 */
import React, { useState } from "react";
import { FormField } from "./BaseForm";
import "./PasswordField.css";

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

export interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  showValidation?: boolean;
  alwaysShowValidation?: boolean;
  className?: string;
  onValidationChange?: (validation: PasswordValidation) => void;
  error?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  showValidation = true,
  alwaysShowValidation = false,
  className = "",
  onValidationChange,
  error
}) => {
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false
  });

  const validatePassword = (password: string): PasswordValidation => {
    const newValidation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValid: false
    };

    newValidation.isValid = 
      newValidation.minLength &&
      newValidation.hasUppercase &&
      newValidation.hasLowercase &&
      newValidation.hasNumber &&
      newValidation.hasSpecialChar;

    setValidation(newValidation);
    
    if (onValidationChange) {
      onValidationChange(newValidation);
    }
    return newValidation;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    onChange(password);
    if (password) {
      validatePassword(password);
    } else {
      const emptyValidation = {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        isValid: false
      };
      setValidation(emptyValidation);

      if (onValidationChange) {
        onValidationChange(emptyValidation);
      }
    }
  };

  return (
    <div className="password-field-container">
      <div className="password-field-input">
        <FormField 
          label={label} 
          required={required}
          className={`password-field ${className}`}
          error={error}
        >
          <input
            type="password"
            value={value}
            onChange={handleChange}
            className={value && !validation.isValid ? 'invalid' : ''}
            required={required}
          />
          {showValidation && (alwaysShowValidation || value) && (
            <div className="password-requirements">
              <h4>Requisitos de la contraseña</h4>
              <div className={`requirement ${validation.minLength ? 'valid' : 'invalid'}`}>
                {validation.minLength ? '✓' : '✗'} Al menos 8 caracteres
              </div>
              <div className={`requirement ${validation.hasUppercase ? 'valid' : 'invalid'}`}>
                {validation.hasUppercase ? '✓' : '✗'} Al menos una mayúscula
              </div>
              <div className={`requirement ${validation.hasLowercase ? 'valid' : 'invalid'}`}>
                {validation.hasLowercase ? '✓' : '✗'} Al menos una minúscula
              </div>
              <div className={`requirement ${validation.hasNumber ? 'valid' : 'invalid'}`}>
                {validation.hasNumber ? '✓' : '✗'} Al menos un número
              </div>
              <div className={`requirement ${validation.hasSpecialChar ? 'valid' : 'invalid'}`}>
                {validation.hasSpecialChar ? '✓' : '✗'} Al menos un carácter especial
              </div>
            </div>
          )}
        </FormField>
      </div>
    </div>
  );
};

// Hook personalizado para usar en formularios
export const usePasswordValidation = () => {
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false
  });

  const validatePassword = (password: string): boolean => {
    const newValidation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValid: false
    };

    newValidation.isValid = 
      newValidation.minLength &&
      newValidation.hasUppercase &&
      newValidation.hasLowercase &&
      newValidation.hasNumber &&
      newValidation.hasSpecialChar;

    setValidation(newValidation);
    return newValidation.isValid;
  };

  return { validation, validatePassword };
};