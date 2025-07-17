# Guía de Implementación Visual y UX para Arca Tierra Premium

Este documento presenta una guía detallada para implementar mejoras visuales y de experiencia de usuario en la página de experiencias premium de Arca Tierra, basada en los principios de diseño de eatlittlesesame.com pero respetando la identidad visual propia de Arca Tierra.

## Inspiración y Análisis Visual de eatlittlesesame.com

### Características Visuales Clave a Adoptar

![Little Sesame Website](https://www.eatlittlesesame.com/cdn/shop/files/IMG_0341-2.jpg?v=1716321585&width=1800)

1. **Minimalismo Elegante**
   - Uso estratégico de espacios en blanco (negative space)
   - Composiciones limpias que permiten "respirar" al contenido
   - Enfoque en un solo elemento focal por sección

2. **Narrativa Visual Inmersiva**
   - Storytelling visual mediante imágenes de alta calidad
   - Transiciones suaves entre secciones que cuentan una historia
   - Jerarquía clara que guía la mirada del usuario

3. **Fotografía Premium**
   - Imágenes en HD con estilo glossy y profesional
   - Paleta de colores cálidos y terrosos en las fotografías
   - Composiciones que destacan la naturalidad y autenticidad

4. **Tipografía Expresiva y Legible**
   - Contraste entre tipografías serif para títulos y sans-serif para cuerpo
   - Espaciado generoso entre líneas para mejorar legibilidad
   - Jerarquía tipográfica clara: títulos, subtítulos, párrafos

5. **Animaciones Sutiles y Funcionales**
   - Animaciones al hacer scroll que revelan contenido
   - Hover effects refinados que mejoran la interacción
   - Transiciones suaves entre estados de los elementos

6. **Layout Asimétrico con Balance**
   - Composiciones que rompen la cuadrícula tradicional
   - Equilibrio visual entre elementos de diferentes tamaños
   - Uso de superposiciones y capas para crear profundidad

## Template de Implementación con Identidad Arca Tierra

### Paleta de Colores Oficial Arca Tierra

Basado en el Manual de Identidad, debemos respetar estrictamente esta paleta:

```css
:root {
    /* Colores primarios */
    --terracota-principal: #B15543; /* Color principal para CTA y acentos */
    --verde-principal: #33503E;     /* Color secundario para elementos importantes */
    
    /* Colores secundarios */
    --marron-oscuro: #562E26;      /* Para elementos de contraste y footer */
    --verde-secundario: #67795F;    /* Para elementos decorativos y hover states */
    --verde-claro: #ABC59E;         /* Para fondos suaves y elementos sutiles */
    
    /* Colores neutros */
    --beige: #EAD8B6;               /* Para fondos cálidos */
    --crema: #F9F4E8;               /* Para fondos principales y áreas de contenido */
    --blanco: #FFFFFF;              /* Para fondos de contraste y tarjetas */
    --negro: #1A1A1A;               /* Para texto principal */
    --gris-oscuro: #4A4A4A;         /* Para texto secundario */
    --gris-medio: #7A7A7A;          /* Para texto de menor importancia */
    --gris-claro: #CACACA;          /* Para bordes y separadores */
}
```

### Tipografía Arca Tierra

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap');

:root {
    --font-heading: 'Playfair Display', serif;
    --font-body: 'Open Sans', sans-serif;
    --line-height-tight: 1.2;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.8;
}

h1, h2, h3 {
    font-family: var(--font-heading);
    font-weight: 700;
    color: var(--verde-principal);
    letter-spacing: -0.02em;
}

h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 500;
    color: var(--verde-principal);
}

body, p, a, li, span, button, input, select, textarea {
    font-family: var(--font-body);
    font-weight: 400;
    color: var(--negro);
    line-height: var(--line-height-normal);
}
```

### Componentes UI Clave para Experiencias Premium

#### 1. Hero Section con Parallax (Inspirado en eatlittlesesame.com)

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

const ParallaxHero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  return (
    <div ref={ref} className="h-screen w-full overflow-hidden relative">
      <motion.div 
        style={{ y, opacity }} 
        className="absolute inset-0 w-full h-full"
      >
        <Image 
          src="/images/experiencias/hero-background.jpg"
          alt="Experiencias Gastronómicas Arca Tierra"
          fill
          priority
          quality={100}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-verde-principal/40 mix-blend-multiply" />
      </motion.div>
      
      <div className="container mx-auto h-full flex items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-3xl text-white px-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Experiencias Premium
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-xl">
            Sumérgete en el auténtico sabor de Xochimilco con nuestras experiencias gastronómicas exclusivas
          </p>
          <button className="bg-terracota-principal hover:bg-terracota-principal/90 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105">
            Descubrir Experiencias
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ParallaxHero;
```

