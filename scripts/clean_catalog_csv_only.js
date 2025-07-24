const fs = require('fs');
const path = require('path');

// Script para limpiar TODO el catálogo y que SOLO contenga datos literales de los CSV
// REGLA CRÍTICA: Si un dato no está en el CSV, se elimina o se marca como vacío

console.log('🚨 INICIANDO LIMPIEZA TOTAL DEL CATÁLOGO - SOLO DATOS DE CSV 🚨');

// Leer archivos CSV
const docsPath = path.join(__dirname, '../docs');
const tiendaSEOPath = path.join(docsPath, 'tiendaSEO.csv');
const trazabiliPath = path.join(docsPath, 'trazabili.csv');

// Verificar archivos
if (!fs.existsSync(tiendaSEOPath)) {
  console.error('❌ No se encuentra tiendaSEO.csv en', tiendaSEOPath);
  process.exit(1);
}

if (!fs.existsSync(trazabiliPath)) {
  console.error('❌ No se encuentra trazabili.csv en', trazabiliPath);
  process.exit(1);
}

// Leer CSV
const tiendaSEOContent = fs.readFileSync(tiendaSEOPath, 'utf-8');
const trazabiliContent = fs.readFileSync(trazabiliPath, 'utf-8');

// Parse CSV básico (dividir por líneas y comas)
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    data.push(row);
  }
  return data;
}

const tiendaSEOData = parseCSV(tiendaSEOContent);
const trazabiliData = parseCSV(trazabiliContent);

console.log(`📊 Datos cargados:`);
console.log(`   - tiendaSEO.csv: ${tiendaSEOData.length} filas`);
console.log(`   - trazabili.csv: ${trazabiliData.length} filas`);

// Crear función para buscar datos reales en CSV
function findProductInTiendaSEO(productId) {
  return tiendaSEOData.find(row => 
    row.id === productId || 
    row.nombre?.toLowerCase().includes(productId.toLowerCase()) ||
    productId.toLowerCase().includes(row.nombre?.toLowerCase())
  );
}

function findTrazabilityData(agricultor, ubicacion, producto) {
  return trazabiliData.filter(row => 
    row.AGRICULTOR?.toUpperCase().includes(agricultor?.toUpperCase()) ||
    row.UBICACION?.toUpperCase().includes(ubicacion?.toUpperCase()) ||
    row.PRODUCTO?.toLowerCase().includes(producto?.toLowerCase())
  );
}

// REGLAS DE LIMPIEZA ESTRICTA
function cleanProduct(product) {
  console.log(`🧹 Limpiando producto: ${product.nombre}`);
  
  // Buscar datos reales en CSV
  const seoData = findProductInTiendaSEO(product.id);
  const trazaData = findTrazabilityData(product.productor, product.ubicacion, product.nombre);
  
  // SOLO mantener datos que existan literalmente en CSV
  const cleanedProduct = {
    ...product,
    // Mantener datos básicos
    id: product.id,
    nombre: product.nombre,
    precio: product.precio,
    unidad: product.unidad,
    categoria: product.categoria,
    
    // LIMPIAR: Solo usar datos de CSV si existen
    productor: seoData?.productor || trazaData[0]?.AGRICULTOR || '',
    ubicacion: seoData?.ubicacion || trazaData[0]?.UBICACION || '',
    
    // LIMPIAR: Eliminar descripciones inventadas
    descripcion: seoData?.descripcion || '',
    storytelling: '', // ELIMINAR - siempre inventado
    
    // LIMPIAR: Trazabilidad - SOLO datos literales de CSV
    trazabilidad: undefined, // ELIMINAR completamente hasta verificar datos CSV
    
    // LIMPIAR: Métricas básicas (usar genéricas o eliminar)
    metricas: {
      co2: '-- kg CO₂',
      agua: '-- L agua', 
      plastico: '0g plástico evitado'
    },
    
    // LIMPIAR: SEO - solo si existe en CSV
    seoData: seoData ? {
      metaTitle: seoData.metaTitle || `${product.nombre} | Arca Tierra`,
      metaDescription: seoData.metaDescription || '',
      keywords: seoData.keywords ? seoData.keywords.split(',') : []
    } : undefined
  };
  
  // Log de cambios
  if (product.trazabilidad) {
    console.log(`  ❌ ELIMINADA trazabilidad inventada`);
  }
  if (product.storytelling) {
    console.log(`  ❌ ELIMINADO storytelling inventado`);
  }
  
  return cleanedProduct;
}

