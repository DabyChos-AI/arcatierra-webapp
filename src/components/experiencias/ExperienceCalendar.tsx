import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  availableDates?: Date[];
}

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ExperienceCalendar = ({ onDateSelect, availableDates = [] }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Crear un mapa de fechas disponibles para búsqueda rápida
  const availableDateMap = availableDates.reduce((acc, date) => {
    const dateKey = date.toISOString().split('T')[0];
    acc[dateKey] = true;
    return acc;
  }, {} as Record<string, boolean>);
  
  const isDateAvailable = (date: Date): boolean => {
    // Si no hay fechas disponibles específicas, consideramos todas disponibles
    if (availableDates.length === 0) {
      const now = new Date();
      // Solo fechas futuras son válidas
      return date >= now;
    }
    const dateKey = date.toISOString().split('T')[0];
    return !!availableDateMap[dateKey];
  };
  
  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };
  
  const renderCalendarDays = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Ajustar al inicio de la semana
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Asegurar que termina al final de la semana
    if (endDate.getDay() < 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }
    
    const days = [];
    let currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      const dayDate = new Date(currentDay);
      const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isAvailable = isDateAvailable(dayDate);
      const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
      
      days.push(
        <motion.button
          key={dayDate.toISOString()}
          onClick={() => handleDateClick(dayDate)}
          disabled={!isAvailable || !isCurrentMonth}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm
            transition-all duration-200
            ${!isCurrentMonth ? 'text-gris-claro opacity-30' : ''}
            ${isAvailable && isCurrentMonth ? 'hover:bg-verde-claro cursor-pointer' : 'cursor-default'}
            ${isToday ? 'border border-terracota-principal' : ''}
            ${isSelected ? 'bg-terracota-principal text-white' : ''}
          `}
          whileHover={isAvailable && isCurrentMonth ? { scale: 1.1 } : {}}
          whileTap={isAvailable && isCurrentMonth ? { scale: 0.95 } : {}}
        >
          {dayDate.getDate()}
        </motion.button>
      );
      
      // Avanzar al siguiente día
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };
  
  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-verde-claro/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5 text-verde-principal" />
        </motion.button>
        
        <h3 className="text-lg font-semibold text-verde-principal">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <motion.button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-verde-claro/20 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5 text-verde-principal" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-xs text-gris-medio text-center font-medium py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="wait">
          {renderCalendarDays()}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gris-claro flex items-center">
        <Calendar className="w-4 h-4 text-terracota-principal mr-2" />
        <span className="text-xs text-gris-medio">
          Selecciona una fecha disponible para reservar
        </span>
      </div>
    </div>
  );
};

export default ExperienceCalendar;
