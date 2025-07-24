const fs = require('fs');
const path = require('path');

console.log('🔄 MAPEANDO PRODUCTOS A CATEGORÍAS DEL tiendaSEO.csv');
console.log('================================================');

// Leer el archivo tiendaSEO.csv
const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Leer el catálogo actual de productos
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// Extraer productos del CSV con su información de categoría
const lines = csvContent.split('\n');
let headerLineIndex = -1;
let productColumnIndex = -1;
let categoryColumnIndex = -1;
let skuColumnIndex = -1;

// Encontrar headers
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('SKU,PRODUCTO,CATEGORIA')) {
    headerLineIndex = i;
    const headers = line.split(',');
    skuColumnIndex = headers.findIndex(h => h.trim().toUpperCase() === 'SKU');
    productColumnIndex = headers.findIndex(h => h.trim().toUpperCase() === 'PRODUCTO');
    categoryColumnIndex = headers.findIndex(h => h.trim().toUpperCase() === 'CATEGORIA');
    console.log(`📍 Headers encontrados en línea ${i + 1}`);
    break;
  }
}

if (headerLineIndex === -1) {
  console.log('❌ No se encontraron los headers del CSV');
  process.exit(1);
}

// Extraer productos del CSV
const csvProducts = [];
for (let i = headerLineIndex + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV con comillas
  const columns = [];
  let currentColumn = '';
  let insideQuotes = false;
  
  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      columns.push(currentColumn.trim());
      currentColumn = '';
    } else {
      currentColumn += char;
    }
  }
  columns.push(currentColumn.trim());
  
  if (columns.length > Math.max(skuColumnIndex, productColumnIndex, categoryColumnIndex)) {
    const sku = columns[skuColumnIndex]?.trim();
    const producto = columns[productColumnIndex]?.trim();
    const categoria = columns[categoryColumnIndex]?.trim();
    
    if (sku && producto && categoria) {
      csvProducts.push({
        sku,
        producto: producto.toUpperCase(), // Normalizar para comparación
        categoria,
        original: columns[productColumnIndex]?.trim()
      });
    }
  }
}

console.log(`📊 Productos extraídos del CSV: ${csvProducts.length}`);

// Normalizar categorías para matching con los IDs de filtros
const normalizeCategory = (categoria) => {
  return categoria.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Crear mapeo de categorías CSV a IDs normalizados
const categoryMapping = {};
csvProducts.forEach(p => {
  const normalizedId = normalizeCategory(p.categoria);
  categoryMapping[p.categoria] = normalizedId;
});

console.log('\n🗂️  Mapeo de categorías CSV:');
Object.keys(categoryMapping).forEach(cat => {
  console.log(`"${cat}" → "${categoryMapping[cat]}"`);
});

// Función para normalizar nombres de productos para comparación
const normalizeProductName = (name) => {
  return name.toUpperCase()
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U')
    .replace(/Ñ/g, 'N')
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Encontrar matches entre CSV y catálogo actual
console.log('\n🔍 BUSCANDO COINCIDENCIAS ENTRE CSV Y CATÁLOGO:');
console.log('==============================================');

// Extraer productos del catálogo actual usando regex
const productMatches = productosContent.match(/"nombre":\s*"([^"]+)"/g);
const currentProducts = productMatches ? productMatches.map(match => {
  const result = match.match(/"nombre":\s*"([^"]+)"/);
  return result ? result[1] : null;
}).filter(Boolean) : [];

console.log(`📦 Productos en catálogo actual: ${currentProducts.length}`);

// Mapear productos
const mappings = [];
const unmatchedCSV = [];
const unmatchedCatalog = [];

