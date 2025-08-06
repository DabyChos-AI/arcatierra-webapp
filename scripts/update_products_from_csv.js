"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
// --- CONFIGURACIÓN ---
const PRODUCTS_CSV_PATH = path_1.default.resolve(__dirname, '..', 'docs', 'productostienda.csv');
const TRACEABILITY_CSV_PATH = path_1.default.resolve(__dirname, '..', 'docs', 'trazabili.csv');
const SEO_CSV_PATH = path_1.default.resolve(__dirname, '..', 'docs', 'tiendaSEO.csv');
const IMAGES_DIR_PATH = path_1.default.resolve(__dirname, '..', 'public', 'images', 'tienda');
const OUTPUT_PATH = path_1.default.resolve(__dirname, '..', 'src', 'data', 'productos.ts');
const PLACEHOLDER_IMAGE = '/images/placeholder.png';
// --- HELPERS ---
/**
 * Normaliza un texto para usarlo como clave: minúsculas, sin acentos y sin caracteres especiales.
 */
function normalizeKey(text) {
    if (!text)
        return '';
    return text
        .toLowerCase()
        .normalize('NFD') // Descompone acentos
        .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
        .replace(/[^a-z0-9]/g, ''); // Elimina todo lo que no sea letra o número
}
/**
 * Genera un ID único (slug) a partir del nombre del producto.
 */
function generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
/**
 * Encuentra la mejor coincidencia para una clave de producto en un mapa de datos (imágenes, trazabilidad).
 * Devuelve el valor correspondiente a la clave más larga que esté contenida en la clave del producto.
 */
function findBestMatch(productKey, dataMap) {
    let bestMatch = undefined;
    let longestMatchLength = 0;
    // Evita que una clave vacía coincida con todo
    if (!productKey)
        return undefined;
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
async function loadTraceabilityData() {
    var _a, e_1, _b, _c;
    const traceabilityMap = new Map();
    // csv-parser convierte los encabezados a minúsculas por defecto.
    const stream = fs_1.default.createReadStream(TRACEABILITY_CSV_PATH).pipe((0, csv_parser_1.default)({
        mapHeaders: ({ header }) => header.toLowerCase().trim()
    }));
    try {
        for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
            _c = stream_1_1.value;
            _d = false;
            const row = _c;
            // Usamos 'row.producto' en minúsculas para que coincida con el encabezado del CSV.
            if (row.producto && row.productor) {
                const key = normalizeKey(row.producto);
                traceabilityMap.set(key, { productor: row.productor.trim(), region: row.region ? row.region.trim() : 'No disponible' });
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
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
async function loadDescriptions() {
    var _a, e_2, _b, _c;
    const descriptionsMap = new Map();
    const stream = fs_1.default.createReadStream(SEO_CSV_PATH).pipe((0, csv_parser_1.default)({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ''),
        skipLines: 82 // Los productos empiezan en la línea 83
    }));
    try {
        for (var _d = true, stream_2 = __asyncValues(stream), stream_2_1; stream_2_1 = await stream_2.next(), _a = stream_2_1.done, !_a; _d = true) {
            _c = stream_2_1.value;
            _d = false;
            const row = _c;
            if (row.PRODUCTO && row['DESCRIPCIÓN DE PRODUCTO']) {
                const key = normalizeKey(row.PRODUCTO.trim());
                descriptionsMap.set(key, row['DESCRIPCIÓN DE PRODUCTO'].trim());
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_2.return)) await _b.call(stream_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    console.log(`Se cargaron ${descriptionsMap.size} descripciones desde tiendaSEO.csv.`);
    return descriptionsMap;
}
/**
 * Escanea el directorio de imágenes y devuelve un mapa de claves normalizadas a rutas de imagen.
 */
async function loadImagePaths() {
    const imageMap = new Map();
    const files = await fs_1.default.promises.readdir(IMAGES_DIR_PATH);
    for (const file of files) {
        const baseName = path_1.default.parse(file).name;
        const key = normalizeKey(baseName.split('_')[0]); // Usa la primera parte del nombre del archivo
        imageMap.set(key, `/images/tienda/${file}`);
    }
    console.log(`Se encontraron ${imageMap.size} imágenes en el directorio.`);
    return imageMap;
}
// --- LÓGICA PRINCIPAL ---
async function generateCatalog() {
    var _a, e_3, _b, _c;
    var _d, _e, _f, _g;
    const traceabilityMap = await loadTraceabilityData();
    const imageMap = await loadImagePaths();
    const descriptionsMap = await loadDescriptions();
    const products = new Map();
    console.log(`Leyendo productos desde: ${PRODUCTS_CSV_PATH}`);
    const stream = fs_1.default.createReadStream(PRODUCTS_CSV_PATH).pipe((0, csv_parser_1.default)({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
    }));
    try {
        for (var _h = true, stream_3 = __asyncValues(stream), stream_3_1; stream_3_1 = await stream_3.next(), _a = stream_3_1.done, !_a; _h = true) {
            _c = stream_3_1.value;
            _h = false;
            const row = _c;
            if (!row.PRODUCTO || !row.SKU)
                continue;
            const nombreProducto = row.PRODUCTO.trim();
            const id = generateId(nombreProducto);
            const key = normalizeKey(nombreProducto);
            const traceability = findBestMatch(key, traceabilityMap) || { productor: '', region: '' };
            const imagen = findBestMatch(key, imageMap) || PLACEHOLDER_IMAGE;
            const descripcion = descriptionsMap.get(key) || ((_d = row['DESCRIPCIÓN DE PRODUCTO']) === null || _d === void 0 ? void 0 : _d.trim()) || '';
            const productData = {
                id,
                nombre: nombreProducto,
                precio: parseFloat((_e = row['PRECIO FINAL']) === null || _e === void 0 ? void 0 : _e.replace(/[^\d.]/g, '')) || 0,
                unidad: ((_f = row.UNIDAD) === null || _f === void 0 ? void 0 : _f.trim()) || 'pz',
                categoria: ((_g = row.CATEGORIA) === null || _g === void 0 ? void 0 : _g.trim()) || 'General',
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
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (!_h && !_a && (_b = stream_3.return)) await _b.call(stream_3);
        }
        finally { if (e_3) throw e_3.error; }
    }
    console.log(`Se procesaron ${products.size} productos únicos.`);
    // --- GENERACIÓN DEL ARCHIVO .TS ---
    const productArray = Array.from(products.values());
    const fileContent = `// Archivo generado automáticamente por 'update_products_from_csv.ts'
// Fecha: ${new Date().toISOString()}

import { Product } from '@/types/product';

export const productos: Product[] = ${JSON.stringify(productArray, null, 2)};
`;
    fs_1.default.writeFileSync(OUTPUT_PATH, fileContent, 'utf-8');
    console.log(`Archivo 'productos.ts' actualizado exitosamente en: ${OUTPUT_PATH}`);
}
generateCatalog().catch(error => {
    console.error('Ocurrió un error al generar el catálogo:', error);
});
