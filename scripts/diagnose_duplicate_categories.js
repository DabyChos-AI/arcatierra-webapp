// scripts/diagnose_duplicate_categories.js
const fs = require('fs');
const path = require('path');

// Basic slugify function for diagnosis
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-'); // replace multiple - with single -
}

// Function to parse CSV
function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Remove BOM character if present
    const headerLine = lines[0].charCodeAt(0) === 0xFEFF ? lines[0].substring(1) : lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
    const categoryIndex = headers.findIndex(h => h.toUpperCase() === 'CATEGORIA');

    if (categoryIndex === -1) {
        console.error('Error: "CATEGORIA" column not found in CSV.');
        return [];
    }

    const categories = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values[categoryIndex]) {
            categories.push(values[categoryIndex].trim().replace(/"/g, ''));
        }
    }
    return categories;
}

// Main logic
try {
    const csvPath = path.join(__dirname, '../docs/productostienda.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const categories = parseCSV(csvContent);
    
    const slugMap = {};
    
    categories.forEach(category => {
        if (!category) return;
        const slug = slugify(category);
        if (!slugMap[slug]) {
            slugMap[slug] = new Set();
        }
        slugMap[slug].add(category);
    });
    
    console.log('--- Category Duplication Report ---');
    let duplicatesFound = false;
    
    Object.keys(slugMap).forEach(slug => {
        const originalNames = Array.from(slugMap[slug]);
        if (originalNames.length > 1) {
            duplicatesFound = true;
            console.log(`\n[!] Duplicate slug found: "${slug}"`);
            console.log('    Original names:');
            originalNames.forEach(name => {
                console.log(`      - "${name}"`);
            });
        }
    });
    
    if (!duplicatesFound) {
        console.log('\nNo duplicate slugs found after normalization.');
    }
    
    console.log('\n--- End of Report ---');

} catch (error) {
    console.error('An error occurred during diagnosis:', error);
}
