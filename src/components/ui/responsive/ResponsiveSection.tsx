'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'white' | 'gray' | 'gradient' | 'none';
}

const spacingClasses = {
  xs: 'py-4 sm:py-6 md:py-8',
  sm: 'py-8 sm:py-10 md:py-12',
  md: 'py-8 sm:py-12 md:py-16',
  lg: 'py-12 sm:py-16 md:py-20',
  xl: 'py-16 sm:py-20 md:py-24 lg:py-28'
};

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-neutro-claro',
  gradient: 'bg-gradient-to-br from-verde-principal to-verde-oscuro',
  none: ''
};

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  className = '',
  spacing = 'md',
  background = 'none'
}) => {
  return (
    <section className={cn(
      spacingClasses[spacing],
      backgroundClasses[background],
      className
    )}>
      {children}
    </section>
  );
};
