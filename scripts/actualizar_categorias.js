const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// --- CONFIGURACIÓN ---
const csvFilePath = path.join(__dirname, '..', 'docs', 'productostienda.csv');
const productosFilePath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const startLine = 1; // El header está en la línea 1, los datos empiezan en la 2.

// --- LÓGICA DEL SCRIPT ---

// 1. Leer el archivo de productos y extraer el array de productos
function getProductsFromFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const match = fileContent.match(/export const productos: Product\[] = ([\s\S]*?];)/);
    if (!match || !match[1]) {
      throw new Error('No se pudo encontrar el array de productos en el archivo.');
    }

    // Usamos una función para evaluar el array de forma segura
    const productsArray = new Function(`return ${match[1]}`)();
    return { originalContent: fileContent, products: productsArray, rawArrayString: match[1] };
  } catch (error) {
    console.error(`Error al leer o procesar el archivo de productos: ${error.message}`);
    process.exit(1);
  }
}

// 2. Leer el CSV y crear un mapa de categorías por nombre de producto
function getCategoryMapFromCsv(filePath) {
  return new Promise((resolve, reject) => {
    const categoryMap = new Map();
    let lineNumber = 0;

    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim(),

      }))
      .on('data', (row) => {
        lineNumber++;
        const nombreProducto = row['PRODUCTO'] ? row['PRODUCTO'].trim() : null;
        const sku = row['SKU'] ? row['SKU'].trim() : null;
        const categoria = row['CATEGORIA'] ? row['CATEGORIA'].trim() : null;

        if (nombreProducto && categoria) {
            categoryMap.set(nombreProducto.toLowerCase(), { categoria, sku });
        }
        if (sku && categoria) {
            categoryMap.set(sku.toLowerCase(), { categoria, sku });
        }
      })
      .on('end', () => {
        console.log(`Se procesaron ${categoryMap.size} productos del archivo CSV.`);
        resolve(categoryMap);
      })
      .on('error', (error) => {
        reject(new Error(`Error al leer el archivo CSV: ${error.message}`));
      });
  });
}

// 3. Función principal
async function main() {
  console.log('Iniciando script de actualización de categorías...');

  const { originalContent, products, rawArrayString } = getProductsFromFile(productosFilePath);
  const categoryMap = await getCategoryMapFromCsv(csvFilePath);

  let updatedCount = 0;
  let notFoundCount = 0;

  const updatedProducts = products.map(product => {
    const nombreKey = product.nombre.toLowerCase().trim();
    const idKey = product.id.toLowerCase().trim();
    let match = null;

    if (categoryMap.has(nombreKey)) {
      match = categoryMap.get(nombreKey);
    } else if (categoryMap.has(idKey)) {
      match = categoryMap.get(idKey);
    }

    if (match) {
      if (product.categoria !== match.categoria) {
        product.categoria = match.categoria;
        updatedCount++;
      }
    } else {
      notFoundCount++;
    }
    return product;
  });

  console.log(`
Resultados:
- Productos actualizados: ${updatedCount}
- Productos no encontrados en el CSV: ${notFoundCount}
- Total de productos en el archivo .ts: ${products.length}
`);

  // 4. Escribir el nuevo archivo
  const updatedArrayString = JSON.stringify(updatedProducts, null, 2).replace(/"/g, "'").replace(/\'/g, '"') + ';';
  const newContent = originalContent.replace(rawArrayString, ` ${updatedArrayString}`);

  fs.writeFileSync(productosFilePath, newContent, 'utf-8');
  console.log(`¡Proceso completado! El archivo de productos ha sido actualizado directamente.`);
}

main().catch(console.error);
