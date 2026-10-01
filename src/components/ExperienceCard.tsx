'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { Calendar, Clock3, Users2, Star, MessageCircle, MapPin, CalendarDays, Loader2 } from 'lucide-react';
import { Experiencia } from '@/data/experiencias';
import { formatPrice } from '@/utils/formatters';
import { API_URL } from '@/lib/api';
import { formatFechaMexico } from '@/lib/dates';
import { rutaExperiencia } from '@/app/experiencias/[slug]/slug';
import { textoAdicionalPrivada } from '@/app/experiencias/[slug]/precio-privada';
import type { FechaPublica } from '@/types/compra-experiencias';
import { esVendible } from '@/components/experiencias/SelectorFecha';

interface ExperienceCardProps {
  experiencia: Experiencia;
  index: number;
}

/** Cuántas fechas del feed se piden por tarjeta (contrato R1 §3.2) y cuántas se nombran. */
const FECHAS_POR_TARJETA = 10;
const FECHAS_VISIBLES = 2;

/**
 * Próximas fechas de una experiencia pública (EC1, R1 · sesión 41), del feed público filtrado por experiencia
 * (GET /api/calendario/eventos?experiencia_id=…&limit=10). Antes, si /disponibilidad fallaba, la tarjeta inventaba
 * fines de semana y un número de lugares con Math.random (incluido «Agotado»). Ahora: null = cargando, 'error' = el
 * feed no respondió (se dice «Consulta fechas», sin número).
 */
type EstadoFechas = FechaPublica[] | 'error' | null;

/** Lugares de las fechas que se venden en línea; null = no hay número que decir. Nunca se inventa «Agotado». */
function textoLugares(fechas: FechaPublica[]): string | null {
  if (fechas.length === 0) return null;
  const vendibles = fechas.filter(esVendible);
  if (vendibles.length === 0) return 'Reserva por WhatsApp';
  if (vendibles.some((f) => f.disponibles == null)) return 'Compra en línea';
  const total = vendibles.reduce((suma, f) => suma + (f.disponibles ?? 0), 0);
  return `${total} disponibles`;
}

export default function ExperienceCard({ experiencia, index }: ExperienceCardProps) {
  const [fechas, setFechas] = useState<EstadoFechas>(null);
  
  const isPublic = experiencia.tipo === 'publica';
  // WEB2 (DR4): renglón «+ $X por persona adicional» de una privada (null si no cobra adicional)
  const adicionalPrivada = !isPublic ? textoAdicionalPrivada(experiencia.precio.adicional) : null;

  // Próximas fechas reales del feed público (solo públicas)
  useEffect(() => {
    if (!isPublic || !experiencia.id) return;
    let vigente = true;
    setFechas(null);
    const cargar = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/calendario/eventos?experiencia_id=${encodeURIComponent(experiencia.id)}&limit=${FECHAS_POR_TARJETA}`
        );
        if (!res.ok) throw new Error(String(res.status));
        const data: { items?: FechaPublica[] } = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        // Resguardo: solo fechas de ESTA experiencia
        if (vigente) setFechas(items.filter((f) => f.experiencia_id === experiencia.id));
      } catch {
        if (vigente) setFechas('error');
      }
    };
    cargar();
    return () => {
      vigente = false;
    };
  }, [experiencia.id, isPublic]);

  const textoFechas =
    fechas === 'error'
      ? 'Consulta fechas'
      : fechas && fechas.length > 0
        ? `Próximas: ${fechas
            .slice(0, FECHAS_VISIBLES)
            .map((f) => formatFechaMexico(f.fecha_evento, { year: undefined, day: 'numeric', month: 'short' }))
            .join(', ')}`
        : 'Sin fechas próximas';
  const lugares = Array.isArray(fechas) ? textoLugares(fechas) : null;
  
  return (
    <div 
      data-testid="exp-card"
      data-experiencia-id={experiencia.id}
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
          {/* flex-wrap: el texto de grupo de una privada (WEB2) es largo y a 390 px partía la duración */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Clock3 className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span>{experiencia.duracion}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users2 className="w-4 h-4 text-purple-500" aria-hidden="true" />
              <span data-testid="exp-card-capacidad">{experiencia.precio.capacidad}</span>
              {/* Lugares disponibles verde/amarillo - OCULTO, se deja solo el azul */}
            </div>
          </div>
          {adicionalPrivada && (
            <div data-testid="exp-card-adicional" className="text-sm text-gray-500">
              {adicionalPrivada}
            </div>
          )}
          
          {/* Próximas fechas para experiencias públicas (EC1: feed real; si falla, «Consulta fechas» sin número) */}
          {isPublic && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center text-green-600">
                  <CalendarDays className="h-4 w-4 mr-1 shrink-0" aria-hidden="true" />
                  {fechas === null ? (
                    <div className="flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" aria-hidden="true" />
                      <span>Cargando...</span>
                    </div>
                  ) : (
                    <span data-testid="exp-card-fechas">{textoFechas}</span>
                  )}
                </div>
                {lugares && (
                  <div className="flex items-center text-blue-600 shrink-0">
                    <Users2 className="h-4 w-4 mr-1" aria-hidden="true" />
                    <span data-testid="exp-card-lugares">{lugares}</span>
                  </div>
                )}
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
                <Link href={rutaExperiencia(experiencia.slug)} data-testid="exp-card-detalles">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-md">
                    Más Detalles
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`${rutaExperiencia(experiencia.slug)}?action=solicitar`} className="flex-1">
                  <button className="w-full bg-terracota hover:bg-terracota-oscuro text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Solicitar Cotización
                  </button>
                </Link>
                <Link href={rutaExperiencia(experiencia.slug)} data-testid="exp-card-detalles">
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

