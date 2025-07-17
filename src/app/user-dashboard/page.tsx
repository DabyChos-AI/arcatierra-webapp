'use client'

/**
 * DASHBOARD DE USUARIO CON AUTENTICACIÓN TEMPORALMENTE SIMULADA
 * Mientras NextAuth está desactivado, usamos una sesión simulada
 */

import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react' - Temporalmente desactivado
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, Heart, Compass, User, Settings, 
  Clock, LogOut, Bell, ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'

export default function UserDashboardPage() {
  // Sesión simulada mientras NextAuth está desactivado
  const session = {
    user: {
      name: 'Usuario Simulado',
      email: 'usuario@ejemplo.com',
      image: null,
      role: 'user'
    }
  }
  const status = 'authenticated' // Simulamos que siempre está autenticado
  
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState(3)

  // Redireccionar si no está autenticado - actualmente desactivado con sesión simulada
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/login')
  //   }
  // }, [status, router])

  // Data de ejemplo para el dashboard
  const upcomingReservations = [
    { 
      id: 'res-001', 
      experience: 'Tour por las Chinampas', 
      date: '2025-07-12', 
      time: '10:00', 
      participants: 2, 
      status: 'confirmed',
      image: '/images/experiences/chinampas-xochimilco.jpg'
    },
    { 
      id: 'res-002', 
      experience: 'Taller de Cocina Sustentable', 
      date: '2025-07-18', 
      time: '16:00', 
      participants: 1, 
      status: 'pending',
      image: '/images/experiences/taller-cocina.jpg'
    }
  ]

  const recentFavorites = [
    { 
      id: 'exp-003', 
      name: 'Tour por las Chinampas', 
      location: 'Xochimilco, CDMX', 
      price: 650,
      image: '/images/experiences/chinampas-xochimilco.jpg'
    },
    { 
      id: 'exp-007', 
      name: 'Taller de Huerto Urbano', 
      location: 'Coyoacán, CDMX', 
      price: 450,
      image: '/images/experiences/huerto-urbano.jpg'
    },
    { 
      id: 'exp-012', 
      name: 'Visita a Granja Sustentable', 
      location: 'Ajusco, CDMX', 
      price: 550,
      image: '/images/experiences/granja-sustentable.jpg'
    }
  ]

  const recommendations = [
    { 
      id: 'exp-008', 
      name: 'Taller de Cosmética Natural', 
      location: 'Roma Norte, CDMX', 
      price: 750,
      image: '/images/experiences/cosmetica-natural.jpg',
      match: '98%'
    },
    { 
      id: 'exp-015', 
      name: 'Tour Gastronómico Sustentable', 
      location: 'Centro Histórico, CDMX', 
      price: 850,
      image: '/images/experiences/gastronomia-sustentable.jpg',
      match: '95%'
    }
  ]

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString('es-MX', options)
  }

  // Pantalla de carga - desactivada con la sesión simulada
  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-neutro-light">
  //       <div className="animate-pulse flex flex-col items-center">
  //         <div className="h-14 w-14 bg-verde-principal/30 rounded-full mb-4"></div>
  //         <div className="h-6 w-48 bg-verde-principal/30 rounded-md"></div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-neutro-light flex flex-col">
      {/* Header */}
      <header className="bg-verde-principal text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <User size={24} className="text-dorado-claro" />
            <h1 className="text-xl font-semibold">Mi Cuenta</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-white hover:text-white hover:bg-verde-dark"
            >
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-dorado-oscuro rounded-full text-[10px] flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-verde-dark text-white">
                  {session?.user?.name?.substring(0, 2).toUpperCase() || "AT"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{session?.user?.name || "Usuario"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar/Navegación */}
        <nav className="w-full max-w-[240px] bg-white shadow-sm py-6 px-4 hidden md:block">
          <div className="space-y-6">
            <div className="pb-6 border-b border-gray-100">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-verde-dark text-white text-2xl">
                    {session?.user?.name?.substring(0, 2).toUpperCase() || "AT"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 font-semibold text-lg">{session?.user?.name || "Usuario"}</h2>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Button 
                variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${activeTab === 'overview' ? 'bg-verde-principal/10 text-verde-principal' : 'text-gray-600'}`}
                onClick={() => setActiveTab('overview')}
              >
                <User size={18} className="mr-2" />
                Vista General
              </Button>
              
              <Link href="/user-dashboard/reservations" className="block">
                <Button 
                  variant={activeTab === 'reservations' ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${activeTab === 'reservations' ? 'bg-verde-principal/10 text-verde-principal' : 'text-gray-600'}`}
                >
                  <Calendar size={18} className="mr-2" />
                  Mis Reservas
                </Button>
              </Link>
              
              <Link href="/user-dashboard/favorites" className="block">
                <Button 
                  variant={activeTab === 'favorites' ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${activeTab === 'favorites' ? 'bg-verde-principal/10 text-verde-principal' : 'text-gray-600'}`}
                >
                  <Heart size={18} className="mr-2" />
                  Favoritos
                </Button>
              </Link>
              
              <Link href="/user-dashboard/recommendations" className="block">
                <Button 
                  variant={activeTab === 'recommendations' ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${activeTab === 'recommendations' ? 'bg-verde-principal/10 text-verde-principal' : 'text-gray-600'}`}
                >
                  <Compass size={18} className="mr-2" />
                  Recomendados
                </Button>
              </Link>
              
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-gray-600"
                >
                  <Settings size={18} className="mr-2" />
                  Configuración
                </Button>
                
                <Button 
                  variant="ghost"
                  className="w-full justify-start text-gray-600"
                >
                  <LogOut size={18} className="mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Navbar móvil - Solo visible en dispositivos pequeños */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-10">
          <Button variant="ghost" className="flex flex-col items-center py-1 px-3 text-xs" onClick={() => setActiveTab('overview')}>
            <User size={20} className={activeTab === 'overview' ? 'text-verde-principal' : 'text-gray-600'} />
            <span className={activeTab === 'overview' ? 'text-verde-principal' : 'text-gray-600'}>Perfil</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-1 px-3 text-xs" onClick={() => router.push('/user-dashboard/reservations')}>
            <Calendar size={20} className={activeTab === 'reservations' ? 'text-verde-principal' : 'text-gray-600'} />
            <span className={activeTab === 'reservations' ? 'text-verde-principal' : 'text-gray-600'}>Reservas</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-1 px-3 text-xs" onClick={() => router.push('/user-dashboard/favorites')}>
            <Heart size={20} className={activeTab === 'favorites' ? 'text-verde-principal' : 'text-gray-600'} />
            <span className={activeTab === 'favorites' ? 'text-verde-principal' : 'text-gray-600'}>Favoritos</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-1 px-3 text-xs" onClick={() => router.push('/user-dashboard/recommendations')}>
            <Compass size={20} className={activeTab === 'recommendations' ? 'text-verde-principal' : 'text-gray-600'} />
            <span className={activeTab === 'recommendations' ? 'text-verde-principal' : 'text-gray-600'}>Para ti</span>
          </Button>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Vista General */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-verde-tipografia">Vista General</h2>
                  </div>
                  
                  {/* Tarjetas de resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Próxima Reserva</p>
                          <h3 className="font-semibold text-lg text-verde-tipografia">
                            {upcomingReservations.length > 0 ? upcomingReservations[0].experience : 'Sin reservas'}
                          </h3>
                          <p className="text-sm mt-1">
                            {upcomingReservations.length > 0 
                              ? `${formatDate(upcomingReservations[0].date)} • ${upcomingReservations[0].time}` 
                              : 'Explora experiencias y reserva'
                            }
                          </p>
                        </div>
                        <div className="bg-verde-principal/10 p-2 rounded-lg">
                          <Calendar size={24} className="text-verde-principal" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href="/user-dashboard/reservations">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                          >
                            Ver Reservas
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Favoritos</p>
                          <h3 className="font-semibold text-lg text-verde-tipografia">
                            {recentFavorites.length} Experiencias
                          </h3>
                          <p className="text-sm mt-1">Guardado para más tarde</p>
                        </div>
                        <div className="bg-dorado-claro/10 p-2 rounded-lg">
                          <Heart size={24} className="text-dorado-claro" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href="/user-dashboard/favorites">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full border-dorado-claro text-dorado-oscuro hover:bg-dorado-claro hover:text-white"
                          >
                            Ver Favoritos
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Recomendaciones</p>
                          <h3 className="font-semibold text-lg text-verde-tipografia">
                            {recommendations.length} Sugerencias
                          </h3>
                          <p className="text-sm mt-1">Basadas en tus intereses</p>
                        </div>
                        <div className="bg-verde-acento/10 p-2 rounded-lg">
                          <Compass size={24} className="text-verde-acento" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href="/user-dashboard/recommendations">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full border-verde-acento text-verde-acento hover:bg-verde-acento hover:text-white"
                          >
                            Ver Recomendados
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Próximas Reservas */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-verde-tipografia">Próximas Reservas</h3>
                      <Link href="/user-dashboard/reservations">
                        <Button variant="link" className="text-verde-principal p-0">
                          Ver todas
                        </Button>
                      </Link>
                    </div>
                    
                    {upcomingReservations.length === 0 ? (
                      <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <h4 className="text-lg font-medium text-verde-tipografia">No tienes reservas próximas</h4>
                        <p className="text-gray-500 mb-4">Explora nuestras experiencias y reserva ahora</p>
                        <Link href="/experiencias">
                          <Button className="bg-verde-principal text-white hover:bg-verde-dark">
                            Explorar Experiencias
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingReservations.map(reservation => (
                          <div key={reservation.id} className="bg-white rounded-xl p-4 border border-gray-100 flex gap-4">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={reservation.image} 
                                alt={reservation.experience}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-verde-tipografia">{reservation.experience}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(reservation.date)} • {reservation.time}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="text-xs bg-verde-principal/10 text-verde-principal px-2 py-1 rounded-full">
                                  {reservation.participants} {reservation.participants === 1 ? 'Persona' : 'Personas'}
                                </span>
                                {reservation.status === 'confirmed' ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Confirmado
                                  </span>
                                ) : (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                              <div className="mt-4 flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                                >
                                  Ver Detalles
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Favoritos Recientes */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-verde-tipografia">Favoritos Recientes</h3>
                      <Link href="/user-dashboard/favorites">
                        <Button variant="link" className="text-verde-principal p-0">
                          Ver todos
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {recentFavorites.slice(0, 3).map(favorite => (
                        <div key={favorite.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 group">
                          <div className="h-40 overflow-hidden relative">
                            <img 
                              src={favorite.image}
                              alt={favorite.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <button className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full">
                              <Heart size={16} fill="#B15543" className="text-red-500" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-verde-tipografia line-clamp-1">{favorite.name}</h4>
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                              <ShoppingBag size={14} className="mr-1 text-gray-400" />
                              {favorite.location}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-semibold text-verde-principal">${favorite.price}/persona</span>
                              <Button size="sm" className="bg-verde-principal text-white hover:bg-verde-dark">
                                Reservar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recomendaciones */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-verde-tipografia">Recomendado para ti</h3>
                      <Link href="/user-dashboard/recommendations">
                        <Button variant="link" className="text-verde-principal p-0">
                          Ver todos
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendations.map(recommendation => (
                        <div key={recommendation.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 group">
                          <div className="flex flex-col sm:flex-row">
                            <div className="h-40 sm:h-auto sm:w-40 overflow-hidden relative">
                              <img 
                                src={recommendation.image}
                                alt={recommendation.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2 bg-verde-principal text-white px-2 py-1 rounded-full text-xs font-medium">
                                {recommendation.match} match
                              </div>
                              <button className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full">
                                <Heart size={16} className="text-gray-500" />
                              </button>
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-1">
                              <div>
                                <h4 className="font-medium text-verde-tipografia">{recommendation.name}</h4>
                                <p className="text-sm text-gray-600 mt-1 flex items-center">
                                  <ShoppingBag size={14} className="mr-1 text-gray-400" />
                                  {recommendation.location}
                                </p>
                                <div className="mt-2">
                                  <span className="font-semibold text-verde-principal">${recommendation.price}/persona</span>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-verde-principal text-white hover:bg-verde-dark w-full mt-3"
                              >
                                Ver Experiencia
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
