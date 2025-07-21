'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react'

interface Reservation {
  id: string
  type: 'experiencia' | 'baldio' | 'catering'
  title: string
  date: string
  time: string
  location: string
  status: 'confirmada' | 'pendiente' | 'cancelada'
  participants: number
  contact: {
    phone: string
    email: string
  }
  notes?: string
}

export default function ReservasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data de reservas
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      // Simular carga de reservas
      setTimeout(() => {
        // Detectar si es usuario demo
        const isDemoUser = session.user.email === 'prueba@prueba.com' || session.user.name === 'Usuario Prueba'
        
        if (isDemoUser) {
          // Mock data para usuario demo
          setReservations([
            {
              id: 'res-001',
              type: 'baldio',
              title: 'Cena en Baldío Restaurante',
              date: '2025-08-15',
              time: '20:00',
              location: 'Baldío Restaurante, Roma Norte',
              status: 'confirmada',
              participants: 2,
              contact: {
                phone: '+52 55 1234 5678',
                email: 'reservas@baldio.mx'
              },
              notes: 'Mesa para 2 personas, menú degustación'
            },
            {
              id: 'res-002', 
              type: 'experiencia',
              title: 'Tour Chinampas Premium',
              date: '2025-08-20',
              time: '09:00',
              location: 'Xochimilco, CDMX',
              status: 'pendiente',
              participants: 4,
              contact: {
                phone: '+52 55 9876 5432',
                email: 'experiencias@arcatierra.com'
              }
            },
            {
              id: 'res-003',
              type: 'experiencia',
              title: 'Taller de Cocina Sustentable',
              date: '2025-09-05',
              time: '15:00',
              location: 'Centro de Sustentabilidad, Coyoacán',
              status: 'cancelada',
              participants: 1,
              contact: {
                phone: '+52 55 5555 1234',
                email: 'talleres@sustentable.mx'
              },
              notes: 'Cancelada por el usuario'
            }
          ])
        } else {
          // Usuario real - sin reservas hasta que haga reservas reales
          setReservations([])
        }
        setLoading(false)
      }, 1000)
    }
  }, [session, status, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'pendiente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'cancelada':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
          <p className="mt-2 text-gray-600">
            Gestiona y revisa todas tus reservas de experiencias y restaurante
          </p>
        </div>

        {/* Reservas */}
        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes reservas</h3>
            <p className="text-gray-600 mb-6">
              Cuando hagas una reserva aparecerá aquí
            </p>
            <button
              onClick={() => router.push('/experiencias')}
              className="bg-verde-principal text-white px-6 py-2 rounded-lg hover:bg-verde-oscuro transition-colors"
            >
              Explorar Experiencias
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {reservation.title}
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(reservation.status)}`}>
                      {getStatusIcon(reservation.status)}
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {reservation.type.charAt(0).toUpperCase() + reservation.type.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-verde-principal" />
                    <span>{new Date(reservation.date).toLocaleDateString('es-MX', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-verde-principal" />
                    <span>{reservation.time} hrs</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-verde-principal" />
                    <span>{reservation.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <span className="font-medium">Participantes:</span>
                    <span>{reservation.participants}</span>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Notas:</strong> {reservation.notes}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{reservation.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{reservation.contact.email}</span>
                    </div>
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
