import type { Metadata } from 'next'

// TEL3: /contacto es 'use client' (el formulario), así que su título y descripción viven aquí (Server Component).
// El layout raíz agrega « | ArcaTierra» al título.
const DESCRIPCION =
  'Escríbenos o llámanos: dudas sobre pedidos, canastas, suscripciones y experiencias en las chinampas de Xochimilco. ' +
  'También por WhatsApp, Instagram, Facebook y TikTok.'

export const metadata: Metadata = {
  title: 'Contacto',
  description: DESCRIPCION,
  alternates: { canonical: '/contacto' },
  openGraph: {
    title: 'Contacto | ArcaTierra',
    description: DESCRIPCION,
    url: '/contacto',
  },
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
