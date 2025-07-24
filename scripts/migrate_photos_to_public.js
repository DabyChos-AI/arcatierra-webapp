const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Script para migrar automáticamente las fotos de Google Drive a /public/products/
// y actualizar las referencias en el catálogo

console.log('📸 INICIANDO MIGRACIÓN DE FOTOS DE GOOGLE DRIVE A /PUBLIC/PRODUCTS/ 📸');

// Rutas de archivos
const docsPath = path.join(__dirname, '../docs');
const trazabiliPath = path.join(docsPath, 'trazabili.csv');
const publicProductsPath = path.join(__dirname, '../public/products');
const productosPath = path.join(__dirname, '../src/data/productos.ts');

// Crear directorio public/products si no existe
if (!fs.existsSync(publicProductsPath)) {
  fs.mkdirSync(publicProductsPath, { recursive: true });
  console.log('📁 Creado directorio:', publicProductsPath);
}

// Leer y parsear CSV
if (!fs.existsSync(trazabiliPath)) {
  console.error('❌ No se encuentra trazabili.csv en', trazabiliPath);
  process.exit(1);
}

const trazabiliContent = fs.readFileSync(trazabiliPath, 'utf-8');
console.log('📄 Archivo trazabili.csv cargado');

// Parsear CSV y extraer URLs de fotos
function parseCSVForPhotos(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const photosData = [];
  
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
    
    // Solo agregar si tiene URL de foto
    if (entry.fotoURL && entry.fotoURL.includes('drive.google.com')) {
      photosData.push(entry);
    }
  }
  
  return photosData;
}

const photosData = parseCSVForPhotos(trazabiliContent);

console.log(`📊 Fotos encontradas en CSV: ${photosData.length}`);
console.log('🔍 Primeras 5 fotos:');
photosData.slice(0, 5).forEach((item, i) => {
  console.log(`   ${i+1}. ${item.producto} - ${item.agricultor}`);
  console.log(`      URL: ${item.fotoURL}`);
});

// Función para convertir URL de Google Drive a formato de descarga directa
function convertGoogleDriveURL(url) {
  try {
    // Extraer el ID del archivo de la URL de Google Drive
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?id=${fileId}&export=download`;
    }
  } catch (error) {
    console.error('Error al convertir URL:', error);
  }
  return null;
}

// Función para crear nombre de archivo seguro
function createSafeFileName(producto, agricultor, index) {
  const productName = producto.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  
  const agricultorName = agricultor.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .split(' ')[0]
    .substring(0, 15);
  
  return `${productName}-${agricultorName}-${index}.jpg`;
}

// Función para descargar archivo de URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`⬇️ Descargando: ${path.basename(filePath)}`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      // Manejar redirecciones
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectURL = response.headers.location;
        console.log(`🔄 Redirigiendo a: ${redirectURL}`);
        return downloadFile(redirectURL, filePath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Error HTTP: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Descargado: ${path.basename(filePath)}`);
        resolve(filePath);
      });
      
    }).on('error', (error) => {
      fs.unlink(filePath, () => {}); // Eliminar archivo parcial
      reject(error);
    });
  });
}

