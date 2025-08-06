const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');

// Función para generar un ID a partir del nombre de la categoría
const generateId = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD') // Quitar acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/[^a-z0-9-]/g, ''); // Quitar caracteres no alfanuméricos
};

const updateCategories = async () => {
  try {
    // 1. Leer el archivo CSV
    const csvPath = path.join(__dirname, '..', 'docs', 'productostienda.csv');
    const csvContent = await fs.readFile(csvPath, 'utf8');

    // 2. Parsear el CSV y extraer categorías únicas
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const categoriesFromCsv = records
      .map((record: any) => record.CATEGORIA)
      .filter((category: unknown): category is string => 
        typeof category === 'string' && category.trim() !== ''
      );

    const uniqueCategories = [...new Set(categoriesFromCsv.map((c: any) => c.trim()))];

    // 3. Generar el nuevo array de categorías
    const newCategoriesArrayString = `const categories = [\n  { id: 'all', name: 'Todas las categorías', emoji: '🌱', active: false, seoData: null },\n` +
      uniqueCategories.map((category: any) => {
        const id = generateId(category);
        // Asignar un emoji por defecto, se puede mejorar después
        const emoji = '🛍️'; 
        return `  { id: '${id}', name: '${category}', emoji: '${emoji}', active: false, seoData: getSEODataByName('${category}') }`;
      }).join(',\n') + '\n];';

    // 4. Actualizar el archivo page.tsx
    const pagePath = path.join(__dirname, '..', 'src', 'app', 'tienda', 'page.tsx');
    const pageContentLines = (await fs.readFile(pagePath, 'utf8')).split('\n');

    const startIndex = pageContentLines.findIndex((line: string) => line.trim().startsWith('const categories = ['));

    if (startIndex === -1) {
      throw new Error('No se encontró el inicio del array de categorías en page.tsx.');
    }

    // Buscar el final del array
    let endIndex = -1;
    for (let i = startIndex; i < pageContentLines.length; i++) {
      if (pageContentLines[i].trim().endsWith('];')) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
        // Fallback for multi-line array
        for (let i = startIndex + 1; i < pageContentLines.length; i++) {
            if (pageContentLines[i].trim() === '];' || pageContentLines[i].trim() === ']') {
                endIndex = i;
                break;
            }
        }
    }

    if (endIndex === -1) {
      throw new Error('No se encontró el final del array de categorías en page.tsx.');
    }

    // Reconstruimos el archivo
    const newPageContent = [
      ...pageContentLines.slice(0, startIndex),
      newCategoriesArrayString,
      ...pageContentLines.slice(endIndex + 1),
    ].join('\n');

    await fs.writeFile(pagePath, newPageContent, 'utf-8');

    console.log('¡Éxito! Las categorías en src/app/tienda/page.tsx han sido actualizadas.');
    console.log('Categorías encontradas y actualizadas:', uniqueCategories);

  } catch (error) {
    console.error('Error al actualizar las categorías:', error);
  }
}

updateCategories().catch((error: any) => {
  console.error('Error ejecutando el script:', error);
  process.exit(1);
});
