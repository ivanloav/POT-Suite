// src/utils/phone.ts
import { parsePhoneNumberFromString, CountryCode, PhoneNumber } from 'libphonenumber-js/max';

// Normaliza a E.164 si es posible. Si no hay prefijo, usa defaultCountry (p.ej. "FR")
export function normalizePhone(
  raw: string,
  defaultCountry: CountryCode = 'FR'
): {
  e164: string | null;
  valid: boolean;
  type: PhoneNumber['getType'] extends (...args: any[]) => infer R ? R : string | undefined;
  country: CountryCode | undefined;
  phone: PhoneNumber | null;
} {
  const trimmed = (raw || '').trim();
  if (!trimmed) return { e164: null, valid: false, type: undefined, country: undefined, phone: null };

  // intenta parsear: si empieza por + usa internacional; si no, usa defaultCountry
  const phone = parsePhoneNumberFromString(trimmed, trimmed.startsWith('+') ? undefined : defaultCountry);

  if (!phone) return { e164: null, valid: false, type: undefined, country: undefined, phone: null };
  
  const result = {
    e164: phone.isValid() ? phone.number : null,
    valid: phone.isValid(),
    type: phone.getType?.(),
    country: phone.country,
    phone,
  };

  //console.log('[normalizePhone] input:', raw, 'trimmed:', trimmed, 'result:', result);

  return result;
}

// Conveniencias
export function isValidFixed(raw: string, defaultCountry: CountryCode = 'FR') {
  const r = normalizePhone(raw, defaultCountry);
  // Acepta fijo claro, fijo/móvil o sin tipo (pero válido)
  return r.valid && (r.type === 'FIXED_LINE' || r.type === 'FIXED_LINE_OR_MOBILE' || r.type === undefined);
}

export function isValidMobile(raw: string, defaultCountry: CountryCode = 'FR') {
  const r = normalizePhone(raw, defaultCountry);
  // Acepta móvil claro, fijo/móvil o sin tipo (pero válido)
  return r.valid && (r.type === 'MOBILE' || r.type === 'FIXED_LINE_OR_MOBILE' || r.type === undefined);
}