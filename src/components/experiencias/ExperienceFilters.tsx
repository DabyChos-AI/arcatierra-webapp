'use client'

import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'

export type ExperienceFilters = {
  category: string;
  price: number[];
  duration: string;
  level: string;
  date: Date | null;
};

type ExperienceFiltersProps = {
  onFiltersChange: (filters: ExperienceFilters) => void;
  initialFilters?: ExperienceFilters;
};

const ExperienceFilters = ({ onFiltersChange, initialFilters }: ExperienceFiltersProps) => {
  const [filters, setFilters] = useState<ExperienceFilters>(
    initialFilters || {
      category: 'todas',
      price: [0, 2000],
      duration: 'todas',
      level: 'todos',
      date: null,
    }
  );
  
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // Solo ejecutar en el cliente
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Inicializar ancho de ventana
    setWindowWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Actualizar filtros padre cuando cambian los locales
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, price: value });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, duration: e.target.value });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, level: e.target.value });
  };

  const isMobile = windowWidth < 768;

  return (
    <div className="space-y-6">
      {/* Categoría */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-verde-tipografia mb-2">
          Categoría
        </label>
        <select
          id="category"
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-verde-principal focus:ring-1 focus:ring-verde-principal outline-none transition-colors"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option value="todas">Todas las categorías</option>
          <option value="Gastronomía">Gastronomía</option>
          <option value="Educativo">Educativo</option>
          <option value="Fotografía">Fotografía</option>
          <option value="Cultural">Cultural</option>
        </select>
      </div>

      {/* Rango de precio */}
      <div>
        <label className="block text-sm font-medium text-verde-tipografia mb-2">
          Precio (MXN)
        </label>
        <div className="px-1">
          <Slider
            defaultValue={[filters.price[0], filters.price[1]]}
            max={2000}
            step={50}
            onValueChange={handlePriceChange}
            className="mt-4"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>${filters.price[0]}</span>
            <span>${filters.price[1]}</span>
          </div>
        </div>
      </div>

      {/* Duración */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-verde-tipografia mb-2">
          Duración
        </label>
        <select
          id="duration"
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-verde-principal focus:ring-1 focus:ring-verde-principal outline-none transition-colors"
          value={filters.duration}
          onChange={handleDurationChange}
        >
          <option value="todas">Todas las duraciones</option>
          <option value="1-2 horas">1-2 horas</option>
          <option value="3-4 horas">3-4 horas</option>
          <option value="5-8 horas">5-8 horas</option>
          <option value="8+ horas">Más de 8 horas</option>
        </select>
      </div>

      {/* Nivel */}
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-verde-tipografia mb-2">
          Nivel
        </label>
        <select
          id="level"
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-verde-principal focus:ring-1 focus:ring-verde-principal outline-none transition-colors"
          value={filters.level}
          onChange={handleLevelChange}
        >
          <option value="todos">Todos los niveles</option>
          <option value="Principiante">Principiante</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
      </div>

      {/* Botones de acción */}
      <div className="pt-4">
        <button
          onClick={() => setFilters({
            category: 'todas',
            price: [0, 2000],
            duration: 'todas',
            level: 'todos',
            date: null,
          })}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-verde-tipografia rounded-lg transition-colors mb-3"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default ExperienceFilters;
