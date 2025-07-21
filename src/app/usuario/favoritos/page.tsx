'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Heart, Star, MapPin, Clock, Users, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface FavoriteItem {
  id: string
  type: 'experiencia' | 'restaurante' | 'producto'
  title: string
  description: string
  image: string
  location?: string
  duration?: string
  capacity?: number
  rating: number
  price: string
  href: string
  addedDate: string
}

export default function FavoritosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data de favoritos
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      // Simular carga de favoritos
      setTimeout(() => {
        // Detectar si es usuario demo
        const isDemoUser = session.user.email === 'prueba@prueba.com' || session.user.name === 'Usuario Prueba'
        
        if (isDemoUser) {
          // Mock data para usuario demo
          setFavorites([
            {
              id: 'fav-001',
              type: 'experiencia',
              title: 'Tour Premium por las Chinampas',
              description: 'Descubre la agricultura ancestral de Xochimilco en una experiencia única',
              image: '/images/experiencias/chinampas-tour.jpg',
              location: 'Xochimilco, CDMX',
              duration: '4 horas',
              capacity: 8,
              rating: 4.9,
              price: '$2,500',
              href: '/experiencias/chinampas-premium',
              addedDate: '2025-07-15'
            },
            {
              id: 'fav-002',
              type: 'restaurante',
              title: 'Baldío Restaurante',
              description: 'Cocina mexicana contemporánea con ingredientes de temporada',
              image: '/images/restaurantes/baldio-exterior.jpg',
              location: 'Roma Norte, CDMX',
              rating: 4.8,
              price: '$$$',
              href: '/baldio',
              addedDate: '2025-07-10'
            },
            {
              id: 'fav-003',
              type: 'producto',
              title: 'Canasta de Verduras Orgánicas',
              description: 'Selección semanal de verduras frescas directo del productor',
              image: '/images/productos/canasta-verduras.jpg',
              rating: 4.7,
              price: '$450',
              href: '/tienda/canasta-verduras',
              addedDate: '2025-07-08'
            },
            {
              id: 'fav-004',
              type: 'experiencia',
              title: 'Taller de Cosmética Natural',
              description: 'Aprende a crear productos de belleza con ingredientes naturales',
              image: '/images/experiencias/cosmetica-natural.jpg',
              location: 'Roma Norte, CDMX',
              duration: '3 horas',
              capacity: 12,
              rating: 4.6,
              price: '$750',
              href: '/experiencias/cosmetica-natural',
              addedDate: '2025-07-05'
            }
          ])
        } else {
          // Usuario real - sin favoritos hasta que agregue favoritos reales
          setFavorites([])
        }
        setLoading(false)
      }, 1000)
    }
  }, [session, status, router])

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'experiencia':
        return 'bg-green-100 text-green-800'
      case 'restaurante':
        return 'bg-amber-100 text-amber-800'
      case 'producto':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'experiencia':
        return <MapPin className="h-4 w-4" />
      case 'restaurante':
        return <Users className="h-4 w-4" />
      case 'producto':
        return <Heart className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="mt-2 text-gray-600">
            Todas las experiencias, restaurantes y productos que has guardado
          </p>
        </div>

        {/* Favoritos */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes favoritos</h3>
            <p className="text-gray-600 mb-6">
              Guarda experiencias, restaurantes y productos que te interesen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/experiencias')}
                className="bg-verde-principal text-white px-6 py-2 rounded-lg hover:bg-verde-oscuro transition-colors"
              >
                Explorar Experiencias
              </button>
              <button
                onClick={() => router.push('/tienda')}
                className="bg-terracota text-white px-6 py-2 rounded-lg hover:bg-terracota-oscuro transition-colors"
              >
                Ver Tienda
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="w-full h-48 bg-gradient-to-br from-verde-claro to-verde-principal flex items-center justify-center">
                      <span className="text-white text-lg font-medium">{favorite.title}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Quitar de favoritos"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(favorite.type)}`}>
                      {getTypeIcon(favorite.type)}
                      {favorite.type.charAt(0).toUpperCase() + favorite.type.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {favorite.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {favorite.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {favorite.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{favorite.location}</span>
                      </div>
                    )}
                    {favorite.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{favorite.duration}</span>
                      </div>
                    )}
                    {favorite.capacity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Hasta {favorite.capacity} personas</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-700">{favorite.rating}</span>
                    </div>
                    <div className="text-lg font-semibold text-verde-principal">
                      {favorite.price}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(favorite.href)}
                      className="flex-1 bg-verde-principal text-white py-2 px-4 rounded-lg hover:bg-verde-oscuro transition-colors text-sm font-medium"
                    >
                      Ver Detalles
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Agregado el {new Date(favorite.addedDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
