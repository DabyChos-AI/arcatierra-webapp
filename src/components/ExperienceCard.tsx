'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { Calendar, Clock3, Users2, Star, MessageCircle, MapPin, CalendarDays, Loader2 } from 'lucide-react';
import { Experiencia } from '@/data/experiencias';
import { formatPrice } from '@/utils/formatters';
import { API_URL } from '@/lib/api';

interface DisponibilidadData {
  fecha_evento: string;
  eventos_dia: number;
  disponibles_total: number;
}

interface DisponibilidadResponse {
  experiencia_id: string;
  disponibilidad: DisponibilidadData[];
  total_fechas: number;
}

interface ExperienceCardProps {
  experiencia: Experiencia;
  index: number;
}

// ✅ FUNCIONES FALLBACK (mantener como respaldo)
function getNextAvailableDates() {
  const today = new Date();
  const dates = [];
  
  // Generar fechas para los próximos sábados y domingos
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Solo sábados (6) y domingos (0) para experiencias públicas
    if (date.getDay() === 0 || date.getDay() === 6) {
      dates.push(date);
    }
    
    if (dates.length === 2) break; // Solo las próximas 2 fechas
  }
  
  return dates.map(date => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  });
}

// ✅ FUNCIÓN FALLBACK (mantener como respaldo)
function getAvailableSpots() {
  // Simular disponibilidad entre 0-8 lugares (incluye agotado)
  const spots = Math.floor(Math.random() * 9);
  return spots;
}

export default function ExperienceCard({ experiencia, index }: ExperienceCardProps) {
  const [disponibilidad, setDisponibilidad] = useState<{
    fechas: string[];
    espacios: number;
    cargando: boolean;
    usandoAPI: boolean;
  }>({
    fechas: [],
    espacios: 0,
    cargando: true,
    usandoAPI: false
  });
  
  const isPublic = experiencia.tipo === 'publica';

  // Cargar disponibilidad real desde API
  useEffect(() => {
    if (!isPublic || !experiencia.id) {
      setDisponibilidad({
        fechas: [],
        espacios: 0,
        cargando: false,
        usandoAPI: false
      });
      return;
    }

    const fetchDisponibilidad = async () => {
      try {
        setDisponibilidad(prev => ({ ...prev, cargando: true }));
        
        // ✅ PRIORIDAD 1: API real
        const response = await fetch(`${API_URL}/api/experiencias/${experiencia.id}/disponibilidad`);
        
        if (response.ok) {
          const data: DisponibilidadResponse = await response.json();
          
          const fechasFormateadas = data.disponibilidad.slice(0, 2).map(item => {
            const fecha = new Date(item.fecha_evento);
            return fecha.toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short' 
            });
          });
          
          const espaciosTotales = data.disponibilidad.reduce((sum, item) => sum + item.disponibles_total, 0);
          
          setDisponibilidad({
            fechas: fechasFormateadas,
            espacios: espaciosTotales,
            cargando: false,
            usandoAPI: true
          });
          
          console.log(`✅ Disponibilidad cargada desde API para ${experiencia.nombre}:`, fechasFormateadas.length, 'fechas');
        } else {
          throw new Error(`API respondió con ${response.status}`);
        }
      } catch (error) {
        // ✅ FALLBACK: Datos simulados
        console.warn(`⚠️ API no disponible para ${experiencia.nombre}, usando datos simulados:`, error);
        
        const fechasMock = getNextAvailableDates();
        const espaciosMock = getAvailableSpots();
        
        setDisponibilidad({
          fechas: fechasMock,
          espacios: espaciosMock,
          cargando: false,
          usandoAPI: false
        });
      }
    };
    
    fetchDisponibilidad();
  }, [experiencia.id, experiencia.nombre, isPublic]);
  
  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden h-64">
        <OptimizedImage
          src={experiencia.imagen || '/placeholder-experience.jpg'}
          alt={experiencia.nombre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {experiencia.badges.map((badge, badgeIndex) => (
            <span
              key={badgeIndex}
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

        {/* Precio flotante - solo para experiencias públicas */}
        {isPublic && (
          <div className="absolute bottom-4 right-4 bg-terracota text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            ${formatPrice(experiencia.precio.base)}
          </div>
        )}

        {/* Calificación - OCULTO por solicitud */}
        {/* <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-800">4.9</span>
        </div> */}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-6">
        {/* Ubicación - OCULTO por solicitud */}
        {/* <div className="flex items-center gap-1 mb-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-sm text-gray-600">Xochimilco</span>
        </div> */}
        
        {/* Título */}
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-2 group-hover:text-terracota-600 transition-colors duration-300">
          {experiencia.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {experiencia.descripcionCorta}
        </p>

        {/* Información adicional */}
        <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock3 className="w-4 h-4 text-blue-500" />
              <span>{experiencia.duracion}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users2 className="w-4 h-4 text-purple-500" />
              <span>{experiencia.precio.capacidad}</span>
              {/* Lugares disponibles verde/amarillo - OCULTO, se deja solo el azul */}
            </div>
          </div>
          
          {/* Próximas fechas para experiencias públicas */}
          {isPublic && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-green-600">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  {disponibilidad.cargando ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <span>
                      Próximas: {disponibilidad.fechas.length > 0 ? disponibilidad.fechas.join(', ') : 'Sin fechas'}
                      {disponibilidad.usandoAPI && <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">Real</span>}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-blue-600">
                  <Users2 className="h-4 w-4 mr-1" />
                  {disponibilidad.cargando ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>
                      {disponibilidad.espacios === 0 
                        ? 'Agotado' 
                        : `${disponibilidad.espacios} disponibles`
                      }
                      {!disponibilidad.usandoAPI && disponibilidad.espacios > 0 && (
                        <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Sim</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            {isPublic ? (
              <>
                <Link href={`/calendario`} className="flex-1">
                  <button className="w-full bg-terracota hover:bg-terracota-oscuro text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <CalendarDays className="w-4 h-4 inline mr-2" />
                    Ver Calendario
                  </button>
                </Link>
                <Link href={`/experiencias/${experiencia.slug}`}>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-md">
                    Más Detalles
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/experiencias/${experiencia.slug}?action=solicitar`} className="flex-1">
                  <button className="w-full bg-terracota hover:bg-terracota-oscuro text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Solicitar Cotización
                  </button>
                </Link>
                <Link href={`/experiencias/${experiencia.slug}`}>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-md">
                    Más Detalles
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

