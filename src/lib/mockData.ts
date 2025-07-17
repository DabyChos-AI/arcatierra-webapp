// lib/mockData/mockData.ts

// Mock de Productores
export const mockProducers: Producer[] = [
  {
    id: '1',
    name: 'Don Roberto Hernández',
    slug: 'don-roberto',
    location: 'Xochimilco, CDMX',
    story: 'Cultivo en chinampas desde hace 30 años con métodos ancestrales',
    profile_image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=400&h=400&fit=crop',
    total_co2_saved: 1250.5,
    hectares_cultivated: 2.5,
    certifications: ['Orgánico', 'Comercio Justo'],
    active: true
  },
  {
    id: '2',
    name: 'Familia García',
    slug: 'familia-garcia',
    location: 'Milpa Alta, CDMX',
    story: 'Tres generaciones dedicadas a la agricultura orgánica',
    profile_image: 'https://images.unsplash.com/photo-1595587637401-83ff822d3caf?w=400&h=400&fit=crop',
    total_co2_saved: 890.3,
    hectares_cultivated: 1.8,
    certifications: ['Orgánico'],
    active: true
  },
  {
    id: '3',
    name: 'Cooperativa Las Flores',
    slug: 'cooperativa-flores',
    location: 'Tlalpan, CDMX',
    story: 'Mujeres emprendedoras cultivando con amor y respeto por la tierra',
    profile_image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop',
    total_co2_saved: 2100.0,
    hectares_cultivated: 3.2,
    certifications: ['Orgánico', 'Comercio Justo', 'Empresa B'],
    active: true
  },
  {
    id: '4',
    name: 'Apiario Las Abejas Felices',
    slug: 'apiario-abejas',
    location: 'Xochimilco, CDMX',
    story: 'Producimos miel pura de las flores de las chinampas',
    profile_image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop',
    total_co2_saved: 450.0,
    hectares_cultivated: 0.5,
    certifications: ['Orgánico'],
    active: true
  }
];    

