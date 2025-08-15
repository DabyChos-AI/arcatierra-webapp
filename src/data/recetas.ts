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
    ingredients: ["200g de acelgas Arca Tierra", "1 cebolla morada mediana", "2 dientes de ajo orgánico"],
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
    ingredients: ["300g de zanahorias con hojas", "1 cucharada de jengibre fresco rallado", "1/2 cucharadita de cúrcuma en polvo"],
    rating: 4.9,
    reviews: 89,
    steps: [
      {
        id: 1,
        title: "Limpiar y separar",
        description: "Lava cuidadosamente las zanahorias con sus hojas. Separa las hojas verdes de las raíces.",
        duration: 5,
        tips: ["Las hojas deben estar frescas y sin manchas", "Reserva las raíces para el paso siguiente"]
      },
      {
        id: 2,
        title: "Preparar raíces",
        description: "Corta las zanahorias en bastones medianos. Ralla jengibre fresco y prepara cúrcuma.",
        duration: 8
      },
      {
        id: 3,
        title: "Saltear raíces",
        description: "En una sartén con aceite, saltea las zanahorias con jengibre y cúrcuma por 12 minutos.",
        duration: 12
      },
      {
        id: 4,
        title: "Incorporar hojas",
        description: "Agrega las hojas de zanahoria picadas y cocina 3-5 minutos hasta que se ablanden. Condimenta al gusto.",
        duration: 5,
        tips: ["Las hojas aportan un sabor ligeramente amargo y nutritivo", "No cocines demasiado las hojas para mantener nutrientes"]
      }
    ],
    nutritionInfo: {
      calories: 120,
      protein: "3g",
      carbs: "18g",
      fat: "5g",
      fiber: "4g"
    }
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
    ingredients: ["500g de rábanos frescos", "10g de sal marina (2% del peso)", "1 cucharadita de especias aromáticas mixtas"],
    rating: 4.7,
    reviews: 156,
    steps: [
      {
        id: 1,
        title: "Preparar rábanos",
        description: "Lava y corta los rábanos en rodajas finas. Déjalos reposar con sal marina por 30 minutos.",
        duration: 35,
        tips: ["La sal extraerá el agua de los rábanos", "Usa 2% del peso de los rábanos en sal"]
      },
      {
        id: 2,
        title: "Preparar especias",
        description: "Tuesta ligeramente las especias aromáticas y déjalas enfriar completamente.",
        duration: 5
      },
      {
        id: 3,
        title: "Masajear y mezclar",
        description: "Masajea los rábanos con las manos hasta que liberen más líquido. Agrega las especias.",
        duration: 3,
        tips: ["El masajeado es crucial para una buena fermentación", "Debe quedar líquido suficiente para cubrir"]
      },
      {
        id: 4,
        title: "Fermentar",
        description: "Coloca en frasco limpio, presiona para que quede sumergido. Deja fermentar 3-7 días a temperatura ambiente.",
        duration: 2,
        tips: ["Los vegetales deben estar siempre bajo el líquido", "Prueba diariamente para controlar el sabor"]
      }
    ],
    nutritionInfo: {
      calories: 25,
      protein: "1g",
      carbs: "4g",
      fat: "0g",
      fiber: "2g"
    }
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
    ingredients: ["150g de mix de hojas verdes", "200g de tomates cherry", "1 pepino orgánico mediano"],
    rating: 4.6,
    reviews: 203,
    steps: [
      {
        id: 1,
        title: "Preparar las hojas",
        description: "Lava cuidadosamente el mix de hojas verdes en agua fría. Seca con centrífuga o papel absorbente.",
        duration: 5,
        tips: ["Las hojas deben estar completamente secas", "Refrigera unos minutos para mayor frescura"]
      },
      {
        id: 2,
        title: "Cortar vegetales",
        description: "Corta los tomates cherry por la mitad y el pepino en rodajas finas o cubos medianos.",
        duration: 5
      },
      {
        id: 3,
        title: "Armar la ensalada",
        description: "Combina las hojas, tomates y pepino en un bowl grande. Mezcla suavemente con las manos.",
        duration: 3,
        tips: ["Mezclar con las manos es más delicado que con utensilios", "Agrega el aderezo justo antes de servir"]
      },
      {
        id: 4,
        title: "Aderezar y servir",
        description: "Agrega un aderezo simple de aceite de oliva, limón y sal. Sirve inmediatamente.",
        duration: 2,
        tips: ["El aderezo simple resalta los sabores naturales", "Sirve en platos fríos para mantener la frescura"]
      }
    ],
    nutritionInfo: {
      calories: 45,
      protein: "2g",
      carbs: "8g",
      fat: "1g",
      fiber: "3g"
    }
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
    ingredients: ["200g de cáscaras vegetales variadas", "1 litro de caldo casero", "2 cucharadas de hierbas frescas mixtas"],
    rating: 4.5,
    reviews: 98,
    steps: [
      {
        id: 1,
        title: "Recolectar y limpiar",
        description: "Reúne cáscaras y tallos limpios de vegetales (zanahoria, apio, cebolla, etc.). Lávalos bien.",
        duration: 10,
        tips: ["Guarda las cáscaras en el refrigerador hasta tener suficientes", "Evita cáscaras de papa con ojos verdes"]
      },
      {
        id: 2,
        title: "Saltear base aromática",
        description: "En una olla grande, saltea las cáscaras de cebolla y tallos de apio con un poco de aceite por 5 minutos.",
        duration: 5
      },
      {
        id: 3,
        title: "Agregar líquido y cocinar",
        description: "Añade el caldo casero y el resto de cáscaras. Cocina a fuego medio por 25 minutos.",
        duration: 25,
        tips: ["El caldo debe cubrir bien todos los vegetales", "Remueve la espuma que se forme en la superficie"]
      },
      {
        id: 4,
        title: "Colar y finalizar",
        description: "Cuela la sopa, presiona los sólidos para extraer sabor. Agrega hierbas frescas y condimenta.",
        duration: 5,
        tips: ["Puedes triturar algunos vegetales y regresarlos para textura", "Las hierbas frescas se agregan al final"]
      }
    ],
    nutritionInfo: {
      calories: 65,
      protein: "2g",
      carbs: "12g",
      fat: "2g",
      fiber: "4g"
    }
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
    ingredients: ["1 manojo grande de kale fresco (aprox. 150g)", "Jugo de 1 limón orgánico", "2 cucharadas de aceite de oliva extra virgen"],
    rating: 4.8,
    reviews: 167,
    steps: [
      {
        id: 1,
        title: "Preparar el kale",
        description: "Lava las hojas de kale y retira los tallos duros. Corta las hojas en trozos medianos.",
        duration: 3,
        tips: ["Los tallos se pueden reservar para caldos", "Las hojas deben estar completamente secas"]
      },
      {
        id: 2,
        title: "Agregar condimentos",
        description: "Coloca el kale en un bowl grande. Agrega jugo de limón fresco y una pizca de sal marina.",
        duration: 1
      },
      {
        id: 3,
        title: "Masajear las hojas",
        description: "Con las manos limpias, masajea vigorosamente el kale por 2-3 minutos hasta que se ablande y cambie de color.",
        duration: 3,
        tips: ["El masajeado rompe las fibras y hace el kale más digerible", "Las hojas deben quedar de color verde más intenso"]
      },
      {
        id: 4,
        title: "Finalizar con aceite",
        description: "Agrega un chorrito de aceite de oliva y mezcla suavemente. Deja reposar 2 minutos antes de servir.",
        duration: 3,
        tips: ["El aceite ayuda a absorber las vitaminas liposolubles", "Puede guardarse en refrigerador hasta 2 días"]
      }
    ],
    nutritionInfo: {
      calories: 55,
      protein: "3g",
      carbs: "6g",
      fat: "3g",
      fiber: "2g"
    }
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
