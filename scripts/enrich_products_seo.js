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

// Leer datos de SEO
const tiendaSEOPath = path.join(__dirname, '..', 'docs', 'tiendaSEO.csv');
const tiendaSEOData = parseCSV(fs.readFileSync(tiendaSEOPath, 'utf8'));

// Leer archivo de productos existente
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
let productosContent = fs.readFileSync(productosPath, 'utf8');

// Mapear datos de SEO a productos
let enrichedSEOCount = 0;

// Crear mapa para búsqueda rápida
const seoMap = new Map();
tiendaSEOData.forEach(item => {
  if (item['ID']) {
    seoMap.set(item['ID'].toLowerCase(), item);
  }
});

console.log(`Total de productos en tiendaSEO.csv: ${seoMap.size}`);

// Buscar y enriquecer productos con SEO
productosContent = productosContent.replace(/(\w+):\s*{\s*id:\s*['"]([^'"]+)['"],([^}]*)}/g, (match, varName, id, rest) => {
  const lowerId = id.toLowerCase();
  const seoItem = seoMap.get(lowerId);
  if (seoItem) {
    enrichedSEOCount++;
    console.log(`Enriqueciendo producto ID: ${id} (${varName}) con datos de SEO`);
    
    // Extraer datos de SEO del CSV
    const seo = {
      title: seoItem['Título SEO'] || '',
      description: seoItem['Descripción SEO'] || '',
      keywords: seoItem['Palabras Clave'] || '',
      imageAlt: seoItem['Texto Alternativo Imagen'] || '',
      url: seoItem['URL'] || ''
    };

    // Convertir a string con formato adecuado
    let seoStr = 'seo: {';
    Object.entries(seo).forEach(([key, value]) => {
      if (value) {
        // Escapar comillas y saltos de línea
        const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, ' ');
        seoStr += `\n        ${key}: "${escapedValue}",`;
      }
    });
    seoStr += '\n      }';

    // Añadir el campo de SEO al objeto del producto
    if (rest.trim().endsWith(',')) {
      return `${varName}: {\n    id: "${id}",${rest}\n    ${seoStr},\n  }`;
    } else {
      return `${varName}: {\n    id: "${id}",${rest},\n    ${seoStr},\n  }`;
    }
  }
  return match;
});

console.log(`Se enriquecieron ${enrichedSEOCount} productos con datos de SEO`);

// Escribir archivo actualizado
fs.writeFileSync(productosPath, productosContent);
console.log(`Archivo productos.ts actualizado con datos de SEO`);

// Actualizar informe de enriquecimiento
const reportPath = path.join(__dirname, 'enrichment_report.txt');
const currentReport = fs.readFileSync(reportPath, 'utf8');
const updatedReport = `${currentReport}
Productos enriquecidos con SEO: ${enrichedSEOCount}
`;
fs.writeFileSync(reportPath, updatedReport);
console.log(`Informe de enriquecimiento actualizado en ${reportPath}`);
