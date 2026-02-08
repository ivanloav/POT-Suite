/**
 * Utilidades para trabajar con objetos
 */

/**
 * Verifica si un valor es un objeto plano
 */
export const isPlainObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Elimina propiedades undefined de un objeto
 */
export const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

/**
 * Filtra propiedades de un objeto según una función predicado
 */
export const filterObject = <T extends Record<string, any>>(
  obj: T,
  predicate: (key: string, value: any) => boolean
): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (predicate(key, value)) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

/**
 * Selecciona solo las propiedades especificadas de un objeto
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Pick<T, K>);
};

/**
 * Omite las propiedades especificadas de un objeto
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Verifica si dos objetos son iguales (comparación superficial)
 */
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!isPlainObject(obj1) || !isPlainObject(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
};
