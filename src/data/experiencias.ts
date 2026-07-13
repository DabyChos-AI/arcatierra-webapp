export interface Badge {
  type: 'popular' | 'nuevo' | 'destacado' | 'familiar' | 'privada' | 'publica' | 'educativa';
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
}

export interface Experiencia {
  id: string;
  slug: string;
  nombre: string;
  tipo: 'publica' | 'privada';
  precio: {
    base: number;
    nino?: number | null;
    adicional?: number;
    capacidad: string;
  };
  seo: {
    title: string;
    description: string;
  };
  imagen: string;
  galeria_imagenes?: string[];
  badges: Badge[];
  descripcionCorta: string;
  descripcionCompleta: string;
  duracion: string;
  incluye: string[];
  informacion_importante?: string[];
  categoria: 'gastronomica' | 'familiar' | 'educativa' | 'recorrido';
}

export const badges: Record<string, Badge> = {
  popular: {
    type: 'popular',
    label: 'Más Popular',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
    icon: '🔥'
  },
  nuevo: {
    type: 'nuevo',
    label: 'Nuevo',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    icon: '✨'
  },
  destacado: {
    type: 'destacado',
    label: 'Destacado',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
    icon: '⭐'
  },
  familiar: {
    type: 'familiar',
    label: 'Familiar',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    icon: '👨‍👩‍👧‍👦'
  },
  privada: {
    type: 'privada',
    label: 'Privada',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    icon: '🔒'
  },
  publica: {
    type: 'publica',
    label: 'Pública',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-green-600 to-green-500',
    icon: '🌟'
  },
  educativa: {
    type: 'educativa',
    label: 'Educativa',
    color: 'text-white',
    bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    icon: '🎓'
  }
};

