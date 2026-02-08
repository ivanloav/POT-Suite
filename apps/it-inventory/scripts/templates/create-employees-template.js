const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Ejemplos con comentarios
const employeesExamples = [
  {
    'Site ID': '⚠️ CONSULTAR SELECTOR DE SEDE',
    'First Name': 'Juan',
    'Last Name': 'Pérez',
    'Second Last Name': 'García',
    'Email': 'juan.perez@empresa.com',
    'Phone': '612345678',
    'Is Active': 'true',
    'Notes': 'EJEMPLO: Empleado del departamento de TI',
  },
  {
    'Site ID': '',
    'First Name': 'María',
    'Last Name': 'González',
    'Second Last Name': 'López',
    'Email': 'maria.gonzalez@empresa.com',
    'Phone': '687654321',
    'Is Active': 'true',
    'Notes': 'EJEMPLO: Empleada del departamento de administración',
  },
  {
    'Site ID': '',
    'First Name': 'Carlos',
    'Last Name': 'Martínez',
    'Second Last Name': '',
    'Email': '',
    'Phone': '',
    'Is Active': 'true',
    'Notes': '',
  },
];

// Definir instrucciones
const instructions = [
  { Field: 'Site ID', Required: 'Yes', Description: 'ID de la sede (número)' },
  { Field: 'First Name', Required: 'Yes', Description: 'Nombre del empleado' },
  { Field: 'Last Name', Required: 'Yes', Description: 'Primer apellido' },
  { Field: 'Second Last Name', Required: 'No', Description: 'Segundo apellido (opcional)' },
  { Field: 'Email', Required: 'No', Description: 'Correo electrónico (único, opcional)' },
  { Field: 'Phone', Required: 'No', Description: 'Teléfono de contacto' },
  { Field: 'Is Active', Required: 'No', Description: 'true o false (por defecto: true)' },
  { Field: 'Notes', Required: 'No', Description: 'Notas adicionales o comentarios' },
];

// Crear el workbook
const workbook = XLSX.utils.book_new();

// Crear hoja de ejemplos
const examplesSheet = XLSX.utils.json_to_sheet(employeesExamples);
XLSX.utils.book_append_sheet(workbook, examplesSheet, 'Employees');

// Crear hoja de instrucciones
const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

// Ajustar ancho de columnas
examplesSheet['!cols'] = [
  { wch: 35 },  // Site ID (con advertencia)
  { wch: 15 },  // First Name
  { wch: 15 },  // Last Name
  { wch: 18 },  // Second Last Name
  { wch: 30 },  // Email
  { wch: 15 },  // Phone
  { wch: 12 },  // Is Active
  { wch: 50 },  // Notes
];
instructionsSheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 60 }];

// Directorio de salida
const outputDir = path.join(__dirname, '../../files');
const outputPath = path.join(outputDir, 'employees-template.xlsx');

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Escribir el archivo
XLSX.writeFile(workbook, outputPath);

console.log('✅ Plantilla de empleados creada exitosamente en:', outputPath);
console.log(`   - Hoja 1: "Employees" con ${employeesExamples.length} ejemplos`);
console.log('   - Hoja 2: "Instructions" con descripción de campos');
