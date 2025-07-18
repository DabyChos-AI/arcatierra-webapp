import React, { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { motion } from 'framer-motion';

interface ExperienceCardProps {
  id: string | number;
  title: string;
  description: string;
  imageSrc: string;
  price?: string;
  duration?: string;
  location?: string;
  tags?: string[];
  rating?: number;
  url?: string;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  id,
  title,
  description,
  imageSrc,
  price,
  duration,
  location,
  tags = [],
  rating,
  url = '#'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="experience-card relative h-[450px] overflow-hidden rounded-lg bg-white shadow-lg"
      initial={{ scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layoutId={`experience-${id}`}
    >
      {/* Imagen con efecto parallax */}
      <motion.div 
        className="w-full h-[250px] relative overflow-hidden"
        animate={{ 
          y: isHovered ? -10 : 0,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <OptimizedImage 
          src={imageSrc} 
          alt={title} 
          fill style={{ 
            objectFit: 'cover',
            transition: 'transform 0.8s ease-out',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }} 
        />
        {price && (
          <div className="absolute top-4 right-4 bg-arcatierra-terracota-principal text-white py-1 px-3 rounded-full font-semibold">
            {price}
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span 
                key={i}
                className="text-xs font-semibold py-1 px-2 rounded-full bg-white/80 text-arcatierra-verde-tipografia"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Contenido */}
      <motion.div 
        className="p-5 relative"
        animate={{ 
          y: isHovered ? -5 : 0
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold mb-2 text-arcatierra-verde-tipografia">{title}</h3>
        
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          {location && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </div>
          )}
          {duration && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration}
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{description}</p>
        
        {/* Rating */}
        {rating && (
          <div className="flex items-center mb-4">
            {Array(5).fill(0).map((_, i) => (
              <svg 
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Botón con efecto reveal */}
        <motion.div
          className="absolute bottom-5 right-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            y: isHovered ? 0 : 20 
          }}
          transition={{ duration: 0.3 }}
        >
          <a 
            href={url} 
            className="btn-primary btn-ripple text-sm py-2 px-4"
          >
            Ver detalles
          </a>
        </motion.div>
      </motion.div>
      
      {/* Efecto de hover */}
      <motion.div 
        className="absolute inset-0 border-2 rounded-lg pointer-events-none"
        initial={{ borderColor: 'rgba(177, 85, 67, 0)' }}
        animate={{ 
          borderColor: isHovered 
            ? 'rgba(177, 85, 67, 1)' 
            : 'rgba(177, 85, 67, 0)' 
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default ExperienceCard;
