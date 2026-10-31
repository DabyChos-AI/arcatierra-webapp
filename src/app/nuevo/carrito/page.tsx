import type { Metadata } from 'next'
import PaginaCarrito from '@/components/sitio-nuevo/carrito/PaginaCarrito'

// R15 · F3 v2 (carrito, sesión 61): `/carrito` del sitio nuevo (D-F3-04: hoy no existe y sigue 404 en producción). La página la arma
// `PaginaCarrito` en el navegador (el carrito vive en localStorage); el servidor pinta el «cargando». Título «Carrito» (D-F3-20 P-9).
export const metadata: Metadata = { title: 'Carrito' }

export default function Page() {
  return <PaginaCarrito />
}
