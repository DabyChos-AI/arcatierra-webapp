// src/data/productos.ts
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  imagen: string;
  productor: string;
  ubicacion: string;
  categoria: string;
  rating: number;
  reviews: number;
  stock: number;
  badges: string[];
  descripcion: string;
  storytelling: string;
  metricas: {
    co2: string;
    agua: string;
    plastico: string;
  };
}

// Datos de ejemplo (fallback) para la tienda y favoritos en caso de que falle la carga del CSV
const productosFallback: Product[] = [
  {
    id: 'espinacas-baby',
    nombre: 'Espinacas Baby Orgánicas',
    precio: 40.00,
    unidad: 'manojo',
    imagen: '/products/espinacas-baby.jpg',
    productor: 'Cooperativa Las Flores',
    ubicacion: 'Tláhuac, CDMX',
    categoria: 'verduras',
    rating: 4.8,
    reviews: 142,
    stock: 15,
    badges: ['100% Orgánico', 'Nuevo'],
    descripcion: 'Espinacas baby tiernas, perfectas para ensaladas y salteados.',
    storytelling: 'Tres generaciones dedicadas a la agricultura orgánica',
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '25L agua',
      plastico: '30g plástico evitado'
    }
  },
  {
    id: 'jitomate-cherry',
    nombre: 'Jitomate Cherry Orgánico',
    precio: 45.00,
    unidad: 'kg',
    imagen: '/products/jitomate-cherry.jpg',
    productor: 'Don Roberto Hernández',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'verduras',
    rating: 4.9,
    reviews: 118,
    stock: 20,
    badges: ['100% Orgánico', 'Promoción'],
    descripcion: 'Jitomates cherry dulces y jugosos, perfectos para ensaladas.',
    storytelling: 'Tres generaciones dedicadas a la agricultura orgánica',
    metricas: {
      co2: '2.5 kg CO₂',
      agua: '35L agua',
      plastico: '30g plástico evitado'
    }
  },
  {
    id: 'lechuga-romana',
    nombre: 'Lechuga Romana Hidropónica',
    precio: 35.00,
    unidad: 'pieza',
    imagen: '/products/lechuga-romana.jpg',
    productor: 'Familia García',
    ubicacion: 'Milpa Alta, CDMX',
    categoria: 'verduras',
    rating: 4.7,
    reviews: 31,
    stock: 12,
    badges: ['100% Orgánico'],
    descripcion: 'Lechuga romana crujiente y fresca, cultivada en sistemas hidropónicos.',
    storytelling: 'Tres generaciones dedicadas a la agricultura orgánica',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '30L agua',
      plastico: '40g plástico evitado'
    }
  },
  {
    id: 'zanahorias-baby',
    nombre: 'Zanahorias Baby',
    precio: 38.00,
    unidad: 'kg',
    imagen: '/products/zanahorias-baby.jpg',
    productor: 'Granja Sustentable CDMX',
    ubicacion: 'Tláhuac, CDMX',
    categoria: 'verduras',
    rating: 4.6,
    reviews: 155,
    stock: 18,
    badges: ['100% Orgánico'],
    descripcion: 'Zanahorias baby dulces y crujientes, perfectas para ensaladas y snacks.',
    storytelling: 'Tres generaciones dedicadas a la agricultura orgánica',
    metricas: {
      co2: '2.2 kg CO₂',
      agua: '28L agua',
      plastico: '35g plástico evitado'
    }
  },
  {
    id: 'queso-artesanal',
    nombre: 'Queso Artesanal Sierra Norte',
    precio: 120.00,
    unidad: 'pieza',
    imagen: '/products/queso-artesanal.jpg',
    productor: 'Lácteos Familia Méndez',
    ubicacion: 'Sierra Norte, Oaxaca',
    categoria: 'lacteos',
    rating: 4.9,
    reviews: 87,
    stock: 10,
    badges: ['Producto Artesanal', 'Sin Conservadores'],
    descripcion: 'Queso artesanal elaborado con leche de vaca criada en pastoreo libre. Textura suave y sabor tradicional.',
    storytelling: 'Elaborado con técnicas tradicionales heredadas por generaciones',
    metricas: {
      co2: '3.5 kg CO₂',
      agua: '45L agua',
      plastico: '50g plástico evitado'
    }
  },
  {
    id: 'frijoles-negros',
    nombre: 'Frijol Negro Orgánico',
    precio: 65.00,
    unidad: 'kg',
    imagen: '/products/frijoles-negros.jpg',
    productor: 'Cooperativa Campesina Chiapas',
    ubicacion: 'Chiapas, México',
    categoria: 'legumbres',
    rating: 4.8,
    reviews: 112,
    stock: 25,
    badges: ['100% Orgánico', 'Comercio Justo'],
    descripcion: 'Frijol negro cultivado sin pesticidas ni fertilizantes químicos. Rico en proteínas y fibra.',
    storytelling: 'Cultivado por familias indígenas usando métodos ancestrales',
    metricas: {
      co2: '1.8 kg CO₂',
      agua: '20L agua',
      plastico: '45g plástico evitado'
    }
  },
  {
    id: 'miel-pura',
    nombre: 'Miel Pura Multifloral',
    precio: 180.00,
    unidad: 'botella',
    imagen: '/products/miel-multifloral.jpg',
    productor: 'Apiario Don Julián',
    ubicacion: 'Morelos, México',
    categoria: 'endulzantes',
    rating: 5.0,
    reviews: 75,
    stock: 15,
    badges: ['100% Natural', 'Sin Procesar'],
    descripcion: 'Miel pura de abeja, recolectada de flores silvestres. Sin pasteurizar para conservar sus propiedades.',
    storytelling: 'Producción responsable que protege a las abejas y su hábitat',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '15L agua',
      plastico: '60g plástico evitado'
    }
  },
  {
    id: 'aguacate-hass',
    nombre: 'Aguacate Hass Orgánico',
    precio: 75.00,
    unidad: 'kg',
    imagen: '/products/aguacate-hass.jpg',
    productor: 'Huertos Michoacanos',
    ubicacion: 'Uruapan, Michoacán',
    categoria: 'frutas',
    rating: 4.9,
    reviews: 128,
    stock: 30,
    badges: ['Orgánico Certificado', 'Cultivado Localmente'],
    descripcion: 'Aguacate Hass orgánico, rico en grasas saludables y perfecto para guacamole.',
    storytelling: 'Cultivado en tierras de tradición aguacatera por más de 40 años',
    metricas: {
      co2: '1.9 kg CO₂',
      agua: '25L agua',
      plastico: '35g plástico evitado'
    }
  },
  {
    id: 'chile-serrano',
    nombre: 'Chile Serrano Fresco',
    precio: 45.00,
    unidad: 'kg',
    imagen: '/products/chile-serrano.jpg',
    productor: 'Huerta Don Pedro',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'chiles',
    rating: 4.6,
    reviews: 89,
    stock: 25,
    badges: ['Picante', 'Fresco'],
    descripcion: 'Chile serrano fresco con picor medio-alto, ideal para salsas y platillos tradicionales.',
    storytelling: 'Cultivado en chinampas usando técnicas ancestrales',
    metricas: {
      co2: '1.2 kg CO₂',
      agua: '15L agua',
      plastico: '30g plástico evitado'
    }
  },
  {
    id: 'cilantro-fresco',
    nombre: 'Cilantro Fresco Orgánico',
    precio: 15.00,
    unidad: 'manojo',
    imagen: '/products/cilantro-fresco.jpg',
    productor: 'Huerta Xochimilco',
    ubicacion: 'Xochimilco, CDMX',
    categoria: 'hierbas',
    rating: 4.7,
    reviews: 76,
    stock: 40,
    badges: ['100% Orgánico', 'Recién Cortado'],
    descripcion: 'Cilantro fresco orgánico, aromático y con sabor intenso para tus platillos.',
    storytelling: 'Cultivado en chinampas con agua de manantial natural',
    metricas: {
      co2: '0.8 kg CO₂',
      agua: '10L agua',
      plastico: '20g plástico evitado'
    }
  },
  {
    id: 'leche-cabra',
    nombre: 'Leche de Cabra Pasteurizada',
    precio: 65.00,
    unidad: 'litro',
    imagen: '/products/leche-cabra.jpg',
    productor: 'Rancho Las Cabras',
    ubicacion: 'Querétaro, México',
    categoria: 'lacteos',
    rating: 4.8,
    reviews: 65,
    stock: 18,
    badges: ['Pasteurizada', 'Sin Hormonas'],
    descripcion: 'Leche de cabra fresca pasteurizada, más digestible que la leche de vaca y rica en nutrientes.',
    storytelling: 'Cabras alimentadas con pastos naturales en libertad',
    metricas: {
      co2: '2.8 kg CO₂',
      agua: '40L agua',
      plastico: '45g plástico evitado'
    }
  },
  {
    id: 'manzanas-rojas',
    nombre: 'Manzanas Rojas Orgánicas',
    precio: 55.00,
    unidad: 'kg',
    imagen: '/products/manzanas-rojas.jpg',
    productor: 'Huertos de la Sierra',
    ubicacion: 'Chihuahua, México',
    categoria: 'frutas',
    rating: 4.7,
    reviews: 93,
    stock: 35,
    badges: ['Orgánico Certificado', 'Sin Ceras'],
    descripcion: 'Manzanas rojas orgánicas, dulces y crujientes. Perfectas como snack saludable.',
    storytelling: 'Cultivadas en huertos orgánicos de altura con agua de montaña',
    metricas: {
      co2: '2.1 kg CO₂',
      agua: '35L agua',
      plastico: '40g plástico evitado'
    }
  },
  {
    id: 'miel-abeja',
    nombre: 'Miel Pura de Abeja',
    precio: 150.00,
    unidad: 'frasco',
    imagen: '/products/miel-abeja.jpg',
    productor: 'Colmenas Don Pascual',
    ubicacion: 'Morelos, México',
    categoria: 'endulzantes',
    rating: 5.0,
    reviews: 121,
    stock: 22,
    badges: ['100% Natural', 'Sin Filtrar'],
    descripcion: 'Miel pura de abeja sin procesar. Conserva todas sus propiedades medicinales y sabor natural.',
    storytelling: 'Producida por abejas libres de pesticidas y antibioticos',
    metricas: {
      co2: '1.7 kg CO₂',
      agua: '12L agua',
      plastico: '55g plástico evitado'
    }
  }
];

