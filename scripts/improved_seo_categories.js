// scripts/improved_seo_categories.js
// Script mejorado para categorizar productos con las categorías SEO específicas

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando categorización mejorada con categorías SEO específicas...');

// Definir las 14 categorías SEO con keywords más específicos
const seoCategories = {
  'frutas-verduras-granel': {
    name: 'Frutas y Verduras a Granel',
    keywords: [
      // Verduras
      'betabel', 'zanahoria', 'lechuga', 'espinaca', 'apio', 'cilantro', 'perejil', 'acelga',
      'brócoli', 'coliflor', 'col', 'repollo', 'kale', 'arúgula', 'rábano', 'nabo',
      'jitomate', 'tomate', 'pepino', 'calabaza', 'calabacín', 'chayote', 'elote', 'maíz',
      'cebolla', 'ajo', 'puerro', 'papa', 'camote', 'yuca', 'jicama', 'chícharo',
      'ejote', 'haba', 'verdolaga', 'quelite', 'epazote', 'hierba', 'santa',
      // Frutas
      'manzana', 'pera', 'durazno', 'chabacano', 'ciruela', 'uva', 'fresa', 'frambuesa',
      'mora', 'zarzamora', 'arándano', 'plátano', 'mango', 'papaya', 'piña', 'sandía',
      'melón', 'naranja', 'limón', 'lima', 'toronja', 'mandarina', 'tuna', 'xoconostle',
      'aguacate', 'guayaba', 'tejocote', 'capulín', 'granada', 'higo', 'kiwi', 'maracuyá'
    ]
  },
  'granos-cereales-integrales': {
    name: 'Granos y cereales integrales',
    keywords: [
      'arroz', 'frijol', 'lenteja', 'garbanzo', 'haba', 'alverjón', 'quinoa', 'amaranto',
      'avena', 'trigo', 'cebada', 'centeno', 'mijo', 'sorgo', 'chía', 'linaza',
      'ajonjolí', 'sésamo', 'girasol', 'calabaza', 'semilla', 'grano', 'cereal'
    ]
  },
  'especias-condimentos': {
    name: 'Especias y condimentos artesanales',
    keywords: [
      'chile', 'chipotle', 'guajillo', 'ancho', 'mulato', 'pasilla', 'serrano', 'jalapeño',
      'habanero', 'piquín', 'cayena', 'paprika', 'pimentón', 'pimienta', 'comino',
      'orégano', 'tomillo', 'romero', 'albahaca', 'mejorana', 'laurel', 'canela',
      'clavo', 'nuez moscada', 'cardamomo', 'anís', 'hinojo', 'cúrcuma', 'jengibre',
      'sal', 'especias', 'condimento', 'sazonador', 'hierba aromática'
    ]
  },
  'aceites-naturales': {
    name: 'Aceites naturales',
    keywords: ['aceite', 'oliva', 'coco', 'aguacate', 'girasol', 'ajonjolí', 'prensado frío']
  },
  'cafe-cacao-chocolate': {
    name: 'Café, cacao y chocolate artesanal',
    keywords: ['café', 'cacao', 'chocolate', 'cocoa', 'tostado', 'molido', 'grano', 'bean']
  },
  'endulzantes-naturales': {
    name: 'Endulzantes naturales',
    keywords: ['miel', 'piloncillo', 'panela', 'azúcar mascabado', 'jarabe', 'agave', 'maple', 'endulzante']
  },
  'mermeladas-untables': {
    name: 'Mermeladas y untables naturales',
    keywords: ['mermelada', 'jalea', 'untable', 'conserva', 'dulce', 'cajeta', 'ate']
  },
  'huevo-lacteos': {
    name: 'Huevo de libre pastoreo y lácteos artesanales',
    keywords: ['huevo', 'queso', 'yogurt', 'crema', 'mantequilla', 'leche', 'lácteo', 'gallina', 'libre pastoreo']
  },
  'tes-infusiones': {
    name: 'Tés e infusiones naturales',
    keywords: ['té', 'infusión', 'tisana', 'manzanilla', 'hierbabuena', 'menta', 'tila', 'gordolobo', 'bugambilia']
  },
  'harinas-pastas': {
    name: 'Harinas y pastas orgánicas',
    keywords: ['harina', 'pasta', 'fideo', 'macarrón', 'espagueti', 'integral', 'orgánica']
  },
  'pan-galletas': {
    name: 'Pan y galletas artesanales',
    keywords: ['pan', 'galleta', 'bollito', 'masa madre', 'integral', 'artesanal', 'panadería']
  },
  'proteinas-regenerativas': {
    name: 'Proteínas Regenerativas',
    keywords: ['pollo', 'pavo', 'cerdo', 'res', 'carne', 'libre pastoreo', 'regenerativo', 'proteína animal']
  },
  'canastas-frutas-verduras': {
    name: 'Canastas de frutas y verduras agroecológicas',
    keywords: ['canasta', 'caja', 'surtido', 'variedad', 'mix', 'combinado']
  },
  'productos-arca-tierra': {
    name: 'Productos Arca Tierra',
    keywords: ['bolsa', 'gorra', 'playera', 'camiseta', 'taza', 'merchandising', 'arca tierra']
  }
};

