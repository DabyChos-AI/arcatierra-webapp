// scripts/sync_precise_categories.js
// Script para sincronizar categorías EXACTAS desde tiendaSEO.csv

const fs = require('fs');
const path = require('path');

console.log('🔄 Sincronizando categorías exactas desde tiendaSEO.csv...');

try {
  // Leer CSV tiendaSEO
  const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  console.log('📖 CSV leído correctamente');
  
  // Parsear CSV
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  console.log('📊 Headers encontrados:', headers);
  
  // Encontrar índices de columnas importantes
  const nameIndex = headers.findIndex(h => h.toLowerCase().includes('nombre') || h.toLowerCase().includes('product'));
  const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('categoria') || h.toLowerCase().includes('category'));
  
  console.log(`📍 Índice nombre: ${nameIndex}, Índice categoría: ${categoryIndex}`);
  
  if (nameIndex === -1 || categoryIndex === -1) {
    throw new Error('No se encontraron columnas de nombre o categoría en el CSV');
  }
  
  // Crear mapeo producto → categoría desde CSV
  const productCategoryMap = {};
  const categoryDistribution = {};
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',').map(f => f.trim().replace(/"/g, ''));
    
    if (fields.length > Math.max(nameIndex, categoryIndex)) {
      const productName = fields[nameIndex];
      const category = fields[categoryIndex];
      
      if (productName && category) {
        productCategoryMap[productName.toLowerCase()] = category;
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      }
    }
  }
  
  console.log('\n📊 Distribución de categorías en CSV:');
  Object.entries(categoryDistribution).forEach(([cat, count]) => {
    console.log(`  - "${cat}": ${count} productos`);
  });
  
  // Crear mapeo de categorías a IDs del frontend
  const categoryToIdMap = {
    'Aceites naturales': 'aceites-naturales',
    'Canastas de frutas y verduras agroecológicas': 'canastas-frutas-verduras',
    'Granos y cereales integrales': 'granos-cereales-integrales',
    'Proteínas Regenerativas': 'proteinas-regenerativas',
    'Café, cacao y chocolate artesanal': 'cafe-cacao-chocolate',
    'Endulzantes naturales': 'endulzantes-naturales',
    'Especias y condimentos artesanales': 'especias-condimentos',
    'Frutas y Verduras a Granel': 'frutas-verduras-granel',
    'Mermeladas y untables naturales': 'mermeladas-untables',
    'Huevo de libre pastoreo y lácteos artesanales': 'huevo-lacteos',
    'Tés e infusiones naturales': 'tes-infusiones',
    'Harinas y pastas orgánicas': 'harinas-pastas',
    'Pan y galletas artesanales': 'pan-galletas'
  };
  
  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-precise-sync.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  // Actualizar categorías
  let updatedCount = 0;
  let categoryUpdates = {};
  
  // Buscar y actualizar cada producto
  const productRegex = /"nombre":\s*"([^"]+)"[\s\S]*?"categoria":\s*"([^"]+)"/g;
  
  productosContent = productosContent.replace(productRegex, (match, productName, currentCategory) => {
    const productNameLower = productName.toLowerCase();
    const csvCategory = productCategoryMap[productNameLower];
    
    if (csvCategory && csvCategory !== currentCategory) {
      // Mapear categoría del CSV a ID del frontend
      const frontendId = categoryToIdMap[csvCategory] || csvCategory.toLowerCase().replace(/\s+/g, '-');
      
      updatedCount++;
      categoryUpdates[productName] = {
        from: currentCategory,
        to: frontendId,
        csvOriginal: csvCategory
      };
      
      return match.replace(`"categoria": "${currentCategory}"`, `"categoria": "${frontendId}"`);
    }
    
    return match;
  });
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  // Generar estadísticas finales
  const finalCategoryDistribution = {};
  const finalMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  
  finalMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    finalCategoryDistribution[category] = (finalCategoryDistribution[category] || 0) + 1;
  });
  
  console.log(`\n✅ Sincronización completada!`);
  console.log(`🔄 ${updatedCount} productos actualizados`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
  console.log('\n📊 Distribución FINAL de categorías:');
  Object.entries(finalCategoryDistribution).forEach(([cat, count]) => {
    console.log(`  - "${cat}": ${count} productos`);
  });
  
  // Guardar reporte de cambios
  const changeReport = {
    timestamp: new Date().toISOString(),
    updatedProducts: updatedCount,
    categoryUpdates: categoryUpdates,
    finalDistribution: finalCategoryDistribution,
    csvCategories: categoryDistribution
  };
  
  const reportPath = path.join(__dirname, 'precise_sync_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(changeReport, null, 2));
  console.log(`📄 Reporte de cambios: ${path.basename(reportPath)}`);
  
} catch (error) {
  console.error('❌ Error durante la sincronización:', error.message);
  process.exit(1);
}
