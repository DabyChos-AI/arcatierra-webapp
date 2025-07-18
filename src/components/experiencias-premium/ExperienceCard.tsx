'use client'

import React, { useState } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { Clock, Users, MapPin, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface ExperienceCardProps {
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

const ExperienceCard = ({ experience, onReserve, index = 0 }: ExperienceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-64 overflow-hidden">
        <div className="w-full h-full transition-transform duration-500">
          <OptimizedImage 
            src={experience.image || '/images/experiencias/placeholder.jpg'} 
            alt={experience.title}
            fill className={`object-cover transition-transform duration-500 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`} ={index < 3}
          />
        </div>
        
        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
        
        {/* Badge con precio */}
        <div className="absolute top-4 right-4 bg-verde-principal text-white py-1 px-3 rounded-full font-semibold">
          {experience.price}
        </div>
        
        {/* Badge con rating */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1">
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white text-sm font-medium">{experience.rating}</span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-playfair text-verde-principal font-semibold mb-3">
          {experience.title}
        </h3>
        
        <p className="text-verde-tipografia text-sm mb-4 line-clamp-2">
          {experience.description}
        </p>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div className="flex items-center text-verde-tipografia">
            <Clock size={14} className="mr-1 flex-shrink-0" />
            <span>{experience.duration}</span>
          </div>
          
          <div className="flex items-center text-verde-tipografia">
            <Users size={14} className="mr-1 flex-shrink-0" />
            <span>{experience.participants}</span>
          </div>
          
          <div className="flex items-center text-verde-tipografia col-span-2">
            <MapPin size={14} className="mr-1 flex-shrink-0" />
            <span>{experience.location}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
          <div className="text-verde-principal font-semibold visible">
            {/* Espacio para mantener el layout */}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-verde-principal text-white rounded-md text-sm font-medium transition-colors hover:bg-verde-secundario"
            onClick={() => onReserve && onReserve(experience)}
          >
            Reservar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
