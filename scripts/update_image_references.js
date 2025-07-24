const fs = require('fs');
const path = require('path');

// Script para actualizar las referencias de imágenes en productos.ts 
// con las fotos locales que ya fueron descargadas a /public/products/

console.log('🔄 ACTUALIZANDO REFERENCIAS DE IMÁGENES EN PRODUCTOS.TS 🔄');

const publicProductsPath = path.join(__dirname, '../public/products');
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const trazabiliPath = path.join(__dirname, '../docs/trazabili.csv');

// Verificar que los archivos existen
if (!fs.existsSync(publicProductsPath)) {
  console.error('❌ No se encuentra directorio /public/products/', publicProductsPath);
  process.exit(1);
}

if (!fs.existsSync(productosPath)) {
  console.error('❌ No se encuentra productos.ts en', productosPath);
  process.exit(1);
}

if (!fs.existsSync(trazabiliPath)) {
  console.error('❌ No se encuentra trazabili.csv en', trazabiliPath);
  process.exit(1);
}

// Leer fotos disponibles en /public/products/
const availablePhotos = fs.readdirSync(publicProductsPath)
  .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
  .map(file => ({
    fileName: file,
    fullPath: `/products/${file}`,
    baseName: file.replace(/\.[^/.]+$/, "") // Sin extensión
  }));

console.log(`📸 Fotos disponibles en /public/products/: ${availablePhotos.length}`);
console.log('🔍 Primeras 5 fotos:');
availablePhotos.slice(0, 5).forEach((photo, i) => {
  console.log(`   ${i+1}. ${photo.fileName} → ${photo.fullPath}`);
});

// Leer CSV para mapear productos con agricultores
const trazabiliContent = fs.readFileSync(trazabiliPath, 'utf-8');
const csvData = [];

