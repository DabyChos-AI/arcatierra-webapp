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

// ORF1 (R7): aquí vivía `experiencias`, un arreglo con precios inventados que solo leía
// `components/experiencias/ExperienciasPrivadas.tsx` (huérfano, archivado). Las experiencias salen de la API;
// este archivo conserva los tipos (`Experiencia`, `Badge`) y `badges`.
