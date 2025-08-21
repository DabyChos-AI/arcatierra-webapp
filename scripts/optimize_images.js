#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuración para optimización de imágenes
const CONFIGURACION_OPTIMIZACION = {
  webp: {
    quality: 80,
    effort: 6
  },
  jpeg: {
    quality: 85,
    progressive: true
  },
  png: {
    compressionLevel: 9,
    adaptiveFiltering: true
  }
};

// Imágenes críticas a optimizar con configuraciones específicas
const OPTIMIZACIONES_CRITICAS = [
  {
    entrada: 'public/images/home/chinampas_xochimilco.png',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 75, redimensionar: { width: 1920, height: 1080, fit: 'cover' } },
      { formato: 'jpeg', sufijo: '_fallback', calidad: 80, redimensionar: { width: 1920, height: 1080, fit: 'cover' } }
    ],
    descripcion: 'Imagen de fondo héroe - reducción masiva de tamaño necesaria'
  },
  {
    entrada: 'public/images/logos/logo_arcatierra_sin_texto.png',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 90, redimensionar: { width: 200, height: 200, fit: 'inside' } },
      { formato: 'png', sufijo: '_fallback', calidad: 90, redimensionar: { width: 200, height: 200, fit: 'inside' } }
    ],
    descripcion: 'Logo - redimensionado adecuadamente para uso real'
  },
  {
    entrada: 'public/images/canastas/canastamedia.jpg',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 85 },
      { formato: 'jpeg', sufijo: '_fallback', calidad: 85 }
    ],
    descripcion: 'Optimización de imagen canasta media'
  },
  {
    entrada: 'public/images/canastas/canastacompleta.jpg',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 85 },
      { formato: 'jpeg', sufijo: '_fallback', calidad: 85 }
    ],
    descripcion: 'Optimización de imagen canasta completa'
  },
  {
    entrada: 'public/images/canastas/canastaindividual.jpg',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 85 },
      { formato: 'jpeg', sufijo: '_fallback', calidad: 85 }
    ],
    descripcion: 'Optimización de imagen canasta individual'
  }
];

class OptimizadorImagenes {
  constructor() {
    this.directorioBase = process.cwd();
    this.estadisticas = {
      totalProcesado: 0,
      ahorroTotal: 0,
      errores: []
    };
  }

  async obtenerTamanoArchivo(rutaArchivo) {
    try {
      const estadisticas = await fs.stat(rutaArchivo);
      return estadisticas.size;
    } catch (error) {
      return 0;
    }
  }

  formatearBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamanos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanos[i];
  }

  async asegurarDirectorioExiste(rutaArchivo) {
    const directorio = path.dirname(rutaArchivo);
    try {
      await fs.access(directorio);
    } catch (error) {
      await fs.mkdir(directorio, { recursive: true });
    }
  }

  async optimizeImage(inputPath, outputPath, config) {
    try {
      const fullInputPath = path.join(this.baseDir, inputPath);
      const fullOutputPath = path.join(this.baseDir, outputPath);
      
      // Check if input file exists
      try {
        await fs.access(fullInputPath);
      } catch (error) {
        throw new Error(`Input file not found: ${fullInputPath}`);
      }

      await this.ensureDirectoryExists(fullOutputPath);

      const originalSize = await this.getFileSize(fullInputPath);
      
      let sharpInstance = sharp(fullInputPath);

      // Apply resize if specified
      if (config.resize) {
        sharpInstance = sharpInstance.resize(config.resize);
      }

      // Apply format-specific optimization
      switch (config.format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality: config.quality || OPTIMIZATION_CONFIG.webp.quality,
            effort: OPTIMIZATION_CONFIG.webp.effort
          });
          break;
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({
            quality: config.quality || OPTIMIZATION_CONFIG.jpeg.quality,
            progressive: OPTIMIZATION_CONFIG.jpeg.progressive
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({
            compressionLevel: OPTIMIZATION_CONFIG.png.compressionLevel,
            adaptiveFiltering: OPTIMIZATION_CONFIG.png.adaptiveFiltering
          });
          break;
      }

      await sharpInstance.toFile(fullOutputPath);
      
      const optimizedSize = await this.getFileSize(fullOutputPath);
      const savings = originalSize - optimizedSize;
      const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : 0;

      this.stats.totalProcessed++;
      this.stats.totalSavings += savings;

      console.log(`✅ ${inputPath}`);
      console.log(`   📁 ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)}`);
      console.log(`   💾 Saved ${this.formatBytes(savings)} (${savingsPercent}%)`);
      console.log(`   📤 ${outputPath}\n`);

      return { originalSize, optimizedSize, savings };

    } catch (error) {
      this.stats.errors.push({ inputPath, outputPath, error: error.message });
      console.error(`❌ Error optimizing ${inputPath}: ${error.message}\n`);
      return null;
    }
  }

  async processOptimizations() {
    console.log('🚀 Starting critical image optimizations...\n');

    for (const optimization of CRITICAL_OPTIMIZATIONS) {
      console.log(`📸 Processing: ${optimization.description}`);
      console.log(`   Input: ${optimization.input}`);
      
      for (const output of optimization.outputs) {
        const inputPath = optimization.input;
        const parsedPath = path.parse(inputPath);
        const outputPath = path.join(
          parsedPath.dir,
          `${parsedPath.name}${output.suffix}.${output.format}`
        );

        await this.optimizeImage(inputPath, outputPath, output);
      }
    }
  }

  async generateReport() {
    console.log('📊 OPTIMIZATION REPORT');
    console.log('═'.repeat(50));
    console.log(`📁 Total images processed: ${this.stats.totalProcessed}`);
    console.log(`💾 Total space saved: ${this.formatBytes(this.stats.totalSavings)}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.forEach(error => {
        console.log(`   ${error.inputPath}: ${error.error}`);
      });
    }
    console.log('═'.repeat(50));
  }
}

// Main execution
async function main() {
  try {
    // Check if sharp is available
    try {
      await sharp();
    } catch (error) {
      console.error('❌ Sharp not found. Installing...');
      console.error('Please run: npm install sharp --save-dev');
      process.exit(1);
    }

    const optimizer = new ImageOptimizer();
    await optimizer.processOptimizations();
    await optimizer.generateReport();

    console.log('\n🎉 Image optimization completed!');
    console.log('💡 Next steps:');
    console.log('   1. Update your components to use the optimized WebP images');
    console.log('   2. Add fallback support for older browsers');
    console.log('   3. Test the images in your application');
    console.log('   4. Run Lighthouse again to measure improvements');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ImageOptimizer;