// Los productos de queso fresco y salsa molcajeteada fueron eliminados por solicitud del usuario

// Importación de datos desde CSV cuando estamos en el lado del servidor
// En el cliente, usamos el array de productos fallback
let productos: Product[] = productosFallback;

// Función para cargar los datos desde el CSV
export async function cargarProductosDesdeCSV() {
  // TEMPORAL: Siempre devolver los datos de fallback mientras migramos a PostgreSQL
  // Esto evita los errores de parseo del CSV
  console.log('Usando datos de fallback temporalmente mientras migramos a PostgreSQL');
  return productosFallback;
  
  /* 
  // CÓDIGO ORIGINAL - Comentado temporalmente
  // Verificar si estamos en el servidor
  if (typeof window === 'undefined') {
    try {
      // Solo en el servidor podemos importar dinámicamente
      const { cargarProductosCSV, convertirAProductos } = await import('../utils/csv-loader');
      const productosCSV = cargarProductosCSV();
      const productosConvertidos = convertirAProductos(productosCSV);
      
      if (productosConvertidos && productosConvertidos.length > 0) {
        console.log(`Cargados ${productosConvertidos.length} productos desde CSV`);
        productos = productosConvertidos;
        return productosConvertidos;
      } else {
        console.warn('No se pudieron cargar productos desde CSV. Usando datos de fallback.');
        return productosFallback;
      }
    } catch (error) {
      console.error('Error al cargar productos desde CSV:', error);
      return productosFallback;
    }
  }
  
  return productos;
  */
}

// Exportar productos
export { productos };
