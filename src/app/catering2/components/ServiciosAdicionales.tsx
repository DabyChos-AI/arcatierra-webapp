'use client';

import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useQuoteCart } from '../context/QuoteCartContext';

// Datos de servicios adicionales desde el CSV
const SERVICIOS_ADICIONALES = [
  { 
    id: 1, 
    name: "Servicio Meseros", 
    price: 150, 
    unit: "por mesero", 
    description: "Mesero profesional por 4 horas",
    image: "/catering/boda-sustentable.jpg" 
  },
  { 
    id: 2, 
    name: "Montaje Completo", 
    price: 200, 
    unit: "servicio", 
    description: "Mesas, sillas, mantelería, decoración básica",
    image: "/catering/evento-corporativo.jpg" 
  },
  { 
    id: 3, 
    name: "Vajilla Premium", 
    price: 80, 
    unit: "por persona", 
    description: "Platos, cubiertos y cristalería premium por persona",
    image: "/catering/lunch-saludable.jpg" 
  },
  { 
    id: 4, 
    name: "Decoración Floral", 
    price: 300, 
    unit: "por centro", 
    description: "Centros de mesa con flores y vegetales orgánicos",
    image: "/catering/chef-preparando.jpg" 
  },
  { 
    id: 5, 
    name: "Barra de Bebidas", 
    price: 250, 
    unit: "por hora", 
    description: "Aguas frescas, jugos naturales, café premium ilimitado",
    image: "/catering/boda-sustentable.jpg" 
  },
  { 
    id: 6, 
    name: "Chef en Vivo", 
    price: 800, 
    unit: "por evento", 
    description: "Chef preparando platillos en vivo durante el evento",
    image: "/catering/chef-preparando.jpg" 
  }
];

export default function ServiciosAdicionales() {
  const { addService } = useQuoteCart();
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeIn('up', 0.3)}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#464531] mb-4">
            Servicios adicionales
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complementa tu evento con nuestros servicios adicionales y crea una experiencia inolvidable para ti y tus invitados.
          </p>
          <div className="w-16 h-1 bg-[#9CB31A] mx-auto mt-6"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {SERVICIOS_ADICIONALES.map((servicio, index) => (
            <motion.div
              key={servicio.id}
              variants={fadeIn('up', 0.1 * (index + 1))}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                {/* Imagen del servicio */}
                <div className="relative h-48 w-full overflow-hidden">
                  <OptimizedImage 
                    src={servicio.image} 
                    alt={servicio.name} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Badge con precio */}
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                    <span className="font-semibold text-terracota-principal">${servicio.price}</span>
                    <span className="text-xs text-gray-500">/{servicio.unit}</span>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-verde-tipografia mb-2">{servicio.name}</h3>
                  <p className="text-gray-600 mb-4">{servicio.description}</p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-auto border-terracota-principal text-verde-tipografia hover:bg-terracota-principal hover:text-white flex items-center justify-center gap-2 group-hover:bg-terracota-principal group-hover:text-white transition-colors"
                    onClick={() => addService({
                      id: servicio.id.toString(),
                      name: servicio.name,
                      price: servicio.price,
                      description: servicio.description,
                      unit: servicio.unit,
                      quantity: 1
                    })}
                  >
                    <PlusCircle size={16} />
                    <span>Añadir a cotización</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Cita final */}
        <motion.div 
          variants={fadeIn('up', 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <blockquote className="italic text-xl text-gray-600">
            "Creamos experiencias culinarias únicas donde cada detalle refleja nuestro compromiso con la sostenibilidad y la excelencia gastronómica."
          </blockquote>
          <cite className="text-terracota-principal font-medium mt-4 block">— Equipo Arca Tierra</cite>
        </motion.div>
      </div>
    </section>
  );
}
