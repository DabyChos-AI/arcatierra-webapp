// Script para identificar productos sin imagen
const fs = require('fs');
const path = require('path');

// Leer el archivo de productos
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// Buscar productos sin imagen
const productosSinImagen = [];
const lines = productosContent.split('\n');

let currentProduct = {};
let inProduct = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('"id":')) {
    inProduct = true;
    currentProduct = { line: i + 1 };
    const idMatch = line.match(/"id":\s*"([^"]+)"/);
    if (idMatch) currentProduct.id = idMatch[1];
  }
  
  if (inProduct && line.includes('"nombre":')) {
    const nombreMatch = line.match(/"nombre":\s*"([^"]+)"/);
    if (nombreMatch) currentProduct.nombre = nombreMatch[1];
  }
  
  if (inProduct && line.includes('"imagen":')) {
    const imagenMatch = line.match(/"imagen":\s*"([^"]*)"/);
    if (imagenMatch) {
      currentProduct.imagen = imagenMatch[1];
      // Si la imagen está vacía, agregar a la lista
      if (imagenMatch[1] === '') {
        productosSinImagen.push({
          id: currentProduct.id,
          nombre: currentProduct.nombre,
          line: currentProduct.line
        });
      }
    }
  }
  
  if (line === '  },') {
    inProduct = false;
    currentProduct = {};
  }
}

console.log(`\n=== PRODUCTOS SIN IMAGEN ===`);
console.log(`Total encontrados: ${productosSinImagen.length}\n`);

productosSinImagen.forEach((producto, index) => {
  console.log(`${index + 1}. ID: ${producto.id}`);
  console.log(`   Nombre: ${producto.nombre}`);
  console.log(`   Línea: ${producto.line}\n`);
});

// Guardar lista en archivo de texto
const reportPath = path.join(__dirname, '..', 'reports', 'productos-sin-imagen.txt');
const reportContent = `PRODUCTOS SIN IMAGEN - REPORTE GENERADO: ${new Date().toISOString()}
Total de productos sin imagen: ${productosSinImagen.length}

LISTA DETALLADA:
${productosSinImagen.map((producto, index) => 
  `${index + 1}. ID: ${producto.id}\n   Nombre: ${producto.nombre}\n   Línea en productos.ts: ${producto.line}`
).join('\n\n')}

LISTA RESUMIDA (solo nombres):
${productosSinImagen.map((producto, index) => `${index + 1}. ${producto.nombre}`).join('\n')}
`;

fs.writeFileSync(reportPath, reportContent, 'utf8');
console.log(`Reporte guardado en: ${reportPath}`);
