import type { Metadata } from 'next'

// Portal del cliente (G1, R9, sesión 49). La página es de cliente; la metadata vive aquí (Server Component).
// El link es una credencial (abre la reserva de un cliente): nunca se indexa (también `robots.ts` y la API con X-Robots-Tag).
// `absolute`: el layout raíz trae la plantilla «%s | ArcaTierra» y el título saldría con la marca dos veces.
export const metadata: Metadata = {
  title: { absolute: 'Tu reserva · Arca Tierra' },
  robots: { index: false, follow: false },
}

export default function ReservaPortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