// Mock de Productos
export const mockProducts: Product[] = [
  // Verduras
  {
    id: '1',
    sku: 'VEG-001',
    name: 'Jitomate Cherry Orgánico',
    slug: 'jitomate-cherry-organico',
    description: 'Jitomates cherry dulces y jugosos, cultivados sin pesticidas en las chinampas de Xochimilco. Perfectos para ensaladas y snacks saludables.',
    price: 45.00,
    unit: 'kg',
    min_quantity: 0.5,
    co2_impact: 2.5,
    water_impact: 50,
    plastic_saved: 15,
    category: 'verduras',
    subcategory: 'jitomates',
    tags: ['orgánico', 'local', 'temporada'],
    images: [
      { url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&h=800&fit=crop', alt: 'Jitomates Cherry' }
    ],
    producer_id: '1',
    producer: mockProducers[0],
    stock: 50,
    featured: true,
    active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    sku: 'VEG-002',
    name: 'Lechuga Romana Hidropónica',
    slug: 'lechuga-romana-hidroponica',
    description: 'Lechuga romana crujiente y fresca, cultivada en sistemas hidropónicos sustentables. Rica en nutrientes y libre de pesticidas.',
    price: 35.00,
    unit: 'pieza',
    co2_impact: 1.8,
    water_impact: 30,
    plastic_saved: 20,
    category: 'verduras',
    subcategory: 'hojas verdes',
    tags: ['hidropónico', 'ensaladas'],
    images: [
      { url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&h=800&fit=crop', alt: 'Lechuga Romana' }
    ],
    producer_id: '2',
    producer: mockProducers[1],
    stock: 75,
    active: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    sku: 'VEG-003',
    name: 'Espinacas Baby Orgánicas',
    slug: 'espinacas-baby-organicas',
    description: 'Espinacas baby tiernas, perfectas para ensaladas y smoothies verdes. Cosechadas en su punto óptimo de frescura.',
    price: 40.00,
    unit: 'manojo',
    co2_impact: 2.0,
    water_impact: 35,
    plastic_saved: 18,
    category: 'verduras',
    subcategory: 'hojas verdes',
    tags: ['superalimento', 'baby vegetables'],
    images: [
      { url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&h=800&fit=crop', alt: 'Espinacas Baby' }
    ],
    producer_id: '3',
    producer: mockProducers[2],
    stock: 60,
    featured: true,
    active: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    sku: 'VEG-004',
    name: 'Zanahoria Orgánica',
    slug: 'zanahoria-organica',
    description: 'Zanahorias dulces y crujientes, cultivadas en suelo rico en nutrientes. Excelente fuente de betacarotenos.',
    price: 30.00,
    unit: 'kg',
    co2_impact: 1.5,
    water_impact: 25,
    plastic_saved: 12,
    category: 'verduras',
    subcategory: 'raíces',
    tags: ['orgánico', 'vitamina A'],
    images: [
      { url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&h=800&fit=crop', alt: 'Zanahorias' }
    ],
    producer_id: '1',
    producer: mockProducers[0],
    stock: 100,
    active: true
  },
  
  // Frutas
  {
    id: '5',
    sku: 'FRU-001',
    name: 'Fresas Orgánicas',
    slug: 'fresas-organicas',
    description: 'Fresas dulces y aromáticas, cultivadas sin químicos. Perfectas para postres o disfrutar solas.',
    price: 85.00,
    unit: 'kg',
    co2_impact: 3.5,
    water_impact: 70,
    plastic_saved: 25,
    category: 'frutas',
    subcategory: 'berries',
    tags: ['temporada', 'antioxidantes'],
    images: [
      { url: 'https://images.unsplash.com/photo-1543528176-61b239494933?w=800&h=800&fit=crop', alt: 'Fresas' }
    ],
    producer_id: '2',
    producer: mockProducers[1],
    stock: 30,
    featured: true,
    active: true,
    created_at: new Date().toISOString()
  },
  
  // Despensa
  {
    id: '6',
    sku: 'DES-001',
    name: 'Miel de Abeja Multiflora',
    slug: 'miel-abeja-multiflora',
    description: 'Miel 100% pura de abejas libres en las chinampas. Rica en antioxidantes y propiedades antibacterianas naturales.',
    price: 180.00,
    unit: '500g',
    co2_impact: 5.0,
    water_impact: 100,
    plastic_saved: 30,
    category: 'despensa',
    subcategory: 'miel',
    tags: ['natural', 'antibacterial', 'energético'],
    images: [
      { url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop', alt: 'Miel de Abeja' }
    ],
    producer_id: '4',
    producer: mockProducers[3],
    stock: 40,
    featured: true,
    active: true
  },
  {
    id: '7',
    sku: 'DES-002',
    name: 'Café de Altura Orgánico',
    slug: 'cafe-altura-organico',
    description: 'Café arábica de altura con notas de chocolate y caramelo. Tostado medio, perfecto para espresso o filtrado.',
    price: 280.00,
    unit: 'kg',
    co2_impact: 8.0,
    water_impact: 150,
    plastic_saved: 40,
    category: 'despensa',
    subcategory: 'café',
    tags: ['gourmet', 'arabica', 'comercio justo'],
    images: [
      { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop', alt: 'Café de Altura' }
    ],
    producer_id: '3',
    producer: mockProducers[2],
    stock: 25,
    active: true
  },
  
  // Lácteos
  {
    id: '8',
    sku: 'LAC-001',
    name: 'Queso Oaxaca Artesanal',
    slug: 'queso-oaxaca-artesanal',
    description: 'Queso Oaxaca tradicional, elaborado con leche de vacas de libre pastoreo. Perfecto para quesadillas y gratinados.',
    price: 95.00,
    unit: '250g',
    co2_impact: 4.5,
    water_impact: 80,
    plastic_saved: 20,
    category: 'lacteos',
    subcategory: 'quesos',
    tags: ['artesanal', 'tradicional'],
    images: [
      { url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&h=800&fit=crop', alt: 'Queso Oaxaca' }
    ],
    producer_id: '2',
    producer: mockProducers[1],
    stock: 35,
    active: true
  },
  
  // Proteínas
  {
    id: '9',
    sku: 'PRO-001',
    name: 'Huevos de Rancho (Docena)',
    slug: 'huevos-rancho-docena',
    description: 'Huevos frescos de gallinas de libre pastoreo. Yemas de color naranja intenso, ricos en omega-3.',
    price: 85.00,
    unit: 'docena',
    co2_impact: 3.5,
    water_impact: 60,
    plastic_saved: 25,
    category: 'proteinas',
    subcategory: 'huevos',
    tags: ['libre pastoreo', 'omega-3'],
    images: [
      { url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=800&fit=crop', alt: 'Huevos de Rancho' }
    ],
    producer_id: '1',
    producer: mockProducers[0],
    stock: 50,
    featured: true,
    active: true
  },
  
  // Más productos...
  {
    id: '10',
    sku: 'VEG-005',
    name: 'Calabaza Italiana',
    slug: 'calabaza-italiana',
    description: 'Calabazas italianas tiernas, ideales para sopas, guisados o asadas. Cultivadas de forma tradicional.',
    price: 28.00,
    unit: 'kg',
    co2_impact: 1.2,
    water_impact: 20,
    plastic_saved: 10,
    category: 'verduras',
    subcategory: 'calabazas',
    tags: ['versátil', 'temporada'],
    images: [
      { url: 'https://images.unsplash.com/photo-1563288525-8f1ee0f874a8?w=800&h=800&fit=crop', alt: 'Calabaza Italiana' }
    ],
    producer_id: '3',
    producer: mockProducers[2],
    stock: 80,
    active: true
  }
];

// Mock de Categorías
export const mockCategories = [
  { id: 'verduras', name: 'Verduras', icon: '🥬' },
  { id: 'frutas', name: 'Frutas', icon: '🍎' },
  { id: 'despensa', name: 'Despensa', icon: '🏺' },
  { id: 'lacteos', name: 'Lácteos', icon: '🥛' },
  { id: 'proteinas', name: 'Proteínas', icon: '🥚' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
  { id: 'dulces', name: 'Dulces', icon: '🍯' },
  { id: 'otros', name: 'Otros', icon: '📦' }
];

// Tipos para TypeScript
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  min_quantity?: number;
  co2_impact: number;
  water_impact: number;
  plastic_saved: number;
  category: string;
  subcategory: string;
  tags: string[];
  images: { url: string; alt: string }[];
  producer_id: string;
  producer: Producer;
  stock: number;
  featured?: boolean;
  active: boolean;
  created_at?: string;
}

export interface Producer {
  id: string;
  name: string;
  slug: string;
  location: string;
  story: string;
  profile_image: string;
  total_co2_saved: number;
  hectares_cultivated: number;
  certifications: string[];
  active: boolean;
}

export interface Experience {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_hours: number;
  min_participants: number;
  max_participants: number;
  price_per_person: number;
  price_child?: number;
  includes: string[];
  requirements: string[];
  images: { url: string; alt: string }[];
  meeting_point: string;
  coordinates: { lat: number; lng: number };
  co2_offset: number;
  active: boolean;
  featured: boolean;
  schedule: string;
  availableDays: number[];
  experienceType: 'public' | 'private';
}

