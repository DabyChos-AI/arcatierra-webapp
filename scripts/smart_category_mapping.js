// scripts/smart_category_mapping.js
// Script para mapear productos a categorías usando análisis inteligente de nombres

const fs = require('fs');
const path = require('path');

console.log('🧠 Iniciando mapeo inteligente de categorías por nombres...');

try {
  // Definir reglas de categorización basadas en palabras clave
  const categoryRules = {
    'aceites-naturales': {
      keywords: ['aceite', 'oil', 'oliva', 'coco', 'ajonjolí', 'girasol'],
      priority: 10
    },
    'granos-cereales-integrales': {
      keywords: ['arroz', 'avena', 'quinoa', 'amaranto', 'trigo', 'cebada', 'centeno', 'mijo', 'sorgo', 'grano'],
      priority: 9
    },
    'proteinas-regenerativas': {
      keywords: ['frijol', 'lenteja', 'garbanzo', 'haba', 'chícharo', 'leguminosa', 'proteina'],
      priority: 8
    },
    'cafe-cacao-chocolate': {
      keywords: ['café', 'cacao', 'chocolate', 'cocoa'],
      priority: 10
    },
    'endulzantes-naturales': {
      keywords: ['miel', 'azúcar', 'piloncillo', 'agave', 'maple', 'stevia', 'endulzante'],
      priority: 9
    },
    'especias-condimentos': {
      keywords: ['sal', 'pimienta', 'comino', 'orégano', 'canela', 'clavo', 'laurel', 'tomillo', 'romero', 'especias', 'condimento'],
      priority: 8
    },
    'frutas-verduras-granel': {
      keywords: ['tomate', 'cebolla', 'zanahoria', 'papa', 'chile', 'calabaza', 'brócoli', 'lechuga', 'espinaca', 'acelga', 'verdura', 'fruta', 'manzana', 'naranja', 'limón'],
      priority: 7
    },
    'mermeladas-untables': {
      keywords: ['mermelada', 'untable', 'jalea', 'conserva', 'cajeta'],
      priority: 10
    },
    'huevo-lacteos': {
      keywords: ['huevo', 'queso', 'yogurt', 'leche', 'crema', 'mantequilla', 'lácteo'],
      priority: 10
    },
    'tes-infusiones': {
      keywords: ['té', 'infusión', 'tisana', 'hierba', 'manzanilla', 'hierbabuena', 'ruda'],
      priority: 9
    },
    'harinas-pastas': {
      keywords: ['harina', 'pasta', 'macarrón', 'espagueti', 'fideo'],
      priority: 9
    },
    'pan-galletas': {
      keywords: ['pan', 'galleta', 'bizcocho', 'cookie', 'tostada'],
      priority: 9
    },
    'canastas-frutas-verduras': {
      keywords: ['canasta', 'kit', 'paquete', 'combo', 'surtido'],
      priority: 8
    }
  };

  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-smart-mapping.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  let updatedCount = 0;
  const categoryDistribution = {};
  const mappingReport = {};
  
  // Función para determinar la mejor categoría para un producto
  function getBestCategory(productName) {
    const nameLower = productName.toLowerCase();
    let bestMatch = { category: 'productos-arca-tierra', score: 0 };
    
    for (const [categoryId, rule] of Object.entries(categoryRules)) {
      let score = 0;
      
      for (const keyword of rule.keywords) {
        if (nameLower.includes(keyword.toLowerCase())) {
          score += rule.priority;
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { category: categoryId, score: score };
      }
    }
    
    return bestMatch.category;
  }
  
  // Actualizar categorías de productos
  const productRegex = /"nombre":\s*"([^"]+)"([\s\S]*?)"categoria":\s*"([^"]+)"/g;
  
  productosContent = productosContent.replace(productRegex, (match, productName, middleContent, currentCategory) => {
    const newCategory = getBestCategory(productName);
    
    if (newCategory !== currentCategory) {
      updatedCount++;
      mappingReport[productName] = {
        from: currentCategory,
        to: newCategory
      };
      
      categoryDistribution[newCategory] = (categoryDistribution[newCategory] || 0) + 1;
      
      console.log(`🔄 "${productName}": ${currentCategory} → ${newCategory}`);
      
      return `"nombre": "${productName}"${middleContent}"categoria": "${newCategory}"`;
    } else {
      categoryDistribution[currentCategory] = (categoryDistribution[currentCategory] || 0) + 1;
    }
    
    return match;
  });
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Mapeo inteligente completado!`);
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
    method: 'intelligent_keyword_mapping',
    updatedProducts: updatedCount,
    categoryDistribution: categoryDistribution,
    mappingChanges: mappingReport,
    categoryRules: categoryRules
  };
  
  const reportPath = path.join(__dirname, 'smart_mapping_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`📄 Reporte detallado: ${path.basename(reportPath)}`);
  
  // Verificar que todas las categorías del frontend estén representadas
  const frontendCategories = Object.keys(categoryRules);
  const missingCategories = frontendCategories.filter(cat => !categoryDistribution[cat]);
  
  if (missingCategories.length > 0) {
    console.log(`\n⚠️  Categorías sin productos: ${missingCategories.join(', ')}`);
  } else {
    console.log('\n✅ Todas las categorías del frontend tienen productos asignados!');
  }
  
} catch (error) {
  console.error('❌ Error durante el mapeo:', error.message);
  process.exit(1);
}
