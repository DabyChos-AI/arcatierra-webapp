'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Compass, ChevronLeft, Search, Filter, 
  Star, Heart, ShoppingBag, MapPin, Clock, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Definición de tipos
type Category = 'all' | 'tour' | 'taller' | 'gastronomia' | 'actividad'

type RecommendedExperience = {
  id: string
  name: string
  location: string
  price: number
  image: string
  duration: string
  rating: number
  reviewCount: number
  category: 'tour' | 'taller' | 'gastronomia' | 'actividad'
  match: number
  matchReason: string
}

type CategoryCounts = {
  [key in Category]: number
}

export default function UserRecommendationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Datos de ejemplo para las recomendaciones
  const recommendedExperiences = [
    { 
      id: 'exp-031', 
      name: 'Taller de Cosmética Natural', 
      location: 'Roma Norte, CDMX', 
      price: 750,
      image: '/images/experiences/cosmetica-natural.jpg',
      duration: '2.5 horas',
      rating: 4.7,
      reviewCount: 67,
      category: 'taller',
      match: 98,
      matchReason: 'Basado en tu interés en talleres sostenibles'
    },
    { 
      id: 'exp-028', 
      name: 'Tour Gastronómico Sustentable', 
      location: 'Centro Histórico, CDMX', 
      price: 850,
      image: '/images/experiences/gastronomia-sustentable.jpg',
      duration: '4 horas',
      rating: 4.8,
      reviewCount: 92,
      category: 'gastronomia',
      match: 95,
      matchReason: 'Similar a "Cena Orgánica" que te gustó'
    },
    { 
      id: 'exp-047', 
      name: 'Mercado Orgánico y Taller de Cocina', 
      location: 'Polanco, CDMX', 
      price: 950,
      image: '/images/experiences/mercado-organico.jpg',
      duration: '5 horas',
      rating: 4.9,
      reviewCount: 48,
      category: 'gastronomia',
      match: 94,
      matchReason: 'Combinación perfecta con tus intereses en alimentación orgánica'
    },
    { 
      id: 'exp-039', 
      name: 'Tour de Bicicleta por Parques Sustentables', 
      location: 'Chapultepec, CDMX', 
      price: 380,
      image: '/images/experiences/tour-bicicleta.jpg',
      duration: '3 horas',
      rating: 4.6,
      reviewCount: 74,
      category: 'actividad',
      match: 92,
      matchReason: 'Basado en tu interés en actividades al aire libre'
    },
    { 
      id: 'exp-052', 
      name: 'Taller de Reciclaje Creativo', 
      location: 'Del Valle, CDMX', 
      price: 550,
      image: '/images/experiences/reciclaje-creativo.jpg',
      duration: '2 horas',
      rating: 4.5,
      reviewCount: 36,
      category: 'taller',
      match: 91,
      matchReason: 'Complementa tus intereses en sostenibilidad'
    },
    { 
      id: 'exp-061', 
      name: 'Tour de Cafeterías de Comercio Justo', 
      location: 'Roma-Condesa, CDMX', 
      price: 480,
      image: '/images/experiences/tour-cafeterias.jpg',
      duration: '3 horas',
      rating: 4.7,
      reviewCount: 53,
      category: 'tour',
      match: 89,
      matchReason: 'Combina tus intereses en gastronomía y sostenibilidad'
    },
    { 
      id: 'exp-073', 
      name: 'Visita a Proyectos Comunitarios Sustentables', 
      location: 'Xochimilco, CDMX', 
      price: 590,
      image: '/images/experiences/proyectos-comunitarios.jpg',
      duration: '4 horas',
      rating: 4.9,
      reviewCount: 29,
      category: 'tour',
      match: 88,
      matchReason: 'Similar al Tour por las Chinampas que te gustó'
    }
  ]

  // Categorías para el filtro
  const categories = [
    { id: 'all', name: 'Todas' },
    { id: 'tour', name: 'Tours' },
    { id: 'taller', name: 'Talleres' },
    { id: 'gastronomia', name: 'Gastronomía' },
    { id: 'actividad', name: 'Actividades' }
  ]

  // Agrupar recomendaciones por categoría para los contadores
  const categoryCounts: CategoryCounts = {
    all: recommendedExperiences.length,
    tour: recommendedExperiences.filter(item => item.category === 'tour').length,
    taller: recommendedExperiences.filter(item => item.category === 'taller').length,
    gastronomia: recommendedExperiences.filter(item => item.category === 'gastronomia').length,
    actividad: recommendedExperiences.filter(item => item.category === 'actividad').length
  }

  // Filtrar recomendaciones según la búsqueda y el filtro activo
  const filteredRecommendations = recommendedExperiences
    .filter(item => {
      if (activeFilter === 'all') return true
      return item.category === activeFilter
    })
    .filter(item => {
      if (!searchQuery) return true
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    })

  // Función para agregar a favoritos
  const handleToggleFavorite = (id: string) => {
    // En una implementación real, esto enviaría la solicitud al backend
    console.log(`Toggle favorite for experience with id: ${id}`)
    // También se podría actualizar el estado local o mostrar una notificación
  }

  // Función para colorear el indicador de match según el porcentaje
  const getMatchColor = (matchPercent: number) => {
    if (matchPercent >= 95) return 'bg-green-100 text-green-800 border-green-200'
    if (matchPercent >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (matchPercent >= 85) return 'bg-teal-100 text-teal-800 border-teal-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
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
            <Compass size={24} className="text-dorado-claro" />
            <h1 className="text-xl font-semibold">Recomendado para ti</h1>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white flex items-center gap-1"
                >
                  <Info size={14} />
                  <span>Cómo funcionan</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Nuestras recomendaciones se basan en tus preferencias, reservas anteriores y favoritos guardados.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                placeholder="Buscar recomendaciones..."
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
        
        {/* Lista de recomendaciones */}
        <div>
          <div className="mb-4">
            <p className="text-gray-500">
              Estas experiencias han sido seleccionadas especialmente para ti, basadas en tus preferencias y actividad anterior.
            </p>
          </div>
          
          {filteredRecommendations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
              <Compass className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-verde-tipografia mb-2">No hay recomendaciones disponibles</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {activeFilter !== 'all'
                  ? `No hay recomendaciones en la categoría "${categories.find(c => c.id === activeFilter)?.name}". Prueba con otra categoría.`
                  : searchQuery 
                    ? 'No hay resultados para tu búsqueda. Intenta con otros términos.'
                    : 'Estamos preparando recomendaciones personalizadas para ti. ¡Regresa pronto!'}
              </p>
              <Button 
                className="bg-verde-principal text-white hover:bg-verde-dark"
                onClick={() => router.push('/experiencias')}
              >
                Ver Todas las Experiencias
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredRecommendations.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden">
                      <img 
                        src={experience.image} 
                        alt={experience.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1"
                        style={{
                          background: 'linear-gradient(90deg, rgba(229,250,239,0.95) 0%, rgba(51,80,62,0.95) 100%)',
                          backdropFilter: 'blur(4px)',
                          color: 'white'
                        }}
                      >
                        <Star size={12} className="text-yellow-300" fill="#FFCC00" />
                        {experience.match}% match
                      </div>
                      <button 
                        onClick={() => handleToggleFavorite(experience.id)}
                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white hover:scale-110 transition-all"
                      >
                        <Heart size={18} className="text-gray-400" />
                      </button>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-medium text-verde-tipografia">{experience.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <p className="text-sm text-gray-600">{experience.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-medium">{experience.rating}</span>
                          <span className="text-gray-400 text-xs ml-1">({experience.reviewCount})</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className="bg-verde-principal/5 text-verde-tipografia border-verde-principal/20">
                          <Clock size={12} className="mr-1" />
                          {experience.duration}
                        </Badge>
                        <Badge variant="outline" className="bg-dorado-claro/5 text-dorado-oscuro border-dorado-claro/20">
                          <ShoppingBag size={12} className="mr-1" />
                          {categories.find(c => c.id === experience.category)?.name}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getMatchColor(experience.match)}`}>
                                <Info size={10} />
                                ¿Por qué me lo recomiendan?
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>{experience.matchReason}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <span className="font-semibold text-verde-principal">${experience.price}/persona</span>
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
        </div>
      </div>
    </div>
  )
}
