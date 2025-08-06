"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Lee el contenido del archivo de productos
const productosFilePath = path_1.default.join(__dirname, '..', 'src', 'data', 'productos.ts');
const productosFileContent = fs_1.default.readFileSync(productosFilePath, 'utf8');
// Función para extraer el array de productos del contenido del archivo
const parseProductos = (content) => {
    // Elimina todo antes del inicio del array `[`
    const startIndex = content.indexOf('[');
    // Elimina todo después del final del array `]`
    const endIndex = content.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
        throw new Error('No se pudo encontrar el array de productos en el archivo.');
    }
    // Extrae la porción del string que contiene el array
    const arrayString = content.substring(startIndex, endIndex + 1);
    try {
        // Reemplaza las comillas simples por dobles para que sea un JSON válido
        // y elimina los comentarios o código extra si es necesario.
        // Esta es una forma simplificada; puede necesitar ajustes si la estructura es compleja.
        // Se asume que las claves y strings usan comillas dobles.
        const productos = eval('(' + arrayString + ')');
        return productos;
    }
    catch (error) {
        console.error('Error al parsear el array de productos:', error);
        throw new Error('El formato del array de productos no es válido.');
    }
};
const productos = parseProductos(productosFileContent);
// Define el directorio de reportes en la raíz del proyecto
const reportsDir = path_1.default.join(__dirname, '..', 'reports');
// Crea el directorio de reportes si no existe
if (!fs_1.default.existsSync(reportsDir)) {
    fs_1.default.mkdirSync(reportsDir, { recursive: true });
}
const productosSinFoto = [];
const productosSinDescripcion = [];
const productosSinTrazabilidad = [];
productos.forEach(producto => {
    // 1. Revisa si no tiene foto (si la ruta está vacía o es el placeholder)
    if (!producto.imagen || producto.imagen.includes('placeholder.png')) {
        productosSinFoto.push(producto);
    }
    // 2. Revisa si no tiene descripción
    if (!producto.descripcion || producto.descripcion.trim() === '') {
        productosSinDescripcion.push(producto);
    }
    // 3. Revisa si no tiene datos de trazabilidad (ni productor ni ubicación)
    const tieneProductor = producto.productor && producto.productor.trim() !== '';
    const tieneUbicacion = producto.ubicacion && producto.ubicacion.trim() !== '';
    if (!tieneProductor && !tieneUbicacion) {
        productosSinTrazabilidad.push(producto);
    }
});
// Función para generar un reporte individual
const generateReport = (filename, productList, emptyMessage) => {
    const reportContent = productList.length > 0
        ? productList.map(p => `${p.nombre} (ID: ${p.id})`).join('\n')
        : emptyMessage;
    fs_1.default.writeFileSync(path_1.default.join(reportsDir, filename), reportContent, 'utf8');
};
// Genera los 3 reportes individuales
generateReport('productos-sin-foto.txt', productosSinFoto, 'Todos los productos tienen una imagen asignada.');
generateReport('productos-sin-descripcion.txt', productosSinDescripcion, 'Todos los productos tienen una descripción.');
generateReport('productos-sin-trazabilidad.txt', productosSinTrazabilidad, 'Todos los productos tienen datos de trazabilidad.');
// Genera el reporte consolidado
let consolidatedReport = '--- Reporte Consolidado de Productos ---\n\n';
consolidatedReport += `=== Productos sin Foto (${productosSinFoto.length}) ===\n`;
consolidatedReport += productosSinFoto.length > 0 ? productosSinFoto.map(p => `${p.nombre} (ID: ${p.id})`).join('\n') : 'Todos los productos tienen una imagen asignada.';
consolidatedReport += '\n\n';
consolidatedReport += `=== Productos sin Descripción (${productosSinDescripcion.length}) ===\n`;
consolidatedReport += productosSinDescripcion.length > 0 ? productosSinDescripcion.map(p => `${p.nombre} (ID: ${p.id})`).join('\n') : 'Todos los productos tienen una descripción.';
consolidatedReport += '\n\n';
consolidatedReport += `=== Productos sin Trazabilidad (${productosSinTrazabilidad.length}) ===\n`;
consolidatedReport += productosSinTrazabilidad.length > 0 ? productosSinTrazabilidad.map(p => `${p.nombre} (ID: ${p.id})`).join('\n') : 'Todos los productos tienen datos de trazabilidad.';
fs_1.default.writeFileSync(path_1.default.join(reportsDir, 'reporte-consolidado.txt'), consolidatedReport, 'utf8');
console.log(`Reportes generados exitosamente en la carpeta: ${reportsDir}`);
