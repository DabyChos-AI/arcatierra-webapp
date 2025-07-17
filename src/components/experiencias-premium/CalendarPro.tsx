'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Users, Clock } from 'lucide-react';

interface CalendarProProps {
  experience?: {
    title: string;
    image?: string;
    duration?: string;
    participants?: string;
    price?: string;
  };
  dates: string[];
  onSelectDate?: (date: string) => void;
  onConfirmReservation?: (date: string, time: string, people: number) => void;
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

const formatDisplayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const CalendarPro = ({ 
  experience,
  dates = [], 
  onSelectDate, 
  onConfirmReservation,
  className = '' 
}: CalendarProProps) => {
  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth());
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [view, setView] = useState<'calendar' | 'time' | 'summary'>('calendar');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Horarios disponibles (en la realidad, esto vendría de la API)
  const availableTimes = ["09:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

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
    if (isAnimating) return;
    
    setIsAnimating(true);
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNextMonth = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(displayYear, displayMonth, day);
    const dateString = formatDateString(date);
    
    if (availableDates.has(dateString)) {
      setSelectedDate(dateString);
      if (onSelectDate) {
        onSelectDate(dateString);
      }
      
      // Transición a la selección de hora
      setTimeout(() => {
        setView('time');
      }, 300);
    }
  };
  
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    
    // Transición a la vista de resumen
    setTimeout(() => {
      setView('summary');
    }, 300);
  };
  
  const handleConfirmReservation = () => {
    if (selectedDate && selectedTime && onConfirmReservation) {
      onConfirmReservation(selectedDate, selectedTime, people);
    }
  };
  
  const handleBack = () => {
    if (view === 'time') {
      setView('calendar');
      setSelectedDate(null);
    } else if (view === 'summary') {
      setView('time');
      setSelectedTime(null);
    }
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-9 w-9 sm:h-12 sm:w-12"></div>);
  }
  
  // Add cells for days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(displayYear, displayMonth, day);
    const dateString = formatDateString(date);
    const isAvailable = availableDates.has(dateString);
    const isSelected = selectedDate === dateString;
    const isPast = date < new Date(currentDate.setHours(0, 0, 0, 0));
    const isToday = dateString === formatDateString(new Date());
    
    calendarDays.push(
      <motion.div
        key={day}
        whileHover={isAvailable && !isPast ? { scale: 1.05 } : {}}
        whileTap={isAvailable && !isPast ? { scale: 0.95 } : {}}
        onClick={() => isAvailable && !isPast && handleSelectDate(day)}
        className={`
          relative h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 m-0.5 sm:m-1 flex items-center justify-center rounded-full cursor-pointer
          transition-all duration-200 select-none text-xs sm:text-sm md:text-base
          ${isAvailable && !isPast ? 'hover:bg-verde-principal hover:text-white' : ''}
          ${isSelected ? 'bg-verde-principal text-white' : ''}
          ${isAvailable && !isPast && !isSelected ? 'text-verde-principal font-medium ring-1 ring-verde-principal/30' : ''}
          ${!isAvailable && !isPast ? 'text-neutral-400 cursor-not-allowed' : ''}
          ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
          ${isToday && !isSelected ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-verde-principal' : ''}
        `}
      >
        {day}
        {isAvailable && !isPast && !isSelected && (
          <motion.span 
            className="absolute -bottom-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-verde-principal rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3, type: 'spring' }}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header con información de la experiencia */}
      {experience && (
        <div className="bg-gradient-to-r from-verde-principal to-verde-secundario text-white p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-medium truncate">{experience.title}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm opacity-90">
            {experience.duration && (
              <div className="flex items-center">
                <Clock size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{experience.duration}</span>
              </div>
            )}
            {experience.participants && (
              <div className="flex items-center">
                <Users size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{experience.participants}</span>
              </div>
            )}
            {experience.price && (
              <div className="ml-auto font-semibold">{experience.price}</div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'calendar' && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Calendar header */}
            <div className="flex justify-between items-center px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <h2 className="text-base sm:text-lg font-medium text-verde-principal flex items-center">
                <CalendarIcon size={16} className="mr-1 sm:mr-2 hidden xs:inline" />
                <span className="truncate">{monthNames[displayMonth]} {displayYear}</span>
              </h2>
              <div className="flex space-x-1 sm:space-x-2">
                <button 
                  onClick={handlePrevMonth}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-neutro-crema text-verde-principal transition-colors"
                  disabled={isAnimating}
                >
                  <ChevronLeft size={16} className="sm:hidden" />
                  <ChevronLeft size={20} className="hidden sm:inline" />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-neutro-crema text-verde-principal transition-colors"
                  disabled={isAnimating}
                >
                  <ChevronRight size={16} className="sm:hidden" />
                  <ChevronRight size={20} className="hidden sm:inline" />
                </button>
              </div>
            </div>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0 px-2 sm:px-4 mb-1 sm:mb-2">
              {dayNames.map((day, index) => (
                <div 
                  key={day} 
                  className={`text-center text-xs sm:text-sm font-medium py-1 sm:py-2
                    ${index === 0 || index === 6 ? 'text-verde-principal' : 'text-verde-tipografia'}
                  `}
                >
                  {day.slice(0, 1)}
                  <span className="hidden xs:inline">{day.slice(1)}</span>
                </div>
              ))}
            </div>
            
            {/* Days grid */}
            <motion.div 
              className="grid grid-cols-7 gap-0 p-4 justify-items-center"
              key={`${displayMonth}-${displayYear}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {calendarDays}
            </motion.div>
            
            <div className="p-4 text-sm text-center text-verde-tipografia">
              Selecciona una fecha disponible para reservar
            </div>
          </motion.div>
        )}
        
        {view === 'time' && selectedDate && (
          <motion.div
            key="time-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6"
          >
            <div className="mb-4 sm:mb-6">
              <button 
                onClick={handleBack}
                className="text-xs sm:text-sm text-verde-principal hover:underline flex items-center"
              >
                <ChevronLeft size={14} className="sm:hidden" />
                <ChevronLeft size={16} className="hidden sm:inline" /> 
                <span>Volver a selección de fecha</span>
              </button>
              <h2 className="text-base sm:text-lg font-semibold text-verde-principal mt-3 sm:mt-4 truncate">
                {formatDisplayDate(selectedDate)}
              </h2>
              <p className="text-xs sm:text-sm text-verde-tipografia mt-1">
                Selecciona un horario disponible
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {availableTimes.map((time) => (
                <motion.button
                  key={time}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectTime(time)}
                  className={`
                    p-2 sm:p-3 rounded-lg border text-center transition-all text-xs sm:text-sm
                    ${selectedTime === time 
                      ? 'bg-verde-principal text-white border-transparent' 
                      : 'border-verde-principal/30 text-verde-principal hover:bg-verde-principal/10'}
                  `}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {view === 'summary' && selectedDate && selectedTime && (
          <motion.div
            key="summary-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6"
          >
            <div className="mb-4 sm:mb-6">
              <button 
                onClick={handleBack}
                className="text-xs sm:text-sm text-verde-principal hover:underline flex items-center"
              >
                <ChevronLeft size={14} className="sm:hidden" />
                <ChevronLeft size={16} className="hidden sm:inline" /> 
                <span>Volver a selección de horario</span>
              </button>
              <h2 className="text-base sm:text-lg font-semibold text-verde-principal mt-3 sm:mt-4">
                Confirma tu reserva
              </h2>
            </div>
            
            <div className="bg-neutro-crema/30 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
              <div className="flex justify-between flex-wrap">
                <span className="text-verde-tipografia text-xs sm:text-sm">Fecha:</span>
                <span className="font-medium text-xs sm:text-sm">{formatDisplayDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-verde-tipografia text-xs sm:text-sm">Hora:</span>
                <span className="font-medium text-xs sm:text-sm">{selectedTime}</span>
              </div>
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2">
                <span className="text-verde-tipografia text-xs sm:text-sm">Participantes:</span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setPeople(Math.max(1, people - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-verde-principal/20 flex items-center justify-center text-verde-principal"
                    aria-label="Reducir número de participantes"
                  >
                    -
                  </button>
                  <span className="w-6 sm:w-8 text-center font-medium text-xs sm:text-sm">{people}</span>
                  <button 
                    onClick={() => setPeople(Math.min(10, people + 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-verde-principal/20 flex items-center justify-center text-verde-principal"
                    aria-label="Aumentar número de participantes"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmReservation}
              className="w-full py-2.5 sm:py-3 bg-verde-principal text-white rounded-lg font-medium flex items-center justify-center text-sm sm:text-base"
            >
              <Check size={16} className="mr-1.5 sm:mr-2" />
              Confirmar Reserva
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarPro;
