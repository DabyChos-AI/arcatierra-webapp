import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Product } from '../src/types/product';

// --- CONFIGURACIÓN ---
const PRODUCTS_CSV_PATH = path.resolve(__dirname, '..', 'docs', 'productostienda.csv');
const TRACEABILITY_CSV_PATH = path.resolve(__dirname, '..', 'docs', 'trazabili.csv');
const SEO_CSV_PATH = path.resolve(__dirname, '..', 'docs', 'tiendaSEO.csv');
const IMAGES_DIR_PATH = path.resolve(__dirname, '..', 'public', 'images', 'tienda');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'src', 'data', 'productos.ts');
const PLACEHOLDER_IMAGE = '/images/placeholder.png';

// --- TIPOS Y INTERFACES ---
type TraceabilityData = { productor: string; region: string };

// --- HELPERS ---

/**
 * Normaliza un texto para usarlo como clave: minúsculas, sin acentos y sin caracteres especiales.
 */
function normalizeKey(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^a-z0-9]/g, ''); // Elimina todo lo que no sea letra o número
}

/**
 * Genera un ID único (slug) a partir del nombre del producto.
 */
function generateId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Encuentra la mejor coincidencia para una clave de producto en un mapa de datos (imágenes, trazabilidad).
 * Devuelve el valor correspondiente a la clave más larga que esté contenida en la clave del producto.
 */
function findBestMatch<T>(productKey: string, dataMap: Map<string, T>): T | undefined {
  let bestMatch: T | undefined = undefined;
  let longestMatchLength = 0;

  // Evita que una clave vacía coincida con todo
  if (!productKey) return undefined;

  for (const [dataKey, dataValue] of dataMap.entries()) {
    // La clave de datos debe existir y estar contenida en la clave del producto
    if (dataKey && productKey.includes(dataKey)) {
      if (dataKey.length > longestMatchLength) {
        longestMatchLength = dataKey.length;
        bestMatch = dataValue;
      }
    }
  }
  return bestMatch;
}

/**
 * Carga los datos de trazabilidad desde el CSV y los devuelve en un mapa.
 */
async function loadTraceabilityData(): Promise<Map<string, TraceabilityData>> {
  const traceabilityMap = new Map<string, TraceabilityData>();
  // csv-parser convierte los encabezados a minúsculas por defecto.
  const stream = fs.createReadStream(TRACEABILITY_CSV_PATH).pipe(csv({
    mapHeaders: ({ header }) => header.toLowerCase().trim()
  }));
  for await (const row of stream) {
    // Usamos 'row.producto' en minúsculas para que coincida con el encabezado del CSV.
    if (row.producto && row.productor) {
      const key = normalizeKey(row.producto);
      traceabilityMap.set(key, { productor: row.productor.trim(), region: row.region ? row.region.trim() : 'No disponible' });
    }
  }
  console.log(`Se cargaron ${traceabilityMap.size} registros de trazabilidad.`);
  return traceabilityMap;
}

/**
 * Escanea el directorio de imágenes y devuelve un mapa de claves normalizadas a rutas de imagen.
 */
/**
 * Carga las descripciones desde tiendaSEO.csv y las devuelve en un mapa.
 */
async function loadDescriptions(): Promise<Map<string, string>> {
  const descriptionsMap = new Map<string, string>();
  const stream = fs.createReadStream(SEO_CSV_PATH).pipe(csv({
    mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ''),
    skipLines: 82 // Los productos empiezan en la línea 83
  }));

  for await (const row of stream) {
    if (row.PRODUCTO && row['DESCRIPCIÓN DE PRODUCTO']) {
      const key = normalizeKey(row.PRODUCTO.trim());
      descriptionsMap.set(key, row['DESCRIPCIÓN DE PRODUCTO'].trim());
    }
  }
  console.log(`Se cargaron ${descriptionsMap.size} descripciones desde tiendaSEO.csv.`);
  return descriptionsMap;
}

/**
 * Escanea el directorio de imágenes y devuelve un mapa de claves normalizadas a rutas de imagen.
 */
async function loadImagePaths(): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  const files = await fs.promises.readdir(IMAGES_DIR_PATH);
  for (const file of files) {
    const baseName = path.parse(file).name;
    const key = normalizeKey(baseName.split('_')[0]); // Usa la primera parte del nombre del archivo
    imageMap.set(key, `/images/tienda/${file}`);
  }
  console.log(`Se encontraron ${imageMap.size} imágenes en el directorio.`);
  return imageMap;
}

// --- LÓGICA PRINCIPAL ---

async function generateCatalog() {
  const traceabilityMap = await loadTraceabilityData();
  const imageMap = await loadImagePaths();
  const descriptionsMap = await loadDescriptions();
  const products = new Map<string, Product>();

  console.log(`Leyendo productos desde: ${PRODUCTS_CSV_PATH}`);
  const stream = fs.createReadStream(PRODUCTS_CSV_PATH).pipe(csv({
    mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
  }));

  for await (const row of stream) {
    if (!row.PRODUCTO || !row.SKU) continue;

    const nombreProducto = row.PRODUCTO.trim();
    const id = generateId(nombreProducto);
    const key = normalizeKey(nombreProducto);

    const traceability = findBestMatch(key, traceabilityMap) || { productor: '', region: '' };
    const imagen = findBestMatch(key, imageMap) || PLACEHOLDER_IMAGE;
    const descripcion = descriptionsMap.get(key) || row['DESCRIPCIÓN DE PRODUCTO']?.trim() || '';

    const productData: Product = {
      id,
      nombre: nombreProducto,
      precio: parseFloat(row['PRECIO FINAL']?.replace(/[^\d.]/g, '')) || 0,
      unidad: row.UNIDAD?.trim() || 'pz',
      categoria: row.CATEGORIA?.trim() || 'General',
      productor: traceability.productor,
      ubicacion: traceability.region,
      imagen,
      descripcion,
      // --- Campos con valores por defecto (no inventados, sino neutrales) ---
      rating: 0,
      reviews: 0,
      stock: 100,
      badges: [],
      storytelling: '',
      metricas: { co2: '', agua: '', plastico: '' },
      seoData: {
        metaTitle: `Comprar ${nombreProducto} | Arca Tierra`,
        metaDescription: `Encuentra ${nombreProducto} fresco y de origen local en Arca Tierra.`,
        keywords: [nombreProducto, 'producto local', 'comida regenerativa']
      },
      variantes: []
    };
    products.set(id, productData);
  }

  console.log(`Se procesaron ${products.size} productos únicos.`);

  // --- GENERACIÓN DEL ARCHIVO .TS ---
  const productArray = Array.from(products.values());
  const fileContent = `// Archivo generado automáticamente por 'update_products_from_csv.ts'
// Fecha: ${new Date().toISOString()}

import { Product } from '@/types/product';

export const productos: Product[] = ${JSON.stringify(productArray, null, 2)};
`;

  fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf-8');
  console.log(`Archivo 'productos.ts' actualizado exitosamente en: ${OUTPUT_PATH}`);
}

generateCatalog().catch(error => {
  console.error('Ocurrió un error al generar el catálogo:', error);
});
