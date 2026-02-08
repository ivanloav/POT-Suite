/**
 * Funciones de utilidad para crear respuestas API estandarizadas.
 * 
 * @remarks
 * Este archivo proporciona funciones para construir respuestas consistentes en las APIs,
 * tanto para respuestas exitosas como para errores. Úsalo para mantener un formato uniforme
 * en las respuestas de tus endpoints.
 * 
 * @example
 * // Para una respuesta exitosa:
 * const response = buildResponse(data, 'Datos obtenidos correctamente', total);
 * 
 * @example
 * // Para una respuesta de error:
 * const errorResponse = buildErrorResponse('No se pudo obtener los datos', error);
 */
export function buildResponse<T>(data: T, message: string, total?: number) {
  return {
    success: true,
    data,
    message,
    ...(typeof total === 'number' ? { total } : {})
  };
}

export function buildErrorResponse(message: string, error?: any) {
  return {
    success: false,
    message,
    error: error?.message ?? null,
  };
}