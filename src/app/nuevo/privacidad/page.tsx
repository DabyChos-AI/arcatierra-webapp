import type { Metadata } from 'next'
import AvisoPrivacidad from '@/components/sitio-nuevo/legal/AvisoPrivacidad'
import PaginaLegal from '@/components/sitio-nuevo/legal/PaginaLegal'
import PoliticaCookies from '@/components/sitio-nuevo/legal/PoliticaCookies'

// R15 v2 · F5 (contacto · legales): /privacidad del sitio nuevo (hoy «Página en construcción...»): el aviso de privacidad y la sección de
// cookies (`#cookies`). Contrato v2 §8-F5 y §9-F5 D-F5-03, D-F5-06, D-F5-11; cadena-v2/f5/contacto-F5.md §3. Se ve en /privacidad (solo en el
// link de revisión) cuando la entrega de direcciones de historia agregue la dirección. Página estática, sin llamadas.
// `title` y `h1` = el `h1` de hoy, «Política de Privacidad» (`src/app/privacidad/page.tsx:4`; P-15).
export const metadata: Metadata = { title: 'Política de Privacidad' }

export default function PrivacidadNueva() {
  return (
    <PaginaLegal documento="privacidad" titulo="Política de Privacidad">
      <AvisoPrivacidad />
      <PoliticaCookies />
    </PaginaLegal>
  )
}
