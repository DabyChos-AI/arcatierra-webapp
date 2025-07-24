const fs = require('fs');
const path = require('path');

// Leer informe de enriquecimiento
const reportPath = path.join(__dirname, 'enrichment_report.txt');
const reportContent = fs.readFileSync(reportPath, 'utf8');

console.log('Resumen del Informe de Enriquecimiento de Productos - Fase 2');
console.log('---------------------------------------------------------');
console.log(reportContent);
console.log('---------------------------------------------------------');
console.log('Fin del Resumen');
