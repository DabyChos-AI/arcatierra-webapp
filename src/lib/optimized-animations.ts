/**
 * Biblioteca de animaciones optimizada - reduce el tamaño del bundle de framer-motion
 * Solo importa lo que realmente usamos en lugar de toda la biblioteca
 */

import React, { useRef, useEffect, type RefObject } from 'react';

// Importaciones esenciales de framer-motion únicamente
import { 
  motion, 
  AnimatePresence,
  useInView,
  useAnimation,
  useScroll,
  useTransform,
  type Variants 
} from 'framer-motion';

// Variantes de animación comunes para reutilización
export const apareceDesdeAbajo: Variants = {
  oculto: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export const aparecer: Variants = {
  oculto: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const deslizarDesdeIzquierda: Variants = {
  oculto: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export const deslizarDesdeDerecha: Variants = {
  oculto: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export const escalarEntrada: Variants = {
  oculto: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const contenedorEscalonado: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animaciones basadas en CSS para mejor rendimiento cuando sea posible
export const animacionesCSS = {
  aparecer: 'animate-fade-in',
  deslizarArriba: 'animate-slide-up',
  rebote: 'animate-bounce-in',
};

// Exportar componentes de motion
export { motion, AnimatePresence, useInView, useAnimation, useScroll, useTransform };

// Hook de animación simplificado para casos comunes de uso
export const useAnimacionSimple = (umbral = 0.1) => {
  const controles = useAnimation();
  const ref = useRef(null);
  const enVista = useInView(ref, { amount: umbral });

  useEffect(() => {
    if (enVista) {
      controles.start('visible');
    }
  }, [controles, enVista]);

  return { ref, controles };
};

// Animaciones de scroll optimizadas para rendimiento
export const useScrollOptimizado = (elemento: RefObject<HTMLElement>) => {
  const { scrollYProgress } = useScroll({
    target: elemento,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacidad = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return { y, opacidad, progresoScrollY: scrollYProgress };
};
