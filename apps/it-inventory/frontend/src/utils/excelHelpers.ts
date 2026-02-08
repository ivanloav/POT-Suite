import * as XLSX from 'xlsx';

/**
 * Lee un archivo Excel y lo convierte a JSON
 */
export const parseExcelFile = async (file: File): Promise<any[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  return json;
};

/**
 * Transforma un asset a formato Excel con nombres legibles
 */
export const transformAssetForExport = (asset: any) => ({
  'ID': asset.id || '',
  'Site ID': asset.siteId || '',
  'Site': asset.site?.code || '',
  'Etiqueta': asset.assetTag || '',
  'Tipo ID': asset.typeId || '',
  'Tipo': asset.type?.name || '',
  'Modelo ID': asset.modelId || '',
  'Modelo': asset.model ? `${asset.model.brand?.name || ''} ${asset.model.model || ''}`.trim() : '',
  'Sección ID': asset.sectionId || '',
  'Sección': asset.section?.name || '',
  'Estado ID': asset.statusId || '',
  'Estado': asset.status?.name || '',
  'Empleado ID': asset.employeeId || '',
  'Empleado': asset.employee ? `${asset.employee.firstName || ''} ${asset.employee.lastName || ''} ${asset.employee.secondLastName || ''}`.trim() : '',
  'Serial': asset.serial || '',
  'IMEI': asset.imei || '',
  'MAC Address': asset.macAddress || '',
  'IP Address': asset.ipAddress || '',
  'UUID': asset.uuid || '',
  'OS Version ID': asset.osVersionId || '',
  'Sistema Operativo': asset.osVersion ? `${asset.osVersion.osFamily?.name || ''} ${asset.osVersion.name || ''}`.trim() : '',
  'CPU ID': asset.cpuId || '',
  'CPU': asset.cpu ? `${asset.cpu.vendor || ''} ${asset.cpu.name || ''}`.trim() : '',
  'RAM ID': asset.ramId || '',
  'RAM': asset.ram ? `${asset.ram.capacityGb}GB ${asset.ram.memType || ''} ${asset.ram.speedMts ? `@ ${asset.ram.speedMts}MT/s` : ''} (${asset.ram.formFactor || ''})`.trim() : '',
  'Storage ID': asset.storageId || '',
  'Almacenamiento': asset.storage ? `${asset.storage.capacityGb}GB ${asset.storage.driveType || ''} ${asset.storage.interface || ''} (${asset.storage.formFactor || ''})`.trim() : '',
  'Fecha Compra': asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '',
  'Fin Garantía': asset.warrantyEnd ? new Date(asset.warrantyEnd).toLocaleDateString() : '',
  'Ubicación': asset.location || '',
  'Notas': asset.notes || '',
  'Fecha Creación': asset.createdAt ? new Date(asset.createdAt).toLocaleString() : '',
  'Última Actualización': asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : '',
});

/**
 * Exporta una lista de activos a Excel
 */
export const exportAssetsToExcel = (assets: any[], fileName?: string) => {
  if (!assets || assets.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  // Ordenar por ID y transformar datos
  const sortedData = [...assets].sort((a: any, b: any) => a.id - b.id);
  const exportData = sortedData.map(transformAssetForExport);

  // Crear libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activos');

  // Ajustar ancho de columnas
  const maxWidth = 50;
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(Math.max(key.length, 10), maxWidth)
  }));
  worksheet['!cols'] = colWidths;

  // Descargar archivo
  const finalFileName = fileName || `activos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, finalFileName);

  return exportData.length;
};

/**
 * Exporta una lista de empleados a Excel
 */
export const exportEmployeesToExcel = (employees: any[], fileName?: string) => {
  if (!employees || employees.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  // Ordenar por ID y transformar datos
  const sortedData = [...employees].sort((a: any, b: any) => a.id - b.id);
  const exportData = sortedData.map((employee: any) => ({
    'ID': employee.id || '',
    'Site ID': employee.siteId || '',
    'Site': employee.site?.code || '',
    'Nombre': employee.firstName || '',
    'Apellido Paterno': employee.lastName || '',
    'Apellido Materno': employee.secondLastName || '',
    'Email': employee.email || '',
    'Teléfono': employee.phone || '',
    'Sección ID': employee.sectionId || '',
    'Sección': employee.section?.name || '',
    'Fecha Ingreso': employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '',
    'Activo': employee.isActive ? 'Sí' : 'No',
    'Fecha Creación': employee.createdAt ? new Date(employee.createdAt).toLocaleString() : '',
    'Última Actualización': employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : '',
  }));

  // Crear libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');

  // Ajustar ancho de columnas
  const maxWidth = 50;
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(Math.max(key.length, 10), maxWidth)
  }));
  worksheet['!cols'] = colWidths;

  // Descargar archivo
  const finalFileName = fileName || `empleados_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, finalFileName);

  return exportData.length;
};
