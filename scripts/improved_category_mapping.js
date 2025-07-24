// scripts/improved_category_mapping.js
// Script mejorado para mapear productos a categorías usando análisis preciso de nombres

const fs = require('fs');
const path = require('path');

console.log('🎯 Iniciando mapeo mejorado de categorías...');

try {
  // Definir reglas de categorización mejoradas con más palabras clave específicas
  const categoryRules = {
    'frutas-verduras-granel': {
      keywords: [
        'betabel', 'apio', 'acelga', 'lechuga', 'espinaca', 'col', 'brócoli', 'coliflor',
        'zanahoria', 'rábano', 'nabo', 'papa', 'camote', 'yuca', 'jícama',
        'tomate', 'jitomate', 'chile', 'pimiento', 'cebolla', 'ajo', 'chalote',
        'calabaza', 'calabacita', 'pepino', 'chayote', 'ejote', 'vainita',
        'elote', 'maíz', 'quelite', 'verdolaga', 'hierba', 'santa',
        'manzana', 'pera', 'durazno', 'chabacano', 'ciruela', 'plátano',
        'naranja', 'limón', 'lima', 'toronja', 'mandarina', 'pomelo',
        'uva', 'fresa', 'frambuesa', 'mora', 'zarzamora', 'arándano',
        'mango', 'papaya', 'piña', 'sandía', 'melón', 'mamey',
        'tuna', 'xoconostle', 'pitaya', 'guayaba', 'tejocote'
      ],
      priority: 10
    },
    'granos-cereales-integrales': {
      keywords: [
        'arroz', 'avena', 'quinoa', 'amaranto', 'chía', 'linaza',
        'trigo', 'cebada', 'centeno', 'mijo', 'sorgo', 'teff',
        'grano', 'cereal', 'integral', 'bulgur', 'cuscús'
      ],
      priority: 9
    },
    'proteinas-regenerativas': {
      keywords: [
        'frijol', 'fríjol', 'judía', 'alubia', 'negro', 'bayo', 'pinto',
        'lenteja', 'garbanzo', 'haba', 'chícharo', 'guisante',
        'soya', 'soja', 'lupino', 'cacahuate', 'maní'
      ],
      priority: 9
    },
    'aceites-naturales': {
      keywords: [
        'aceite', 'oil', 'oliva', 'coco', 'ajonjolí', 'sésamo',
        'girasol', 'cártamo', 'aguacate', 'almendra', 'nuez'
      ],
      priority: 10
    },
    'cafe-cacao-chocolate': {
      keywords: [
        'café', 'cacao', 'chocolate', 'cocoa', 'tablilla', 'bebida'
      ],
      priority: 10
    },
    'endulzantes-naturales': {
      keywords: [
        'miel', 'azúcar', 'piloncillo', 'panela', 'mascabado',
        'agave', 'maple', 'stevia', 'endulzante', 'dulce'
      ],
      priority: 10
    },
    'especias-condimentos': {
      keywords: [
        'sal', 'pimienta', 'comino', 'orégano', 'canela', 'clavo',
        'laurel', 'tomillo', 'romero', 'albahaca', 'perejil',
        'cilantro', 'epazote', 'hierba', 'buena', 'especias',
        'condimento', 'sazonador', 'chile', 'seco', 'molido'
      ],
      priority: 8
    },
    'mermeladas-untables': {
      keywords: [
        'mermelada', 'jalea', 'conserva', 'cajeta', 'untable',
        'ate', 'dulce', 'pasta', 'crema'
      ],
      priority: 10
    },
    'huevo-lacteos': {
      keywords: [
        'huevo', 'queso', 'yogurt', 'yoghurt', 'leche', 'crema',
        'mantequilla', 'lácteo', 'requesón', 'cottage'
      ],
      priority: 10
    },
    'tes-infusiones': {
      keywords: [
        'té', 'infusión', 'tisana', 'hierba', 'manzanilla',
        'hierbabuena', 'ruda', 'gordolobo', 'cola', 'caballo'
      ],
      priority: 9
    },
    'harinas-pastas': {
      keywords: [
        'harina', 'pasta', 'macarrón', 'espagueti', 'fideo',
        'tallarín', 'codito', 'penne', 'tortilla'
      ],
      priority: 9
    },
    'pan-galletas': {
      keywords: [
        'pan', 'galleta', 'bizcocho', 'cookie', 'tostada',
        'bollito', 'muffin', 'panqué', 'dona'
      ],
      priority: 9
    },
    'canastas-frutas-verduras': {
      keywords: [
        'canasta', 'kit', 'paquete', 'combo', 'surtido',
        'selección', 'variedad', 'mixto'
      ],
      priority: 8
    }
  };

  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-improved-mapping.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  let updatedCount = 0;
  const categoryDistribution = {};
  const mappingReport = {};
  
  // Función mejorada para determinar la mejor categoría
  function getBestCategory(productName) {
    const nameLower = productName.toLowerCase();
    const matches = [];
    
    // Calcular puntuación para cada categoría
    for (const [categoryId, rule] of Object.entries(categoryRules)) {
      let score = 0;
      const matchedKeywords = [];
      
      for (const keyword of rule.keywords) {
        if (nameLower.includes(keyword.toLowerCase())) {
          score += rule.priority;
          matchedKeywords.push(keyword);
        }
      }
      
      if (score > 0) {
        matches.push({
          category: categoryId,
          score: score,
          keywords: matchedKeywords
        });
      }
    }
    
    // Ordenar por puntuación y devolver la mejor
    matches.sort((a, b) => b.score - a.score);
    
    if (matches.length > 0) {
      console.log(`🎯 "${productName}": ${matches[0].category} (score: ${matches[0].score}, keywords: ${matches[0].keywords.join(', ')})`);
      return matches[0].category;
    }
    
    console.log(`❓ "${productName}": productos-arca-tierra (sin coincidencias)`);
    return 'productos-arca-tierra';
  }
  
  // Procesar cada producto
  const productRegex = /"nombre":\s*"([^"]+)"([\s\S]*?)"categoria":\s*"([^"]+)"/g;
  let match;
  
  while ((match = productRegex.exec(productosContent)) !== null) {
    const [fullMatch, productName, middleContent, currentCategory] = match;
    const newCategory = getBestCategory(productName);
    
    if (newCategory !== currentCategory) {
      updatedCount++;
      mappingReport[productName] = {
        from: currentCategory,
        to: newCategory
      };
      
      // Reemplazar en el contenido
      const newMatch = `"nombre": "${productName}"${middleContent}"categoria": "${newCategory}"`;
      productosContent = productosContent.replace(fullMatch, newMatch);
    }
    
    categoryDistribution[newCategory] = (categoryDistribution[newCategory] || 0) + 1;
  }
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Mapeo mejorado completado!`);
  console.log(`🔄 ${updatedCount} productos reasignados`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
  console.log('\n📊 Nueva distribución de categorías:');
  Object.entries(categoryDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  - "${cat}": ${count} productos`);
    });
  
  // Guardar reporte detallado
  const detailedReport = {
    timestamp: new Date().toISOString(),
    method: 'improved_keyword_mapping',
    updatedProducts: updatedCount,
    categoryDistribution: categoryDistribution,
    mappingChanges: mappingReport,
    totalCategories: Object.keys(categoryDistribution).length
  };
  
  const reportPath = path.join(__dirname, 'improved_mapping_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`📄 Reporte detallado: ${path.basename(reportPath)}`);
  
  // Verificar cobertura
  const frontendCategories = Object.keys(categoryRules);
  const coveredCategories = Object.keys(categoryDistribution).filter(cat => cat !== 'productos-arca-tierra');
  const coverage = (coveredCategories.length / frontendCategories.length * 100).toFixed(1);
  
  console.log(`\n📈 Cobertura de categorías: ${coverage}% (${coveredCategories.length}/${frontendCategories.length})`);
  
  if (coveredCategories.length < frontendCategories.length) {
    const missingCategories = frontendCategories.filter(cat => !categoryDistribution[cat]);
    console.log(`⚠️  Categorías sin productos: ${missingCategories.join(', ')}`);
  } else {
    console.log('✅ Todas las categorías del frontend tienen productos asignados!');
  }
  
} catch (error) {
  console.error('❌ Error durante el mapeo mejorado:', error.message);
  process.exit(1);
}
