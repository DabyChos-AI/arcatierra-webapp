'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterRangeProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  label: string;
}

// Componente de filtro de rango (slider dual)
const FilterRange: React.FC<FilterRangeProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (val) => `$${val}`,
  label
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // Manejo del slider mínimo
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    const updatedValue: [number, number] = [
      Math.min(newValue, localValue[1] - step),
      localValue[1]
    ];
    setLocalValue(updatedValue);
  };

  // Manejo del slider máximo
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    const updatedValue: [number, number] = [
      localValue[0],
      Math.max(newValue, localValue[0] + step)
    ];
    setLocalValue(updatedValue);
  };

  // Actualizar el valor principal cuando cambia el valor local (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 200);
    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className="mb-4">
      <label className="block text-verde-principal font-medium mb-2">{label}</label>
      <div className="flex justify-between mb-2">
        <span className="text-verde-tipografia">{formatLabel(localValue[0])}</span>
        <span className="text-verde-tipografia">{formatLabel(localValue[1])}</span>
      </div>
      
      <div className="relative h-2 bg-neutro-crema rounded-md my-6">
        {/* Track de fondo */}
        <div className="absolute inset-0 rounded-md bg-neutro-crema"></div>
        
        {/* Track activo */}
        <div
          className="absolute h-full bg-dorado-oscuro rounded-md"
          style={{
            left: `${((localValue[0] - min) / (max - min)) * 100}%`,
            width: `${((localValue[1] - localValue[0]) / (max - min)) * 100}%`
          }}
        ></div>

        {/* Slider mínimo */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />

        {/* Slider máximo */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />

        {/* Handle mínimo */}
        <div
          className="absolute w-5 h-5 -mt-1.5 bg-white border-2 border-dorado-oscuro rounded-full shadow-md cursor-pointer"
          style={{
            left: `calc(${((localValue[0] - min) / (max - min)) * 100}% - 10px)`,
            top: '0%'
          }}
        ></div>

        {/* Handle máximo */}
        <div
          className="absolute w-5 h-5 -mt-1.5 bg-white border-2 border-dorado-oscuro rounded-full shadow-md cursor-pointer"
          style={{
            left: `calc(${((localValue[1] - min) / (max - min)) * 100}% - 10px)`,
            top: '0%'
          }}
        ></div>
      </div>
    </div>
  );
};

