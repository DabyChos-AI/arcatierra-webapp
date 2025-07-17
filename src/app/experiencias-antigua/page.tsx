'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar, Clock, Users, MapPin, Star, Heart, ChevronRight, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const experiences = [
  {
    id: 1,
    title: 'Taller de Huerto Urbano',
    description: 'Aprende a crear tu propio huerto urbano desde cero. Técnicas de siembra, cuidado y cosecha de vegetales orgánicos.',
    image: '/experiences/taller-huerto.jpg',
    duration: '3 horas',
    capacity: 12,
    price: 450,
    category: 'Taller',
    difficulty: 'Principiante',
    location: 'Centro de Agricultura Urbana, Roma Norte',
    rating: 4.9,
    reviews: 127,
    instructor: 'Ing. María González',
    includes: ['Kit de herramientas', 'Semillas orgánicas', 'Manual digital', 'Refrigerio saludable'],
    schedule: [
      { date: '2025-07-05', time: '09:00', available: 8 },
      { date: '2025-07-12', time: '09:00', available: 5 },
      { date: '2025-07-19', time: '09:00', available: 12 },
      { date: '2025-07-26', time: '09:00', available: 3 }
    ]
  },
  {
    id: 2,
    title: 'Tour por las Chinampas de Xochimilco',
    description: 'Descubre el sistema agrícola ancestral de las chinampas. Navega por los canales y conoce la agricultura tradicional mexicana.',
    image: '/experiences/tour-chinampas.jpg',
    duration: '4 horas',
    capacity: 20,
    price: 650,
    category: 'Tour',
    difficulty: 'Todos los niveles',
    location: 'Embarcadero Cuemanco, Xochimilco',
    rating: 4.8,
    reviews: 89,
    instructor: 'Maestro Chinampero José Ramírez',
    includes: ['Transporte en trajinera', 'Guía especializado', 'Degustación de productos', 'Almuerzo tradicional'],
    schedule: [
      { date: '2025-07-06', time: '08:00', available: 15 },
      { date: '2025-07-13', time: '08:00', available: 8 },
      { date: '2025-07-20', time: '08:00', available: 20 },
      { date: '2025-07-27', time: '08:00', available: 12 }
    ]
  },
  {
    id: 3,
    title: 'Cocina Sustentable con Chef',
    description: 'Clase magistral de cocina con ingredientes 100% orgánicos. Aprende recetas saludables y técnicas de cocina sustentable.',
    image: '/experiences/cocina-sustentable.jpg',
    duration: '3.5 horas',
    capacity: 16,
    price: 850,
    category: 'Cocina',
    difficulty: 'Intermedio',
    location: 'Cocina Arca Tierra, Condesa',
    rating: 5.0,
    reviews: 156,
    instructor: 'Chef Ana Martínez',
    includes: ['Ingredientes orgánicos', 'Recetario digital', 'Delantal personalizado', 'Cena completa'],
    schedule: [
      { date: '2025-07-07', time: '16:00', available: 4 },
      { date: '2025-07-14', time: '16:00', available: 16 },
      { date: '2025-07-21', time: '16:00', available: 9 },
      { date: '2025-07-28', time: '16:00', available: 7 }
    ]
  },
  {
    id: 4,
    title: 'Mercado Orgánico Guiado',
    description: 'Recorrido educativo por mercados orgánicos locales. Aprende a identificar productos de calidad y conoce a los productores.',
    image: '/experiences/mercado-organico.jpg',
    duration: '2.5 horas',
    capacity: 15,
    price: 350,
    category: 'Tour',
    difficulty: 'Todos los niveles',
    location: 'Mercado El 100, Roma Norte',
    rating: 4.7,
    reviews: 203,
    instructor: 'Nutrióloga Carmen López',
    includes: ['Guía especializada', 'Degustación de productos', 'Bolsa de compras', 'Lista de productores'],
    schedule: [
      { date: '2025-07-08', time: '10:00', available: 12 },
      { date: '2025-07-15', time: '10:00', available: 6 },
      { date: '2025-07-22', time: '10:00', available: 15 },
      { date: '2025-07-29', time: '10:00', available: 10 }
    ]
  }
]

const categories = ['Todos', 'Taller', 'Tour', 'Cocina']
const difficulties = ['Todos los niveles', 'Principiante', 'Intermedio', 'Avanzado']

