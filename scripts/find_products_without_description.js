const fs = require('fs');
const path = require('path');

// Leer el archivo productos.ts
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const content = fs.readFileSync(productosPath, 'utf8');

// Extraer todos los productos usando regex
const productRegex = /{[^{}]*"id":\s*"([^"]*)"[^{}]*"nombre":\s*"([^"]*)"[^{}]*"descripcion":\s*""[^{}]*}/gs;

const productsWithoutDescription = [];
let match;

while ((match = productRegex.exec(content)) !== null) {
    const id = match[1];
    const nombre = match[2];
    productsWithoutDescription.push({ id, nombre });
}

// Verificar resultados manualmente con búsqueda más precisa
const lines = content.split('\n');
const manualResults = [];

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"descripcion": "",')) {
        // Buscar hacia atrás para encontrar el ID y nombre
        let id = '';
        let nombre = '';
        
        for (let j = i; j >= 0; j--) {
            if (!id && lines[j].includes('"id":')) {
                const idMatch = lines[j].match(/"id":\s*"([^"]*)",?/);
                if (idMatch) id = idMatch[1];
            }
            if (!nombre && lines[j].includes('"nombre":')) {
                const nombreMatch = lines[j].match(/"nombre":\s*"([^"]*)",?/);
                if (nombreMatch) nombre = nombreMatch[1];
            }
            if (id && nombre) break;
            
            // Si llegamos a otro producto, parar
            if (lines[j].includes('"id":') && id && lines[j] !== lines[i]) break;
        }
        
        if (id && nombre) {
            manualResults.push({ id, nombre });
        }
    }
}

// Usar los resultados manuales que son más precisos
const finalResults = manualResults;

console.log(`\n=== PRODUCTOS SIN DESCRIPCIÓN ===`);
console.log(`Total encontrados: ${finalResults.length}\n`);

// Agrupar por categorías basadas en el nombre
const categorias = {
    'Canastas': finalResults.filter(p => p.nombre.toLowerCase().includes('canasta')),
    'Granos y Cereales': finalResults.filter(p => 
        p.nombre.toLowerCase().includes('frijol') || 
        p.nombre.toLowerCase().includes('lenteja') || 
        p.nombre.toLowerCase().includes('garbanzo') || 
        p.nombre.toLowerCase().includes('haba') ||
        p.nombre.toLowerCase().includes('quinoa') ||
        p.nombre.toLowerCase().includes('amaranto') ||
        p.nombre.toLowerCase().includes('avena')
    ),
    'Verduras': finalResults.filter(p => 
        ['acelga', 'apio', 'betabel', 'brócoli', 'calabaza', 'cebolla', 'col', 'coliflor', 
         'chayote', 'chícharo', 'ejote', 'elote', 'espinaca', 'jitomate', 'lechuga', 
         'nabo', 'papa', 'pepino', 'pimiento', 'quelite', 'rábano', 'tomate', 'verdolaga', 
         'zanahoria'].some(v => p.nombre.toLowerCase().includes(v))
    ),
    'Frutas': finalResults.filter(p => 
        ['aguacate', 'ciruela', 'durazno', 'fresa', 'guayaba', 'lima', 'limón', 'mamey', 
         'mango', 'manzana', 'melón', 'naranja', 'papaya', 'pera', 'piña', 'plátano', 
         'sandía', 'tuna', 'uva'].some(f => p.nombre.toLowerCase().includes(f))
    ),
    'Hierbas y Especias': finalResults.filter(p => 
        ['albahaca', 'cilantro', 'epazote', 'hierba', 'menta', 'orégano', 'perejil', 
         'romero', 'tomillo', 'ajo', 'cúrcuma', 'jengibre'].some(h => p.nombre.toLowerCase().includes(h))
    ),
    'Otros': []
};

// Productos que no encajan en ninguna categoría
const productosCategorizados = [].concat(
    categorias['Canastas'],
    categorias['Granos y Cereales'], 
    categorias['Verduras'],
    categorias['Frutas'],
    categorias['Hierbas y Especias']
);

categorias['Otros'] = finalResults.filter(p => 
    !productosCategorizados.some(pc => pc.id === p.id)
);

// Mostrar por categorías
Object.entries(categorias).forEach(([categoria, productos]) => {
    if (productos.length > 0) {
        console.log(`### ${categoria} (${productos.length})`);
        productos.forEach(producto => {
            console.log(`- **${producto.nombre}** (ID: ${producto.id})`);
        });
        console.log();
    }
});

// Lista de IDs para uso programático
console.log('\n=== LISTA DE IDs SIN DESCRIPCIÓN ===');
finalResults.forEach(p => console.log(p.id));

// Generar archivo de reporte
const reportContent = `# Productos sin Descripción

**Total: ${finalResults.length} productos**

${Object.entries(categorias).map(([categoria, productos]) => {
    if (productos.length === 0) return '';
    return `## ${categoria} (${productos.length})

${productos.map(p => `- **${p.nombre}** (ID: ${p.id})`).join('\n')}`;
}).filter(Boolean).join('\n\n')}

## Lista de IDs para uso programático

${finalResults.map(p => p.id).join(', ')}

---
*Reporte generado automáticamente basado en productos.ts*
*Solo se muestran productos con descripción vacía ("")*
`;

// Guardar reporte
const reportPath = path.join(__dirname, '..', 'reports', 'productos-sin-descripcion.md');
fs.writeFileSync(reportPath, reportContent, 'utf8');

console.log(`\nReporte guardado en: ${reportPath}`);
