/**
 * Utilidades para parsear y normalizar tipos de datos.
 * 
 * @remarks
 * Estas funciones centralizan la lógica de conversión de tipos
 * que se reciben desde query params o DTOs, evitando duplicación de código.
 */

/**
 * Convierte un valor desconocido a boolean o undefined.
 * @param v - El valor a convertir
 * @returns boolean si es válido, undefined en caso contrario
 */
export function parseBool(v: unknown): boolean | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  return undefined;
}

/**
 * Convierte un valor desconocido a number o undefined.
 * @param v - El valor a convertir
 * @returns number si es válido, undefined en caso contrario
 */
export function parseNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Parsea un rango de fechas en formato "from..to"
 * @param dateRange - String con formato "from..to" o solo "from"
 * @returns Objeto con from y to como strings opcionales
 */
export function parseDateRange(dateRange?: string): { from?: string; to?: string } {
  if (!dateRange) return {};
  
  const s = String(dateRange).trim();
  if (s.includes('..')) {
    const [a, b] = s.split('..');
    return {
      from: a || undefined,
      to: b || undefined,
    };
  }
  
  return { from: s };
}