export default function ExperienciasPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos los niveles')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Generar eventos del calendario
  useEffect(() => {
    const events = experiences.flatMap(exp => 
      exp.schedule.map(schedule => ({
        id: `${exp.id}-${schedule.date}-${schedule.time}`,
        title: exp.title,
        start: `${schedule.date}T${schedule.time}`,
        backgroundColor: exp.category === 'Taller' ? '#B15543' : 
                        exp.category === 'Tour' ? '#33503E' : 
                        exp.category === 'Cocina' ? '#DCB584' : '#CCBB9A',
        borderColor: 'transparent',
        textColor: 'white',
        extendedProps: {
          experienceId: exp.id,
          available: schedule.available,
          capacity: exp.capacity,
          price: exp.price
        }
      }))
    )
    setCalendarEvents(events)
  }, [])

  // Filtrar experiencias
  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = selectedCategory === 'Todos' || exp.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'Todos los niveles' || exp.difficulty === selectedDifficulty
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesDifficulty && matchesSearch
  })

  const toggleFavorite = (expId: number) => {
    setFavorites(prev => 
      prev.includes(expId) 
        ? prev.filter(id => id !== expId)
        : [...prev, expId]
    )
  }

  const handleDateClick = (arg: any) => {
    const event = calendarEvents.find(e => e.start === arg.dateStr)
    if (event) {
      setSelectedExperience(event.extendedProps.experienceId)
      setSelectedDate(arg.dateStr.split('T')[0])
      setSelectedTime(arg.dateStr.split('T')[1])
      setShowReservationModal(true)
    }
  }

  const handleReservation = () => {
    // Aquí iría la lógica de reserva
    alert(`Reserva confirmada para ${selectedDate} a las ${selectedTime}`)
    setShowReservationModal(false)
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="bg-verde-dark text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Experiencias Arca Tierra</h1>
          <p className="text-xl text-neutral-light">
            Conecta con la naturaleza y aprende agricultura sustentable
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar experiencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-dark focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-dark focus:border-transparent"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredExperiences.length} experiencias encontradas
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de experiencias */}
          <div className="lg:col-span-2 space-y-6">
            {filteredExperiences.map((experience) => (
              <div
                key={experience.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="md:flex">
                  {/* Imagen */}
                  <div className="md:w-80 h-64 md:h-auto relative overflow-hidden">
                    <img
                      src={experience.image}
                      alt={experience.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Badge de categoría */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-terracota-primary text-white">
                        {experience.category}
                      </Badge>
                    </div>

                    {/* Botón de favorito */}
                    <button
                      onClick={() => toggleFavorite(experience.id)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.includes(experience.id)
                            ? 'fill-terracota-primary text-terracota-primary'
                            : 'text-gray-400 hover:text-terracota-primary'
                        }`}
                      />
                    </button>

                    {/* Precio */}
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white rounded-lg px-3 py-2 shadow-md">
                        <span className="text-2xl font-bold text-terracota-primary">
                          ${experience.price}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">MXN</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-terracota-primary transition-colors">
                        {experience.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {experience.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Máx. {experience.capacity} personas
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {experience.difficulty}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(experience.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{experience.rating}</span>
                        <span className="text-sm text-gray-500">({experience.reviews} reseñas)</span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {experience.description}
                    </p>

                    {/* Instructor */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Instructor:</span> {experience.instructor}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ubicación:</span> {experience.location}
                      </p>
                    </div>

                    {/* Incluye */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Incluye:</h4>
                      <div className="flex flex-wrap gap-2">
                        {experience.includes.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {experience.includes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{experience.includes.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Próximas fechas */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Próximas fechas:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {experience.schedule.slice(0, 2).map((schedule, index) => (
                          <div key={index} className="text-xs bg-gray-50 rounded-lg p-2">
                            <div className="font-medium">
                              {new Date(schedule.date).toLocaleDateString('es-MX', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-gray-600">{schedule.time}</div>
                            <div className="text-verde-dark font-medium">
                              {schedule.available} disponibles
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-verde-dark text-verde-dark hover:bg-verde-light"
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        className="flex-1 bg-terracota-primary hover:bg-terracota-dark text-white"
                        onClick={() => {
                          setSelectedExperience(experience.id)
                          setShowReservationModal(true)
                        }}
                      >
                        Reservar Ahora
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-terracota-primary" />
                Calendario de Experiencias
              </h3>
              
              <div className="mb-4">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                  }}
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  height="auto"
                  locale="es"
                  firstDay={1}
                  eventDisplay="block"
                  dayMaxEvents={2}
                  moreLinkText="más"
                  eventClassNames="cursor-pointer"
                />
              </div>

              {/* Leyenda */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Leyenda:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-terracota-primary rounded"></div>
                    <span>Talleres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-verde-dark rounded"></div>
                    <span>Tours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-neutral-medium rounded"></div>
                    <span>Cocina</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Reserva</h3>
            
            {selectedExperience && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  {experiences.find(e => e.id === selectedExperience)?.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Fecha: {selectedDate && new Date(selectedDate).toLocaleDateString('es-MX')}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Hora: {selectedTime}
                </p>
                <p className="text-lg font-bold text-terracota-primary">
                  Precio: ${experiences.find(e => e.id === selectedExperience)?.price} MXN
                </p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de personas
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-dark focus:border-transparent">
                  <option value="1">1 persona</option>
                  <option value="2">2 personas</option>
                  <option value="3">3 personas</option>
                  <option value="4">4 personas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <Input placeholder="Tu nombre completo" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input type="email" placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input placeholder="55 1234 5678" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowReservationModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-terracota-primary hover:bg-terracota-dark text-white"
                onClick={handleReservation}
              >
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

