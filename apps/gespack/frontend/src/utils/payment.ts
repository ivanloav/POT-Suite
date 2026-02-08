/**
 * Validaciones relacionadas con pagos
 */

/**
 * Valida si un tipo de pago es compatible con pago diferido
 * @param paymentTypeName Nombre del tipo de pago en mayúsculas
 * @returns true si es compatible, false si no lo es
 */
export function isPaymentTypeCompatibleWithDeferred(paymentTypeName: string): boolean {
  const normalizedName = paymentTypeName.toUpperCase();
  return normalizedName !== 'EFECTIVO' && normalizedName !== 'CASH';
}

/**
 * Valida si un tipo de pago requiere campos adicionales
 * @param paymentTypeName Nombre del tipo de pago
 * @returns true si requiere campos adicionales
 */
export function paymentTypeRequiresFields(paymentTypeName: string): boolean {
  const normalizedName = paymentTypeName.toUpperCase();
  return normalizedName === 'VISA' || normalizedName === 'CHEQUE';
}

/**
 * Algoritmo de Luhn para validar números de tarjeta
 * @param cardNumber Número de tarjeta (puede contener espacios o guiones)
 * @returns true si la tarjeta es válida según el algoritmo de Luhn
 */
export function isValidLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, "");
  
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }
  
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Formatea un número de tarjeta con espacios cada 4 dígitos
 * @param cardNumber Número de tarjeta
 * @returns Número formateado
 */
export function formatCardNumber(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\D/g, "");
  return sanitized.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * Valida una fecha de expiración de tarjeta (MM/YY o MM/YYYY)
 * @param expirationDate Fecha en formato MM/YY o MM/YYYY
 * @returns true si la fecha es válida y no ha expirado
 */
export function isValidExpirationDate(expirationDate: string): boolean {
  const parts = expirationDate.split('/');
  
  if (parts.length !== 2) {
    return false;
  }
  
  const month = parseInt(parts[0], 10);
  let year = parseInt(parts[1], 10);
  
  // Si el año tiene 2 dígitos, convertir a 4 (asumiendo 20XX)
  if (year < 100) {
    year += 2000;
  }
  
  // Validar mes
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Validar que no haya expirado
  const now = new Date();
  const expiry = new Date(year, month - 1); // Los meses en Date empiezan en 0
  
  return expiry >= now;
}

/**
 * Valida el código de seguridad de una tarjeta (CVV/CVC)
 * @param securityCode Código de seguridad
 * @returns true si tiene 3 o 4 dígitos
 */
export function isValidSecurityCode(securityCode: string): boolean {
  const sanitized = securityCode.replace(/\D/g, "");
  return sanitized.length === 3 || sanitized.length === 4;
}
