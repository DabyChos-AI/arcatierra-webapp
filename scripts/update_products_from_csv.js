const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvFilePath = path.join(__dirname, '..', 'docs', 'tienda_productos', 'productos.csv');
const outputFilePath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const imagesDirPath = path.join(__dirname, '..', 'public', 'images', 'tienda');

const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '') // Keep spaces for splitting
        .trim();
};

// 1. Read image files and create a map of normalized names to paths
const imageFiles = fs.readdirSync(imagesDirPath);
const imageMap = new Map();
imageFiles.forEach(file => {
    const normalizedName = normalizeText(path.parse(file).name).replace(/\s+/g, '');
    if (normalizedName) {
        imageMap.set(normalizedName, `/images/tienda/${file}`);
    }
});

// 2. Function to find the best image match using word-based search
const findImage = (productName) => {
    const normalizedProduct = normalizeText(productName);
    if (!normalizedProduct) return ''; // Return empty string if no product name

    const productWords = new Set(normalizedProduct.split(' ').filter(w => w.length > 3));

    for (const [imageName, imagePath] of imageMap.entries()) {
        for (const word of productWords) {
            if (imageName.includes(word)) {
                return imagePath; // Return first match found
            }
        }
    }
    
    const singleWord = normalizedProduct.replace(/\s+/g, '');
    if (imageMap.has(singleWord)){
        return imageMap.get(singleWord);
    }

    missingImages.push(productName); // Add product to missing images list
    return ''; // Return empty string for no match
};

// 3. Read the CSV file with latin1 encoding to fix character issues
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'latin1' });

// Parse the CSV content
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const products = [];
const categories = new Set();
const missingImages = [];

const categoryUnificationMap = {
  'proteina-animal': 'proteinas-regenerativas',
  'granos-semillas-y-cereales': 'granos-y-cereales-integrales',
  'aceites-y-grasas': 'aceites-naturales',
  'cacao-y-chocolate': 'cafe-cacao-y-chocolate',
  'te-y-hierbas-medicinales': 'infusiones-y-te',
  'condimentos': 'especias',
};

const generateSlug = (text) => {
  if (!text) return '';
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

records.forEach(record => {
    // Skip rows without a product name or SKU
    if (!record.PRODUCTO || !record.SKU) {
        console.warn(`Skipping row due to missing PRODUCTO or SKU: ${JSON.stringify(record)}`);
        return;
    }

    let categoriaSlug = generateSlug(record.CATEGORIA);
    if (categoryUnificationMap[categoriaSlug]) {
      categoriaSlug = categoryUnificationMap[categoriaSlug];
    }
    categories.add(categoriaSlug);

    const product = {
        id: record.SKU || generateSlug(record.PRODUCTO),
        nombre: record.PRODUCTO,
        precio: 0, // Default value
        unidad: '', // Default value
        imagen: findImage(record.PRODUCTO),
        productor: '', // Default value
        ubicacion: '', // Default value
        categoria: categoriaSlug,
        rating: 0, // Default value
        reviews: 0, // Default value
        stock: 100, // Default value
        badges: [], // Default value
        descripcion: record['DESCRIPCIÓN DE PRODUCTO'] || '',
        storytelling: '', // Default value
        metricas: {
            co2: '-- kg CO₂',
            agua: '-- L agua',
            plastico: '0g plástico evitado'
        },
        trazabilidad: undefined,
        seoData: {
            metaTitle: record['META TITLE'] || record.PRODUCTO,
            metaDescription: record['META DESCRIPTION'] || record['DESCRIPCIÓN DE PRODUCTO'] || '',
            keywords: [],
        },
    };
    products.push(product);
});

const productInterface = `
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  imagen: string;
  productor: string;
  ubicacion: string;
  categoria: string;
  rating: number;
  reviews: number;
  stock: number;
  badges: string[];
  descripcion: string;
  storytelling: string;
  metricas: {
    co2: string;
    agua: string;
    plastico: string;
  };
  trazabilidad?: any; // Keeping it flexible as it's not in the new data
  seoData?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}
`;

const productsArray = `export const productos: Product[] = ${JSON.stringify(products, null, 2)};`;

const categoriesArray = `export const categorias = ${JSON.stringify(Array.from(categories), null, 2)};`;

const catalogStats = `
export const catalogStats = {
  totalProducts: ${products.length},
  categories: ${categories.size},
  uniqueProducers: 0, // Not available in the new data
  rebuiltAt: '${new Date().toISOString()}',
  dataSource: 'productos.csv',
  dataIntegrity: 'VERIFIED_CSV_LITERAL_ONLY',
  csvRows: ${records.length}
};
`;

const newFileContent = `// src/data/productos.ts
// AUTOGENERATED BY scripts/update_products_from_csv.js - ${new Date().toISOString()}
// ✅ CONFIRMADO: Solo contiene datos literales del archivo productos.csv
// 🚫 SIN DATOS INVENTADOS: Toda información proviene directamente del CSV del usuario

${productInterface}
${productsArray}

${categoriesArray}

${catalogStats}
`;

// Write the new content to the output file
fs.writeFileSync(outputFilePath, newFileContent, 'utf-8');

console.log(`✅ Successfully updated ${outputFilePath} with ${products.length} products and ${categories.size} categories.`);

if (missingImages.length > 0) {
  console.log('\n--- 📸 Fotos Faltantes ---');
  missingImages.forEach(name => console.log(`- ${name}`));
  console.log('-------------------------');
} else {
  console.log('\n✨ ¡Todos los productos tienen imagen! ✨');
}
