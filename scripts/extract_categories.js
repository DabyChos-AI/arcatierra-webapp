const fs = require('fs');
const path = require('path');

// Leer el archivo de productos
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const content = fs.readFileSync(productosPath, 'utf8');

// Extraer todas las categorías usando regex
const categoriaMatches = content.match(/"categoria":\s*"([^"]+)"/g);

if (categoriaMatches) {
  // Extraer solo los nombres de categorías
  const categorias = categoriaMatches.map(match => {
    const result = match.match(/"categoria":\s*"([^"]+)"/);
    return result ? result[1] : null;
  }).filter(Boolean);

  // Obtener categorías únicas y ordenarlas
  const categoriasUnicas = [...new Set(categorias)].sort();
  
  console.log('CATEGORÍAS REALES EXTRAÍDAS DEL CATÁLOGO:');
  console.log('========================================');
  
  categoriasUnicas.forEach(categoria => {
    const count = categorias.filter(c => c === categoria).length;
    console.log(`${categoria}: ${count} productos`);
  });
  
  console.log('\n📊 TOTAL CATEGORÍAS:', categoriasUnicas.length);
  console.log('📦 TOTAL PRODUCTOS:', categorias.length);
  
  console.log('\n🔧 ARRAY PARA FILTROS:');
  const categoriasParaFiltros = categoriasUnicas.map(categoria => {
    // Mapear emojis apropiados
    const emojiMap = {
      'verduras': '🥬',
      'frutas': '🍎',
      'cereales': '🌾',
      'especias': '🌿',
      'lacteos': '🧀',
      'carnes': '🥩',
      'bebidas': '🥤',
      'harinas': '🥖',
      'condimentos': '🧂',
      'infusiones': '🍵',
      'mermeladas': '🍓',
      'miel': '🍯',
      'huevos': '🥚',
      'tortillas': '🌽',
      'despensa': '📦',
      'otros': '🌿'
    };
    
    const emoji = emojiMap[categoria] || '🌿';
    const name = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    
    return `  { id: '${categoria}', name: '${name}', emoji: '${emoji}', active: false }`;
  });
  
  console.log('const categorias = [');
  console.log('  { id: \'all\', name: \'Todas las categorías\', emoji: \'🛒\', active: true },');
  console.log(categoriasParaFiltros.join(',\n'));
  console.log(']');
  
} else {
  console.log('❌ No se encontraron categorías en el archivo');
}
