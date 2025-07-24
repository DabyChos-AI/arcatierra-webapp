// src/data/categorias.ts
// CATEGORÍAS SEO EXACTAS DEL USUARIO - SIN DATOS INVENTADOS
// FUENTE: Mensaje del usuario con datos de SEO de categorías de tienda

export interface CategoriaSEO {
  metaTitle: string;
  metaDescription: string;
}

// DATOS EXACTOS proporcionados por el usuario - SIN MODIFICACIONES
export const categoriasSEO: { [key: string]: CategoriaSEO } = {
  "Canastas de frutas y verduras agroecológicas": {
    metaTitle: "Canastas de frutas y verduras agroecológicas",
    metaDescription: "Cosechas frescas, variadas y sin agroquímicos directo desde nuestras chinampas y comunidades aliadas."
  },
  "Aceites naturales": {
    metaTitle: "Aceites naturales",
    metaDescription: "Aceites de oliva, coco y aguacate prensados en frío, ideales para cocinar con sabor y salud."
  },
  "Granos y cereales integrales": {
    metaTitle: "Granos y cereales integrales",
    metaDescription: "Arroz, frijol, lentejas y más, cultivados sin químicos y perfectos para una dieta balanceada."
  },
  "Proteínas Regenerativas": {
    metaTitle: "Proteínas Regenerativas",
    metaDescription: "Pollo, pavo, cerdo y res de libre pastoreo, criados sin hormonas ni antibióticos."
  },
  "Café, cacao y chocolate artesanal": {
    metaTitle: "Café, cacao y chocolate artesanal",
    metaDescription: "Bebidas de origen ético con aroma, intensidad y trazabilidad que puedes saborear."
  },
  "Endulzantes naturales": {
    metaTitle: "Endulzantes naturales",
    metaDescription: "Miel, piloncillo y otros endulzantes sin refinados, directo del campo."
  },
  "Especias y condimentos artesanales": {
    metaTitle: "Especias y condimentos artesanales",
    metaDescription: "Sazonadores auténticos que conservan su aroma y origen: chiles, hierbas, sal y más."
  },
  "Frutas y Verduras a Granel": {
    metaTitle: "Frutas y Verduras a Granel",
    metaDescription: "Frutas y hortalizas agroecológicas de temporada, por kilo o pieza. Aprovecha lo más fresco y abundante de cada semana, directo del campo."
  },
  "Mermeladas y untables naturales": {
    metaTitle: "Mermeladas y untables naturales",
    metaDescription: "Elaboradas con fruta real, sin conservadores ni sabores artificiales."
  },
  "Huevo de libre pastoreo y lácteos artesanales": {
    metaTitle: "Huevo de libre pastoreo y lácteos artesanales",
    metaDescription: "Huevos de gallinas felices y quesos de rancho, frescos y llenos de sabor."
  },
  "Tés e infusiones naturales": {
    metaTitle: "Tés e infusiones naturales",
    metaDescription: "Hojas, flores y raíces que reconectan con la tradición y el bienestar herbal"
  },
  "Productos Arca Tierra": {
    metaTitle: "Productos Arca Tierra",
    metaDescription: "Bolsas, gorras, playeras y más para quienes comparten nuestra causa y quieren llevarla puesta."
  },
  "Harinas y pastas orgánicas": {
    metaTitle: "Harinas y pastas orgánicas",
    metaDescription: "De maíz, trigo y más, ideales para cocinar sin aditivos y con ingredientes de verdad."
  },
  "Pan y galletas artesanales": {
    metaTitle: "Pan y galletas artesanales",
    metaDescription: "Hechos a mano con masa madre, harinas limpias y sin conservadores."
  }
};

// Función para obtener datos SEO de una categoría por nombre exacto
export function getSEODataByName(categoryName: string): CategoriaSEO | undefined {
  return categoriasSEO[categoryName];
}

export default categoriasSEO;
