const XLSX = require('xlsx');

// Datos de ejemplo
const examples = [
  { 'OS Family': 'Windows', 'Name': 'Windows 11 Pro 26H2', 'Is Active': 'Sí' },
  { 'OS Family': 'macOS', 'Name': 'macOS Sequoia 15.8', 'Is Active': 'Sí' },
  { 'OS Family': 'Linux', 'Name': 'Ubuntu 24.04 LTS', 'Is Active': 'Sí' },
  { 'OS Family': 'Android', 'Name': 'Android 15', 'Is Active': 'Sí' },
  { 'OS Family': 'iOS', 'Name': 'iOS 18.3', 'Is Active': 'Sí' },
];

// Familias disponibles
const families = [
  { 'Available OS Families': 'Windows' },
  { 'Available OS Families': 'macOS' },
  { 'Available OS Families': 'Linux' },
  { 'Available OS Families': 'Android' },
  { 'Available OS Families': 'iOS' },
  { 'Available OS Families': 'VMWare' },
];

// Crear workbook
const wb = XLSX.utils.book_new();

// Hoja de ejemplos
const ws1 = XLSX.utils.json_to_sheet(examples);
ws1['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, ws1, 'OS Versions');

// Hoja de familias disponibles
const ws2 = XLSX.utils.json_to_sheet(families);
ws2['!cols'] = [{ wch: 25 }];
XLSX.utils.book_append_sheet(wb, ws2, 'OS Families');

// Guardar archivo
XLSX.writeFile(wb, 'files/os-versions-template.xlsx');
console.log('✅ Archivo os-versions-template.xlsx creado en /files');
