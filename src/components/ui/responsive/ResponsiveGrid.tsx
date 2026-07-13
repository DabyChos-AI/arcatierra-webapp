'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'products' | 'cards' | 'features' | 'stats' | 'gallery';
  gap?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  // ProductCard, ExperienceCard
  products: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // Tarjetas generales
  cards: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  // Features, beneficios
  features: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  // Stats, métricas
  stats: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  // Galería imágenes
  gallery: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
};

const gapClasses = {
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8'
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  variant = 'cards',
  gap = 'md'
}) => {
  return (
    <div className={cn(
      'grid',
      variantClasses[variant],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};
