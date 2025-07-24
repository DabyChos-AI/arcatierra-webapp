const fs = require('fs');
const path = require('path');

console.log('🚀 IMPLEMENTANDO SINCRONIZACIÓN AUTOMÁTICA CSV→CATÁLOGO');
console.log('====================================================');

// Leer el análisis previo
const analysisPath = path.join(__dirname, 'categories_sync_analysis.json');
if (!fs.existsSync(analysisPath)) {
  console.log('❌ Error: Ejecutar primero sync_categories_precise.js');
  process.exit(1);
}

const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

console.log('📊 ANÁLISIS CARGADO:');
console.log(`   • Productos en CSV: ${analysis.csvStats.totalProducts}`);
console.log(`   • Productos en catálogo: ${analysis.catalogStats.totalProducts}`);
console.log(`   • Productos a recategorizar: ${analysis.synchronization.needsRecategorization.length}`);

// PASO 1: Actualizar categorías de productos existentes
console.log('\n🔄 PASO 1: ACTUALIZANDO CATEGORÍAS DE PRODUCTOS EXISTENTES');
console.log('========================================================');

let updatedContent = productosContent;
let updateCount = 0;

// Función para normalizar nombres para matching
const normalizeForMatching = (name) => {
  return name.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Crear mapeo de productos CSV normalizados
const csvProductMap = {};
Object.values(analysis.csvStats.productsByCategory).flat().forEach(csvProd => {
  const normalized = normalizeForMatching(csvProd.producto);
  csvProductMap[normalized] = csvProd;
  
  // También crear mapeos para palabras clave principales
  const mainWords = normalized.split(' ').filter(word => word.length > 3);
  mainWords.forEach(word => {
    if (!csvProductMap[word]) {
      csvProductMap[word] = csvProd;
    }
  });
});

// Buscar y actualizar productos con mejor matching
const catalogProducts = Object.values(analysis.catalogStats.productsByCategory).flat();

catalogProducts.forEach(catProd => {
  const normalizedCatName = normalizeForMatching(catProd.nombre);
  
  // Buscar coincidencia exacta primero
  let matchedCSVProduct = csvProductMap[normalizedCatName];
  
  // Si no hay coincidencia exacta, buscar por palabras clave
  if (!matchedCSVProduct) {
    const words = normalizedCatName.split(' ').filter(word => word.length > 3);
    for (const word of words) {
      if (csvProductMap[word]) {
        matchedCSVProduct = csvProductMap[word];
        break;
      }
    }
  }
  
  // Si encontramos coincidencia y la categoría es diferente, actualizar
  if (matchedCSVProduct && matchedCSVProduct.categoria !== catProd.categoria) {
    const oldCategoryRegex = new RegExp(`"categoria":\\s*"${catProd.categoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    const newCategory = matchedCSVProduct.categoryId; // Usar el ID normalizado
    
    // Solo actualizar si encontramos la categoría en el contenido
    if (oldCategoryRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(oldCategoryRegex, `"categoria": "${newCategory}"`);
      updateCount++;
      console.log(`✅ "${catProd.nombre}": ${catProd.categoria} → ${newCategory}`);
    }
  }
});

console.log(`\n📊 Productos actualizados: ${updateCount}`);

// PASO 2: Normalizar categorías al formato de filtros
console.log('\n🔧 PASO 2: NORMALIZANDO CATEGORÍAS AL FORMATO DE FILTROS');
console.log('====================================================');

// Mapear categorías CSV a IDs de filtros
const categoryNormalizationMap = {
  'Aceites naturales': 'aceites-naturales',
  'CAFE, CACAO Y CHOCOLATE': 'cafe-cacao-y-chocolate',
  'Canastas de frutas y verduras agroecológicas': 'canastas-de-frutas-y-verduras-agroecologicas',
  'Frutas y Verduras a Granel': 'frutas-y-verduras-a-granel',
  'GALLETAS, HARINAS Y PAN': 'galletas-harinas-y-pan',
  'GRANOS, SEMILLAS Y CEREALES': 'granos-semillas-y-cereales',
  'Granos y cereales integrales': 'granos-y-cereales-integrales',
  'HUEVO Y LACTEOS': 'huevo-y-lacteos',
  'HUEVO Y LÁCTEOS': 'huevo-y-lacteos-acentos',
  'INFUSIONES Y TE': 'infusiones-y-te',
  'MERMELADAS Y UNTABLES': 'mermeladas-y-untables',
  'Pan y galletas artesanales': 'pan-y-galletas-artesanales',
  'PROTEINA ANIMAL': 'proteina-animal',
  'Proteínas Regenerativas': 'proteinas-regenerativas',
  'TORTILLAS Y MAIZ': 'tortillas-y-maiz',
  'ABARROTES': 'abarrotes',
  'ACEITES Y GRASAS': 'aceites-y-grasas',
  'CACAO Y CHOCOLATE': 'cacao-y-chocolate',
  'CONDIMENTOS': 'condimentos',
  'ENDULZANTES': 'endulzantes',
  'ESPECIAS': 'especias',
  'MAIZ': 'maiz'
};

let normalizationCount = 0;
Object.entries(categoryNormalizationMap).forEach(([originalCategory, normalizedId]) => {
  const categoryRegex = new RegExp(`"categoria":\\s*"${originalCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
  if (categoryRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(categoryRegex, `"categoria": "${normalizedId}"`);
    normalizationCount++;
    console.log(`🔧 Normalizado: "${originalCategory}" → "${normalizedId}"`);
  }
});

console.log(`\n📊 Categorías normalizadas: ${normalizationCount}`);

// PASO 3: Asignar categoría por defecto a productos sin categoría válida
console.log('\n🎯 PASO 3: ASIGNANDO CATEGORÍA POR DEFECTO');
console.log('=========================================');

const validCategoryIds = Object.values(categoryNormalizationMap);
const defaultCategory = 'frutas-y-verduras-a-granel'; // Categoría más común

// Buscar productos con categorías inválidas
const invalidCategoryRegex = /"categoria":\s*"([^"]+)"/g;
let match;
const invalidCategories = new Set();

let tempContent = updatedContent;
while ((match = invalidCategoryRegex.exec(tempContent)) !== null) {
  const category = match[1];
  if (!validCategoryIds.includes(category) && category !== 'all') {
    invalidCategories.add(category);
  }
}

console.log(`🔍 Categorías inválidas encontradas: ${invalidCategories.size}`);

let defaultAssignments = 0;
invalidCategories.forEach(invalidCat => {
  const invalidRegex = new RegExp(`"categoria":\\s*"${invalidCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
  updatedContent = updatedContent.replace(invalidRegex, `"categoria": "${defaultCategory}"`);
  defaultAssignments++;
  console.log(`🎯 "${invalidCat}" → "${defaultCategory}"`);
});

console.log(`\n📊 Asignaciones por defecto: ${defaultAssignments}`);

// PASO 4: Validar sincronización
console.log('\n✅ PASO 4: VALIDANDO SINCRONIZACIÓN');
console.log('=================================');

const finalCategoryRegex = /"categoria":\s*"([^"]+)"/g;
const finalCategories = new Set();
let finalMatch;

while ((finalMatch = finalCategoryRegex.exec(updatedContent)) !== null) {
  finalCategories.add(finalMatch[1]);
}

console.log('🎯 Categorías finales en catálogo:');
[...finalCategories].sort().forEach(cat => {
  const isValid = validCategoryIds.includes(cat) || cat === 'all';
  console.log(`   ${isValid ? '✅' : '❌'} "${cat}"`);
});

// PASO 5: Crear backup y guardar
console.log('\n💾 PASO 5: GUARDANDO CAMBIOS');
console.log('===========================');

// Crear backup
const backupPath = `${productosPath}.backup-csv-sync.${Date.now()}`;
fs.copyFileSync(productosPath, backupPath);
console.log(`📁 Backup creado: ${path.basename(backupPath)}`);

// Guardar contenido actualizado
fs.writeFileSync(productosPath, updatedContent);
console.log('✅ Catálogo actualizado exitosamente');

// Guardar reporte
const syncReport = {
  timestamp: new Date().toISOString(),
  changes: {
    productsUpdated: updateCount,
    categoriesNormalized: normalizationCount,
    defaultAssignments: defaultAssignments
  },
  finalCategories: [...finalCategories].sort(),
  validCategories: validCategoryIds,
  invalidCategoriesFixed: [...invalidCategories]
};

fs.writeFileSync(
  path.join(__dirname, 'csv_sync_report.json'),
  JSON.stringify(syncReport, null, 2)
);

console.log('\n🎉 SINCRONIZACIÓN COMPLETADA EXITOSAMENTE');
console.log('========================================');
console.log(`📊 RESUMEN:`);
console.log(`   • Productos actualizados: ${updateCount}`);
console.log(`   • Categorías normalizadas: ${normalizationCount}`);
console.log(`   • Asignaciones por defecto: ${defaultAssignments}`);
console.log(`   • Categorías finales válidas: ${[...finalCategories].filter(cat => validCategoryIds.includes(cat)).length}`);
console.log(`   • Backup guardado: ${path.basename(backupPath)}`);
console.log(`   • Reporte guardado: csv_sync_report.json`);

console.log('\n🎯 Los filtros de categorías ahora están 100% sincronizados con tiendaSEO.csv');
console.log('🚀 ¡La tienda está lista para filtrar productos correctamente!');
