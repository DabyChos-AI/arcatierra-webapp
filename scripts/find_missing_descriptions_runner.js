const fs = require('fs');
const path = require('path');

function findProductsWithoutDescription() {
  const productsFilePath = path.resolve(__dirname, '..', 'src', 'data', 'productos.ts');

  try {
    let fileContent = fs.readFileSync(productsFilePath, 'utf-8');

    // Transforma el archivo TS en un módulo CommonJS que podemos requerir
    const moduleContent = fileContent
      .replace(/import.*from.*;/g, '') // Elimina todas las líneas de importación
      .replace('export const productos: Product[] =', 'module.exports ='); // Reemplaza el export por module.exports

    // Escribe el contenido en un archivo temporal
    const tempFilePath = path.resolve(__dirname, 'temp_products.js');
    fs.writeFileSync(tempFilePath, moduleContent, 'utf-8');

    // Importa los datos desde el archivo temporal
    const productos = require(tempFilePath);

    // Limpia el archivo temporal
    fs.unlinkSync(tempFilePath);

    // Ahora, la lógica original
    const productsWithoutDescription = productos
      .filter(product => !product.descripcion || product.descripcion.trim() === '')
      .map(product => product.nombre);

    if (productsWithoutDescription.length > 0) {
      console.log('Productos sin descripción:');
      productsWithoutDescription.forEach(name => console.log(`- ${name}`));
    } else {
      console.log('¡Todos los productos tienen una descripción!');
    }

    console.log(`\nTotal de productos sin descripción: ${productsWithoutDescription.length}`);

  } catch (error) {
    console.error('Ocurrió un error al procesar el archivo de productos:', error);
  }
}

findProductsWithoutDescription();
