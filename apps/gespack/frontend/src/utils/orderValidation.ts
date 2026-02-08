/**
 * Utilidades para validación de pedidos
 */

import type { OrderLine } from '../components/orders/CreateOrder/OrderLinesTable';

export interface OrderValidationErrors {
  field: string;
  message: string;
}

/**
 * Valida los campos requeridos de un pedido
 * @param formData Datos del formulario
 * @param lines Líneas del pedido
 * @param t Función de traducción
 * @returns Array de errores (vacío si no hay errores)
 */
export function validateOrderForm(
  formData: any,
  lines: OrderLine[],
  t: (key: string) => string
): OrderValidationErrors[] {
  const errors: OrderValidationErrors[] = [];

  if (!formData.orderSourceId) {
    errors.push({
      field: 'orderSourceId',
      message: t("orderForm.requiredField") || "Este campo es obligatorio"
    });
  }

  if (!formData.actionId) {
    errors.push({
      field: 'action',
      message: t("orderForm.requiredField") || "Este campo es obligatorio"
    });
  }

  if (!formData.customer) {
    errors.push({
      field: 'customer',
      message: t("orderForm.requiredField") || "Este campo es obligatorio"
    });
  }

  // Validar líneas
  const hasValidLines = lines.some(l => l.reference && (l.qty ?? 0) > 0);
  if (!hasValidLines) {
    errors.push({
      field: 'lines',
      message: t("orderForm.notify.noLines") || "El pedido debe tener al menos una línea con cantidad"
    });
  }

  if (!formData.priorityTypes) {
    errors.push({
      field: 'priorityTypes',
      message: t("orderForm.requiredField") || "Este campo es obligatorio"
    });
  }

  if (!formData.paymentTypes) {
    errors.push({
      field: 'paymentTypes',
      message: t("orderForm.requiredField") || "Este campo es obligatorio"
    });
  }

  // Validar cuotas si pago aplazado
  if (formData.isDeferredPayment === t("orderForm.yes") && !formData.deferredPaymentInstallments) {
    errors.push({
      field: 'deferredPaymentInstallments',
      message: t("orderForm.requiredField") || "Este campo es obligatorio"
    });
  }

  return errors;
}

/**
 * Construye el objeto de pago con los campos dinámicos
 * @param formData Datos del formulario
 * @param paymentTypeFields Campos dinámicos del tipo de pago
 * @param siteId ID del sitio
 * @param userId ID del usuario
 * @param t Función de traducción
 * @returns Objeto de pago
 */
export function buildPaymentObject(
  formData: any,
  paymentTypeFields: any[],
  siteId: string | number,
  userId: string | number,
  t: (key: string) => string
): any {
  const parseMoneyValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const str = String(value)
      .replace(/[€$\s]/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');
    
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  };

  const payment: any = {
    siteId: typeof siteId === 'string' ? parseInt(siteId, 10) : siteId,
    orderId: 0,
    paymentTypeId: formData.paymentTypes ? parseInt(String(formData.paymentTypes), 10) : 1,
    isDeferred: formData.isDeferredPayment === t("orderForm.yes"),
    scheduleCount: formData.isDeferredPayment === t("orderForm.yes") && formData.deferredPaymentInstallments
      ? parseInt(String(formData.deferredPaymentInstallments), 10)
      : 1,
    createdBy: String(userId),
    createdAt: new Date().toISOString(),
  };

  // Agregar campos específicos según el tipo de pago
  paymentTypeFields.forEach((field) => {
    const fieldValue = formData[field.fieldName];
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      switch (field.fieldName) {
        case 'chequeNumber':
          payment.chequeNumber = String(fieldValue);
          break;
        case 'titularTarjeta':
          payment.holderName = String(fieldValue);
          break;
        case 'numTarjeta':
          payment.cardNumber = String(fieldValue);
          break;
        case 'caducidadTarjeta':
          payment.expirationDate = String(fieldValue);
          break;
        case 'codVerificacion':
          payment.securityCode = Number(fieldValue);
          break;
        case 'importeTarjeta':
          payment.amount = parseMoneyValue(fieldValue);
          break;
        case 'cardTypeId':
          payment[field.fieldName] = parseInt(String(fieldValue), 10);
          break;
        default:
          payment[field.fieldName] = fieldValue;
          break;
      }
    }
  });

  return payment;
}
