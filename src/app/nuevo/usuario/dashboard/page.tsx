import PaginaResumen from '@/components/sitio-nuevo/cuenta/PaginaResumen'

// R15 v2 · F6 (cuenta, sesión 64): `/usuario/dashboard` del sitio nuevo = el Resumen de Mi cuenta («Mi cuenta» del menú; D-F6-11 P-6). Dentro
// del marco (`../layout.tsx`). Sin `metadata` (hoy la página no exporta una) y sin datos del cliente en el servidor (D-F6-10 P-5).
export default function Page() {
  return <PaginaResumen />
}
