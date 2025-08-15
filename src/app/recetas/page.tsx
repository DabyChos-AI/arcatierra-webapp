import { Metadata } from 'next';
import ClientRecetasPage from './client-page';

export const metadata: Metadata = {
  title: 'Recetas Agroecológicas - Arca Tierra',
  description: 'Descubre recetas deliciosas y sustentables con ingredientes agroecológicos. Aprovecha cada parte de las plantas y conecta con técnicas ancestrales de cocina.',
  keywords: [
    'recetas agroecológicas',
    'cocina sustentable', 
    'aprovechamiento integral',
    'verduras de temporada',
    'fermentación',
    'comida orgánica',
    'técnicas ancestrales'
  ],
  openGraph: {
    title: 'Recetas Agroecológicas - Arca Tierra',
    description: 'Descubre recetas deliciosas y sustentables con ingredientes agroecológicos',
    images: [
      {
        url: '/images/recetas-portada.jpg',
        width: 1200,
        height: 630,
        alt: 'Recetas con ingredientes agroecológicos'
      }
    ]
  }
};

export default function RecetasPage() {
  return <ClientRecetasPage />;
}
