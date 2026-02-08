/**
 * Utilidades para formateo de direcciones en pedidos
 */

import type { OrderAddress } from '../types/orders';

/**
 * Formatea las direcciones de facturación y envío para enviar al backend
 * @param formData Datos del formulario
 * @returns Objeto con direcciones formateadas
 */
export function formatAddressesForBackend(formData: any): OrderAddress | undefined {
  const customer = formData.selectedCustomerData;
  if (!customer) return undefined;

  // Parsear dirección de envío desde el textarea
  const addressLines = (formData.customerAddress || '').split('\n').filter((line: string) => line.trim());
  
  return {
    // Dirección de facturación
    billingCustomerName: formData.billingCustomerName || 
      (customer.billingFirstName && customer.billingLastName 
        ? `${customer.billingFirstName} ${customer.billingLastName}`.trim()
        : customer.customerFirstName && customer.customerLastName
        ? `${customer.customerFirstName} ${customer.customerLastName}`.trim()
        : ''),
    billingAddressLine1: formData.billingAddressLine1 || customer.billingAddressLine1 || '',
    billingAddressLine2: formData.billingAddressLine2 || customer.billingAddressLine2 || '',
    billingAddressLine3: formData.billingAddressLine3 || customer.billingAddressLine3 || '',
    billingAddressLine4: formData.billingAddressLine4 || customer.billingAddressLine4 || '',
    billingAddressLine5: formData.billingAddressLine5 || customer.billingAddressLine5 || '',
    billingPostalCode: formData.billingPostalCode || customer.billingAddressCp || '',
    billingCity: formData.billingCity || customer.billingAddressCity || '',
    billingMobilePhone: formData.billingMobilePhone || customer.billingMobilePhone || '',
    
    // Dirección de envío
    shippingCustomerName: addressLines[0] || `${formData.customerFirstName || ''} ${formData.customerLastName || ''}`.trim(),
    shippingAddressLine1: addressLines[1] || '',
    shippingAddressLine2: addressLines[2] || '',
    shippingAddressLine3: addressLines[3] || '',
    shippingAddressLine4: addressLines[4] || '',
    shippingAddressLine5: addressLines[5] || '',
    shippingPostalCode: formData.customerPostalCode || '',
    shippingCity: formData.customerCity || '',
    shippingMobilePhone: formData.customerMobile || '',
  };
}

/**
 * Determina el tipo de transporte WMS basado en la prioridad y peso
 * @param priorityName Nombre de la prioridad (NORMAL, PRIORITARIO, EXPRESS)
 * @param totalWeight Peso total del pedido en gramos
 * @returns Código de transporte WMS
 */
export function getTransportWMS(priorityName: string | undefined, totalWeight: number): string {
  switch (priorityName) {
    case 'NORMAL':
      return totalWeight < 2000 ? 'ASEND' : 'COL6AF';
    case 'PRIORITARIO':
      return 'COL6AF';
    case 'EXPRESS':
      return 'CHR18';
    default:
      return 'ASEND';
  }
}

/**
 * Limpia valores de moneda (ej: "47,70 €" -> 47.70)
 * @param value Valor a parsear (string o number)
 * @returns Número parseado
 */
export function parseMoneyValue(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const str = String(value)
    .replace(/[€$\s]/g, '')      // Quitar símbolos de moneda y espacios
    .replace(/\./g, '')           // Quitar puntos (separadores de miles)
    .replace(/,/g, '.');          // Cambiar coma decimal por punto
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}
