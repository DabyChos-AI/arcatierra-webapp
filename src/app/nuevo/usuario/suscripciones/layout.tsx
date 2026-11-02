import type { Metadata } from 'next'

// R15 v2 · F6 (compras): la misma `metadata` de hoy (`src/app/usuario/suscripciones/layout.tsx:4-7`).
export const metadata: Metadata = {
  title: 'Mis suscripciones',
  robots: { index: false, follow: false },
}

export default function MisSuscripcionesLayout({ children }: { children: React.ReactNode }) {
  return children
}
