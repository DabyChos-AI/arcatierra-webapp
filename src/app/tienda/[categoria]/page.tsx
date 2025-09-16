'use client';

import { useParams, redirect } from 'next/navigation';

// Mapeo de categorías de URL a parámetros de query
const categoryMapping: Record<string, string> = {
  'cafe-cacao-chocolate': 'cafe-cacao-y-chocolate',
  'canastas-de-frutas-y-verduras-agroecologicas': 'canastas-de-frutas-y-verduras-agroecologicas',
  'frutas-y-verduras-a-granel': 'frutas-y-verduras-a-granel',
  'proteinas-regenerativas': 'proteinas-regenerativas',
  'huevo-y-lacteos': 'huevo-y-lacteos',
  'aceites-naturales': 'aceites-naturales',
  'granos-y-cereales-integrales': 'granos-y-cereales-integrales',
  'pastas': 'pastas',
  'galletas-harinas-y-pan': 'galletas-harinas-y-pan',
  'endulzantes': 'endulzantes',
  'especias': 'especias',
  'infusiones-y-te': 'infusiones-y-te',
  'mermeladas-y-untables': 'mermeladas-y-untables'
};

export default function TiendaCategoriaPage() {
  const params = useParams();
  const categoria = params.categoria as string;

  // Mapear la categoría de la URL al parámetro de query correcto
  const queryCategoria = categoryMapping[categoria];

  if (!queryCategoria) {
    // Si la categoría no existe, redirigir a tienda principal
    redirect('/tienda');
  }

  // Redirigir a la página principal de tienda con el query parameter
  redirect(`/tienda?categoria=${queryCategoria}`);
}
