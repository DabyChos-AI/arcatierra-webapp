const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '..', 'src', 'data', 'productos.ts');
const pricesCsvPath = path.join(__dirname, '..', 'docs', 'productostienda.csv');

// --- Manual CSV Parsing --- 
const pricesMap = new Map();
try {
    const csvFileContent = fs.readFileSync(pricesCsvPath, 'utf-8');
    const lines = csvFileContent.split(/\r?\n/); // Split by new line

    if (lines.length < 2) {
        throw new Error('CSV file is empty or has only a header.');
    }

    const header = lines[0].split(',').map(h => h.trim());
    const skuIndex = header.indexOf('SKU');
    const priceIndex = header.indexOf('PRECIO FINAL');

    if (skuIndex === -1 || priceIndex === -1) {
        throw new Error(`Could not find 'SKU' or 'PRECIO FINAL' columns in the header. Found: ${header.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
        const data = lines[i].split(',');
        const sku = data[skuIndex] ? data[skuIndex].trim() : null;
        const priceString = data[priceIndex] ? data[priceIndex].trim() : null;

        if (sku && priceString) {
            const price = parseFloat(priceString.replace(/[^\d.-]/g, ''));
            if (!isNaN(price)) {
                pricesMap.set(sku, price);
            }
        }
    }
    console.log(`ℹ️  Found ${pricesMap.size} prices in the CSV file using manual parsing.`);

} catch (error) {
    console.error(`❌ Error during manual CSV parsing: ${error.message}`);
    process.exit(1);
}

// --- Update productos.ts (same logic as before) ---
try {
    let productsFileContent = fs.readFileSync(productsFilePath, 'utf-8');
    const productsRegex = /export const productos: Product\[\] = ([\s\S]*?);/;
    const match = productsFileContent.match(productsRegex);

    if (!match || !match[1]) {
        throw new Error('Could not find the `productos` array in the target file.');
    }

    let products = JSON.parse(match[1]);
    let updatedCount = 0;

    const updatedProducts = products.map(product => {
        if (pricesMap.has(product.id)) {
            const newPrice = pricesMap.get(product.id);
            if (product.precio !== newPrice) {
                product.precio = newPrice;
                updatedCount++;
            }
        }
        return product;
    });

    const updatedProductsJson = JSON.stringify(updatedProducts, null, 2);
    const newProductsFileContent = productsFileContent.replace(productsRegex, `export const productos: Product[] = ${updatedProductsJson};`);

    fs.writeFileSync(productsFilePath, newProductsFileContent, 'utf-8');
    console.log(`✅ Successfully updated prices for ${updatedCount} products in ${path.basename(productsFilePath)}.`);

} catch (error) {
    console.error(`❌ Error updating productos.ts file: ${error.message}`);
    process.exit(1);
}
