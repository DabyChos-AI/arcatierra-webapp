// scripts/sync_csv_robust.js
// Script robusto para sincronizar categorías exactas desde línea 83+ del CSV

const fs = require('fs');
const path = require('path');

console.log('🔧 Sincronización ROBUSTA con CSV real (línea 83+)...');

try {
  // Leer CSV tiendaSEO
  const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  console.log('📖 CSV leído correctamente');
  
  // Dividir por líneas
  const lines = csvContent.split('\n');
  
  // Verificar línea 83 (índice 82)
  if (lines.length < 84) {
    throw new Error('El CSV no tiene suficientes líneas para llegar a la línea 83');
  }
  
  console.log(`📊 Total líneas en CSV: ${lines.length}`);
  console.log(`📍 Línea 83 (header): ${lines[82]}`);
  
  // Función para parsear CSV respetando comillas
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) result.push(current.trim());
    return result;
  }
  
  // Parsear header (línea 83)
  const headers = parseCSVLine(lines[82]);
  console.log('📋 Headers parseados:', headers);
  
  // Encontrar índices
  const productIndex = headers.findIndex(h => h.toLowerCase().includes('producto'));
  const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('categoria'));
  
  console.log(`🎯 Índice PRODUCTO: ${productIndex}, CATEGORIA: ${categoryIndex}`);
  
  if (productIndex === -1 || categoryIndex === -1) {
    console.log('📋 Headers disponibles:');
    headers.forEach((h, i) => console.log(`  ${i}: "${h}"`));
    throw new Error('No se encontraron columnas PRODUCTO o CATEGORIA');
  }
  
  // Procesar productos desde línea 84
  const productCategoryMap = {};
  const categoryDistribution = {};
  
  for (let i = 83; i < lines.length; i++) { // línea 84+ (índice 83+)
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCSVLine(line);
    
    if (fields.length > Math.max(productIndex, categoryIndex)) {
      const productName = fields[productIndex]?.replace(/"/g, '').trim();
      const category = fields[categoryIndex]?.replace(/"/g, '').trim();
      
      if (productName && category && productName !== 'PRODUCTO') {
        productCategoryMap[productName.toLowerCase()] = category;
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        console.log(`📦 "${productName}" → "${category}"`);
      }
    }
  }
  
  console.log('\n📊 Categorías REALES del CSV:');
  Object.entries(categoryDistribution).forEach(([cat, count]) => {
    console.log(`  ✅ "${cat}": ${count} productos`);
  });
  
  if (Object.keys(productCategoryMap).length === 0) {
    throw new Error('No se encontraron productos válidos en el CSV');
  }
  
  // Mapeo de categorías CSV a IDs frontend
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
  
  // También crear mapeo automático para categorías no previstas  
  Object.keys(categoryDistribution).forEach(cat => {
    if (!categoryMapping[cat]) {
      categoryMapping[cat] = cat.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[áàä]/g, 'a')
        .replace(/[éèë]/g, 'e')
        .replace(/[íìï]/g, 'i')
        .replace(/[óòö]/g, 'o')
        .replace(/[úùü]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9-]/g, '');
    }
  });
  
  console.log('\n🔄 Mapeo de categorías CSV → Frontend:');
  Object.entries(categoryMapping).forEach(([csv, frontend]) => {
    console.log(`  "${csv}" → "${frontend}"`);
  });
  
  // Leer y actualizar archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-robust-csv.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  let updatedCount = 0;
  let foundCount = 0;
  const mappingReport = {};
  const finalDistribution = {};
  
  // Expresión regular para encontrar productos
  const productRegex = /"nombre":\s*"([^"]+)"([\s\S]*?)"categoria":\s*"([^"]+)"/g;
  let match;
  
  // Primero, contar coincidencias
  const tempContent = productosContent;
  while ((match = productRegex.exec(tempContent)) !== null) {
    const [, productName, , currentCategory] = match;
    const productNameLower = productName.toLowerCase();
    const csvCategory = productCategoryMap[productNameLower];
    
    if (csvCategory) {
      foundCount++;
    }
  }
  
  console.log(`\n🎯 Productos encontrados en CSV: ${foundCount}/${Object.keys(productCategoryMap).length}`);
  
  // Ahora hacer los reemplazos
  productosContent = productosContent.replace(productRegex, (fullMatch, productName, middleContent, currentCategory) => {
    const productNameLower = productName.toLowerCase();
    const csvCategory = productCategoryMap[productNameLower];
    
    if (csvCategory) {
      const frontendId = categoryMapping[csvCategory];
      
      if (frontendId && frontendId !== currentCategory) {
        updatedCount++;
        mappingReport[productName] = {
          from: currentCategory,
          to: frontendId,
          csvOriginal: csvCategory
        };
        
        console.log(`🔄 "${productName}": ${currentCategory} → ${frontendId}`);
        
        finalDistribution[frontendId] = (finalDistribution[frontendId] || 0) + 1;
        
        return `"nombre": "${productName}"${middleContent}"categoria": "${frontendId}"`;
      } else {
        finalDistribution[currentCategory] = (finalDistribution[currentCategory] || 0) + 1;
      }
    } else {
      finalDistribution[currentCategory] = (finalDistribution[currentCategory] || 0) + 1;
    }
    
    return fullMatch;
  });
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Sincronización ROBUSTA completada!`);
  console.log(`📋 Productos en CSV: ${Object.keys(productCategoryMap).length}`);
  console.log(`🎯 Productos encontrados en sistema: ${foundCount}`);
  console.log(`🔄 Productos actualizados: ${updatedCount}`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
  console.log('\n📊 Distribución FINAL (según CSV real):');
  Object.entries(finalDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  - "${cat}": ${count} productos`);
    });
  
  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    method: 'robust_csv_sync_from_line_83',
    csvProducts: Object.keys(productCategoryMap).length,
    foundProducts: foundCount,
    updatedProducts: updatedCount,
    csvCategories: categoryDistribution,
    finalDistribution: finalDistribution,
    categoryMapping: categoryMapping,
    mappingChanges: mappingReport
  };
  
  const reportPath = path.join(__dirname, 'robust_csv_sync_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Reporte completo: ${path.basename(reportPath)}`);
  
} catch (error) {
  console.error('❌ Error durante la sincronización robusta:', error.message);
  console.error('📍 Stack:', error.stack);
  process.exit(1);
}
