import React from 'react';
import Image from 'next/image';

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
}

/**
 * Hosts remotos que el optimizador de Next acepta (deben coincidir con `images.remotePatterns` de
 * `next.config.js`, M5 · R7). `api.dabychos.com` solo bajo `/uploads/`.
 */
const HOSTS_OPTIMIZABLES: ReadonlyArray<{ host: string; prefijo?: string }> = [
  { host: 'images.unsplash.com' },
  { host: 'res.cloudinary.com' },
  { host: 'flagcdn.com' },
  { host: 'lh3.googleusercontent.com' },
  { host: 'api.dabychos.com', prefijo: '/uploads/' },
];

/**
 * ¿El optimizador de Next puede servir esta imagen? Rutas locales (empiezan con UNA «/», sin «?»:
 * `public/` y `/uploads/**`, que resuelve `app/uploads/[...path]/route.ts`) y los hosts de arriba
 * por https.
 * Todo lo demás (otros hosts, rutas relativas, data:, blob:) va con `unoptimized`: si no, el
 * optimizador responde 400 y la imagen no se ve.
 */
export function puedeOptimizar(src: string): boolean {
  if (!src) return false;
  // Local: una sola «/» inicial y sin «?» (§9 C1 del contrato R7).
  if (src.startsWith('/')) return !src.startsWith('//') && !src.includes('?');
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  return HOSTS_OPTIMIZABLES.some(
    ({ host, prefijo }) => url.hostname === host && (!prefijo || url.pathname.startsWith(prefijo)),
  );
}

/**
 * Imagen del sitio (M5 · R7).
 * - `fill` → `next/image` con `fill` y `sizes` (por omisión '100vw'); el padre debe ser relativo.
 *   Conserva el `object-fit: cover` que el componente siempre puso.
 * - `width` y `height` → `next/image` con ese tamaño.
 * - Sin tamaño → `<img>` como antes (no se cambia el layout a ciegas).
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority,
  quality,
  sizes,
  style = {},
  onClick,
  onLoad,
  onError,
  itemProp,
  loading,
  decoding = 'async',
}: OptimizedImageProps) {
  const unoptimized = !puedeOptimizar(src);
  // next/image lanza error con `priority` + `loading="lazy"`: con priority no se manda loading.
  const loadingImagen = priority ? undefined : loading;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '100vw'}
        className={className}
        style={{ objectFit: 'cover', ...style }}
        priority={priority}
        quality={quality}
        loading={loadingImagen}
        unoptimized={unoptimized}
        itemProp={itemProp}
        onClick={onClick}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  if (typeof width === 'number' && typeof height === 'number') {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        style={style}
        priority={priority}
        quality={quality}
        loading={loadingImagen}
        unoptimized={unoptimized}
        itemProp={itemProp}
        onClick={onClick}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  // Sin tamaño conocido: <img> nativo, igual que antes de M5.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      itemProp={itemProp}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      decoding={decoding}
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
    />
  );
}
