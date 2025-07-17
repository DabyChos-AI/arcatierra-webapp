import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Interfaces para diferentes formatos de CSV
export interface BaseCSVData {
  pageSlug: string;
  pageTitle: string;
  pageDescription: string;
  headerTitle: string;
  headerImage?: string;
}

export interface PrensaCSVData extends BaseCSVData {
  articles: {
    title: string;
    url: string;
    source: string;
    date: string;
    excerpt?: string;
    image?: string;
  }[];
}

export interface RestaurantesCSVData extends BaseCSVData {
  services: string[];
  processList: string[];
  contactInfo: string;
}

export interface CateringCSVData extends BaseCSVData {
  subtitle: string;
  description: string;
  experience: string;
  clients: string[];
  menuTypes: {
    title: string;
    description: string;
  }[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  }[];
}

/**
 * Analiza un archivo CSV de prensa y lo convierte al formato interno
 */
export function parsePrensaCSV(filePath: string): PrensaCSVData {
  try {
    // Leer el archivo como UTF-8
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parsear el CSV
    const records = parse(fileContent, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
    });

    // Extraer información básica de la página
    const pageSlug = 'prensa'; // Podemos extraerlo del nombre del archivo o de los datos
    const pageTitle = getValueOrDefault(records, 1, 1, 'Prensa - Arca Tierra');
    const pageDescription = getValueOrDefault(records, 2, 1, 'Cobertura mediática de Arca Tierra, agricultura regenerativa y proyectos de sostenibilidad');
    const headerTitle = getValueOrDefault(records, 1, 1, 'Prensa');

    // Recopilar artículos
    const articles: PrensaCSVData['articles'] = [];
    
    // Buscar artículos a partir de la línea que contiene URLs
    let currentIndex = 3; // Comenzamos después de los metadatos de la página
    
    while (currentIndex < records.length) {
      // Si encontramos una URL
      if (records[currentIndex] && 
          records[currentIndex][0] && 
          (records[currentIndex][0].startsWith('http://') || 
           records[currentIndex][0].startsWith('https://'))) {
        
        const url = records[currentIndex][0];
        const title = records[currentIndex+1] ? records[currentIndex+1][0] : '';
        const source = records[currentIndex+2] ? records[currentIndex+2][0] : '';
        const date = records[currentIndex+3] ? records[currentIndex+3][0] : '';
        const excerpt = records[currentIndex+4] ? records[currentIndex+4][0] : '';
        
        articles.push({
          url,
          title,
          source,
          date,
          excerpt,
          image: '' // Podemos dejarlo vacío o buscar una imagen en el CSV
        });
        
        currentIndex += 5; // Saltar a la siguiente entrada potencial
      } else {
        currentIndex++; // Avanzar a la siguiente línea
      }
    }

    return {
      pageSlug,
      pageTitle,
      pageDescription,
      headerTitle,
      articles
    };
  } catch (error) {
    console.error('Error al parsear el CSV de prensa:', error);
    throw error;
  }
}

// Función auxiliar para obtener un valor del CSV o un valor por defecto
function getValueOrDefault(records: any[][], row: number, col: number, defaultValue: string): string {
  if (records[row] && records[row][col]) {
    return records[row][col];
  }
  return defaultValue;
}

/**
 * Analiza un archivo CSV de restaurantes y lo convierte al formato interno
 */
export function parseRestaurantesCSV(filePath: string): RestaurantesCSVData {
  try {
    // Leer el archivo como UTF-8
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parsear el CSV
    const records = parse(fileContent, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
    });

    // Extraer información básica de la página
    const pageSlug = 'servicio-restaurantes'; // Slug para la URL
    const pageTitle = getValueOrDefault(records, 1, 1, 'Servicio a Restaurantes - Arca Tierra');
    const pageDescription = 'Proveeduría de productos agroecológicos para restaurantes en CDMX';
    const headerTitle = getValueOrDefault(records, 1, 1, 'Servicio a Restaurantes');
    
    // Extraer servicios y procesos
    const services: string[] = [];
    const processList: string[] = [];
    let contactInfo = '';
    
    // Buscar servicios, procesos y contacto
    // Buscar sección "¿Qué ofrecemos?"
    let ofrecemosIndex = -1;
    for (let i = 0; i < records.length; i++) {
      if (records[i] && records[i][0] === '¿Qué ofrecemos?') {
        ofrecemosIndex = i;
        break;
      }
    }
    
    // Extraer servicios si encontramos la sección
    if (ofrecemosIndex >= 0) {
      let currentIndex = ofrecemosIndex + 1;
      while (currentIndex < records.length && 
             records[currentIndex] && 
             records[currentIndex][0] && 
             records[currentIndex][0].includes('??')) {
        // Limpiamos los símbolos de viñeta (??) y espacios
        let service = records[currentIndex][0].replace(/\?\?\s*/, '');
        services.push(service);
        currentIndex++;
      }
    }
    
    // Buscar sección "Cómo funciona"
    let procesoIndex = -1;
    for (let i = 0; i < records.length; i++) {
      if (records[i] && records[i][0] && records[i][0].includes('Cómo funciona')) {
        procesoIndex = i;
        break;
      }
    }
    
    // Extraer procesos si encontramos la sección
    if (procesoIndex >= 0) {
      let currentIndex = procesoIndex + 1;
      while (currentIndex < records.length && 
             records[currentIndex] && 
             records[currentIndex][0] && 
             !records[currentIndex][0].includes('¿Te interesa')) {
        // Saltamos líneas vacías
        if (records[currentIndex][0].trim()) {
          processList.push(records[currentIndex][0]);
        }
        currentIndex++;
      }
    }
    
    // Buscar información de contacto
    let contactIndex = -1;
    for (let i = 0; i < records.length; i++) {
      if (records[i] && records[i][0] && records[i][0].includes('¿Te interesa sumarte')) {
        contactIndex = i;
        break;
      }
    }
    
    if (contactIndex >= 0) {
      // Combinar las siguientes líneas como info de contacto
      let contactLines: string[] = [];
      let currentIndex = contactIndex + 1;
      while (currentIndex < records.length && 
             records[currentIndex] && 
             currentIndex < contactIndex + 4) {
        if (records[currentIndex][0] && records[currentIndex][0].trim()) {
          contactLines.push(records[currentIndex][0]);
        }
        currentIndex++;
      }
      contactInfo = contactLines.join(' ');
    }
    
    return {
      pageSlug,
      pageTitle,
      pageDescription,
      headerTitle,
      services,
      processList,
      contactInfo
    };
  } catch (error) {
    console.error('Error al parsear el CSV de restaurantes:', error);
    throw error;
  }
}

// Función para validar los datos extraídos
export function validateCSVData(data: BaseCSVData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.pageSlug) errors.push('Falta page_slug');
  if (!data.pageTitle) errors.push('Falta page_title');
  if (!data.pageDescription) errors.push('Falta page_description');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Función general para analizar cualquier tipo de CSV
export function parseCSV(filePath: string, type: 'prensa' | 'restaurantes' | 'catering' | 'generic'): BaseCSVData {
  switch (type) {
    case 'prensa':
      return parsePrensaCSV(filePath);
    case 'restaurantes':
      return parseRestaurantesCSV(filePath);
    case 'catering':
      // Implementar cuando sea necesario
      throw new Error('Formato de catering no implementado aún');
    case 'generic':
    default:
      throw new Error('Formato genérico no implementado aún');
  }
}
