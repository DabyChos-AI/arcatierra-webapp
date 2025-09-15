const fs = require('fs');
const path = require('path');

// Leer el archivo de productos
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// Extraer el array de productos usando regex
const productosMatch = productosContent.match(/export const productos: Product\[\] = (\[[\s\S]*?\]);/);
if (!productosMatch) {
  console.error('No se pudo encontrar el array de productos');
  process.exit(1);
}

// Evaluar el código JavaScript para obtener el array
const productosArrayString = productosMatch[1];
const productos = eval(productosArrayString);

console.log(`Total de productos encontrados: ${productos.length}`);

// Separar productos con y sin descripción y agrupar por categorías
const productosSinDescripcion = [];
const productosConDescripcion = [];

productos.forEach(producto => {
  if (!producto.descripcion || producto.descripcion.trim() === '') {
    productosSinDescripcion.push(producto);
  } else {
    productosConDescripcion.push(producto);
  }
});

// Función para agrupar productos por categoría
function agruparPorCategoria(productos) {
  const agrupados = {};
  productos.forEach(producto => {
    const categoria = producto.categoria || 'sin-categoria';
    if (!agrupados[categoria]) {
      agrupados[categoria] = [];
    }
    agrupados[categoria].push(producto);
  });
  return agrupados;
}

// Función para convertir slug de categoría a nombre legible
function nombreCategoria(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

const productosConDescripcionPorCategoria = agruparPorCategoria(productosConDescripcion);
const productosSinDescripcionPorCategoria = agruparPorCategoria(productosSinDescripcion);

console.log(`Productos sin descripción: ${productosSinDescripcion.length}`);
console.log(`Productos con descripción: ${productosConDescripcion.length}`);

// Generar el archivo MD
let mdContent = `# Análisis de Descripciones de Productos - Tienda Arca Tierra

**Fecha de análisis:** ${new Date().toLocaleDateString('es-ES')}

**Resumen:**
- Total de productos: ${productos.length}
- Productos con descripción: ${productosConDescripcion.length}
- Productos sin descripción: ${productosSinDescripcion.length}

---

## 📝 Productos CON Descripción (${productosConDescripcion.length} productos)

`;

// Generar productos con descripción ordenados por categoría
Object.keys(productosConDescripcionPorCategoria).sort().forEach(categoria => {
  const productos = productosConDescripcionPorCategoria[categoria];
  mdContent += `### 📂 ${nombreCategoria(categoria)} (${productos.length} productos)

`;
  
  productos.forEach((producto, index) => {
    mdContent += `#### ${index + 1}. ${producto.nombre}
**ID:** ${producto.id}  
**Precio:** $${producto.precio}  
**Categoría:** ${producto.categoria}

**Descripción:**
${producto.descripcion}

---

`;
  });
});

mdContent += `## ❌ Productos SIN Descripción (${productosSinDescripcion.length} productos)

`;

// Generar productos sin descripción ordenados por categoría
Object.keys(productosSinDescripcionPorCategoria).sort().forEach(categoria => {
  const productos = productosSinDescripcionPorCategoria[categoria];
  mdContent += `### 📂 ${nombreCategoria(categoria)} (${productos.length} productos)

`;
  
  productos.forEach((producto, index) => {
    mdContent += `#### ${index + 1}. ${producto.nombre}
**ID:** ${producto.id}  
**Precio:** $${producto.precio}  
**Categoría:** ${producto.categoria}  
**Estado:** Sin descripción

---

`;
  });
});

// Escribir el archivo MD
const outputPath = path.join(__dirname, '..', 'analisis-descripciones-productos.md');
fs.writeFileSync(outputPath, mdContent, 'utf8');

console.log(`✅ Archivo generado exitosamente: ${outputPath}`);
console.log(`\nDetalles del análisis:`);
console.log(`- Productos con descripción: ${productosConDescripcion.length}`);
console.log(`- Productos sin descripción: ${productosSinDescripcion.length}`);
console.log(`- Porcentaje con descripción: ${((productosConDescripcion.length / productos.length) * 100).toFixed(1)}%`);
console.log(`- Porcentaje sin descripción: ${((productosSinDescripcion.length / productos.length) * 100).toFixed(1)}%`);
