import type { Metadata } from 'next'
import Restablecer from '@/components/sitio-nuevo/acceso/Restablecer'
import { METADATA_RESTABLECER } from '@/components/sitio-nuevo/acceso/metadatos'

// R15 v2 · F6 (acceso): /auth/restablecer del sitio nuevo (la liga del correo, R11b · ACC1). Contrato v2 §8-F6, D-F6-03, D-F6-04, D-F6-09,
// D-F6-10 P-5; cadena-v2/f6/acceso-F6.md §4.2. Invisible hasta la entrega de direcciones de cuenta (D-F6-03). Página estática; la `metadata` es
// la de hoy, con `referrer: 'no-referrer'` (el token de la URL es una credencial).
export const metadata: Metadata = METADATA_RESTABLECER

export default function RestablecerNuevo() {
  return (
    <main data-testid="sn-acceso" data-pagina="restablecer">
      <Restablecer />
    </main>
  )
}
