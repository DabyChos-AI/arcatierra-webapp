'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-3xl',     // 768px - Contenido estrecho
  md: 'max-w-5xl',     // 1024px - Formularios
  lg: 'max-w-7xl',     // 1280px - ESTÁNDAR Arcatierra
  xl: 'max-w-[1400px]', // Extra ancho
  full: 'max-w-full'   // Sin límite
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'lg'
}) => {
  return (
    <div className={cn(
      sizeClasses[size],
      'mx-auto px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
};
