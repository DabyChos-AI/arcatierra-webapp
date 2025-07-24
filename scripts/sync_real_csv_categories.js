// scripts/sync_real_csv_categories.js
// Script para sincronizar categorías EXACTAS desde la línea 83+ del CSV

const fs = require('fs');
const path = require('path');

console.log('📋 Sincronizando con categorías REALES del CSV (línea 83+)...');

try {
  // Leer CSV tiendaSEO
  const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  console.log('📖 CSV leído correctamente');
  
  // Dividir por líneas y comenzar desde línea 83 (índice 82)
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Línea 83 es el header
  const headerLine = lines[82]; // línea 83 (índice 82)
  const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
  
  console.log('📊 Headers encontrados:', headers);
  
  // Encontrar índices de columnas
  const skuIndex = headers.findIndex(h => h.toLowerCase().includes('sku'));
  const productIndex = headers.findIndex(h => h.toLowerCase().includes('producto'));
  const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('categoria'));
  
  console.log(`📍 Índices - SKU: ${skuIndex}, Producto: ${productIndex}, Categoría: ${categoryIndex}`);
  
  if (productIndex === -1 || categoryIndex === -1) {
    throw new Error('No se encontraron columnas de producto o categoría');
  }
  
  // Procesar productos desde línea 84 en adelante
  const productCategoryMap = {};
  const categoryDistribution = {};
  
  for (let i = 83; i < lines.length; i++) { // línea 84+ (índice 83+)
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parsear CSV respetando comillas
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) fields.push(current.trim());
    
    if (fields.length > Math.max(productIndex, categoryIndex)) {
      const productName = fields[productIndex]?.replace(/"/g, '').trim();
      const category = fields[categoryIndex]?.replace(/"/g, '').trim();
      
      if (productName && category) {
        productCategoryMap[productName.toLowerCase()] = category;
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        console.log(`📦 "${productName}" → "${category}"`);
      }
    }
  }
  
  console.log('\n📊 Categorías REALES encontradas en CSV:');
  Object.entries(categoryDistribution).forEach(([cat, count]) => {
    console.log(`  - "${cat}": ${count} productos`);
  });
  
  // Mapeo de categorías del CSV a IDs del frontend
  const categoryMapping = {
    'Canastas de frutas y verduras agroecológicas': 'canastas-frutas-verduras',
    'Aceites naturales': 'aceites-naturales',
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
    'Pan y galletas artesanales': 'pan-galletas',
    'Productos Arca Tierra': 'productos-arca-tierra'
  };
  
  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-real-csv-sync.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  let updatedCount = 0;
  const mappingReport = {};
  const finalDistribution = {};
  
  // Actualizar categorías de productos
  const productRegex = /"nombre":\s*"([^"]+)"([\s\S]*?)"categoria":\s*"([^"]+)"/g;
  
  productosContent = productosContent.replace(productRegex, (match, productName, middleContent, currentCategory) => {
    const productNameLower = productName.toLowerCase();
    const csvCategory = productCategoryMap[productNameLower];
    
    if (csvCategory) {
      // Mapear categoría del CSV a ID del frontend
      const frontendId = categoryMapping[csvCategory] || csvCategory.toLowerCase().replace(/\s+/g, '-');
      
      if (frontendId !== currentCategory) {
        updatedCount++;
        mappingReport[productName] = {
          from: currentCategory,
          to: frontendId,
          csvOriginal: csvCategory
        };
        
        console.log(`🔄 "${productName}": ${currentCategory} → ${frontendId} (CSV: ${csvCategory})`);
        
        finalDistribution[frontendId] = (finalDistribution[frontendId] || 0) + 1;
        
        return `"nombre": "${productName}"${middleContent}"categoria": "${frontendId}"`;
      } else {
        finalDistribution[currentCategory] = (finalDistribution[currentCategory] || 0) + 1;
      }
    } else {
      // Producto no encontrado en CSV, mantener categoría actual
      finalDistribution[currentCategory] = (finalDistribution[currentCategory] || 0) + 1;
      console.log(`❓ "${productName}": no encontrado en CSV, mantiene "${currentCategory}"`);
    }
    
    return match;
  });
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Sincronización con CSV REAL completada!`);
  console.log(`🔄 ${updatedCount} productos actualizados con categorías del CSV`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
  console.log('\n📊 Distribución FINAL (según CSV real):');
  Object.entries(finalDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  - "${cat}": ${count} productos`);
    });
  
  // Guardar reporte detallado
  const detailedReport = {
    timestamp: new Date().toISOString(),
    method: 'real_csv_synchronization_from_line_83',
    csvProductsFound: Object.keys(productCategoryMap).length,
    updatedProducts: updatedCount,
    csvCategories: categoryDistribution,
    finalDistribution: finalDistribution,
    categoryMapping: categoryMapping,
    mappingChanges: mappingReport
  };
  
  const reportPath = path.join(__dirname, 'real_csv_sync_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`📄 Reporte completo: ${path.basename(reportPath)}`);
  
  // Análisis de cobertura
  const csvCategoriesCount = Object.keys(categoryDistribution).length;
  const frontendCategoriesCount = Object.keys(finalDistribution).length;
  
  console.log(`\n📈 Análisis de cobertura:`);
  console.log(`  📋 Categorías en CSV: ${csvCategoriesCount}`);
  console.log(`  🎯 Categorías en frontend: ${frontendCategoriesCount}`);
  console.log(`  🔄 Productos sincronizados desde CSV: ${Object.keys(productCategoryMap).length}`);
  
} catch (error) {
  console.error('❌ Error durante la sincronización:', error.message);
  process.exit(1);
}
