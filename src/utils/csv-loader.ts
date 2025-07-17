// src/utils/csv-loader.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Product } from '@/data/productos';

// Interfaz para los datos en el CSV de tienda
export interface ProductoCSV {
  id: string;
  nombre: string;
  categoria: string;
  precio: string;
  imagen: string;
  descripcion: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Interfaz para los datos en el CSV de experiencias
export interface ExperienciaCSV {
  id: string;
  nombre: string;
  categoria: string;
  precio: string;
  imagen: string;
  descripcion: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Lee y parsea el archivo CSV de productos
 */
export function cargarProductosCSV(): ProductoCSV[] {
  try {
    const csvFilePath = path.join(process.cwd(), 'src/data/tienda.csv');
    
    // Si el archivo no existe, devolver array vacío
    if (!fs.existsSync(csvFilePath)) {
      console.warn('Archivo CSV de productos no encontrado. Devolviendo array vacío.');
      return [];
    }
    
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Omitir más líneas para asegurar que saltamos todos los metadatos/encabezados (20 líneas)
    const lineas = fileContent.split('\n');
    const datosRelevantes = lineas.slice(20).join('\n');
    
    // Especificar delimiter explícitamente (coma) y otros parámetros para hacerlo más robusto
    const records = parse(datosRelevantes, {
      columns: ['id', 'nombre', 'categoria', 'precio', 'imagen', 'descripcion', 'seoTitle', 'seoDescription'],
      delimiter: ',',
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // Permitir diferente número de columnas
    });
    
    const filteredRecords = records.filter((record: any) => record.id && record.nombre);
    
    // Si no hay registros válidos, devolver array vacío para evitar errores
    if (!filteredRecords.length) {
      console.warn('No se encontraron registros válidos en el CSV. Devolviendo array vacío.');
      return [];
    }
    
    return filteredRecords;
  } catch (error) {
    console.error('Error al cargar el archivo CSV de productos:', error);
    return [];
  }
}

/**
 * Lee y parsea el archivo CSV de experiencias
 */
export function cargarExperienciasCSV(): ExperienciaCSV[] {
  try {
    const csvFilePath = path.join(process.cwd(), 'src/data/experiencias.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Omitir las primeras líneas que son metadatos/encabezados (10 líneas)
    const lineas = fileContent.split('\n');
    const datosRelevantes = lineas.slice(10).join('\n');
    
    const records = parse(datosRelevantes, {
      columns: ['id', 'nombre', 'categoria', 'precio', 'imagen', 'descripcion', 'seoTitle', 'seoDescription'],
      skip_empty_lines: true,
      trim: true,
    });
    
    return records.filter((record: any) => record.id && record.nombre);
  } catch (error) {
    console.error('Error al cargar el archivo CSV de experiencias:', error);
    return [];
  }
}

/**
 * Convierte los datos del CSV de productos al formato de la interfaz Product
 */
export function convertirAProductos(productosCSV: ProductoCSV[]): Product[] {
  return productosCSV.map(csv => ({
    id: csv.id,
    nombre: csv.nombre,
    precio: parseFloat(csv.precio.replace('$', '').replace(',', '')),
    unidad: 'unidad', // Por defecto, actualizar según disponibilidad
    imagen: csv.imagen,
    productor: 'Arca Tierra', // Por defecto, actualizar según disponibilidad
    ubicacion: 'CDMX', // Por defecto, actualizar según disponibilidad
    categoria: csv.categoria.toLowerCase(),
    rating: 4.5, // Por defecto, actualizar según disponibilidad
    reviews: 0, // Por defecto, actualizar según disponibilidad
    stock: 10, // Por defecto, actualizar según disponibilidad
    badges: [], // Por defecto, actualizar según disponibilidad
    descripcion: csv.descripcion,
    storytelling: '', // Por defecto, actualizar según disponibilidad
    metricas: {
      co2: 'N/A',
      agua: 'N/A',
      plastico: 'N/A'
    }
  }));
}
