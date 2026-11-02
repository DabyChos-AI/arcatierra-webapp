import type { Metadata } from 'next'
import Recuperar from '@/components/sitio-nuevo/acceso/Recuperar'
import { METADATA_RECUPERAR } from '@/components/sitio-nuevo/acceso/metadatos'

// R15 v2 · F6 (acceso): /auth/recuperar del sitio nuevo (R11b · ACC1). Contrato v2 §8-F6, D-F6-03, D-F6-04, D-F6-09, D-F6-10 P-5;
// cadena-v2/f6/acceso-F6.md §4.1. Invisible hasta la entrega de direcciones de cuenta (D-F6-03). Página estática; la `metadata` es la de hoy.
export const metadata: Metadata = METADATA_RECUPERAR

export default function RecuperarNuevo() {
  return (
    <main data-testid="sn-acceso" data-pagina="recuperar">
      <Recuperar />
    </main>
  )
}
