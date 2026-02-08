// utils/email.ts
import isEmail from 'validator/es/lib/isEmail';

export function normalizeEmail(value: string): string {
  return value.trim();
}

export function isValidEmail(value: string): boolean {
  const v = normalizeEmail(value);
  return v !== '' && isEmail(v, { allow_utf8_local_part: false });
}