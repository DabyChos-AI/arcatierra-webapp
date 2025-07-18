'use client'

import React, { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { Clock, Users, MapPin, Star, ChevronRight } from 'lucide-react';

interface ExperienceCardProProps {
  experience: {
    title: string;
    image: string;
    description: string;
    duration: string;
    participants: string;
    location: string;
    rating: number;
    price: string;
    dates?: string[];
  };
  onReserve?: (experience: any) => void;
  index?: number;
}

const ExperienceCardPro: React.FC<ExperienceCardProProps> = ({ 
  experience, 
  onReserve, 
  index = 0 
}) => {
  // Estado simple para mostrar/ocultar detalles
  const [showDetails, setShowDetails] = useState(false);
  
  // Paleta de colores oficial de Arca Tierra
  const colors = {
    primary: '#805D2C',     // Dorado oscuro
    secondary: '#1A4D2E',   // Verde oscuro
    accent: '#7D3B23',      // Terracota
    light: '#F8F5E9',       // Crema claro
    dark: '#2A2A2A',        // Casi negro
    white: '#FFFFFF'
  };
  
  // Determinar color basado en el índice
  const getColorByIndex = (idx: number) => {
    const themeColors = [
      colors.primary,    // Dorado
      colors.secondary,  // Verde
      colors.accent,     // Terracota
    ];
    return themeColors[idx % themeColors.length];
  };
  
  const themeColor = getColorByIndex(index);

  // Función para alternar la visualización de detalles
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Función para manejar el clic en el botón de reserva
  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
    if (onReserve) {
      onReserve(experience);
    }
  };

  // Generar estrellas basadas en la calificación
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < rating ? themeColor : 'none'}
          color={i < rating ? themeColor : '#ccc'}
          className="transition-transform"
        />
      );
    }
    return stars;
  };

  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl w-full max-w-sm mx-auto cursor-pointer"
      style={{ 
        borderTop: `4px solid ${themeColor}`,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)` 
      }}
      onClick={handleToggleDetails}
    >
      {/* Imagen con overlay de color suave */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        <OptimizedImage
          src={experience.image}
          alt={experience.title}
          fill className="object-cover transition-transform duration-500 hover:scale-105" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: `linear-gradient(to bottom, transparent 0%, ${themeColor} 100%)` 
          }}
        />
        
        {/* Badge de precio */}
        <div 
          className="absolute top-4 right-4 px-4 py-2 rounded-full font-semibold text-white"
          style={{ backgroundColor: themeColor }}
        >
          {experience.price}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 line-clamp-2">{experience.title}</h3>
        
        <div className="flex items-center mb-3">
          {renderStars(experience.rating)}
          <span className="ml-2 text-sm text-gray-600">{experience.rating.toFixed(1)}</span>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mb-3">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Clock size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{experience.duration}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Users size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{experience.participants}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600 col-span-1 xs:col-span-2">
            <MapPin size={14} className="mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{experience.location}</span>
          </div>
        </div>

        {/* Descripción (visible solo al hacer clic) */}
        <div className={`overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-40' : 'max-h-0'}`}>
          <p className="text-gray-600 text-sm mb-4">{experience.description}</p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col xs:flex-row items-center xs:justify-between mt-4 gap-3">
          <button 
            className="flex items-center text-xs sm:text-sm font-medium w-full xs:w-auto justify-center xs:justify-start"
            style={{ color: themeColor }}
            onClick={handleToggleDetails}
          >
            {showDetails ? 'Ver menos' : 'Ver más'}
            <ChevronRight size={16} className={`ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
          </button>
          
          <button
            className="px-4 py-2 rounded-md text-white font-medium transition-all hover:shadow-md w-full xs:w-auto"
            style={{ backgroundColor: themeColor }}
            onClick={handleReserveClick}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCardPro;