interface CheckboxFilterProps {
  options: { value: string; label: string }[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  label: string;
}

// Componente de filtro con checkboxes
const CheckboxFilter: React.FC<CheckboxFilterProps> = ({
  options,
  selectedOptions,
  onChange,
  label
}) => {
  const handleOptionToggle = (value: string) => {
    if (selectedOptions.includes(value)) {
      onChange(selectedOptions.filter(option => option !== value));
    } else {
      onChange([...selectedOptions, value]);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-verde-principal font-medium mb-2">{label}</h3>
      <div className="space-y-2">
        {options.map(option => (
          <div key={option.value} className="flex items-center">
            <input
              id={`option-${option.value}`}
              type="checkbox"
              checked={selectedOptions.includes(option.value)}
              onChange={() => handleOptionToggle(option.value)}
              className="w-4 h-4 text-dorado-oscuro border-neutro-gris rounded focus:ring-verde-principal"
            />
            <label
              htmlFor={`option-${option.value}`}
              className="ml-2 text-verde-tipografia"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tipos para los filtros
export interface ExperienceFilters {
  priceRange: [number, number];
  duration: string[];
  type: string[];
  location: string[];
}

// Props para el componente principal
interface ExperienceFilterProps {
  filters: ExperienceFilters;
  onChange: (filters: ExperienceFilters) => void;
  onReset: () => void;
  experienceCount: number;
}

// Componente principal de filtros
const ExperienceFilters: React.FC<ExperienceFilterProps> = ({
  filters,
  onChange,
  onReset,
  experienceCount
}) => {
  // Estados para controlar el colapso de filtros en móvil y detectar el tamaño de pantalla
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Detectar el tamaño de pantalla solo en el cliente
  useEffect(() => {
    // Verificar si estamos en el cliente
    if (typeof window !== 'undefined') {
      const checkIsDesktop = () => {
        setIsDesktop(window.innerWidth >= 768);
      };
      
      // Verificar inicialmente
      checkIsDesktop();
      
      // Añadir listener para cambios de tamaño
      window.addEventListener('resize', checkIsDesktop);
      
      // Limpiar el listener
      return () => window.removeEventListener('resize', checkIsDesktop);
    }
  }, []);

  // Opciones predefinidas para los filtros
  const durationOptions = [
    { value: 'short', label: 'Corta (1-2 horas)' },
    { value: 'medium', label: 'Media (3-4 horas)' },
    { value: 'long', label: 'Larga (5+ horas)' },
  ];
  
  const typeOptions = [
    { value: 'gastronomic', label: 'Gastronómica' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'educational', label: 'Educativa' },
    { value: 'family', label: 'Familiar' },
  ];
  
  const locationOptions = [
    { value: 'embarcadero', label: 'Embarcadero' },
    { value: 'chinampa', label: 'Chinampa' },
    { value: 'mercado', label: 'Mercado local' },
  ];
  
  // Verificar si hay filtros activos
  const hasActiveFilters = filters.priceRange[0] !== 300 || 
    filters.priceRange[1] !== 1500 ||
    filters.duration.length > 0 ||
    filters.type.length > 0 ||
    filters.location.length > 0;

  // Manejo de cambios en los filtros
  const handlePriceChange = (value: [number, number]) => {
    onChange({
      ...filters,
      priceRange: value
    });
  };
  
  const handleDurationChange = (selected: string[]) => {
    onChange({
      ...filters,
      duration: selected
    });
  };
  
  const handleTypeChange = (selected: string[]) => {
    onChange({
      ...filters,
      type: selected
    });
  };
  
  const handleLocationChange = (selected: string[]) => {
    onChange({
      ...filters,
      location: selected
    });
  };
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-neutro-crema/60">
      <div className="flex flex-wrap items-center justify-between mb-4 md:mb-6">
        <button 
          className="flex items-center w-full md:w-auto justify-between md:justify-start"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-verde-principal mr-2" />
            <h3 className="text-lg font-medium text-verde-principal">Filtros</h3>
            {hasActiveFilters && (
              <span className="ml-2 bg-dorado-principal text-white text-xs py-0.5 px-2 rounded-full">
                Activos
              </span>
            )}
          </div>
          <div className="md:hidden">
            {filtersExpanded ? (
              <ChevronUp className="h-5 w-5 text-verde-principal" />
            ) : (
              <ChevronDown className="h-5 w-5 text-verde-principal" />
            )}
          </div>
        </button>

        <div className="flex items-center w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-end">
          <span className="text-sm text-verde-tipografia md:mr-4">
            {experienceCount} {experienceCount === 1 ? 'experiencia' : 'experiencias'} encontradas
          </span>
          {hasActiveFilters && (
            <button 
              onClick={onReset}
              className="flex items-center text-sm text-dorado-oscuro hover:text-dorado-principal transition-colors ml-auto md:ml-0"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </button>
          )}
        </div>
      </div>
      
      <motion.div 
        className={`overflow-hidden transition-all duration-300 ease-in-out`}
        animate={{ 
          height: filtersExpanded || isDesktop ? 'auto' : 0,
          opacity: filtersExpanded || isDesktop ? 1 : 0,
          marginTop: filtersExpanded || isDesktop ? '1rem' : 0
        }}
        initial={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <FilterRange 
              label="Precio por persona"
              min={300}
              max={1500}
              step={50}
              value={filters.priceRange}
              onChange={handlePriceChange}
              formatLabel={(val) => `$${val}`}
            />
          </div>
          
          <div>
            <CheckboxFilter 
              label="Duración"
              options={durationOptions}
              selectedOptions={filters.duration}
              onChange={handleDurationChange}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
            <CheckboxFilter 
              label="Tipo"
              options={typeOptions}
              selectedOptions={filters.type}
              onChange={handleTypeChange}
            />
            
            <CheckboxFilter 
              label="Ubicación"
              options={locationOptions}
              selectedOptions={filters.location}
              onChange={handleLocationChange}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExperienceFilters;
