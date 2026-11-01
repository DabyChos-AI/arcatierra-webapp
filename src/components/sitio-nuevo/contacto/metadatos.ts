import type { Metadata } from 'next'

// R15 v2 · F5 (contacto): la `metadata` de /contacto de hoy (`src/app/contacto/layout.tsx:5-18`, que no la exporta), para la página nueva.
// D-F5-11 P-15. `f5-contacto/pruebas/metadatos-contra-hoy.mjs` la compara con la de hoy, llave por llave. El layout raíz agrega
// « | ArcaTierra» al título; el `robots: noindex` de `src/app/nuevo/layout.tsx` se queda (Next une las dos).
const DESCRIPCION =
  'Escríbenos o llámanos: dudas sobre pedidos, canastas, suscripciones y experiencias en las chinampas de Xochimilco. ' +
  'También por WhatsApp, Instagram, Facebook y TikTok.'

export const METADATA_CONTACTO: Metadata = {
  title: 'Contacto',
  description: DESCRIPCION,
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: 'Contacto | ArcaTierra',
    description: DESCRIPCION,
    url: '/contacto',
  },
}
