'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

type Experience = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  availability?: string[];
  image: string;
  rating: number;
  category: string;
  level: string;
  location: string;
  participants: number;
  included?: string[];
  notIncluded?: string[];
  slug: string;
};

type ExperienceCarouselProps = {
  experiences: Experience[];
  onReserve: (id: string) => void;
};

const ExperienceCarousel = ({ experiences, onReserve }: ExperienceCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? experiences.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prev) => (prev === experiences.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={carouselRef}>
        <div className="flex flex-col space-y-6">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              className={`w-full bg-white rounded-2xl overflow-hidden shadow-lg relative ${
                activeIndex === index ? 'ring-2 ring-verde-principal' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagen */}
                <div className="relative w-full md:w-2/5 h-64 md:h-auto">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badge y rating */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-verde-principal">
                      {experience.category}
                    </span>
                    <div className="flex items-center bg-white rounded-full px-2 py-1">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold text-verde-principal">{experience.rating}</span>
                    </div>
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="w-full md:w-3/5 p-6 flex flex-col">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-xl font-semibold text-verde-principal">
                      {experience.title}
                    </h3>
                    <span className="text-lg font-bold text-terracota-principal">
                      ${experience.price}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-verde-tipografia/80 mb-4 flex-wrap gap-y-2">
                    <div className="flex items-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {experience.duration}
                    </div>
                    <div className="flex items-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {experience.location}
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Máx. {experience.participants} personas
                    </div>
                  </div>
                  
                  <p className="text-verde-tipografia mb-4 line-clamp-2">
                    {experience.description}
                  </p>
                  
                  {/* Lo incluido */}
                  {experience.included && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-verde-principal mb-2">Incluye:</h4>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {experience.included.slice(0, 4).map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-verde-tipografia">
                            <svg className="w-4 h-4 text-verde-principal mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Botones de acción */}
                  <div className="flex justify-between items-center mt-auto pt-4">
                    <Link
                      href={`/experiencias/${experience.slug}`}
                      className="text-verde-principal hover:text-verde-oscuro font-medium text-sm flex items-center transition-colors"
                    >
                      Ver detalles
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => onReserve(experience.id)}
                      className="bg-terracota-principal hover:bg-terracota-oscuro text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Navegación */}
      {experiences.length > 1 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-verde-claro/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-verde-principal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {experiences.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeIndex === index ? 'bg-verde-principal' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-verde-claro/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-verde-principal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienceCarousel;