#### 2. Tarjetas de Experiencia con Hover Effect (Inspirado en eatlittlesesame.com)

```tsx
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface ExperienceCardProps {
  title: string;
  description: string;
  imageSrc: string;
  price: number;
  category: string;
  slug: string;
}

const ExperienceCard = ({ title, description, imageSrc, price, category, slug }: ExperienceCardProps) => {
  return (
    <motion.div 
      className="group relative overflow-hidden rounded-2xl bg-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Imagen con hover effect */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
        <div className="relative h-full w-full transform transition-transform duration-700 group-hover:scale-105">
          <Image 
            src={imageSrc} 
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-negro/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
      
      {/* Categoría */}
      <div className="absolute top-4 left-4 bg-terracota-principal/90 text-white text-xs font-medium px-3 py-1.5 rounded-full">
        {category}
      </div>
      
      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-verde-principal line-clamp-2 mb-2 font-heading group-hover:text-terracota-principal transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gris-oscuro line-clamp-3 mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-verde-principal">
            ${price.toFixed(2)} <span className="text-sm font-normal">MXN</span>
          </span>
          <Link href={`/experiencias-premium/${slug}`}>
            <motion.button 
              className="bg-verde-principal text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 group-hover:bg-terracota-principal"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reservar
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
```

#### 3. Calendario Interactivo de Reservas (Inspirado en el HTML de ejemplo)

