const fs = require('fs');
const path = require('path');

// Función para parsear CSV a JSON
const parseCSV = (data) => {
  const lines = data.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split(',').map(value => value.trim());
    if (line.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = line[index];
      });
      result.push(obj);
    }
  }

  return result;
};

// Leer y parsear trazabili.csv
const trazabiliPath = path.join(__dirname, '..', 'docs', 'trazabili.csv');
fs.readFile(trazabiliPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer trazabili.csv:', err);
    return;
  }

  const trazabiliData = parseCSV(data);
  console.log('Datos de trazabili.csv (primeros 3 registros):', JSON.stringify(trazabiliData.slice(0, 3), null, 2));
  console.log('Total de registros en trazabili.csv:', trazabiliData.length);

  // Escribir datos parseados a un archivo JSON para referencia futura
  fs.writeFileSync(path.join(__dirname, 'trazabili.json'), JSON.stringify(trazabiliData, null, 2));
});

// Leer y parsear tiendaSEO.csv
const tiendaSEOPath = path.join(__dirname, '..', 'docs', 'tiendaSEO.csv');
fs.readFile(tiendaSEOPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer tiendaSEO.csv:', err);
    return;
  }

  const tiendaSEOData = parseCSV(data);
  console.log('Datos de tiendaSEO.csv (primeros 3 registros):', JSON.stringify(tiendaSEOData.slice(0, 3), null, 2));
  console.log('Total de registros en tiendaSEO.csv:', tiendaSEOData.length);

  // Escribir datos parseados a un archivo JSON para referencia futura
  fs.writeFileSync(path.join(__dirname, 'tiendaSEO.json'), JSON.stringify(tiendaSEOData, null, 2));
});
