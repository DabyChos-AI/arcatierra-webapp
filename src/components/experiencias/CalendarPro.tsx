'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

type CalendarProProps = {
  onSelectDate: (date: Date | null) => void;
  selectedDate: Date | null;
  availableDates?: Date[];
};

const CalendarPro = ({ onSelectDate, selectedDate, availableDates = [] }: CalendarProProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDate, setActiveDate] = useState<Date | null>(selectedDate);
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const onDateClick = (day: Date) => {
    // Si el día no está disponible, no hacer nada
    if (!isAvailableDate(day)) return;
    
    setActiveDate(day);
    onSelectDate(day);
  };
  
  const isAvailableDate = (date: Date): boolean => {
    if (!availableDates || availableDates.length === 0) return true;
    
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };
  
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Mes anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-verde-principal" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-lg font-medium text-verde-principal">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Mes siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-verde-principal" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };
  
  const renderDaysOfWeek = () => {
    const dateFormat = 'EEEEE';
    const days = [];
    
    let startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center text-xs font-medium text-gray-500 uppercase" key={i}>
          {format(addDays(startDate, i), dateFormat, { locale: es })}
        </div>
      );
    }
    
    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = activeDate && isSameDay(day, activeDate);
        const isAvailable = isAvailableDate(day);
        
        days.push(
          <div
            className={`relative p-2 text-center ${!isCurrentMonth ? 'opacity-30' : ''}`}
            key={day.toString()}
          >
            <button
              className={`
                w-9 h-9 rounded-full flex items-center justify-center transition-all
                ${isSelected ? 'bg-verde-principal text-white' : ''}
                ${isToday && !isSelected ? 'border border-verde-principal text-verde-principal' : ''}
                ${isAvailable && isCurrentMonth && !isSelected && !isToday ? 'hover:bg-verde-principal/10' : ''}
                ${!isAvailable || !isCurrentMonth ? 'text-gray-400 cursor-default' : 'cursor-pointer'}
              `}
              onClick={() => onDateClick(cloneDay)}
              disabled={!isAvailable || !isCurrentMonth}
            >
              {format(day, 'd')}
            </button>
            {isAvailable && isCurrentMonth && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-verde-principal'}`}></div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="space-y-1">{rows}</div>;
  };
  
  return (
    <motion.div 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      
      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-verde-principal mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full border border-verde-principal mr-2"></div>
          <span>Hoy</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPro;
