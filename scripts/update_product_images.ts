import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Definimos la interfaz aquí para no depender de la importación
interface Product {
    id: string;
    nombre: string;
    precio: number;
    unidad: string;
    imagen: string;
    // Añade aquí el resto de las propiedades de Product si son necesarias para el script
}

const markdownCatalogPath = path.join(__dirname, '../docs/imagenes_productos/🎉 CATÁLOGO COMPLETO ARCA TIERRA - 165 PRODUCTOS 🌱.md');
const imagesDirPath = path.join(__dirname, '../public/images/products');
const productsTsPath = path.join(__dirname, '../src/data/productos.ts');

// 1. Función para normalizar nombres de productos a nombres de archivo
function getProductImageFilename(productName: string): string {
    return productName
        .toLowerCase()
        .replace(/ñ/g, 'n')
        .replace(/[áäâà]/g, 'a').replace(/[éëêè]/g, 'e').replace(/[íïîì]/g, 'i').replace(/[óöôò]/g, 'o').replace(/[úüûù]/g, 'u')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_') + '.png';
}

// 2. Leer y parsear el catálogo Markdown para extraer nombres de productos
function getProductNamesFromMarkdown(): string[] {
    try {
        const markdownContent = fs.readFileSync(markdownCatalogPath, 'utf-8');
        const productLines = markdownContent.match(/^- .*/gm) || [];
        const productNames = productLines.map(line => {
            return line.replace(/^- /, '').split(',').map(p => p.trim());
        }).flat();
        return productNames.filter(name => name && name.length > 0);
    } catch (error) {
        console.error('Error reading or parsing Markdown catalog:', error);
        return [];
    }
}

// 3. Crear el mapa de Nombre de Producto -> Ruta de Imagen
function createImageMap(productNames: string[]): Record<string, string> {
    const imageMap: Record<string, string> = {};
    const availableImages = fs.readdirSync(imagesDirPath);
    const availableImagesSet = new Set(availableImages);

    productNames.forEach(name => {
        const expectedFilename = getProductImageFilename(name);
        if (availableImagesSet.has(expectedFilename)) {
            imageMap[name] = `/images/products/${expectedFilename}`;
        }
    });
    return imageMap;
}

// --- Ejecución Principal con AST ---
function runUpdate() {
    console.log('🚀 Starting product image update process...');
    const productNamesFromMarkdown = getProductNamesFromMarkdown();
    if (productNamesFromMarkdown.length === 0) {
        console.log('❌ No product names found in Markdown. Aborting.');
        return;
    }
    console.log(`✔️ Found ${productNamesFromMarkdown.length} product names in the Markdown catalog.`);

    const imageMap = createImageMap(productNamesFromMarkdown);
    console.log(`✔️ Created a map with ${Object.keys(imageMap).length} images found in public directory.`);

    const fileContent = fs.readFileSync(productsTsPath, 'utf-8');
    const sourceFile = ts.createSourceFile(productsTsPath, fileContent, ts.ScriptTarget.Latest, true);

    let productsUpdated = 0;

    const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
        return (rootNode: T) => {
            function visit(node: ts.Node): ts.Node {
                if (ts.isVariableDeclaration(node) && node.name.getText(sourceFile) === 'productos') {
                    if (node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
                        const updatedElements = node.initializer.elements.map(element => {
                            if (ts.isObjectLiteralExpression(element)) {
                                let currentProductName: string | undefined;
                                let imageProperty: ts.PropertyAssignment | undefined;

                                element.properties.forEach(prop => {
                                    if (ts.isPropertyAssignment(prop) && prop.name) {
                                        const propName = prop.name.getText(sourceFile);
                                        if (propName === 'nombre' && ts.isStringLiteral(prop.initializer)) {
                                            currentProductName = prop.initializer.text;
                                        }
                                        if (propName === 'imagen') {
                                            imageProperty = prop;
                                        }
                                    }
                                });

                                if (currentProductName) {
                                    const productNameTs = currentProductName.toLowerCase();
                                    let bestMatch: string | undefined = undefined;
                                    let longestMatchLength = 0;

                                    for (const mdName of productNamesFromMarkdown) {
                                        const mdNameLower = mdName.toLowerCase();
                                        if (productNameTs.includes(mdNameLower) && mdNameLower.length > longestMatchLength) {
                                            bestMatch = mdName;
                                            longestMatchLength = mdNameLower.length;
                                        }
                                    }

                                    if (bestMatch && imageMap[bestMatch] && imageProperty) {
                                        const newImagePath = imageMap[bestMatch];
                                        if (ts.isStringLiteral(imageProperty.initializer) && imageProperty.initializer.text !== newImagePath) {
                                            productsUpdated++;
                                            const newImageProperty = context.factory.createPropertyAssignment('imagen', context.factory.createStringLiteral(newImagePath));
                                            const otherProperties = element.properties.filter(p => p !== imageProperty);
                                            return context.factory.createObjectLiteralExpression([newImageProperty, ...otherProperties], true);
                                        }
                                    }
                                }
                            }
                            return element;
                        });
                        const newInitializer = context.factory.createArrayLiteralExpression(updatedElements, true);
                        return context.factory.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type, newInitializer);
                    }
                }
                return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(rootNode, visit);
        };
    };

    const transformationResult = ts.transform(sourceFile, [transformer]);
    const transformedSourceFile = transformationResult.transformed[0];

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const newContent = printer.printNode(ts.EmitHint.Unspecified, transformedSourceFile, sourceFile);

    fs.writeFileSync(productsTsPath, newContent, 'utf-8');

    console.log('✅ Successfully updated productos.ts using AST.');
    console.log(`🖼️  ${productsUpdated} product images were updated.`);
}

runUpdate();

