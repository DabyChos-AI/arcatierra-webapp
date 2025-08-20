import { Metadata } from 'next';
import { recipesData } from '@/data/recetas';

// Import dinámico del componente cliente para evitar problemas de SSR
import { lazy } from 'react';
const RecipeDetailClient = lazy(() => import('./client-page'));

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return recipesData.map((recipe) => ({
    id: recipe.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const recipe = recipesData.find((r) => r.id === resolvedParams.id);
  
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

export default async function RecipePage({ params }: PageProps) {
  const resolvedParams = await params;
  const recipe = recipesData.find((r) => r.id === resolvedParams.id);

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

  // Generar Schema Markup JSON-LD para la receta
  const recipeSchema = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": recipe.title,
    "image": [recipe.image],
    "author": recipe.author ? {
      "@type": "Person",
      "name": recipe.author.name,
      ...(recipe.author.bio && { "description": recipe.author.bio }),
      ...(recipe.author.image && { "image": recipe.author.image }),
      ...(recipe.author.specialty && { "worksFor": recipe.author.specialty })
    } : {
      "@type": "Organization",
      "name": "Arca Tierra",
      "url": "https://arcatierra.com"
    },
    "datePublished": new Date().toISOString().split('T')[0],
    "description": recipe.description,
    "prepTime": `PT${Math.max(5, Math.round(recipe.cookTime * 0.3))}M`,
    "cookTime": `PT${recipe.cookTime}M`,
    "totalTime": `PT${recipe.cookTime + Math.max(5, Math.round(recipe.cookTime * 0.3))}M`,
    "keywords": recipe.tags.join(", "),
    "recipeYield": "4 porciones",
    "recipeCategory": recipe.tags[0] || "Agroecológica",
    "recipeCuisine": "Mexicana Sustentable",
    ...(recipe.nutritionInfo && {
      "nutrition": {
        "@type": "NutritionInformation",
        "calories": `${recipe.nutritionInfo.calories} calorías`,
        "proteinContent": recipe.nutritionInfo.protein,
        "carbohydrateContent": recipe.nutritionInfo.carbs,
        "fatContent": recipe.nutritionInfo.fat,
        "fiberContent": recipe.nutritionInfo.fiber
      }
    }),
    "recipeIngredient": recipe.ingredients,
    "recipeInstructions": recipe.steps?.map((step) => ({
      "@type": "HowToStep",
      "name": step.title,
      "text": step.description,
      ...(step.duration && { "totalTime": `PT${step.duration}M` })
    })) || [],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": recipe.rating,
      "reviewCount": recipe.reviews,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      {/* Schema Markup JSON-LD para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeSchema, null, 2)
        }}
      />
      <RecipeDetailClient recipe={recipe} />
    </>
  );
}
