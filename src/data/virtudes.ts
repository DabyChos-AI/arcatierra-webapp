/**
 * Virtudes y valores de Arca Tierra
 * Sección que comunica el impacto y filosofía de la organización
 */

import { LucideIcon } from 'lucide-react';

export interface Virtud {
  id: number;
  icon: string; // Nombre del icono de lucide-react
  title: string;
  description: string;
}

export const virtudes: Virtud[] = [
  {
    id: 1,
    icon: "Leaf",
    title: "Del campo a tu mesa, sin intermediarios",
    description: "Alimentos agroecológicos cultivados con respeto por la tierra y las personas. Pagamos precios que valoran el trabajo campesino y fortalecen la vida rural."
  },
  {
    id: 2,
    icon: "Users",
    title: "Una red que cultiva futuro",
    description: "Más de 60 familias campesinas regeneran suelos y abastecen la ciudad con productos locales."
  },
  {
    id: 3,
    icon: "ChefHat",
    title: "Sabor con propósito",
    description: "De Xochimilco a las mejores cocinas: trazabilidad, frescura y sabor en cada entrega."
  },
  {
    id: 4,
    icon: "TreePine",
    title: "Comer bien también regenera el planeta",
    description: "Rutas locales, empaques retornables y prácticas que reducen nuestra huella ambiental."
  }
];
