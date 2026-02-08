/**
 * Obtiene el color de badge para un sitio basado en su código
 * @param siteCode - Código del sitio (ej: 'POT', 'SCAMP')
 * @returns Clases CSS de Tailwind para el badge
 */
export const getSiteColor = (siteCode: string) => {
  // Mapeo manual de colores por site
  const siteColors: Record<string, string> = {
    'POT': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'SCAMP': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    // Añade más sites aquí con sus colores personalizados
  };

  // Si el site tiene color asignado, usarlo
  if (siteColors[siteCode]) {
    return siteColors[siteCode];
  }

  // Colores por defecto para sites no especificados
  const defaultColors = [
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ];
  
  const hash = siteCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultColors[hash % defaultColors.length];
};

/**
 * Obtiene las clases CSS del badge de status según su colorClass definido en la BD
 * @param colorClass - Clases CSS del status (ej: 'bg-green-100 text-green-800')
 * @returns Clases CSS de Tailwind para el badge
 */
export const getStatusBadgeColor = (colorClass?: string) => {
  return colorClass || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

export const getOSFamilyColor = (familyCode: string) => {
  const familyColors: Record<string, string> = {
    'macOS': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Windows': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'iOS': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Android': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    // Añade más sites aquí con sus colores personalizados
  };

  // Si el site tiene color asignado, usarlo
  if (familyColors[familyCode]) {
    return familyColors[familyCode];
  }
  
  // Colores por defecto para familias no especificadas
  const defaultColors = [
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ];
  
  const hash = familyCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultColors[hash % defaultColors.length];
};

