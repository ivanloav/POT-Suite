// Date helpers centralizados con Day.js
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Plugins y configuración (una sola vez aquí)
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
try {
  // Si tienes soporte de TZ, fija la de Madrid.
  (dayjs as any).tz?.setDefault?.('Europe/Madrid');
} catch {}

/**
 * Formatea un ISO en "DD/MM/YYYY HH:mm" (24h) en la TZ local.
 * Si el valor no es válido, devuelve el original para no ocultar errores.
 */
export const formatDateHour = (iso?: string): string => {
  if (!iso) return "-";
  const d = dayjs(iso);
  if (!d.isValid()) return String(iso);
  // Usa tz() si está disponible, si no, formatea en local
  const withTz = (dayjs as any).tz ? d.tz() : d;
  return withTz.format('DD/MM/YYYY HH:mm');
};

export const formatDate = (iso?: string): string => {
  if (!iso) return "-";
  const d = dayjs(iso);
  if (!d.isValid()) return String(iso);
  // Usa tz() si está disponible, si no, formatea en local
  const withTz = (dayjs as any).tz ? d.tz() : d;
  return withTz.format('DD/MM/YYYY');
};

/**
 * YYYY-MM-DD para filtros/rangos (inicio de día)
 */
export const fmtYMD = (d: Date): string => {
  return dayjs(d).format('YYYY-MM-DD');
};