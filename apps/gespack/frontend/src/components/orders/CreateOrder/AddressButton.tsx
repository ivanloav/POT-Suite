import React, { useState, useEffect } from "react";
import { AddressModal } from "./AddressModal";
import "./AddressButton.css";

interface AddressButtonProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  t: (key: string, params?: Record<string, any>) => string;
  disabled?: boolean;
  onModalChange?: (isOpen: boolean) => void;
}

export const AddressButton: React.FC<AddressButtonProps> = ({
  formData,
  setFormData,
  t,
  disabled = false,
  onModalChange,
}) => {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Notificar al padre cuando el modal de dirección cambia
  useEffect(() => {
    if (onModalChange) {
      onModalChange(isAddressModalOpen);
    }
  }, [isAddressModalOpen, onModalChange]);

  // Obtener dirección de facturación desde los datos del customer
  const getBillingAddressFromCustomer = () => {
    const customer = formData.selectedCustomerData;
    if (!customer) {
      return {
        nombre: "",
        direccion1: "",
        direccion2: "",
        direccion3: "",
        direccion4: "",
        direccion5: "",
        cp: "",
        poblacion: "",
        telfMovil: "",
      };
    }

    const capitalize = (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const fullName = `${capitalize(customer.shippingGender || "")} ${capitalize(customer.customerFirstName || "")} ${capitalize(customer.customerLastName || "")}`.trim();

    return {
      nombre: fullName,
      direccion1: customer.billingAddressLine1 || "",
      direccion2: customer.billingAddressLine2 || "",
      direccion3: customer.billingAddressLine3 || "",
      direccion4: customer.billingAddressLine4 || "",
      direccion5: "",
      cp: customer.billingAddressCp || "",
      poblacion: customer.billingAddressCity || "",
      telfMovil: customer.phone || "",
    };
  };

  // Obtener dirección de envío desde el textarea actual (que viene del customer)
  const getShippingAddressFromForm = () => {
    const addressText = formData.customerAddress || "";
    const lines = addressText.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
    
    return {
      nombre: lines[0] || "",
      direccion1: lines[1] || "",
      direccion2: lines[2] || "",
      direccion3: lines[3] || "",
      direccion4: lines[4] || "",
      direccion5: lines[5] || "",
      cp: formData.customerPostalCode || "",
      poblacion: formData.customerCity || "",
      telfMovil: formData.customerMobile || "",
    };
  };

  const handleSaveAddresses = (billingAddress: any, shippingAddress: any) => {
    // Guardar tanto la dirección de facturación como la de envío
    // El textarea SIEMPRE muestra la dirección de envío
    const shippingLines = [
      shippingAddress.nombre,
      shippingAddress.direccion1,
      shippingAddress.direccion2,
      shippingAddress.direccion3,
      shippingAddress.direccion4,
      shippingAddress.direccion5,
    ].filter(line => line).join('\n');

    // Guardar en formData
    setFormData({
      ...formData,
      // Dirección de envío (se muestra en el textarea)
      customerAddress: shippingLines,
      customerPostalCode: shippingAddress.cp,
      customerCity: shippingAddress.poblacion,
      customerMobile: shippingAddress.telfMovil,
      // Dirección de facturación modificada (se guarda en campos nuevos)
      billingCustomerName: billingAddress.nombre,
      billingAddressLine1: billingAddress.direccion1,
      billingAddressLine2: billingAddress.direccion2,
      billingAddressLine3: billingAddress.direccion3,
      billingAddressLine4: billingAddress.direccion4,
      billingAddressLine5: billingAddress.direccion5,
      billingPostalCode: billingAddress.cp,
      billingCity: billingAddress.poblacion,
      billingMobilePhone: billingAddress.telfMovil,
      // Flag para indicar que la dirección fue modificada manualmente
      addressSavedManually: true,
    });
    
    // Cerrar el modal después de guardar
    setIsAddressModalOpen(false);
  };

  // Verificar si alguna dirección ha sido modificada
  const hasAddressBeenModified = () => {
    const customer = formData.selectedCustomerData;
    if (!customer) return false;

    // Si hay flag de guardado manual, hay modificaciones
    if (formData.addressSavedManually) return true;

    // Verificar si hay campos de facturación modificados en formData
    if (formData.billingCustomerName || formData.billingAddressLine1 || 
        formData.billingAddressLine2 || formData.billingAddressLine3 || 
        formData.billingAddressLine4 || formData.billingAddressLine5 ||
        formData.billingPostalCode || formData.billingCity || 
        formData.billingMobilePhone) {
      return true;
    }

    return false;
  };

  const isModified = hasAddressBeenModified();
  
  // Deshabilitar si no hay cliente seleccionado
  const isDisabled = disabled || !formData.selectedCustomerData;

  return (
    <>
      <div className="address-button-container">
      <button
        type="button"
        className={`address-button ${isModified ? 'address-modified' : 'address-not-modified'}`}
        onClick={() => setIsAddressModalOpen(true)}
        disabled={isDisabled}
      >
        <span style={{ fontSize: "14px" }}>📍</span>
        {isModified ? t("orderForm.modifiedAddressButton") : t("orderForm.modifyAddressButton")}
      </button>
      </div>
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddresses}
        initialBillingAddress={getBillingAddressFromCustomer()}
        initialShippingAddress={getShippingAddressFromForm()}
        t={t}
      />
    </>
  );
};
