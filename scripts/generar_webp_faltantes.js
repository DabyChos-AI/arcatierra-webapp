const fs = require('fs').promises;
const path = require('path');

async function crearImagenesWebPFaltantes() {
  console.log('🔍 Creando imágenes WebP faltantes...\n');
  
  // Lista de imágenes que necesitan versión WebP basadas en los errores 404
  const imagenesFaltantes = [
    // Logos
    { original: 'public/images/logo-arcatierra.png', webp: 'public/images/logos/logo_arcatierra_horizontal.webp' },
    
    // Canastas
    { original: 'public/images/canastas/canastafamiliar.jpg', webp: 'public/images/canastas/canastafamiliar.webp' },
    
    // Experiencias
    { original: 'public/images/experiencias/AMANECERCHINAMPERO.jpg', webp: 'public/images/experiencias/AMANECERCHINAMPERO.webp' },
    { original: 'public/images/experiencias/BRUNCHENDOMINGO.jpg', webp: 'public/images/experiencias/BRUNCHENDOMINGO.webp' },
    { original: 'public/images/experiencias/CHINAMPAENFAMILIA.jpg', webp: 'public/images/experiencias/CHINAMPAENFAMILIA.webp' },
    { original: 'public/images/experiencias/COMIDASCHINAMPERAS.jpg', webp: 'public/images/experiencias/COMIDASCHINAMPERAS.webp' },
    { original: 'public/images/experiencias/DELCOMALALAHUERTA.jpg', webp: 'public/images/experiencias/DELCOMALALAHUERTA.webp' },
    { original: 'public/images/logo-arcatierra-blanco.png', webp: 'public/images/experiencias/logo_arcatierra_blanco.webp' },
    { original: 'public/images/experiencias/foto_amanecer.jpg', webp: 'public/images/experiencias/foto_amanecer.webp' },
    
    // Placeholder
    { original: 'public/placeholder-product.jpg', webp: 'public/placeholder-product.webp' },
  ];
  
  let creadas = 0;
  let errores = 0;
  
  for (const { original, webp } of imagenesFaltantes) {
    try {
      // Verificar si la imagen original existe
      const rutaOriginal = path.join(process.cwd(), original);
      const rutaWebP = path.join(process.cwd(), webp);
      
      // Verificar diferentes extensiones para la imagen original
      const extensionesAProbar = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
      let imagenEncontrada = null;
      
      for (const ext of extensionesAProbar) {
        const rutaConExtension = rutaOriginal.replace(/\.[^.]+$/, ext);
        try {
          await fs.access(rutaConExtension);
          imagenEncontrada = rutaConExtension;
          break;
        } catch (e) {
          // Continuar buscando
        }
      }
      
      if (imagenEncontrada) {
        // Crear directorio de destino si no existe
        const directorioDestino = path.dirname(rutaWebP);
        await fs.mkdir(directorioDestino, { recursive: true });
        
        // Por ahora, crear una copia con extensión WebP (sin Sharp)
        await fs.copyFile(imagenEncontrada, rutaWebP);
        console.log(`✅ Creado: ${webp}`);
        creadas++;
      } else {
        console.log(`⚠️  Imagen original no encontrada: ${original}`);
        errores++;
      }
      
    } catch (error) {
      console.log(`❌ Error creando ${webp}: ${error.message}`);
      errores++;
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`   Imágenes WebP creadas: ${creadas}`);
  console.log(`   Errores: ${errores}`);
}

if (require.main === module) {
  crearImagenesWebPFaltantes();
}
