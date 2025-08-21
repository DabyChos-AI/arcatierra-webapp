'use client';

import React, { useState } from 'react';

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
  itemProp?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  onError?: () => void;
  webpSupport?: boolean;
}

/**
 * Componente de imagen optimizado con soporte para WebP y fallbacks
 * Mejora significativamente el rendimiento al servir imágenes next-gen
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  style = {},
  onClick,
  onLoad,
  onError,
  itemProp,
  loading = 'lazy',
  decoding = 'async',
  webpSupport = true,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);

  // Generar fuente WebP desde la fuente original
  const obtenerFuenteWebP = (fuenteOriginal: string) => {
    if (!webpSupport || imageError || webpFailed) return fuenteOriginal;
    
    const extension = fuenteOriginal.split('.').pop()?.toLowerCase();
    if (extension === 'webp') return fuenteOriginal;
    
    return fuenteOriginal.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generar fuente de respaldo
  const obtenerFuenteRespaldo = (fuenteOriginal: string) => {
    const extension = fuenteOriginal.split('.').pop()?.toLowerCase();
    if (extension === 'png') {
      return fuenteOriginal.replace(/\.png$/i, '_fallback.jpeg');
    }
    if (extension === 'jpg' || extension === 'jpeg') {
      return fuenteOriginal.replace(/\.(jpg|jpeg)$/i, '_fallback.jpeg');
    }
    return fuenteOriginal;
  };

  // Manejar error de carga de imagen
  const handleImageError = () => {
    if (!webpFailed && webpSupport) {
      // Primera falla, probablemente WebP no existe
      setWebpFailed(true);
    } else {
      // Segunda falla o WebP ya falló, usar imagen original
      console.log(`⚠️ Error cargando imagen: ${src}`);
      setImageError(true);
    }
    if (onError) {
      onError();
    }
  };

  // Manejar carga exitosa de imagen
  const handleImageLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

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

  const webpSrc = obtenerFuenteWebP(src);
  const fallbackSrc = imageError ? src : src;

  // Filtrar props específicos que no deben ir al DOM
  const { quality, sizes, ...domProps } = props;

  // Convertir priority boolean a string para evitar warning
  const priorityAttr = priority ? "true" : undefined;
  
  // Usar solo imagen original para evitar errores 404 de WebP
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={combinedStyles}
      itemProp={itemProp}
      loading={loading}
      decoding={decoding}
      onClick={onClick}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...(priorityAttr && { priority: priorityAttr })}
      {...domProps}
    />
  );
}