const lines = trazabiliContent.split('\n').filter(line => line.trim());
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  const values = line.split(',');
  const entry = {
    agricultor: values[0] ? values[0].trim().replace(/"/g, '') : '',
    ubicacion: values[1] ? values[1].trim().replace(/"/g, '') : '',
    producto: values[2] ? values[2].trim().replace(/"/g, '') : '',
    fotoURL: values[3] ? values[3].trim().replace(/"/g, '') : ''
  };
  
  if (entry.producto && entry.agricultor) {
    csvData.push(entry);
  }
}

console.log(`📋 Datos del CSV: ${csvData.length} registros`);

// Función para encontrar la mejor coincidencia de foto para un producto
function findBestPhotoMatch(productName, producerName) {
  const cleanProductName = productName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
  
  const cleanProducerName = producerName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .split(' ')[0]; // Solo primer nombre
  
  // Buscar coincidencias exactas primero
  for (const photo of availablePhotos) {
    const photoBase = photo.baseName.toLowerCase();
    
    // Coincidencia exacta con producto-productor
    if (photoBase.includes(cleanProductName) && photoBase.includes(cleanProducerName)) {
      return photo.fullPath;
    }
  }
  
  // Buscar solo por producto
  for (const photo of availablePhotos) {
    const photoBase = photo.baseName.toLowerCase();
    
    if (photoBase.includes(cleanProductName)) {
      return photo.fullPath;
    }
  }
  
  // Buscar por palabras clave del producto
  const productWords = cleanProductName.split('-');
  for (const photo of availablePhotos) {
    const photoBase = photo.baseName.toLowerCase();
    
    for (const word of productWords) {
      if (word.length > 3 && photoBase.includes(word)) {
        return photo.fullPath;
      }
    }
  }
  
  return null; // No se encontró coincidencia
}

// Leer productos.ts actual
let productosContent = fs.readFileSync(productosPath, 'utf-8');

// Crear backup
const backupPath = productosPath + '.backup.' + Date.now();
fs.writeFileSync(backupPath, productosContent);
console.log(`💾 Backup creado: ${backupPath}`);

console.log('\n🔄 PROCESANDO ACTUALIZACIONES...\n');

// Contador de actualizaciones
let updateCount = 0;
let processedProducts = [];

// Buscar y reemplazar placeholder images
productosContent = productosContent.replace(
  /"imagen": "\/placeholder-product\.jpg"/g, 
  (match, offset) => {
    // Buscar contexto del producto actual
    const contextBefore = productosContent.substring(Math.max(0, offset - 800), offset);
    const contextAfter = productosContent.substring(offset, offset + 200);
    
    // Extraer nombre y productor
    const nameMatch = contextBefore.match(/"nombre": "([^"]+)"/);
    const producerMatch = contextBefore.match(/"productor": "([^"]+)"/);
    
    if (nameMatch && producerMatch) {
      const productName = nameMatch[1];
      const producerName = producerMatch[1];
      
      console.log(`🔍 Procesando: ${productName} - ${producerName}`);
      
      // Buscar foto correspondiente
      const bestMatch = findBestPhotoMatch(productName, producerName);
      
      if (bestMatch) {
        updateCount++;
        console.log(`  ✅ Foto encontrada: ${bestMatch}`);
        
        processedProducts.push({
          nombre: productName,
          productor: producerName,
          imagen: bestMatch
        });
        
        return `"imagen": "${bestMatch}"`;
      } else {
        console.log(`  ⚠️ No se encontró foto específica`);
        
        processedProducts.push({
          nombre: productName,
          productor: producerName,
          imagen: '/placeholder-product.jpg'
        });
        
        return match; // Mantener placeholder
      }
    }
    
    return match; // Sin cambios si no se puede parsear
  }
);

// Escribir archivo actualizado
fs.writeFileSync(productosPath, productosContent);

console.log(`\n✅ ACTUALIZACIÓN COMPLETADA:`);
console.log(`   🔄 Referencias actualizadas: ${updateCount}`);
console.log(`   📦 Productos procesados: ${processedProducts.length}`);
console.log(`   📁 Fotos asignadas: ${processedProducts.filter(p => p.imagen !== '/placeholder-product.jpg').length}`);
console.log(`   ⚠️ Sin foto asignada: ${processedProducts.filter(p => p.imagen === '/placeholder-product.jpg').length}`);

// Mostrar productos actualizados con fotos
const withPhotos = processedProducts.filter(p => p.imagen !== '/placeholder-product.jpg');
if (withPhotos.length > 0) {
  console.log(`\n📸 PRODUCTOS CON FOTOS ASIGNADAS (primeros 10):`);
  withPhotos.slice(0, 10).forEach((product, i) => {
    console.log(`   ${i+1}. ${product.nombre} → ${product.imagen}`);
  });
}

// Mostrar productos sin foto
const withoutPhotos = processedProducts.filter(p => p.imagen === '/placeholder-product.jpg');
if (withoutPhotos.length > 0) {
  console.log(`\n⚠️ PRODUCTOS SIN FOTO ESPECÍFICA (primeros 10):`);
  withoutPhotos.slice(0, 10).forEach((product, i) => {
    console.log(`   ${i+1}. ${product.nombre} - ${product.productor}`);
  });
}

// Generar reporte
const reportContent = `# REPORTE DE ACTUALIZACIÓN DE REFERENCIAS DE IMÁGENES
Fecha: ${new Date().toISOString()}

## RESUMEN
- **Fotos disponibles:** ${availablePhotos.length}
- **Productos procesados:** ${processedProducts.length}
- **Referencias actualizadas:** ${updateCount}
- **Productos con foto asignada:** ${withPhotos.length}
- **Productos sin foto específica:** ${withoutPhotos.length}

## FOTOS ASIGNADAS
${withPhotos.map((p, i) => `${i+1}. **${p.nombre}** (${p.productor}) → \`${p.imagen}\``).join('\n')}

## PRODUCTOS SIN FOTO ESPECÍFICA
${withoutPhotos.map((p, i) => `${i+1}. **${p.nombre}** - ${p.productor}`).join('\n')}

## ARCHIVOS
- **Backup productos.ts:** ${backupPath}
- **Directorio fotos:** /public/products/
- **Total fotos disponibles:** ${availablePhotos.length}
`;

const reportPath = path.join(__dirname, '../docs/image_reference_update_report.md');
fs.writeFileSync(reportPath, reportContent);

console.log(`\n📋 REPORTE: ${reportPath}`);
console.log(`\n🎉 CATÁLOGO ACTUALIZADO - FOTOS LOCALES CONFIGURADAS`);
