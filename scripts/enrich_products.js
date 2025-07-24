const fs = require('fs');
const path = require('path');

// Función para parsear CSV a JSON
const parseCSV = (data) => {
  const lines = data.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split(',').map(value => value.trim());
    if (line.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = line[index];
      });
      result.push(obj);
    }
  }

  return result;
};

// Leer datos de trazabilidad
const trazabiliPath = path.join(__dirname, '..', 'docs', 'trazabili.csv');
const trazabiliData = parseCSV(fs.readFileSync(trazabiliPath, 'utf8'));

// Leer datos de SEO
const tiendaSEOPath = path.join(__dirname, '..', 'docs', 'tiendaSEO.csv');
const tiendaSEOData = parseCSV(fs.readFileSync(tiendaSEOPath, 'utf8'));

// Leer archivo de productos existente
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
let productosContent = fs.readFileSync(productosPath, 'utf8');

// Mapear datos de trazabilidad y SEO a productos
let enrichedCount = 0;
let imageFixedCount = 0;

// Crear mapas para búsqueda rápida
const trazabiliMap = new Map();
trazabiliData.forEach(item => {
  if (item['ID Producto']) {
    trazabiliMap.set(item['ID Producto'].toLowerCase(), item);
  }
});

console.log(`Total de productos en trazabili.csv: ${trazabiliMap.size}`);

// Buscar y enriquecer productos
productosContent = productosContent.replace(/(\w+):\s*{\s*id:\s*['"]([^'"]+)['"],([^}]*)}/g, (match, varName, id, rest) => {
  const lowerId = id.toLowerCase();
  const trazabiliItem = trazabiliMap.get(lowerId);
  if (trazabiliItem) {
    enrichedCount++;
    console.log(`Enriqueciendo producto ID: ${id} (${varName}) con datos de trazabilidad`);
    
    // Extraer datos de trazabilidad del CSV
    const traceability = {
      origin: trazabiliItem['Origen'] || '',
      farmer: trazabiliItem['Agricultor'] || '',
      region: trazabiliItem['Región'] || '',
      practices: trazabiliItem['Prácticas'] || '',
      harvestDate: trazabiliItem['Fecha Cosecha'] || '',
      certifications: trazabiliItem['Certificaciones'] || '',
      story: trazabiliItem['Historia'] || '',
      impact: trazabiliItem['Impacto'] || ''
    };

    // Convertir a string con formato adecuado
    let traceabilityStr = 'traceability: {';
    Object.entries(traceability).forEach(([key, value]) => {
      if (value) {
        // Escapar comillas y saltos de línea
        const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, ' ');
        traceabilityStr += `\n        ${key}: "${escapedValue}",`;
      }
    });
    traceabilityStr += '\n      }';

    // Añadir el campo de trazabilidad al objeto del producto
    if (rest.trim().endsWith(',')) {
      return `${varName}: {\n    id: "${id}",${rest}\n    ${traceabilityStr},\n  }`;
    } else {
      return `${varName}: {\n    id: "${id}",${rest},\n    ${traceabilityStr},\n  }`;
    }
  }
  return match;
});

console.log(`Se enriquecieron ${enrichedCount} productos con datos de trazabilidad`);

// Escribir archivo actualizado
fs.writeFileSync(productosPath, productosContent);
console.log(`Archivo productos.ts actualizado con datos de trazabilidad`);

// Crear informe de enriquecimiento
const reportPath = path.join(__dirname, 'enrichment_report.txt');
fs.writeFileSync(reportPath, `Informe de Enriquecimiento de Productos - Fase 2\n\nProductos enriquecidos con trazabilidad: ${enrichedCount}\n`);
console.log(`Informe de enriquecimiento creado en ${reportPath}`);
