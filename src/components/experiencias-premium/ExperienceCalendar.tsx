'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface ExperienceCalendarProps {
  dates: string[];
  onSelectDate?: (date: string) => void;
  className?: string;
}

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const formatDateString = (date: Date) => {
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

const ExperienceCalendar = ({ dates = [], onSelectDate, className = '' }: ExperienceCalendarProps) => {
  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Available dates in YYYY-MM-DD format
  const availableDates = new Set(dates);

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDayOfMonth = getFirstDayOfMonth(displayYear, displayMonth);
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    const dateString = formatDateString(date);
    
    if (availableDates.has(dateString)) {
      setSelectedDate(dateString);
      if (onSelectDate) {
        onSelectDate(dateString);
      }
    }
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
  }
  
  // Add cells for days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(displayYear, displayMonth, day);
    const dateString = formatDateString(date);
    const isAvailable = availableDates.has(dateString);
    const isSelected = selectedDate === dateString;
    const isPast = date < new Date(currentDate.setHours(0, 0, 0, 0));
    
    calendarDays.push(
      <motion.div
        key={day}
        className={`
          h-10 w-10 flex items-center justify-center rounded-full cursor-pointer
          ${isAvailable && !isPast ? 'hover:bg-verde-principal/20' : ''}
          ${isSelected ? 'bg-verde-principal text-white' : ''}
          ${isAvailable && !isPast ? 'text-verde-principal font-medium' : 'text-neutral-400'}
          ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !isPast && isAvailable && handleSelectDate(day)}
        whileHover={isAvailable && !isPast ? { scale: 1.1 } : {}}
        whileTap={isAvailable && !isPast ? { scale: 0.95 } : {}}
      >
        {day}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-lg p-4 md:p-6 shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon size={18} className="text-verde-principal" />
          <h3 className="text-lg font-semibold text-verde-principal">Calendario</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-verde-principal/10 text-verde-principal"
            onClick={handlePrevMonth}
          >
            <ChevronLeft size={16} />
          </motion.button>
          
          <span className="text-verde-tipografia font-medium">
            {monthNames[displayMonth]} {displayYear}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full bg-verde-principal/10 text-verde-principal"
            onClick={handleNextMonth}
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day names header */}
        {dayNames.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-neutral-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays}
      </div>

      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-neutral-200"
        >
          <p className="text-sm text-verde-principal font-medium">Has seleccionado:</p>
          <p className="text-base font-semibold text-verde-tipografia">
            {new Date(selectedDate).toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-3 w-full py-2 bg-verde-principal text-white rounded-md text-sm font-medium transition-colors hover:bg-verde-secundario"
            onClick={() => onSelectDate && onSelectDate(selectedDate)}
          >
            Confirmar Reserva
          </motion.button>
        </motion.div>
      )}
      
      <div className="mt-4 text-xs text-neutral-500">
        <p>• Las fechas en verde indican disponibilidad</p>
        <p>• Las experiencias se realizan con un mínimo de participantes</p>
      </div>
    </motion.div>
  );
};

export default ExperienceCalendar;
