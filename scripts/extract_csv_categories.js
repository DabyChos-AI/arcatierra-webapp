const fs = require('fs');
const path = require('path');

// Leer el archivo tiendaSEO.csv
const csvPath = path.join(__dirname, '../docs/tiendaSEO.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

console.log('🔍 EXTRAYENDO CATEGORÍAS EXACTAS DE tiendaSEO.csv');
console.log('================================================');

// Dividir en líneas
const lines = csvContent.split('\n');

// Encontrar el índice de la línea de headers (SKU,PRODUCTO,CATEGORIA,...)
let headerLineIndex = -1;
let categoryColumnIndex = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('SKU,PRODUCTO,CATEGORIA')) {
    headerLineIndex = i;
    // Encontrar el índice de la columna CATEGORIA
    const headers = line.split(',');
    categoryColumnIndex = headers.findIndex(header => 
      header.trim().toUpperCase() === 'CATEGORIA'
    );
    console.log(`📍 Headers encontrados en línea ${i + 1}`);
    console.log(`📊 Columna CATEGORIA en posición ${categoryColumnIndex}`);
    break;
  }
}

if (headerLineIndex === -1 || categoryColumnIndex === -1) {
  console.log('❌ No se encontraron los headers o la columna CATEGORIA');
  process.exit(1);
}

// Extraer todas las categorías de los productos
const categorias = new Set();
const productosConCategoria = [];

for (let i = headerLineIndex + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parsear CSV básico (considerando que puede haber comas dentro de comillas)
  const columns = [];
  let currentColumn = '';
  let insideQuotes = false;
  
  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      columns.push(currentColumn.trim());
      currentColumn = '';
    } else {
      currentColumn += char;
    }
  }
  columns.push(currentColumn.trim()); // Agregar la última columna
  
  if (columns.length > categoryColumnIndex) {
    const sku = columns[0];
    const producto = columns[1];
    const categoria = columns[categoryColumnIndex];
    
    if (categoria && categoria.trim() && sku && producto) {
      const categoriaNormalizada = categoria.trim();
      categorias.add(categoriaNormalizada);
      productosConCategoria.push({
        sku: sku.trim(),
        producto: producto.trim(),
        categoria: categoriaNormalizada
      });
    }
  }
}

// Convertir Set a Array y ordenar
const categoriasArray = Array.from(categorias).sort();

console.log('\n🎯 CATEGORÍAS ENCONTRADAS EN tiendaSEO.csv:');
console.log('===========================================');

categoriasArray.forEach((categoria, index) => {
  const count = productosConCategoria.filter(p => p.categoria === categoria).length;
  console.log(`${index + 1}. "${categoria}" (${count} productos)`);
});

console.log(`\n📊 TOTAL CATEGORÍAS: ${categoriasArray.length}`);
console.log(`📦 TOTAL PRODUCTOS CON CATEGORÍA: ${productosConCategoria.length}`);

// Normalizar categorías para uso en código
const categoriesForCode = categoriasArray.map(categoria => {
  // Crear ID normalizado (minúsculas, sin espacios especiales)
  const id = categoria.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Mapear emojis apropiados
  const emojiMap = {
    'canastas': '🧺',
    'aceites': '🫒',
    'granos': '🌾',
    'cereales': '🌾',
    'proteinas': '🥩',
    'proteina': '🥩',
    'animal': '🥩',
    'cafe': '☕',
    'cacao': '🍫',
    'chocolate': '🍫',
    'endulzantes': '🍯',
    'especias': '🌿',
    'condimentos': '🧂',
    'frutas': '🍎',
    'verduras': '🥬',
    'mermeladas': '🍓',
    'untables': '🍓',
    'huevo': '🥚',
    'huevos': '🥚',
    'lacteos': '🧀',
    'artesanales': '🧀',
    'tes': '🍵',
    'infusiones': '🍵',
    'productos': '🛍️',
    'arca': '🌱',
    'tierra': '🌱',
    'harinas': '🥖',
    'pastas': '🍝',
    'pan': '🥖',
    'galletas': '🍪',
    'semillas': '🌰'
  };
  
  let emoji = '🌿'; // emoji por defecto
  for (const [keyword, emojiValue] of Object.entries(emojiMap)) {
    if (id.includes(keyword)) {
      emoji = emojiValue;
      break;
    }
  }
  
  return {
    id,
    name: categoria,
    emoji,
    original: categoria
  };
});

console.log('\n🔧 ARRAY PARA FILTROS EN CÓDIGO:');
console.log('===============================');
console.log('const categories = [');
console.log('  { id: \'all\', name: \'Todas las categorías\', emoji: \'🌱\', active: false },');
categoriesForCode.forEach(cat => {
  console.log(`  { id: '${cat.id}', name: '${cat.name}', emoji: '${cat.emoji}', active: false },`);
});
console.log('];');

console.log('\n📋 MAPEO DE PRODUCTOS POR CATEGORÍA:');
console.log('===================================');
categoriesForCode.forEach(cat => {
  const productos = productosConCategoria.filter(p => p.categoria === cat.original);
  console.log(`\n🏷️  ${cat.name} (${productos.length} productos):`);
  productos.slice(0, 5).forEach(p => {
    console.log(`   - ${p.producto} (SKU: ${p.sku})`);
  });
  if (productos.length > 5) {
    console.log(`   ... y ${productos.length - 5} más`);
  }
});

// Guardar resultado para usar en otros scripts
const result = {
  categorias: categoriesForCode,
  productosConCategoria,
  categoriasOriginales: categoriasArray
};

fs.writeFileSync(
  path.join(__dirname, 'csv_categories_mapping.json'),
  JSON.stringify(result, null, 2)
);

console.log('\n✅ Resultado guardado en: scripts/csv_categories_mapping.json');
