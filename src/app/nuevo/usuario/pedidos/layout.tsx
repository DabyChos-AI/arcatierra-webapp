import type { Metadata } from 'next'

// R15 v2 · F6 (compras): la misma `metadata` de hoy (`src/app/usuario/pedidos/layout.tsx:4-7`); vale también para el detalle, como hoy.
export const metadata: Metadata = {
  title: 'Mis pedidos',
  robots: { index: false, follow: false },
}

export default function MisPedidosLayout({ children }: { children: React.ReactNode }) {
  return children
}