```tsx
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
```
```

## Funcionalidades de Ejemplos HTML

### 1. Sistema de Autenticación (`auth/login.html` y `auth/unified-auth-system.html`)

- **Tabs de Inicio/Registro**: Sistema con pestañas que alterna entre iniciar sesión y crear cuenta
- **Múltiples métodos de login**: 
  - Login con Google 
  - Login con email/contraseña tradicional
- **Funciones de recuperación**: "Olvidé mi contraseña"
- **Verificación de contraseña**: Indicador de fortaleza de contraseña
- **Animaciones de transición**: Entre pestañas y estados de formulario
- **Tema oscuro/claro**: Soporte completo para cambio de tema
- **Validación de formularios**: Mensajes de error contextuales en tiempo real

### 2. Perfil de Usuario (`cuenta/mi-cuenta.html`)

- **Dashboard de usuario**: Sección principal con estadísticas y accesos rápidos
- **Perfil editable**: Formulario para actualizar información personal
- **Avatar y gestión de foto**: Opción para cambiar foto de perfil con vista previa
- **Historial de compras**: Lista de pedidos anteriores con estado y detalles
- **Favoritos guardados**: Productos marcados como favoritos con sincronización
- **Direcciones de envío**: Gestión de múltiples direcciones con mapa integrado
- **Preferencias de usuario**: Configuración de notificaciones y comunicaciones
- **Panel de suscripciones**: Gestión de canastas recurrentes
- **Modo oscuro personalizable**: Toggle con animación suave

### 3. Checkout y Proceso de Compra (`checkout.html`)

- **Proceso multi-paso**: Flujo de checkout dividido por etapas
- **Resumen del carrito**: Visualización clara de productos seleccionados
- **Opciones de entrega**: Selección de fechas y franjas horarias
- **Mapa interactivo con Leaflet**: Para selección de dirección de entrega
- **Múltiples métodos de pago**: Tarjeta, transferencia, efectivo
- **Cupones y descuentos**: Campo para aplicar códigos promocionales
- **Validación en tiempo real**: De datos de pago y dirección
- **Confirmación interactiva**: Con animaciones de éxito y resumen

### 4. Contacto y Soporte (`contacto.html`)

- **Formulario de contacto**: Con validaciones y campos para diferentes consultas
- **Información de la empresa**: Dirección, teléfono, correo, horarios
- **Mapa interactivo**: Ubicación de la empresa con marcadores personalizados
- **FAQ expandibles**: Preguntas frecuentes organizadas por categorías
- **Chat en vivo**: Botón flotante para soporte inmediato
- **Redes sociales**: Enlaces con iconos animados
- **Selector de tipo de mensaje**: Para dirigir consultas al departamento correcto

### 5. Panel de Administración (`panel-guardianes.html`)

- **Dashboard administrativo**: Panel de control para empleados
- **Estadísticas y métricas**: Visualización de datos con gráficas interactivas
- **Gestión de inventario**: Control de productos y existencias
- **Gestión de pedidos**: Seguimiento y actualización de estado
- **Calendario de experiencias**: Vista de programación y disponibilidad
- **Vista de empleados**: Panel específico para gestión de personal
- **Exportación de datos**: Generación de reportes en varios formatos
- **Notificaciones internas**: Sistema de alertas para el equipo

### 6. Calendario de Experiencias (`Calendario-experiencias.html`)

- **Calendario interactivo**: Con vista mensual/semanal/diaria
- **Filtrado por categorías**: De experiencias y talleres
- **Animación de carga**: Indicador de carga con círculos animados
- **Reserva directa**: Proceso integrado en el calendario
- **Disponibilidad en tiempo real**: Indicador de cupos disponibles
- **Detalles expandibles**: Información completa al hacer clic
- **Compartir eventos**: Opciones para redes sociales y correo
- **Recordatorios**: Funcionalidad para agregar al calendario personal

### 7. Diseño y UI compartidos

- **Paleta de colores oficiales**: Variables CSS con colores de marca bien definidos
- **Componentes reutilizables**: Botones, tarjetas, formularios, navegación
- **Animaciones y transiciones**: Efectos suaves para mejorar UX
- **Diseño responsivo**: Adaptaciones para diferentes tamaños de pantalla
- **Sistema de notificaciones/toasts**: Para confirmar acciones
- **Loaders personalizados**: Con la identidad de la marca
- **Iconografía consistente**: Sistema unificado de iconos
- **Tipografía optimizada**: Jerarquía visual clara con fuentes específicas

## Funcionalidades del Demo Vite

### 1. Sistema de Autenticación Avanzado (`AuthModal.jsx`)
- **Sistema de tabs dinámico**: Transiciones fluidas entre login/registro/recuperación de contraseña
- **Validación de formularios reactiva**: Validaciones en tiempo real con mensajes de error específicos
- **Animaciones de transición avanzadas**: Implementadas con Framer Motion para mejorar UX
- **Estados de carga con feedback visual**: Spinners y transiciones durante procesos de autenticación
- **Gestión de contraseñas mejorada**: Toggle mostrar/ocultar con iconos animados
- **Sistema de notificaciones contextual**: Mensajes de error, advertencia y éxito personalizados
- **Autenticación social integrada**: Botones de Google y otros proveedores
- **Persistencia de sesión**: Almacenamiento seguro de tokens de autenticación

### 2. UI Moderno y Sistema de Diseño
- **Sistema completo shadcn/ui**: 45+ componentes accesibles y reutilizables:
  - Acordeones, diálogos modales, alertas y notificaciones
  - Botones con variantes y estados, carruseles interactivos
  - Campos de formulario avanzados y validación integrada
  - Menús desplegables, pestañas y navegación
  - Tablas de datos con ordenación y filtrado
- **Tema personalizable**: Soporte completo para modo claro/oscuro con transiciones suaves
- **Variables CSS estructuradas**: Sistema de tokens de diseño con colores oficiales de marca
- **Sidebar interactivo**: Sistema colapsable con animaciones y atajos de teclado
- **Layout responsive**: Adaptación fluida a diferentes dispositivos
- **Componentes de datos**: Gráficas, tablas y visualizaciones interactivas

### 3. Animaciones y Efectos Visuales Profesionales
- **Integración profunda de Framer Motion**:
  - Animaciones de entrada/salida coordinadas con `AnimatePresence`
  - Transiciones entre páginas y componentes con `motion.div`
  - Efectos de paralaje en secciones Hero y destacados
  - Revelado progresivo de elementos al hacer scroll
  - Animaciones interactivas basadas en gestos
- **Micro-interacciones**: Feedback visual sutil en botones, campos y elementos interactivos
- **Estados de transición**: Animaciones entre diferentes estados de componentes
- **Loaders temáticos**: Indicadores de carga personalizados con la estética de marca
- **Efectos de fondo**: Gradientes animados y texturas sutiles

### 4. Componentes de Negocio Avanzados
- **Sistema de carrito de compras completo** (`ShoppingCart.jsx`):
  - Añadir/eliminar productos con animaciones
  - Actualizar cantidades con validación de inventario
  - Cálculo dinámico de totales y descuentos
  - Persistencia del carrito entre sesiones
- **Dashboard personalizado** (`Dashboard.jsx`, `UserDashboard.jsx`):
  - Secciones modulares con datos personalizados
  - Widgets reordenables y personalizables
  - Métricas y estadísticas con visualización gráfica
- **Calendario de experiencias** (`ExperiencesCalendar.jsx`):
  - Vista de calendario interactivo con reserva directa
  - Filtrado por categorías y disponibilidad
  - Detalles expandibles con animaciones
- **Sección de productos** (`ProductGrid.jsx`):
  - Grid responsive con lazy loading
  - Filtros y ordenación avanzados
  - Vista rápida de productos con modal

### 5. Hooks Personalizados y Utilidades de Desarrollo
- **Hook de detección móvil** (`use-mobile.js`):
  - Detección precisa de dispositivos y tamaños de pantalla
  - Adaptación dinámica de la interfaz basada en breakpoints
- **Utilidades de clase condicional** (`cn` en `/lib/utils.js`):
  - Manipulación elegante de clases CSS condicionales con Tailwind
  - Sistema para combinar variantes de componentes
- **Herramientas de formato y validación**:
  - Funciones para formatear fechas, monedas y valores
  - Validadores de formularios y datos reutilizables
- **Gestión de estado global**:
  - Sistema para compartir estado entre componentes
  - Persistencia de preferencias de usuario
- **Utilidades de accesibilidad**:
  - Soporte para navegación por teclado
  - Atributos ARIA y mejoras de accesibilidad

## Componentes Técnicos Destacados

1. **Sistema Completo de UI con shadcn/ui**: Biblioteca completa de componentes reutilizables y accesibles, listos para migrar a Next.js con soporte para TypeScript y theming

2. **Animaciones Avanzadas con Framer Motion**: Framework profesional de animaciones para React que permite crear transiciones fluidas y efectos visuales de alta calidad adaptados a la identidad de la marca

3. **Sistema de Autenticación Modular**: Flujo completo de autenticación con validación de formularios, estados de usuario y persistencia de sesión, compatible con Auth.js para Next.js

4. **Dashboard Dinámico y Personalizable**: Panel de control modular con widgets reorganizables, gráficas interactivas y visualización de datos adaptada a diferentes perfiles de usuario

5. **Gestión Completa de Carrito y Checkout**: Sistema completo de e-commerce con gestión de productos, carrito persistente, y proceso de checkout optimizado para conversión

6. **Sistema de Diseño con Variables CSS**: Arquitectura de tokens de diseño basada en variables CSS para mantener consistencia visual y facilitar cambios globales

7. **Soporte para Tema Oscuro/Claro**: Implementación completa de cambio de tema con detección de preferencias del sistema y persistencia de elección del usuario

8. **Framework Responsivo Adaptativo**: Sistema completo para crear interfaces que se adapten fluidamente a cualquier tamaño de pantalla con hooks personalizados de detección

9. **Componentes de Calendario y Reservas**: Sistema interactivo de calendario con selección de fechas, disponibilidad en tiempo real y proceso de reserva integrado

10. **Biblioteca de Utilidades Frontend**: Conjunto de funciones y hooks reutilizables para formateo, validación, manejo de clases CSS y operaciones comunes

## Vistas Prioritarias a Implementar

1. **Sistema de Autenticación Unificado**: 
   - Implementar sistema de autenticación con Next.js Auth.js
   - Diseño de pestañas con transiciones animadas entre login/registro/recuperación
   - Integración de autenticación social (Google, Facebook)
   - Validación de formularios en tiempo real y estados de feedback
   - Persistencia de sesión y manejo seguro de tokens

2. **Dashboard de Usuario Personalizable**:
   - Panel principal con widgets modulares y personalizables
   - Sistema completo de gestión de perfil con avatar y preferencias
   - Historial de pedidos interactivo con seguimiento de estado
   - Gestión de favoritos con sincronización entre dispositivos
   - Sección de suscripciones y canastas recurrentes
   - Panel de direcciones con integración de mapas

3. **Sistema de Checkout y Pago**:
   - Proceso multi-paso intuitivo y optimizado para conversión
   - Integración de varios métodos de pago (tarjeta, transferencia, etc.)
   - Selección de fechas/horarios de entrega con calendario interactivo
   - Aplicación de cupones y descuentos con validación en tiempo real
   - Mapas interactivos para selección de dirección de entrega
   - Confirmación de pedido con animaciones y resumen claro

4. **Experiencias y Calendario**:
   - Calendario interactivo con visualización de disponibilidad
   - Filtrado y búsqueda avanzada de experiencias por categoría/fecha
   - Proceso de reserva integrado con selección de participantes
   - Detalles expandibles con galería de imágenes y mapas
   - Compartir en redes sociales y agregar al calendario personal

5. **Sistema de Contacto y Soporte**:
   - Formulario inteligente con validación y ruteo por departamento
   - Mapa interactivo con ubicaciones y puntos de interés
   - FAQ expandible organizada por categorías con búsqueda
   - Chat en vivo integrado para soporte inmediato
   - Sistema de tickets y seguimiento de consultas

6. **Arquitectura UI Global**:
   - Implementación completa de shadcn/ui adaptada a Arca Tierra
   - Sistema de tema oscuro/claro con detección de preferencias
   - Toasts/alertas/notificaciones reutilizables en toda la app
   - Componentes de navegación (header, footer, sidebar) consistentes
   - Animaciones y transiciones optimizadas con Framer Motion
   - Arquitectura de componentes escalable y mantenible

## Características Destacadas del Demo Next.js

### 1. Componentes de UI y Animaciones
- **HeroSection**: Implementación avanzada con video de fondo, soporte para controles multimedia y animaciones secuenciales
- **Navigation**: Menú responsive con efectos de transición, soporte para dropdowns, y estado basado en scroll
- **EnhancedSections**: Componentes para secciones de inicio con efectos visuales y animaciones usando Framer Motion
- **Confetti**: Efectos visuales para celebraciones (confirmaciones, logros)
- **Skeletons**: Estados de carga optimizados para diferentes componentes
- **Toast**: Sistema de notificaciones contextual con diferentes tipos (éxito, error, info)

### 2. Gestión de Estado y Contextos
- **AuthContext**: Sistema completo de autenticación con manejo de usuario, niveles y badges
- **CartContext**: Carrito de compra con persistencia local y cálculo de impacto ambiental
- **CartSidebar**: Panel lateral para gestionar el carrito con mensajes motivacionales rotatorios

### 3. Páginas y Funcionalidades
- **Tienda**: Filtros avanzados, ordenamiento, búsqueda y visualización de productos
- **Experiencias**: Sistema de reserva con calendario, disponibilidad y gestión de slots
- **Producto Detalle**: Página de detalle con galería, descripción, recomendaciones e impacto ambiental

### 4. Integración de Datos
- **API n8n Centralizada**: Arquitectura para acceso a datos a través del orquestador n8n
- **Funciones Reusables**: Consulta de productos, experiencias, categorías y productores desde PostgreSQL a través de n8n

### 5. Componentes de Experiencia de Usuario
- **ExperienceCalendar**: Calendario interactivo para reserva de experiencias
- **ProductGrid/ProductCard**: Visualización atractiva de productos con animaciones
- **FilterSidebar**: Panel de filtros avanzados para búsqueda de productos

### 6. Características para Fidelización
- **Sistema de Niveles**: Gamificación con niveles de usuario basados en puntos
- **Badges**: Sistema de logros y reconocimientos para usuarios
- **Impacto Ambiental**: Cálculo y visualización de métricas de impacto
