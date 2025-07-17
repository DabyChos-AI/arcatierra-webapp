'use client'

import React, { useState, useEffect } from 'react'
import ExperienceCardPro from '@/components/experiencias/ExperienceCardPro'
import ExperienceCarousel from '@/components/experiencias/ExperienceCarousel'
import CalendarPro from '@/components/experiencias/CalendarPro'
import ExperienceFilters, { ExperienceFilters as FilterOptions } from '@/components/experiencias/ExperienceFilters'
import { useToast } from '@/components/experiencias/ToastProvider'
import { useRouter } from 'next/navigation'

// Tipos
type Experience = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  availability: string[];
  image: string;
  rating: number;
  category: string;
  level: string;
  location: string;
  participants: number;
  included: string[];
  notIncluded: string[];
  slug: string;
};

// Datos de ejemplo
const experiences: Experience[] = [
  {
    id: "exp-001",
    title: "Tour gastronómico en la chinampa",
    description: "Explora los sabores tradicionales de Xochimilco con un recorrido por nuestras chinampas, donde podrás degustar platillos preparados con ingredientes cosechados el mismo día.",
    price: 1200,
    duration: "4 horas",
    availability: ["lunes", "miércoles", "viernes", "sábado"],
    image: "/images/experiencias/gastronomico.jpg",
    rating: 4.9,
    category: "Gastronomía",
    level: "Todos los niveles",
    location: "Xochimilco",
    participants: 12,
    included: ["Recorrido guiado", "Degustación de 5 platillos", "Bebidas tradicionales", "Transporte en trajinera"],
    notIncluded: ["Transporte al punto de encuentro", "Propinas"],
    slug: "tour-gastronomico-chinampa"
  },
  {
    id: "exp-002",
    title: "Taller de agricultura chinampera",
    description: "Aprende las técnicas ancestrales de la agricultura chinampera. Participa en actividades prácticas de siembra y cosecha en nuestras chinampas certificadas.",
    price: 850,
    duration: "3 horas",
    availability: ["martes", "jueves", "sábado"],
    image: "/images/experiencias/agricultura.jpg",
    rating: 4.7,
    category: "Educativo",
    level: "Principiante",
    location: "Xochimilco",
    participants: 8,
    included: ["Materiales para siembra", "Guía especializado", "Refrigerio con productos locales"],
    notIncluded: ["Transporte", "Productos adicionales para llevar"],
    slug: "taller-agricultura-chinampera"
  },
  {
    id: "exp-003",
    title: "Recorrido fotográfico al amanecer",
    description: "Captura la magia del amanecer en las chinampas con este tour especialmente diseñado para fotógrafos, donde la luz natural realza la belleza de los canales y cultivos.",
    price: 950,
    duration: "5 horas",
    availability: ["miércoles", "domingo"],
    image: "/images/experiencias/fotografico.jpg",
    rating: 4.8,
    category: "Fotografía",
    level: "Intermedio",
    location: "Xochimilco",
    participants: 6,
    included: ["Guía fotógrafo profesional", "Transporte en trajinera", "Desayuno tradicional"],
    notIncluded: ["Equipo fotográfico", "Transporte al punto de encuentro"],
    slug: "recorrido-fotografico-amanecer"
  },
  {
    id: "exp-004",
    title: "Cena bajo las estrellas",
    description: "Disfruta de una experiencia gastronómica única con una cena de 5 tiempos a la luz de las velas en el corazón de nuestras chinampas.",
    price: 1500,
    duration: "4 horas",
    availability: ["viernes", "sábado"],
    image: "/images/experiencias/cena-estrellas.jpg",
    rating: 5.0,
    category: "Gastronomía",
    level: "Todos los niveles",
    location: "Xochimilco",
    participants: 10,
    included: ["Cena de 5 tiempos", "Maridaje con bebidas artesanales", "Transporte en trajinera", "Música en vivo"],
    notIncluded: ["Transporte al punto de encuentro"],
    slug: "cena-bajo-estrellas"
  }
];

