const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Crear libro de trabajo
const workbook = XLSX.utils.book_new();

// Datos de la plantilla
const templateData = [
  ['Asset ID', 'Employee ID', 'Site ID', 'Assigned At (YYYY-MM-DD HH:mm)', 'Comment'],
  ['1', '1', '1', '2026-01-22 14:00', 'Asignación de ejemplo'],
  ['', '', '', '', 'Puede dejar vacío Assigned At para usar fecha actual'],
];

// Crear hoja de cálculo
const worksheet = XLSX.utils.aoa_to_sheet(templateData);

// Ajustar anchos de columna
worksheet['!cols'] = [
  { wch: 12 },  // Asset ID
  { wch: 15 },  // Employee ID
  { wch: 10 },  // Site ID
  { wch: 30 },  // Assigned At
  { wch: 40 },  // Comment
];

// Agregar hoja al libro
XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignments');

// Guardar archivo
const outputPath = path.join(__dirname, '../../files/assignments-template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Plantilla de asignaciones creada: ${outputPath}`);
