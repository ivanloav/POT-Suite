/**
 * Decorador helper para manejar errores en controladores de forma centralizada.
 * 
 * @remarks
 * Este decorador envuelve métodos de controlador para manejar errores automáticamente
 * y devolver respuestas estandarizadas usando buildResponse y buildErrorResponse.
 */

import { I18nContext } from 'nestjs-i18n';
import { buildResponse, buildErrorResponse } from './response-builder';

/**
 * Ejecuta una operación y maneja errores retornando respuesta estandarizada
 * @param operation - Función async que ejecuta la operación
 * @param i18n - Contexto de i18n para traducciones
 * @param successKey - Clave de traducción para mensaje de éxito
 * @param errorKey - Clave de traducción para mensaje de error
 */
export async function handleControllerOperation<T>(
  operation: () => Promise<T>,
  i18n: I18nContext,
  successKey: string,
  errorKey: string,
  includeTotal?: boolean
) {
  try {
    const result = await operation();
    
    // Si el resultado es un objeto con data y total
    if (includeTotal && typeof result === 'object' && result !== null && 'data' in result && 'total' in result) {
      const { data, total } = result as any;
      return buildResponse(data, await i18n.t(successKey), total);
    }
    
    return buildResponse(result, await i18n.t(successKey));
  } catch (error) {
    return buildErrorResponse(await i18n.t(errorKey), error);
  }
}
