const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Ejemplos con comentarios - IMPORTANTE: Los IDs deben existir en tu base de datos
const assetsExamples = [
  {
    'Site ID': '⚠️ CONSULTAR SELECTOR DE SEDE',
    'Asset Tag': 'LAP-001',
    'Employee ID': '⚠️ ID del empleado (si está asignado)',
    'Type ID': '⚠️ CONSULTAR CATÁLOGOS (Laptop, Desktop, etc.)',
    'Section ID': '⚠️ ID de sección/departamento',
    'Model ID': '⚠️ DEBE PERTENECER AL TYPE SELECCIONADO',
    'OS Version ID': '⚠️ CONSULTAR CATÁLOGOS > S.O.',
    'CPU ID': '⚠️ ID del procesador (si aplica)',
    'RAM ID': '⚠️ ID de la memoria RAM (si aplica)',
    'Storage ID': '⚠️ ID del almacenamiento (si aplica)',
    'Serial': 'SN123456789',
    'IMEI': '',
    'MAC Address': '00:1A:2B:3C:4D:5E',
    'IP Address': '192.168.1.100',
    'UUID': '',
    'Status ID': '1 = En Stock, 2 = Asignado, 3 = Reparación, 4 = Retirado',
    'Purchase Date': '2024-01-15',
    'Warranty End': '2027-01-15',
    'Location': 'Oficina Principal - Piso 2',
    'Notes': 'EJEMPLO: Laptop Dell Latitude para desarrollo',
  },
  {
    'Site ID': '',
    'Asset Tag': 'PC-002',
    'Employee ID': '',
    'Type ID': '',
    'Section ID': '',
    'Model ID': '',
    'OS Version ID': '',
    'CPU ID': '',
    'RAM ID': '',
    'Storage ID': '',
    'Serial': 'SN987654321',
    'IMEI': '',
    'MAC Address': '00:1A:2B:3C:4D:5F',
    'IP Address': '192.168.1.101',
    'UUID': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Status ID': '1',
    'Purchase Date': '2024-02-20',
    'Warranty End': '2027-02-20',
    'Location': 'Sala de Servidores',
    'Notes': 'EJEMPLO: PC de escritorio HP para diseño gráfico',
  },
  {
    'Site ID': '',
    'Asset Tag': 'MOB-003',
    'Employee ID': '',
    'Type ID': '',
    'Section ID': '',
    'Model ID': '',
    'OS Version ID': '',
    'CPU ID': '',
    'RAM ID': '',
    'Storage ID': '',
    'Serial': '',
    'IMEI': '123456789012345',
    'MAC Address': '',
    'IP Address': '',
    'UUID': '',
    'Status ID': '2',
    'Purchase Date': '2024-03-10',
    'Warranty End': '2026-03-10',
    'Location': 'Asignado a empleado',
    'Notes': 'EJEMPLO: iPhone 15 Pro para ejecutivo',
  },
];

// Definir instrucciones
const instructions = [
  { Field: 'Site ID', Required: 'Yes', Description: 'ID de la sede (número)' },
  { Field: 'Asset Tag', Required: 'Yes', Description: 'Etiqueta única del activo' },
  { Field: 'Employee ID', Required: 'No', Description: 'ID del empleado al que está asignado (si aplica)' },
  { Field: 'Type ID', Required: 'Yes', Description: 'ID del tipo de activo (1=Laptop, 2=Desktop, 3=Workstation, 4=Server, 5=Mobile, 6=Tablet, 7=PDA, 8=Monitor, 9=Printer, 10=Network, 11=Other)' },
  { Field: 'Section ID', Required: 'No', Description: 'ID de la sección/ubicación (consultar catálogo de secciones)' },
  { Field: 'Model ID', Required: 'No', Description: 'ID del modelo del activo - DEBE pertenecer al Type ID seleccionado' },
  { Field: 'OS Version ID', Required: 'No', Description: 'ID de la versión del sistema operativo (consultar Catálogos > S.O.)' },
  { Field: 'CPU ID', Required: 'No', Description: 'ID del procesador (consultar catálogo de CPUs)' },
  { Field: 'RAM ID', Required: 'No', Description: 'ID de la memoria RAM (consultar catálogo de RAM)' },
  { Field: 'Storage ID', Required: 'No', Description: 'ID del almacenamiento (consultar catálogo de Storage)' },
  { Field: 'Serial', Required: 'No', Description: 'Número de serie del dispositivo (único)' },
  { Field: 'IMEI', Required: 'No', Description: 'IMEI para dispositivos móviles (único, 15 dígitos)' },
  { Field: 'MAC Address', Required: 'No', Description: 'Dirección MAC de red (formato: XX:XX:XX:XX:XX:XX)' },
  { Field: 'IP Address', Required: 'No', Description: 'Dirección IP asignada (formato: X.X.X.X)' },
  { Field: 'UUID', Required: 'No', Description: 'UUID del dispositivo (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)' },
  { Field: 'Status ID', Required: 'No', Description: 'ID del estado: 1=En Stock, 2=Asignado, 3=En Reparación, 4=Retirado (por defecto: 1)' },
  { Field: 'Purchase Date', Required: 'No', Description: 'Fecha de compra en formato YYYY-MM-DD (ej: 2024-01-15)' },
  { Field: 'Warranty End', Required: 'No', Description: 'Fecha fin de garantía en formato YYYY-MM-DD' },
  { Field: 'Location', Required: 'No', Description: 'Ubicación física del activo' },
  { Field: 'Notes', Required: 'No', Description: 'Notas adicionales o comentarios' },
];

// Crear el workbook
const workbook = XLSX.utils.book_new();

// Crear hoja de ejemplos
const examplesSheet = XLSX.utils.json_to_sheet(assetsExamples);
XLSX.utils.book_append_sheet(workbook, examplesSheet, 'Assets');

// Crear hoja de instrucciones
const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

// Ajustar ancho de columnas
examplesSheet['!cols'] = [
  { wch: 35 },  // Site ID (con advertencia)
  { wch: 12 },  // Asset Tag
  { wch: 12 },  // Employee ID
  { wch: 40 },  // Type ID (con advertencia)
  { wch: 12 },  // Section ID
  { wch: 35 },  // Model ID (con advertencia)
  { wch: 30 },  // OS Version ID (con advertencia)
  { wch: 12 },  // CPU ID
  { wch: 12 },  // RAM ID
  { wch: 12 },  // Storage ID
  { wch: 18 },  // Serial
  { wch: 18 },  // IMEI
  { wch: 20 },  // MAC Address
  { wch: 15 },  // IP Address
  { wch: 38 },  // UUID
  { wch: 50 },  // Status ID (con leyenda)
  { wch: 15 },  // Purchase Date
  { wch: 15 },  // Warranty End
  { wch: 30 },  // Location
  { wch: 45 },  // Notes
];

instructionsSheet['!cols'] = [
  { wch: 18 },  // Field
  { wch: 10 },  // Required
  { wch: 80 },  // Description
];

// Asegurar que existe el directorio files
const filesDir = path.join(__dirname, '../../files');
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

// Guardar el archivo
const outputPath = path.join(filesDir, 'assets-template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Plantilla de activos creada exitosamente en: ${outputPath}`);
console.log(`   - Hoja 1: "Assets" con ${assetsExamples.length} ejemplos`);
console.log(`   - Hoja 2: "Instructions" con descripción de campos`);
