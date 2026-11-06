import type { Metadata } from 'next'

// R15 v2 · F7 (google): lo que lee Google de las páginas del sitio nuevo (contrato v2 §8-F7, D-F7-04, D-F7-09, D-F7-16, D-F7-18, D-F7-24,
// D-F7-25; cadena-v2/f7/google-F7.md). Solo `metadata` sacada de la página de hoy que cada una reemplaza: nada visible cambia y ninguna
// imagen que no exista (D-5, ROG1). `f7-google/pruebas/metadatos-contra-hoy.mjs` la compara con la de hoy, llave por llave. Las direcciones
// relativas salen con el `metadataBase` del layout raíz (`src/app/layout.tsx:65`).

/** `alternates.canonical` = la dirección pública de la propia página (D-F7-16 P-2; el `'/'` heredado del layout raíz no se copia). */
export function canonicalDe(direccion: string): Metadata['alternates'] {
  return { canonical: direccion }
}

const TITULO_TIENDA = 'Tienda de Alimentos Agroecológicos 100% Mexicanos | Arca Tierra'
const DESCRIPCION_TIENDA =
  'Alimentos agroecológicos directo del campo mexicano. Compra canastas frescas de Xochimilco, Huasca de Ocampo y Amanalco. Hiperlocalidad regenerativa que apoya a 60+ familias campesinas.'
const URL_TIENDA = 'https://arcatierra.com/tienda'
const NOMBRE_SITIO_TIENDA = 'Arca Tierra'

/**
 * `/tienda`: la de hoy (`src/app/tienda/layout.tsx:7-89`, `generateMetadata` sin datos) llave por llave, SIN las tres imágenes que no existen en
 * `public/` (`openGraph.images` :45-58 y `twitter.images` :68; D-5). El título va `absolute` con el texto final de hoy (como F3; la de hoy pasa
 * por la plantilla del layout raíz). El `viewport` de hoy (:93-99) no es `metadata` y no pasa (D-F7-16 P-7).
 */
export const METADATA_TIENDA: Metadata = {
  title: { absolute: `${TITULO_TIENDA} | ArcaTierra` },
  description: DESCRIPCION_TIENDA,
  keywords: [
    'productos orgánicos México',
    'alimentos agroecológicos',
    'canastas verduras frescas',
    'agricultura regenerativa',
    'Xochimilco chinampas',
    'Huasca de Ocampo verduras',
    'Amanalco frutas orgánicas',
    'comercio justo campesino',
    'hiperlocalidad alimentaria',
    'suscripción canasta orgánica',
    'trazabilidad alimentos',
    'productores locales México',
    'CDMX delivery orgánico',
    'agricultura sin químicos',
  ].join(', '),
  authors: [{ name: 'Red Arca Tierra' }],
  creator: 'Arca Tierra',
  publisher: 'Red de Agricultura Regenerativa Arca Tierra',
  robots: 'index, follow, max-image-preview:large',
  category: 'Ecommerce Alimentario',
  openGraph: {
    title: TITULO_TIENDA,
    description: DESCRIPCION_TIENDA,
    url: URL_TIENDA,
    siteName: NOMBRE_SITIO_TIENDA,
    type: 'website',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO_TIENDA,
    description: DESCRIPCION_TIENDA,
    site: '@arcatierra',
    creator: '@arcatierra',
  },
  alternates: {
    canonical: URL_TIENDA,
    languages: {
      'es-MX': URL_TIENDA,
      'es': URL_TIENDA,
    },
  },
  other: {
    'geo.region': 'MX-CMX',
    'geo.placename': 'Ciudad de México',
    'geo.position': '19.432608;-99.133209',
    'ICBM': '19.432608, -99.133209',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

/**
 * `/nosotros`: el `title` de F5 (D-F5-13 P-14) + el `openGraph` (:9-21) y el `alternates` (:22-24) de hoy (`src/app/nosotros/page.tsx`), letra
 * por letra; sin la `description` de primer nivel de hoy (:7), que queda la del layout raíz (D-F7-16 P-3, P-5; D-F7-25 P-3).
 */
export const METADATA_NOSOTROS: Metadata = {
  title: 'Nosotros',
  openGraph: {
    title: 'Nosotros | Arca Tierra - Historia, Misión y Equipo',
    description: 'Conoce la historia de Arca Tierra, nuestra misión de regenerar suelos y conservar chinampas con más de 50 familias campesinas.',
    url: 'https://www.arcatierra.com/nosotros',
    images: [
      {
        url: '/logo-arcatierra.png',
        width: 1200,
        height: 630,
        alt: 'Equipo Arca Tierra en las chinampas de Xochimilco',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.arcatierra.com/nosotros',
  },
}

/**
 * `/chinampas`: el `title` de F5 (D-F5-13 P-14), la `description` de `/xochimilco` de hoy (`src/app/xochimilco/page.tsx:7`, letra por letra;
 * la dirección vieja lleva aquí, D-F7-15) y su `canonical`. Sin `openGraph` propio: hereda el del layout raíz (D-F7-18).
 */
export const METADATA_CHINAMPAS: Metadata = {
  title: 'Chinampas de Xochimilco',
  description:
    'Descubre las chinampas de Xochimilco, patrimonio de la humanidad. Conoce este sistema agrícola ancestral mexicano y cómo Arca Tierra las conserva con agricultura regenerativa.',
  alternates: canonicalDe('/chinampas'),
}

/** `/catering`: `title` = el `h1` de hoy (`src/components/catering/Hero.tsx:44`; CTG10, D-F7-24) y su `canonical`. Sin descripción (no existe). */
export const METADATA_CATERING: Metadata = {
  title: 'Catering consciente CDMX',
  alternates: canonicalDe('/catering'),
}
