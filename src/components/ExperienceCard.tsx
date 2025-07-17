'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Users, Star, MessageCircle } from 'lucide-react';
import { Experiencia } from '@/data/experiencias';
import { formatPrice } from '@/utils/formatters';

interface ExperienceCardProps {
  experiencia: Experiencia;
  index: number;
}

export default function ExperienceCard({ experiencia, index }: ExperienceCardProps) {
  const isPublic = experiencia.tipo === 'publica';
  
  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden h-64">
        <Image
          src={experiencia.imagen}
          alt={experiencia.nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          priority={index < 3}
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

        {/* Precio flotante */}
        <div className="absolute top-4 right-4 bg-terracota text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
          ${formatPrice(experiencia.precio.base)}
        </div>

        {/* Calificación */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-800">4.9</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título */}
        <h3 className="text-xl font-playfair font-bold text-gray-800 mb-2 group-hover:text-terracota-600 transition-colors duration-300">
          {experiencia.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {experiencia.descripcionCorta}
        </p>

        {/* Información adicional */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{experiencia.duracion}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{experiencia.precio.capacidad}</span>
          </div>
        </div>

        {/* Información específica */}
        <p className="text-sm font-medium mb-4 text-terracota">
          {experiencia.precio.capacidad}
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          {isPublic ? (
            <>
              <Link href={`/calendario`} className="flex-1">
                <button className="w-full bg-terracota hover:bg-terracota-oscuro text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <Calendar className="w-4 h-4 inline mr-2" />
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
  );
}

