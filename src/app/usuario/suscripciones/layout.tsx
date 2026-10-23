import type { Metadata } from 'next'

// R11b · ACC1: la página de Mis suscripciones es de cliente; la metadata vive aquí (Server Component).
export const metadata: Metadata = {
  title: 'Mis suscripciones',
  robots: { index: false, follow: false },
}

export default function MisSuscripcionesLayout({ children }: { children: React.ReactNode }) {
  return children
}
