const fs = require('fs');
const path = require('path');

// Leer archivo productostienda.csv
const csvPath = path.join(__dirname, '..', 'docs', 'productostienda.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Leer archivo productos.ts
const productosPath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
let productosContent = fs.readFileSync(productosPath, 'utf8');

// Parsear CSV y extraer precios
const csvLines = csvContent.split('\n').slice(1); // Skip header
const pricesMap = new Map();

csvLines.forEach(line => {
    if (!line.trim()) return;
    
    const columns = line.split(',');
    const sku = columns[0]?.trim();
    const priceStr = columns[3]?.trim();
    
    if (sku && priceStr && priceStr !== '') {
        // Limpiar precio: remover $ y espacios, convertir a número
        const cleanPrice = priceStr.replace(/[$,\s]/g, '').replace(/"/g, '');
        const priceNum = parseFloat(cleanPrice);
        
        if (!isNaN(priceNum) && priceNum > 0) {
            pricesMap.set(sku, priceNum);
        }
    }
});

console.log(`Precios extraídos del CSV: ${pricesMap.size}`);

// Lista de productos que tienen precio 0 en productos.ts
const productsToUpdate = [
    '1885u', '1886u', '1887u', '1888u', '1889u', '1890u', '1891u',
    'P-WEB-SEC-006', 'P-WEB-SEC-007', 'P-WEB-SEC-008', 'P-WEB-SEC-009', 'P-WEB-SEC-011',
    'P-WEB-SEC-015', 'P-WEB-SEC-025', 'P-WEB-SEC-026', 'P-WEB-SEC-084', 'P-WEB-SEC-075',
    'P-WEB-SEC-076', 'P-WEB-SEC-077', 'P-WEB-SEC-028', 'P-WEB-SEC-029', 'P-WEB-SEC-030',
    'P-WEB-SEC-031', 'P-WEB-SEC-032', 'P-WEB-ABA-007', 'P-WEB-SEC-038', 'P-WEB-SEC-039',
    'P-WEB-SEC-055', 'P-WEB-SEC-058', 'P-WEB-SEC-073', 'P-WEB-SEC-068', 'P-WEB-SEC-069'
];

let updatedCount = 0;
let notFoundCount = 0;

// Función para actualizar precio en el contenido
function updateProductPrice(content, productId, newPrice) {
    // Buscar el producto por ID y actualizar su precio
    const productRegex = new RegExp(
        `({[^}]*"id":\\s*"${productId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"precio":\\s*)0(,)`
    );
    
    return content.replace(productRegex, `$1${newPrice}$2`);
}

// Actualizar precios
productsToUpdate.forEach(productId => {
    // Buscar precio en CSV (puede ser con o sin sufijo 'u')
    let price = pricesMap.get(productId);
    
    // Para canastas, el ID en CSV puede no tener el sufijo 'u'
    if (!price && productId.endsWith('u')) {
        const baseId = productId.slice(0, -1);
        price = pricesMap.get(baseId);
    }
    
    if (price) {
        const oldContent = productosContent;
        productosContent = updateProductPrice(productosContent, productId, price);
        
        if (oldContent !== productosContent) {
            console.log(`✅ ${productId}: $${price}`);
            updatedCount++;
        } else {
            console.log(`⚠️  No se pudo actualizar ${productId} (no encontrado en productos.ts)`);
        }
    } else {
        console.log(`❌ ${productId}: No encontrado en CSV`);
        notFoundCount++;
    }
});

// Guardar archivo actualizado
fs.writeFileSync(productosPath, productosContent, 'utf8');

console.log(`\n=== RESUMEN ===`);
console.log(`Productos actualizados: ${updatedCount}`);
console.log(`Productos no encontrados en CSV: ${notFoundCount}`);
console.log(`Total procesados: ${productsToUpdate.length}`);

// Verificar algunos productos actualizados
console.log(`\n=== VERIFICACIÓN ===`);
const sampleIds = ['1885u', 'P-WEB-SEC-006', 'P-WEB-SEC-025'];
sampleIds.forEach(id => {
    const regex = new RegExp(`"id":\\s*"${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"precio":\\s*(\\d+(?:\\.\\d+)?)`);
    const match = productosContent.match(regex);
    if (match) {
        console.log(`${id}: $${match[1]}`);
    }
});

console.log('\n🎉 Sincronización de precios completada!');
