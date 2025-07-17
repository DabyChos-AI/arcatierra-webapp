'use client'

import ArticleCard, { FeaturedArticleCard } from './ArticleCard'

export default function ArticleGrid({ articles, showFeatured = false }) {
  if (!articles || articles.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron artículos
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros o términos de búsqueda para encontrar más contenido.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Separar artículos destacados y regulares
  const featuredArticles = articles.filter(article => article.featured)
  const regularArticles = articles.filter(article => !article.featured)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sección de artículos destacados */}
        {showFeatured && featuredArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="text-2xl lg:text-3xl font-bold text-principal">
                  Artículos Destacados
                </h2>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-terracota to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {featuredArticles.map((article) => (
                <FeaturedArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Sección de todos los artículos */}
        <div>
          {showFeatured && (
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-principal">
                Todas las Menciones
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-terracota to-transparent"></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showFeatured ? regularArticles : articles).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-8 card-shadow max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-principal mb-4">
              ¿Eres periodista o medio de comunicación?
            </h3>
            <p className="text-secundario mb-6">
              Obtén acceso a nuestro kit de prensa completo con imágenes de alta resolución, 
              información corporativa y contactos directos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => alert('Esta parte está en desarrollo')}
                className="bg-terracota text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              >
                Descargar Kit de Prensa
              </button>
              <button
                onClick={() => alert('Esta parte está en desarrollo')}
                className="border border-terracota text-terracota px-6 py-3 rounded-lg font-semibold hover:bg-opacity-10 hover:text-white hover:bg-terracota transition-all"
              >
                Contactar al Equipo de Prensa
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
