const fs = require('fs');
const path = require('path');

console.log('🎯 SINCRONIZACIÓN PRECISA DE CATEGORÍAS CON tiendaSEO.csv');
console.log('=======================================================');

// Leer archivos
const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// PASO 1: Extraer productos del CSV con información completa
console.log('\n📊 PASO 1: EXTRAYENDO PRODUCTOS DEL CSV');
console.log('=====================================');

const lines = csvContent.split('\n');
let headerLineIndex = -1;

// Encontrar headers
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('SKU,PRODUCTO,CATEGORIA')) {
    headerLineIndex = i;
    console.log(`📍 Headers encontrados en línea ${i + 1}`);
    break;
  }
}

const csvProducts = [];
if (headerLineIndex !== -1) {
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV básico
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
    
    if (columns.length >= 3) {
      const sku = columns[0]?.trim();
      const producto = columns[1]?.trim();
      const categoria = columns[2]?.trim();
      
      if (sku && producto && categoria) {
        csvProducts.push({
          sku,
          producto,
          categoria,
          // Normalizar categoria para matching con filtros
          categoryId: categoria.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        });
      }
    }
  }
}

console.log(`✅ Productos extraídos del CSV: ${csvProducts.length}`);

// PASO 2: Agrupar productos del CSV por categoría
console.log('\n📋 PASO 2: PRODUCTOS POR CATEGORÍA EN CSV');
console.log('=========================================');

const categoriesFromCSV = {};
csvProducts.forEach(p => {
  if (!categoriesFromCSV[p.categoria]) {
    categoriesFromCSV[p.categoria] = [];
  }
  categoriesFromCSV[p.categoria].push(p);
});

Object.keys(categoriesFromCSV).sort().forEach(cat => {
  const count = categoriesFromCSV[cat].length;
  console.log(`🏷️  ${cat}: ${count} productos`);
});

// PASO 3: Extraer productos del catálogo actual
console.log('\n📦 PASO 3: EXTRAYENDO PRODUCTOS DEL CATÁLOGO ACTUAL');
console.log('=================================================');

// Extraer productos usando regex más precisa
const productRegex = /{\s*"id":\s*"([^"]+)",\s*"nombre":\s*"([^"]+)",[\s\S]*?"categoria":\s*"([^"]+)"/g;
const catalogProducts = [];
let match;

while ((match = productRegex.exec(productosContent)) !== null) {
  catalogProducts.push({
    id: match[1],
    nombre: match[2],
    categoria: match[3]
  });
}

console.log(`✅ Productos en catálogo actual: ${catalogProducts.length}`);

// PASO 4: Mostrar categorías actuales del catálogo
const currentCategories = {};
catalogProducts.forEach(p => {
  if (!currentCategories[p.categoria]) {
    currentCategories[p.categoria] = [];
  }
  currentCategories[p.categoria].push(p);
});

console.log('\n🏷️  CATEGORÍAS ACTUALES EN CATÁLOGO:');
Object.keys(currentCategories).sort().forEach(cat => {
  const count = currentCategories[cat].length;
  console.log(`   ${cat}: ${count} productos`);
});

// PASO 5: Análisis de desincronización
console.log('\n⚖️  PASO 5: ANÁLISIS DE DESINCRONIZACIÓN');
console.log('=====================================');

const csvCategoriesSet = new Set(Object.keys(categoriesFromCSV));
const catalogCategoriesSet = new Set(Object.keys(currentCategories));

const categoriesOnlyInCSV = [...csvCategoriesSet].filter(cat => !catalogCategoriesSet.has(cat));
const categoriesOnlyInCatalog = [...catalogCategoriesSet].filter(cat => !csvCategoriesSet.has(cat));
const commonCategories = [...csvCategoriesSet].filter(cat => catalogCategoriesSet.has(cat));

console.log(`📊 Categorías solo en CSV: ${categoriesOnlyInCSV.length}`);
categoriesOnlyInCSV.forEach(cat => {
  console.log(`   ❌ "${cat}" (${categoriesFromCSV[cat].length} productos)`);
});

