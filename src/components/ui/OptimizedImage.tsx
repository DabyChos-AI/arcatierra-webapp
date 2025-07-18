import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagen optimizado para Netlify
 * Reemplaza next/image con img nativo para evitar errores de optimización
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  style = {},
  onClick,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  // Si es fill, usar estilos de posicionamiento absoluto
  const fillStyles = fill ? {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  } : {};

  // Combinar estilos
  const combinedStyles = {
    ...fillStyles,
    ...style,
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={combinedStyles}
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}
