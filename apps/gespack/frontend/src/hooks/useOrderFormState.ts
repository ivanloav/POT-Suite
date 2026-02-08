import { useState, useCallback, useMemo } from "react";
import type { OrderLine } from "../components/orders/CreateOrder/OrderLinesTable";
import { normalizePhone } from '../utils/phone';
import { normalizeEmail, isValidEmail } from '../utils/email';
import type { CountryCode } from 'libphonenumber-js';

export interface UseOrderFormStateProps {
  initialFormData: Record<string, any>;
  initialLines?: OrderLine[];
}

// --- Parseo de DataMatrix en CBReader ---
type ParsedScanCB = {
  actionId?: string;
  customerCode?: string;
  participant?: string;
  customerTypeId?: string;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingFullName?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddressLine3?: string;
  shippingAddressLine4?: string;
  shippingCpCity?: string;
  shippingGender?: string;
  shippingPhone?: string;
  birthDate?: string;
  creditRisk?: string;
  sourceOrigin?: string;
};

export function useOrderFormState({ initialFormData, initialLines = [{line: 1, qty: 1}] }: UseOrderFormStateProps) {
  const initialFormDataRef = useMemo(() => initialFormData, []);
  const initialLinesRef = useMemo(() => initialLines, []);

  // Estado principal del formulario
  const [formData, setFormData] = useState<Record<string, any>>(initialFormDataRef);
  const [lines, setLines] = useState<OrderLine[]>(initialLinesRef);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const parseCBReader = (value: string): ParsedScanCB | null => {
    if (!value) return null;
    const raw = value.trim();
    const parts = raw.split(';').map(p => p.trim());
    if (parts.length < 6) return null;
    const parsedCB: ParsedScanCB = {
      actionId: parts[0] || undefined,
      customerCode: parts[1] || undefined,
      participant: parts[2] || undefined,
      customerTypeId: parts[3] || undefined,
      shippingFirstName: parts[4] || undefined,
      shippingLastName: parts[5] || undefined,
      shippingFullName: parts[6] || undefined,
      shippingAddressLine1: parts[7] || undefined,
      shippingAddressLine2: parts[8] || undefined,
      shippingAddressLine3: parts[9] || undefined,
      shippingAddressLine4: parts[10] || undefined,
      shippingCpCity: parts[11] || undefined,
      shippingGender: parts[12] || undefined,
      shippingPhone: parts[13] || undefined,
      birthDate: parts[14] || undefined,
      creditRisk: parts[15] || undefined,
      sourceOrigin: parts[16] || undefined,
    };
    return parsedCB;
  };

  const applyParsedScanToForm = useCallback((scan: ParsedScanCB, selectCustomerByCode?: (code: string, name: string) => void) => {
  setFormData((prev: Record<string, any>) => ({
      ...prev,
      CBReader: prev.CBReader === "" ? prev.CBReader : "",
      actionId: scan.actionId ? String(scan.actionId) : prev.action,
      participant: scan.participant ?? prev.participant,
      customerCode: scan.customerCode ? String(scan.customerCode) : prev.customerCode,
      customerType: scan.customerTypeId ? String(scan.customerTypeId) : prev.customerType,
      customerTitle: scan.shippingGender === 'MR' ? 'Sr.' : scan.shippingGender === 'F' ? 'Sra.' : prev.customerTitle,
      customerFirstName: scan.shippingFirstName ?? prev.customerFirstName,
      customerLastName: scan.shippingLastName ?? prev.customerLastName,
      customerFullName: scan.shippingFullName ?? prev.customerLabel,
    }));
    
    if (scan.customerCode && selectCustomerByCode) {
      void selectCustomerByCode(String(scan.customerCode), String(scan.shippingFullName));
    }
  }, [setFormData]);

  // Helpers para errores
  const setFieldError = useCallback((name: string, msg: string | null) => {
  setErrors((prev: Record<string, string | null>) => ({ ...prev, [name]: msg }));
  }, []);

  const clearFieldError = useCallback((name: string) => {
    setFieldError(name, null);
  }, [setFieldError]);

  // Reset seguro
  const resetForm = useCallback(() => {
    setLines(initialLinesRef);
    setFormData(initialFormDataRef);
    setErrors({});
  }, [initialFormDataRef, initialLinesRef]);


  const getDefaultCountry = (): CountryCode => {
    const c = (formData.customerCountry || '').trim().toUpperCase();
    // si no hay país o no es ISO-2, forzamos FR (tu caso mayoritario)
    return (c && c.length === 2 ? (c as CountryCode) : 'FR');
  };

  // Sanea teléfono
  const sanitizePhone = (raw: string) => raw.trim().replace(/[^\d+]/g, '');

  // Handler autocontenido para onBlur fijo
  const handleBlurFixed = useCallback((e: React.FocusEvent<HTMLInputElement>, t?: (key: string) => string, notify?: any) => {
    const rawInput = e.target.value || '';
    const raw = sanitizePhone(rawInput);
    if (!raw) {
      setFieldError('customerPhone', null);
      return;
    }
    // Por defecto FR, pero si hay país en formData, úsalo
    const c = (formData.customerCountry || '').trim().toUpperCase();
    const country: CountryCode = (c && c.length === 2 ? (c as CountryCode) : 'FR');
    const r = normalizePhone(raw, country);
    if (r.valid && (r.type === 'FIXED_LINE' || r.type === 'FIXED_LINE_OR_MOBILE' || r.type === undefined)) {
      setFormData((prev: Record<string, any>) => ({ ...prev, customerPhone: r.e164 || raw }));
      setFieldError('customerPhone', null);
    } else {
      const errorMsg = t ? t('orderForm.notify.invalidFixedForCountry') : 'Teléfono fijo inválido para el país seleccionado';
      setFieldError('customerPhone', errorMsg);
      notify && notify.error(errorMsg);
    }
  }, [formData.customerCountry, setFormData, setFieldError]);

  // Handler autocontenido para onBlur móvil
  const handleBlurMobile = useCallback((e: React.FocusEvent<HTMLInputElement>, t?: (key: string) => string, notify?: any) => {
    const rawInput = e.target.value || '';
    const raw = sanitizePhone(rawInput);
    if (!raw) {
      setFieldError('customerMobile', null);
      return;
    }
    const c = (formData.customerCountry || '').trim().toUpperCase();
    const country: CountryCode = (c && c.length === 2 ? (c as CountryCode) : 'FR');
    const r = normalizePhone(raw, country);
    if (r.valid && (r.type === 'MOBILE' || r.type === 'FIXED_LINE_OR_MOBILE' || r.type === undefined)) {
      setFormData((prev: Record<string, any>) => ({ ...prev, customerMobile: r.e164 || raw }));
      setFieldError('customerMobile', null);
    } else {
      const errorMsg = t ? t('orderForm.notify.invalidMobileForCountry') : 'Móvil inválido para el país seleccionado';
      setFieldError('customerMobile', errorMsg);
      notify && notify.error(errorMsg);
    }
  }, [formData.customerCountry, setFormData, setFieldError]);

  // Handler autocontenido para onBlur email
  const handleBlurEmail = useCallback((e: React.FocusEvent<HTMLInputElement>, t?: (key: string) => string, notify?: any) => {
    const raw = e.target.value || '';
    if (!raw.trim()) {
      setFieldError('customerEmail', null);
      return;
    }
    const norm = normalizeEmail(raw);
    if (isValidEmail(norm)) {
      setFormData((prev: Record<string, any>) => ({ ...prev, customerEmail: norm }));
      setFieldError('customerEmail', null);
    } else {
      const errorMsg = t ? t('orderForm.notify.invalidEmail') : 'Email inválido';
      setFieldError('customerEmail', errorMsg);
      notify && notify.error(errorMsg);
    }
  }, [setFormData, setFieldError]);

  // Validación de contactos de cliente
  function validateContactsFromCustomer(
    selected: any,
    countryISO2: CountryCode,
  ) {
    const rawFixed = (selected?.phone || selected?.billingPhone || '').toString().trim();
    const fixedRes  = rawFixed ? normalizePhone(rawFixed, countryISO2) : null;
    const fixedOk   = !!fixedRes && fixedRes.valid && (fixedRes.type === 'FIXED_LINE' || fixedRes.type === 'FIXED_LINE_OR_MOBILE');
    const fixedVal  = fixedOk ? (fixedRes!.e164 || rawFixed) : '';

    const rawMobile = (selected?.shippingMobilePhone || selected?.mobile || '').toString().trim();
    const mobileRes = rawMobile ? normalizePhone(rawMobile, countryISO2) : null;
    const mobileOk  = !!mobileRes && mobileRes.valid && mobileRes.type === 'MOBILE';
    const mobileVal = mobileOk ? (mobileRes!.e164 || rawMobile) : '';

    const rawEmail = (selected?.email || '').toString().trim();
    const emailVal = rawEmail ? normalizeEmail(rawEmail) : '';
    const emailOk  = emailVal ? isValidEmail(emailVal) : true;

    return {
      fixed: { ok: fixedOk, value: fixedVal, raw: rawFixed },
      mobile:{ ok: mobileOk, value: mobileVal, raw: rawMobile },
      email: { ok: emailOk, value: emailOk ? emailVal : '', raw: rawEmail },
    };
  }

  const applyActionSelection = useCallback((selected: any, label?: string) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      //action: String(selected || ""),
      actionId: String(selected?.actionId || ""),
      actionLabel: label || selected || "",
      mandatoryFee: selected?.mandatoryFee != null ? Number(selected.mandatoryFee) : prev.mandatoryFee,
    }));
  }, [setFormData]);

  // Lógica de selección de cliente
  const applyCustomerSelection = useCallback((selected: any, label?: string, t?: (key: string) => string, notify?: any) => {
    const capitalize = (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const parts: string[] = [];
    const customerFullName = selected
      ? `${capitalize(selected?.shippingGender ?? "")} ${capitalize(selected?.customerFirstName ?? "")} ${capitalize(selected?.customerLastName ?? "")}`.trim()
      : "";
    
    if (customerFullName) parts.push(customerFullName);
    if (selected?.shippingAddressLine1) parts.push(selected.shippingAddressLine1);
    if (selected?.shippingAddressLine2) parts.push(selected.shippingAddressLine2);
    if (selected?.shippingAddressLine3) parts.push(selected.shippingAddressLine3);
    if (selected?.shippingAddressLine4) parts.push(selected.shippingAddressLine4);
    // Añadir CP + ciudad al textarea para visualización (pero se guardan por separado)
    const cpCity = [selected?.shippingAddressCp, selected?.shippingAddressCity].filter(Boolean).join(" ");
    if (cpCity) parts.push(cpCity);
    if (selected?.shippingAddressCountry) parts.push(selected.shippingAddressCountry);
    const isoCountry = (selected?.shippingAddressCountryIso || selected?.shippingAddressCountry || "")
      .toString().trim().toUpperCase() as CountryCode || 'FR';
    const contacts = validateContactsFromCustomer(selected, isoCountry);
    // Errores visuales y toasts
    if (contacts.fixed.raw && !contacts.fixed.ok) {
      setFieldError('customerPhone', t ? t("orderForm.notify.invalidFixedForCountry") : 'Teléfono fijo inválido para el país seleccionado');
      notify && notify.error(t ? t("orderForm.notify.invalidFixedForCountry") : 'Teléfono fijo inválido para el país seleccionado');
    } else {
      setFieldError('customerPhone', null);
    }
    if (contacts.mobile.raw && !contacts.mobile.ok) {
      setFieldError('customerMobile', t ? t("orderForm.notify.invalidMobileForCountry") : 'Móvil inválido para el país seleccionado');
      notify && notify.error(t ? t("orderForm.notify.invalidMobileForCountry") : 'Móvil inválido para el país seleccionado');
    } else {
      setFieldError('customerMobile', null);
    }
    if (contacts.email.raw && !contacts.email.ok) {
      setFieldError('customerEmail', t ? t("orderForm.notify.invalidEmail") : 'Email inválido');
      notify && notify.error(t ? t("orderForm.notify.invalidEmail") : 'Email inválido');
    } else {
      setFieldError('customerEmail', null);
    }
  setFormData((prev: Record<string, any>) => {
    
    return {
      ...prev,
      customer: selected?.customerId || null,
      customerGender: selected?.shippingGender || selected?.gender || "",
      customerFirstName: selected?.customerFirstName || "",
      customerLastName: selected?.customerLastName || "",
      customerLabel: label || `${selected?.customerCode} - ${customerFullName}`,
      customerCode: String(selected?.customerCode || ""),
      customerAddress: parts.join("\n"),
      customerPostalCode: selected?.shippingAddressCp || "",
      customerCity: selected?.shippingAddressCity || "",
      customerPhone:  contacts.fixed.ok  ? contacts.fixed.value  : (contacts.fixed.raw  || prev.customerPhone),
      customerMobile: contacts.mobile.ok ? contacts.mobile.value : (contacts.mobile.raw || prev.customerMobile),
      customerEmail:  contacts.email.ok  ? contacts.email.value  : (contacts.email.raw  || prev.customerEmail),
      customerCountry: isoCountry || prev.customerCountry || "FR",
      customerMarkedName: selected?.markedName || "",
      isPrivilege: selected?.privileged === true
        ? t ? t("orderForm.yes") : "SI"
        : t ? t("orderForm.no") : "NO",
      // Guardar el objeto customer completo para acceder a billingAddress en el modal
      selectedCustomerData: selected || null,
    };
  });
  }, [setFormData, setFieldError]);

  // Puedes añadir aquí más lógica de validación, normalización, etc.

  // --- Resolver origen desde escaneo (debe ir después de los helpers) ---
  const resolveSourceFromScan = useCallback(
    async (
      raw: string,
      searchSources: (q: string) => Promise<any>,
      notify: { error: (msg: string) => void }
    ) => {
      if (!raw) return null;

      const results = await searchSources(raw);

      const norm = raw.trim().toUpperCase();
      const match = results.find((s: any) =>
        s.sourceName.trim().toUpperCase() === norm ||
        String(s.orderSourceId) === String(raw)
      );

      if (match) {
        setFormData(prev => ({ ...prev, source: String(match.orderSourceId) }));
        setFieldError("source", null);
      } else {
        setFormData(prev => ({ ...prev, source: "" }));
        setFieldError("source", `Origen "${raw}" no encontrado`);
        notify.error(`Origen "${raw}" no encontrado`);
      }
    },
    [setFormData, setFieldError]
  );

  const applyPriorityTypeSelection = useCallback((selected: any, label?: string) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      priorityTypes: String(selected || ""),
      priorityTypeId: String(selected?.actionPriorityId || ""),
      priorityTypeLabel: label || selected || "",
      shippingCost: selected?.shippingCost != null ? Number(selected.shippingCost) : prev.shippingCost,
    }));
  }, [setFormData]);

  // --- Selección de cliente por código: debe ir después de los helpers ---
  const selectCustomerByCode = useCallback(
    async (
      code: string,
      name: string,
      searchCustomers: (q: string) => Promise<any>,
      t?: (key: string) => string,
      notify?: any
    ) => {
      if (!code) return;

      // busca en backend (no dependes de que customers esté precargado)
      const results = await searchCustomers(String(code));

      // match exacto por customerCode
      const selected = results.find((r: any) => String(r.customerCode) === String(code));

      if (!selected) {
        if (notify) notify.error(`Cliente ${code} - ${name} no encontrado`);
        setFormData((prev: Record<string, any>) => ({
          ...prev,
          customer: "",
          customerLabel: "",
          customerCode: ""
        }));
        setFieldError("customer", t ? t("orderForm.notify.customerNotFound") : `Cliente \"${code}\" no encontrado`);
        return;
      }

      // misma etiqueta que verías en el select
      const label = `${selected.customerCode} - ${selected.customerFirstName ?? ""} ${selected.customerLastName ?? ""}`.trim();

      // reutiliza la misma lógica de selección
      applyCustomerSelection(selected, label, t, notify);
    },
    [setFormData, setFieldError, applyCustomerSelection]
  );

  return {
    formData,
    setFormData,
    lines,
    setLines,
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    resetForm,
    applyCustomerSelection,
    validateContactsFromCustomer,
    getDefaultCountry,
    handleBlurFixed,
    handleBlurMobile,
    handleBlurEmail,
    parseCBReader,
    applyParsedScanToForm,
    selectCustomerByCode,
    resolveSourceFromScan,
    applyActionSelection,
    applyPriorityTypeSelection,
  };
}
