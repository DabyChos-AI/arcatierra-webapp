'use client'

import { Search, Filter, X } from 'lucide-react'
import { pressStats } from '@/data/prensa/pressData'

export default function FilterSection({ 
  activeFilter, 
  setActiveFilter, 
  activeTypeFilter,
  setActiveTypeFilter,
  searchTerm, 
  setSearchTerm, 
  activeFilters
}) {
  const filterButtons = [
    { id: 'todos', label: 'Todos los Medios', count: pressStats.total },
    { id: 'nacional', label: 'Nacional', count: pressStats.nacional },
    { id: 'internacional', label: 'Internacional', count: pressStats.internacional }
  ]

  const typeButtons = [
    { id: 'articulos', label: 'Artículos', count: pressStats.articulos },
    { id: 'videos', label: 'Videos', count: pressStats.videos },
    { id: 'podcasts', label: 'Podcasts', count: pressStats.podcasts }
  ]

  // Función para eliminar un filtro
  const removeFilter = (filter) => {
    if (filter === activeFilter) {
      setActiveFilter('todos');
    } else if (filter === searchTerm) {
      setSearchTerm('');
    } else {
      // Convertir nombre legible a ID
      const typeIds = {
        'Artículos': 'articulos',
        'Videos': 'videos',
        'Podcasts': 'podcasts'
      };
      if (typeIds[filter]) {
        setActiveTypeFilter('todos');
      }
    }
  };

  // Calcular el número total de artículos filtrados
  const totalArticles = activeFilter === 'todos' 
    ? pressStats.total 
    : activeFilter === 'nacional' 
      ? pressStats.nacional 
      : pressStats.internacional;

  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de sección */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-principal mb-2">
            Cobertura Mediática
          </h2>
          <p className="text-secundario">
            {totalArticles} artículo{totalArticles !== 1 ? 's' : ''} encontrado{totalArticles !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por título, medio o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input block w-full pl-10 pr-3 py-3 rounded-lg text-sm placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filtros por categoría */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`filter-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  activeFilter === filter.id ? 'active' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {filter.label}
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtros por tipo de contenido */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Tipo de contenido:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {typeButtons.map((type) => {
              // Para forzar la actualización inmediata, necesitamos asegurarnos de que
              // el estado se cambie y la UI refleje ese cambio inmediatamente
              const handleTypeFilterClick = () => {
                // Si ya está activo este filtro, lo desactivamos
                if (activeTypeFilter === type.id) {
                  setActiveTypeFilter('todos');
                } else {
                  setActiveTypeFilter(type.id);
                }
              };
              
              return (
                <button
                  key={type.id}
                  onClick={handleTypeFilterClick}
                  className={`filter-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    activeTypeFilter === type.id ? 'active' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {type.label}
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {type.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros activos */}
        {(activeFilters && activeFilters.length > 0) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Filtros activos:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <div key={index} className="active-filter-tag">
                  {filter}
                  <button onClick={() => removeFilter(filter)} aria-label="Eliminar filtro">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {activeFilters.length > 0 && (
                <button 
                  onClick={() => {
                    setActiveFilter('todos');
                    setActiveTypeFilter('todos');
                    setSearchTerm('');
                  }}
                  className="text-sm text-terracota font-medium hover:underline"
                >
                  Limpiar todos
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