console.log(`\n📊 Categorías solo en catálogo: ${categoriesOnlyInCatalog.length}`);
categoriesOnlyInCatalog.forEach(cat => {
  console.log(`   ⚠️  "${cat}" (${currentCategories[cat].length} productos)`);
});

console.log(`\n📊 Categorías comunes: ${commonCategories.length}`);
commonCategories.forEach(cat => {
  console.log(`   ✅ "${cat}" - CSV: ${categoriesFromCSV[cat].length}, Catálogo: ${currentCategories[cat].length}`);
});

// PASO 6: Propuesta de sincronización
console.log('\n🔧 PASO 6: PROPUESTA DE SINCRONIZACIÓN');
console.log('====================================');

console.log('\n📋 ACCIONES REQUERIDAS:');

console.log('\n1️⃣ PRODUCTOS DEL CSV QUE FALTAN EN CATÁLOGO:');
const missingProducts = [];
csvProducts.forEach(csvProd => {
  // Buscar si existe un producto similar en el catálogo
  const similarProduct = catalogProducts.find(catProd => {
    const csvNorm = csvProd.producto.toLowerCase().replace(/[^a-z0-9]/g, '');
    const catNorm = catProd.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    return csvNorm.includes(catNorm.slice(0, 5)) || catNorm.includes(csvNorm.slice(0, 5));
  });
  
  if (!similarProduct) {
    missingProducts.push(csvProd);
  }
});

console.log(`   Total productos faltantes: ${missingProducts.length}`);
missingProducts.slice(0, 10).forEach(p => {
  console.log(`   + ${p.producto} (${p.categoria})`);
});
if (missingProducts.length > 10) {
  console.log(`   ... y ${missingProducts.length - 10} más`);
}

console.log('\n2️⃣ PRODUCTOS DEL CATÁLOGO QUE NECESITAN RECATEGORIZACIÓN:');
const needsRecategorization = catalogProducts.filter(catProd => 
  categoriesOnlyInCatalog.includes(catProd.categoria)
);

console.log(`   Total productos a recategorizar: ${needsRecategorization.length}`);
needsRecategorization.slice(0, 10).forEach(p => {
  console.log(`   📝 "${p.nombre}" (${p.categoria} → ¿?)`);
});
if (needsRecategorization.length > 10) {
  console.log(`   ... y ${needsRecategorization.length - 10} más`);
}

// Guardar análisis completo
const analysis = {
  csvStats: {
    totalProducts: csvProducts.length,
    categories: Object.keys(categoriesFromCSV),
    productsByCategory: categoriesFromCSV
  },
  catalogStats: {
    totalProducts: catalogProducts.length,
    categories: Object.keys(currentCategories),
    productsByCategory: currentCategories
  },
  synchronization: {
    categoriesOnlyInCSV,
    categoriesOnlyInCatalog,
    commonCategories,
    missingProducts,
    needsRecategorization
  }
};

fs.writeFileSync(
  path.join(__dirname, 'categories_sync_analysis.json'),
  JSON.stringify(analysis, null, 2)
);

console.log('\n✅ ANÁLISIS COMPLETO GUARDADO EN: scripts/categories_sync_analysis.json');

console.log('\n🎯 RESUMEN EJECUTIVO:');
console.log(`   • Productos en CSV: ${csvProducts.length}`);
console.log(`   • Productos en catálogo: ${catalogProducts.length}`);
console.log(`   • Categorías en CSV: ${Object.keys(categoriesFromCSV).length}`);
console.log(`   • Categorías en catálogo: ${Object.keys(currentCategories).length}`);
console.log(`   • Productos faltantes: ${missingProducts.length}`);
console.log(`   • Productos a recategorizar: ${needsRecategorization.length}`);

console.log('\n🚀 SIGUIENTE PASO: Implementar sincronización automática');
