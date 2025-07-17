'use client'

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import ExperienceCardPro from '@/components/experiencias-premium/ExperienceCardPro'
import ExperienceCarousel from '@/components/experiencias-premium/ExperienceCarousel'
import CalendarPro from '@/components/experiencias-premium/CalendarPro'
import ExperienceFilters, { ExperienceFilters as FilterOptions } from '@/components/experiencias-premium/ExperienceFilters'
import { toast } from 'react-hot-toast'
import { Calendar as CalendarIcon } from 'lucide-react'

const PublicExperiencesNew = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  const controls = useAnimation();
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Estado para los filtros
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [300, 1500], // Min/max precio
    duration: [], // Filtro de duración (short, medium, long)
    type: [], // Filtro de tipo
    location: [] // Filtro de ubicación
  });

  // Datos enriquecidos de experiencias públicas con información para filtrado
  const publicExperiences = [
    {
      id: 1,
      title: "Amanecer chinampero",
      image: "/images/experiencias/experiencias_chinampa_del_sol.jpg",
      description: "Contempla el amanecer desde los canales de Xochimilco y disfruta un desayuno de tres tiempos preparado con maíz nativo y vegetales frescos.",
      duration: "3 horas",
      durationCategory: "medium", // Para filtrado
      participants: "2-12 personas",
      location: "Embarcadero Cuemanco, Xochimilco",
      locationCategory: "embarcadero", // Para filtrado
      type: "gastronomic", // Para filtrado
      rating: 4.9,
      price: "$850 por persona",
      priceValue: 850, // Para filtrado
      dates: ["2025-07-13", "2025-07-20", "2025-07-27"]
    },
    {
      id: 2,
      title: "Amanecer chinampero con The Curious Mexican",
      image: "/images/experiencias/experiencias_arca_tierra.jpg",
      description: "Amanecer chinampero con guía en inglés y español, y desayuno especial de chef invitado, curado por The Curious Mexican.",
      duration: "3.5 horas",
      durationCategory: "medium", // Para filtrado
      participants: "4-10 personas",
      location: "Embarcadero Cuemanco, Xochimilco",
      locationCategory: "embarcadero", // Para filtrado
      type: "gastronomic", // Para filtrado
      rating: 5.0,
      price: "$980 por persona",
      priceValue: 980, // Para filtrado
      dates: ["2025-07-20", "2025-08-03", "2025-08-17"]
    },
    {
      id: 3,
      title: "Brunch chinampero",
      image: "/images/experiencias/turismo_rural.JPG",
      description: "Un domingo al mes, vive una mañana deliciosa en la Chinampa del Sol con brunch, bebidas frías y un recorrido guiado por el campo regenerativo.",
      duration: "4 horas",
      durationCategory: "medium", // Para filtrado
      participants: "4-15 personas",
      location: "Chinampa del Sol, Xochimilco",
      locationCategory: "chinampa", // Para filtrado
      type: "gastronomic", // Para filtrado
      rating: 4.8,
      price: "$780 por persona",
      priceValue: 780, // Para filtrado
      dates: ["2025-08-10", "2025-09-14", "2025-10-12"]
    },
    {
      id: 4,
      title: "Chinampa en familia",
      image: "/images/experiencias/turismo_rural_xochimilco.jpg",
      description: "Una experiencia pensada para las infancias: desayuno, recorrido por la chinampa y actividades agroecológicas divertidas para toda la familia.",
      duration: "3.5 horas",
      durationCategory: "medium", // Para filtrado
      participants: "Familias (4-16 personas)",
      location: "Chinampa del Sol, Xochimilco",
      locationCategory: "chinampa", // Para filtrado
      type: "family", // Para filtrado
      rating: 4.9,
      price: "$650 adultos | $450 niños",
      priceValue: 650, // Para filtrado (usando precio adulto)
      dates: ["2025-07-12", "2025-07-19", "2025-07-26"]
    },
    {
      id: 5,
      title: "Comida Chinampera",
      image: "/images/experiencias/xochimilco_experiencias_gastronomicas.jpg",
      description: "Comidas únicas junto a chefs invitados de México y el mundo, en colaboración con Arca Tierra y la red de productores regenerativos.",
      duration: "5 horas",
      durationCategory: "long", // Para filtrado
      participants: "6-20 personas",
      location: "Chinampa del Sol, Xochimilco",
      locationCategory: "chinampa", // Para filtrado
      type: "gastronomic", // Para filtrado
      rating: 4.9,
      price: "$1,250 por persona",
      priceValue: 1250, // Para filtrado
      dates: ["2025-08-02", "2025-08-16", "2025-08-30"]
    }
  ];

  // Filtrar experiencias según criterios seleccionados
  const filteredExperiences = useMemo(() => {
    return publicExperiences.filter(exp => {
      // Filtro por rango de precio
      const priceMatch = 
        exp.priceValue >= filters.priceRange[0] && 
        exp.priceValue <= filters.priceRange[1];
      
      // Filtro por duración
      const durationMatch = 
        filters.duration.length === 0 || 
        filters.duration.includes(exp.durationCategory);
      
      // Filtro por tipo
      const typeMatch = 
        filters.type.length === 0 || 
        filters.type.includes(exp.type);
      
      // Filtro por ubicación
      const locationMatch = 
        filters.location.length === 0 || 
        filters.location.includes(exp.locationCategory);
      
      return priceMatch && durationMatch && typeMatch && locationMatch;
    });
  }, [publicExperiences, filters]);

  // Resetear filtros a valores por defecto
  const handleResetFilters = useCallback(() => {
    setFilters({
      priceRange: [300, 1500],
      duration: [],
      type: [],
      location: []
    });
  }, []);

  const handleSelectExperience = (experience: any) => {
    setSelectedExperience(experience);
    
    // Breve tiempo para permitir la renderización antes de hacer scroll
    setTimeout(() => {
      // Scroll to calendar section smoothly
      const calendarElement = document.getElementById('calendar-section');
      if (calendarElement) {
        calendarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleReservation = (date: string) => {
    if (selectedExperience) {
      toast.success(
        `¡Reserva confirmada! Experiencia: ${selectedExperience.title} para el ${new Date(date).toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`,
        {
          duration: 5000,
          position: 'bottom-center',
          style: {
            background: '#f0f9eb',
            color: '#3c6142',
            border: '1px solid #3c6142'
          }
        }
      );
    }
  };

  return (
    <section ref={ref} className="py-20 px-4 md:px-8 bg-white overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10" variants={itemVariants}>
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair text-verde-principal mb-2">
              Experiencias públicas
            </h2>
            <p className="text-verde-tipografia max-w-2xl">
              Reserva tu lugar en alguna de nuestras experiencias abiertas al público, diseñadas para conectar con la naturaleza y la cultura chinampera.
            </p>
          </div>
          <motion.div 
            className="mt-4 md:mt-0 py-1 px-3 rounded-full bg-verde-principal/10 text-verde-principal text-sm font-medium flex items-center"
            whileHover={{ scale: 1.03 }}
          >
            <span className="mr-2">•</span> Calendario actualizado
          </motion.div>
        </motion.div>

        {/* Componente de filtros */}
        <motion.div variants={itemVariants} className="mt-8">
          <ExperienceFilters 
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            experienceCount={filteredExperiences.length}
          />
        </motion.div>

        {filteredExperiences.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-12 bg-neutro-crema/20 rounded-lg shadow-sm mt-6">
            <h3 className="text-xl font-medium text-verde-principal mb-2">No se encontraron experiencias</h3>
            <p className="text-verde-tipografia">Intenta ajustar los filtros para ver más opciones</p>
            <button 
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-dorado-oscuro text-white rounded-md hover:bg-dorado-principal transition-colors"
            >
              Limpiar filtros
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              className="mt-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((experience, index) => (
                  <ExperienceCardPro
                    key={experience.id}
                    experience={{
                      title: experience.title,
                      image: experience.image,
                      description: experience.description,
                      duration: experience.duration,
                      participants: experience.participants,
                      location: experience.location,
                      rating: experience.rating,
                      price: experience.price,
                      dates: experience.dates
                    }}
                    onReserve={() => handleSelectExperience(experience)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
            
            <div id="calendar-section" className="mt-16 scroll-mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <motion.div className="md:col-span-2" variants={itemVariants}>
                  <h3 className="text-2xl font-playfair text-verde-principal mb-4">Reserva tu experiencia</h3>
                  <p className="text-verde-tipografia mb-6">
                    Selecciona una de nuestras experiencias y reserva en las fechas disponibles del calendario. 
                    Todas las experiencias incluyen transporte desde puntos específicos de la ciudad, alimentos y actividades guiadas.
                  </p>
                  
                  <div className="bg-neutro-crema/30 p-6 rounded-lg border-l-4 border-verde-principal mb-6">
                    <h4 className="font-medium text-lg text-verde-principal mb-2">
                      {selectedExperience ? selectedExperience.title : 'Selecciona una experiencia'}
                    </h4>
                    
                    {selectedExperience ? (
                      <>
                        <p className="text-verde-tipografia mb-3">{selectedExperience.description}</p>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                          <div className="flex items-center text-verde-tipografia">
                            <span className="font-medium mr-2">Duración:</span> 
                            <span>{selectedExperience.duration}</span>
                          </div>
                          
                          <div className="flex items-center text-verde-tipografia">
                            <span className="font-medium mr-2">Participantes:</span> 
                            <span>{selectedExperience.participants}</span>
                          </div>
                          
                          <div className="flex items-center text-verde-tipografia col-span-2">
                            <span className="font-medium mr-2">Ubicación:</span> 
                            <span>{selectedExperience.location}</span>
                          </div>
                          
                          <div className="flex items-center text-verde-principal col-span-2 mt-2">
                            <span className="font-medium mr-2">Precio:</span> 
                            <span className="font-playfair">{selectedExperience.price}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-verde-tipografia/60">
                        <p>Selecciona una experiencia para ver detalles y reservar</p>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <motion.div className="md:sticky md:top-28" variants={itemVariants}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {selectedExperience ? (
                      <CalendarPro 
                        experience={{
                          title: selectedExperience.title,
                          duration: selectedExperience.duration,
                          participants: selectedExperience.participants,
                          price: selectedExperience.price
                        }}
                        dates={selectedExperience.dates} 
                        onSelectDate={handleReservation}
                        className="min-h-[400px] p-4"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-80 p-6 text-center">
                        <CalendarIcon className="w-12 h-12 mb-4 text-neutro-gris/40" />
                        <p className="text-verde-tipografia mb-2">Selecciona una experiencia para ver fechas disponibles</p>
                        <p className="text-sm text-verde-tipografia/60">El calendario mostrará las fechas disponibles para reservar</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default PublicExperiencesNew;
