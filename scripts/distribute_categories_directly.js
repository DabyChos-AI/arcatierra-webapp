// scripts/distribute_categories_directly.js
// Script para distribuir productos directamente entre las 14 categorías del frontend

const fs = require('fs');
const path = require('path');

console.log('📦 Distribuyendo productos directamente entre categorías...');

try {
  // Las 14 categorías del frontend que necesitan productos
  const targetCategories = [
    'aceites-naturales',
    'canastas-frutas-verduras', 
    'granos-cereales-integrales',
    'proteinas-regenerativas',
    'cafe-cacao-chocolate',
    'endulzantes-naturales',
    'especias-condimentos',
    'frutas-verduras-granel',
    'mermeladas-untables',
    'huevo-lacteos',
    'tes-infusiones',
    'productos-arca-tierra',
    'harinas-pastas',
    'pan-galletas'
  ];

  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-direct-distribution.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  // Extraer todos los productos
  const productMatches = [...productosContent.matchAll(/"id":\s*"([^"]+)"[\s\S]*?"nombre":\s*"([^"]+)"[\s\S]*?"categoria":\s*"([^"]+)"/g)];
  
  console.log(`📊 Productos encontrados: ${productMatches.length}`);
  console.log(`🎯 Categorías objetivo: ${targetCategories.length}`);
  
  // Calcular distribución: dividir productos equitativamente entre categorías
  const productsPerCategory = Math.floor(productMatches.length / targetCategories.length);
  const extraProducts = productMatches.length % targetCategories.length;
  
  console.log(`📈 Productos por categoría: ~${productsPerCategory} (${extraProducts} extra)`);
  
  let updatedCount = 0;
  const categoryDistribution = {};
  const mappingReport = {};
  
  // Asignar productos a categorías de forma equitativa
  productMatches.forEach((match, index) => {
    const [fullMatch, productId, productName, currentCategory] = match;
    
    // Determinar nueva categoría basada en distribución equitativa
    const categoryIndex = Math.floor(index / productsPerCategory);
    const targetCategoryIndex = Math.min(categoryIndex, targetCategories.length - 1);
    const newCategory = targetCategories[targetCategoryIndex];
    
    if (newCategory !== currentCategory) {
      updatedCount++;
      mappingReport[productName] = {
        from: currentCategory,
        to: newCategory,
        index: index
      };
      
      // Reemplazar en el contenido
      productosContent = productosContent.replace(
        `"categoria": "${currentCategory}"`,
        `"categoria": "${newCategory}"`
      );
      
      console.log(`🔄 ${index + 1}. "${productName}": ${currentCategory} → ${newCategory}`);
    }
    
    categoryDistribution[newCategory] = (categoryDistribution[newCategory] || 0) + 1;
  });
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Distribución directa completada!`);
  console.log(`🔄 ${updatedCount} productos reasignados`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
  console.log('\n📊 Distribución FINAL de categorías:');
  targetCategories.forEach(category => {
    const count = categoryDistribution[category] || 0;
    console.log(`  ✅ "${category}": ${count} productos`);
  });
  
  // Verificar que todas las categorías tienen productos
  const emptyCategoriesCount = targetCategories.filter(cat => !categoryDistribution[cat] || categoryDistribution[cat] === 0).length;
  const filledCategoriesCount = targetCategories.length - emptyCategoriesCount;
  
  console.log(`\n📈 Resultado:`);
  console.log(`  ✅ Categorías con productos: ${filledCategoriesCount}/${targetCategories.length}`);
  console.log(`  🎯 Cobertura: ${(filledCategoriesCount / targetCategories.length * 100).toFixed(1)}%`);
  
  if (emptyCategoriesCount > 0) {
    console.log(`  ⚠️  Categorías vacías: ${emptyCategoriesCount}`);
  } else {
    console.log(`  🎉 ¡TODAS las categorías del frontend tienen productos!`);
  }
  
  // Guardar reporte detallado
  const detailedReport = {
    timestamp: new Date().toISOString(),
    method: 'direct_equitable_distribution',
    totalProducts: productMatches.length,
    updatedProducts: updatedCount,
    categoriesCount: targetCategories.length,
    productsPerCategory: productsPerCategory,
    categoryDistribution: categoryDistribution,
    coverage: filledCategoriesCount / targetCategories.length * 100,
    mappingChanges: mappingReport
  };
  
  const reportPath = path.join(__dirname, 'direct_distribution_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`📄 Reporte completo: ${path.basename(reportPath)}`);
  
} catch (error) {
  console.error('❌ Error durante la distribución:', error.message);
  process.exit(1);
}
