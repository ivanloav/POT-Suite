import React, { useEffect, useState, useMemo, useLayoutEffect, useRef } from "react";
import { useOrderSources } from "../../hooks/useOrderSources";
import { useOrderActions } from "../../hooks/useOrderActions";
import { useOrderCustomers } from "../../hooks/useOrderCustomers";
import { useOrderCustomerTypes } from "../../hooks/useOrderCustomersType";
import { OrderLinesTable, type OrderLine } from "./CreateOrder/OrderLinesTable";
import { useSite } from "../../context/SiteContext";
import { useUser } from "../../context/UserContext";
import { round4 } from "../../utils/number";
import { calculateVatTotalsByType } from "../../utils/taxCalculator";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { normalizePhone, isValidFixed, isValidMobile } from '../../utils/phone';
import { normalizeEmail, isValidEmail } from '../../utils/email';
import { notify } from "../../utils/notifications";
import { useSidebarContext } from "../../context/SidebarContext";
import { useFooter } from "../../context/FooterContext";
import { usePriorityTypes } from "../../hooks/usePriorityTypes";
import { useOrderPaymentTypes } from "../../hooks/useOrderPaymentTypes";
import { useTranslation } from "react-i18next";
import { OrderTotals } from "./CreateOrder/OrderTotals";
import { CustomerFields } from "./CreateOrder/CustomerFields";
import { PaymentFields } from "./CreateOrder/PaymentFields";
import { BreadcrumbActions } from "./CreateOrder/BreadcrumbActions";
import { useOrderFormState } from "../../hooks/useOrderFormState";
import { PromoDiscountModal } from "./CreateOrder/PromoDiscountModal";
import { useSetBreadcrumbActions } from "../../hooks/useBreadcrumbActions";
import { TaxesFields } from "./CreateOrder/TaxesFields";
import { useOrderCalculations } from "../../hooks/useOrderCalculations";
import { useClubFee } from "../../hooks/useClubFee";
import { DEFAULT_CB_SOURCE } from "../../constants";
import { formatAddressesForBackend, getTransportWMS } from "../../utils/orderHelpers";
import { validateOrderForm as validateOrderFields, buildPaymentObject } from "../../utils/orderValidation";

import "./CreateOrderForm.css";

interface CreateOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: any) => Promise<any>;
  isSubmitting?: boolean;
}

export type PaymentTypeField = { 
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  [key: string]: any;
};

