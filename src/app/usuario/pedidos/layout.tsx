import type { Metadata } from 'next'

// R11b · ACC1: las páginas de Mis pedidos son de cliente; la metadata vive aquí (Server Component).
export const metadata: Metadata = {
  title: 'Mis pedidos',
  robots: { index: false, follow: false },
}

export default function MisPedidosLayout({ children }: { children: React.ReactNode }) {
  return children
}
