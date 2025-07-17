'use client';

import { useState } from 'react';
import HeroCarousel from '@/components/HeroCarousel';
import ExperienceCard from '@/components/ExperienceCard';
import { experiencias } from '@/data/experiencias';

type FiltroTipo = 'todas' | 'publica' | 'privada' | 'destacados';

export default function ExperienciasPage() {
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todas');

  // Filtrar experiencias según el filtro activo
  const experienciasFiltradas = experiencias.filter(exp => {
    if (filtroActivo === 'todas') return true;
    if (filtroActivo === 'destacados') return exp.categoria === 'familiar';
    return exp.tipo === filtroActivo;
  });

  const experienciasPublicas = experienciasFiltradas.filter(exp => exp.tipo === 'publica');
  const experienciasPrivadas = experienciasFiltradas.filter(exp => exp.tipo === 'privada');

  // Función para obtener clases del botón de filtro
  const getFilterButtonClasses = (filtro: FiltroTipo) => {
    const baseClasses = "px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg";
    
    if (filtroActivo === filtro) {
      switch (filtro) {
        case 'todas':
          return `${baseClasses} bg-gradient-terracota text-white border border-terracota`;
        case 'publica':
          return `${baseClasses} bg-gradient-verde text-white border border-verde`;
        case 'privada':
          return `${baseClasses} bg-gradient-terracota text-white border border-terracota`;
        case 'destacados':
          return `${baseClasses} bg-gradient-verde text-white border border-verde`;
        default:
          return `${baseClasses} bg-gradient-terracota text-white`;
      }
    }
    
    return `${baseClasses} bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Carousel */}
      <section className="pt-8">
        <HeroCarousel />
      </section>

      {/* Filtros y navegación */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-800 mb-4 animate-fade-in-up">
              Nuestras Experiencias
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Sumérgete en la auténtica cultura mexicana a través de experiencias gastronómicas únicas en las chinampas de Xochimilco
            </p>
          </div>

          {/* Botones de filtro */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setFiltroActivo('todas')}
              className={getFilterButtonClasses('todas')}
            >
              Todas las Experiencias
            </button>
            <button
              onClick={() => setFiltroActivo('publica')}
              className={getFilterButtonClasses('publica')}
            >
              Experiencias Públicas
            </button>
            <button
              onClick={() => setFiltroActivo('privada')}
              className={getFilterButtonClasses('privada')}
            >
              Experiencias Privadas
            </button>
            <button
              onClick={() => setFiltroActivo('destacados')}
              className={getFilterButtonClasses('destacados')}
            >
              Experiencias Destacadas
            </button>
          </div>
        </div>
      </section>

      {/* Mostrar todas las experiencias cuando el filtro es "todas" */}
      {filtroActivo === 'todas' && (
        <>
          {/* Experiencias Públicas */}
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-4 animate-fade-in-up">
                  Experiencias Públicas
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                  Únete a otros viajeros en experiencias grupales llenas de cultura y sabor
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experienciasPublicas.map((experiencia, index) => (
                  <div 
                    key={experiencia.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <ExperienceCard experiencia={experiencia} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Experiencias Privadas */}
          <section className="py-12 px-4 md:px-8 bg-gradient-to-r from-terracota-50 to-verde-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-4 animate-fade-in-up">
                  Experiencias Privadas
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                  Momentos exclusivos diseñados especialmente para ti y tus seres queridos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experienciasPrivadas.map((experiencia, index) => (
                  <div 
                    key={experiencia.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <ExperienceCard experiencia={experiencia} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Mostrar solo experiencias públicas cuando el filtro es "publica" */}
      {filtroActivo === 'publica' && (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-4 animate-fade-in-up">
                Experiencias Públicas
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Únete a otros viajeros en experiencias grupales llenas de cultura y sabor
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experienciasFiltradas.map((experiencia, index) => (
                <div 
                  key={experiencia.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <ExperienceCard experiencia={experiencia} index={index} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mostrar solo experiencias privadas cuando el filtro es "privada" */}
      {filtroActivo === 'privada' && (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-4 animate-fade-in-up">
                Experiencias Privadas
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Momentos exclusivos diseñados especialmente para ti y tus seres queridos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experienciasFiltradas.map((experiencia, index) => (
                <div 
                  key={experiencia.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <ExperienceCard experiencia={experiencia} index={index} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mostrar mensaje cuando el filtro destacados no tiene resultados */}
      {filtroActivo === 'destacados' && experienciasFiltradas.length === 0 && (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
              Experiencias Destacadas
            </h3>
            <p className="text-lg text-gray-600">
              Todas nuestras experiencias son aptas para familias. Usa el filtro "Todas las Experiencias" para ver las opciones disponibles.
            </p>
          </div>
        </section>
      )}

      {/* Mostrar experiencias destacadas cuando se filtra por destacados */}
      {filtroActivo === 'destacados' && experienciasFiltradas.length > 0 && (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-4 animate-fade-in-up">
                Experiencias Destacadas
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Nuestras experiencias más populares y especiales seleccionadas para ti
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experienciasFiltradas.map((experiencia, index) => (
                <div 
                  key={experiencia.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <ExperienceCard experiencia={experiencia} index={index} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sección de información adicional - Solo mostrar en vista completa */}
      {filtroActivo === 'todas' && (
        <>
          {/* Sección de Testimonios y FAQ */}
          <section className="py-16 px-4 md:px-8 bg-neutral-50">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CTA Testimonios */}
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-verde-principal rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💬</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-neutral-800">Testimonios</h3>
                        <p className="text-neutral-600">Lo que dicen nuestros huéspedes</p>
                      </div>
                    </div>
                    
                    {/* Mini preview */}
                    <div className="bg-verde-claro/10 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-verde-principal rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <div>
                          <p className="font-medium text-verde-principal">Carlos Enrique</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-yellow-400 text-sm">★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-verde-principal italic">
                        "Creo que lo hacen muy bien, por la amabilidad del personal, organización y calidad de la comida..."
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-600">
                        <span className="font-semibold">4.9/5</span> promedio • <span className="font-semibold">20+</span> reseñas
                      </div>
                      <a
                        href="/experiencias/testimonios"
                        className="bg-verde-principal text-white px-6 py-3 rounded-full font-semibold hover:bg-verde-oscuro transition-colors duration-300"
                      >
                        Ver Todos
                      </a>
                    </div>
                  </div>
                </div>

                {/* CTA FAQ */}
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-terracota-principal rounded-xl flex items-center justify-center">
                        <span className="text-2xl">❓</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-neutral-800">FAQ</h3>
                        <p className="text-neutral-600">Preguntas frecuentes</p>
                      </div>
                    </div>
                    
                    {/* Mini preview */}
                    <div className="bg-terracota-principal/10 rounded-xl p-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-terracota-principal font-bold">Q:</span>
                          <p className="text-sm font-medium text-terracota-principal">¿Cómo puedo visitar Arca Tierra?</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-terracota-principal font-bold">A:</span>
                          <p className="text-sm text-terracota-principal">
                            Todas las experiencias deben agendarse con anticipación...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-600">
                        <span className="font-semibold">6</span> categorías • <span className="font-semibold">23+</span> preguntas
                      </div>
                      <a
                        href="/experiencias/faq"
                        className="bg-terracota-principal text-white px-6 py-3 rounded-full font-semibold hover:bg-terracota-oscuro transition-colors duration-300"
                      >
                        Ver FAQ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de por qué elegirnos */}
          <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-red-50 to-white">
            <div className="max-w-6xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 mb-8 animate-fade-in-up">
                ¿Por qué elegir Arca Tierra?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-200">
                  <div className="w-16 h-16 bg-terracota-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Agricultura Regenerativa</h4>
                  <p className="text-gray-600">Promovemos prácticas sostenibles que restauran y enriquecen el ecosistema de las chinampas.</p>
                </div>

                <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-400">
                  <div className="w-16 h-16 bg-verde-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">👨‍🍳</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Cocina Auténtica</h4>
                  <p className="text-gray-600">Nuestros chefs preparan platillos tradicionales con ingredientes frescos de nuestras chinampas.</p>
                </div>

                <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-600">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🏞️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Turismo Responsable</h4>
                  <p className="text-gray-600">Conectamos a los visitantes con la cultura local mientras apoyamos a las comunidades chinamperas.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de catering - VERSIÓN FINAL */}
          <section className="py-16 px-4 md:px-8 bg-[#2A5D3E] text-center">
            <div className="max-w-4xl mx-auto">
              {/* Icono central */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-4xl">🍽️</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4 text-white">
                ¿Quieres una experiencia fuera de las chinampas?
              </h2>
              <p className="text-xl text-white mb-12">
                Llevamos nuestras experiencias gastronómicas a tu evento especial
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {/* Tarjeta 1 */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/25 transition-all">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg">En tu ubicación</h3>
                  <p className="text-white/90 text-sm">Llevamos la experiencia donde tú quieras</p>
                </div>
                
                {/* Tarjeta 2 */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/25 transition-all">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Cocina tradicional</h3>
                  <p className="text-white/90 text-sm">Auténticos sabores mexicanos</p>
                </div>

                {/* Tarjeta 3 */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/25 transition-all">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Ingredientes frescos</h3>
                  <p className="text-white/90 text-sm">Directo de nuestras chinampas</p>
                </div>
              </div>

              {/* Botón centrado con mejor estilo */}
              <div className="flex justify-center mb-14">
                <a href="/catering" className="bg-white text-[#2A5D3E] px-8 py-3 rounded-full font-semibold text-lg hover:shadow-lg transition-all flex items-center gap-2 hover:bg-white/90">
                  <span>Conocer Catering</span>
                  <span className="text-[#2A5D3E]">→</span>
                </a>
              </div>

              {/* Etiquetas con mejor contraste */}
              <div>
                <p className="text-white mb-5 font-medium text-lg">Perfecto para:</p>
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                  <span className="bg-white/15 px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all">
                    Bodas
                  </span>
                  <span className="bg-white/15 px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all">
                    Eventos corporativos
                  </span>
                  <span className="bg-white/15 px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all">
                    Celebraciones privadas
                  </span>
                  <span className="bg-white/15 px-5 py-2 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all">
                    Talleres
                  </span>
                </div>
                

              </div>
            </div>
          </section>
          

        </>
      )}
    </main>
  );
}
