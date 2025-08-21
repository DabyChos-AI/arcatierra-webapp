#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertirImagenAWebP(rutaOriginal, rutaWebP) {
  try {
    // Verificar si la imagen original existe
    await fs.access(rutaOriginal);
    
    // Convertir a WebP
    await sharp(rutaOriginal)
      .webp({ quality: 85, effort: 6 })
      .toFile(rutaWebP);
    
    console.log(`✅ Convertido: ${rutaOriginal} → ${rutaWebP}`);
    return true;
  } catch (error) {
    console.log(`⚠️  No se pudo convertir ${rutaOriginal}: ${error.message}`);
    return false;
  }
}

async function buscarYConvertirImagenes(directorio) {
  try {
    const elementos = await fs.readdir(directorio, { withFileTypes: true });
    
    for (const elemento of elementos) {
      const rutaCompleta = path.join(directorio, elemento.name);
      
      if (elemento.isDirectory()) {
        // Recursión en subdirectorios
        await buscarYConvertirImagenes(rutaCompleta);
      } else if (elemento.isFile()) {
        const extension = path.extname(elemento.name).toLowerCase();
        
        // Solo procesar imágenes JPG, JPEG y PNG
        if (['.jpg', '.jpeg', '.png'].includes(extension)) {
          const nombreSinExtension = path.parse(elemento.name).name;
          const rutaWebP = path.join(directorio, nombreSinExtension + '.webp');
          
          // Solo convertir si la versión WebP no existe
          try {
            await fs.access(rutaWebP);
            console.log(`⏭️  Ya existe: ${rutaWebP}`);
          } catch {
            await convertirImagenAWebP(rutaCompleta, rutaWebP);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error procesando directorio ${directorio}: ${error.message}`);
  }
}

async function principal() {
  console.log('🚀 Iniciando conversión a WebP...\n');
  
  const directorioPublic = path.join(process.cwd(), 'public');
  
  try {
    await buscarYConvertirImagenes(directorioPublic);
    console.log('\n✅ Conversión completada!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  principal();
}
