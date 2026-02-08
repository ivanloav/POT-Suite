import React, { useEffect, useState } from "react";
import { SearchableSelect } from "../../shared/SearchableSelect";
import "./PaymentFields.css";
import { formatCurrency } from "../../../utils/number";
import { isValidLuhn, isPaymentTypeCompatibleWithDeferred } from "../../../utils/payment";

interface PaymentFieldsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  errors: Record<string, string | null>;
  clearFieldError: (name: string) => void;
  setFieldError: (name: string, msg: string | null) => void;
  paymentTypeFields: Array<any>;
  paymentTypeOptions: Array<{ value: string; label: string }>;
  priorityTypeOptions: Array<{ value: string; label: string }>;
  paymentTypesLoading: boolean;
  priorityTypesLoading: boolean;
  searchPaymentTypes: (query: string) => Promise<any[]>;
  searchPriorityTypes: (query: string) => Promise<any[]>;
  t: (key: string, params?: Record<string, any>) => string;
  selectedPaymentType?: { orderPaymentTypeId: number; paymentType: string; isActive?: boolean; fields: any[] };
  priorityTypes?: any[];
  applyPriorityTypeSelection: (priorityType: any, label?: string) => void;
  paymentTypes: any[];
  total?: number;
  fullName?: string;
  disabled?: boolean;
  paymentTypeRef?: React.RefObject<HTMLInputElement | null>;
  notify?: any;
}

