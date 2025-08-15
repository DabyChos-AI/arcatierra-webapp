// src/data/recetas.ts
// Datos de recetas agroecológicas - conectadas con productos de Arca Tierra

export interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  difficulty: "Fácil" | "Medio" | "Avanzado";
  season: "Primavera" | "Verano" | "Otoño" | "Invierno" | "Todo el año";
  tags: string[];
  ingredients: string[];
  rating: number;
  reviews: number;
  steps?: RecipeStep[];
  nutritionInfo?: NutritionInfo;
}

export interface RecipeStep {
  id: number;
  title: string;
  description: string;
  image?: string;
  duration?: number;
  tips?: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

export interface UserRating {
  id: string;
  recipeId: number;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  date: string;
}

export interface RecipeComment {
  id: string;
  recipeId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  date: string;
  likes: number;
  replies?: RecipeComment[];
}

export interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface CommunityStory {
  id: number;
  title: string;
  author: string;
  location: string;
  story: string;
  image: string;
  recipe: string;
}

// Datos de recetas conectadas con productos reales de Arca Tierra
export const recipesData: Recipe[] = [
  {
    id: 1,
    title: "Acelgas sin Desperdicio - Del Tallo a la Hoja",
    description: "Aprovecha cada parte de las acelgas en esta receta sustentable que celebra la diversidad de texturas y sabores.",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop",
    cookTime: 25,
    difficulty: "Fácil",
    season: "Primavera",
    tags: ["Sin desperdicio", "Verduras de hoja", "Agroecológico"],
    ingredients: ["Acelgas Arca Tierra", "Cebolla morada", "Ajo orgánico"],
    rating: 4.8,
    reviews: 127,
    steps: [
      {
        id: 1,
        title: "Separar tallos y hojas",
        description: "Separa cuidadosamente las hojas de los tallos. Los tallos se cocinan más tiempo que las hojas.",
        duration: 5,
        tips: ["Los tallos son perfectos para saltear", "Las hojas se agregan al final"]
      },
      {
        id: 2,
        title: "Preparar base aromática",
        description: "Sofríe cebolla y ajo hasta que estén dorados y aromáticos.",
        duration: 8
      },
      {
        id: 3,
        title: "Cocinar tallos",
        description: "Agrega los tallos cortados y cocina por 10 minutos hasta que estén tiernos.",
        duration: 10
      },
      {
        id: 4,
        title: "Agregar hojas",
        description: "Incorpora las hojas y cocina hasta que se marchiten. Condimenta al gusto.",
        duration: 2
      }
    ],
    nutritionInfo: {
      calories: 95,
      protein: "4g",
      carbs: "8g",
      fat: "6g",
      fiber: "3g"
    }
  },
  {
    id: 2,
    title: "Zanahoria Completa - Raíz y Hojas Verdes",
    description: "Descubre el sabor único de las hojas de zanahoria en esta receta que aprovecha toda la planta.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop",
    cookTime: 30,
    difficulty: "Medio",
    season: "Invierno",
    tags: ["Aprovechamiento integral", "Raíces", "Nutritivo"],
    ingredients: ["Zanahorias con hojas", "Jengibre fresco", "Cúrcuma"],
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    title: "Rábanos Fermentados - Técnica Ancestral",
    description: "Aprende la técnica tradicional de fermentación para conservar y potenciar el sabor de los rábanos.",
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&h=300&fit=crop",
    cookTime: 45,
    difficulty: "Avanzado",
    season: "Todo el año",
    tags: ["Fermentación", "Conservación", "Probióticos"],
    ingredients: ["Rábanos frescos", "Sal marina", "Especias aromáticas"],
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    title: "Ensalada de Temporada Colorida",
    description: "Una explosión de colores y sabores con los vegetales más frescos de la temporada actual.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    cookTime: 15,
    difficulty: "Fácil",
    season: "Verano",
    tags: ["Fresco", "Crudo", "Vitaminas"],
    ingredients: ["Mix de hojas", "Tomates cherry", "Pepino orgánico"],
    rating: 4.6,
    reviews: 203
  },
  {
    id: 5,
    title: "Sopa de Aprovechamiento - Cáscaras y Tallos",
    description: "Transforma cáscaras y tallos en una sopa nutritiva y deliciosa que reduce el desperdicio.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    cookTime: 40,
    difficulty: "Medio",
    season: "Otoño",
    tags: ["Cero desperdicio", "Nutritivo", "Económico"],
    ingredients: ["Cáscaras vegetales", "Caldo casero", "Hierbas frescas"],
    rating: 4.5,
    reviews: 98
  },
  {
    id: 6,
    title: "Kale Masajeado con Limón",
    description: "Técnica especial de masajeado que transforma el kale en una base perfecta para ensaladas.",
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=300&fit=crop",
    cookTime: 10,
    difficulty: "Fácil",
    season: "Invierno",
    tags: ["Técnica especial", "Superfood", "Antioxidante"],
    ingredients: ["Kale fresco", "Limón orgánico", "Aceite oliva"],
    rating: 4.8,
    reviews: 167
  }
];

export const tipsData: Tip[] = [
  {
    id: 1,
    title: "Cómo almacenar verduras de hoja",
    description: "Mantén frescas tus acelgas, espinacas y kale hasta por 10 días con estos consejos.",
    icon: "🥬",
    category: "Conservación"
  },
  {
    id: 2,
    title: "Aprovecha las cáscaras de zanahoria",
    description: "Ideas creativas para usar cáscaras: chips, caldos y condimentos naturales.",
    icon: "🥕",
    category: "Aprovechamiento"
  },
  {
    id: 3,
    title: "Fermentación básica en casa",
    description: "Primeros pasos para fermentar vegetales y crear probióticos caseros.",
    icon: "🫙",
    category: "Fermentación"
  },
  {
    id: 4,
    title: "Congelación inteligente",
    description: "Técnicas para congelar vegetales manteniendo nutrientes y textura.",
    icon: "❄️",
    category: "Conservación"
  }
];

export const communityStories: CommunityStory[] = [
  {
    id: 1,
    title: "La Transformación de la Familia González",
    author: "María González",
    location: "Finca Los Cerezos, Cundinamarca",
    story: "Hace tres años decidimos cambiar nuestra alimentación completamente. Comenzamos comprando en Arca Tierra y poco a poco fuimos incorporando más vegetales y menos procesados. Nuestros hijos, que al principio se resistían, ahora disfrutan preparando ensaladas y smoothies con nosotros. La diferencia en nuestra energía y salud es notable.",
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=300&fit=crop",
    recipe: "Smoothie Verde Familiar"
  },
  {
    id: 2,
    title: "El Orgullo del Agricultor",
    author: "Carlos Mendoza",
    location: "Huasca de Ocampo, Hidalgo",
    story: "Como agricultor, ver que las familias usan cada parte de mis vegetales me llena de orgullo y satisfacción.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    recipe: "Fermentación Artesanal"
  },
  {
    id: 3,
    title: "Conectando con lo Ancestral",
    author: "Ana Rodríguez",
    location: "Amanalco, Estado de México",
    story: "Fermentar mis propios vegetales me conecta con técnicas ancestrales y cuida mi salud intestinal.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    recipe: "Técnicas de Cultivo Orgánico"
  }
];
