import type { Metadata } from 'next'
import ListaExperiencias from '@/components/sitio-nuevo/experiencias/ListaExperiencias'
import { canonicalDe } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F4 (sesión 62): la lista de experiencias del sitio nuevo, en `/experiencias` (RUTAS_SITIO_NUEVO de src/lib/sitio-nuevo.ts; solo se
// ve con ARCA_SITIO_NUEVO=1). Contrato v2 §9-F4 D-F4-03, D-F4-12, D-F4-13; cadena-v2/f4/experiencias-F4.md §2.
// Título y `robots` = los de hoy (src/app/experiencias/page.tsx es de cliente y no exporta título: los del layout raíz); F7 solo agrega su
// `canonical` (D-F7-16 P-2). Estática: los datos los pide la lista en el navegador (D-F2-03).
export const metadata: Metadata = { alternates: canonicalDe('/experiencias') }

export default function ExperienciasNueva() {
  return <ListaExperiencias />
}
