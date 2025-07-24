// scripts/diagnose_categories.js
// Script para diagnosticar y mapear categorías correctamente

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando categorías de productos...');

try {
  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  const productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Extraer todas las categorías asignadas a productos
  const categoryMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const categoriesInProducts = {};
  
  categoryMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    categoriesInProducts[category] = (categoriesInProducts[category] || 0) + 1;
  });
  
  console.log('\n📊 Categorías REALMENTE asignadas a productos:');
  Object.entries(categoriesInProducts).forEach(([cat, count]) => {
    console.log(`  - "${cat}": ${count} productos`);
  });
  
  // Leer categorías del frontend
  const tiendaPath = path.join(__dirname, '../src/app/tienda/page.tsx');
  const tiendaContent = fs.readFileSync(tiendaPath, 'utf8');
  
  // Extraer IDs de categorías del frontend
  const frontendCategoryMatches = tiendaContent.match(/{ id: '([^']+)', name:/g) || [];
  const frontendCategories = frontendCategoryMatches.map(match => {
    return match.match(/{ id: '([^']+)', name:/)[1];
  }).filter(id => id !== 'all');
  
  console.log('\n🎨 IDs de categorías en el FRONTEND:');
  frontendCategories.forEach(id => {
    console.log(`  - "${id}"`);
  });
  
  // Crear mapeo sugerido
  console.log('\n🔄 MAPEO SUGERIDO (Frontend ID → Categoría Real):');
  
  const suggestedMapping = {};
  
  // Mapeo manual basado en los nombres
  const categoryMappings = {
    'aceites-naturales': 'Aceites naturales',
    'granos-cereales-integrales': 'Granos y cereales integrales', 
    'proteinas-regenerativas': 'Proteínas Regenerativas',
    'cafe-cacao-chocolate': 'Café, cacao y chocolate artesanal',
    'endulzantes-naturales': 'Endulzantes naturales',
    'especias-condimentos': 'Especias y condimentos artesanales',
    'frutas-verduras-granel': 'Frutas y Verduras a Granel',
    'mermeladas-untables': 'Mermeladas y untables naturales',
    'huevo-lacteos': 'Huevo de libre pastoreo y lácteos artesanales',
    'tes-infusiones': 'Tés e infusiones naturales',
    'productos-arca-tierra': 'Productos Arca Tierra',
    'harinas-pastas': 'Harinas y pastas orgánicas',
    'pan-galletas': 'Pan y galletas artesanales',
    'canastas-frutas-verduras': 'Canastas de frutas y verduras agroecológicas'
  };
  
  frontendCategories.forEach(frontendId => {
    // Buscar coincidencia exacta primero
    let matchedCategory = null;
    
    // Buscar en categorías existentes
    for (const realCategory in categoriesInProducts) {
      if (categoryMappings[frontendId] === realCategory) {
        matchedCategory = realCategory;
        break;
      }
    }
    
    // Si no hay coincidencia exacta, buscar parcial
    if (!matchedCategory) {
      for (const realCategory in categoriesInProducts) {
        const frontendWords = frontendId.split('-');
        const realWords = realCategory.toLowerCase().split(' ');
        
        if (frontendWords.some(word => realWords.some(realWord => realWord.includes(word)))) {
          matchedCategory = realCategory;
          break;
        }
      }
    }
    
    if (matchedCategory) {
      suggestedMapping[frontendId] = matchedCategory;
      console.log(`  ✅ "${frontendId}" → "${matchedCategory}" (${categoriesInProducts[matchedCategory]} productos)`);
    } else {
      console.log(`  ❌ "${frontendId}" → NO ENCONTRADA`);
    }
  });
  
  // Generar reporte completo
  const report = {
    timestamp: new Date().toISOString(),
    categoriesInProducts: categoriesInProducts,
    frontendCategoryIds: frontendCategories,
    suggestedMapping: suggestedMapping,
    totalProductsWithCategories: Object.values(categoriesInProducts).reduce((a, b) => a + b, 0),
    unmappedFrontendCategories: frontendCategories.filter(id => !suggestedMapping[id])
  };
  
  const reportPath = path.join(__dirname, 'categories_diagnosis_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Reporte completo guardado: ${path.basename(reportPath)}`);
  console.log(`📊 Total productos con categorías: ${report.totalProductsWithCategories}`);
  console.log(`🔄 Categorías mapeadas: ${Object.keys(suggestedMapping).length}/${frontendCategories.length}`);
  
  if (report.unmappedFrontendCategories.length > 0) {
    console.log(`⚠️  Categorías del frontend sin mapear: ${report.unmappedFrontendCategories.join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ Error durante el diagnóstico:', error.message);
  process.exit(1);
}
