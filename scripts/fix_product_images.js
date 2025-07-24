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

// Mapear datos de imágenes a productos
let imageFixedCount = 0;

// Crear mapa para búsqueda rápida
const imageMap = new Map();
tiendaSEOData.forEach(item => {
  if (item['ID'] && item['Imagen']) {
    imageMap.set(item['ID'].toLowerCase(), item['Imagen']);
  }
});

console.log(`Total de productos con imágenes en tiendaSEO.csv: ${imageMap.size}`);

// Buscar y actualizar imágenes de productos
productosContent = productosContent.replace(/(\w+):\s*{\s*id:\s*['"]([^'"]+)['"],([^}]*)(images:\s*\[([^\]]*?)\])([^}]*)}/g, (match, varName, id, before, imagesKey, imagesValue, after) => {
  const lowerId = id.toLowerCase();
  const imageUrl = imageMap.get(lowerId);
  if (imageUrl && !imagesValue.includes(imageUrl)) {
    imageFixedCount++;
    console.log(`Actualizando imagen para producto ID: ${id} (${varName})`);
    const updatedImages = `[ "${imageUrl}" ]`;
    return `${varName}: {
    id: "${id}",${before}${imagesKey}${updatedImages}${after}}`;
  }
  return match;
});

console.log(`Se actualizaron imágenes para ${imageFixedCount} productos`);

// Escribir archivo actualizado
fs.writeFileSync(productosPath, productosContent);
console.log(`Archivo productos.ts actualizado con URLs de imágenes`);

// Actualizar informe de enriquecimiento
const reportPath = path.join(__dirname, 'enrichment_report.txt');
const currentReport = fs.readFileSync(reportPath, 'utf8');
const updatedReport = `${currentReport}
Productos con URLs de imágenes actualizadas: ${imageFixedCount}
`;
fs.writeFileSync(reportPath, updatedReport);
console.log(`Informe de enriquecimiento actualizado en ${reportPath}`);
