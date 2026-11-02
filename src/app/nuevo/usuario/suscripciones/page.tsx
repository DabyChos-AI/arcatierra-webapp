import MisSuscripciones from '@/components/sitio-nuevo/compras/MisSuscripciones'

// R15 v2 · F6 (compras): `/usuario/suscripciones` del sitio nuevo (D-F6-03; la dirección la entrega cuenta en E2). Estática como la de hoy:
// las suscripciones y su próxima canasta las pide el navegador con la sesión. Va dentro del marco de Mi cuenta (de cuenta, D-F6-08 P-1).
export default function PaginaMisSuscripciones() {
  return <MisSuscripciones />
}
