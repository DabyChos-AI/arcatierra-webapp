// src/data/recetas.ts
// Datos de recetas agroecológicas - conectadas con productos de Arca Tierra

export interface RecipeAuthor {
  name: string;
  bio?: string;
  image?: string;
  specialty?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  author?: RecipeAuthor;
  cookTime: number;
  difficulty: "Fácil" | "Medio" | "Avanzado";
  season: "Primavera" | "Verano" | "Otoño" | "Invierno" | "Todo el año";
  tags: string[];
  ingredients: string[];
  rating: number;
  reviews: number;
  steps?: RecipeStep[];
  nutritionInfo?: NutritionInfo;
  beneficios?: string[];
  comments?: RecipeComment[];
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

export interface RecipeComment {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  date: string;
  likes: number;
  replies?: RecipeCommentReply[];
}

export interface RecipeCommentReply {
  id: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  date: string;
}

export interface UserRating {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
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
    id: "acelgas-sin-desperdicio",
    title: "Acelgas sin Desperdicio - Del Tallo a la Hoja",
    description: "Aprovecha cada parte de las acelgas en esta receta sustentable que celebra la diversidad de texturas y sabores.",
    image: "/images/recetas/Acelgas_sin_desperdicio.jpg",
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
    },
    comments: [
      {
        id: "acelgas-c1",
        recipeId: "acelgas-sin-desperdicio",
        userId: "user1",
        userName: "María Rodríguez",
        userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
        comment: "¡Esta receta cambió mi perspectiva sobre las acelgas! Los tallos quedan increíblemente sabrosos y ya no desperdicio nada. Mis hijos ahora piden acelgas seguido.",
        date: "2024-03-28",
        likes: 18,
        replies: [
          {
            id: "acelgas-r1",
            userName: "Carmen López",
            userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
            comment: "¡Totalmente de acuerdo! Es increíble cómo cambia el sabor cuando aprovechas toda la verdura.",
            date: "2024-03-29"
          }
        ]
      }
    ]
  },
  {
    id: "zanahoria-completa-raiz-hojas",
    title: "Zanahoria Completa - Raíz y Hojas Verdes",
    description: "Descubre el sabor único de las hojas de zanahoria en esta receta que aprovecha toda la planta.",
    image: "/images/recetas/Zanahoria_Completa-Raiz_y_Hojas.png",
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
    },
    comments: [
      {
        id: "zanahoria-c1",
        recipeId: "zanahoria-completa-raiz-hojas",
        userId: "user2",
        userName: "Mercedes Valenzuela",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
        comment: "¡Esta receta es genial para aprovechar toda la zanahoria! Las hojas tienen un sabor herbáceo increíble y no sabía que se podían comer. ¡Ahora no desperdicio nada de mis zanahorias orgánicas!",
        date: "2024-06-02",
        likes: 33,
        replies: [
          {
            id: "zanahoria-r1",
            userName: "José Manuel Rivera",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Qué buena enseñanza! Siempre tiraba las hojas y no sabía que eran comestibles. Es una forma perfecta de aprovechar todo el producto.",
            date: "2024-06-03"
          }
        ]
      }
    ]
  },
  {
    id: "rabanos-fermentados-ancestral",
    title: "Rábanos Fermentados - Técnica Ancestral",
    description: "Aprende la técnica tradicional de fermentación para conservar y potenciar el sabor de los rábanos.",
    image: "/images/recetas/Rabanos_Fermentados_Ancestral.jpg",
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
    },
    comments: [
      {
        id: "rabanos-c1",
        recipeId: "rabanos-fermentados-ancestral",
        userId: "user3",
        userName: "Guadalupe Soto",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
        comment: "Esta técnica ancestral de fermentación es fantástica! Los rábanos quedan con un sabor único y son perfectos para acompañar tacos. Mi familia quedó fascinada con el proceso.",
        date: "2024-04-18",
        likes: 31,
        replies: [
          {
            id: "rabanos-r1",
            userName: "Antonio Ruiz",
            userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
            comment: "¡Increíble cómo nuestros antepasados conservaban los alimentos! Es una forma natural y saludable de fermentar. Definitivamente lo intentaré.",
            date: "2024-04-19"
          }
        ]
      }
    ]
  },
  {
    id: "ensalada-temporada-colorida",
    title: "Ensalada de Temporada Colorida",
    description: "Una explosión de colores y sabores con los vegetales más frescos de la temporada actual.",
    image: "/images/recetas/Ensalada_de_Temporada_Colorida.jpg",
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
    },
    comments: [
      {
        id: "ensalada-temporada-c1",
        recipeId: "ensalada-temporada-colorida",
        userId: "user4",
        userName: "Claudia Ramírez",
        userAvatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face",
        comment: "Esta ensalada es una fiesta de colores y sabores! Los rábanos le dan el toque crujiente perfecto y las verduras de temporada siempre son lo máximo. ¡Una receta que celebra la primavera!",
        date: "2024-04-25",
        likes: 29,
        replies: [
          {
            id: "ensalada-temporada-r1",
            userName: "Roberto Martínez",
            userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
            comment: "¡Se ve espectacular! Me encanta cómo aprovecha los ingredientes de temporada. Definitivamente la haré con los vegetales de mi huerto.",
            date: "2024-04-26"
          }
        ]
      }
    ]
  },
  {
    id: "sopa-aprovechamiento-cascaras",
    title: "Sopa de Aprovechamiento - Cáscaras y Tallos",
    description: "Transforma cáscaras y tallos en una sopa nutritiva y deliciosa que reduce el desperdicio.",
    image: "/images/recetas/Sopa_de_Aprovechamiento_de_Cascaras.jpg",
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
    },
    comments: [
      {
        id: "sopa-cascaras-c1",
        recipeId: "sopa-aprovechamiento-cascaras",
        userId: "user5",
        userName: "Esperanza Morales",
        userAvatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=40&h=40&fit=crop&crop=face",
        comment: "¡Esta sopa es genial para reducir el desperdicio! Nunca pensé que las cáscaras y tallos pudieran dar tanto sabor. Es nutritiva, económica y deliciosa. ¡Una lección de sustentabilidad!",
        date: "2024-04-22",
        likes: 26,
        replies: [
          {
            id: "sopa-cascaras-r1",
            userName: "Emilio Castro",
            userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Qué buena forma de aprovechar todo! Me gusta la idea de ser más consciente con los alimentos. La probaré este fin de semana.",
            date: "2024-04-23"
          }
        ]
      }
    ]
  },
  {
    id: "kale-masajeado-limon",
    title: "Kale Masajeado con Limón",
    description: "Técnica especial de masajeado que transforma el kale en una base perfecta para ensaladas.",
    image: "/images/recetas/Kale_Masajeado_con_Limon.jpg",
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
    },
    comments: [
      {
        id: "kale-c1",
        recipeId: "kale-masajeado-limon",
        userId: "user6",
        userName: "Adriana Mendoza",
        userAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face",
        comment: "¡El masaje al kale realmente hace la diferencia! Nunca pensé que una técnica tan simple pudiera transformar tanto una verdura. Ahora es mi ensalada favorita.",
        date: "2024-05-15",
        likes: 25,
        replies: [
          {
            id: "kale-r1",
            userName: "Gabriel Torres",
            userAvatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face",
            comment: "¡Totalmente cierto! El kale masajeado queda mucho más suave y sabroso. Es increíble cómo cambia la textura.",
            date: "2024-05-16"
          }
        ]
      }
    ]
  },
  {
    id: "barquitos-calabaza-rellenos",
    title: "Barquitos de Calabaza Rellenos",
    description: "Deliciosa receta de calabazas rellenas con verduras coloridas y queso manchego, perfecta para aprovechar la calabaza completa.",
    image: "/images/recetas/Barquitos_de_Calabaza_Rellenos.jpg",
    author: {
      name: "Equipo Arca Tierra",
      bio: "Especialistas en cocina agroecológica y aprovechamiento integral"
    },
    cookTime: 35,
    difficulty: "Medio",
    season: "Otoño",
    tags: ["Horno", "Verduras rellenas", "Queso", "Colorido"],
    ingredients: [
      "3 pzs de calabaza",
      "3 pzs de zanahoria de colores, cortada en cubos pequeños",
      "¼ pza de coliflor, cortada en floretes pequeños",
      "½ lt de puré de tomate",
      "¼ cdta orégano en polvo",
      "½ cdta perejil en polvo o fresco",
      "1 cdta albahaca en polvo o fresca",
      "300gr queso manchego",
      "Perejil fresco para decorar",
      "Aceite de oliva al gusto",
      "Sal al gusto"
    ],
    rating: 4.6,
    reviews: 89,
    steps: [
      {
        id: 1,
        title: "Preparar horno y calabaza",
        description: "Precalentar el horno a 170°. Cortar la calabaza por la mitad de manera transversal. Con ayuda de una cuchara retirar el centro de la calabaza con cuidado de no romperla.",
        duration: 8,
        tips: ["Usar una cuchara con borde para vaciar mejor", "Guardar las semillas para tostar"]
      },
      {
        id: 2,
        title: "Preparar el relleno",
        description: "Picar el relleno de la calabaza en pequeños trozos. En un sartén calentar aceite de oliva y saltear zanahorias, coliflores y centro de calabaza por 3 minutos. Agregar sal al gusto.",
        duration: 8,
        tips: ["Las verduras deben quedar crujientes", "No sobrecocinar para mantener textura"]
      },
      {
        id: 3,
        title: "Añadir condimentos",
        description: "Agregar el puré de jitomate al sartén. Incorporar orégano, perejil y albahaca. Cocinar por 3 minutos más hasta que las verduras estén cocidas pero firmes.",
        duration: 6
      },
      {
        id: 4,
        title: "Rellenar y hornear",
        description: "Colocar el relleno en las calabazas y cubrir con rebanadas de queso manchego. En un refractario, colocar las calabazas y bañar con el caldo sobrante. Hornear 10-15 min hasta que el queso se derrita.",
        duration: 13,
        tips: ["El queso debe estar dorado por encima", "La calabaza debe estar tierna al pincharla"]
      },
      {
        id: 5,
        title: "Servir",
        description: "Sacar del horno y decorar con perejil fresco picado. Servir inmediatamente mientras está caliente.",
        duration: 2,
        tips: ["Dejar reposar 2 minutos antes de servir", "Acompañar con ensalada verde"]
      }
    ],
    nutritionInfo: {
      calories: 220,
      protein: "12g",
      carbs: "18g",
      fat: "14g",
      fiber: "6g"
    },
    comments: [
      {
        id: "barquitos-c1",
        recipeId: "barquitos-calabaza-rellenos",
        userId: "user7",
        userName: "Carmen Jiménez",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face",
        comment: "Estos barquitos de calabaza se ven espectaculares y saben aún mejor. La presentación es digna de restaurante pero muy fácil de hacer. ¡Mis invitados quedaron impresionados!",
        date: "2024-04-10",
        likes: 21,
        replies: [
          {
            id: "barquitos-r1",
            userName: "Luis Moreno",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Qué buena idea para una cena especial! Me gusta cómo se aprovecha la calabaza como recipiente natural.",
            date: "2024-04-11"
          }
        ]
      }
    ]
  },
  {
    id: "blt-sandwich-clasico",
    title: "BLT - Sandwich de Tocino, Lechuga y Jitomate",
    description: "Clásico sandwich con tocino crujiente, jitomate heirloom fresco y lechuga, servido en hogaza campesina tostada.",
    image: "/images/recetas/BLT_Sandwich_Clasico.jpg",
    author: {
      name: "Equipo Arca Tierra",
      bio: "Especialistas en cocina agroecológica y aprovechamiento integral"
    },
    cookTime: 15,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Sandwich", "Rápido", "Clásico", "Tocino"],
    ingredients: [
      "2 rebanadas de hogaza campesina",
      "1 jitomate heirloom",
      "6 rebanadas de tocino Santa Pradera",
      "Lechuga, troceada",
      "Mostaza de estragón",
      "Aceite de oliva",
      "Sal al gusto",
      "Pimienta al gusto"
    ],
    rating: 4.5,
    reviews: 156,
    steps: [
      {
        id: 1,
        title: "Tostar el pan",
        description: "Embarrar aceite de oliva sobre las rebanadas de pan por ambos lados. En sartén o plancha bien caliente, colocar el pan por 2 minutos y voltear. Repetir hasta que esté dorado por ambos lados.",
        duration: 6,
        tips: ["La plancha debe estar bien caliente para un tostado uniforme", "El aceite de oliva da mejor sabor que la mantequilla"]
      },
      {
        id: 2,
        title: "Cocinar el tocino",
        description: "En el mismo sartén, colocar el tocino hasta que quede crujiente por ambos lados.",
        duration: 6,
        tips: ["No mover el tocino hasta que esté listo para voltear", "Escurrir sobre papel absorbente"]
      },
      {
        id: 3,
        title: "Preparar el jitomate",
        description: "Sacar rebanadas del jitomate heirloom del ancho preferido. Sazonar ligeramente con sal y pimienta.",
        duration: 2,
        tips: ["El jitomate heirloom tiene mejor sabor que el común", "Las rebanadas gruesas dan mejor textura"]
      },
      {
        id: 4,
        title: "Armar el sandwich",
        description: "En una rebanada de pan colocar mostaza al gusto. Encima agregar la lechuga, enseguida el jitomate y terminar con el tocino crujiente.",
        duration: 1,
        tips: ["La mostaza de estragón complementa perfectamente", "Servir inmediatamente para mantener la textura crujiente"]
      }
    ],
    nutritionInfo: {
      calories: 420,
      protein: "18g",
      carbs: "28g",
      fat: "28g",
      fiber: "4g"
    },
    comments: [
      {
        id: "blt-c1",
        recipeId: "blt-sandwich-clasico",
        userId: "user8",
        userName: "Ricardo Vázquez",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        comment: "Este BLT con ingredientes de Arca Tierra es incomparable. El tocino artesanal y la lechuga fresca hacen la diferencia. ¡El sándwich perfecto para cualquier momento del día!",
        date: "2024-05-08",
        likes: 28,
        replies: [
          {
            id: "blt-r1",
            userName: "Sofía Delgado",
            userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
            comment: "¡Se me hizo agua la boca! Definitivamente voy a prepararlo este fin de semana. Me encanta la simplicidad de los ingredientes de calidad.",
            date: "2024-05-09"
          }
        ]
      }
    ]
  },
  {
    id: "crema-calabaza-curry-coco",
    title: "Crema de Calabaza Amarilla + Curry y Crema de Coco",
    description: "Dale un apapacho al corazón con esta deliciosa y fácil crema, perfecta para el clima frío. Receta sencilla que combina la dulzura natural de la calabaza con el sabor exótico del curry y la cremosidad del coco.",
    image: "/images/recetas/Crema_de_Calabaza_Curry-Coco.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 25,
    difficulty: "Fácil",
    season: "Otoño",
    tags: ["Crema", "Curry", "Coco", "Reconfortante"],
    ingredients: [
      "1/2 cebolla blanca Arca Tierra",
      "1 diente de ajo Arca Tierra",
      "7 calabazas amarillas Arca Tierra",
      "2 cucharadas de curry",
      "Sal al gusto",
      "2 tazas de agua",
      "1 lata de crema de coco",
      "Aceite de oliva",
      "Pesto para servir (opcional)",
      "Queso de cabra o feta para servir (opcional)",
      "Crotones para servir (opcional)"
    ],
    rating: 4.7,
    reviews: 134,
    steps: [
      {
        id: 1,
        title: "Preparar base aromática",
        description: "Saltear la cebolla y ajo con un poco de aceite de oliva hasta que estén transparentes y aromáticos.",
        duration: 5,
        tips: ["Usar fuego medio para evitar que se quemen", "La cebolla debe estar translúcida"]
      },
      {
        id: 2,
        title: "Agregar especias y calabaza",
        description: "Incorporar el curry y mezclar por 1 minuto. Añadir las calabazas amarillas cortadas y condimentar con sal al gusto.",
        duration: 8,
        tips: ["El curry debe tostar ligeramente para liberar sus aromas", "Cortar las calabazas en trozos uniformes"]
      },
      {
        id: 3,
        title: "Cocinar hasta suavizar",
        description: "Cocinar las calabazas hasta que estén suaves, removiendo ocasionalmente para evitar que se peguen.",
        duration: 10,
        tips: ["Las calabazas deben estar completamente tiernas", "Si se pegan, agregar un poco más de aceite"]
      },
      {
        id: 4,
        title: "Añadir líquidos y finalizar",
        description: "Cuando las calabazas estén suaves, agregar el agua y la crema de coco. Cocinar por 10 minutos más y procesar hasta obtener una crema lisa.",
        duration: 12,
        tips: ["Usar licuadora o procesador de inmersión", "Colar si se desea una textura más fina"]
      },
      {
        id: 5,
        title: "Servir y decorar",
        description: "Servir caliente acompañado de pesto, queso de cabra o feta y crotones al gusto.",
        duration: 2,
        tips: ["Servir inmediatamente para mejor temperatura", "Los acompañamientos son opcionales pero realzan el sabor"]
      }
    ],
    nutritionInfo: {
      calories: 180,
      protein: "4g",
      carbs: "15g",
      fat: "12g",
      fiber: "5g"
    },
    beneficios: [
      "Calabaza amarilla: Rico en betacaroteno y antioxidantes que benefician el sistema digestivo",
      "Cebolla blanca: Aporta vitaminas A, B6, C, E y quercetina antioxidante",
      "Curry: Propiedades antiinflamatorias y antioxidantes",
      "Crema de coco: Grasas saludables que mejoran la absorción de vitaminas liposolubles"
    ],
    comments: [
      {
        id: "crema-calabaza-c1",
        recipeId: "crema-calabaza-curry-coco",
        userId: "user9",
        userName: "Isabella Ruiz",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        comment: "Esta crema es pura comfort food! La combinación de curry y coco con la calabaza amarilla es genial. El sabor es exótico pero reconfortante. ¡Ya la hice 4 veces!",
        date: "2024-06-12",
        likes: 35,
        replies: [
          {
            id: "crema-calabaza-r1",
            userName: "Alejandro Castro",
            userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Qué buena combinación de sabores! Me encanta cómo las especias elevan una verdura tan simple. Definitivamente la haré esta semana.",
            date: "2024-06-13"
          }
        ]
      }
    ]
  },
  {
    id: "melitzanosalata-ensalada-griega-berenjena",
    title: "Melitzanosalata - Ensalada Griega de Berenjena",
    description: "Receta griega tradicional ideal como entrada para botanear o acompañar platillos. La berenjena asada se mezcla con hierbas frescas y aceite de oliva, creando una textura cremosa y un sabor mediterráneo auténtico.",
    image: "/images/recetas/Melitzanosalata-Ensalada_Griega_de_Berenjena.png",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 50,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Griego", "Ensalada", "Berenjena", "Botanear"],
    ingredients: [
      "2 berenjenas grandes Arca Tierra",
      "1 diente de ajo picado",
      "Perejil picado",
      "Aceite de oliva extra virgen",
      "Sal al gusto",
      "Pimienta al gusto",
      "Jugo de limón"
    ],
    rating: 4.6,
    reviews: 98,
    steps: [
      {
        id: 1,
        title: "Preparar berenjenas",
        description: "Cortar las berenjenas en trozos o rebanadas gruesas, dependiendo de la presentación deseada.",
        duration: 8,
        tips: ["Cortar en trozos uniformes para cocción pareja", "No pelar las berenjenas para mantener nutrientes"]
      },
      {
        id: 2,
        title: "Asar en horno",
        description: "Hornear las berenjenas por 40 minutos a 180 grados centígrados hasta que estén completamente tiernas y doradas.",
        duration: 40,
        tips: ["Voltear a la mitad del tiempo para cocción uniforme", "Deben estar muy suaves al pincharlas"]
      },
      {
        id: 3,
        title: "Enfriar y picar",
        description: "Dejar enfriar las berenjenas asadas y picarlas en trozos más pequeños o desmenuzarlas según textura deseada.",
        duration: 10,
        tips: ["Dejar que se enfríen completamente", "La textura puede ser rústica o más fina según preferencia"]
      },
      {
        id: 4,
        title: "Mezclar ingredientes",
        description: "Mezclar las berenjenas picadas con ajo, perejil, aceite de oliva, sal, pimienta y jugo de limón al gusto.",
        duration: 2,
        tips: ["Ajustar condimentos gradualmente", "El limón aporta frescura y realza sabores"]
      }
    ],
    nutritionInfo: {
      calories: 95,
      protein: "2g",
      carbs: "8g",
      fat: "7g",
      fiber: "4g"
    },
    beneficios: [
      "Ayuda a controlar la diabetes: Los extractos de berenjena pueden ayudar a controlar la absorción de glucosa",
      "Reduce el colesterol: Contiene ácido clorogénico, antioxidante que también es antibacteriano y antiviral",
      "Protege el hígado: Favorece la función hepática, recomendada para personas con hígado graso",
      "Diurético natural: El potasio ayuda a eliminar toxinas del organismo",
      "Mejora la digestión: Recomendada para personas con problemas digestivos",
      "Rica en antioxidantes: Combate los radicales libres y el envejecimiento celular"
    ],
    comments: [
      {
        id: "melitzanosalata-c1",
        recipeId: "melitzanosalata-ensalada-griega-berenjena",
        userId: "user10",
        userName: "Sophia Papadopoulos",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
        comment: "¡Esta melitzanosalata me transportó directamente a Grecia! La técnica del asado le da un sabor ahumado increíble. Es auténtica y deliciosa. ¡Mi yiayia estaría orgullosa!",
        date: "2024-05-20",
        likes: 37,
        replies: [
          {
            id: "melitzanosalata-r1",
            userName: "Dimitris Kostas",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Kalispera! Se ve exactamente como la que hacía mi madre en Atenas. Me alegra ver recetas griegas auténticas aquí.",
            date: "2024-05-21"
          }
        ]
      }
    ]
  },
  {
    id: "ensalada-cremosa-calabaza-zanahoria-pepino",
    title: "Ensalada Cremosa de Calabaza, Zanahoria y Pepino",
    description: "Una receta sencilla de hacer; perfecta como ensalada o bien puede ser una colación entre cada comida. Con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Ensalada_Cremosa_Calabaza_Zanahoria_Pepino.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 15,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Ensalada", "Crudo", "Cremoso", "Saludable", "Colación"],
    ingredients: [
      "Calabaza cruda Arca Tierra",
      "Zanahoria Arca Tierra", 
      "Pepino Arca Tierra",
      "1 aguacate",
      "1/2 limón",
      "Aceite de oliva extra virgen",
      "Vinagre blanco",
      "Cilantro fresco",
      "Sal al gusto",
      "Piñones tostados (opcional)"
    ],
    rating: 4.8,
    reviews: 45,
    steps: [
      {
        id: 1,
        title: "Preparar los vegetales",
        description: "Con un pelador, rallar la calabaza cruda, zanahoria y pepino Arca Tierra en tiras finas.",
        duration: 8,
        tips: ["Usar un pelador para obtener tiras uniformes y delgadas", "Los vegetales deben estar frescos y bien lavados"]
      },
      {
        id: 2,
        title: "Preparar el aderezo",
        description: "En la licuadora, mezclar el aguacate, jugo de medio limón, aceite de oliva, vinagre blanco, cilantro lavado, sal al gusto y un chorrito de agua hasta obtener una consistencia cremosa.",
        duration: 5,
        tips: ["Ajustar la cantidad de agua para lograr la consistencia deseada", "El cilantro debe estar bien lavado y desinfectado"]
      },
      {
        id: 3,
        title: "Mezclar y servir",
        description: "Combinar los vegetales rallados con el aderezo cremoso. Servir decorado con piñones tostados, nueces o almendras.",
        duration: 2,
        tips: ["Mezclar suavemente para no romper las tiras de vegetales", "Servir inmediatamente para mantener la frescura"]
      }
    ],
    nutritionInfo: {
      calories: 145,
      protein: "4g",
      carbs: "12g",
      fat: "10g",
      fiber: "5g"
    },
    beneficios: [
      "Zanahoria: Carotenoides que el cuerpo convierte en vitamina A con propiedades antioxidantes",
      "Zanahoria: Fibra que ayuda a bajar la presión arterial y el colesterol",
      "Zanahoria: Potasio mineral que ayuda a controlar la presión arterial y transmitir impulsos nerviosos",
      "Pepino: Rico en agua, ayuda a mantenerte hidratado",
      "Pepino: Ayuda a combatir el reflujo, equilibrar el ácido úrico y eliminar toxinas del cuerpo",
      "Calabaza: Ayuda a mantener un nivel adecuado de colesterol y a prevenir la angina de pecho"
    ]
  },
  {
    id: "ensalada-surimi",
    title: "Ensalada de Surimi",
    description: "Una receta sencilla de hacer; perfecta como ensalada o bien puede ser una colación entre cada comida. Con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Ensalada_Surimi.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 5,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Ensalada", "Rápido", "Proteína", "Saludable", "Colación"],
    ingredients: [
      "300g de Surimi en barra (Kani)",
      "1 pepino grande Arca Tierra",
      "3 zanahorias Arca Tierra",
      "Mayonesa (o yogurt griego)",
      "Salsa Sriracha",
      "Salsa soya",
      "Ajonjolí",
      "Aguacate"
    ],
    rating: 4.7,
    reviews: 38,
    steps: [
      {
        id: 1,
        title: "Preparar el surimi y vegetales",
        description: "Cortar en tiras o 'desmenuzar' el Surimi. Cortar en tiras el pepino y la zanahoria Arca Tierra.",
        duration: 3,
        tips: ["Las tiras deben ser del mismo grosor para mejor presentación", "Los vegetales deben estar frescos y bien lavados"]
      },
      {
        id: 2,
        title: "Preparar la salsa",
        description: "Mezclar mayonesa (o yogurt griego) + salsa Sriracha + salsa soya hasta obtener la consistencia y sabor deseado.",
        duration: 1,
        tips: ["El yogurt griego es una alternativa más saludable a la mayonesa", "Ajustar las proporciones según tu tolerancia al picante"]
      },
      {
        id: 3,
        title: "Mezclar y servir",
        description: "Agregar la salsa a las verduras y surimi, mezclar bien. Decorar con ajonjolí y aguacate.",
        duration: 1,
        tips: ["Mezclar suavemente para no romper el surimi", "Puedes comerlo solo, como acompañamiento, con arroz o como se te antoje"]
      }
    ],
    nutritionInfo: {
      calories: 185,
      protein: "12g",
      carbs: "8g",
      fat: "12g",
      fiber: "3g"
    },
    beneficios: [
      "Zanahoria: Carotenoides que el cuerpo convierte en vitamina A con propiedades antioxidantes",
      "Zanahoria: Fibra que ayuda a bajar la presión arterial y el colesterol",
      "Zanahoria: Potasio mineral que ayuda a controlar la presión arterial y transmitir impulsos nerviosos",
      "Pepino: Rico en agua, ayuda a mantenerte hidratado",
      "Pepino: Ayuda a combatir el reflujo, equilibrar el ácido úrico y eliminar toxinas del cuerpo"
    ]
  },
  {
    id: "limonada-antiestres",
    title: "Limonada Antiestrés",
    description: "Una receta sencilla, refrescante y deliciosa increíble bebida para acompañar tus comidas o para relajarte en cualquier momento del día, con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Limonada_Antiestres.jpg",
    author: {
      name: "Arca Tierra",
      bio: "Especialistas en cocina agroecológica"
    },
    cookTime: 10,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Bebida", "Refrescante", "Antiestrés", "Miel", "Lavanda", "Relajante"],
    ingredients: [
      "1 litro de agua",
      "Flores de lavanda frescas o secas",
      "Jugo de limón amarillo al gusto",
      "Miel de abeja al gusto",
      "Hielo",
      "Maqui Berry en polvo (opcional)"
    ],
    rating: 4.9,
    reviews: 67,
    steps: [
      {
        id: 1,
        title: "Preparar infusión de lavanda",
        description: "Coloca 1 litro de agua en una olla junto con flores de lavanda frescas o secas hasta que infusione.",
        duration: 7,
        tips: ["Si no tienes flores, puedes añadir 1-2 gotas de aceite esencial de lavanda comestible", "Verifica que el aceite esencial sea comestible, no todos lo son"]
      },
      {
        id: 2,
        title: "Opcional: Agregar superalimento",
        description: "Agrega un poco de maqui Berry en polvo para darle un tono violeta y antioxidantes extra.",
        duration: 1,
        tips: ["El maqui Berry es opcional pero aporta muchos antioxidantes", "El color violeta combina perfectamente con el tema de lavanda"]
      },
      {
        id: 3,
        title: "Mezclar y endulzar",
        description: "En una jarra, combina el jugo de limón y la infusión de lavanda. Endulza con miel de abeja al gusto y sirve con mucho hielo.",
        duration: 2,
        tips: ["Las cantidades son al gusto: ajusta dulzor, acidez e intensidad de lavanda", "La miel se disuelve mejor en líquido tibio"]
      }
    ],
    nutritionInfo: {
      calories: 45,
      protein: "0g",
      carbs: "12g",
      fat: "0g",
      fiber: "0g"
    },
    beneficios: [
      "Miel: Antioxidantes que bajan la presión arterial y dilatan las arterias del corazón",
      "Miel: Aumenta el flujo sanguíneo, previniendo la formación de coágulos",
      "Miel: Enzimas que facilitan la absorción de azúcares y almidón",
      "Limón: Vitamina C que fortalece el sistema inmunitario y previene infecciones",
      "Limón: Equilibra el pH del cuerpo, aportando energía y resistencia ante enfermedades",
      "Lavanda: Propiedades relajantes que ayudan a reducir el estrés y la ansiedad"
    ]
  },
  {
    id: "mejores-muffins-tu-vida",
    title: "Los Mejores Muffins de Tu Vida",
    description: "Una receta sencilla de hacer; porque los postres también pueden contener múltiples beneficios para la salud si elegimos los ingredientes correctos y que mejor que moras azules frescas y orgánicas.",
    image: "/images/recetas/Mejores_Muffins_de_Tu_Vida.jpg",
    author: {
      name: "Arca Tierra",
      bio: "Especialistas en cocina agroecológica"
    },
    cookTime: 35,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Postre", "Muffins", "Moras azules", "Saludable", "Horno"],
    ingredients: [
      "2 tazas de moras azules Arca Tierra",
      "2 tazas de harina de trigo",
      "2 huevos grandes o 3 pequeños",
      "1 taza de yogurt griego",
      "¾ taza de endulzante favorito",
      "½ taza de ghee o mantequilla derretida",
      "3 cucharaditas de polvo para hornear",
      "1 cucharadita de extracto de vainilla",
      "½ cucharadita de sal",
      "Para crumble: harina, endulzante, ghee, canela"
    ],
    rating: 4.9,
    reviews: 92,
    steps: [
      {
        id: 1,
        title: "Preparar crumble",
        description: "Mezcla todos los ingredientes del crumble: harina, endulzante, ghee derretido, canela y sal. Reserva.",
        duration: 5,
        tips: ["El trigo entero germinado es menos inflamatorio", "Asegúrate de que el ghee esté bien derretido pero no caliente"]
      },
      {
        id: 2,
        title: "Precalentar y preparar ingredientes secos",
        description: "Precalienta el horno a 400°F (200°C). Mezcla la harina, polvo para hornear y sal en un bowl.",
        duration: 5,
        tips: ["Cubre las moras con un poco de harina para que no se hundan al fondo", "Esto ayuda a distribuir las moras uniformemente"]
      },
      {
        id: 3,
        title: "Preparar mezcla húmeda",
        description: "Mezcla los huevos con el endulzante hasta incorporar. Agrega el yogurt griego, la vainilla y la mantequilla derretida.",
        duration: 8,
        tips: ["No batas en exceso, solo hasta incorporar", "El yogurt griego aporta humedad y proteína"]
      },
      {
        id: 4,
        title: "Combinar ingredientes",
        description: "Agrega los ingredientes secos a los húmedos y mezcla con movimientos envolventes. Incorpora 1½ tazas de las moras.",
        duration: 5,
        tips: ["Los movimientos envolventes evitan que se desarrolle el gluten en exceso", "Reserva algunas moras para decorar encima"]
      },
      {
        id: 5,
        title: "Hornear",
        description: "Vierte la mezcla en moldes hasta 2/3 de su capacidad. Coloca más moras y crumble encima. Baja a 375°F (190°C) y hornea 18-20 min.",
        duration: 20,
        tips: ["Reducir la temperatura evita que se doren demasiado rápido", "Están listos cuando un palillo sale limpio"]
      }
    ],
    nutritionInfo: {
      calories: 285,
      protein: "8g",
      carbs: "42g",
      fat: "11g",
      fiber: "4g"
    },
    beneficios: [
      "Moras azules: Mejoran las funciones cerebrales y cognitivas",
      "Moras azules: Disminuyen el riesgo de enfermedades cardiacas y reducen probabilidades de infarto",
      "Moras azules: Previenen las infecciones urinarias",
      "Moras azules: Combaten los problemas gastrointestinales y la diarrea",
      "Moras azules: Propiedades diuréticas que ayudan a eliminar toxinas",
      "Moras azules: Antiinflamatorio natural que reduce la inflamación",
      "Moras azules: Aumentan el colesterol bueno en la sangre",
      "Moras azules: Ayudan al sistema nervioso y disminuyen enfermedades neurológicas",
      "Moras azules: Mejoran la memoria y el aprendizaje"
    ],
    comments: [
      {
        id: "muffins-c1",
        recipeId: "mejores-muffins-tu-vida",
        userId: "user1",
        userName: "Elena Vargas",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
        comment: "¡Estos muffins realmente son los mejores de mi vida! La textura es perfecta y el sabor increíble. Mis hijos los devoran en minutos. ¡Ya no compro muffins en la tienda!",
        date: "2024-06-28",
        likes: 42,
        replies: [
          {
            id: "muffins-r1",
            userName: "Raúl Medina",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Qué recomendación tan buena! Los hice ayer y quedaron espectaculares. El secreto debe estar en la técnica de mezclado.",
            date: "2024-06-29"
          }
        ]
      }
    ]
  },
  {
    id: "pasta-con-brocoli",
    title: "Pasta con Brócoli",
    description: "Una receta italiana clásica y nutritiva que combina pasta con brócoli fresco, ajo aromático y un toque cítrico de limón. Perfecta para una comida equilibrada y deliciosa.",
    image: "/images/recetas/Pasta_con_Brocoli.jpg",
    author: {
      name: "Arca Tierra",
      bio: "Especialistas en cocina agroecológica"
    },
    cookTime: 20,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Pasta", "Brócoli", "Italiano", "Saludable", "Rápido"],
    ingredients: [
      "200g de pasta seca",
      "200g de brócoli",
      "1 diente de ajo",
      "1 limón amarillo (ralladura y jugo)",
      "1 cucharada de aceite de oliva",
      "Queso parmesano al gusto",
      "Perejil fresco",
      "Sal al gusto"
    ],
    rating: 4.6,
    reviews: 73,
    steps: [
      {
        id: 1,
        title: "Cocinar la pasta",
        description: "En una olla, colocar 2 litros de agua a fuego alto. Cuando esté hirviendo, agregar 1 cucharada de sal, cocinar la pasta de acuerdo a las instrucciones del paquete.",
        duration: 12,
        tips: ["El agua debe estar bien salada, como 'agua de mar'", "Reservar un poco del agua de cocción antes de colar"]
      },
      {
        id: 2,
        title: "Preparar vegetales",
        description: "Mientras se cocina la pasta, cortar el brócoli en trozos medianos. Picar el ajo en pequeños trozos.",
        duration: 3,
        tips: ["Los trozos de brócoli deben ser uniformes para cocción pareja", "El ajo picado fino se integra mejor"]
      },
      {
        id: 3,
        title: "Colar pasta y preparar sofrito",
        description: "Una vez cocida la pasta, reservar un poco del agua y colar. En la misma olla, a fuego medio, colocar el aceite de oliva.",
        duration: 1
      },
      {
        id: 4,
        title: "Cocinar brócoli",
        description: "Una vez caliente el aceite, agregar el brócoli, un poquito de sal, la ralladura del limón y dejar cocinar por 3 minutos.",
        duration: 3,
        tips: ["El brócoli debe quedar al dente, no sobrecocinar", "La ralladura de limón aporta aroma cítrico"]
      },
      {
        id: 5,
        title: "Agregar ajo",
        description: "Agregar el ajo hasta que suelte el aroma.",
        duration: 1,
        tips: ["El ajo se agrega al final para que no se queme", "Solo necesita 30-60 segundos hasta que suelte aroma"]
      },
      {
        id: 6,
        title: "Integrar pasta y finalizar",
        description: "Agrega el agua de la pasta reservada y queso parmesano, revuelve hasta integrar. Añade la pasta y jugo de limón, mezcla a fuego medio hasta que reduzca el agua.",
        duration: 3,
        tips: ["El agua de pasta ayuda a crear una salsa cremosa", "El jugo de limón se agrega al final para mantener frescura"]
      }
    ],
    nutritionInfo: {
      calories: 320,
      protein: "14g",
      carbs: "58g",
      fat: "6g",
      fiber: "4g"
    },
    beneficios: [
      "Brócoli: Rico en vitamina C que fortalece el sistema inmunitario",
      "Brócoli: Vitamina K importante para la salud ósea y coagulación sanguínea",
      "Brócoli: Folato esencial para la formación de glóbulos rojos y función celular",
      "Brócoli: Contiene sulforafano, un potente antioxidante anticancerígeno",
      "Brócoli: Fibra que favorece la digestión y salud intestinal",
      "Brócoli: Hierro que ayuda a prevenir la anemia",
      "Brócoli: Potasio que contribuye a la salud cardiovascular"
    ]
  },
  {
    id: "tacos-de-coliflor",
    title: "Tacos de Coliflor",
    description: "Una receta sencilla de hacer; se puede servir como plato fuerte o bien ser una colación entre cada comida. Con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Tacos_de_Coliflor.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 25,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Tacos", "Coliflor", "Air Fryer", "Saludable", "Vegetariano"],
    ingredients: [
      "1 coliflor grande Arca Tierra",
      "1 cucharada de paprika",
      "1 cucharada de comino",
      "1 cucharada de cebolla en polvo",
      "Sal al gusto",
      "Aceite de oliva",
      "Tortillas para servir",
      "Guacamole",
      "Cebolla encurtida"
    ],
    rating: 4.7,
    reviews: 84,
    steps: [
      {
        id: 1,
        title: "Preparar la coliflor",
        description: "Cortar la coliflor en trozos medianos y colocar en una charola para horno.",
        duration: 5,
        tips: ["Los trozos deben ser uniformes para cocción pareja", "Secar bien la coliflor después de lavarla"]
      },
      {
        id: 2,
        title: "Sazonar",
        description: "Mezclar la coliflor con aceite de oliva, paprika, comino, cebolla en polvo y sal al gusto hasta que esté bien cubierta.",
        duration: 3,
        tips: ["Usar suficiente aceite para que las especias se adhieran bien", "Mezclar con las manos para una distribución uniforme"]
      },
      {
        id: 3,
        title: "Cocinar en Air Fryer",
        description: "Meter a la Air Fryer a 180 grados centígrados por 20 minutos hasta que esté cocido y dorado.",
        duration: 20,
        tips: ["Agitar la canasta a la mitad del tiempo para cocción uniforme", "La coliflor debe estar tierna por dentro y dorada por fuera"]
      },
      {
        id: 4,
        title: "Servir",
        description: "Servir en tortillas con guacamole y cebolla encurtida.",
        duration: 2,
        tips: ["Calentar las tortillas antes de servir", "Agregar los toppings al gusto: guacamole, cebolla encurtida, salsa"]
      }
    ],
    nutritionInfo: {
      calories: 120,
      protein: "5g",
      carbs: "8g",
      fat: "8g",
      fiber: "3g"
    },
    beneficios: [
      "Coliflor: El sulforafano ayuda a prevenir el crecimiento de mutaciones celulares",
      "Coliflor: Rica en fibra, antioxidantes, vitamina C y ácido fólico",
      "Coliflor: Combate trastornos neurodegenerativos y lesiones neuronales por inflamación",
      "Coliflor: Reduce probabilidades de Parkinson y Alzheimer",
      "Coliflor: Rica en colina (45 mg por 100g) - 11% CDR mujeres, 8% CDR hombres",
      "Coliflor: Ayuda al hígado a expulsar grasa y evitar su acumulación"
    ]
  },
  {
    id: "dip-elote-estilo-esquites",
    title: "Dip de Elote Estilo Esquites",
    description: "Una receta tradicional para acompañar tus comidas o bien para disfrutar como aperitivo en cualquier momento del día. Con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Dip_de_Elote_Estilo_Esquites.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 15,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Dip", "Elote", "Esquites", "Tradicional mexicano", "Aperitivo"],
    ingredients: [
      "4 mazorcas de maíz Arca Tierra",
      "1 cucharada de mantequilla",
      "2 cucharadas de chipotle",
      "1/2 barra de queso crema",
      "2 cucharadas de mayonesa",
      "1 limón",
      "Sal al gusto",
      "Queso fresco",
      "Chile en polvo",
      "Tostadas para acompañar",
      "Epazote (opcional)"
    ],
    rating: 4.8,
    reviews: 91,
    steps: [
      {
        id: 1,
        title: "Preparar el elote",
        description: "En un sartén a fuego medio agregar la mantequilla y el elote, condimentar con sal y saltear. Puedes agregar epazote opcional.",
        duration: 8,
        tips: ["El elote debe quedar doradito pero tierno", "El epazote le da un sabor tradicional mexicano", "Saltear hasta que esté bien caliente y ligeramente caramelizado"]
      },
      {
        id: 2,
        title: "Mezclar ingredientes",
        description: "En un bowl mezclar el elote caliente con chipotle, jugo de limón, queso crema, mayonesa, queso fresco desmoronado y chile piquín.",
        duration: 5,
        tips: ["Mezclar mientras el elote está caliente para que se integre mejor el queso crema", "Ajustar la cantidad de chipotle según tu tolerancia al picante", "El queso fresco debe quedar en trocitos para dar textura"]
      },
      {
        id: 3,
        title: "Servir",
        description: "Servir con tostadas y disfrutar inmediatamente mientras está tibio.",
        duration: 2,
        tips: ["Servir tibio para mejor sabor", "Las tostadas crujientes contrastan perfectamente con la cremosidad del dip", "Puedes decorar con más chile en polvo y queso fresco por encima"]
      }
    ],
    nutritionInfo: {
      calories: 185,
      protein: "6g",
      carbs: "22g",
      fat: "12g",
      fiber: "3g"
    },
    beneficios: [
      "Maíz criollo: Propiedades antioxidantes, quimioprotectivas y antimutagénicas naturales",
      "Maíz criollo: Alto contenido en fibra que ayuda a reducir colesterol y triglicéridos",
      "Maíz criollo: Regula el tránsito intestinal de forma natural",
      "Maíz criollo: Libre de transgénicos, cultivado tradicionalmente en milpas",
      "Maíz criollo: Preserva las tradiciones culinarias de nuestros antepasados",
      "Maíz criollo: Mantiene la diversidad genética y protege a los agricultores"
    ]
  },
  {
    id: "zanahorias-asadas-tahini-zaatar",
    title: "Zanahorias Asadas con Aderezo de Tahini y Zaatar",
    description: "Una receta rápida y sencilla de hacer; se puede servir como entrada para plato fuerte o bien ser una colación entre cada comida. Con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Zanahorias_Asadas_Tahini_Zaatar.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 25,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Zanahorias asadas", "Tahini", "Zaatar", "Air Fryer", "Entrada", "Colación"],
    ingredients: [
      "Zanahorias Arca Tierra",
      "Aceite de oliva",
      "Sal al gusto",
      "Pimienta al gusto",
      "Yogurt griego",
      "Tahini",
      "Zaatar",
      "Jugo de limón",
      "Quinoa crujiente",
      "Pistaches",
      "Hemp (semillas de cáñamo)"
    ],
    rating: 4.6,
    reviews: 73,
    steps: [
      {
        id: 1,
        title: "Asar las zanahorias",
        description: "Asar las zanahorias Arca Tierra con un poco de aceite de oliva, sal y pimienta en la Air Fryer por 20 minutos a 180 grados centígrados.",
        duration: 20,
        tips: ["Cortar las zanahorias en bastones uniformes para cocción pareja", "No sobrecargar la canasta del Air Fryer", "Las zanahorias deben quedar doradas por fuera y tiernas por dentro"]
      },
      {
        id: 2,
        title: "Preparar aderezo de tahini",
        description: "En un bowl mezclar yogurt griego, tahini, zaatar, jugo de limón y sal hasta obtener consistencia cremosa.",
        duration: 3,
        tips: ["Ajustar la consistencia con más limón si queda muy espeso", "Probar y ajustar sal al gusto", "El zaatar debe integrarse bien para distribuir su sabor"]
      },
      {
        id: 3,
        title: "Servir y decorar",
        description: "Servir las zanahorias calientes con el aderezo de tahini, quinoa crujiente, pistaches y semillas de hemp por encima.",
        duration: 2,
        tips: ["Servir inmediatamente mientras las zanahorias están calientes", "Los pistaches y hemp aportan textura crujiente", "Puedes espolvorear zaatar extra para presentación"]
      }
    ],
    nutritionInfo: {
      calories: 195,
      protein: "8g",
      carbs: "18g",
      fat: "11g",
      fiber: "5g"
    },
    beneficios: [
      "Zanahoria: Carotenoides que el cuerpo convierte en vitamina A con propiedades antioxidantes",
      "Zanahoria: Fibra que ayuda a bajar la presión arterial y el colesterol",
      "Zanahoria: Potasio que ayuda a controlar la presión arterial y transmitir impulsos nerviosos",
      "Zanahoria: Diurético natural que ayuda a evitar la retención de líquidos",
      "Zanahoria: Ayudan al bronceado de manera natural y saludable",
      "Zanahoria: Combaten las placas en las arterias y mantienen buen flujo sanguíneo",
      "Zanahoria: El betacaroteno tiene propiedades antioxidantes que ayudan a regenerar la piel",
      "Zanahoria: Ayudan a proteger las retinas y evitar la aparición de cataratas"
    ]
  },
  {
    id: "salmorejo-cordobes",
    title: "Salmorejo Cordobés",
    description: "Una receta sencilla de hacer; se puede servir como primer tiempo ya que es una sopa fácil y rápida con diversos beneficios para la salud debido a sus ingredientes frescos y orgánicos.",
    image: "/images/recetas/Salmorejo_Cordobes.jpg",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 15,
    difficulty: "Fácil",
    season: "Verano",
    tags: ["Sopa fría", "Salmorejo", "Primer tiempo", "Andalucía", "Tradicional español"],
    ingredients: [
      "1 kilo de jitomate Arca Tierra (Tomates Heirloom agroecológicos de Huasca de Ocampo y Amanalco de Becerra)",
      "200 gramos de pan",
      "1 diente de ajo",
      "100 ml de aceite de oliva",
      "Sal al gusto",
      "Huevo cocido picado (para servir)",
      "Jamón serrano picado (para servir)",
      "Aceite de oliva extra (para servir)"
    ],
    rating: 4.7,
    reviews: 86,
    steps: [
      {
        id: 1,
        title: "Licuar ingredientes base",
        description: "Licuar el jitomate, el pan, ajo y sal hasta obtener mezcla homogénea.",
        duration: 10,
        tips: ["Usar jitomates muy maduros para mejor sabor", "El pan debe estar del día anterior, ligeramente duro", "Pelar los jitomates previamente si deseas textura más fina"]
      },
      {
        id: 2,
        title: "Emulsionar con aceite",
        description: "Al final añadir en hilo poco a poco el aceite de oliva mientras sigue licuando para emulsionar.",
        duration: 3,
        tips: ["Añadir aceite lentamente para lograr emulsión perfecta", "La consistencia debe ser cremosa pero no espesa", "Puedes colarlo si prefieres textura más lisa"]
      },
      {
        id: 3,
        title: "Servir",
        description: "Servir frío decorado con huevo cocido picado, jamón serrano picado y un chorrito de aceite de oliva.",
        duration: 2,
        tips: ["Enfriar en refrigerador antes de servir", "Decorar justo antes de servir para mejor presentación", "Acompañar con pan tostado si se desea"]
      }
    ],
    nutritionInfo: {
      calories: 145,
      protein: "4g",
      carbs: "16g",
      fat: "8g",
      fiber: "3g"
    },
    beneficios: [
      "Jitomate Heirloom: Rico en antioxidantes, remedio natural contra el envejecimiento",
      "Jitomate Heirloom: Contiene vitaminas A, B1, B2, y C, calcio, fósforo, potasio y sodio",
      "Jitomate Heirloom: Solo 18 calorías por 100 gramos, opción saludable y refrescante",
      "Jitomate Heirloom: Altos niveles de fibra mejoran el tránsito intestinal y previenen el estreñimiento",
      "Jitomate Heirloom: Ayuda a proteger la piel de las quemaduras del sol",
      "Jitomate Heirloom: Previene enfermedades cardiovasculares, hipertensión, obesidad, diabetes, cataratas y asma",
      "Jitomate Heirloom: Contribuye a fortalecer el sistema inmunológico"
    ]
  },
  {
    id: "tapas-berenjena-horno",
    title: "Tapas de Berenjena al Horno",
    description: "Una receta elegante y sofisticada que combina la textura cremosa de la berenjena asada con ingredientes frescos y queso de cabra. Perfecta como aperitivo o entrada.",
    image: "/images/recetas/Tapas_de_Berenjena_al_Horno.jpg",
    author: {
      name: "Záhie Téllez",
      bio: "Chef especializada en cocina mediterránea"
    },
    cookTime: 30,
    difficulty: "Medio",
    season: "Todo el año",
    tags: ["Tapas", "Berenjena", "Horno", "Aperitivo", "Mediterráneo", "Queso de cabra"],
    ingredients: [
      "1 berenjena blanca",
      "2 jitomates",
      "1/2 pepino",
      "100g de queso de cabra",
      "Hojas de menta",
      "2 cucharadas de azúcar",
      "2 cucharadas de aceite de oliva",
      "1 cucharada de salsa de soya",
      "1 cucharada de vinagre balsámico",
      "1 cucharada de aceite de aguacate",
      "1 cucharadita de ajo en polvo",
      "1/2 cucharadita de pimienta",
      "Sal al gusto"
    ],
    rating: 4.5,
    reviews: 67,
    steps: [
      {
        id: 1,
        title: "Preparar y hornear berenjena",
        description: "Cortar la berenjena blanca en rebanadas gruesas. Colocarlas sobre una charola para horno con papel encerado y agregar sal, pimienta, ajo en polvo y aceite de oliva en hilo. Hornear por 10 minutos a 160°C.",
        duration: 12,
        tips: ["Cortar rebanadas de 1.5 cm de grosor para mejor cocción", "Distribuir uniformemente los condimentos", "La berenjena debe estar dorada pero tierna"]
      },
      {
        id: 2,
        title: "Preparar marinado y vegetales",
        description: "Mezclar en un recipiente la salsa de soya, vinagre balsámico, aceite de aguacate, azúcar y pimienta. Cortar en rodajas gruesas el pepino y jitomate, barnizarlos con la mezcla y dejarlos reposar 10 minutos.",
        duration: 12,
        tips: ["Mezclar bien todos los ingredientes del marinado", "Las rodajas deben tener grosor similar para uniformidad", "El reposo permite que absorban los sabores"]
      },
      {
        id: 3,
        title: "Montar y emplatar",
        description: "Montar las berenjenas como base, encima colocar pepino, posteriormente jitomate y queso de cabra. Coronar con hojas de menta clavadas. Emplatar con el sobrante de la mezcla por encima.",
        duration: 6,
        tips: ["Crear torres equilibradas para mejor presentación", "Las hojas de menta deben ser frescas y aromáticas", "Rociar el marinado sobrante al momento de servir"]
      }
    ],
    nutritionInfo: {
      calories: 155,
      protein: "7g",
      carbs: "12g",
      fat: "10g",
      fiber: "4g"
    },
    beneficios: [
      "Berenjena: Rica en antioxidantes, especialmente antocianinas que protegen las células del daño oxidativo",
      "Berenjena: Fibra dietética que mejora la digestión y ayuda a mantener niveles saludables de colesterol",
      "Berenjena: Baja en calorías, excelente para control de peso, solo 25 calorías por 100g",
      "Berenjena: Potasio importante para la salud cardiovascular y regulación de la presión arterial",
      "Berenjena: Ácido fólico esencial para la formación de glóbulos rojos y función neurológica",
      "Berenjena: Vitamina K necesaria para la coagulación sanguínea y salud ósea"
    ]
  },
  {
    id: "tomates-verdes-fritos",
    title: "Tomates Verdes Fritos",
    description: "Una botana sencilla y saludable para acompañar nuestras tardes o antojos de fin de semana. Nos puede ayudar para reemplazar las botanas procesadas dándonos un increíble gusto y sabor.",
    image: "/images/recetas/Tomates_Verdes_Fritos.png",
    author: {
      name: "Chef Black Mamba",
      bio: "Chef especializado en cocina fusion con ingredientes orgánicos"
    },
    cookTime: 25,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Botana", "Tomates verdes", "Fritos", "Mexicano", "Snack saludable"],
    ingredients: [
      "Tomates verdes (mini Arca Tierra)",
      "Harina de trigo",
      "Huevos batidos",
      "Panko",
      "Sal",
      "Ajo en polvo",
      "Cebolla en polvo",
      "Comino o paprika (opcional)",
      "Aceite de canola",
      "Queso feta (para aderezo)",
      "Yogurt griego (para aderezo)",
      "Jugo de limón (para aderezo)",
      "Aceite de oliva (para aderezo)",
      "Alcaparras o aceitunas picadas (opcional para aderezo)"
    ],
    rating: 4.4,
    reviews: 58,
    steps: [
      {
        id: 1,
        title: "Preparar tomates verdes",
        description: "Lavar y limpiar bien los tomates verdes. Cortar en rebanadas si son grandes o usar enteros si son mini.",
        duration: 8,
        tips: ["Los tomates verdes mini son ideales para esta receta", "Secar bien después de lavar para mejor adherencia", "Cortar en rebanadas uniformes de 1cm si son grandes"]
      },
      {
        id: 2,
        title: "Empanizar",
        description: "Pasar primero en huevo batido, luego en harina condimentada con sal, ajo y cebolla en polvo (puedes añadir paprika o comino opcional). Pasar una vez más en huevo y finalizar con panko.",
        duration: 10,
        tips: ["El doble empanizado da mejor textura y crujiente", "Condimentar bien la harina para más sabor", "Presionar ligeramente el panko para que se adhiera"]
      },
      {
        id: 3,
        title: "Freír o Air Fryer",
        description: "Freír en aceite caliente hasta que queden doraditos. Alternativamente, usar Air Fryer para versión más saludable.",
        duration: 7,
        tips: ["El aceite debe estar a temperatura media-alta", "No sobrecargar la sartén o Air Fryer", "Air Fryer: 180°C por 8-10 minutos, volteando a la mitad"]
      },
      {
        id: 4,
        title: "Preparar aderezo",
        description: "Licuar queso feta con yogurt griego, jugo de limón, sal, aceite de oliva. Opcional: añadir alcaparras o aceitunas picadas.",
        duration: 3,
        tips: ["Ajustar consistencia con más yogurt si está muy espeso", "Probar y ajustar sal y limón al gusto", "Las alcaparras añaden un toque mediterráneo delicioso"]
      }
    ],
    nutritionInfo: {
      calories: 165,
      protein: "6g",
      carbs: "18g",
      fat: "8g",
      fiber: "3g"
    },
    beneficios: [
      "Tomates verdes: El betacaroteno presente ayuda a producir vitamina A, esencial para la salud ocular",
      "Tomates verdes: Elimina la caspa y combate la calvicie con propiedades nutritivas para el cabello",
      "Tomates verdes: Reducen el dolor de oídos con propiedades antiinflamatorias naturales",
      "Tomates verdes: Alivia molestias en el estómago con efecto digestivo y calmante",
      "Tomates verdes: Efectivo para problemas respiratorios con propiedades expectorantes",
      "Tomates verdes: Baja los niveles de presión en la sangre regulando naturalmente"
    ],
    comments: [
      {
        id: "tomates-verdes-c1",
        recipeId: "tomates-verdes-fritos",
        userId: "user15",
        userName: "Patricia Moreno",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face",
        comment: "¡Estos tomates verdes fritos son una revelación! La textura crujiente por fuera y tierna por dentro es perfecta. Nunca había probado tomates verdes y ahora son mi obsesión.",
        date: "2024-07-15",
        likes: 19,
        replies: [
          {
            id: "tomates-verdes-r1",
            userName: "Carlos Herrera",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Totalmente! En el sur de Estados Unidos es un clásico, pero aquí en México está empezando a conocerse. ¡Qué bueno que Arca Tierra los incluya!",
            date: "2024-07-16"
          }
        ]
      }
    ]
  },
  {
    id: "chimichurri",
    title: "Chimichurri",
    description: "Una salsa argentina clásica y versátil que acompaña perfectamente carnes, vegetales asados, empanadas y múltiples platillos. Su frescor y sabor intenso lo convierten en el condimento perfecto para realzar cualquier comida.",
    image: "/images/recetas/Chimichurri.jpg",
    author: {
      name: "Záhie Téllez",
      bio: "Chef especializada en cocina mediterránea"
    },
    cookTime: 10,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Salsa", "Chimichurri", "Argentino", "Condimento", "Acompañamiento"],
    ingredients: [
      "1 taza de perejil fresco",
      "1 taza de agua",
      "1 cucharadita de sal",
      "1 cucharada de ajo confitado",
      "2 cucharadas de orégano seco",
      "2 cucharaditas de chile seco quebrado",
      "1/4 de taza de vinagre",
      "1/2 taza de aceite de oliva"
    ],
    rating: 4.8,
    reviews: 92,
    steps: [
      {
        id: 1,
        title: "Preparar perejil",
        description: "Picar el perejil finamente y colocarlo en un recipiente junto con el orégano, chile seco quebrado, ajo confitado y sal.",
        duration: 3,
        tips: ["El perejil debe estar bien seco para evitar que el chimichurri se aguace", "Picar fino pero sin triturar para mantener textura", "El ajo confitado aporta sabor suave y dulce"]
      },
      {
        id: 2,
        title: "Mezclar ingredientes secos",
        description: "Mezclar todos los ingredientes secos hasta integrar bien los sabores.",
        duration: 2,
        tips: ["Asegurar que todos los condimentos se distribuyan uniformemente", "El chile quebrado debe estar en trozos pequeños", "Dejar reposar un momento para que se mezclen los aromas"]
      },
      {
        id: 3,
        title: "Incorporar líquidos",
        description: "Agregar el aceite de oliva y el vinagre, mezclar bien hasta obtener consistencia homogénea.",
        duration: 3,
        tips: ["Incorporar aceite gradualmente para mejor emulsión", "El vinagre aporta acidez necesaria para equilibrar sabores", "Probar y ajustar sal si es necesario"]
      },
      {
        id: 4,
        title: "Reservar",
        description: "Guardar en el refrigerador en un recipiente con tapa. Dejar reposar al menos 30 minutos antes de servir.",
        duration: 2,
        tips: ["El reposo permite que se integren todos los sabores", "Se conserva hasta 1 semana en refrigerador", "Sacar unos minutos antes de servir para mejor sabor"]
      }
    ],
    nutritionInfo: {
      calories: 45,
      protein: "1g",
      carbs: "2g",
      fat: "4g",
      fiber: "1g"
    },
    comments: [
      {
        id: "chimichurri-c1",
        recipeId: "chimichurri",
        userId: "user16",
        userName: "Diego Fernández",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        comment: "¡Este chimichurri es exactamente como el que hacía mi abuela argentina! El secreto está en dejar reposar para que se integren todos los sabores. Lo uso para todo: asados, empanadas, vegetales.",
        date: "2024-06-08",
        likes: 22,
        replies: [
          {
            id: "chimichurri-r1",
            userName: "Valentina Rojas",
            userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
            comment: "¡Qué bueno encontrar una receta auténtica! En Argentina cada familia tiene su versión, pero esta está perfecta.",
            date: "2024-06-09"
          }
        ]
      }
    ]
  },
  {
    id: "fideos-de-calabaza",
    title: "Fideos de Calabaza",
    description: "Una alternativa saludable y deliciosa a la pasta tradicional, utilizando calabacines frescos cortados en tiras delgadas y bañados en una cremosa salsa de cilantro. Perfecto como plato principal ligero o acompañamiento sofisticado.",
    image: "/images/recetas/Fideos_de_Calabaza.jpg",
    author: {
      name: "Záhie Téllez",
      bio: "Chef especializada en cocina mediterránea"
    },
    cookTime: 20,
    difficulty: "Fácil",
    season: "Todo el año",
    tags: ["Fideos de calabaza", "Zucchini noodles", "Pasta saludable", "Cilantro", "Bajo en carbohidratos"],
    ingredients: [
      "4 calabazas (calabacines)",
      "2 dientes de ajo finamente picados",
      "1 cebolla finamente picada",
      "1/2 taza de cilantro",
      "250ml de media crema",
      "2 cucharadas de aceite de oliva",
      "2 cucharadas de mantequilla",
      "1/4 taza de queso parmesano",
      "1 cucharadita de sal",
      "1 cucharadita de pimienta"
    ],
    rating: 4.6,
    reviews: 78,
    steps: [
      {
        id: 1,
        title: "Preparar fideos de calabaza",
        description: "Cortar los calabacines con cáscara en tiras delgadas tipo fideos. En una sartén con aceite de oliva agregar los fideos de calabacín con sal y pimienta.",
        duration: 5,
        tips: ["Usar un pelador de vegetales o espiralizador para tiras uniformes", "No pelar los calabacines para mantener nutrientes", "Las tiras deben ser delgadas pero no demasiado finas"]
      },
      {
        id: 2,
        title: "Saltear fideos",
        description: "Mover por 3 minutos, agregar una cucharada de agua natural, tapar y dejar que se suavicen.",
        duration: 5,
        tips: ["No sobrecocinar para mantener textura al dente", "El agua ayuda a crear vapor para cocción uniforme", "Deben quedar tiernos pero firmes"]
      },
      {
        id: 3,
        title: "Preparar salsa de cilantro",
        description: "Agregar en una licuadora la cebolla en trozos, el ajo, cilantro, la media crema, sal y pimienta. Licuar hasta tener una mezcla homogénea.",
        duration: 5,
        tips: ["Lavar bien el cilantro antes de usar", "La cebolla puede saltearse ligeramente antes si prefieres sabor más suave", "Ajustar consistencia con más crema si es necesario"]
      },
      {
        id: 4,
        title: "Combinar y finalizar",
        description: "Agregar en una sartén mantequilla y la salsa. Dejar cocinar hasta que hierva. Agregar los fideos a la salsa y dejar cocinar por 5 minutos. Emplatar con queso parmesano por encima.",
        duration: 5,
        tips: ["La mantequilla enriquece la salsa y le da brillo", "No hervir por mucho tiempo para evitar que se corte la crema", "Servir inmediatamente con parmesano recién rallado"]
      }
    ],
    nutritionInfo: {
      calories: 180,
      protein: "8g",
      carbs: "12g",
      fat: "13g",
      fiber: "3g"
    },
    comments: [
      {
        id: "fideos-calabaza-c1",
        recipeId: "fideos-de-calabaza",
        userId: "user17",
        userName: "Ana Carolina Vega",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        comment: "¡Estos fideos de calabaza son geniales para cuando quiero comer pasta pero más saludable! La salsa de cilantro está increíble y mi familia ni siquiera notó que no era pasta real.",
        date: "2024-06-15",
        likes: 31,
        replies: [
          {
            id: "fideos-calabaza-r1",
            userName: "Roberto Silva",
            userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            comment: "¡Perfecta para keto! Me gusta que mantenga la textura al dente. La salsa de cilantro es un toque genial.",
            date: "2024-06-16"
          }
        ]
      }
    ]
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
