const fs = require('fs');
const path = require('path');

// Leer el archivo de productos
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// Leer el archivo de descripciones
const descripcionesPath = path.join(__dirname, '..', 'descripcion-productos-y-nuevos-productos.md');
const descripcionesContent = fs.readFileSync(descripcionesPath, 'utf8');

// Mapeo de descripciones por SKU del archivo de descripciones
const descripcionesPorSKU = {};

// Parsear descripciones del archivo MD
const lineas = descripcionesContent.split('\n');
let currentSKU = null;
let currentDescripcion = [];
let inDescripcion = false;

for (let i = 0; i < lineas.length; i++) {
  const linea = lineas[i].trim();
  
  // Buscar líneas que contienen SKU (P-WEB-XXX)
  const skuMatch = linea.match(/\(P-WEB-[^\)]+\)/);
  
  if (skuMatch && linea.startsWith('###')) {
    // Si había una descripción anterior, guardarla
    if (currentSKU && currentDescripcion.length > 0) {
      descripcionesPorSKU[currentSKU] = currentDescripcion.join('\n').trim();
    }
    
    // Extraer SKU de la línea
    currentSKU = skuMatch[0].replace(/[()]/g, '');
    currentDescripcion = [];
    inDescripcion = true;
  } else if (inDescripcion && linea !== '' && !linea.startsWith('#') && !linea.startsWith('PRODUCTO NUEVO')) {
    // Agregar línea a la descripción actual
    if (!linea.includes('Sin descripción disponible')) {
      currentDescripcion.push(linea);
    }
  } else if (linea.startsWith('##') || linea.startsWith('PRODUCTO NUEVO')) {
    // Fin de sección, guardar descripción si existe
    if (currentSKU && currentDescripción.length > 0) {
      descripcionesPorSKU[currentSKU] = currentDescripcion.join('\n').trim();
    }
    inDescripcion = false;
    currentSKU = null;
    currentDescripcion = [];
  }
}

// Guardar la última descripción si existe
if (currentSKU && currentDescripcion.length > 0) {
  descripcionesPorSKU[currentSKU] = currentDescripcion.join('\n').trim();
}

console.log(`Descripciones encontradas en archivo MD: ${Object.keys(descripcionesPorSKU).length}`);

// Extraer el array de productos usando regex
const productosMatch = productosContent.match(/export const productos: Product\[\] = (\[[\s\S]*?\]);/);
if (!productosMatch) {
  console.error('No se pudo encontrar el array de productos');
  process.exit(1);
}

// Evaluar el código JavaScript para obtener el array
const productosArrayString = productosMatch[1];
const productos = eval(productosArrayString);

let productosActualizados = 0;

// Actualizar descripciones
productos.forEach((producto, index) => {
  const sku = producto.id;
  
  // Si el producto no tiene descripción y existe una en el archivo MD
  if ((!producto.descripcion || producto.descripcion.trim() === '') && descripcionesPorSKU[sku]) {
    productos[index].descripcion = descripcionesPorSKU[sku];
    productosActualizados++;
    console.log(`✅ Actualizada descripción para: ${producto.nombre} (${sku})`);
  }
});

// Generar nuevo contenido del archivo
const nuevosProductos = JSON.stringify(productos, null, 2);
const nuevoContenido = productosContent.replace(
  /export const productos: Product\[\] = \[[\s\S]*?\];/,
  `export const productos: Product[] = ${nuevosProductos};`
);

// Escribir archivo actualizado
fs.writeFileSync(productosPath, nuevoContenido, 'utf8');

console.log(`\n✅ Proceso completado:`);
console.log(`- Productos actualizados con descripción: ${productosActualizados}`);
console.log(`- Descripciones disponibles en archivo MD: ${Object.keys(descripcionesPorSKU).length}`);

// Mostrar algunas descripciones encontradas para verificar
console.log(`\nEjemplos de descripciones encontradas:`);
Object.keys(descripcionesPorSKU).slice(0, 3).forEach(sku => {
  console.log(`${sku}: ${descripcionesPorSKU[sku].substring(0, 100)}...`);
});
