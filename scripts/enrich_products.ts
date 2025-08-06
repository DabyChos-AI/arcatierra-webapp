import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Product } from '../src/types/product';

// --- 1. Definir rutas ---
const projectRoot = path.resolve(__dirname, '..');
const tsProductsPath = path.join(projectRoot, 'src', 'data', 'productos.ts');
const traceabilityCsvPath = path.join(projectRoot, 'docs', 'trazabili.csv');

// --- 2. Leer productos desde .ts ---
const getProducts = (): Product[] => {
    console.log(`Reading products from ${tsProductsPath}...`);
    const fileContent = fs.readFileSync(tsProductsPath, 'utf8');
    
    const arrayMatch = fileContent.match(/export const productos: Product\[\] = ([\s\S]*?);/);
    if (!arrayMatch || !arrayMatch[1]) {
        throw new Error('Could not find the products array in productos.ts. Check the file format.');
    }
    
    let productsString = arrayMatch[1];
    
    try {
        // eslint-disable-next-line no-eval
        const products = eval(productsString);
        console.log(`Successfully parsed ${products.length} products.`);
        return products;
    } catch (error) {
        console.error('Failed to parse products array from productos.ts', error);
        throw new Error('Parsing error');
    }
};

// --- 3. Leer y procesar el CSV de trazabilidad ---
const getTraceabilityData = async (): Promise<Map<string, any>> => {
    console.log('Reading traceability data from CSV...');
    const traceabilityData = new Map<string, any>();
    return new Promise((resolve, reject) => {
        fs.createReadStream(traceabilityCsvPath)
            .pipe(csv({ mapHeaders: ({ header }) => header.trim().replace(/\uFEFF/g, '') }))
            .on('data', (row) => {
                const productId = row['ID']?.trim();
                if (productId) {
                    traceabilityData.set(productId, {
                        productor: row['productor']?.trim() || '',
                        region: row['REGION']?.trim() || '',
                        fotoProductor: row['foto del productor']?.trim() || ''
                    });
                }
            })
            .on('end', () => {
                console.log(`Found traceability data for ${traceabilityData.size} items in CSV.`);
                resolve(traceabilityData);
            })
            .on('error', reject);
    });
};

// --- 4. Enriquecer productos y guardar en formato TS ---
const enrichAndSave = (productsToEnrich: Product[], traceabilityData: Map<string, any>) => {
    console.log('Enriching products with traceability data...');
    let updatedCount = 0;

    const enrichedProducts: Product[] = productsToEnrich.map(product => {
        const traceData = traceabilityData.get(product.id);
        
        if (traceData && traceData.productor) {
            updatedCount++;
            const newProduct: Product = { ...product };
            newProduct.productor = traceData.productor;
            newProduct.ubicacion = traceData.region;
            
            if (!newProduct.trazabilidad) {
                newProduct.trazabilidad = {};
            }

            newProduct.trazabilidad = {
                ...newProduct.trazabilidad,
                agricultor: { nombre: traceData.productor, fotografia: traceData.fotoProductor },
                origen: { region: traceData.region, estado: traceData.region },
            };
            return newProduct;
        }
        return product;
    });

    console.log(`Enriched ${updatedCount} out of ${enrichedProducts.length} products.`);

    // --- Guardar como TypeScript ---
    const tsFileContent = `/* eslint-disable */
// Este archivo es generado por scripts/enrich_products.ts
import { Product } from '../types/product';

export const productos: Product[] = ${JSON.stringify(enrichedProducts, null, 2)};
`;
    fs.writeFileSync(tsProductsPath, tsFileContent, 'utf8');
    console.log(`Successfully updated TypeScript file: ${tsProductsPath}`);
};

// --- 5. Ejecutar ---
const run = async () => {
    console.log('--- Starting Product Enrichment Process ---');
    try {
        const products = getProducts();
        const traceabilityData = await getTraceabilityData();
        enrichAndSave(products, traceabilityData);
        console.log('--- Enrichment Process Finished ---');
    } catch (error) {
        console.error('An error occurred during the enrichment process:', error);
    }
};

run();
