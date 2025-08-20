// Script para extraer IDs reales de productos sin imagen
const fs = require('fs');
const path = require('path');

// Leer el archivo de productos
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// Extraer productos sin imagen con sus IDs reales
const productosSinImagen = [];
const lines = productosContent.split('\n');

let currentId = null;
let currentNombre = null;
let inProduct = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Detectar inicio de producto
  if (line.startsWith('{') && lines[i+1] && lines[i+1].includes('"id":')) {
    inProduct = true;
    currentId = null;
    currentNombre = null;
  }
  
  // Extraer ID
  if (inProduct && line.includes('"id":')) {
    const idMatch = line.match(/"id":\s*"([^"]+)"/);
    if (idMatch) currentId = idMatch[1];
  }
  
  // Extraer nombre
  if (inProduct && line.includes('"nombre":')) {
    const nombreMatch = line.match(/"nombre":\s*"([^"]+)"/);
    if (nombreMatch) currentNombre = nombreMatch[1];
  }
  
  // Detectar imagen vacía
  if (inProduct && line === '"imagen": "",') {
    if (currentId && currentNombre) {
      productosSinImagen.push({
        id: currentId,
        nombre: currentNombre,
        line: i + 1
      });
    }
  }
  
  // Detectar fin de producto
  if (line === '},') {
    inProduct = false;
  }
}

console.log(`\n=== IDS CORRECTOS DE PRODUCTOS SIN IMAGEN ===`);
console.log(`Total encontrados: ${productosSinImagen.length}\n`);

productosSinImagen.forEach((producto, index) => {
  console.log(`${index + 1}. ID: "${producto.id}" → ${producto.nombre}`);
});

console.log('\n=== PRIMEROS 15 IDS ===');
productosSinImagen.slice(0, 15).forEach((producto, index) => {
  console.log(`${index + 1}. ID: "${producto.id}"`);
});