csvProducts.forEach(csvProd => {
  const normalizedCSV = normalizeProductName(csvProd.producto);
  
  // Buscar coincidencia exacta primero
  let match = currentProducts.find(catProd => 
    normalizeProductName(catProd) === normalizedCSV
  );
  
  // Buscar coincidencia parcial si no hay exacta
  if (!match) {
    match = currentProducts.find(catProd => {
      const normalizedCat = normalizeProductName(catProd);
      return normalizedCat.includes(normalizedCSV.split(' ')[0]) || 
             normalizedCSV.includes(normalizedCat.split(' ')[0]);
    });
  }
  
  if (match) {
    mappings.push({
      catalogProduct: match,
      csvProduct: csvProd.original,
      categoria: csvProd.categoria,
      categoryId: categoryMapping[csvProd.categoria],
      sku: csvProd.sku
    });
  } else {
    unmatchedCSV.push(csvProd);
  }
});

// Productos del catálogo no encontrados en CSV
currentProducts.forEach(catProd => {
  const found = mappings.find(m => m.catalogProduct === catProd);
  if (!found) {
    unmatchedCatalog.push(catProd);
  }
});

console.log(`✅ Productos mapeados: ${mappings.length}`);
console.log(`❌ Productos del CSV sin match: ${unmatchedCSV.length}`);
console.log(`⚠️  Productos del catálogo sin categoría CSV: ${unmatchedCatalog.length}`);

// Mostrar mapeos encontrados
console.log('\n📋 MAPEOS ENCONTRADOS:');
console.log('====================');
mappings.slice(0, 10).forEach(m => {
  console.log(`"${m.catalogProduct}" → ${m.categoria} (${m.categoryId})`);
});
if (mappings.length > 10) {
  console.log(`... y ${mappings.length - 10} más`);
}

// Mostrar productos del CSV sin match
if (unmatchedCSV.length > 0) {
  console.log('\n❌ PRODUCTOS DEL CSV SIN MATCH EN CATÁLOGO:');
  console.log('=========================================');
  unmatchedCSV.slice(0, 10).forEach(p => {
    console.log(`"${p.original}" (${p.categoria})`);
  });
  if (unmatchedCSV.length > 10) {
    console.log(`... y ${unmatchedCSV.length - 10} más`);
  }
}

// Mostrar productos del catálogo sin categoría CSV
if (unmatchedCatalog.length > 0) {
  console.log('\n⚠️  PRODUCTOS DEL CATÁLOGO SIN CATEGORÍA CSV:');
  console.log('==========================================');
  unmatchedCatalog.slice(0, 10).forEach(p => {
    console.log(`"${p}"`);
  });
  if (unmatchedCatalog.length > 10) {
    console.log(`... y ${unmatchedCatalog.length - 10} más`);
  }
}

// Guardar resultado
const result = {
  mappings,
  unmatchedCSV,
  unmatchedCatalog,
  categoryMapping,
  stats: {
    csvProducts: csvProducts.length,
    catalogProducts: currentProducts.length,
    mapped: mappings.length,
    unmatchedCSV: unmatchedCSV.length,
    unmatchedCatalog: unmatchedCatalog.length
  }
};

fs.writeFileSync(
  path.join(__dirname, 'product_category_mapping.json'),
  JSON.stringify(result, null, 2)
);

console.log('\n✅ RESULTADO GUARDADO EN: scripts/product_category_mapping.json');
console.log('\n📊 RESUMEN:');
console.log(`   • Productos del CSV: ${csvProducts.length}`);
console.log(`   • Productos del catálogo: ${currentProducts.length}`);
console.log(`   • Mapeos exitosos: ${mappings.length}`);
console.log(`   • Productos CSV sin match: ${unmatchedCSV.length}`);
console.log(`   • Productos catálogo sin categoría CSV: ${unmatchedCatalog.length}`);

const successRate = ((mappings.length / csvProducts.length) * 100).toFixed(1);
console.log(`   • Tasa de éxito: ${successRate}%`);

if (mappings.length > 0) {
  console.log('\n🎯 SIGUIENTE PASO: Ejecutar script de actualización del catálogo');
}
