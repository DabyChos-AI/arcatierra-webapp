const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'docs', 'tiendaSEO.csv');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }

  const lines = data.split('\n');
  console.log('Primeras 5 líneas del archivo tiendaSEO.csv:');
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    console.log(`Línea ${i + 1}: ${lines[i]}`);
  }
  console.log('Total de líneas:', lines.length);
});