export const experiencias: Experiencia[] = [
  // EXPERIENCIAS PÚBLICAS
  {
    id: "S-EXP-PUB-001",
    slug: "amanecer-chinampero",
    nombre: "Amanecer Chinampero",
    tipo: "publica",
    precio: {
      base: 990,
      capacidad: "Disponible para reserva directa"
    },
    seo: {
      title: "Reserva aquí tu Amanecer Chinampero | Arca Tierra",
      description: "Amanecer en los canales de Xochimilco con desayuno preparado con la cosecha del día y recorrido guiado. Una experiencia de 3 horas en la naturaleza."
    },
    imagen: "/images/experiencias/AMANECERCHINAMPERO.jpg",
    badges: [badges.popular, badges.publica, badges.destacado],
    descripcionCorta: "Contempla el amanecer desde los canales de Xochimilco con desayuno gourmet",
    descripcionCompleta: "Contempla una vista inolvidable del amanecer desde los canales de Xochimilco y aprecia la belleza de las chinampas cuando el sol se asoma en el horizonte. Nuestros chefs de la casa te recibirán con un desayuno tan único como el amanecer. El menú es de tres tiempos elaborados en nuestra cocina de humo, con maíz nativo proveniente de Xochimilco e Hidalgo y vegetales frescos provenientes de nuestra red agrícola. También incluye un delicioso panqué, ensalada con la cosecha del día, café de olla, té herbal y agua fresca de temporada.",
    duracion: "3 horas",
    incluye: ["🍳 Desayuno de 3 tiempos", "🚤 Recorrido guiado", "☕ Café de olla", "🌿 Té herbal", "🥤 Agua fresca"],
    categoria: "recorrido"
  },
  {
    id: "S-EXP-PUB-002",
    slug: "brunch-en-domingo",
    nombre: "Brunch en Domingo",
    tipo: "publica",
    precio: {
      base: 990,
      capacidad: "Disponible para reserva directa"
    },
    seo: {
      title: "Disfruta de nuestro Brunch en Domingo en Xochimilco | Arca Tierra",
      description: "Disfrute de un delicioso brunch en la Chinampa del Sol. Menú de temporada con ingredientes frescos de nuestras chinampas en Xochimilco."
    },
    imagen: "/images/experiencias/BRUNCHENDOMINGO.jpg",
    badges: [badges.familiar, badges.publica],
    descripcionCorta: "Brunch dominical en la Chinampa del Sol con ingredientes de temporada",
    descripcionCompleta: "Un domingo al mes podrás disfrutar de un delicioso brunch en la Chinampa del Sol, preparado por nuestros chefs de la casa. La experiencia incluye café de olla, agua fresca, cervezas bien frías y un menú de temporada a base de maíz criollo y ensalada con la cosecha del día. En un breve recorrido guiado por la Chinampa del Sol, podrás aprender sobre agricultura regenerativa.",
    duracion: "3 horas",
    incluye: ["🥐 Brunch completo", "☕ Café de olla", "🥤 Agua fresca", "🍺 Cervezas", "🚤 Recorrido guiado"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-PUB-003",
    slug: "chinampa-en-familia",
    nombre: "Chinampa en Familia",
    tipo: "publica",
    precio: {
      base: 990,
      capacidad: "Adultos y niños mismo precio"
    },
    seo: {
      title: "Disfruta en familia de Chinampa en Familia | Arca Tierra",
      description: "Experiencia única para disfrutar en familia en las chinampas de Xochimilco. Actividades para niños y adultos en contacto con la naturaleza."
    },
    imagen: "/images/experiencias/CHINAMPAENFAMILIA.jpeg",
    badges: [badges.familiar, badges.publica, badges.destacado],
    descripcionCorta: "Experiencia familiar con actividades agroecológicas para niños",
    descripcionCompleta: "En conjunto con Huertos Milpa Azul, te ofrecemos una experiencia única pensada especialmente para familias en donde buscamos que en compañía de las infancias, descubran un vínculo con la agricultura y ecología de una forma divertida. Al llegar a la chinampa, servimos un brunch elaborado a base de maíz criollo y con alimentos de temporada para después, llevarles en un recorrido guiado por la Chinampa y actividades y dinámicas agroecológicas para las infancias.",
    duracion: "4 horas",
    incluye: ["👨‍👩‍👧‍👦 Brunch familiar", "🎨 Actividades para niños", "🚤 Recorrido guiado", "🌱 Dinámicas agroecológicas"],
    categoria: "familiar"
  },
  {
    id: "S-EXP-PUB-004",
    slug: "amanecer-chinampero-curious-mexican",
    nombre: "Amanecer Chinampero con The Curious Mexican",
    tipo: "publica",
    precio: {
      base: 1180,
      capacidad: "Disponible para reserva directa"
    },
    seo: {
      title: "Agenda aquí Amanecer con The Curious Mexican | Arca Tierra",
      description: "Agenda esta inolvidable amanecer desde los canales de Xochimilco con The Curious Mexican. Una experiencia única de turismo gastronómico."
    },
    imagen: "/images/experiencias/foto_amanecer.png",
    badges: [badges.nuevo, badges.publica, badges.destacado],
    descripcionCorta: "Amanecer curado por The Curious Mexican con chef invitado",
    descripcionCompleta: "Ven a disfrutar del Amanecer Chinampero curado, operado y organizado con The Curious Mexican. Enamórate de los canales de Xochimilco mientras observas el sol salir desde el horizonte. Deleita tus sentidos con un delicioso desayuno preparado a manos de un chef invitado por The Curious Mexican quien servirá un desayuno preparado con alimentos frescos de la red arca tierra. La experiencia dura tres horas y el recorrido se da en inglés y español.",
    duracion: "3 horas",
    incluye: ["👨‍🍳 Chef invitado", "🍳 Desayuno gourmet", "🌍 Recorrido bilingüe", "✨ Experiencia curada"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-PUB-005",
    slug: "comidas-chinamperas",
    nombre: "Comidas Chinamperas",
    tipo: "publica",
    precio: {
      base: 1850,
      capacidad: "Disponible para reserva directa"
    },
    seo: {
      title: "Comidas chinamperas, sabores con raíz y temporada | Arca Tierra",
      description: "Cada mes, chefs invitados cocinan en Xochimilco con ingredientes de temporada. Menú degustación con productos de nuestras chinampas."
    },
    imagen: "/images/experiencias/COMIDASCHINAMPERAS.jpg",
    badges: [badges.destacado, badges.publica],
    descripcionCorta: "Colaboración con chefs invitados y menú de temporada",
    descripcionCompleta: "Las comidas chinamperas son una colaboración entre arca tierra y los cocineros y cocineras de México y el mundo que comparten nuestros valores de sustentabilidad, trazabilidad y compromiso con el campo. Estas experiencias se realizan con invitados distintos.",
    duracion: "4 horas",
    incluye: ["👨‍🍳 Chef invitado", "🍽️ Menú degustación", "🌿 Ingredientes de temporada", "🤝 Experiencia colaborativa"],
    categoria: "gastronomica"
  },

  // EXPERIENCIAS PRIVADAS
  {
    id: "S-EXP-EVE-001",
    slug: "arcano-por-un-dia",
    nombre: "Arcano por un Día",
    tipo: "privada",
    precio: {
      base: 7000,
      adicional: 700,
      capacidad: "1-10 personas"
    },
    seo: {
      title: "Experiencia Privada Arcano por un día | Arca Tierra",
      description: "Recorre los canales de Xochimilco y conoce de cerca el trabajo de los chinamperos. Experiencia privada de día completo."
    },
    imagen: "/images/experiencias/ARCANOPORUNDIA.jpg",
    badges: [badges.privada, badges.educativa],
    descripcionCorta: "Día completo conociendo el trabajo de los chinamperos",
    descripcionCompleta: "Ven a conocer la Chinampa del Sol. Recorre los canales de Xochimilco, conoce cómo funciona la chinampa, quiénes la trabajan y aprende de agroecología y agricultura regenerativa.",
    duracion: "Día completo",
    incluye: ["🚤 Recorrido completo", "🌱 Aprendizaje agroecológico", "👥 Interacción con chinamperos", "📚 Experiencia educativa"],
    categoria: "educativa"
  },
  {
    id: "S-EXP-EVE-002",
    slug: "del-comal-a-la-huerta",
    nombre: "Del Comal a la Huerta",
    tipo: "privada",
    precio: {
      base: 9900,
      adicional: 1100,
      capacidad: "1-9 personas"
    },
    seo: {
      title: "Experiencia del Comal a la Huerta en Xochimilco | Arca Tierra",
      description: "Vive la experiencia en las chinampas de Xochimilco desde la cosecha hasta el plato. Turismo rural y gastronomía mexicana auténtica."
    },
    imagen: "/images/experiencias/DELCOMALALAHUERTA.jpg",
    badges: [badges.privada, badges.popular],
    descripcionCorta: "De la cosecha al plato en experiencia gastronómica completa",
    descripcionCompleta: "Disfruta de un delicioso desayuno, brunch o comida elaborado por nuestras chefs de la casa. El menú es de tres tiempos elaborados en nuestra cocina de humo, con maíz nativo proveniente de Xochimilco e Hidalgo y vegetales frescos provenientes de nuestra red agrícola. También incluye ensalada con la cosecha del día, café de olla, té herbal y agua fresca de temporada.",
    duracion: "4 horas",
    incluye: ["🍽️ Menú 3 tiempos", "🔥 Cocina de humo", "🌽 Maíz nativo", "🥗 Cosecha del día"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-EVE-003",
    slug: "de-las-cazuelas",
    nombre: "De las Cazuelas",
    tipo: "privada",
    precio: {
      base: 9900,
      adicional: 1100,
      capacidad: "1-9 personas"
    },
    seo: {
      title: "Agenda Experiencia Privada Menú de Cazuelas | Arca Tierra",
      description: "Experiencia privada con recorrido guiado y un menú de guisados tradicionales, arroz, frijoles, ensalada de chinampa, tortillas de maíz hechas a mano."
    },
    imagen: "/images/experiencias/DELASCAZUELAS.jpg",
    badges: [badges.privada, badges.destacado],
    descripcionCorta: "Menú tradicional de guisados en cazuelas de barro",
    descripcionCompleta: "Esta experiencia incluye un menú de guisados tradicionales elaborados con alimentos de la red arca tierra y con acompañamientos especiales como arroz, frijoles, ensalada de nopal y tortillas hechas a mano.",
    duracion: "3 horas",
    incluye: ["🍲 Guisados tradicionales", "🫓 Tortillas hechas a mano", "🌵 Ensalada de nopal", "🚤 Recorrido guiado"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-EVE-004",
    slug: "amanecer-chinampero-privado",
    nombre: "Amanecer Chinampero Privado",
    tipo: "privada",
    precio: {
      base: 9900,
      adicional: 1100,
      capacidad: "1-9 personas"
    },
    seo: {
      title: "Reserva aquí tu Amanecer Chinampero Privado | Arca Tierra",
      description: "Amanecer en los canales de Xochimilco con desayuno preparado con la cosecha del día y recorrido guiado. Una experiencia privada de 3 horas en la naturaleza."
    },
    imagen: "/images/experiencias/AMANECERCHINAMPERO.jpg",
    badges: [badges.privada, badges.popular],
    descripcionCorta: "Amanecer exclusivo para tu grupo privado",
    descripcionCompleta: "Contempla una vista inolvidable del amanecer desde los canales de Xochimilco y aprecia la belleza de las chinampas cuando el sol se asoma en el horizonte. Nuestros chefs de la casa te recibirán con un desayuno tan único como el amanecer. El menú es de tres tiempos elaborados en nuestra cocina de humo, con maíz nativo proveniente de Xochimilco e Hidalgo y vegetales frescos provenientes de nuestra red agrícola.",
    duracion: "3 horas",
    incluye: ["🔒 Experiencia privada", "🍳 Desayuno 3 tiempos", "🚤 Recorrido exclusivo", "🔥 Cocina de humo"],
    categoria: "recorrido"
  },
  {
    id: "S-EXP-EVE-005",
    slug: "delicias-de-la-chinampa",
    nombre: "Delicias de la Chinampa",
    tipo: "privada",
    precio: {
      base: 10000,
      adicional: 1250,
      capacidad: "1-9 personas"
    },
    seo: {
      title: "Experiencia privada Delicias de la chinampa | Arca Tierra",
      description: "Menú de cuatro tiempos que puede incluir sopa o gorditas de maíz, dos guisados, arroz, frijoles y postre. Experiencia privada con capacidad de hasta 100 personas."
    },
    imagen: "/images/experiencias/DELICIASDELACHINAMPA.jpg",
    badges: [badges.privada, badges.destacado],
    descripcionCorta: "Menú de cuatro tiempos con especialidades de la chinampa",
    descripcionCompleta: "Disfruta de un menú de cuatro tiempos preparado por nuestros chefs de la casa que puede incluir ensalada, sopa, guisado y postre, todo de temporada.",
    duracion: "4 horas",
    incluye: ["🍽️ Menú 4 tiempos", "🌿 Ingredientes de temporada", "🏝️ Especialidades de chinampa", "👥 Hasta 100 personas"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-EVE-006",
    slug: "del-campo-a-la-barra",
    nombre: "Del Campo a la Barra",
    tipo: "privada",
    precio: {
      base: 24000,
      adicional: 2400,
      capacidad: "1-9 personas"
    },
    seo: {
      title: "Agenda Experiencia Privada Del Campo a Barra | Arca Tierra",
      description: "Degustación de destilados mexicanos de varias regiones del país. Incluye menú de antojitos mexicanos, recorrido por los canales de Xochimilco y las chinampas."
    },
    imagen: "/images/experiencias/DELCAMPOALABARRA.jpg",
    badges: [badges.privada, badges.nuevo, badges.destacado],
    descripcionCorta: "Degustación premium de destilados mexicanos",
    descripcionCompleta: "Disfruta una degustación única de destilados mexicanos de distintas regiones del país. Esta experiencia está acompañada de un menú de antojitos mexicanos elaborados a base de maíz criollo azul, alimentos de la red arca tierra y ensalada fresca de la chinampa.",
    duracion: "5 horas",
    incluye: ["🥃 Destilados premium", "🌮 Antojitos mexicanos", "🌽 Maíz criollo azul", "🚤 Recorrido por canales"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-EVE-007",
    slug: "cocina-de-temporada",
    nombre: "Cocina de Temporada",
    tipo: "privada",
    precio: {
      base: 19900,
      adicional: 1990,
      capacidad: "1-10 personas"
    },
    seo: {
      title: "Vive la Experiencia Privada de Cocina de Temporada | Arca Tierra",
      description: "Experiencia con menú de cuatro tiempos donde los vegetales son protagonistas. Bebidas limitadas. Experiencia privada con capacidad de hasta 100 personas."
    },
    imagen: "/images/experiencias/COCINADETEMPORADA.jpg",
    badges: [badges.privada, badges.destacado],
    descripcionCorta: "Menú vegetal de temporada con maridaje incluido",
    descripcionCompleta: "Sumérgete en una experiencia gastronómica única, donde cada platillo cuenta una historia y donde los vegetales son protagonistas. Déjate sorprender por un menú de cuatro tiempos cuidadosamente diseñado para deleitar tus sentidos y satisfacer tu paladar. Ideal para aquellos que buscan experiencias culinarias a la medida, esta experiencia te ofrece la oportunidad de disfrutar de una comida excepcional, acompañada de 2 copas de vino o 2 cervezas por persona.",
    duracion: "4 horas",
    incluye: ["🍽️ Menú 4 tiempos", "🥬 Vegetales protagonistas", "🍷 2 copas de vino/cervezas", "👥 Hasta 100 personas"],
    categoria: "gastronomica"
  },
  {
    id: "S-EXP-EVE-008",
    slug: "taller-de-cocina",
    nombre: "Taller de Cocina",
    tipo: "privada",
    precio: {
      base: 19500,
      adicional: 1950,
      capacidad: "1-10 personas"
    },
    seo: {
      title: "Experiencia Privada Taller de Cocina en la Chinampa | Arca Tierra",
      description: "Taller de cocina en la chinampa. Cosecharás ingredientes frescos y aprenderás a preparar platillos desde cero. ¡Reserva ahora esta experiencia única!"
    },
    imagen: "/images/experiencias/TALLERDECOCINACONMARIANAOROZCO.jpg",
    badges: [badges.privada, badges.educativa, badges.familiar],
    descripcionCorta: "Aprende a cocinar con ingredientes frescos de la chinampa",
    descripcionCompleta: "Disfruta de un taller de cocina en el que tú y tus acompañantes podrán preparar platillos deliciosos. Incluye todos los utensilios necesarios para que cocines las recetas, así como un recorrido guiado por los canales de Xochimilco y por la Chinampa del Sol.",
    duracion: "5 horas",
    incluye: ["👨‍🍳 Taller hands-on", "🔪 Utensilios incluidos", "🚤 Recorrido guiado", "🌿 Ingredientes frescos"],
    categoria: "educativa"
  },
  {
    id: "S-EXP-EVE-009",
    slug: "taller-cocina-mariana-orozco",
    nombre: "Taller de Cocina con Mariana Orozco",
    tipo: "privada",
    precio: {
      base: 19600,
      adicional: 1960,
      capacidad: "1-10 personas"
    },
    seo: {
      title: "Taller de Cocina con Mariana Orozco en Xochimilco | Arca Tierra",
      description: "Taller especializado de cocina mexicana con la chef Mariana Orozco. Aprende técnicas tradicionales en las chinampas de Xochimilco."
    },
    imagen: "/images/experiencias/TALLERDECOCINACONMARIANAOROZCO.jpg",
    badges: [badges.privada, badges.nuevo, badges.educativa],
    descripcionCorta: "Taller exclusivo con la reconocida chef Mariana Orozco",
    descripcionCompleta: "Disfruta de un taller de cocina con la Chef Mariana Orozco en el que tú y tus acompañantes podrán preparar platillos deliciosos. Incluye todos los utensilios necesarios para que cocines las recetas, así como un recorrido guiado por los canales de Xochimilco y por la Chinampa del Sol.",
    duracion: "5 horas",
    incluye: ["👩‍🍳 Chef Mariana Orozco", "🎓 Taller especializado", "🔪 Utensilios incluidos", "🚤 Recorrido guiado"],
    categoria: "educativa"
  }
];

