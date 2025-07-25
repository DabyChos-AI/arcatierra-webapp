'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronRight, Sparkles, Check, Leaf, Clock, Utensils, Coffee, GlassWater } from 'lucide-react';

interface ServicesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServicesInfoModal({ isOpen, onClose }: ServicesInfoModalProps) {
  const services = [
    {
      title: 'Eventos Sociales',
      description: 'Bodas, cumpleaños, aniversarios y celebraciones especiales con menús personalizados.',
      items: ['Bodas', 'Cumpleaños', 'Aniversarios', 'Baby showers', 'Graduaciones']
    },
    {
      title: 'Eventos Corporativos',
      description: 'Desde reuniones ejecutivas hasta grandes conferencias, con opciones para todos los presupuestos.',
      items: ['Reuniones ejecutivas', 'Conferencias', 'Team building', 'Lanzamientos de producto', 'Eventos de fin de año']
    },
    {
      title: 'Servicios Gourmet',
      description: 'Experiencias gastronómicas de alta calidad con ingredientes orgánicos y de temporada.',
      items: ['Menús de degustación', 'Cenas privadas', 'Chef a domicilio', 'Experiencias temáticas', 'Talleres culinarios']
    }
  ];
  
  const features = [
    { icon: <Leaf className="w-5 h-5" />, text: 'Ingredientes 100% orgánicos y sostenibles' },
    { icon: <Clock className="w-5 h-5" />, text: 'Planificación flexible adaptada a tus necesidades' },
    { icon: <Utensils className="w-5 h-5" />, text: 'Menús personalizados para cada ocasión' },
    { icon: <Coffee className="w-5 h-5" />, text: 'Coffee breaks y bocadillos artesanales' },
    { icon: <GlassWater className="w-5 h-5" />, text: 'Selección de bebidas y coctelería' },
    { icon: <Sparkles className="w-5 h-5" />, text: 'Servicio impecable y atención al detalle' }
  ];
  
  const handleDownloadPDF = () => {
    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement('a');
    link.href = '/presentacion_catering_2025.pdf';
    link.download = 'Catalogo_Catering_ArcaTierra_2025.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2500] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen flex items-start justify-center p-4 py-8"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-verde-dark to-verde-darker p-6 text-white relative flex-shrink-0">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 text-black hover:text-neutral-700 transition-colors z-10"
                  aria-label="Cerrar modal"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold pr-12">Servicios de Catering</h3>
                <p className="text-white pr-12">
                  Descubre todos los servicios que Arca Tierra Catering ofrece para tu evento
                </p>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Hero Banner */}
                <div className="mb-8 p-6 rounded-xl bg-verde-light relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full bg-verde-medium opacity-20"></div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-verde-dark mb-2">Catering Sostenible y Delicioso</h4>
                    <p className="text-verde-medium mb-4">
                      Nuestro compromiso con el medio ambiente y la excelencia culinaria nos distingue como 
                      el servicio de catering preferido por clientes exigentes.
                    </p>
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-2 text-verde-dark font-medium hover:text-terracota-primary transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Descargar catálogo completo
                    </button>
                  </div>
                </div>
                
                {/* Servicios */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-verde-dark mb-4">Nuestros Servicios</h4>
                  <div className="space-y-6">
                    {services.map((service, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <h5 className="text-lg font-semibold text-verde-dark mb-2">{service.title}</h5>
                        <p className="text-verde-medium mb-4">{service.description}</p>
                        <ul className="space-y-2">
                          {service.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-verde-medium">
                              <ChevronRight className="w-4 h-4 text-terracota-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Características */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-verde-dark mb-4">¿Por qué elegirnos?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="bg-terracota-light text-terracota-primary p-2 rounded-full">
                          {feature.icon}
                        </div>
                        <span className="text-verde-dark">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                </div>

                {/* CTA Section */}
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <div className="text-center">
                    <p className="text-verde-dark mb-6">
                      ¿Estás listo para crear una experiencia gastronómica memorable para tus invitados?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={onClose}
                        className="bg-verde-principal text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-verde-claro flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Entendido, gracias
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="bg-terracota-principal text-white px-8 py-3 rounded-lg font-medium transition-colors hover:bg-terracota-oscuro flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Descargar catálogo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
