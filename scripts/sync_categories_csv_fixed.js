// scripts/sync_categories_csv_fixed.js
// Script mejorado para sincronizar categorías desde tiendaSEO.csv sin errores de sintaxis

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando sincronización MEJORADA de categorías desde tiendaSEO.csv...');

// Rutas de archivos
const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
const productosPath = path.join(__dirname, '../src/data/productos.ts');

// Función para limpiar y normalizar categoría
function cleanCategory(category) {
  if (!category) return '';
  
  return category
    .trim()
    .replace(/^["']+|["']+$/g, '') // Remover comillas al inicio y final
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
}

// Función para parsear CSV con mejor manejo de comillas
function parseCSVImproved(csvContent) {
  const lines = csvContent.split('\n');
  const products = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Dividir por comas, pero considerar que las comas dentro de comillas no son separadores
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim()); // Agregar el último elemento
    
    // Buscar líneas que tienen el formato de productos
    if (columns.length >= 4 && columns[0] && columns[1] && columns[2]) {
      const id = columns[0].trim();
      const nombre = cleanCategory(columns[1]);
      const categoria = cleanCategory(columns[2]);
      const precio = columns[3].trim();
      
      // Filtrar líneas que son productos reales
      if (id.startsWith('P-WEB-') || id.includes('CANASTA') || id.includes('BASICA')) {
        if (categoria && categoria !== '' && nombre && nombre !== '') {
          products.push({
            csvId: id,
            nombre: nombre,
            categoria: categoria,
            precio: precio
          });
        }
      }
    }
  }
  
  return products;
}

// Función para escapar cadenas para usar en regex
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

try {
  // Leer archivo CSV
  console.log('📖 Leyendo archivo tiendaSEO.csv...');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Parsear productos del CSV con manejo mejorado
  const csvProducts = parseCSVImproved(csvContent);
  console.log(`✅ Encontrados ${csvProducts.length} productos válidos en el CSV`);
  
  if (csvProducts.length === 0) {
    throw new Error('No se encontraron productos válidos en el CSV');
  }
  
  // Mostrar ejemplos de productos encontrados
  console.log('\n📋 Ejemplos de productos encontrados:');
  csvProducts.slice(0, 10).forEach(product => {
    console.log(`  - "${product.nombre}" → "${product.categoria}"`);
  });
  
  // Crear mapeo de categorías únicas y limpias
  const categoriesFound = [...new Set(csvProducts.map(p => p.categoria))].filter(cat => cat && cat.length > 0);
  console.log(`\n🏷️  Categorías únicas encontradas: ${categoriesFound.length}`);
  categoriesFound.forEach(cat => {
    console.log(`  - "${cat}"`);
  });
  
  // Leer archivo de productos actual
  console.log('\n📖 Leyendo archivo productos.ts...');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear un backup
  const backupPath = `${productosPath}.backup-csv-fixed.${Date.now()}`;
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
    console.log(`  - "${cat}": ${count} productos`);
  });
  
  // Mapear productos por nombre para actualización más precisa
  let updatedCount = 0;
  const categoryChanges = [];
  
  csvProducts.forEach(csvProduct => {
    const cleanProductName = csvProduct.nombre.toLowerCase().trim();
    const cleanCategory = csvProduct.categoria;
    
    // Buscar productos por nombre en el archivo
    const nameRegex = new RegExp(`"nombre":\\s*"([^"]*)"`, 'g');
    let match;
    
    while ((match = nameRegex.exec(productosContent)) !== null) {
      const systemProductName = match[1];
      const systemNameClean = systemProductName.toLowerCase().trim();
      
      // Comprobar si los nombres coinciden (fuzzy matching)
      if (systemNameClean.includes(cleanProductName.split(' ')[0]) || 
          cleanProductName.includes(systemNameClean.split(' ')[0])) {
        
        // Buscar la línea de categoría después del nombre
        const productStart = match.index;
        const afterName = productosContent.substring(productStart);
        const categoryMatch = afterName.match(/"categoria":\s*"([^"]+)"/);
        
        if (categoryMatch) {
          const currentCategory = categoryMatch[1];
          
          if (currentCategory !== cleanCategory) {
            // Construir el patrón de reemplazo exacto
            const fullMatch = match[0]; // "nombre": "..."
            const categoryPattern = `("categoria":\\s*)"${escapeRegex(currentCategory)}"`;
            const categoryReplace = `$1"${cleanCategory}"`;
            
            // Hacer el reemplazo en la sección específica del producto
            const productSection = productosContent.substring(productStart, productStart + 2000);
            const updatedSection = productSection.replace(new RegExp(categoryPattern), categoryReplace);
            
            if (productSection !== updatedSection) {
              productosContent = productosContent.substring(0, productStart) + 
                               updatedSection + 
                               productosContent.substring(productStart + 2000);
              
              updatedCount++;
              categoryChanges.push({
                product: systemProductName,
                from: currentCategory,
                to: cleanCategory
              });
              
              console.log(`  ✅ "${systemProductName}": "${currentCategory}" → "${cleanCategory}"`);
            }
          }
        }
      }
    }
  });
  
  // Verificar que no hay errores de sintaxis
  console.log('\n🔍 Verificando sintaxis...');
  const syntaxErrors = [];
  const quotesCheck = productosContent.match(/"categoria":\s*"[^"]*"/g);
  
  if (quotesCheck) {
    quotesCheck.forEach((match, index) => {
      if (match.includes('""') || match.match(/"[^"]*"[^"]*"/)) {
        syntaxErrors.push(`Línea ${index + 1}: ${match}`);
      }
    });
  }
  
  if (syntaxErrors.length > 0) {
    console.error('❌ Errores de sintaxis detectados:');
    syntaxErrors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Se detectaron errores de sintaxis. No se guardará el archivo.');
  }
  
  // Contar categorías después
  const afterMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const afterCategories = {};
  afterMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    afterCategories[category] = (afterCategories[category] || 0) + 1;
  });
  
  console.log('\n📊 Categorías después de la actualización:');
  Object.entries(afterCategories).forEach(([cat, count]) => {
    console.log(`  - "${cat}": ${count} productos`);
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
    categoryChanges: categoryChanges.slice(0, 100),
    backupFile: path.basename(backupPath),
    syntaxErrorsFound: syntaxErrors.length
  };
  
  const reportPath = path.join(__dirname, 'csv_categories_fixed_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Sincronización CSV MEJORADA completada!`);
  console.log(`📈 ${updatedCount} productos actualizados`);
  console.log(`🏷️  ${newCategoriesList.length} categorías finales`);
  console.log(`🔍 ${syntaxErrors.length} errores de sintaxis (corregidos)`);
  console.log(`📄 Reporte: ${path.basename(reportPath)}`);
  
} catch (error) {
  console.error('❌ Error durante la sincronización:', error.message);
  console.error(error.stack);
  process.exit(1);
}
