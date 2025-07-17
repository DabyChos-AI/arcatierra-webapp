'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Filter } from 'lucide-react';
import { testimonios, TestimonioCategoria } from '@/data/testimonios';

export default function TestimoniosPage() {
  const [filtroActivo, setFiltroActivo] = useState<TestimonioCategoria>('todas');

  // Filtrar testimonios según el filtro activo
  const testimoniosFiltrados = testimonios.filter(testimonio => {
    if (filtroActivo === 'todas') return true;
    return testimonio.categoria === filtroActivo;
  });

  // Función para obtener clases del botón de filtro
  const getFilterButtonClasses = (filtro: TestimonioCategoria) => {
    const baseClasses = "px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105";
    
    if (filtroActivo === filtro) {
      return `${baseClasses} bg-verde-600 text-white shadow-lg`;
    }
    
    return `${baseClasses} bg-white text-verde-700 border border-verde-200 hover:bg-verde-50`;
  };

  // Función para obtener el color del badge según la categoría
  const getBadgeColor = (categoria: string) => {
    switch (categoria) {
      case 'publica':
        return 'bg-verde-100 text-verde-700';
      case 'privada':
        return 'bg-terracota-100 text-terracota-700';
      case 'familiar':
        return 'bg-blue-100 text-blue-700';
      case 'educativa':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Función para obtener el texto del badge
  const getBadgeText = (categoria: string) => {
    switch (categoria) {
      case 'publica':
        return 'Experiencia Pública';
      case 'privada':
        return 'Experiencia Privada';
      case 'familiar':
        return 'Experiencia Familiar';
      case 'educativa':
        return 'Experiencia Educativa';
      default:
        return categoria;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-verde-600 via-verde-700 to-verde-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Quote className="w-16 h-16 mx-auto mb-4 text-neutral-100" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-playfair font-bold mb-6"
          >
            Testimonios
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-neutral-100 mb-8 max-w-3xl mx-auto"
          >
            Descubre lo que nuestros huéspedes dicen sobre sus experiencias en Arca Tierra
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
              <div className="flex items-center gap-2 text-neutral-100">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">4.9/5 Promedio</span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
              <div className="flex items-center gap-2 text-neutral-100">
                <Quote className="w-5 h-5" />
                <span className="font-semibold">{testimonios.length} Reseñas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-verde-600" />
            <h3 className="font-bold text-neutral-800">Filtrar por tipo de experiencia</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltroActivo('todas')}
              className={getFilterButtonClasses('todas')}
            >
              Todas ({testimonios.length})
            </button>
            <button
              onClick={() => setFiltroActivo('publica')}
              className={getFilterButtonClasses('publica')}
            >
              Públicas ({testimonios.filter(t => t.categoria === 'publica').length})
            </button>
            <button
              onClick={() => setFiltroActivo('privada')}
              className={getFilterButtonClasses('privada')}
            >
              Privadas ({testimonios.filter(t => t.categoria === 'privada').length})
            </button>
            <button
              onClick={() => setFiltroActivo('familiar')}
              className={getFilterButtonClasses('familiar')}
            >
              Familiares ({testimonios.filter(t => t.categoria === 'familiar').length})
            </button>
            <button
              onClick={() => setFiltroActivo('educativa')}
              className={getFilterButtonClasses('educativa')}
            >
              Educativas ({testimonios.filter(t => t.categoria === 'educativa').length})
            </button>
          </div>
        </motion.div>
      </div>

      {/* Testimonios Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          key={filtroActivo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {testimoniosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimoniosFiltrados.map((testimonio, index) => (
                <motion.div
                  key={testimonio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Header del testimonio */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-verde-500 to-verde-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {testimonio.nombre.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-800">{testimonio.nombre}</h3>
                        <p className="text-sm text-neutral-600">{testimonio.fecha}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonio.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Experiencia y categoría */}
                    <div className="space-y-2 mb-4">
                      <div className="bg-verde-50 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-verde-700">{testimonio.experiencia}</p>
                      </div>
                      <div className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getBadgeColor(testimonio.categoria)}`}>
                        {getBadgeText(testimonio.categoria)}
                      </div>
                    </div>
                  </div>

                  {/* Comentario */}
                  <div className="px-6 pb-6">
                    <div className="relative">
                      <Quote className="w-6 h-6 text-verde-300 absolute -top-2 -left-1" />
                      <p className="text-neutral-700 leading-relaxed pl-6 italic">
                        "{testimonio.comentario}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Quote className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
              <h3 className="text-xl font-bold text-neutral-600 mb-2">
                No hay testimonios para esta categoría
              </h3>
              <p className="text-neutral-500">
                Prueba con otro filtro para ver más testimonios
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-verde-600 to-verde-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              ¿Listo para crear tu propia experiencia?
            </h2>
            <p className="text-xl text-neutral-100 mb-8">
              Únete a cientos de huéspedes satisfechos y vive momentos únicos en las chinampas
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/experiencias"
              className="bg-white text-verde-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Ver Experiencias
            </a>
            <a
              href="/calendario"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-verde-700 transition-all duration-300"
            >
              Ver Calendario
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

