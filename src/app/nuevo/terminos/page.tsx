import type { Metadata } from 'next'
import PaginaLegal from '@/components/sitio-nuevo/legal/PaginaLegal'
import TerminosCondiciones from '@/components/sitio-nuevo/legal/TerminosCondiciones'
import { canonicalDe } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F5 (contacto · legales): /terminos del sitio nuevo (hoy «Página en construcción...»). Contrato v2 §8-F5 y §9-F5 D-F5-03, D-F5-06,
// D-F5-11; cadena-v2/f5/contacto-F5.md §3. Se ve en /terminos (solo en el link de revisión) cuando la entrega de direcciones de historia
// agregue la dirección. Página estática, sin llamadas. `title` y `h1` = el `h1` de hoy, «Términos y Condiciones» (`src/app/terminos/page.tsx:4`).
export const metadata: Metadata = { title: 'Términos y Condiciones', alternates: canonicalDe('/terminos') }

export default function TerminosNuevos() {
  return (
    <PaginaLegal documento="terminos" titulo="Términos y Condiciones">
      <TerminosCondiciones />
    </PaginaLegal>
  )
}
