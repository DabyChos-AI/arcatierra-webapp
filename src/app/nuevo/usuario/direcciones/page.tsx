import PaginaDirecciones from '@/components/sitio-nuevo/cuenta/PaginaDirecciones'

// R15 v2 · F6 (cuenta, sesión 64): `/usuario/direcciones` del sitio nuevo (D-F6-11 P-8; hoy 404 con sesión). Dentro del marco de Mi cuenta
// (`../layout.tsx`). Sin datos del cliente en el servidor (D-F6-10 P-5): todo se pide en el navegador.
export default function Page() {
  return <PaginaDirecciones />
}