// Función mejorada para determinar la categoría
function determineCategoryImproved(productName, currentCategory) {
  const name = productName.toLowerCase().trim();
  let bestMatch = { category: 'frutas-verduras-granel', score: 0 };

  // Buscar coincidencias en todas las categorías
  for (const [categoryId, categoryData] of Object.entries(seoCategories)) {
    let score = 0;
    
    for (const keyword of categoryData.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Coincidencia exacta de palabra completa (mayor puntaje)
      const exactWordRegex = new RegExp(`\\b${keywordLower}\\b`, 'i');
      if (exactWordRegex.test(name)) {
        score += 10;
      }
      // Coincidencia parcial (menor puntaje)
      else if (name.includes(keywordLower)) {
        score += 3;
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { category: categoryId, score: score };
    }
  }

  // Si no hay buena coincidencia, usar lógica adicional
  if (bestMatch.score === 0) {
    // Análisis de patrones adicionales
    if (name.match(/verdura|hortaliza|vegetal/)) return 'frutas-verduras-granel';
    if (name.match(/fruta|frutal/)) return 'frutas-verduras-granel';
    if (name.match(/grano|cereal|leguminosa/)) return 'granos-cereales-integrales';
    if (name.match(/condimento|especia|sazonador/)) return 'especias-condimentos';
  }

  return bestMatch.category;
}

try {
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  console.log('📖 Archivo de productos leído correctamente');
  
  // Analizar algunos productos para debug
  console.log('\n🔍 Analizando algunos productos de ejemplo:');
  const sampleMatches = productosContent.match(/"nombre":\s*"([^"]+)"/g);
  if (sampleMatches) {
    for (let i = 0; i < Math.min(10, sampleMatches.length); i++) {
      const nameMatch = sampleMatches[i].match(/"nombre":\s*"([^"]+)"/);
      if (nameMatch) {
        const productName = nameMatch[1];
        const category = determineCategoryImproved(productName, '');
        console.log(`  - "${productName}" → ${category}`);
      }
    }
  }

  // Contar categorías antes
  const beforeMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const beforeCategories = {};
  beforeMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    beforeCategories[category] = (beforeCategories[category] || 0) + 1;
  });
  
  console.log('\n📊 Categorías antes de la actualización:');
  Object.entries(beforeCategories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} productos`);
  });

  // Aplicar nueva categorización
  let updatedCount = 0;
  const categoryChanges = [];
  
  productosContent = productosContent.replace(
    /(\s*"nombre":\s*"([^"]+)"[\s\S]*?"categoria":\s*)"([^"]+)"/g,
    (match, prefix, productName, currentCategory) => {
      const newCategory = determineCategoryImproved(productName, currentCategory);
      
      if (newCategory !== currentCategory) {
        updatedCount++;
        categoryChanges.push({
          product: productName,
          from: currentCategory,
          to: newCategory
        });
      }
      
      return `${prefix}"${newCategory}"`;
    }
  );

  // Mostrar cambios
  console.log(`\n🔄 Cambios realizados (${updatedCount} productos actualizados):`);
  categoryChanges.slice(0, 20).forEach(change => {
    console.log(`  ✅ ${change.product}: ${change.from} → ${change.to}`);
  });
  if (categoryChanges.length > 20) {
    console.log(`  ... y ${categoryChanges.length - 20} cambios más`);
  }

  // Contar categorías después
  const afterMatches = productosContent.match(/"categoria":\s*"([^"]+)"/g) || [];
  const afterCategories = {};
  afterMatches.forEach(match => {
    const category = match.match(/"categoria":\s*"([^"]+)"/)[1];
    afterCategories[category] = (afterCategories[category] || 0) + 1;
  });
  
  console.log('\n📊 Categorías después de la actualización:');
  Object.entries(afterCategories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} productos`);
  });

  // Actualizar lista de categorías en el archivo
  const newCategoriesList = Object.keys(afterCategories).sort();
  productosContent = productosContent.replace(
    /export const categorias = \[([\s\S]*?)\];/,
    `export const categorias = [\n  "${newCategoriesList.join('",\n  "')}"\n];`
  );

  // Actualizar estadísticas
  const timestamp = new Date().toISOString();
  productosContent = productosContent.replace(
    /categories: \d+,/,
    `categories: ${newCategoriesList.length},`
  );
  productosContent = productosContent.replace(
    /rebuiltAt: '[^']*'/,
    `rebuiltAt: '${timestamp}'`
  );

  // Crear backup y guardar
  const backupPath = `${productosPath}.backup-improved-seo.${Date.now()}`;
  fs.writeFileSync(backupPath, fs.readFileSync(productosPath));
  fs.writeFileSync(productosPath, productosContent);

  // Generar reporte final
  const report = {
    timestamp,
    totalProducts: afterMatches.length,
    updatedProducts: updatedCount,
    categoriesBefore: beforeCategories,
    categoriesAfter: afterCategories,
    availableSeoCategories: Object.keys(seoCategories),
    usedSeoCategories: newCategoriesList,
    categoryChanges: categoryChanges.slice(0, 50), // Primeros 50 cambios
    backupFile: path.basename(backupPath)
  };

  const reportPath = path.join(__dirname, 'improved_seo_categories_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n✅ Categorización mejorada completada!`);
  console.log(`📈 ${updatedCount} productos actualizados`);
  console.log(`🏷️  ${newCategoriesList.length} categorías SEO utilizadas`);
  console.log(`📄 Reporte: ${path.basename(reportPath)}`);
  console.log(`💾 Backup: ${path.basename(backupPath)}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