// Función principal de migración
async function migratePhotos() {
  console.log('\n🚀 INICIANDO DESCARGA DE FOTOS...\n');
  
  const downloadedPhotos = [];
  const failedDownloads = [];
  
  for (let i = 0; i < photosData.length; i++) {
    const item = photosData[i];
    const fileName = createSafeFileName(item.producto, item.agricultor, i + 1);
    const filePath = path.join(publicProductsPath, fileName);
    
    console.log(`📦 [${i + 1}/${photosData.length}] ${item.producto} - ${item.agricultor}`);
    
    try {
      const downloadURL = convertGoogleDriveURL(item.fotoURL);
      
      if (!downloadURL) {
        console.log(`  ⚠️ No se pudo convertir URL de Google Drive`);
        failedDownloads.push({
          ...item,
          fileName: fileName,
          reason: 'URL conversion failed'
        });
        continue;
      }
      
      await downloadFile(downloadURL, filePath);
      
      downloadedPhotos.push({
        ...item,
        fileName: fileName,
        localPath: `/products/${fileName}`
      });
      
      // Pequeña pausa para evitar saturar Google Drive
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ❌ Error descargando: ${error.message}`);
      failedDownloads.push({
        ...item,
        fileName: fileName,
        reason: error.message
      });
    }
  }
  
  console.log(`\n✅ DESCARGA COMPLETADA:`);
  console.log(`   📸 Fotos descargadas exitosamente: ${downloadedPhotos.length}`);
  console.log(`   ❌ Fallos en descarga: ${failedDownloads.length}`);
  
  return { downloadedPhotos, failedDownloads };
}

// Función para actualizar productos.ts con rutas locales
function updateProductsWithLocalImages(downloadedPhotos) {
  console.log('\n📝 ACTUALIZANDO PRODUCTOS.TS CON RUTAS LOCALES...');
  
  if (!fs.existsSync(productosPath)) {
    console.error('❌ No se encuentra productos.ts en', productosPath);
    return;
  }
  
  let productosContent = fs.readFileSync(productosPath, 'utf-8');
  
  // Crear mapa de productos a fotos
  const photoMap = new Map();
  downloadedPhotos.forEach(photo => {
    const key = `${photo.producto.toLowerCase()}-${photo.agricultor.toLowerCase()}`;
    photoMap.set(key, photo.localPath);
  });
  
  console.log(`📋 Mapeando ${photoMap.size} fotos a productos...`);
  
  // Actualizar imágenes placeholder por rutas reales
  let updatedCount = 0;
  
  // Buscar y reemplazar placeholder images
  productosContent = productosContent.replace(
    /"imagen": "\/placeholder-product\.jpg"/g, 
    (match, offset) => {
      // Buscar el nombre y productor del producto en contexto
      const beforeMatch = productosContent.substring(Math.max(0, offset - 500), offset);
      const afterMatch = productosContent.substring(offset, offset + 500);
      
      const nameMatch = beforeMatch.match(/"nombre": "([^"]+)"/);
      const producerMatch = beforeMatch.match(/"productor": "([^"]+)"/);
      
      if (nameMatch && producerMatch) {
        const productName = nameMatch[1].toLowerCase();
        const producer = producerMatch[1].toLowerCase();
        const lookupKey = `${productName}-${producer}`;
        
        if (photoMap.has(lookupKey)) {
          updatedCount++;
          console.log(`  ✅ ${nameMatch[1]} → ${photoMap.get(lookupKey)}`);
          return `"imagen": "${photoMap.get(lookupKey)}"`;
        }
      }
      
      return match; // Sin cambios si no se encuentra
    }
  );
  
  // Escribir archivo actualizado
  const backupPath = productosPath + '.backup.' + Date.now();
  fs.writeFileSync(backupPath, fs.readFileSync(productosPath, 'utf-8'));
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`✅ PRODUCTOS.TS ACTUALIZADO:`);
  console.log(`   💾 Backup: ${backupPath}`);
  console.log(`   🔄 Imágenes actualizadas: ${updatedCount}`);
  
  return updatedCount;
}

// Función para generar reporte
function generateReport(downloadedPhotos, failedDownloads, updatedCount) {
  const reportContent = `# REPORTE DE MIGRACIÓN DE FOTOS
Fecha: ${new Date().toISOString()}

## RESUMEN
- **Fotos encontradas en CSV:** ${photosData.length}
- **Fotos descargadas exitosamente:** ${downloadedPhotos.length}
- **Fallos en descarga:** ${failedDownloads.length}
- **Productos actualizados:** ${updatedCount || 0}

## FOTOS DESCARGADAS EXITOSAMENTE
${downloadedPhotos.map((photo, i) => 
  `${i+1}. **${photo.producto}** (${photo.agricultor}) → \`${photo.localPath}\``
).join('\n')}

## FALLOS EN DESCARGA
${failedDownloads.map((fail, i) => 
  `${i+1}. **${fail.producto}** (${fail.agricultor}) - ${fail.reason}`
).join('\n')}

## ARCHIVOS GENERADOS
- **Directorio de fotos:** \`/public/products/\`
- **Total archivos:** ${downloadedPhotos.length} imágenes
- **Backup productos.ts:** Creado automáticamente

## PRÓXIMOS PASOS
1. Verificar que las imágenes se muestran correctamente en la tienda
2. Optimizar imágenes si es necesario (tamaño/calidad)
3. Reintentar descarga de fotos fallidas manualmente si es necesario
`;

  const reportPath = path.join(__dirname, '../docs/photo_migration_report.md');
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`\n📋 REPORTE GENERADO: ${reportPath}`);
}

// Ejecutar migración principal
async function main() {
  try {
    const { downloadedPhotos, failedDownloads } = await migratePhotos();
    const updatedCount = updateProductsWithLocalImages(downloadedPhotos);
    generateReport(downloadedPhotos, failedDownloads, updatedCount);
    
    console.log(`\n🎉 MIGRACIÓN DE FOTOS COMPLETADA:`);
    console.log(`   📁 Fotos en: ${publicProductsPath}`);
    console.log(`   📸 Exitosas: ${downloadedPhotos.length}/${photosData.length}`);
    console.log(`   🔄 Productos actualizados: ${updatedCount || 0}`);
    console.log(`   ✅ Catálogo listo con fotos locales`);
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
