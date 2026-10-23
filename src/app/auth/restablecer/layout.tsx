import type { Metadata } from 'next'

// R11b · ACC1: la URL trae el token de recuperación (una credencial). `referrer: no-referrer` → <meta name="referrer"
// content="no-referrer">: ninguna liga ni recurso de esta página manda la URL con el token en el Referer.
export const metadata: Metadata = {
  title: 'Crear contraseña nueva',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
}

export default function RestablecerLayout({ children }: { children: React.ReactNode }) {
  return children
}
