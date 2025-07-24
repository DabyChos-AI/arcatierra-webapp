const fs = require('fs');
const path = require('path');

console.log('🔍 AUDITANDO CATEGORÍAS ACTUALES DEL CATÁLOGO');
console.log('============================================');

// Leer el catálogo actual
const productosPath = path.join(__dirname, '../src/data/productos.ts');
const productosContent = fs.readFileSync(productosPath, 'utf8');

// Extraer todos los productos con sus categorías
const productRegex = /{[^}]*"id":\s*"([^"]+)"[^}]*"nombre":\s*"([^"]+)"[^}]*"categoria":\s*"([^"]+)"[^}]*}/g;
const products = [];
let match;

while ((match = productRegex.exec(productosContent)) !== null) {
  products.push({
    id: match[1],
    nombre: match[2],
    categoria: match[3]
  });
}

console.log(`📦 PRODUCTOS ENCONTRADOS: ${products.length}`);

// Agrupar productos por categoría
const productsByCategory = {};
products.forEach(product => {
  if (!productsByCategory[product.categoria]) {
    productsByCategory[product.categoria] = [];
  }
  productsByCategory[product.categoria].push(product);
});

// Mostrar resumen por categoría
console.log('\n📊 PRODUCTOS POR CATEGORÍA:');
console.log('===========================');

const sortedCategories = Object.keys(productsByCategory).sort();
let totalProductsAssigned = 0;

sortedCategories.forEach(categoria => {
  const count = productsByCategory[categoria].length;
  totalProductsAssigned += count;
  
  if (count === 0) {
    console.log(`❌ "${categoria}": ${count} productos (VACÍA)`);
  } else if (count < 5) {
    console.log(`⚠️  "${categoria}": ${count} productos (POCOS)`);
  } else {
    console.log(`✅ "${categoria}": ${count} productos`);
  }
});

console.log(`\n🎯 TOTAL CATEGORÍAS: ${sortedCategories.length}`);
console.log(`📦 TOTAL PRODUCTOS ASIGNADOS: ${totalProductsAssigned}`);

// Identificar categorías vacías
const emptyCategorias = sortedCategories.filter(cat => productsByCategory[cat].length === 0);
const lowProductCategorias = sortedCategories.filter(cat => 
  productsByCategory[cat].length > 0 && productsByCategory[cat].length < 5
);

console.log(`\n❌ CATEGORÍAS VACÍAS: ${emptyCategorias.length}`);
emptyCategorias.forEach(cat => console.log(`   • "${cat}"`));

console.log(`\n⚠️  CATEGORÍAS CON POCOS PRODUCTOS (<5): ${lowProductCategorias.length}`);
lowProductCategorias.forEach(cat => {
  const count = productsByCategory[cat].length;
  console.log(`   • "${cat}": ${count} productos`);
  productsByCategory[cat].forEach(p => console.log(`     - ${p.nombre}`));
});

// Identificar categorías similares/duplicadas
console.log('\n🔍 ANÁLISIS DE CATEGORÍAS SIMILARES:');
console.log('===================================');

const potentialDuplicates = [];
for (let i = 0; i < sortedCategories.length; i++) {
  for (let j = i + 1; j < sortedCategories.length; j++) {
    const cat1 = sortedCategories[i].toLowerCase();
    const cat2 = sortedCategories[j].toLowerCase();
    
    // Verificar similitudes
    if (cat1.includes(cat2) || cat2.includes(cat1) || 
        cat1.replace(/[^a-z]/g, '') === cat2.replace(/[^a-z]/g, '')) {
      potentialDuplicates.push({
        category1: sortedCategories[i],
        category2: sortedCategories[j],
        count1: productsByCategory[sortedCategories[i]].length,
        count2: productsByCategory[sortedCategories[j]].length
      });
    }
  }
}

if (potentialDuplicates.length > 0) {
  console.log('🔄 POSIBLES CATEGORÍAS DUPLICADAS/SIMILARES:');
  potentialDuplicates.forEach(dup => {
    console.log(`   "${dup.category1}" (${dup.count1}) ≈ "${dup.category2}" (${dup.count2})`);
  });
} else {
  console.log('✅ No se detectaron categorías duplicadas obvias');
}