const ExperienciasPublicas = () => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>({
    category: 'todas',
    price: [0, 2000],
    duration: 'todas',
    level: 'todos',
    date: null
  });
  
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(experiences);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'cards'>('cards');

  useEffect(() => {
    filterExperiences();
  }, [selectedFilters]);

  const filterExperiences = () => {
    let filtered = [...experiences];
    
    // Filtrar por categoría
    if (selectedFilters.category !== 'todas') {
      filtered = filtered.filter(exp => exp.category === selectedFilters.category);
    }
    
    // Filtrar por precio
    filtered = filtered.filter(exp => 
      exp.price >= selectedFilters.price[0] && 
      exp.price <= selectedFilters.price[1]
    );
    
    // Filtrar por duración
    if (selectedFilters.duration !== 'todas') {
      const [minHours] = selectedFilters.duration.split('-')[0].split(' ');
      const maxHours = selectedFilters.duration.split('-')[1]?.split(' ')[0] || '99';
      
      filtered = filtered.filter(exp => {
        const expHours = parseInt(exp.duration.split(' ')[0]);
        return expHours >= parseInt(minHours) && expHours <= parseInt(maxHours);
      });
    }
    
    // Filtrar por nivel
    if (selectedFilters.level !== 'todos') {
      filtered = filtered.filter(exp => exp.level.includes(selectedFilters.level));
    }
    
    // Filtrar por fecha
    if (selectedFilters.date) {
      const day = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(selectedFilters.date).toLowerCase();
      filtered = filtered.filter(exp => exp.availability.includes(day));
      setSelectedDate(selectedFilters.date);
    }
    
    setFilteredExperiences(filtered);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setSelectedFilters(newFilters);
  };

  const handleReserve = (expId: string) => {
    if (!selectedDate) {
      showToast({
        title: 'Selecciona una fecha',
        message: 'Para reservar necesitas seleccionar una fecha disponible',
        type: 'warning'
      });
      setActiveView('calendar');
      return;
    }
    
    const exp = experiences.find(e => e.id === expId);
    if (exp) {
      // Agregar al carrito de compras (simulación)
      showToast({
        title: 'Experiencia agregada',
        message: `"${exp.title}" ha sido añadida al carrito`,
        type: 'success'
      });
      
      // Aquí se implementaría la redirección al carrito o checkout
      // router.push('/checkout');
    }
  };

  return (
    <section id="experiencias-publicas" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-verde-claro/20 text-verde-principal text-sm font-medium mb-4">
            PARA TODOS
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair text-verde-principal mb-6">
            Experiencias Públicas
          </h2>
          <p className="text-lg text-verde-tipografia max-w-3xl mx-auto">
            Reserva tu lugar en nuestras experiencias programadas para conocer las chinampas, aprender sobre agricultura sostenible y disfrutar la gastronomía local.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros y vista de calendario */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              {/* Toggle entre vistas */}
              <div className="flex items-center justify-center mb-6">
                <button 
                  className={`flex-1 py-3 px-4 text-center rounded-l-lg transition ${activeView === 'cards' ? 'bg-verde-principal text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setActiveView('cards')}
                >
                  Tarjetas
                </button>
                <button 
                  className={`flex-1 py-3 px-4 text-center rounded-r-lg transition ${activeView === 'calendar' ? 'bg-verde-principal text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setActiveView('calendar')}
                >
                  Calendario
                </button>
              </div>
              
              {activeView === 'calendar' ? (
                <div>
                  <h3 className="text-xl font-semibold text-verde-principal mb-4">
                    Calendario de Experiencias
                  </h3>
                  <CalendarPro 
                    onSelectDate={(date) => {
                      setSelectedFilters({...selectedFilters, date});
                      setSelectedDate(date);
                    }}
                    selectedDate={selectedDate}
                    availableDates={[
                      new Date(2025, 6, 10),
                      new Date(2025, 6, 12),
                      new Date(2025, 6, 14),
                      new Date(2025, 6, 15),
                      new Date(2025, 6, 17),
                      new Date(2025, 6, 19),
                      new Date(2025, 6, 21),
                      new Date(2025, 6, 22),
                      new Date(2025, 6, 24),
                      new Date(2025, 6, 26),
                      new Date(2025, 6, 28),
                      new Date(2025, 6, 29),
                    ]}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-verde-principal mb-4">
                    Filtros
                  </h3>
                  <ExperienceFilters 
                    onFiltersChange={handleFiltersChange}
                    initialFilters={selectedFilters}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Contenido principal - Tarjetas o Lista */}
          <div className="w-full lg:w-2/3">
            {filteredExperiences.length > 0 ? (
              <div className="space-y-8">
                {activeView === 'cards' ? (
                  <ExperienceCarousel experiences={filteredExperiences} onReserve={handleReserve} />
                ) : (
                  <div className="space-y-6">
                    {filteredExperiences.map(exp => (
                      <ExperienceCardPro 
                        key={exp.id} 
                        experience={exp}
                        onReserve={() => handleReserve(exp.id)} 
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No hay experiencias disponibles</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Prueba con otros filtros o fechas para encontrar experiencias disponibles.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienciasPublicas;
