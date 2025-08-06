import * as fs from 'fs';
import * as path from 'path';
import { productos } from '../src/data/productos'; // Import directly
import { Producto } from '../src/types'; // Import the canonical type

// Define the output directory
const outputDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Type assertion to ensure products are treated as Producto[]
const productList = productos as Producto[];

// List 1: Products without a photo
const productsWithoutPhoto = productList.filter(
  (p) => !p.imagenes || p.imagenes.length === 0 || p.imagenes[0] === ''
);
const noPhotoContent = productsWithoutPhoto
  .map((p) => `${p.id} - ${p.nombre}`)
  .join('\n');
fs.writeFileSync(
  path.join(outputDir, 'productos-sin-foto.txt'),
  noPhotoContent
);

// List 2: Products without a description
const productsWithoutDescription = productList.filter(
  (p) => !p.descripcion || p.descripcion.trim() === ''
);
const noDescriptionContent = productsWithoutDescription
  .map((p) => `${p.id} - ${p.nombre}`)
  .join('\n');
fs.writeFileSync(
  path.join(outputDir, 'productos-sin-descripcion.txt'),
  noDescriptionContent
);

// List 3: Products without traceability
const productsWithoutTraceability = productList.filter(
  (p) =>
    (!p.trazabilidad?.agricultor?.nombre || p.trazabilidad.agricultor.nombre.trim() === '') &&
    (!p.trazabilidad?.origen?.region || p.trazabilidad.origen.region.trim() === '')
);
const noTraceabilityContent = productsWithoutTraceability
  .map((p) => `${p.id} - ${p.nombre}`)
  .join('\n');
fs.writeFileSync(
  path.join(outputDir, 'productos-sin-trazabilidad.txt'),
  noTraceabilityContent
);

// List 4: Consolidated Report
const consolidatedData = productList.map((p) => {
  const hasPhoto = !p.imagenes || p.imagenes.length === 0 || p.imagenes[0] === '' ? 'NO' : 'SI';
  const hasDescription = !p.descripcion || p.descripcion.trim() === '' ? 'NO' : 'SI';
  const hasTraceability =
    (!p.trazabilidad?.agricultor?.nombre ||
      p.trazabilidad.agricultor.nombre.trim() === '') &&
    (!p.trazabilidad?.origen?.region || p.trazabilidad.origen.region.trim() === '')
      ? 'NO'
      : 'SI';
  return `${p.id},"${p.nombre}",${hasPhoto},${hasDescription},${hasTraceability}`;
});

const csvHeader = 'ID,Nombre,TieneFoto,TieneDescripcion,TieneTrazabilidad\n';
const csvContent = csvHeader + consolidatedData.join('\n');
fs.writeFileSync(path.join(outputDir, 'reporte-consolidado.txt'), csvContent);

console.log('Reportes generados exitosamente en la carpeta /reports');