export const PaymentFields: React.FC<PaymentFieldsProps> = ({
  formData,
  setFormData,
  errors,
  clearFieldError,
  setFieldError,
  paymentTypeFields,
  paymentTypeOptions,
  priorityTypeOptions,
  paymentTypesLoading,
  priorityTypesLoading,
  searchPaymentTypes,
  searchPriorityTypes,
  t,
  selectedPaymentType,
  priorityTypes = [],
  applyPriorityTypeSelection,
  total,
  fullName,
  disabled,
  paymentTypeRef,
  notify,
}) => {
  const [isInstallmentsModalOpen, setIsInstallmentsModalOpen] = useState(false);
  const [tempInstallmentsData, setTempInstallmentsData] = useState<Record<string, string>>({});
  const [modalValidationErrors, setModalValidationErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!paymentTypeFields || paymentTypeFields.length === 0) return;
    const newFormData: Record<string, any> = { ...formData };

    // Eliminar todos los campos dinámicos que no correspondan al tipo actual
    Object.keys(newFormData).forEach(key => {
      // Si el campo es de tarjeta y el tipo no es tarjeta, lo borro
      if ((key.includes("Tarjeta") || key === "importeTarjeta") && selectedPaymentType?.paymentType !== "VISA") {
        delete newFormData[key];
      }
      // Si el campo es de cheque y el tipo no es cheque, lo borro
      if ((key.includes("Cheque") || key === "importeCheque") && selectedPaymentType?.paymentType !== "CHEQUE") {
        delete newFormData[key];
      }
    });

    if (fullName && paymentTypeFields[0] && newFormData[paymentTypeFields[0].fieldName] !== fullName && selectedPaymentType?.paymentType !== "EFECTIVO") {
      newFormData[paymentTypeFields[0].fieldName] = fullName.toUpperCase();
    }

    if (typeof total !== "undefined" && paymentTypeFields.length > 0) {
      const lastIdx = paymentTypeFields.length - 1;
      if (newFormData[paymentTypeFields[lastIdx].fieldName] !== String(total)) {
        newFormData[paymentTypeFields[lastIdx].fieldName] = String(formatCurrency(total));
      }
    }
    setFormData(newFormData);
  }, [total, fullName, paymentTypeFields, selectedPaymentType?.paymentType]);

  // Limpiar campos dinámicos cuando cambian las cuotas o el tipo de pago
  useEffect(() => {
    const installments = parseInt(formData.deferredPaymentInstallments) || 0;
    const paymentType = selectedPaymentType?.paymentType?.toUpperCase();
    
    if (installments > 1 && (paymentType === "VISA" || paymentType === "CHEQUE")) {
      // Si cambió el número de cuotas, limpiar campos que ya no son necesarios
      const newFormData: Record<string, any> = { ...formData };
      let hasChanges = false;
      
      // Limpiar campos de cuotas que excedan el número actual
      Object.keys(formData).forEach(key => {
        if (paymentType === "VISA" && key.startsWith("importeTarjeta_")) {
          const cuotaNum = parseInt(key.split("_")[1]);
          if (cuotaNum > installments) {
            delete newFormData[key];
            hasChanges = true;
          }
        } else if (paymentType === "CHEQUE" && (key.startsWith("numCheque_") || key.startsWith("importeCheque_"))) {
          const cuotaNum = parseInt(key.split("_")[1]);
          if (cuotaNum > installments) {
            delete newFormData[key];
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) {
        setFormData(newFormData);
      }
    } else {
      // Si no hay cuotas múltiples, limpiar todos los campos dinámicos de cuotas
      const newFormData: Record<string, any> = { ...formData };
      let hasChanges = false;
      
      Object.keys(formData).forEach(key => {
        if (key.startsWith("importeTarjeta_") || key.startsWith("numCheque_") || key.startsWith("importeCheque_")) {
          delete newFormData[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setFormData(newFormData);
      }
    }
  }, [formData.deferredPaymentInstallments, selectedPaymentType?.paymentType]);

  const siNoOptions = [
    { value: t("orderForm.yes"), label: t("orderForm.yes") },
    { value: t("orderForm.no"), label: t("orderForm.no") }
  ];

  // Forzar isRequired=true en todos los campos dinámicos para pruebas de validación
  const forcedRequiredFields = paymentTypeFields.map(field => ({ ...field, isRequired: true }));

  return (
    <section className="section">
      <h3 className="section-title">{t("orderForm.section.paymentData")}</h3>
      <div className="grid grid-1">
        <div className="field">
          <label>{t("orderForm.Privilege")}</label>
          <SearchableSelect
            value={formData.isPrivilege || null}
            placeholder={t("orderForm.selectPrivilege")}
            options={siNoOptions}
            isDisabled={disabled || paymentTypesLoading}
            noOptionsMessage={t("orderForm.noPrivilege")}
            inputRef={paymentTypeRef}
            onChange={(value) => {
              setFormData((prev: Record<string, any>) => ({ ...prev, isPrivilege: value }));
              setFieldError("isPrivilege", value ? null : errors.isPrivilege ?? null);
            }}
            className={errors.isPrivilege ? "ss-invalid" : undefined}
            aria-invalid={!!errors.isPrivilege}
          />
        </div>
        <div className="field">
          <label>{t("orderForm.typeShippingSection")}</label>
          <SearchableSelect
            value={formData.priorityTypeId || null}
            placeholder={t("orderForm.selectTypeShipping")}
            options={priorityTypeOptions}
            onSearch={async (v) =>
              (await searchPriorityTypes(v)).map((pt) => ({
                value: String(pt.actionPriorityId),
                label: `${pt.actionPriorityId} - ${pt.priorityName}`,
              }))
            }
            minChars={1}
            debounceMs={300}
            isDisabled={disabled || priorityTypesLoading}
            noOptionsMessage={t("orderForm.noTypeShipping")}
            onChange={(value, label) => {
              const selected = priorityTypes.find((pt) => String(pt.actionPriorityId) === value);
              if (selected) {
                clearFieldError("priorityTypes");
                applyPriorityTypeSelection(selected, label || undefined);
              } else {
                setFieldError("priorityTypes", value ? null : errors.priorityTypes ?? null);
              }
            }}
            className={errors.priorityTypes ? "ss-invalid" : undefined}
            aria-invalid={!!errors.priorityTypes}
          />
        </div>
        <div className="field">
          <label>{t("orderForm.deferredPayment")}</label>
          <SearchableSelect
            value={formData.isDeferredPayment || "NO"}
            placeholder={t("orderForm.selectDeferredPayment")}
            options={siNoOptions}
            isDisabled={disabled || paymentTypesLoading}
            noOptionsMessage={t("orderForm.noDeferredPayment")}
            onChange={(value) => {
              const newFormData: Record<string, any> = { ...formData, isDeferredPayment: value };
              
              // Si cambia a "Sí" y ya hay efectivo seleccionado, limpiar el tipo de pago
              if (value === t("orderForm.yes") && selectedPaymentType?.paymentType?.toUpperCase() === "EFECTIVO") {
                notify?.error(t("orderForm.deferredPaymentModal.cashNotAllowedDeferred"));
                newFormData.paymentTypes = "";
                setFieldError("paymentTypes", t("orderForm.deferredPaymentModal.cashNotAllowedDeferred"));
              }
              
              // Si cambia a "No", limpiar el número de cuotas
              if (value === t("orderForm.no")) {
                newFormData.deferredPaymentInstallments = "";
              }
              
              setFormData(newFormData);
              setFieldError("isDeferredPayment", value ? null : errors.isDeferredPayment ?? null);
            }}
            className={errors.isDeferredPayment ? "ss-invalid" : undefined}
            aria-invalid={!!errors.isDeferredPayment}
          />
        </div>
        
        {/* Select de número de cuotas (solo si pago diferido = Sí) */}
        {formData.isDeferredPayment === t("orderForm.yes") && (
          <div className="field">
            <label>{t("orderForm.installments")}</label>
            <SearchableSelect
              value={formData.deferredPaymentInstallments || null}
              placeholder={t("orderForm.selectInstallments")}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" }
              ]}
              isDisabled={disabled || paymentTypesLoading}
              noOptionsMessage={t("orderForm.noInstallments")}
              onChange={(value) => {
                setFormData((prev: Record<string, any>) => ({ ...prev, deferredPaymentInstallments: value }));
                setFieldError("deferredPaymentInstallments", value ? null : errors.deferredPaymentInstallments ?? null);
              }}
              className={errors.deferredPaymentInstallments ? "ss-invalid" : undefined}
              aria-invalid={!!errors.deferredPaymentInstallments}
            />
          </div>
        )}
        <div className="field">
          <label>{t("orderForm.paymentType")}</label>
          <SearchableSelect
            value={formData.paymentTypes ? String(formData.paymentTypes) : null}
            placeholder={t("orderForm.selectPaymentType")}
            options={paymentTypeOptions}
            onSearch={async (v) =>
              (await searchPaymentTypes(v)).map((pt) => ({
                value: String(pt.orderPaymentTypeId),
                label: `${pt.orderPaymentTypeId} - ${pt.paymentType}`,
              }))
            }
            minChars={1}
            debounceMs={300}
            isDisabled={disabled || paymentTypesLoading}
            noOptionsMessage={t("orderForm.noPaymentType")}
            onChange={(value) => {
              // Buscar el tipo de pago seleccionado usando selectedPaymentType si está disponible
              // o buscar en las opciones por el label que incluye el nombre del tipo de pago
              const selectedOption = paymentTypeOptions.find((opt: any) => opt.value === String(value));
              const paymentTypeName = selectedOption?.label?.split(" - ")[1]?.toUpperCase() || "";
              const isDeferredPayment = formData.isDeferredPayment === t("orderForm.yes");
              
              // Validar si es efectivo y hay pago aplazado
              if (paymentTypeName === "EFECTIVO" && isDeferredPayment) {
                // Mostrar toast de error y no permitir la selección
                notify?.error(t("orderForm.deferredPaymentModal.cashNotAllowedDeferred"));
                setFormData((prev: Record<string, any>) => ({ ...prev, paymentTypes: "" })); // Limpiar selección
                setFieldError("paymentTypes", t("orderForm.deferredPaymentModal.cashNotAllowedDeferred"));
              } else {
                setFormData((prev: Record<string, any>) => ({ ...prev, paymentTypes: String(value) }));
                setFieldError("paymentTypes", value ? null : errors.paymentTypes ?? null);
              }
            }}
            className={errors.paymentTypes ? "ss-invalid" : undefined}
            aria-invalid={!!errors.paymentTypes}
          />
        </div>

        {/* Campos dinámicos de pago agrupados */}
        {forcedRequiredFields.length > 0 && (
          <div
            className={`field-type-payments field-type-payments-${selectedPaymentType?.paymentType?.toLowerCase() || ""}`}
            style={{ marginTop: "12px", padding: "6px", borderRadius: "8px" }}
          >
            {forcedRequiredFields.filter((field) => {
              const installments = parseInt(formData.deferredPaymentInstallments) || 0;
              const paymentType = selectedPaymentType?.paymentType?.toUpperCase();
              const hasInstallments = installments > 1 && (paymentType === "VISA" || paymentType === "CHEQUE");
              
              // Si hay cuotas múltiples, filtrar campos que se manejan en el modal
              if (hasInstallments) {
                // Para VISA: ocultar campos de importe (se manejan en el modal)
                if (paymentType === "VISA" && field.fieldName.includes("importe")) {
                  return false;
                }
                // Para CHEQUE: ocultar número de cheque e importe (se manejan en el modal)
                if (paymentType === "CHEQUE" && (field.fieldName.includes("numCheque") || field.fieldName.includes("importe"))) {
                  return false;
                }
              }
              
              return true;
            }).map((field) => (
              <div className="field field-type-payment" key={field.fieldName}>
                <label>
                  {t(`orderForm.fieldsPaymentDynamic.${field.fieldName}`)}
                  {field.isRequired && <span style={{ color: "red" }}> *</span>}
                </label>
                <input
                  type={
                    field.fieldType === "number" || field.fieldName.includes("numCheque") || field.fieldName.includes("numTarjeta")
                      ? "number"
                      : "text"
                  }
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  required={field.isRequired}
                  pattern={
                    field.fieldName === "caducidadTarjeta" ? "^(0[1-9]|1[0-2])\/[0-9]{2}$" 
                    : field.fieldName === "codVerificacion" ? "^[0-9]{3}$" 
                    : undefined}
                  placeholder={field.fieldName === "caducidadTarjeta" ? "MM/AA" : field.fieldName === "codVerificacion" ? "123" : undefined}
                  maxLength={field.fieldName === "caducidadTarjeta" ? 5 : field.fieldName === "codVerificacion" ? 3 : undefined}
                  onChange={e => {
                    let value = e.target.value;
                    if (field.fieldName === "caducidadTarjeta") {
                      value = value.replace(/[^0-9]/g, "");
                      if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                    } else if (
                      field.fieldName === "codVerificacion" ||
                      field.fieldName.slice(0, 7) === "importe" ||
                      field.fieldName.toLowerCase().includes("numcheque") ||
                      field.fieldName.toLowerCase().includes("numerotarjeta")
                    ) {
                      value = value.replace(/[^0-9]/g, "");
                    }
                    setFormData((prev: Record<string, any>) => ({ ...prev, [field.fieldName]: value }));
                  }}
                  onBlur={e => {
                    if (field.fieldName.slice(0, 7) === "importe") {
                      const raw = e.target.value.replace(",", ".");
                      const num = Number(raw);
                      setFormData({
                        ...formData,
                        [field.fieldName]:
                          raw === "" ? "" : isNaN(num) ? e.target.value : String(formatCurrency(num)),
                      });
                    }
                    // Validar algoritmo de Luhn y longitud para numTarjeta
                    if (field.fieldName === "numTarjeta") {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value && (value.length !== 16 || !isValidLuhn(value))) {
                        setFieldError("numTarjeta", t("orderForm.notify.invalidCardNumber") || "Número de tarjeta no válido");
                        notify.error(t("orderForm.notify.invalidCardNumber") || "Número de tarjeta no válido");
                      } else {
                        setFieldError("numTarjeta", null);
                      }
                    }
                  }}
                  className={errors[field.fieldName] ? "ss-invalid" : undefined}
                  aria-invalid={!!errors[field.fieldName]}
                />
              </div>
            ))}

            {/* Botón para configurar cuotas si es necesario */}
            {(() => {
              const installments = parseInt(formData.deferredPaymentInstallments) || 0;
              const paymentType = selectedPaymentType?.paymentType?.toUpperCase();
              
              if (installments > 1 && (paymentType === "VISA" || paymentType === "CHEQUE")) {
                const hasConfiguredInstallments = Object.keys(formData).some(key => 
                  key.startsWith("importeTarjeta_") || key.startsWith("numCheque_") || key.startsWith("importeCheque_")
                );
                
                return (
                  <div style={{ padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                    <button
                      type="button"
                      className={`installments-configure-button ${hasConfiguredInstallments ? 'installments-configure-button--configured' : 'installments-configure-button--default'}`}
                      onClick={() => {
                        // Inicializar datos temporales con los valores actuales si existen
                        const currentData: Record<string, string> = {};
                        Object.keys(formData).forEach(key => {
                          if (key.startsWith("importeTarjeta_") || key.startsWith("numCheque_") || key.startsWith("importeCheque_")) {
                            currentData[key] = formData[key] || "";
                          }
                        });
                        
                        // Para VISA, si no hay datos previos, auto-rellenar con el importe fraccionado
                        if (paymentType === "VISA" && total && installments > 1) {
                          const hasExistingData = Object.keys(currentData).some(key => 
                            key.startsWith("importeTarjeta_") && currentData[key]?.trim()
                          );
                          
                          if (!hasExistingData) {
                            // Calcular división exacta con distribución del resto
                            const baseAmount = Math.floor((total * 100) / installments) / 100; // Importe base redondeado a 2 decimales
                            const totalBase = baseAmount * installments;
                            const remainder = Math.round((total - totalBase) * 100) / 100; // Resto en céntimos
                            const extraCents = Math.round(remainder * 100); // Convertir a céntimos enteros
                            
                            for (let i = 1; i <= installments; i++) {
                              let installmentAmount = baseAmount;
                              
                              // Distribuir los céntimos extras en las últimas cuotas
                              if (i > installments - extraCents) {
                                installmentAmount += 0.01;
                              }
                              
                              currentData[`importeTarjeta_${i}`] = String(formatCurrency(installmentAmount));
                            }
                          }
                        }
                        
                        setTempInstallmentsData(currentData);
                        setModalValidationErrors({}); // Limpiar errores previos
                        setIsInstallmentsModalOpen(true);
                      }}
                      disabled={disabled}
                    >
                      {hasConfiguredInstallments 
                        ? `✓ ${paymentType === "VISA" 
                            ? t("orderForm.deferredPaymentModal.installmentsConfigured") 
                            : t("orderForm.deferredPaymentModal.chequesConfigured")
                          } ${t("orderForm.deferredPaymentModal.editSuffix")}`
                        : `${paymentType === "VISA" 
                            ? t("orderForm.deferredPaymentModal.configureInstallments", { count: installments }) 
                            : t("orderForm.deferredPaymentModal.configureChequePayments", { count: installments })
                          }`
                      }
                    </button>
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
        )}
      </div>

      {/* Modal para configurar cuotas */}
      {isInstallmentsModalOpen && (() => {
        const installments = parseInt(formData.deferredPaymentInstallments) || 0;
        const paymentType = selectedPaymentType?.paymentType?.toUpperCase();
        
        const handleSaveInstallments = () => {
          // Validar campos requeridos y trackear errores específicos
          const requiredFields: string[] = [];
          const newErrors: Record<string, boolean> = {};
          
          for (let i = 1; i <= installments; i++) {
            if (paymentType === "VISA") {
              // Para VISA solo necesitamos el importe
              const importeField = `importeTarjeta_${i}`;
              if (!tempInstallmentsData[importeField]?.trim()) {
                requiredFields.push(`Importe de cuota ${i}`);
                newErrors[importeField] = true;
              }
            } else if (paymentType === "CHEQUE") {
              // Para CHEQUE necesitamos número y importe
              const numField = `numCheque_${i}`;
              const importeField = `importeCheque_${i}`;
              
              if (!tempInstallmentsData[numField]?.trim()) {
                requiredFields.push(`Número de cheque ${i}`);
                newErrors[numField] = true;
              }
              if (!tempInstallmentsData[importeField]?.trim()) {
                requiredFields.push(`Importe de cheque ${i}`);
                newErrors[importeField] = true;
              }
            }
          }
          
          // Actualizar estado de errores
          setModalValidationErrors(newErrors);
          
          // Si hay campos vacíos, mostrar error y no cerrar el modal
          if (requiredFields.length > 0) {
            const missingFields = requiredFields.join(", ");
            notify?.error(`Campos requeridos: ${missingFields}`);
            return; // No cerrar el modal
          }
          
          // Si todo está válido, transferir datos y cerrar modal
          const newFormData = { ...formData, ...tempInstallmentsData };
          setFormData(newFormData);
          setModalValidationErrors({});
          setIsInstallmentsModalOpen(false);
        };

        const handleInputChange = (fieldName: string, value: string) => {
          setTempInstallmentsData(prev => ({ ...prev, [fieldName]: value }));
          // Limpiar error cuando el usuario empiece a escribir
          if (modalValidationErrors[fieldName] && value.trim()) {
            setModalValidationErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        };

        const handleAmountBlur = (fieldName: string, value: string) => {
          const raw = value.replace(",", ".");
          const num = Number(raw);
          const formattedValue = raw === "" ? "" : isNaN(num) ? value : String(formatCurrency(num));
          setTempInstallmentsData(prev => ({ ...prev, [fieldName]: formattedValue }));
        };

        return (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              width: "90vw",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              boxSizing: "border-box"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                  {paymentType === "VISA" 
                    ? t("orderForm.deferredPaymentModal.configureCardInstallments", { count: installments })
                    : t("orderForm.deferredPaymentModal.configureCheques", { count: installments })
                  }
                </h3>
                <button
                  onClick={() => setIsInstallmentsModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666",
                    padding: "0",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                {Array.from({ length: installments }, (_, i) => i + 1).map(cuota => (
                  <div className={`field-type-payments-${selectedPaymentType?.paymentType?.toLowerCase()}`} key={cuota} style={{ 
                    marginBottom: "20px", 
                    padding: "15px", 
                    borderRadius: "6px",
                  }}>
                    <h4 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: "600", color: "#495057" }}>
                      {paymentType === "VISA" ? `Cuota ${cuota}` : `Cheque ${cuota}`}
                    </h4>
                    
                    {paymentType === "VISA" ? (
                      <div style={{ width: "100%" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                          {t("orderForm.fieldsPaymentDynamic.importeTarjeta")} <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={tempInstallmentsData[`importeTarjeta_${cuota}`] || ""}
                          onChange={e => {
                            const value = e.target.value.replace(/[^0-9.,]/g, "");
                            handleInputChange(`importeTarjeta_${cuota}`, value);
                          }}
                          onBlur={e => handleAmountBlur(`importeTarjeta_${cuota}`, e.target.value)}
                          placeholder="0,00 €"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: modalValidationErrors[`importeTarjeta_${cuota}`] 
                              ? "2px solid #dc3545" 
                              : "1px solid #ced4da",
                            borderRadius: "4px",
                            fontSize: "14px",
                            boxSizing: "border-box"
                          }}
                          required
                        />
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", width: "100%" }}>
                        <div style={{ minWidth: 0 }}>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                            {t("orderForm.fieldsPaymentDynamic.numCheque")} <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={tempInstallmentsData[`numCheque_${cuota}`] || ""}
                            onChange={e => handleInputChange(`numCheque_${cuota}`, e.target.value)}
                            placeholder="Número de cheque"
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: modalValidationErrors[`numCheque_${cuota}`] 
                                ? "2px solid #dc3545" 
                                : "1px solid #ced4da",
                              borderRadius: "4px",
                              fontSize: "14px",
                              boxSizing: "border-box"
                            }}
                            required
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                            {t("orderForm.fieldsPaymentDynamic.importeCheque")} <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={tempInstallmentsData[`importeCheque_${cuota}`] || ""}
                            onChange={e => {
                              const value = e.target.value.replace(/[^0-9.,]/g, "");
                              handleInputChange(`importeCheque_${cuota}`, value);
                            }}
                            onBlur={e => handleAmountBlur(`importeCheque_${cuota}`, e.target.value)}
                            placeholder="0,00 €"
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: modalValidationErrors[`importeCheque_${cuota}`] 
                                ? "2px solid #dc3545" 
                                : "1px solid #ced4da",
                              borderRadius: "4px",
                              fontSize: "14px",
                              boxSizing: "border-box"
                            }}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  onClick={() => setIsInstallmentsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveInstallments}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
