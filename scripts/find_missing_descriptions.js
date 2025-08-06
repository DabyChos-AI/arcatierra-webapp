"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function findProductsWithoutDescription() {
    const productsFilePath = path_1.default.resolve(__dirname, '..', 'src', 'data', 'productos.ts');
    try {
        // Leer el contenido del archivo
        let fileContent = fs_1.default.readFileSync(productsFilePath, 'utf-8');
        // Limpiar el contenido para que sea un JSON válido
        // 1. Encontrar el inicio del array '['
        const startIndex = fileContent.indexOf('[');
        // 2. Encontrar el final del array ']'
        const endIndex = fileContent.lastIndexOf(']');
        if (startIndex === -1 || endIndex === -1) {
            throw new Error('No se pudo encontrar el array de productos en el archivo.');
        }
        // 3. Extraer solo el array como string
        const jsonString = fileContent.substring(startIndex, endIndex + 1);
        // 4. Parsear el string a un objeto JSON
        const productos = JSON.parse(jsonString);
        // Filtrar productos sin descripción
        const productsWithoutDescription = productos
            .filter(product => !product.descripcion || product.descripcion.trim() === '')
            .map(product => product.nombre);
        if (productsWithoutDescription.length > 0) {
            console.log('Productos sin descripción:');
            productsWithoutDescription.forEach(name => console.log(`- ${name}`));
        }
        else {
            console.log('¡Todos los productos tienen una descripción!');
        }
        console.log(`\nTotal de productos sin descripción: ${productsWithoutDescription.length}`);
    }
    catch (error) {
        console.error('Ocurrió un error al procesar el archivo de productos:', error);
    }
}
findProductsWithoutDescription();
