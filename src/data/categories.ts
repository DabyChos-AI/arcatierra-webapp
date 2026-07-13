/**
 * Categorías de productos para compra rápida
 * Slider horizontal en el home
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  link: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Experiencias",
    slug: "experiencias",
    description: "Vive el campo mexicano de cerca",
    image: "/images/home/chinampas_xochimilco.png",
    link: "/experiencias"
  },
  {
    id: 2,
    name: "Canastas agroecológicas",
    slug: "canastas",
    description: "Frescura directo del campo",
    image: "/images/canastas/canastafamiliar.jpg",
    link: "/suscripciones"
  },
  {
    id: 3,
    name: "Proteínas regenerativas",
    slug: "proteinas",
    description: "Carne sustentable",
    image: "/images/home/PROTEINAS REGENERATIVAS_ 251016_ARCA_113.jpg",
    link: "/tienda?categoria=proteinas"
  },
  {
    id: 4,
    name: "Frutas y verduras",
    slug: "frutas-verduras",
    description: "De temporada y agroecológicas",
    image: "/images/tienda/frutas_y_verduras.jpg",
    link: "/tienda?categoria=frutas-verduras"
  },
  {
    id: 5,
    name: "Granos y cereales",
    slug: "granos",
    description: "Básicos ancestrales",
    image: "/images/home/GRANOS Y CEREALES_251016_ARCA_069.jpg",
    link: "/tienda?categoria=granos"
  },
  {
    id: 6,
    name: "Huevo y lácteos",
    slug: "lacteos",
    description: "De animales felices",
    image: "/images/tienda/huevos_y_lacteos.jpg",
    link: "/tienda?categoria=lacteos"
  }
];
