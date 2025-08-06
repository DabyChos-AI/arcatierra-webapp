const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// --- 1. Definir rutas a los archivos ---
// Construir rutas absolutas desde la raíz del proyecto
const projectRoot = path.resolve(__dirname, '..'); 
const productsCsvPath = path.join(projectRoot, 'docs', 'productostienda.csv');
const categoriesMdPath = path.join(projectRoot, 'docs', 'productostienda.md');
const tsOutputPath = path.join(projectRoot, 'src', 'data', 'productos.ts');
const jsonOutputPath = path.join(projectRoot, 'src', 'data', 'productos.json');

// --- 1. Leer y procesar el archivo de metadatos de categorías (.md) ---
const getCategoryMetadata = () => {
    const mdContent = fs.readFileSync(categoriesMdPath, 'utf8');
    const lines = mdContent.split('\n');
    const titles = [];
    const descriptions = [];
    let currentSection = '';

    lines.forEach(line => {
        if (line.startsWith('# META TITLE')) {
            currentSection = 'title';
            return;
        }
        if (line.startsWith('# META DESCRIPTION')) {
            currentSection = 'description';
            return;
        }

        if (line.trim() === '' || !line.match(/^\d+-.+/)) {
            return;
        }

        const text = line.replace(/^\d+-/, '').trim();

        if (currentSection === 'title') {
            titles.push(text);
        } else if (currentSection === 'description') {
            descriptions.push(text);
        }
    });

    const metadata = {};
    titles.forEach((title, index) => {
        if (descriptions[index]) {
            metadata[title] = {
                metaTitle: title,
                metaDescription: descriptions[index]
            };
        }
    });

    return metadata;
};

// --- 2. Unificar nombres de categorías ---
const unifyCategoryName = (name) => {
  const lowerCaseName = name.toLowerCase().trim();
  if (lowerCaseName.includes('endulzante')) {
    return 'Endulzantes naturales';
  }
  if (lowerCaseName.includes('proteina') || lowerCaseName.includes('proteína')) {
    return 'Proteínas Regenerativas';
  }
  return name.trim();
};

// --- Helper: Transformar URL de Google Drive a enlace directo ---
const transformGoogleDriveUrl = (url) => {
  if (!url || !url.includes('drive.google.com')) {
    return url; // Devuelve la URL original si no es de Google Drive
  }
  // Extraer el ID del archivo de la URL
  const match = url.match(/file\/d\/([^/]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return ''; // Devuelve vacío si no se puede transformar
};

// --- 3. Leer y procesar el archivo de productos (.csv) ---
const processProducts = async () => {
  const products = [];
  let lastProduct = null;
  let rowCount = 0;

  console.log('Starting CSV processing...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(productsCsvPath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.replace(/\uFEFF/g, '')
      }))
      .on('data', (row) => {
        rowCount++;
        console.log(`Processing row ${rowCount}:`, row);
        try {
          const unifiedCategory = unifyCategoryName(row['CATEGORIA'] || '');

          if (row['SKU'] && row['SKU'].trim() !== '') {
                        const imageUrl = transformGoogleDriveUrl(row['url de foto'] ? row['url de foto'].trim() : '');

            const newProduct = {
              id: row['SKU'].trim(),
              nombre: row['PRODUCTO'] ? row['PRODUCTO'].trim() : '',
              precio: parseFloat(String(row['PRECIO FINAL']).replace(/[^\d.]/g, '')) || 0,
              unidad: '', // Default value
              imagen: imageUrl,
              productor: '', // Default value
              ubicacion: '', // Default value
              categoria: unifiedCategory,
              rating: 5, // Default value
              reviews: 0, // Default value
              stock: 100, // Default value
              badges: ['Local', 'Fresco'], // Default value
              descripcion: row['DESCRIPCIÓN DE PRODUCTO'] ? row['DESCRIPCIÓN DE PRODUCTO'].trim() : '',
              storytelling: '', // Default value
              metricas: { // Default structure
                co2: '-- kg CO₂',
                agua: '-- L agua',
                plastico: '0g plástico evitado'
              },
              trazabilidad: undefined, // Default value
              seoData: { // Default structure
                metaTitle: row['META TITLE'] ? row['META TITLE'].trim() : '',
                metaDescription: row['META DESCRIPTION'] ? row['META DESCRIPTION'].trim() : '',
                keywords: []
              },
              variantes: [],
            };
            console.log('  -> Created new product:', newProduct.id);
            products.push(newProduct);
            lastProduct = newProduct;
          } else if (lastProduct && row['PRODUCTO'] && row['PRODUCTO'].trim() !== '') {
            if (!lastProduct.variantes) {
              lastProduct.variantes = [];
            }
            const variant = {
              nombre: row['PRODUCTO'].trim(),
              precio: parseFloat(String(row['PRECIO FINAL']).replace(/[^\d.]/g, '')) || 0,
            };
            lastProduct.variantes.push(variant);
            console.log(`    -> Added variant to ${lastProduct.id}:`, variant.nombre);
          }
        } catch (error) {
          console.error(`Error processing row ${rowCount}:`, row, error);
        }
      })
      .on('end', () => {
        console.log(`CSV file successfully processed. Total rows: ${rowCount}. Total products created: ${products.length}.`);
        resolve(products);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
};

// --- 4. Generar los archivos de salida (TS y JSON) ---
const generateProductsFile = (products, categoryMetadata) => {
  console.log(`Generating file with ${products.length} products...`);

  const productsWithMetadata = products.map(product => {
    const metadata = categoryMetadata[product.categoria] || {};
    // Asignar metadatos solo si los campos del producto están vacíos
    const finalMetaTitle = product.metaTitle || metadata.metaTitle || '';
    const finalMetaDescription = product.metaDescription || metadata.metaDescription || '';

    return {
      ...product,
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDescription,
    };
  });

    // --- Guardar como JSON ---
  const rawJsonString = JSON.stringify(productsWithMetadata, null, 2);
  fs.writeFileSync(jsonOutputPath, rawJsonString, 'utf8');
  console.log(`Successfully written raw data to ${jsonOutputPath}`);

  // --- Guardar como TypeScript ---
  // Reemplazar comillas dobles en las claves para que coincidan con la estructura de Producto
  const tsObjectString = rawJsonString.replace(/"([^(")"]+)":/g, "$1:");

  const tsFileContent = `/* eslint-disable */
// Este archivo es generado por scripts/rebuild_catalog.js
import { Producto } from '@/types';

export const productos: Producto[] = ${tsObjectString};
`;

  fs.writeFileSync(tsOutputPath, tsFileContent, 'utf8');
  console.log(`Successfully written TypeScript file to ${tsOutputPath}`);
};

// --- 5. Ejecutar el script ---
const run = async () => {
  console.log('Starting catalog rebuild...');
  try {
    const categoryMetadata = getCategoryMetadata();
    console.log(`Found ${Object.keys(categoryMetadata).length} categories with metadata.`);

    const products = await processProducts();
    console.log(`Finished processing CSV. Found ${products.length} products.`);

    if (products && products.length > 0) {
      generateProductsFile(products, categoryMetadata);
    } else {
      console.error('Error: No products were processed. The output file will not be generated.');
    }
  } catch (error) {
    console.error('An error occurred during the catalog rebuild process:', error);
  }
};

run();
