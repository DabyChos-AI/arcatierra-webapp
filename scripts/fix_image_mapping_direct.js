const fs = require('fs');
const path = require('path');

// Script DIRECTO para mapear manualmente las fotos descargadas con los productos
// Enfoque simple: reemplazar placeholders con las fotos que SÍ existen

console.log('🔧 SOLUCIONANDO MAPEO DE IMÁGENES - ENFOQUE DIRECTO 🔧');

const publicProductsPath = path.join(__dirname, '../public/products');
const productosPath = path.join(__dirname, '../src/data/productos.ts');

// Verificar archivos
if (!fs.existsSync(publicProductsPath)) {
  console.error('❌ No se encuentra directorio /public/products/');
  process.exit(1);
}

if (!fs.existsSync(productosPath)) {
  console.error('❌ No se encuentra productos.ts');
  process.exit(1);
}

// Listar fotos descargadas
const availablePhotos = fs.readdirSync(publicProductsPath)
  .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'));

console.log(`📸 Fotos disponibles: ${availablePhotos.length}`);
availablePhotos.forEach((photo, i) => {
  console.log(`   ${i+1}. ${photo}`);
});

// Leer productos.ts
let productosContent = fs.readFileSync(productosPath, 'utf-8');

// Crear backup
const backupPath = productosPath + '.backup-manual.' + Date.now();
fs.writeFileSync(backupPath, productosContent);
console.log(`💾 Backup manual: ${backupPath}`);

// MAPEO MANUAL DIRECTO - Basado en las fotos que SÍ descargamos
const directMappings = {
  // Mapeo directo nombre de foto → productos que coinciden
  'betabel-blanco-angel-galicia-1.jpg': ['betabel blanco', 'betabel'],
  'lechuga-amaranto-arca-tierra-2.jpg': ['lechuga amaranto'],
  'lechuga-carlbad-chicas-arca-tierra-3.jpg': ['lechuga carlbad'],
  'lechuga-espalda-de-trucha-medi-arca-tierra-4.jpg': ['lechuga espalda de trucha'],
  'lechuga-jericho-arca-tierra-5.jpg': ['lechuga jericho'],
  'lechuga-lengua-de-diablo-arca-tierra-6.jpg': ['lechuga lengua de diablo'],
  'lechuga-little-gem-arca-tierra-7.jpg': ['lechuga little gem'],
  'lechuga-lollo-rosa-arca-tierra-8.jpg': ['lechuga lollo rosa'],
  'apio-25004kg-armando-mayoral-9.jpg': ['apio'],
  'apionabo-hermilo-fernand-10.jpg': ['apio nabo'],
  'apio-victoria-snchez-11.jpg': ['apio'],
  
  // Fotos que ya teníamos del catálogo anterior
  'aguacate-hass.jpg': ['aguacate'],
  'chile-serrano.jpg': ['chile serrano'],
  'cilantro-fresco.jpg': ['cilantro'],
  'espinacas-baby.jpg': ['espinaca'],
  'frijoles-negros.jpg': ['frijol'],
  'jitomate-cherry.jpg': ['jitomate', 'tomate'],
  'leche-cabra.jpg': ['leche'],
  'lechuga-romana.jpg': ['lechuga romana'],
  'manzanas-rojas.jpg': ['manzana'],
  'miel-abeja.jpg': ['miel'],
  'miel-multifloral.jpg': ['miel'],
  'queso-artesanal.jpg': ['queso'],
  'queso-fresco.jpg': ['queso'],
  'salsa-molcajeteada.jpg': ['salsa'],
  'zanahorias-baby.jpg': ['zanahoria']
};

console.log('\n🔄 APLICANDO MAPEO DIRECTO...\n');

let updateCount = 0;
const appliedMappings = [];

// Aplicar mapeos directos
Object.entries(directMappings).forEach(([photoFile, keywords]) => {
  const photoPath = `/products/${photoFile}`;
  
  // Verificar que la foto existe
  if (!availablePhotos.includes(photoFile)) {
    console.log(`⚠️ Foto no encontrada: ${photoFile}`);
    return;
  }
  
  console.log(`📷 Procesando: ${photoFile} → ${keywords.join(', ')}`);
  
  // Para cada keyword, buscar y reemplazar en productos que coincidan
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Regex para buscar productos que contengan la keyword
    const productRegex = new RegExp(
      `("nombre": "[^"]*${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^}]*"imagen": ")/placeholder-product\\.jpg(")`,'gi'
    );
    
    const matches = [...productosContent.matchAll(productRegex)];
    
    matches.forEach(match => {
      const beforeReplacement = match[1];
      const afterReplacement = match[2];
      
      // Extraer nombre del producto para log
      const nameMatch = beforeReplacement.match(/"nombre": "([^"]+)"/);
      const productName = nameMatch ? nameMatch[1] : 'Desconocido';
      
      console.log(`  ✅ ${productName} → ${photoPath}`);
      
      updateCount++;
      appliedMappings.push({
        producto: productName,
        foto: photoPath
      });
    });
    
    productosContent = productosContent.replace(productRegex, `$1${photoPath}$2`);
  });
});

