'use client'

import React from 'react'
import { motion } from 'framer-motion'
import OptimizedImage from '@/components/ui/OptimizedImage'
import ExperienceCard from '@/components/experiencias/ExperienceCard'

// Tipos
type PrivateExperience = {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  minParticipants: number;
  maxParticipants: number;
  image: string;
  slug: string;
  highlights: string[];
};

// Datos de ejemplo
const privateExperiences: PrivateExperience[] = [
  {
    id: "priv-001",
    title: "Recorrido corporativo team building",
    description: "Fortalece los lazos de tu equipo con una experiencia única en las chinampas de Xochimilco. Incluye actividades de integración, comida gourmet y talleres personalizados.",
    price: "Desde $15,000",
    duration: "6-8 horas",
    minParticipants: 10,
    maxParticipants: 50,
    image: "/images/experiencias/experiencias_arca_tierra.jpg",
    slug: "recorrido-corporativo",
    highlights: [
      "Actividades de team building diseñadas por expertos",
      "Menú personalizado con productos locales",
      "Espacio privado para reuniones o presentaciones",
      "Transporte en trajineras exclusivas"
    ]
  },
  {
    id: "priv-002",
    title: "Celebración familiar",
    description: "Celebra ocasiones especiales en un entorno único y natural. Desde cumpleaños hasta aniversarios, personalizamos la experiencia según tus necesidades.",
    price: "Desde $8,000",
    duration: "4-6 horas",
    minParticipants: 6,
    maxParticipants: 25,
    image: "/images/experiencias/experiencias_chinampa_del_sol.jpg",
    slug: "celebracion-familiar",
    highlights: [
      "Decoración temática personalizada",
      "Menú familiar con opciones para niños",
      "Actividades recreativas para todas las edades",
      "Sesión fotográfica profesional opcional"
    ]
  },
  {
    id: "priv-003",
    title: "Evento romántico",
    description: "Sorprende a tu pareja con una experiencia íntima y romántica en las chinampas. Ideal para aniversarios, propuestas de matrimonio o simplemente un momento especial.",
    price: "Desde $5,000",
    duration: "3-4 horas",
    minParticipants: 2,
    maxParticipants: 2,
    image: "/images/experiencias/romantico.jpg",
    slug: "evento-romantico",
    highlights: [
      "Decoración con velas y flores",
      "Cena gourmet de 5 tiempos con maridaje",
      "Música en vivo (opcional)",
      "Transporte privado en trajinera decorada"
    ]
  },
  {
    id: "priv-004",
    title: "Taller educativo para escuelas",
    description: "Ofrece a tus estudiantes una experiencia educativa única donde aprenderán sobre ecosistemas, agricultura sostenible y tradiciones chinamperas con actividades prácticas.",
    price: "Desde $7,000",
    duration: "4-5 horas",
    minParticipants: 15,
    maxParticipants: 60,
    image: "/images/experiencias/escolar.jpg",
    slug: "taller-educativo",
    highlights: [
      "Material didáctico adaptado por edades",
      "Actividades prácticas de siembra y cosecha",
      "Refrigerio saludable con productos locales",
      "Guías especializados en educación ambiental"
    ]
  }
];

const ExperienciasPrivadas = () => {
  return (
    <section id="experiencias-privadas" className="py-16 px-4 md:px-8 bg-neutro-crema">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-terracota-principal/20 text-terracota-principal text-sm font-medium mb-4">
            PERSONALIZADAS
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair text-verde-principal mb-6">
            Experiencias Privadas
          </h2>
          <p className="text-lg text-verde-tipografia max-w-3xl mx-auto">
            Diseñamos experiencias a medida para grupos, empresas, familias y eventos especiales. 
            Tú eliges la fecha y personalizamos cada detalle según tus necesidades.
          </p>
        </div>

        {/* Destacado principal */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <h3 className="text-2xl font-playfair text-verde-principal mb-4">
              Experiencias diseñadas para tus necesidades
            </h3>
            <p className="text-verde-tipografia mb-6">
              Cada experiencia privada se adapta perfectamente a tus requerimientos. Ya sea una celebración especial, 
              un evento corporativo o una actividad educativa, creamos momentos memorables en el entorno natural de las chinampas.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-terracota-principal flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Flexibilidad de fechas y horarios</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-terracota-principal flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Menús personalizados</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-terracota-principal flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Actividades adaptadas a tus intereses</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-terracota-principal flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Atención personalizada</span>
              </li>
            </ul>
            <a 
              href="/contacto" 
              className="inline-flex items-center gap-2 bg-terracota-principal hover:bg-terracota-oscuro text-white px-6 py-3 rounded-lg transition-all duration-300 self-start shadow-lg"
            >
              Solicitar cotización
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </div>
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 lg:h-full relative">
              <OptimizedImage 
                src="/images/experiencias/privada-destacada.jpg" 
                alt="Experiencia privada en las chinampas" 
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-2xl"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-verde-principal/80 to-transparent flex items-end">
              <div className="p-6 text-white">
                <span className="text-sm font-medium bg-terracota-principal px-3 py-1 rounded-full mb-3 inline-block">
                  DESTACADO
                </span>
                <h4 className="text-2xl font-semibold mb-2">Eventos corporativos en la naturaleza</h4>
                <p className="text-white/90">
                  Reuniones ejecutivas, team building y eventos especiales en un entorno natural único.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tarjetas de experiencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {privateExperiences.map(experience => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <ExperienceCard 
                title={experience.title}
                description={experience.description}
                imageSrc={experience.image}
                price={15000}
                category="Privada"
                slug={experience.slug}
              />
            </motion.div>
          ))}
        </div>
        
        {/* CTA Solicitar información */}
        <div className="mt-16 text-center">
          <p className="text-lg text-verde-tipografia mb-6">
            ¿Tienes una idea específica para tu evento? Cuéntanos y crearemos una experiencia a tu medida.
          </p>
          <a 
            href="/contacto" 
            className="inline-flex items-center gap-2 bg-verde-principal hover:bg-verde-oscuro text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-lg text-lg font-medium"
          >
            Solicitar información personalizada
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ExperienciasPrivadas;
