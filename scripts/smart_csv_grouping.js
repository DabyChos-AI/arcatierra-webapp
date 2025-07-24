// scripts/smart_csv_grouping.js
// Script para agrupar productos del sistema en categorías REALES del CSV

const fs = require('fs');
const path = require('path');

console.log('🎯 Agrupamiento inteligente con categorías REALES del CSV...');

try {
  // Categorías REALES extraídas del CSV con reglas de clasificación inteligente
  const realCSVCategories = {
    'Frutas y Verduras a Granel': {
      keywords: [
        // Verduras de hoja
        'lechuga', 'espinaca', 'acelga', 'col', 'repollo', 'berza',
        // Verduras de raíz
        'betabel', 'zanahoria', 'rábano', 'nabo', 'camote', 'papa',
        // Verduras de fruto
        'tomate', 'jitomate', 'chile', 'pimiento', 'calabaza', 'calabacita', 'pepino',
        // Cebollas y ajos
        'cebolla', 'ajo', 'poro', 'chalote',
        // Brócoli, coliflor
        'brócoli', 'coliflor', 'romanesco',
        // Apio, apio
        'apio',
        // Chayotes, ejotes
        'chayote', 'ejote', 'vainita', 'chícharo',
        // Elotes
        'elote', 'maíz', 'mazorca',
        // Frutas
        'manzana', 'pera', 'naranja', 'limón', 'lima', 'toronja', 'mandarina',
        'plátano', 'fresa', 'uva', 'durazno', 'chabacano', 'ciruela',
        'mango', 'papaya', 'piña', 'sandía', 'melón', 'aguacate',
        'guayaba', 'granada', 'tuna'
      ],
      priority: 10
    },
    'ESPECIAS': {
      keywords: [
        'orégano', 'tomillo', 'romero', 'albahaca', 'perejil', 'cilantro',
        'laurel', 'canela', 'clavo', 'pimienta', 'comino', 'cúrcuma',
        'jengibre', 'anís', 'cardamomo', 'nuez moscada'
      ],
      priority: 10
    },
    'INFUSIONES Y TE': {
      keywords: [
        'té', 'infusión', 'tisana', 'hierba', 'manzanilla', 'hierbabuena',
        'toronjil', 'ruda', 'melisa', 'menta', 'gordolobo', 'cola de caballo',
        'lavanda', 'azahar', 'jengibre deshidratado'
      ],
      priority: 10
    },
    'GRANOS, SEMILLAS Y CEREALES': {
      keywords: [
        'arroz', 'avena', 'quinoa', 'amaranto', 'chía', 'linaza',
        'trigo', 'cebada', 'centeno', 'mijo', 'sorgo',
        'frijol', 'lenteja', 'garbanzo', 'haba', 'chícharo', 
        'pepita', 'calabaza', 'girasol', 'ajonjolí', 'nuez', 'almendra'
      ],
      priority: 9
    },
    'ENDULZANTES': {
      keywords: [
        'miel', 'piloncillo', 'azúcar', 'mascabado', 'panela',
        'agave', 'maple', 'stevia'
      ],
      priority: 10
    },
    'MERMELADAS Y UNTABLES': {
      keywords: [
        'mermelada', 'jalea', 'conserva', 'cajeta', 'untable',
        'ate', 'dulce', 'compota'
      ],
      priority: 10
    },
    'CONDIMENTOS': {
      keywords: [
        'mostaza', 'salsa', 'vinagre', 'aderezo', 'dip',
        'sal', 'sazonador', 'condimento'
      ],
      priority: 9
    },
    'CACAO Y CHOCOLATE': {
      keywords: [
        'cacao', 'chocolate', 'cocoa', 'nibs', 'tablilla'
      ],
      priority: 10
    },
    'PROTEINA ANIMAL': {
      keywords: [
        'pollo', 'res', 'cerdo', 'pescado', 'carne', 'milanesa',
        'bistec', 'chuleta', 'ossobuco', 'pechuga'
      ],
      priority: 10
    },
    'HUEVO Y LACTEOS': {
      keywords: [
        'huevo', 'queso', 'yogurt', 'leche', 'crema', 'mantequilla',
        'requesón', 'cottage', 'oaxaca'
      ],
      priority: 10
    },
    'GALLETAS, HARINAS Y PAN': {
      keywords: [
        'harina', 'pan', 'galleta', 'bizcocho', 'tortilla',
        'pasta', 'macarrón', 'espagueti', 'fideo'
      ],
      priority: 9
    },
    'ACEITES Y GRASAS': {
      keywords: [
        'aceite', 'oliva', 'coco', 'girasol', 'cártamo',
        'aguacate', 'manteca'
      ],
      priority: 10
    },
    'ABARROTES': {
      keywords: [
        'conserva', 'enlatado', 'frasco', 'despensa'
      ],
      priority: 5
    },
    'Canastas de frutas y verduras agroecológicas': {
      keywords: [
        'canasta', 'kit', 'paquete', 'combo', 'surtido',
        'selección', 'variedad', 'mixto'
      ],
      priority: 8
    }
  };

  // Función para determinar la mejor categoría CSV para un producto
  function getBestCSVCategory(productName) {
    const nameLower = productName.toLowerCase();
    let bestMatch = { category: 'Frutas y Verduras a Granel', score: 0 };
    
    for (const [categoryName, rule] of Object.entries(realCSVCategories)) {
      let score = 0;
      const matchedKeywords = [];
      
      for (const keyword of rule.keywords) {
        if (nameLower.includes(keyword.toLowerCase())) {
          score += rule.priority;
          matchedKeywords.push(keyword);
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { 
          category: categoryName, 
          score: score,
          keywords: matchedKeywords
        };
      }
    }
    
    return bestMatch;
  }

  // Leer archivo de productos
  const productosPath = path.join(__dirname, '../src/data/productos.ts');
  let productosContent = fs.readFileSync(productosPath, 'utf8');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-smart-csv-grouping.${Date.now()}`;
  fs.writeFileSync(backupPath, productosContent);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  let updatedCount = 0;
  const mappingReport = {};
  const categoryDistribution = {};
  
  // Mapeo de categorías CSV a IDs del frontend
  const csvToFrontendMap = {
    'Frutas y Verduras a Granel': 'frutas-verduras-granel',
    'ESPECIAS': 'especias-condimentos',
    'INFUSIONES Y TE': 'tes-infusiones',
    'GRANOS, SEMILLAS Y CEREALES': 'granos-cereales-integrales',
    'ENDULZANTES': 'endulzantes-naturales',
    'MERMELADAS Y UNTABLES': 'mermeladas-untables',
    'CONDIMENTOS': 'especias-condimentos',
    'CACAO Y CHOCOLATE': 'cafe-cacao-chocolate',
    'PROTEINA ANIMAL': 'proteinas-regenerativas',
    'HUEVO Y LACTEOS': 'huevo-lacteos',
    'GALLETAS, HARINAS Y PAN': 'harinas-pastas',
    'ACEITES Y GRASAS': 'aceites-naturales',
    'ABARROTES': 'productos-arca-tierra',
    'Canastas de frutas y verduras agroecológicas': 'canastas-frutas-verduras'
  };
  
  // Procesar cada producto
  const productRegex = /"nombre":\s*"([^"]+)"([\s\S]*?)"categoria":\s*"([^"]+)"/g;
  
  productosContent = productosContent.replace(productRegex, (match, productName, middleContent, currentCategory) => {
    const bestMatch = getBestCSVCategory(productName);
    const csvCategory = bestMatch.category;
    const frontendId = csvToFrontendMap[csvCategory] || 'productos-arca-tierra';
    
    if (frontendId !== currentCategory) {
      updatedCount++;
      mappingReport[productName] = {
        from: currentCategory,
        to: frontendId,
        csvCategory: csvCategory,
        score: bestMatch.score,
        keywords: bestMatch.keywords || []
      };
      
      console.log(`🎯 "${productName}": ${currentCategory} → ${frontendId} (CSV: ${csvCategory}, score: ${bestMatch.score})`);
      if (bestMatch.keywords && bestMatch.keywords.length > 0) {
        console.log(`   Keywords: ${bestMatch.keywords.join(', ')}`);
      }
    }
    
    categoryDistribution[frontendId] = (categoryDistribution[frontendId] || 0) + 1;
    
    return `"nombre": "${productName}"${middleContent}"categoria": "${frontendId}"`;
  });
  
  // Escribir archivo actualizado
  fs.writeFileSync(productosPath, productosContent);
  
  console.log(`\n✅ Agrupamiento inteligente completado!`);
  console.log(`🔄 ${updatedCount} productos reclasificados según categorías CSV`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
  console.log('\n📊 Distribución FINAL (según categorías CSV reales):');
  Object.entries(categoryDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`  - "${cat}": ${count} productos`);
    });
  
  // Verificar cobertura de categorías del frontend
  const expectedFrontendCategories = [
    'aceites-naturales', 'canastas-frutas-verduras', 'granos-cereales-integrales',
    'proteinas-regenerativas', 'cafe-cacao-chocolate', 'endulzantes-naturales',
    'especias-condimentos', 'frutas-verduras-granel', 'mermeladas-untables',
    'huevo-lacteos', 'tes-infusiones', 'productos-arca-tierra',
    'harinas-pastas', 'pan-galletas'
  ];
  
  const coveredCategories = expectedFrontendCategories.filter(cat => categoryDistribution[cat] > 0);
  const coverage = (coveredCategories.length / expectedFrontendCategories.length * 100).toFixed(1);
  
  console.log(`\n📈 Cobertura de categorías frontend: ${coverage}% (${coveredCategories.length}/${expectedFrontendCategories.length})`);
  
  // Guardar reporte detallado
  const detailedReport = {
    timestamp: new Date().toISOString(),
    method: 'smart_csv_category_grouping',
    updatedProducts: updatedCount,
    categoryDistribution: categoryDistribution,
    csvCategoriesUsed: Object.keys(realCSVCategories),
    frontendCoverage: coverage,
    mappingChanges: mappingReport,
    csvToFrontendMapping: csvToFrontendMap
  };
  
  const reportPath = path.join(__dirname, 'smart_csv_grouping_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`📄 Reporte completo: ${path.basename(reportPath)}`);
  
  console.log('\n🎉 ¡Los productos ahora están categorizados según las categorías REALES del CSV!');
  
} catch (error) {
  console.error('❌ Error durante el agrupamiento inteligente:', error.message);
  process.exit(1);
}