// Mostrar productos de las categorías más pobladas
console.log('\n📋 PRODUCTOS EN CATEGORÍAS MÁS POBLADAS:');
console.log('=======================================');

const topCategories = sortedCategories
  .filter(cat => productsByCategory[cat].length > 0)
  .sort((a, b) => productsByCategory[b].length - productsByCategory[a].length)
  .slice(0, 5);

topCategories.forEach(cat => {
  const productos = productsByCategory[cat];
  console.log(`\n🏷️  ${cat} (${productos.length} productos):`);
  productos.slice(0, 8).forEach(p => console.log(`   • ${p.nombre}`));
  if (productos.length > 8) {
    console.log(`   ... y ${productos.length - 8} más`);
  }
});

// Comparar con las categorías de los filtros de la tienda
console.log('\n🔧 VERIFICANDO CONSISTENCIA CON FILTROS DE LA TIENDA:');
console.log('==================================================');

// Leer los filtros actuales de la tienda
const tiendaPath = path.join(__dirname, '../src/app/tienda/page.tsx');
if (fs.existsSync(tiendaPath)) {
  const tiendaContent = fs.readFileSync(tiendaPath, 'utf8');
  const categoryFilterRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
  const filterCategories = [];
  let filterMatch;
  
  while ((filterMatch = categoryFilterRegex.exec(tiendaContent)) !== null) {
    if (filterMatch[1] !== 'all') {
      filterCategories.push({
        id: filterMatch[1],
        name: filterMatch[2]
      });
    }
  }
  
  console.log(`🎛️  Filtros definidos en la tienda: ${filterCategories.length}`);
  
  // Comparar filtros con categorías reales
  const catalogCategoryIds = new Set(sortedCategories);
  const filterCategoryIds = new Set(filterCategories.map(f => f.id));
  
  const filtersWithoutProducts = [...filterCategoryIds].filter(id => !catalogCategoryIds.has(id));
  const productsWithoutFilters = [...catalogCategoryIds].filter(id => !filterCategoryIds.has(id));
  
  console.log(`\n❌ Filtros sin productos correspondientes: ${filtersWithoutProducts.length}`);
  filtersWithoutProducts.forEach(id => console.log(`   • "${id}"`));
  
  console.log(`\n⚠️  Productos con categorías sin filtros: ${productsWithoutFilters.length}`);
  productsWithoutFilters.forEach(id => {
    const count = productsByCategory[id] ? productsByCategory[id].length : 0;
    console.log(`   • "${id}" (${count} productos)`);
  });
} else {
  console.log('❌ No se pudo leer el archivo de la tienda');
}

// Guardar análisis
const analysis = {
  timestamp: new Date().toISOString(),
  totalProducts: products.length,
  totalCategories: sortedCategories.length,
  productsByCategory,
  emptyCategorias,
  lowProductCategorias,
  potentialDuplicates,
  topCategories: topCategories.map(cat => ({
    category: cat,
    count: productsByCategory[cat].length,
    products: productsByCategory[cat].map(p => p.nombre)
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'current_categories_audit.json'),
  JSON.stringify(analysis, null, 2)
);

console.log('\n✅ ANÁLISIS GUARDADO EN: scripts/current_categories_audit.json');

console.log('\n🎯 RESUMEN DEL PROBLEMA:');
console.log('=======================');
console.log(`   • Total productos: ${products.length}`);
console.log(`   • Total categorías: ${sortedCategories.length}`);
console.log(`   • Categorías vacías: ${emptyCategorias.length}`);
console.log(`   • Categorías con pocos productos: ${lowProductCategorias.length}`);
console.log(`   • Posibles duplicadas: ${potentialDuplicates.length}`);

if (emptyCategorias.length > 0 || potentialDuplicates.length > 0) {
  console.log('\n🚨 ACCIÓN REQUERIDA: Agrupar y limpiar categorías');
}
