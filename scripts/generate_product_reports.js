"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const productos_1 = require("../src/data/productos"); // Import directly
// Define the output directory
const outputDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
// Type assertion to ensure products are treated as Producto[]
const productList = productos_1.productos;
// List 1: Products without a photo
const productsWithoutPhoto = productList.filter((p) => !p.imagenes || p.imagenes.length === 0 || p.imagenes[0] === '');
const noPhotoContent = productsWithoutPhoto
    .map((p) => `${p.id} - ${p.nombre}`)
    .join('\n');
fs.writeFileSync(path.join(outputDir, 'productos-sin-foto.txt'), noPhotoContent);
// List 2: Products without a description
const productsWithoutDescription = productList.filter((p) => !p.descripcion || p.descripcion.trim() === '');
const noDescriptionContent = productsWithoutDescription
    .map((p) => `${p.id} - ${p.nombre}`)
    .join('\n');
fs.writeFileSync(path.join(outputDir, 'productos-sin-descripcion.txt'), noDescriptionContent);
// List 3: Products without traceability
const productsWithoutTraceability = productList.filter((p) => {
    var _a, _b, _c, _d;
    return (!((_b = (_a = p.trazabilidad) === null || _a === void 0 ? void 0 : _a.agricultor) === null || _b === void 0 ? void 0 : _b.nombre) || p.trazabilidad.agricultor.nombre.trim() === '') &&
        (!((_d = (_c = p.trazabilidad) === null || _c === void 0 ? void 0 : _c.origen) === null || _d === void 0 ? void 0 : _d.region) || p.trazabilidad.origen.region.trim() === '');
});
const noTraceabilityContent = productsWithoutTraceability
    .map((p) => `${p.id} - ${p.nombre}`)
    .join('\n');
fs.writeFileSync(path.join(outputDir, 'productos-sin-trazabilidad.txt'), noTraceabilityContent);
// List 4: Consolidated Report
const consolidatedData = productList.map((p) => {
    var _a, _b, _c, _d;
    const hasPhoto = !p.imagenes || p.imagenes.length === 0 || p.imagenes[0] === '' ? 'NO' : 'SI';
    const hasDescription = !p.descripcion || p.descripcion.trim() === '' ? 'NO' : 'SI';
    const hasTraceability = (!((_b = (_a = p.trazabilidad) === null || _a === void 0 ? void 0 : _a.agricultor) === null || _b === void 0 ? void 0 : _b.nombre) ||
        p.trazabilidad.agricultor.nombre.trim() === '') &&
        (!((_d = (_c = p.trazabilidad) === null || _c === void 0 ? void 0 : _c.origen) === null || _d === void 0 ? void 0 : _d.region) || p.trazabilidad.origen.region.trim() === '')
        ? 'NO'
        : 'SI';
    return `${p.id},"${p.nombre}",${hasPhoto},${hasDescription},${hasTraceability}`;
});
const csvHeader = 'ID,Nombre,TieneFoto,TieneDescripcion,TieneTrazabilidad\n';
const csvContent = csvHeader + consolidatedData.join('\n');
fs.writeFileSync(path.join(outputDir, 'reporte-consolidado.txt'), csvContent);
console.log('Reportes generados exitosamente en la carpeta /reports');
