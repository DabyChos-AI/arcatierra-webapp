'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Heart, ChevronLeft, Search, Filter, 
  ShoppingBag, MapPin, Clock, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

// Definición de tipos
type Category = 'all' | 'tour' | 'taller' | 'gastronomia'

type FavoriteItem = {
  id: string
  name: string
  location: string
  price: number
  image: string
  duration: string
  rating: number
  reviewCount: number
  category: 'tour' | 'taller' | 'gastronomia'
  dateAdded: string
}

type CategoryCounts = {
  [key in Category]: number
}

export default function UserFavoritesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' o 'list'
  const [activeFilter, setActiveFilter] = useState('all')

  // Datos de ejemplo para los favoritos
  const favorites = [
    { 
      id: 'exp-003', 
      name: 'Tour por las Chinampas', 
      location: 'Xochimilco, CDMX', 
      price: 650,
      image: '/images/experiences/chinampas-xochimilco.jpg',
      duration: '3 horas',
      rating: 4.8,
      reviewCount: 124,
      category: 'tour',
      dateAdded: '2025-07-01'
    },
    { 
      id: 'exp-007', 
      name: 'Taller de Huerto Urbano', 
      location: 'Coyoacán, CDMX', 
      price: 450,
      image: '/images/experiences/huerto-urbano.jpg',
      duration: '2.5 horas',
      rating: 4.6,
      reviewCount: 89,
      category: 'taller',
      dateAdded: '2025-06-28'
    },
    { 
      id: 'exp-012', 
      name: 'Visita a Granja Sustentable', 
      location: 'Ajusco, CDMX', 
      price: 550,
      image: '/images/experiences/granja-sustentable.jpg',
      duration: '4 horas',
      rating: 4.9,
      reviewCount: 56,
      category: 'tour',
      dateAdded: '2025-06-25'
    },
    { 
      id: 'exp-015', 
      name: 'Taller de Cocina Sustentable', 
      location: 'Coyoacán, CDMX', 
      price: 850,
      image: '/images/experiences/taller-cocina.jpg',
      duration: '3 horas',
      rating: 4.7,
      reviewCount: 103,
      category: 'taller',
      dateAdded: '2025-06-20'
    },
    { 
      id: 'exp-018', 
      name: 'Cena Orgánica', 
      location: 'Condesa, CDMX', 
      price: 950,
      image: '/images/experiences/cena-organica.jpg',
      duration: '2 horas',
      rating: 4.9,
      reviewCount: 78,
      category: 'gastronomia',
      dateAdded: '2025-06-15'
    },
    { 
      id: 'exp-021', 
      name: 'Tour Gastronómico Sustentable', 
      location: 'Centro Histórico, CDMX', 
      price: 850,
      image: '/images/experiences/gastronomia-sustentable.jpg',
      duration: '4 horas',
      rating: 4.8,
      reviewCount: 92,
      category: 'gastronomia',
      dateAdded: '2025-06-10'
    },
    { 
      id: 'exp-024', 
      name: 'Taller de Cosmética Natural', 
      location: 'Roma Norte, CDMX', 
      price: 750,
      image: '/images/experiences/cosmetica-natural.jpg',
      duration: '2.5 horas',
      rating: 4.7,
      reviewCount: 67,
      category: 'taller',
      dateAdded: '2025-06-05'
    }
  ]

  // Categorías para el filtro
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'tour', name: 'Tours' },
    { id: 'taller', name: 'Talleres' },
    { id: 'gastronomia', name: 'Gastronomía' }
  ]

  // Filtrar favoritos según la búsqueda y el filtro activo
  const filteredFavorites = favorites
    .filter(item => {
      if (activeFilter === 'all') return true
      return item.category === activeFilter
    })
    .filter(item => {
      if (!searchQuery) return true
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    })

  // Agrupar favoritos por categoría para los contadores
  const categoryCounts: CategoryCounts = {
    all: favorites.length,
    tour: favorites.filter(item => item.category === 'tour').length,
    taller: favorites.filter(item => item.category === 'taller').length,
    gastronomia: favorites.filter(item => item.category === 'gastronomia').length
  }

  // Función para eliminar favorito
  const handleRemoveFavorite = (id: string) => {
    // En una implementación real, esto enviaría la solicitud al backend
    console.log(`Removing favorite with id: ${id}`)
    // También se podría actualizar el estado local o mostrar una notificación
  }

  return (
    <div className="min-h-screen bg-neutro-light">
      {/* Header */}
      <header className="bg-verde-principal text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/user-dashboard">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-white hover:bg-verde-dark mr-2"
              >
                <ChevronLeft size={20} />
              </Button>
            </Link>
            <Heart size={24} className="text-dorado-claro" />
            <h1 className="text-xl font-semibold">Mis Favoritos</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'border-white/30 text-white hover:bg-white/10'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'border-white/30 text-white hover:bg-white/10'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Filtros y búsqueda */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Buscar favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-verde-principal/70 text-verde-tipografia hover:bg-verde-principal/10"
              >
                <Filter size={16} className="mr-1" />
                Filtrar
              </Button>
            </div>
          </div>
          
          {/* Pestañas de categoría */}
          <div className="flex overflow-x-auto pb-1 no-scrollbar">
            {categories.map((category) => (
              <Button 
                key={category.id}
                variant="ghost" 
                onClick={() => setActiveFilter(category.id as Category)}
                className={`mr-2 px-3 py-1.5 rounded-full h-auto whitespace-nowrap ${
                  activeFilter === category.id 
                    ? 'bg-verde-principal text-white' 
                    : 'text-verde-tipografia hover:bg-verde-principal/10'
                }`}
              >
                {category.name} ({categoryCounts[category.id as Category]})
              </Button>
            ))}
          </div>
        </div>
        
        {/* Lista de favoritos */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-verde-tipografia mb-2">No tienes favoritos</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {activeFilter !== 'all'
                ? `No tienes favoritos en la categoría "${categories.find(c => c.id === activeFilter)?.name}". Prueba con otra categoría.`
                : searchQuery 
                  ? 'No hay resultados para tu búsqueda. Intenta con otros términos.'
                  : '¡Explora nuestras experiencias y guarda tus favoritas para encontrarlas fácilmente más tarde!'}
            </p>
            <Button 
              className="bg-verde-principal text-white hover:bg-verde-dark"
              onClick={() => router.push('/experiencias')}
            >
              Ver Experiencias
            </Button>
          </div>
        ) : (
          <>
            {/* Vista de cuadrícula */}
            {viewMode === 'grid' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {filteredFavorites.map((favorite) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={favorite.image} 
                        alt={favorite.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button 
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all"
                      >
                        <Heart size={18} fill="#B15543" className="text-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-verde-tipografia line-clamp-1">{favorite.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        <p className="text-sm text-gray-600 line-clamp-1">{favorite.location}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-verde-principal/5 text-verde-tipografia border-verde-principal/20 text-xs">
                          <Clock size={12} className="mr-1" />
                          {favorite.duration}
                        </Badge>
                        <Badge variant="outline" className="bg-dorado-claro/5 text-dorado-oscuro border-dorado-claro/20 text-xs">
                          <span className="mr-1">★</span>
                          {favorite.rating} ({favorite.reviewCount})
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-semibold text-verde-principal">${favorite.price}/persona</span>
                        <Button size="sm" className="bg-verde-principal text-white hover:bg-verde-dark">
                          Reservar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Vista de lista */}
            {viewMode === 'list' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredFavorites.map((favorite) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden">
                        <img 
                          src={favorite.image} 
                          alt={favorite.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button 
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all"
                        >
                          <Heart size={18} fill="#B15543" className="text-red-500" />
                        </button>
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-medium text-verde-tipografia">{favorite.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <p className="text-sm text-gray-600">{favorite.location}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-verde-principal/5 text-verde-tipografia border-verde-principal/20">
                              <Clock size={12} className="mr-1" />
                              {favorite.duration}
                            </Badge>
                            <Badge variant="outline" className="bg-dorado-claro/5 text-dorado-oscuro border-dorado-claro/20">
                              <span className="mr-1">★</span>
                              {favorite.rating} ({favorite.reviewCount})
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-3">
                            Añadido a favoritos: {new Date(favorite.dateAdded).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <span className="font-semibold text-verde-principal">${favorite.price}/persona</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                            >
                              Ver Detalles
                            </Button>
                            <Button size="sm" className="bg-verde-principal text-white hover:bg-verde-dark">
                              Reservar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
