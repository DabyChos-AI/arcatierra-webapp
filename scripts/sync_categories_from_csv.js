// scripts/sync_categories_from_csv.js
// Script para sincronizar categorías EXACTAS desde tiendaSEO.csv

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando sincronización de categorías desde tiendaSEO.csv...');

// Rutas de archivos
const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
const productosPath = path.join(__dirname, '../src/data/productos.ts');

// Función para leer y parsear el CSV
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const products = [];
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const columns = line.split(',');
    
    // Buscar líneas que tienen el formato: ID,NOMBRE,CATEGORIA,PRECIO
    if (columns.length >= 4 && columns[0] && columns[1] && columns[2]) {
      const id = columns[0].trim();
      const nombre = columns[1].trim();
      const categoria = columns[2].trim();
      const precio = columns[3].trim();
      
      // Filtrar líneas que no son productos (encabezados, descripciones, etc.)
      if (id.startsWith('P-WEB-') || id.includes('CANASTA') || id.includes('BASICA')) {
        products.push({
          csvId: id,
          nombre: nombre,
          categoria: categoria,
          precio: precio
        });
      }
    }
  }
  
  return products;
}

// Función para mapear ID del CSV al ID del sistema
function mapCSVIdToSystemId(csvId, nombre) {
  // Convertir nombre a slug similar al sistema actual
  const slug = nombre.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '-') // Espacios a guiones
    .trim();
  
  return slug;
}

try {
  // Leer archivo CSV
  console.log('📖 Leyendo archivo tiendaSEO.csv...');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Parsear productos del CSV
  const csvProducts = parseCSV(csvContent);
  console.log(`✅ Encontrados ${csvProducts.length} productos en el CSV`);
  
  // Mostrar algunos ejemplos de productos encontrados
  console.log('\n📋 Ejemplos de productos encontrados:');
  csvProducts.slice(0, 10).forEach(product => {
    console.log(`  - ${product.nombre} → ${product.categoria}`);
  });
  
  // Crear mapeo de categorías únicas
  const categoriesFound = [...new Set(csvProducts.map(p => p.categoria))].filter(cat => cat);
  console.log(`\n🏷️  Categorías únicas encontradas: ${categoriesFound.length}`);
  categoriesFound.forEach(cat => {
    console.log(`  - ${cat}`);
  });
  
  // Leer archivo de productos actual
  console.log('\n📖 Leyendo archivo productos.ts...');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear un backup
  const backupPath = `${productosPath}.backup-csv-categories.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  // Contar categorías antes
  const beforeMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const beforeCategories = {};
  beforeMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    beforeCategories[category] = (beforeCategories[category] || 0) + 1;
  });
  
  console.log('\n📊 Categorías antes de la actualización:');
  Object.entries(beforeCategories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} productos`);
  });
  
  // Mapear productos del CSV a IDs del sistema para actualización
  let updatedCount = 0;
  const categoryChanges = [];
  
  // Para cada producto en el CSV, buscar coincidencia en el sistema por nombre
  csvProducts.forEach(csvProduct => {
    if (!csvProduct.categoria) return;
    
    // Buscar el producto en el archivo por nombre (aproximado)
    const nombreLimpio = csvProduct.nombre
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    
    // Buscar patrones de productos en el archivo
    const productRegex = new RegExp(`"nombre":\\s*"([^"]*${nombreLimpio.split(' ')[0]}[^"]*)"[\\s\\S]*?"categoria":\\s*"([^"]+)"`, 'gi');
    
    let match;
    while ((match = productRegex.exec(productosContent)) !== null) {
      const productName = match[1];
      const currentCategory = match[2];
      
      if (csvProduct.categoria !== currentCategory) {
        // Reemplazar la categoría específica de este producto
        const searchPattern = `("nombre":\\s*"${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?"categoria":\\s*)"${currentCategory}"`;
        const replaceWith = `$1"${csvProduct.categoria}"`;
        
        productosContent = productosContent.replace(new RegExp(searchPattern, 'g'), replaceWith);
        
        updatedCount++;
        categoryChanges.push({
          product: productName,
          from: currentCategory,
          to: csvProduct.categoria
        });
        
        console.log(`  ✅ ${productName}: ${currentCategory} → ${csvProduct.categoria}`);
      }
    }
  });
  
  // Contar categorías después
  const afterMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const afterCategories = {};
  afterMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    afterCategories[category] = (afterCategories[category] || 0) + 1;
  });
  
  console.log('\n📊 Categorías después de la actualización:');
  Object.entries(afterCategories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} productos`);
  });
  
  // Actualizar lista de categorías exportadas
  const newCategoriesList = Object.keys(afterCategories).sort();
  productosContent = productosContent.replace(
    /export const categorias = \[([\s\S]*?)\];/,
    `export const categorias = [\n  "${newCategoriesList.join('",\n  "')}"\n];`
  );
  
  // Actualizar estadísticas
  const timestamp = new Date().toISOString();
  productosContent = productosContent.replace(
    /categories: \d+,/,
    `categories: ${newCategoriesList.length},`
  );
  productosContent = productosContent.replace(
    /rebuiltAt: '[^']*'/,
    `rebuiltAt: '${timestamp}'`
  );
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  // Generar reporte
  const report = {
    timestamp,
    csvProductsFound: csvProducts.length,
    categoriesInCSV: categoriesFound,
    totalProducts: afterMatches.length,
    updatedProducts: updatedCount,
    categoriesBefore: beforeCategories,
    categoriesAfter: afterCategories,
    categoryChanges: categoryChanges.slice(0, 50),
    backupFile: path.basename(backupPath)
  };
  
  const reportPath = path.join(__dirname, 'csv_categories_sync_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Sincronización CSV completada!`);
  console.log(`📈 ${updatedCount} productos actualizados`);
  console.log(`🏷️  ${newCategoriesList.length} categorías finales`);
  console.log(`📄 Reporte: ${path.basename(reportPath)}`);
  
} catch (error) {
  console.error('❌ Error durante la sincronización:', error.message);
  console.error(error.stack);
  process.exit(1);
}
