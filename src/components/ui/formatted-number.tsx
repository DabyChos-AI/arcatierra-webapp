'use client';

import React from 'react';

interface FormattedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) => {
  // Formatea el número con el número especificado de decimales
  // y añade separadores de miles
  const formattedValue = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};
