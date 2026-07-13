'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'lead' | 'body';
}

const variantClasses = {
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold',
  h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold',
  h3: 'text-xl sm:text-2xl md:text-3xl font-heading font-semibold',
  h4: 'text-lg sm:text-xl md:text-2xl font-heading font-semibold',
  lead: 'text-lg sm:text-xl md:text-2xl font-normal leading-relaxed',
  body: 'text-sm sm:text-base md:text-lg'
};

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  as,
  variant = 'body'
}) => {
  const Component = as || (variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p');
  
  return React.createElement(
    Component,
    { className: cn(variantClasses[variant], className) },
    children
  );
};

// Exports con alias para uso directo
export const H1 = (props: Omit<ResponsiveTextProps, 'variant'>) => 
  <ResponsiveText {...props} variant="h1" as="h1" />;
  
export const H2 = (props: Omit<ResponsiveTextProps, 'variant'>) => 
  <ResponsiveText {...props} variant="h2" as="h2" />;
  
export const H3 = (props: Omit<ResponsiveTextProps, 'variant'>) => 
  <ResponsiveText {...props} variant="h3" as="h3" />;
  
export const H4 = (props: Omit<ResponsiveTextProps, 'variant'>) => 
  <ResponsiveText {...props} variant="h4" as="h4" />;

export const LeadText = (props: Omit<ResponsiveTextProps, 'variant'>) => 
  <ResponsiveText {...props} variant="lead" />;
  
export const BodyText = (props: Omit<ResponsiveTextProps, 'variant'>) => 
  <ResponsiveText {...props} variant="body" />;
