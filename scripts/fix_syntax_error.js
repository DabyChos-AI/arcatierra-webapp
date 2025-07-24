// scripts/fix_syntax_error.js
// Script simple para arreglar errores de sintaxis en productos.ts

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando corrección de errores de sintaxis...');

const productosPath = path.join(__dirname, '../src/data/productos.ts');

try {
  // Leer archivo actual
  let content = fs.readFileSync(productosPath, 'utf8');
  
  console.log('📖 Archivo leído correctamente');
  
  // Crear backup
  const backupPath = `${productosPath}.backup-syntax-fix.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${path.basename(backupPath)}`);
  
  // Encontrar y arreglar patrones problemáticos
  let fixedCount = 0;
  
  // Patrón 1: Comillas dobles extra al inicio: ""GRANOS -> "GRANOS
  const pattern1 = /"categoria":\s*"""([^"]+)"/g;
  content = content.replace(pattern1, (match, category) => {
    fixedCount++;
    console.log(`  🔧 Arreglando triple comilla: """${category}" → "${category}"`);
    return `"categoria": "${category}"`;
  });
  
  // Patrón 2: Comillas dobles al inicio: ""GRANOS -> "GRANOS  
  const pattern2 = /"categoria":\s*""([^"]+)"/g;
  content = content.replace(pattern2, (match, category) => {
    fixedCount++;
    console.log(`  🔧 Arreglando doble comilla: ""${category}" → "${category}"`);
    return `"categoria": "${category}"`;
  });
  
  // Patrón 3: Comillas sin cerrar correctamente
  const pattern3 = /"categoria":\s*"([^"]+)([^"]*?)"/g;
  content = content.replace(pattern3, (match, category, extra) => {
    if (extra && extra.trim()) {
      const cleanCategory = (category + extra).replace(/['"]/g, '').trim();
      fixedCount++;
      console.log(`  🔧 Limpiando categoría: "${category}${extra}" → "${cleanCategory}"`);
      return `"categoria": "${cleanCategory}"`;
    }
    return match;
  });
  
  // Verificar que no hay más errores de sintaxis
  const remainingErrors = content.match(/"categoria":\s*""[^"]*/g);
  if (remainingErrors) {
    console.log('⚠️  Errores restantes encontrados:');
    remainingErrors.forEach(error => {
      console.log(`  - ${error}`);
    });
    
    // Arreglar manualmente cualquier error restante
    content = content.replace(/"categoria":\s*""([^",\s]+)/g, '"categoria": "$1"');
    fixedCount += remainingErrors.length;
  }
  
  // Escribir archivo corregido
  fs.writeFileSync(productosPath, content);
  
  console.log(`\n✅ Corrección completada!`);
  console.log(`🔧 ${fixedCount} errores de sintaxis corregidos`);
  console.log(`💾 Backup guardado: ${path.basename(backupPath)}`);
  
} catch (error) {
  console.error('❌ Error durante la corrección:', error.message);
  process.exit(1);
}