// SEGUNDO PASE: Mapeo por coincidencias parciales para productos restantes
console.log('\n🔍 SEGUNDO PASE - COINCIDENCIAS PARCIALES...\n');

const remainingPhotos = availablePhotos.filter(photo => 
  !Object.keys(directMappings).includes(photo)
);

remainingPhotos.forEach(photo => {
  const photoBase = photo.replace(/\.[^/.]+$/, "").toLowerCase(); // Sin extensión
  const words = photoBase.split('-').filter(word => word.length > 2);
  
  console.log(`📷 Analizando: ${photo} → palabras: [${words.join(', ')}]`);
  
  words.forEach(word => {
    if (word === 'angel' || word === 'arca' || word === 'tierra') return; // Skip common words
    
    const wordRegex = new RegExp(
      `("nombre": "[^"]*${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^}]*"imagen": ")/placeholder-product\\.jpg(")`,'gi'
    );
    
    const matches = [...productosContent.matchAll(wordRegex)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const beforeReplacement = match[1];
        const nameMatch = beforeReplacement.match(/"nombre": "([^"]+)"/);
        const productName = nameMatch ? nameMatch[1] : 'Desconocido';
        
        console.log(`  ✅ ${productName} → /products/${photo} (por: ${word})`);
        
        updateCount++;
        appliedMappings.push({
          producto: productName,
          foto: `/products/${photo}`
        });
      });
      
      productosContent = productosContent.replace(wordRegex, `$1/products/${photo}$2`);
    }
  });
});

// Escribir archivo actualizado
fs.writeFileSync(productosPath, productosContent);

console.log(`\n✅ MAPEO DIRECTO COMPLETADO:`);
console.log(`   🔄 Referencias actualizadas: ${updateCount}`);
console.log(`   📸 Fotos disponibles: ${availablePhotos.length}`);
console.log(`   📦 Mapeos aplicados: ${appliedMappings.length}`);

// Mostrar mapeos aplicados
if (appliedMappings.length > 0) {
  console.log(`\n📷 MAPEOS APLICADOS:`);
  appliedMappings.forEach((mapping, i) => {
    console.log(`   ${i+1}. ${mapping.producto} → ${mapping.foto}`);
  });
}

// Verificar cuántos placeholders quedan
const remainingPlaceholders = (productosContent.match(/\/placeholder-product\.jpg/g) || []).length;
console.log(`\n📊 ESTADO FINAL:`);
console.log(`   ✅ Imágenes asignadas: ${updateCount}`);
console.log(`   ⚠️ Placeholders restantes: ${remainingPlaceholders}`);

// Generar reporte final
const reportContent = `# REPORTE DE MAPEO DIRECTO DE IMÁGENES
Fecha: ${new Date().toISOString()}

## RESUMEN
- **Fotos disponibles:** ${availablePhotos.length}
- **Referencias actualizadas:** ${updateCount}
- **Mapeos aplicados:** ${appliedMappings.length}
- **Placeholders restantes:** ${remainingPlaceholders}

## FOTOS DISPONIBLES
${availablePhotos.map((photo, i) => `${i+1}. ${photo}`).join('\n')}

## MAPEOS APLICADOS
${appliedMappings.map((mapping, i) => `${i+1}. **${mapping.producto}** → \`${mapping.foto}\``).join('\n')}

## ARCHIVOS
- **Backup:** ${backupPath}
- **Directorio fotos:** /public/products/
- **productos.ts:** Actualizado con ${updateCount} referencias

## ESTADO
${remainingPlaceholders === 0 ? '✅ TODAS las imágenes han sido asignadas' : `⚠️ ${remainingPlaceholders} productos aún usan placeholder`}
`;

const reportPath = path.join(__dirname, '../docs/direct_image_mapping_report.md');
fs.writeFileSync(reportPath, reportContent);

console.log(`\n📋 REPORTE: ${reportPath}`);

if (remainingPlaceholders === 0) {
  console.log(`\n🎉 ¡PERFECTO! TODAS LAS IMÁGENES HAN SIDO ASIGNADAS EXITOSAMENTE`);
} else {
  console.log(`\n🔧 ${remainingPlaceholders} productos necesitan mapeo manual adicional`);
}

console.log(`\n✅ CATÁLOGO CON FOTOS LOCALES CONFIGURADO`);
