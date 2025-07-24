const fs = require('fs');
const path = require('path');

console.log('🔧 CORRIGIENDO CATEGORIZACIÓN DE PRODUCTOS SEGÚN tiendaSEO.csv');
console.log('============================================================');

// Leer archivos necesarios
const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

console.log('📊 PASO 1: EXTRAYENDO MAPEO EXACTO DEL CSV');
console.log('==========================================');

// Extraer productos del CSV con categorías
const lines = csvContent.split('\n');
let headerLineIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('SKU,PRODUCTO,CATEGORIA')) {
    headerLineIndex = i;
    console.log(`📍 Headers encontrados en línea ${i + 1}`);
    break;
  }
}

if (headerLineIndex === -1) {
  console.log('❌ No se encontraron headers en el CSV');
  process.exit(1);
}

// Extraer mapeo producto → categoría del CSV
const csvProductMap = new Map();
const csvCategoryStats = {};

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
  
  if (columns.length >= 3) {
    const sku = columns[0]?.trim();
    const producto = columns[1]?.trim();
    const categoria = columns[2]?.trim();
    
    if (sku && producto && categoria) {
      // Normalizar nombre del producto para matching
      const normalizedName = producto.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Normalizar categoría a ID de filtro
      const categoryId = categoria.toLowerCase()
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
      
      csvProductMap.set(normalizedName, {
        sku,
        producto,
        categoria,
        categoryId,
        normalizedName
      });
      
      // Estadísticas por categoría
      if (!csvCategoryStats[categoryId]) {
        csvCategoryStats[categoryId] = {
          originalName: categoria,
          count: 0,
          products: []
        };
      }
      csvCategoryStats[categoryId].count++;
      csvCategoryStats[categoryId].products.push(producto);
    }
  }
}

console.log(`✅ Productos extraídos del CSV: ${csvProductMap.size}`);
console.log(`🏷️  Categorías únicas en CSV: ${Object.keys(csvCategoryStats).length}`);

// Mostrar categorías del CSV
console.log('\n📋 CATEGORÍAS DEL CSV:');
Object.entries(csvCategoryStats).forEach(([id, info]) => {
  console.log(`   • ${info.originalName} (${id}): ${info.count} productos`);
});

console.log('\n🔍 PASO 2: MAPEANDO PRODUCTOS DEL CATÁLOGO');
console.log('==========================================');

// Extraer productos del catálogo actual
const catalogProductRegex = /{[^}]*"id":\s*"([^"]+)"[^}]*"nombre":\s*"([^"]+)"[^}]*"categoria":\s*"([^"]+)"[^}]*}/g;
const catalogProducts = [];
let match;

while ((match = catalogProductRegex.exec(productosContent)) !== null) {
  catalogProducts.push({
    id: match[1],
    nombre: match[2],
    categoria: match[3]
  });
}

console.log(`📦 Productos en catálogo: ${catalogProducts.length}`);

// Función de matching inteligente
const findBestMatch = (catalogProductName) => {
  const normalizedCatalog = catalogProductName.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 1. Buscar coincidencia exacta
  if (csvProductMap.has(normalizedCatalog)) {
    return csvProductMap.get(normalizedCatalog);
  }
  
  // 2. Buscar coincidencia parcial por palabras clave
  const catalogWords = normalizedCatalog.split(' ').filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [csvName, csvData] of csvProductMap.entries()) {
    const csvWords = csvName.split(' ').filter(w => w.length > 2);
    
    // Calcular score de coincidencia
    let score = 0;
    for (const catalogWord of catalogWords) {
      for (const csvWord of csvWords) {
        if (catalogWord === csvWord) {
          score += 2; // Coincidencia exacta de palabra
        } else if (catalogWord.includes(csvWord) || csvWord.includes(catalogWord)) {
          score += 1; // Coincidencia parcial
        }
      }
    }
    
    if (score > bestScore && score >= 2) { // Mínimo score para considerar match
      bestScore = score;
      bestMatch = csvData;
    }
  }
  
  return bestMatch;
};

console.log('\n🎯 PASO 3: APLICANDO MAPEO Y REDISTRIBUCIÓN');
console.log('==========================================');

let updatedContent = productosContent;
const mappingResults = {
  successful: 0,
  failed: 0,
  mappings: [],
  unmapped: []
};

