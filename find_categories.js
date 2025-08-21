const fs = require('fs');

// Leer el archivo productos.ts
const content = fs.readFileSync('src/data/productos.ts', 'utf8');

// Extraer todas las categorías usando regex
const categoryMatches = content.match(/"categoria":\s*"[^"]+"/g);

if (categoryMatches) {
  const categories = categoryMatches
    .map(match => match.match(/"categoria":\s*"([^"]+)"/)[1])
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();
  
  console.log('Categorías encontradas en productos.ts:');
  categories.forEach(cat => console.log(`  "${cat}"`));
  
  console.log('\nTotal de categorías únicas:', categories.length);
} else {
  console.log('No se encontraron categorías');
}
