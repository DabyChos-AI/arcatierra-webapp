import type { Metadata } from 'next'

// R11b · ACC1: la página es de cliente; la metadata vive aquí (Server Component). No se indexa (robots.ts bloquea /auth/).
export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  robots: { index: false, follow: false },
}

export default function RecuperarLayout({ children }: { children: React.ReactNode }) {
  return children
}