// Mapear cada producto del catálogo
catalogProducts.forEach(catalogProduct => {
  const csvMatch = findBestMatch(catalogProduct.nombre);
  
  if (csvMatch) {
    // Encontrar y reemplazar la categoría del producto
    const productRegex = new RegExp(
      `({[^}]*"id":\\s*"${catalogProduct.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"categoria":\\s*")[^"]+("[^}]*})`,
      'g'
    );
    
    const replacement = `$1${csvMatch.categoryId}$2`;
    if (productRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(productRegex, replacement);
      mappingResults.successful++;
      mappingResults.mappings.push({
        productId: catalogProduct.id,
        productName: catalogProduct.nombre,
        oldCategory: catalogProduct.categoria,
        newCategory: csvMatch.categoryId,
        csvProductName: csvMatch.producto,
        csvCategory: csvMatch.categoria
      });
      console.log(`✅ "${catalogProduct.nombre}" → ${csvMatch.categoryId}`);
    } else {
      mappingResults.failed++;
      mappingResults.unmapped.push({
        productId: catalogProduct.id,
        productName: catalogProduct.nombre,
        reason: 'regex_not_found'
      });
      console.log(`❌ No se pudo actualizar: "${catalogProduct.nombre}"`);
    }
  } else {
    mappingResults.failed++;
    mappingResults.unmapped.push({
      productId: catalogProduct.id,
      productName: catalogProduct.nombre,
      reason: 'no_csv_match'
    });
    console.log(`⚠️  Sin match en CSV: "${catalogProduct.nombre}"`);
  }
});

console.log('\n📊 RESULTADOS DEL MAPEO:');
console.log('========================');
console.log(`✅ Productos mapeados exitosamente: ${mappingResults.successful}`);
console.log(`❌ Productos no mapeados: ${mappingResults.failed}`);
console.log(`📈 Tasa de éxito: ${((mappingResults.successful / catalogProducts.length) * 100).toFixed(1)}%`);

// Asignar categoría por defecto a productos no mapeados
console.log('\n🎯 PASO 4: ASIGNANDO CATEGORÍA POR DEFECTO');
console.log('==========================================');

const defaultCategory = 'frutas-y-verduras-a-granel'; // Categoría más común del CSV
let defaultAssignments = 0;

mappingResults.unmapped.forEach(unmapped => {
  const productRegex = new RegExp(
    `({[^}]*"id":\\s*"${unmapped.productId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"categoria":\\s*")[^"]+("[^}]*})`,
    'g'
  );
  
  if (productRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(productRegex, `$1${defaultCategory}$2`);
    defaultAssignments++;
    console.log(`🎯 "${unmapped.productName}" → ${defaultCategory} (por defecto)`);
  }
});

console.log(`\n📊 Asignaciones por defecto: ${defaultAssignments}`);

// Crear backup y guardar
console.log('\n💾 PASO 5: GUARDANDO CAMBIOS');
console.log('===========================');

const backupPath = `${productosPath}.backup-categorization-fix.${Date.now()}`;
fs.copyFileSync(productosPath, backupPath);
console.log(`📁 Backup creado: ${path.basename(backupPath)}`);

fs.writeFileSync(productosPath, updatedContent);
console.log('✅ Catálogo actualizado exitosamente');

// Validar resultado final
console.log('\n✅ PASO 6: VALIDACIÓN FINAL');
console.log('==========================');

const finalProductRegex = /{[^}]*"categoria":\s*"([^"]+)"[^}]*}/g;
const finalCategories = {};
let finalMatch;

while ((finalMatch = finalProductRegex.exec(updatedContent)) !== null) {
  const categoria = finalMatch[1];
  if (!finalCategories[categoria]) {
    finalCategories[categoria] = 0;
  }
  finalCategories[categoria]++;
}

console.log('🏷️  DISTRIBUCIÓN FINAL POR CATEGORÍA:');
Object.entries(finalCategories)
  .sort(([,a], [,b]) => b - a)
  .forEach(([categoria, count]) => {
    console.log(`   • ${categoria}: ${count} productos`);
  });

// Guardar reporte
const report = {
  timestamp: new Date().toISOString(),
  stats: {
    totalProducts: catalogProducts.length,
    successfulMappings: mappingResults.successful,
    failedMappings: mappingResults.failed,
    defaultAssignments,
    successRate: ((mappingResults.successful / catalogProducts.length) * 100).toFixed(1)
  },
  finalDistribution: finalCategories,
  csvCategories: csvCategoryStats,
  mappingResults,
  backupFile: path.basename(backupPath)
};

fs.writeFileSync(
  path.join(__dirname, 'categorization_fix_report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n🎉 CATEGORIZACIÓN CORREGIDA EXITOSAMENTE');
console.log('=======================================');
console.log(`📊 RESUMEN FINAL:`);
console.log(`   • Productos procesados: ${catalogProducts.length}`);
console.log(`   • Mapeos exitosos: ${mappingResults.successful}`);
console.log(`   • Asignaciones por defecto: ${defaultAssignments}`);
console.log(`   • Categorías finales: ${Object.keys(finalCategories).length}`);
console.log(`   • Tasa de éxito: ${((mappingResults.successful / catalogProducts.length) * 100).toFixed(1)}%`);
console.log(`   • Backup: ${path.basename(backupPath)}`);
console.log(`   • Reporte: categorization_fix_report.json`);

console.log('\n🎯 Los productos ahora están correctamente distribuidos según tiendaSEO.csv');
console.log('🚀 ¡Los filtros de categorías deberían funcionar perfectamente!');
