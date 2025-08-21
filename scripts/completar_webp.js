const fs = require('fs');
const path = require('path');

async function verificarImagenesWebP() {
  console.log('🔍 Verificando estado de optimización de imágenes...\n');
  
  const imagenesCriticas = [
    // Logos principales
    '/public/logos/Catering_arcatierra.png',
    '/public/logos/Experiencias_arcatierra.png',
    
    // Imágenes home
    '/public/images/home/chinampas_xochimilco.png',
    '/public/images/logo-arcatierra.png',
    '/public/images/logo-arcatierra-blanco.png',
    
    // Canastas
    '/public/images/canastas/canastacompleta.jpg',
    '/public/images/canastas/canastafamiliar.jpg',
    '/public/images/canastas/canastaindividual.jpg',
    '/public/images/canastas/canastamedia.jpg'
  ];
  
  let optimizadas = 0;
  let faltantes = 0;
  
  for (const imagenRuta of imagenesCriticas) {
    const rutaCompleta = path.join(process.cwd(), imagenRuta);
    const extension = path.extname(imagenRuta);
    const rutaWebP = rutaCompleta.replace(extension, '.webp');
    
    try {
      // Verificar si existe la imagen original
      if (fs.existsSync(rutaCompleta)) {
        // Verificar si existe la versión WebP
        if (fs.existsSync(rutaWebP)) {
          console.log(`✅ ${imagenRuta} → WebP existe`);
          optimizadas++;
        } else {
          console.log(`⚠️  ${imagenRuta} → WebP faltante`);
          faltantes++;
        }
      } else {
        console.log(`❌ ${imagenRuta} → Imagen original no encontrada`);
      }
    } catch (error) {
      console.log(`❌ Error verificando ${imagenRuta}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`   Imágenes optimizadas: ${optimizadas}`);
  console.log(`   Imágenes faltantes WebP: ${faltantes}`);
  console.log(`   Total verificadas: ${imagenesCriticas.length}`);
  
  if (faltantes === 0) {
    console.log('\n🎉 ¡Todas las imágenes críticas están optimizadas!');
  } else {
    console.log(`\n⚠️  Faltan ${faltantes} imágenes por optimizar.`);
    console.log('Sugerencia: Instalar Sharp con "npm install sharp" y ejecutar el script de conversión.');
  }
}

if (require.main === module) {
  verificarImagenesWebP();
}
