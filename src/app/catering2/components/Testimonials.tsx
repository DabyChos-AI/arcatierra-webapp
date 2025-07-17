'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

// Testimonios de clientes
const TESTIMONIOS = [
  {
    id: 1,
    nombre: "Alejandra Gutiérrez",
    cargo: "Directora de Eventos, Google",
    texto: "La experiencia con Arca Tierra fue excepcional. Los ingredientes frescos y la presentación impecable hicieron que nuestro evento corporativo fuera un éxito rotundo. Todos los asistentes quedaron encantados con la propuesta gastronómica sustentable.",
    imagen: "/catering/testimonial-1.jpg",
    evento: "Evento corporativo",
    rating: 5.0
  },
  {
    id: 2,
    nombre: "Ricardo y Fernanda",
    cargo: "Recién casados",
    texto: "Elegir Arca Tierra para nuestra boda fue la mejor decisión. No solo crearon un menú increíble y personalizado, sino que su compromiso con el medio ambiente alineaba perfectamente con nuestros valores. Los invitados siguen hablando de la comida meses después.",
    imagen: "/catering/testimonial-2.jpg",
    evento: "Boda sustentable",
    rating: 4.9
  },
  {
    id: 3,
    nombre: "Mariana Torres",
    cargo: "Directora de Proyectos, Fundación Herdez",
    texto: "Trabajar con el equipo de Arca Tierra fue un placer absoluto. Su profesionalismo y pasión por los ingredientes orgánicos elevaron nuestro evento a otro nivel. El servicio fue impecable desde la planificación hasta la ejecución.",
    imagen: "/catering/testimonial-3.jpg",
    evento: "Conferencia anual",
    rating: 5.0
  },
  {
    id: 4,
    nombre: "Carlos Mendoza",
    cargo: "Director de Marketing, Spotify",
    texto: "La propuesta de catering consciente de Arca Tierra fue perfecta para nuestra activación de marca. Los asistentes quedaron impresionados no solo por el sabor excepcional sino también por la historia detrás de cada platillo y su origen sustentable.",
    imagen: "/catering/testimonial-4.jpg",
    evento: "Activación de marca",
    rating: 4.8
  }
];

// Componente para cada tarjeta de testimonios
const TestimonialCard = ({ testimonial }: { testimonial: typeof TESTIMONIOS[0] }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
    >
      <div className="relative h-56 overflow-hidden">
        <Image 
          src={testimonial.imagen || '/catering/testimonial-default.jpg'} 
          alt={testimonial.nombre}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-1">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white text-sm font-medium">{testimonial.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-playfair text-verde-principal font-semibold mb-2">{testimonial.nombre}</h3>
        <p className="text-sm text-gray-600 mb-3">{testimonial.cargo}</p>
        
        <p className="text-verde-tipografia text-sm mb-4 line-clamp-3">{testimonial.texto}</p>
        
        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1 text-terracota-principal" />
            <span className="text-sm text-terracota-principal font-medium">{testimonial.evento}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin size={14} className="mr-1 text-verde-tipografia" />
            <span className="text-sm text-verde-tipografia">CDMX</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Testimonials() {
  return (
    <section id="testimonios" className="py-16 bg-beige-bg">
      <div className="container mx-auto px-4">
        <motion.div
          variants={fadeIn('up', 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-playfair text-verde-principal font-bold mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-verde-tipografia max-w-2xl mx-auto">Descubre por qué somos la elección preferida para eventos sostenibles y memorables.</p>
        </motion.div>
        
        <motion.div 
          variants={fadeIn('up', 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TESTIMONIOS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </motion.div>
        
        <motion.div
          variants={fadeIn('up', 0.4)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-verde-tipografia mb-6">Únete a los cientos de clientes satisfechos que han confiado en nuestros servicios de catering consciente.</p>
          <a 
            href="#cotizacion" 
            className="inline-block px-6 py-3 bg-terracota-principal text-white rounded-md font-medium hover:bg-terracota-secundario transition-colors duration-300"
          >
            Solicita una cotización personalizada
          </a>
        </motion.div>
      </div>
    </section>
  );
}
