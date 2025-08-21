#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuración para optimización de imágenes
const CONFIGURACION_OPTIMIZACION = {
  webp: {
    calidad: 80,
    esfuerzo: 6
  },
  jpeg: {
    calidad: 85,
    progresivo: true
  },
  png: {
    nivelCompresion: 9,
    filtradoAdaptativo: true
  }
};

// Imágenes críticas a optimizar con configuraciones específicas
const OPTIMIZACIONES_CRITICAS = [
  {
    entrada: 'public/images/home/chinampas_xochimilco.png',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 75, redimensionar: { ancho: 1920, alto: 1080, ajuste: 'cover' } },
      { formato: 'jpeg', sufijo: '_respaldo', calidad: 80, redimensionar: { ancho: 1920, alto: 1080, ajuste: 'cover' } }
    ],
    descripcion: 'Imagen de fondo héroe - reducción masiva de tamaño necesaria'
  },
  {
    entrada: 'public/images/logos/logo_arcatierra_sin_texto.png',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 90, redimensionar: { ancho: 200, alto: 200, ajuste: 'inside' } },
      { formato: 'png', sufijo: '_respaldo', calidad: 90, redimensionar: { ancho: 200, alto: 200, ajuste: 'inside' } }
    ],
    descripcion: 'Logo - redimensionado adecuadamente para uso real'
  },
  {
    entrada: 'public/images/canastas/canastamedia.jpg',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 85 },
      { formato: 'jpeg', sufijo: '_respaldo', calidad: 85 }
    ],
    descripcion: 'Optimización de imagen canasta media'
  },
  {
    entrada: 'public/images/canastas/canastacompleta.jpg',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 85 },
      { formato: 'jpeg', sufijo: '_respaldo', calidad: 85 }
    ],
    descripcion: 'Optimización de imagen canasta completa'
  },
  {
    entrada: 'public/images/canastas/canastaindividual.jpg',
    salidas: [
      { formato: 'webp', sufijo: '', calidad: 85 },
      { formato: 'jpeg', sufijo: '_respaldo', calidad: 85 }
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

  async optimizarImagen(rutaEntrada, rutaSalida, configuracion) {
    try {
      const rutaEntradaCompleta = path.join(this.directorioBase, rutaEntrada);
      const rutaSalidaCompleta = path.join(this.directorioBase, rutaSalida);
      
      // Verificar si el archivo de entrada existe
      try {
        await fs.access(rutaEntradaCompleta);
      } catch (error) {
        throw new Error(`Archivo de entrada no encontrado: ${rutaEntradaCompleta}`);
      }

      await this.asegurarDirectorioExiste(rutaSalidaCompleta);

      const tamanoOriginal = await this.obtenerTamanoArchivo(rutaEntradaCompleta);
      
      let instanciaSharp = sharp(rutaEntradaCompleta);

      // Aplicar redimensionamiento si se especifica
      if (configuracion.redimensionar) {
        const opcionesRedimensionar = {
          width: configuracion.redimensionar.ancho,
          height: configuracion.redimensionar.alto,
          fit: configuracion.redimensionar.ajuste
        };
        instanciaSharp = instanciaSharp.resize(opcionesRedimensionar);
      }

      // Aplicar optimización específica del formato
      switch (configuracion.formato) {
        case 'webp':
          instanciaSharp = instanciaSharp.webp({
            quality: configuracion.calidad || CONFIGURACION_OPTIMIZACION.webp.calidad,
            effort: CONFIGURACION_OPTIMIZACION.webp.esfuerzo
          });
          break;
        case 'jpeg':
          instanciaSharp = instanciaSharp.jpeg({
            quality: configuracion.calidad || CONFIGURACION_OPTIMIZACION.jpeg.calidad,
            progressive: CONFIGURACION_OPTIMIZACION.jpeg.progresivo
          });
          break;
        case 'png':
          instanciaSharp = instanciaSharp.png({
            compressionLevel: CONFIGURACION_OPTIMIZACION.png.nivelCompresion,
            adaptiveFiltering: CONFIGURACION_OPTIMIZACION.png.filtradoAdaptativo
          });
          break;
      }

      await instanciaSharp.toFile(rutaSalidaCompleta);
      
      const tamanoOptimizado = await this.obtenerTamanoArchivo(rutaSalidaCompleta);
      const ahorro = tamanoOriginal - tamanoOptimizado;
      const porcentajeAhorro = tamanoOriginal > 0 ? ((ahorro / tamanoOriginal) * 100).toFixed(1) : 0;

      this.estadisticas.totalProcesado++;
      this.estadisticas.ahorroTotal += ahorro;

      console.log(`✅ ${rutaEntrada}`);
      console.log(`   📁 ${this.formatearBytes(tamanoOriginal)} → ${this.formatearBytes(tamanoOptimizado)}`);
      console.log(`   💾 Ahorrado ${this.formatearBytes(ahorro)} (${porcentajeAhorro}%)`);
      console.log(`   📤 ${rutaSalida}\n`);

      return { tamanoOriginal, tamanoOptimizado, ahorro };

    } catch (error) {
      this.estadisticas.errores.push({ rutaEntrada, rutaSalida, error: error.message });
      console.error(`❌ Error optimizando ${rutaEntrada}: ${error.message}\n`);
      return null;
    }
  }

  async procesarOptimizaciones() {
    console.log('🚀 Iniciando optimizaciones críticas de imágenes...\n');

    for (const optimizacion of OPTIMIZACIONES_CRITICAS) {
      console.log(`📸 Procesando: ${optimizacion.descripcion}`);
      console.log(`   Entrada: ${optimizacion.entrada}`);
      
      for (const salida of optimizacion.salidas) {
        const rutaEntrada = optimizacion.entrada;
        const rutaParsed = path.parse(rutaEntrada);
        const rutaSalida = path.join(
          rutaParsed.dir,
          `${rutaParsed.name}${salida.sufijo}.${salida.formato}`
        );

        await this.optimizarImagen(rutaEntrada, rutaSalida, salida);
      }
    }
  }

  async generarReporte() {
    console.log('📊 REPORTE DE OPTIMIZACIÓN');
    console.log('═'.repeat(50));
    console.log(`📁 Total de imágenes procesadas: ${this.estadisticas.totalProcesado}`);
    console.log(`💾 Espacio total ahorrado: ${this.formatearBytes(this.estadisticas.ahorroTotal)}`);
    
    if (this.estadisticas.errores.length > 0) {
      console.log(`❌ Errores encontrados: ${this.estadisticas.errores.length}`);
      this.estadisticas.errores.forEach(error => {
        console.log(`   ${error.rutaEntrada}: ${error.error}`);
      });
    }
    console.log('═'.repeat(50));
  }
}

// Ejecución principal
async function principal() {
  try {
    // Verificar si sharp está disponible
    try {
      await sharp();
    } catch (error) {
      console.error('❌ Sharp no encontrado. Instalando...');
      console.error('Por favor ejecuta: npm install sharp --save-dev');
      process.exit(1);
    }

    const optimizador = new OptimizadorImagenes();
    await optimizador.procesarOptimizaciones();
    await optimizador.generarReporte();

    console.log('\n🎉 ¡Optimización de imágenes completada!');
    console.log('💡 Próximos pasos:');
    console.log('   1. Actualiza tus componentes para usar las imágenes WebP optimizadas');
    console.log('   2. Agrega soporte de respaldo para navegadores más antiguos');
    console.log('   3. Prueba las imágenes en tu aplicación');
    console.log('   4. Ejecuta Lighthouse nuevamente para medir las mejoras');

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  principal();
}

module.exports = OptimizadorImagenes;
