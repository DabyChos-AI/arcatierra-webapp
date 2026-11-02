import MisPedidos from '@/components/sitio-nuevo/compras/MisPedidos'

// R15 v2 · F6 (compras): `/usuario/pedidos` del sitio nuevo (D-F6-03; la dirección la entrega cuenta en E2). Estática como la de hoy: los
// pedidos los pide el navegador con la sesión. Va dentro del marco de Mi cuenta (`src/app/nuevo/usuario/layout.tsx`, de cuenta, D-F6-08 P-1).
export default function PaginaMisPedidos() {
  return <MisPedidos />
}
