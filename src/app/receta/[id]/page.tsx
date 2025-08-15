import { Metadata } from 'next';
import { recipesData } from '@/data/recetas';

// Import dinámico del componente cliente para evitar problemas de SSR
import { lazy } from 'react';
const RecipeDetailClient = lazy(() => import('./client-page'));

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return recipesData.map((recipe) => ({
    id: recipe.id.toString(),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recipe = recipesData.find((r) => r.id === parseInt(params.id));
  
  if (!recipe) {
    return {
      title: 'Receta no encontrada - Arca Tierra',
      description: 'La receta que buscas no existe.',
    };
  }

  return {
    title: `${recipe.title} - Recetas Arca Tierra`,
    description: recipe.description,
    openGraph: {
      title: `${recipe.title} - Recetas Arca Tierra`,
      description: recipe.description,
      images: [recipe.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${recipe.title} - Recetas Arca Tierra`,
      description: recipe.description,
      images: [recipe.image],
    },
  };
}

export default function RecipePage({ params }: PageProps) {
  const recipe = recipesData.find((r) => r.id === parseInt(params.id));

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Receta no encontrada</h1>
          <p className="text-gray-600">La receta que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return <RecipeDetailClient recipe={recipe} />;
}
