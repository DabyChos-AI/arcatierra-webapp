'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Calendar, ChevronLeft, Search, Filter, Download,
  Clock, Check, AlertTriangle, X, ArrowLeft, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export default function UserReservationsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Datos de ejemplo para las reservas
  const reservations = [
    { 
      id: 'res-001', 
      experience: 'Tour por las Chinampas', 
      date: '2025-07-12', 
      time: '10:00', 
      participants: 2, 
      status: 'confirmed',
      image: '/images/experiences/chinampas-xochimilco.jpg',
      location: 'Xochimilco, CDMX',
      price: 650,
      totalPaid: 1300
    },
    { 
      id: 'res-002', 
      experience: 'Taller de Cocina Sustentable', 
      date: '2025-07-18', 
      time: '16:00', 
      participants: 1, 
      status: 'pending',
      image: '/images/experiences/taller-cocina.jpg',
      location: 'Coyoacán, CDMX',
      price: 850,
      totalPaid: 850
    },
    { 
      id: 'res-003', 
      experience: 'Visita a Granja Sustentable', 
      date: '2025-07-25', 
      time: '09:30', 
      participants: 4, 
      status: 'pending',
      image: '/images/experiences/granja-sustentable.jpg',
      location: 'Ajusco, CDMX',
      price: 550,
      totalPaid: 2200
    },
    { 
      id: 'res-004', 
      experience: 'Taller de Huerto Urbano', 
      date: '2025-06-30', 
      time: '10:00', 
      participants: 2, 
      status: 'completed',
      image: '/images/experiences/huerto-urbano.jpg',
      location: 'Roma Norte, CDMX',
      price: 450,
      totalPaid: 900
    },
    { 
      id: 'res-005', 
      experience: 'Cena Orgánica', 
      date: '2025-06-15', 
      time: '19:00', 
      participants: 2, 
      status: 'completed',
      image: '/images/experiences/cena-organica.jpg',
      location: 'Condesa, CDMX',
      price: 950,
      totalPaid: 1900
    },
    { 
      id: 'res-006', 
      experience: 'Tour Gastronómico Sustentable', 
      date: '2025-06-02', 
      time: '12:00', 
      participants: 1, 
      status: 'cancelled',
      image: '/images/experiences/gastronomia-sustentable.jpg',
      location: 'Centro Histórico, CDMX',
      price: 850,
      totalPaid: 850,
      cancellationReason: 'Solicitado por el cliente'
    }
  ]

  // Filtrar reservas según el filtro activo y la búsqueda
  const filteredReservations = reservations
    .filter(reservation => {
      if (activeFilter === 'all') return true
      return reservation.status === activeFilter
    })
    .filter(reservation => {
      if (!searchQuery) return true
      return reservation.experience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.id.toLowerCase().includes(searchQuery.toLowerCase())
    })

  // Agrupar reservas por estado para mostrar en contadores
  const reservationCounts = {
    all: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  }

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString)
    return format(date, "d 'de' MMMM, yyyy", { locale: es })
  }

  const getStatusInfo = (status: string): { label: string; color: string; icon: React.ReactNode } => {
    switch(status) {
      case 'confirmed':
        return { 
          label: 'Confirmado', 
          color: 'bg-green-100 text-green-800',
          icon: <Check size={14} className="mr-1" />
        }
      case 'pending':
        return { 
          label: 'Pendiente', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock size={14} className="mr-1" />
        }
      case 'completed':
        return { 
          label: 'Completado', 
          color: 'bg-blue-100 text-blue-800',
          icon: <Check size={14} className="mr-1" />
        }
      case 'cancelled':
        return { 
          label: 'Cancelado', 
          color: 'bg-red-100 text-red-800',
          icon: <X size={14} className="mr-1" />
        }
      default:
        return { 
          label: 'Desconocido', 
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertTriangle size={14} className="mr-1" />
        }
    }
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
            <Calendar size={24} className="text-dorado-claro" />
            <h1 className="text-xl font-semibold">Mis Reservas</h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white flex items-center gap-1"
            >
              <Download size={14} />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Filtros y búsqueda */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Buscar reservas..."
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
              <div className="md:hidden">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-verde-principal/70 text-verde-tipografia hover:bg-verde-principal/10"
                >
                  <Download size={16} className="mr-1" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
          
          {/* Pestañas de estado */}
          <div className="flex overflow-x-auto pb-1 no-scrollbar">
            <Button 
              variant="ghost" 
              onClick={() => setActiveFilter('all')}
              className={`mr-2 px-3 py-1.5 rounded-full h-auto whitespace-nowrap ${
                activeFilter === 'all' 
                  ? 'bg-verde-principal text-white' 
                  : 'text-verde-tipografia hover:bg-verde-principal/10'
              }`}
            >
              Todas ({reservationCounts.all})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveFilter('confirmed')}
              className={`mr-2 px-3 py-1.5 rounded-full h-auto whitespace-nowrap ${
                activeFilter === 'confirmed' 
                  ? 'bg-verde-principal text-white' 
                  : 'text-verde-tipografia hover:bg-verde-principal/10'
              }`}
            >
              Confirmadas ({reservationCounts.confirmed})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveFilter('pending')}
              className={`mr-2 px-3 py-1.5 rounded-full h-auto whitespace-nowrap ${
                activeFilter === 'pending' 
                  ? 'bg-verde-principal text-white' 
                  : 'text-verde-tipografia hover:bg-verde-principal/10'
              }`}
            >
              Pendientes ({reservationCounts.pending})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveFilter('completed')}
              className={`mr-2 px-3 py-1.5 rounded-full h-auto whitespace-nowrap ${
                activeFilter === 'completed' 
                  ? 'bg-verde-principal text-white' 
                  : 'text-verde-tipografia hover:bg-verde-principal/10'
              }`}
            >
              Completadas ({reservationCounts.completed})
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveFilter('cancelled')}
              className={`mr-2 px-3 py-1.5 rounded-full h-auto whitespace-nowrap ${
                activeFilter === 'cancelled' 
                  ? 'bg-verde-principal text-white' 
                  : 'text-verde-tipografia hover:bg-verde-principal/10'
              }`}
            >
              Canceladas ({reservationCounts.cancelled})
            </Button>
          </div>
        </div>
        
        {/* Lista de reservas */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-verde-tipografia mb-2">No se encontraron reservas</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {activeFilter !== 'all'
                  ? `No tienes reservas con el estado "${getStatusInfo(activeFilter).label}". Prueba con otro filtro.`
                  : searchQuery 
                    ? 'No hay resultados para tu búsqueda. Intenta con otros términos.'
                    : 'Parece que aún no has realizado ninguna reserva. ¡Explora nuestras experiencias y reserva ahora!'}
              </p>
              <Button 
                className="bg-verde-principal text-white hover:bg-verde-dark"
                onClick={() => router.push('/experiencias')}
              >
                Ver Experiencias
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredReservations.map((reservation) => {
                const statusInfo = getStatusInfo(reservation.status)
                
                return (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-4"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-40 sm:h-auto relative overflow-hidden">
                        <img 
                          src={reservation.image} 
                          alt={reservation.experience}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-2 px-3 sm:hidden">
                          <Badge className={`${statusInfo.color} flex w-fit items-center`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-semibold text-verde-tipografia mr-2">{reservation.experience}</h3>
                              <Badge className={`${statusInfo.color} hidden sm:flex items-center`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                              {reservation.location} 
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                              <div className="text-sm flex items-center text-gray-600">
                                <Calendar size={14} className="mr-1 text-verde-principal/70" />
                                <span>{formatDate(reservation.date)}</span>
                              </div>
                              <div className="text-sm flex items-center text-gray-600">
                                <Clock size={14} className="mr-1 text-verde-principal/70" />
                                <span>{reservation.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-verde-tipografia font-medium">
                              Código: {reservation.id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-3">
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                              <Badge variant="outline" className="bg-verde-principal/5 text-verde-tipografia border-verde-principal/20 w-fit">
                                {reservation.participants} {reservation.participants === 1 ? 'Persona' : 'Personas'}
                              </Badge>
                              <div className="text-sm text-gray-500 sm:pl-2">
                                <span className="font-medium text-verde-tipografia">${reservation.price}</span> por persona
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total pagado: <span className="font-semibold text-verde-tipografia">${reservation.totalPaid}</span></p>
                            </div>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="flex flex-wrap gap-2 mt-4 sm:justify-end">
                            {reservation.status === 'cancelled' && (
                              <div className="text-sm text-red-500 mb-2 w-full">
                                <span className="font-medium">Motivo de cancelación:</span> {reservation.cancellationReason}
                              </div>
                            )}
                            
                            {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                              <>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                                >
                                  Ver Detalles
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                                >
                                  Modificar
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                            
                            {reservation.status === 'completed' && (
                              <>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                                >
                                  Ver Detalles
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-dorado-oscuro text-dorado-oscuro hover:bg-dorado-claro hover:text-white"
                                >
                                  Dejar Reseña
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                                >
                                  Reservar Otra Vez
                                </Button>
                              </>
                            )}
                            
                            {reservation.status === 'cancelled' && (
                              <>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white"
                                >
                                  Ver Detalles
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                                >
                                  Reservar Otra Vez
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
          
          {/* Paginación */}
          {filteredReservations.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline"
                size="icon"
                className="mr-2"
                disabled
              >
                <ArrowLeft size={16} />
              </Button>
              <Button 
                variant="outline"
                className="bg-verde-principal text-white hover:bg-verde-dark mx-1 w-10 h-10"
              >
                1
              </Button>
              <Button 
                variant="outline"
                className="text-verde-tipografia hover:bg-verde-principal/10 mx-1 w-10 h-10"
              >
                2
              </Button>
              <Button 
                variant="outline"
                size="icon"
                className="ml-2"
              >
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
