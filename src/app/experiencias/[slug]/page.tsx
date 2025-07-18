'use client'

import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { X } from 'lucide-react';
import { experiencias } from '@/data/experiencias';
import { formatPrice } from '@/utils/formatters';

interface ExperienciaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ExperienciaPage({ params }: ExperienciaPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const experiencia = experiencias.find(exp => exp.slug === slug);
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Detectar si se viene desde un clic en "Solicitar Cotización"
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'solicitar') {
      setShowReservationModal(true);
    }
  }, [searchParams]);

  if (!experiencia) {
    notFound();
  }

  const isPrivate = experiencia.tipo === 'privada';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      {/* Navegación breadcrumb */}
      <nav className="py-4 px-4 md:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-terracota transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/experiencias" className="hover:text-terracota transition-colors">
              Experiencias
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{experiencia.nombre}</span>
          </div>
        </div>
      </nav>

      {/* Hero de la experiencia */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <OptimizedImage
          src={experiencia.imagen}
          alt={experiencia.nombre}
          fill
          className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          {experiencia.badges.map((badge, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                badge.type === 'popular' ? 'bg-terracota' :
                badge.type === 'nuevo' ? 'bg-verde' :
                badge.type === 'destacado' ? 'bg-terracota' :
                badge.type === 'familiar' ? 'bg-verde' :
                badge.type === 'privada' ? 'bg-terracota' :
                badge.type === 'educativa' ? 'bg-verde-principal' :
                badge.type === 'publica' ? 'bg-verde-principal' :
                'bg-verde-principal'
              }`}
            >
              {badge.icon} {badge.label}
            </span>
          ))}
        </div>

        {/* Precio flotante */}
        <div className="absolute top-6 right-6 bg-terracota text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
          ${formatPrice(experiencia.precio.base)}
        </div>

        {/* Título y descripción */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4 text-white">
            {experiencia.nombre}
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl text-white">
            {experiencia.descripcionCorta}
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Información principal */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">
                  Descripción de la Experiencia
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {experiencia.descripcionCompleta}
                </p>

                <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
                  ¿Qué incluye?
                </h3>
                <ul className="space-y-3 mb-8">
                  {experiencia.incluye.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar con información de reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-terracota mb-2">
                    ${formatPrice(experiencia.precio.base)}
                  </div>
                  <div className="text-gray-600">
                    {experiencia.precio.capacidad}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <span className="text-xl mr-3">⏱️</span>
                    <span>Duración: {experiencia.duracion}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="text-xl mr-3">📍</span>
                    <span>Chinampas de Xochimilco</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="text-xl mr-3">⭐</span>
                    <span>Calificación: 4.9/5</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  {isPrivate ? (
                    <button 
                      onClick={() => setShowReservationModal(true)}
                      className="w-full bg-terracota text-white py-3 px-6 rounded-full font-semibold hover:bg-terracota-oscuro transition-colors duration-300"
                    >
                      Solicitar Cotización
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setShowReservationModal(true)}
                        className="w-full bg-terracota text-white py-3 px-6 rounded-full font-semibold hover:bg-terracota-oscuro transition-colors duration-300"
                      >
                        Reservar Ahora
                      </button>
                      <Link 
                        href="/calendario"
                        className="w-full bg-white text-gray-700 py-3 px-6 rounded-full font-semibold border border-gray-300 hover:bg-gray-100 transition-colors duration-300 block text-center mt-3"
                      >
                        Ver Calendario
                      </Link>
                    </>
                  )}
                </div>

                {/* Información adicional */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Información importante:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Cancelación gratuita hasta 24h antes</li>
                    <li>• Incluye transporte desde el centro</li>
                    <li>• Apto para todas las edades</li>
                    <li>• Se requiere reserva previa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de experiencias relacionadas */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-terracota-50 to-verde-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-800 text-center mb-12">
            Otras Experiencias que te Pueden Interesar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiencias
              .filter(exp => exp.id !== experiencia.id && exp.tipo === experiencia.tipo)
              .slice(0, 3)
              .map((exp, index) => (
                <Link
                  key={exp.id}
                  href={`/experiencias/${exp.slug}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-48">
                      <OptimizedImage
                        src={exp.imagen}
                        alt={exp.nombre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-terracota text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                          ${formatPrice(exp.precio.base)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-playfair font-bold text-gray-800 mb-2 group-hover:text-terracota-600 transition-colors">
                        {exp.nombre}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {exp.descripcionCorta}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Modal de reserva */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {isPrivate ? "Solicitar Experiencia Privada" : "Reservar Experiencia"}
              </h3>
              <button 
                onClick={() => setShowReservationModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-1">{experiencia.nombre}</h4>
            {!isPrivate && (
              <p className="text-gray-600 mb-4">sábado, 22 de noviembre de 2025 a las 5:30</p>
            )}
            <p className="text-xl font-bold text-terracota mb-6">
              ${formatPrice(experiencia.precio.base)}
              {isPrivate && <span className="text-sm font-normal"> / por persona</span>}
            </p>

            {/* Formulario diferente según el tipo de experiencia */}
            {isPrivate ? (
              /* Formulario para experiencias PRIVADAS */
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha deseada</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario preferido</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  >
                    <option value="">Selecciona un horario</option>
                    <option value="manana">Mañana (8:00 AM - 12:00 PM)</option>
                    <option value="tarde">Tarde (12:00 PM - 5:00 PM)</option>
                    <option value="noche">Noche (5:00 PM - 9:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de personas</label>
                  <input
                    type="number"
                    min="1" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Mínimo 10 personas para experiencias privadas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios y requerimientos especiales</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota min-h-[100px]"
                  />
                </div>
              </div>
            ) : (
              /* Formulario para experiencias PÚBLICAS */
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios especiales</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota min-h-[100px]"
                  />
                  <p className="mt-1 text-xs text-gray-500 flex items-center">
                    <span className="mr-1">💡</span>
                    <span>Comparte cualquier información que nos ayude a personalizar tu experiencia</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adultos</label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        readOnly
                        value="1"
                        className="flex-1 text-center px-3 py-2 border-l border-r border-gray-300"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niños</label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        readOnly
                        value="0"
                        className="flex-1 text-center px-3 py-2 border-l border-r border-gray-300"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowReservationModal(false)}
                className="w-full py-3 px-6 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                className="w-full py-3 px-6 bg-terracota text-white rounded-md font-medium hover:bg-terracota-oscuro transition-colors"
              >
                {isPrivate ? "Enviar Solicitud" : "Completar Reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

