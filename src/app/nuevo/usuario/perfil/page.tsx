import PaginaDatos from '@/components/sitio-nuevo/cuenta/PaginaDatos'

// R15 v2 · F6 (cuenta, sesión 64): `/usuario/perfil` del sitio nuevo (la pestaña «Mi perfil» de Mi cuenta; D-F6-11 P-11). Dentro del marco
// (`../layout.tsx`). Sin `metadata` (hoy la página no exporta una) y sin datos del cliente en el servidor (D-F6-10 P-5).
export default function Page() {
  return <PaginaDatos />
}