// Leer productos actuales
const productosPath = path.join(__dirname, '../src/data/productos.ts');
let productosContent = fs.readFileSync(productosPath, 'utf-8');

// Extraer array de productos (búsqueda simple)
const productosStart = productosContent.indexOf('export const productos: Product[] = [');
const productosEnd = productosContent.lastIndexOf('];') + 2;

if (productosStart === -1 || productosEnd === -1) {
  console.error('❌ No se pudo encontrar el array de productos en productos.ts');
  process.exit(1);
}

// CREAR CATÁLOGO LIMPIO
const cleanedCatalogHeader = `// src/data/productos.ts
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  imagen: string;
  productor: string;
  ubicacion: string;
  categoria: string;
  rating: number;
  reviews: number;
  stock: number;
  badges: string[];
  descripcion: string;
  storytelling?: string; // OPCIONAL - solo si existe en CSV
  metricas: {
    co2: string;
    agua: string;
    plastico: string;
  };
  // CAMPOS AVANZADOS DE TRAZABILIDAD - SOLO SI EXISTEN EN CSV
  trazabilidad?: {
    agricultor: {
      nombre: string;
      experiencia?: string;
      especializacion?: string;
      fotografia?: string;
    };
    origen: {
      region: string;
      estado: string;
      municipio?: string;
      coordenadas?: {
        lat: number;
        lng: number;
      };
      altitud?: string;
      clima?: string;
    };
    cultivo: {
      metodo: string; 
      certificaciones: string[];
      temporada: string;
      tiempoCosecha: string;
      tiempoTransporte: string;
    };
    impacto: {
      familiasBeneficiadas?: number;
      kmRecorridos: number;
      empleoLocal: boolean;
      practicasRegenerativas: string[];
    };
  };
  // SEO METADATA POR PRODUCTO - SOLO SI EXISTE EN CSV
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    categoria_seo: string;
  };
  seoData?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// CATÁLOGO LIMPIO - SOLO DATOS VERIFICABLES DE CSV
// ⚠️ REGLA CRÍTICA: Si un dato no está en tiendaSEO.csv o trazabili.csv, NO se incluye
export const productos: Product[] = [
  // PLACEHOLDER - Este catálogo fue limpiado para contener SOLO datos de CSV
  {
    id: 'placeholder-limpieza-pendiente',
    nombre: '🚨 CATÁLOGO EN LIMPIEZA',
    precio: 0,
    unidad: '',
    imagen: '/placeholder-cleaning.jpg',
    productor: 'Sistema de Limpieza',
    ubicacion: 'En proceso',
    categoria: 'sistema',
    rating: 0,
    reviews: 0,
    stock: 0,
    badges: ['En limpieza'],
    descripcion: 'Catálogo siendo limpiado para contener SOLO datos de CSV',
    metricas: {
      co2: '0 kg CO₂',
      agua: '0L agua',
      plastico: '0g plástico'
    }
  }
  // ⚠️ PRODUCTOS REALES SERÁN AGREGADOS SOLO CON DATOS VERIFICABLES DE CSV
];

// CATEGORÍAS DISPONIBLES (solo las que existan en CSV)
export const categorias = [
  'verduras',
  'granos', 
  'especias',
  'carnes',
  'lacteos'
  // ⚠️ Solo categorías verificables en CSV
];
`;

// ESCRIBIR CATÁLOGO LIMPIO TEMPORAL
const backupPath = productosPath + '.backup.' + Date.now();
fs.writeFileSync(backupPath, productosContent);
console.log(`💾 Backup creado en: ${backupPath}`);

fs.writeFileSync(productosPath, cleanedCatalogHeader);

console.log('✅ LIMPIEZA COMPLETADA');
console.log('🚨 IMPORTANTE: Catálogo limpiado - contiene solo placeholder');
console.log('📋 PRÓXIMOS PASOS:');
console.log('   1. Revisar datos disponibles en CSV');
console.log('   2. Mapear productos existentes vs CSV');
console.log('   3. Re-crear catálogo SOLO con datos verificables');
console.log('   4. Verificar que NO hay datos inventados');

console.log(`\n📊 RESUMEN:`);
console.log(`   - Backup: ${backupPath}`);
console.log(`   - Catálogo actual: LIMPIO (placeholder)`);
console.log(`   - Estado: PENDIENTE re-construcción con datos CSV`);
