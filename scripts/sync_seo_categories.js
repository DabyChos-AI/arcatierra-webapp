// scripts/sync_seo_categories.js
// Script para sincronizar productos con las nuevas categorías SEO

const fs = require('fs');
const path = require('path');

// Leer el archivo de productos actual
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const categoriasPath = path.join(__dirname, '../src/data/categorias.ts');

console.log('🔄 Iniciando sincronización de categorías SEO...');

// Mapeo manual de categorías actuales a las nuevas categorías SEO
const categoryMapping = {
  // Categorías actuales -> Nuevas categorías SEO
  'verduras': 'frutas-verduras-granel',
  'frutas': 'frutas-verduras-granel', 
  'hierbas': 'especias-condimentos',
  'granos': 'granos-cereales-integrales',
  'otros': 'frutas-verduras-granel', // Default para productos sin categoría clara
  
  // Mapeos adicionales basados en nombres de productos
  'frutas-y-verduras-a-granel': 'frutas-verduras-granel',
  'granos-y-cereales-integrales': 'granos-cereales-integrales'
};

// Función para determinar la categoría correcta basada en el nombre del producto
function determineCategoryFromProduct(productName, currentCategory) {
  const name = productName.toLowerCase();
  
  // Mapeos específicos por nombre de producto
  if (name.includes('aceite')) return 'aceites-naturales';
  if (name.includes('café') || name.includes('cacao') || name.includes('chocolate')) return 'cafe-cacao-chocolate';
  if (name.includes('miel') || name.includes('piloncillo')) return 'endulzantes-naturales';
  if (name.includes('chile') || name.includes('especias') || name.includes('sal')) return 'especias-condimentos';
  if (name.includes('mermelada') || name.includes('untable')) return 'mermeladas-untables';
  if (name.includes('huevo') || name.includes('queso') || name.includes('lácteo')) return 'huevo-lacteos';
  if (name.includes('té') || name.includes('infusión')) return 'tes-infusiones';
  if (name.includes('harina') || name.includes('pasta')) return 'harinas-pastas';
  if (name.includes('pan') || name.includes('galleta')) return 'pan-galletas';
  if (name.includes('pollo') || name.includes('pavo') || name.includes('cerdo') || name.includes('res')) return 'proteinas-regenerativas';
  
  // Si no encuentra coincidencia específica, usar el mapeo de categorías
  return categoryMapping[currentCategory] || 'frutas-verduras-granel';
}

try {
  // Leer el archivo de productos
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  console.log('📖 Archivo de productos leído correctamente');
  
  // Extraer los productos del archivo
  const productosMatch = productosContent.match(/export const productos: Product\[\] = \[([\s\S]*?)\];/);
  
  if (!productosMatch) {
    throw new Error('No se pudo encontrar la exportación de productos');
  }
  
  // Contar productos antes de la actualización
  const beforeMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const beforeCategories = {};
  beforeMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    beforeCategories[category] = (beforeCategories[category] || 0) + 1;
  });
  
  console.log('📊 Categorías antes de la actualización:');
  Object.entries(beforeCategories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} productos`);
  });
  
  // Actualizar las categorías en el contenido
  let updatedCount = 0;
  productosContent = productosContent.replace(
    /"categoria":\s*"([^"]+)"/g, 
    (match, currentCategory) => {
      // Buscar el nombre del producto en el contexto
      const productContext = productosContent.substring(
        productosContent.lastIndexOf('{', productosContent.indexOf(match)),
        productosContent.indexOf('}', productosContent.indexOf(match)) + 1
      );
      
      const nameMatch = productContext.match(/"nombre":\s*"([^"]+)"/);
      const productName = nameMatch ? nameMatch[1] : '';
      
      const newCategory = determineCategoryFromProduct(productName, currentCategory);
      
      if (newCategory !== currentCategory) {
        updatedCount++;
        console.log(`  ✅ ${productName}: ${currentCategory} → ${newCategory}`);
      }
      
      return `"categoria": "${newCategory}"`;
    }
  );
  
  // Contar categorías después de la actualización
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
  
  // Actualizar las categorías exportadas al final del archivo
  const newCategoriesList = Object.keys(afterCategories).sort();
  productosContent = productosContent.replace(
    /export const categorias = \[([\s\S]*?)\];/,
    `export const categorias = [\n  "${newCategoriesList.join('",\n  "')}"\n];`
  );
  
  // Actualizar las estadísticas
  productosContent = productosContent.replace(
    /categories: \d+,/,
    `categories: ${newCategoriesList.length},`
  );
  
  // Agregar timestamp de actualización
  const timestamp = new Date().toISOString();
  productosContent = productosContent.replace(
    /rebuiltAt: '[^']*'/,
    `rebuiltAt: '${timestamp}'`
  );
  
  // Crear backup antes de escribir
  const backupPath = `${productosPath}.backup-seo-categories.${Date.now()}`;
  fs.writeFileSync(backupPath, fs.readFileSync(productosPath));
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  // Escribir el archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Sincronización completada!`);
  console.log(`📈 ${updatedCount} productos actualizados`);
  console.log(`🏷️  ${newCategoriesList.length} categorías únicas detectadas`);
  console.log(`⏰ Actualizado: ${timestamp}`);
  
  // Generar reporte
  const reportPath = path.join(__dirname, 'seo_categories_sync_report.json');
  const report = {
    timestamp,
    totalProducts: afterMatches.length,
    updatedProducts: updatedCount,
    categoriesBefore: beforeCategories,
    categoriesAfter: afterCategories,
    newCategoriesList,
    backupFile: path.basename(backupPath)
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Reporte guardado: ${path.basename(reportPath)}`);

} catch (error) {
  console.error('❌ Error durante la sincronización:', error.message);
  process.exit(1);
}