export const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ isOpen, onClose, onSubmit, isSubmitting = false }) => {
  // Estado para BAV
  const [bavPedido, setBavPedido] = useState("");
  const [bavImporte, setBavImporte] = useState(0);
  const { t } = useTranslation("order");


  const { sources, loading: sourcesLoading, searchSources } = useOrderSources();
  const { actions, loading: actionsLoading, searchActions } = useOrderActions();
  const { customers, loading: customersLoading, searchCustomers } = useOrderCustomers();
  const { customerTypes, loading: customerTypesLoading, searchCustomerTypes } = useOrderCustomerTypes();
  const { priorityTypes, loading: priorityTypesLoading, searchPriorityTypes } = usePriorityTypes();
  const { paymentTypes, loading: paymentTypesLoading, searchPaymentTypes } = useOrderPaymentTypes();
  const { siteId, siteName } = useSite();
  const { userId } = useUser();
  const { setForceSidebarCollapse } = useSidebarContext();
  const { setFooter, hideFooter } = useFooter();
  const [showLines, setShowLines] = useState(true);
  const [pendingFocusLines, setPendingFocusLines] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoStep, setPromoStep] = useState<'ask' | 'input'>('ask');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const createdOrderReferenceRef = useRef<string | null>(null);
    
  const paymentTypeRef = useRef<HTMLInputElement | null>(null);
  const linesTableRef = useRef<HTMLDivElement>(null);
  const linesEndRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const initialLines: OrderLine[] = [{ line: 1, qty: 1 }];
  const initialFormData: Record<string, any> = {
    CBReader: "",
    orderSourceId: "",
    actionId: "",
    participant: "",
    customer: "",
    customerLabel: "",
    customerType: "",
    customerCode: "",
    customerFirstName: "",
    customerLastName: "",
    customerAddress: "",
    customerPostalCode: "",
    customerCity: "",
    customerCountry: "",
    customerPhone: "",
    customerMobile: "",
    customerEmail: "",
    customerMarkedName: "",
    isPrivilege: "",
    priorityTypes: "",
    paymentTypes: "",
    role: "user",
    siteId,
    siteName,
    section: "HojasDePedido",
  };

  // Hook centralizado para estado y helpers
  const {
    formData, setFormData,
    lines, setLines,
    errors,
    setFieldError, clearFieldError,
    resetForm,
    applyCustomerSelection,
    getDefaultCountry,
    handleBlurFixed,
    handleBlurMobile,
    handleBlurEmail,
    parseCBReader,
    applyParsedScanToForm,
    selectCustomerByCode,
    applyActionSelection,
    applyPriorityTypeSelection,
  } = useOrderFormState({ initialFormData, initialLines });

  const selectedPaymentType = paymentTypes.find(
    pt => String(pt.orderPaymentTypeId) === String(formData.paymentTypes)
  );
  const paymentTypeFields: PaymentTypeField[] = selectedPaymentType?.fields || [];


  const handleCBReaderKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const str = e.currentTarget.value;
    const parsed = parseCBReader(str);

    if (parsed) {
      const cb = (code: string, name: string) => selectCustomerByCode(code, name, searchCustomers, t, notify);
      applyParsedScanToForm(parsed, cb);
      
      // Buscar el objeto fuente cuyo nombre sea "CORREO" y asignar su ID como string
      const correoSource = sources.find(s => s.sourceName === DEFAULT_CB_SOURCE);
      if (correoSource) {
        setFormData(prev => ({
          ...prev,
          orderSourceId: String(correoSource.orderSourceId)
        }));
      }

      // Si el QR tiene actionId, buscar la acción completa y aplicarla (incluye mandatoryFee)
      if (parsed.actionId) {
        const selectedAction = actions.find(a => String(a.actionId) === String(parsed.actionId));
        if (selectedAction) {
          const actionLabel = `${selectedAction.actionId} - ${selectedAction.actionName}`;
          applyActionSelection(selectedAction, actionLabel);
        }
      }

      setShowLines(true);
      setPendingFocusLines(true);
    }
  };

  // Gestión del club fee con hook personalizado
  const { clubFee } = useClubFee({
    isPrivilege: formData.isPrivilege,
    initialPrivilegeFromDB: null,
    prevPrivilege: "",
    customerCode: formData.customerCode,
    customer: formData.customer
  });

  // Cálculos centralizados con hook personalizado
  const {
    subtotal,
    privilegeDiscount,
    subtotalAfterFees
  } = useOrderCalculations({
    lines,
    promoDiscount,
    isPrivilege: formData.isPrivilege,
    clubFee,
    shippingCost: formData.shippingCost || 0,
    mandatoryFee: formData.mandatoryFee || 0
  });

  const totalWithoutBAV = useMemo(() => 
    subtotalAfterFees,
    [subtotalAfterFees]
  );

  const totalOrder = useMemo(() => 
    round4(Math.max(0, subtotalAfterFees - (bavImporte || 0))),
    [subtotalAfterFees, bavImporte]
  );

  const totalWeight = useMemo(() => 
    round4(lines.reduce((acc, line) => acc + ((line.weight ?? 0) * (line.qty ?? 1)), 0)), 
    [lines]
  );

  const hasValidLines = useMemo(() =>
    lines.some(l => l.reference && (l.qty ?? 0) > 0),
    [lines]
  );

  // Calcular totales de BI/TVA por vatType
  const vatTotals = useMemo(() => 
    calculateVatTotalsByType(
      lines,
      promoDiscount,
      privilegeDiscount,
      clubFee,
      formData.shippingCost || 0,
      formData.mandatoryFee || 0
    ), 
    [lines, promoDiscount, privilegeDiscount, clubFee, formData.shippingCost, formData.mandatoryFee]
  );

  // Función para manejar cuando se sale de la sección de líneas
  const handleLinesBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const linesSection = e.currentTarget;
    
    // Limpiar timeout previo
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // Excluir el modal de promo si está abierto
    const isPromoModal = relatedTarget?.closest('[role="dialog"]') || 
                        relatedTarget?.closest('.modal') ||
                        relatedTarget?.closest('[data-modal="promo"]');

    // Si es el modal, no hacer nada
    if (isPromoModal) return;

    // Solo disparar si el foco realmente salió de la sección
    if (!relatedTarget || !linesSection.contains(relatedTarget)) {
      // Usar timeout para distinguir blur temporal vs salida real
      blurTimeoutRef.current = setTimeout(() => {
        // Verificar si después del delay, el foco sigue fuera de la sección
        const activeElement = document.activeElement as HTMLElement;
        const stillOutside = !activeElement || !linesSection.contains(activeElement);
        
        if (stillOutside && !showPromoDialog) {
          setPromoStep('ask');
          setShowPromoDialog(true);
        }
      }, 150); // Delay de 150ms para permitir que SearchableSelect maneje su focus interno
    }
  };

  const handleLinesFocus = () => {
    // Si regresa el foco a la sección, cancelar el timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };



  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Cerrar con ESC y manejar colapso de sidebar
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setForceSidebarCollapse(true); // Colapsa la sidebar al abrir
      
      // Configurar el footer con los botones
      setFooter(
        <div className="bar-footer">
          <button type="button" className="btn btn-secondary" onClick={() => { handleClose(); }} disabled={isSubmitting}>
            {t("actions.cancel")}
          </button>
          <button
            type="submit"
            form="order-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("actions.saving") || "Guardando..." : t("actions.save")}
          </button>
        </div>
      );
    } else {
      setForceSidebarCollapse(false); // Restaura la sidebar al cerrar
      hideFooter(); // Oculta el footer
    }

    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Focus en input REFERENCE al mostrar líneas
  useLayoutEffect(() => {
    if (!showLines || !pendingFocusLines) return;

    let cancelled = false;
    const focusWhenAvailable = (attempts = 16) => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const body = document.getElementById("lines-body");
        const target =
          // 1) input dentro del contenedor marcado para REFERENCE
          body?.querySelector<HTMLElement>('[data-ref-focus] input:not([disabled])') ||
          // 2) input específico del SearchableSelect si expone su clase
          body?.querySelector<HTMLElement>('[data-ref-focus] .searchable-select-input:not([disabled])') ||
          body?.querySelector<HTMLElement>('.reference-col .searchable-select-input:not([disabled])') ||
          body?.querySelector<HTMLElement>('.reference-col .searchable-select input:not([disabled])') ||
          // 3) fallback por name o testid si existieran
          body?.querySelector<HTMLElement>('[name="reference"]') ||
          body?.querySelector<HTMLElement>('[data-testid="reference"]') ||
          // 4) fallback genérico
          body?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');

        if (target) {
          target.focus();
          setPendingFocusLines(false);
        } else if (attempts > 0) {
          focusWhenAvailable(attempts - 1);
        } else {
          setPendingFocusLines(false);
        }
      });
    };

    focusWhenAvailable();

    return () => { cancelled = true; };
  }, [showLines, pendingFocusLines]);

  const handleClose = () => {
    resetForm();          // limpia SIEMPRE al cerrar
    setForceSidebarCollapse(false); 
    onClose();            // avisa al padre
    hideFooter();        // oculta footer
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos requeridos
    const validationErrors = validateOrderFields(formData, lines, t);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        setFieldError(error.field, error.message);
        notify.error(error.message);
      });
      return;
    }

    // Validar campos primero
    if (formData.customerPhone && !isValidFixed(formData.customerPhone, getDefaultCountry())) {
      setFieldError('customerPhone', t("orderForm.notify.invalidFixed") || 'Teléfono fijo inválido');
      notify.error(t("orderForm.notify.checkFixed") || 'Revisa el teléfono fijo');
      return;
    }

    if (formData.customerMobile && !isValidMobile(formData.customerMobile, getDefaultCountry())) {
      setFieldError('customerMobile', t("orderForm.notify.invalidMobile") || 'Móvil inválido');
      notify.error(t("orderForm.notify.checkMobile") || 'Revisa el móvil');
      return;
    }

    if (formData.customerEmail) {
      const e = normalizeEmail(formData.customerEmail);
      if (!isValidEmail(e)) {
        setFieldError('customerEmail', t("orderForm.notify.invalidEmail") || 'Email inválido');
        notify.error(t("orderForm.notify.checkEmail") || 'Revisa el email');
        return;
      }
    }

    const order_items = lines
      .filter(l => l.reference && (l.qty ?? 0) > 0)
      .map(l => ({
        site_id: siteId,
        product_ref: l.reference!,
        qty: l.qty,
        unit_price: l.price ?? 0,
        line_import: l.import ?? 0,
      }));

    const country = getDefaultCountry();
    const fixed = normalizePhone(formData.customerPhone, country);
    const mobile = normalizePhone(formData.customerMobile, country);

    // Construir objeto de pago con los campos dinámicos
    const payment = buildPaymentObject(
      formData, 
      paymentTypeFields, 
      siteId ?? 0, 
      userId ?? 0, 
      t
    );
    
    // Obtener el nombre de prioridad basado en priorityTypeId
    const selectedPriorityType = priorityTypes.find(
      pt => String(pt.actionPriorityId) === String(formData.priorityTypeId)
    );
    const transportWMS = getTransportWMS(selectedPriorityType?.priorityName, totalWeight);
    
    // Construir el payload final del pedido para actualizar el backend (DB)
    const payload = {
      // Campos del sistema (IDs como number)
      siteId: typeof siteId === 'string' ? parseInt(siteId, 10) : siteId,
      siteName,
      brandId: formData.brandId ? parseInt(String(formData.brandId), 10) : 1,
      actionCategoryId: formData.actionCategoryId ? parseInt(String(formData.actionCategoryId), 10) : 1,
      createdBy: userId,
      
      // IDs convertidos a number
      customerId: formData.customer ? parseInt(String(formData.customer), 10) : undefined,
      actionPriorityId: formData.priorityTypeId ? parseInt(formData.priorityTypeId, 10) : undefined,
      orderSourceId: formData.orderSourceId ? parseInt(formData.orderSourceId, 10) : undefined,
      actionId: formData.actionId ? parseInt(formData.actionId, 10) : undefined,
      
      // Campos NUMERIC como string
      clientType: formData.customerType ? String(formData.customerType) : undefined,
      orderAmount: totalOrder,
      shippingCost: formData.shippingCost != null ? String(formData.shippingCost) : undefined,
      mandatoryShippingFee: formData.mandatoryFee != null ? String(formData.mandatoryFee) : undefined,
      weight: totalWeight > 0 ? totalWeight : 0,
      
      // Datos del cliente
      firstName: formData.customerFirstName,
      lastName: formData.customerLastName,
      gender: formData.customerGender,
      
      // Teléfonos normalizados
      customerPhone: fixed.valid ? (fixed.e164 || formData.customerPhone) : '',
      customerMobile: mobile.valid ? (mobile.e164 || formData.customerMobile) : '',
      
      // Otros campos de texto
      participant: formData.participant,
      section: formData.section,
      
      // Estado
      status: selectedPaymentType?.paymentType === 'CHEQUE' || selectedPaymentType?.paymentType === 'EFECTIVO' ? 'paid' : 'pending',
      isPaid: selectedPaymentType?.paymentType === 'CHEQUE' || selectedPaymentType?.paymentType === 'EFECTIVO' ? true : false,
      paidAt: selectedPaymentType?.paymentType === 'CHEQUE' || selectedPaymentType?.paymentType === 'EFECTIVO' ? new Date() : null,
      // orderReference se genera automáticamente en el backend
      
      // Líneas de pedido
      order_items,

      // Descuentos y tasas
      discount: promoDiscount,
      privilegeDiscount: privilegeDiscount,
      clubFee,
      bi1: Number(vatTotals.bi1),
      tva1: Number(vatTotals.tva1),
      bi2: Number(vatTotals.bi2),
      tva2: Number(vatTotals.tva2),
      
      // Datos BAV
      isBav: bavPedido && bavImporte > 0 ? true : false,
      bavOrder: bavPedido || undefined,
      bavAmount: bavImporte > 0 ? bavImporte : undefined,
      
      shippingType: formData.priorityTypeId,
      isDeferred: formData.isDeferredPayment === t("orderForm.yes") ? true : false,
      transport: transportWMS,
      isPrivileged: formData.isPrivilege === t("orderForm.yes") ? true : false,
      clubCardFee: clubFee,
      clubCardDiscount: privilegeDiscount,
      // Objeto de pago
      payment,
      // Direcciones de facturación y envío
      addresses: formatAddressesForBackend(formData),
      // Observaciones/notas (array de notas internas y/o externas)
      notes: [
        ...(formData.internalNotes ? [{
          noteText: formData.internalNotes,
          isInternal: true
        }] : []),
        ...(formData.externalNotes ? [{
          noteText: formData.externalNotes,
          isInternal: false
        }] : [])
      ].length > 0 ? [
        ...(formData.internalNotes ? [{
          noteText: formData.internalNotes,
          isInternal: true
        }] : []),
        ...(formData.externalNotes ? [{
          noteText: formData.externalNotes,
          isInternal: false
        }] : [])
      ] : undefined,
    };

    try {
      const response = await onSubmit(payload);
      if (response && response.orderReference) {
        createdOrderReferenceRef.current = response.orderReference;
        notify.success(t("orderForm.notify.orderCreated", { reference: response.orderReference }) || `Pedido ${response.orderReference} creado`);
      }
      handleClose();
    } catch (error) {
      notify.error(t("orderForm.notify.submitError") || "Error al crear el pedido");
    }
  };

  const sourceOptions = useMemo(
    () => sources.map(s => ({ value: String(s.orderSourceId), label: `${s.orderSourceId} - ${s.sourceName}` })),
    [sources]
  );
  const actionOptions = useMemo(
    () => actions.map(a => ({ value: String(a.actionId), label: `${a.actionId} - ${a.actionName}` })),
    [actions]
  );
  const customerOptions = useMemo(
    () => customers.map(c => ({
      value: String(c.customerId),
      label: `${c.customerCode} - ${c.customerFirstName} ${c.customerLastName}`,
    })), [customers]
  );

  const customerTypeOptions = useMemo(
    () => customerTypes.map(ct => ({ value: String(ct.typeCode), label: `${ct.typeCode} - ${ct.typeName}` })),
    [customerTypes]
  );

  const priorityTypeOptions = useMemo(
    () => priorityTypes.map(pt => ({ value: String(pt.actionPriorityId), label: `${pt.actionPriorityId} - ${pt.priorityName}` })),
    [priorityTypes]
  );

  const paymentTypeOptions = useMemo(
    () => paymentTypes.map(pt => ({ value: String(pt.orderPaymentTypeId), label: `${pt.orderPaymentTypeId} - ${pt.paymentType}` })),
    [paymentTypes]
  );

  const breadcrumbActions = useMemo(() => (
    <BreadcrumbActions
      formData={formData}
      setFormData={setFormData}
      setFieldError={setFieldError}
      t={t}
      onAddressModalChange={setShowAddressModal}
    />
  ), [formData, setFormData, setFieldError, t]);

  useSetBreadcrumbActions(breadcrumbActions);

  // Bloquear interacción con la página cuando el modal está abierto
  useEffect(() => {
    if (showPromoDialog || showAddressModal) {
      // Obtener el elemento del formulario y bloquear todo excepto el modal
      const formElement = document.querySelector('.form-content');
      if (formElement) {
        (formElement as HTMLElement).style.pointerEvents = 'none';
      }
      
      // Cerrar todos los SearchableSelect dropdowns
      const dropdowns = document.querySelectorAll('.searchable-select-dropdown');
      dropdowns.forEach(dropdown => {
        (dropdown as HTMLElement).style.display = 'none';
      });
      
      // El modal tiene su propio z-index alto y pointer-events: auto, así que sigue siendo interactuable
    } else {
      const formElement = document.querySelector('.form-content');
      if (formElement) {
        (formElement as HTMLElement).style.pointerEvents = 'auto';
      }
    }
    return () => {
      const formElement = document.querySelector('.form-content');
      if (formElement) {
        (formElement as HTMLElement).style.pointerEvents = 'auto';
      }
    };
  }, [showPromoDialog, showAddressModal]);

  return (
    <div
      className="form-content"
      role="main"
      aria-label="Create Order Form"
    >
      {/* BODY GRID */}
      <form id="order-form" onSubmit={handleSubmit} className="shell-body">
          {/* MAIN CONTENT */}
          <div className="content">
            {/* Columna izquierda: Secciones principales */}
            <div className="main-sections" style={{ paddingBottom: "20px"}}>
              {/* SECTION: Datos pedido */}
              <CustomerFields
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setFieldError={setFieldError}
                clearFieldError={clearFieldError}
                handleBlurFixed={handleBlurFixed}
                handleBlurMobile={handleBlurMobile}
                handleBlurEmail={handleBlurEmail}
                applyCustomerSelection={(selected: any, label?: string) => 
                  applyCustomerSelection(selected, label, t, notify)
                }
                customerOptions={customerOptions}
                customers={customers}
                customerTypesOptions={customerTypeOptions}
                sourcesOptions={sourceOptions}
                actionsOptions={actionOptions}
                sourcesLoading={sourcesLoading}
                actionsLoading={actionsLoading}
                customersLoading={customersLoading}
                customerTypesLoading={customerTypesLoading}
                searchSources={searchSources}
                searchActions={searchActions}
                searchCustomers={searchCustomers}
                searchCustomerTypes={searchCustomerTypes}
                handleCBReaderKeyDown={handleCBReaderKeyDown}
                t={t}
                applyActionSelection={applyActionSelection}
                actions={actions}
                notify={notify}
                setOrderSourceId={(id: string) => { setFormData(prev => {return { ...prev, orderSourceId: id };}); }}
              />

              <section className={`section ${showLines ? "" : "section--collapsed"}`}>
                <h3 className="section-title section-title-with-button">
                  {t("orderForm.section.lines") || "Líneas del pedido"}
                  <button
                    type="button"
                    onClick={() => {setShowLines(v => !v);
                    }}
                    aria-expanded={showLines}
                    aria-controls="lines-section"
                    className="collapse-btn"
                    tabIndex={showLines ? 0 : -1}
                    title={showLines ? "Ocultar líneas" : "Mostrar líneas"}
                  >
                    {showLines ? <FaChevronDown style={{ fontSize: "var(--text-xs)" }} /> : <FaChevronUp style={{ fontSize: "var(--text-xs)" }} />}
                  </button>
                </h3>
                {/* Sentinela para abrir con Tab */}
                <div
                  tabIndex={showLines ? -1 : 0}
                  onKeyDown={(e) => {
                    if (!showLines && e.key === "Tab" && !e.shiftKey) {
                      e.preventDefault();          // evita que el Tab avance por su cuenta
                      setShowLines(true);          // abre
                      setPendingFocusLines(true);  // y deja que el useLayoutEffect enfoque
                    }
                  }}
                  onFocus={() => {
                    if (!showLines) {
                      setShowLines(true);
                      setPendingFocusLines(true);
                    }
                  }}
                  aria-hidden={showLines ? true : undefined}
                  style={{ outline: "none" }}
                />
                <div
                  id="lines-body"
                  className="section-collapse"
                  data-collapsed={showLines ? "false" : "true"}
                  aria-hidden={showLines ? undefined : true}
                >
                  <div 
                    className="main-sections-group" 
                    ref={linesTableRef}
                    tabIndex={-1}
                    onBlur={handleLinesBlur}
                    onFocus={handleLinesFocus}
                  >
                    <OrderLinesTable
                      lines={lines}
                      onChange={setLines}
                      onLineAdded={() => {}}
                      onTabOutFromEmptyLine={() => {
                        setPromoStep('ask');
                        setShowPromoDialog(true);
                      }}
                      bavPedido={bavPedido}
                      setBavPedido={setBavPedido}
                      bavImporte={bavImporte}
                      setBavImporte={setBavImporte}
                      showPromoDialog={showPromoDialog}
                    />
                    <div ref={linesEndRef} />
                    <section className="section section--no-border">
                      <OrderTotals
                        subtotal={subtotal}
                        promoDiscount={promoDiscount}
                        clubFee={clubFee}
                        currentCalcPrivilege={privilegeDiscount}
                        totalWithoutBAV={totalWithoutBAV}
                        totalOrder={totalOrder}
                        t={t}
                        shippingCost={formData.shippingCost || 0}
                        mandatoryFee={formData.mandatoryFee || 0}
                        bavPedido={bavPedido}
                        bavImporte={bavImporte}
                        onApplyPromo={() => {
                          setPromoStep('ask');
                          setShowPromoDialog(true);
                        }}
                        onRemovePromo={() => {
                          setPromoDiscount(0);
                          setPromoInput("");
                          setPromoStep('ask');
                        }}
                      />
                    </section>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna derecha: Secciones secundarias */}
            <div className="side-sections">
              <PaymentFields
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                clearFieldError={clearFieldError}
                setFieldError={setFieldError}
                paymentTypeFields={paymentTypeFields}
                paymentTypeOptions={paymentTypeOptions}
                priorityTypeOptions={priorityTypeOptions}
                paymentTypesLoading={paymentTypesLoading}
                priorityTypesLoading={priorityTypesLoading}
                searchPaymentTypes={searchPaymentTypes}
                searchPriorityTypes={searchPriorityTypes}
                t={t}
                selectedPaymentType={selectedPaymentType}
                priorityTypes={priorityTypes}
                applyPriorityTypeSelection={applyPriorityTypeSelection}
                paymentTypes={paymentTypes}
                total={totalOrder}
                fullName={`${formData.customerFirstName || ""} ${formData.customerLastName || ""}`.trim()}
                disabled={!hasValidLines}
                paymentTypeRef={paymentTypeRef}
                notify={notify}
              />
              <TaxesFields
                bi1={vatTotals.bi1}
                tva1={vatTotals.tva1}
                bi2={vatTotals.bi2}
                tva2={vatTotals.tva2}
                t={t}
              />
            </div>
          </div>
        </form>

      
      <PromoDiscountModal
        open={showPromoDialog}
        step={promoStep}
        input={promoInput}
        onClose={() => {
          setShowPromoDialog(false);
          setPromoInput("");
          setPromoStep('ask');
          // Enfocar el primer campo de pago después de cerrar el modal
          setTimeout(() => {
            paymentTypeRef.current?.focus();
          }, 100);
        }}
        onStepChange={setPromoStep}
        onInputChange={setPromoInput}
        onDiscountChange={(discount) => setPromoDiscount(discount)}
        onApply={(discount) => {
          setPromoDiscount(discount);
          setShowPromoDialog(false);
          setPromoInput("");
          setPromoStep('ask');
          // Enfocar el primer campo de pago después de aplicar promoción
          setTimeout(() => {
            paymentTypeRef.current?.focus();
          }, 100);
        }}
        t={t}
      />
    </div>
  );
};