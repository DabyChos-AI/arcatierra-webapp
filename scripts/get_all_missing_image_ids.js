// Script para extraer TODOS los IDs correctos de productos sin imagen
const fs = require('fs');
const path = require('path');

const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const content = fs.readFileSync(productosPath, 'utf8');

// Regex para encontrar objetos producto completos
const productRegex = /\{\s*"id":\s*"([^"]+)",\s*"nombre":\s*"([^"]+)",[\s\S]*?"imagen":\s*"",[\s\S]*?\}/g;

const productosSinImagen = [];
let match;

while ((match = productRegex.exec(content)) !== null) {
  productosSinImagen.push({
    id: match[1],
    nombre: match[2]
  });
}

console.log(`\n=== LISTA COMPLETA DE PRODUCTOS SIN IMAGEN ===`);
console.log(`Total encontrados: ${productosSinImagen.length}\n`);

productosSinImagen.forEach((producto, index) => {
  console.log(`${index + 1}. ID: "${producto.id}" → ${producto.nombre}`);
});

// Crear reporte
const reportPath = path.join(__dirname, '..', 'reports', 'productos-sin-imagen-ids-correctos.txt');
const reportContent = `PRODUCTOS SIN IMAGEN - IDS CORRECTOS
Generado: ${new Date().toISOString()}
Total: ${productosSinImagen.length}

LISTA COMPLETA:
${productosSinImagen.map((producto, index) => 
  `${index + 1}. ID: "${producto.id}" → ${producto.nombre}`
).join('\n')}

SOLO IDS:
${productosSinImagen.map(p => `"${p.id}"`).join(', ')}
`;

fs.writeFileSync(reportPath, reportContent, 'utf8');
console.log(`\nReporte guardado en: ${reportPath}`);
