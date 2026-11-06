import type { Metadata } from 'next'
import HeroeFaq from '@/components/sitio-nuevo/faq/HeroeFaq'
import CategoriasFaq from '@/components/sitio-nuevo/faq/CategoriasFaq'
import ContactoFaq from '@/components/sitio-nuevo/faq/ContactoFaq'
import { canonicalDe } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F5 (recetas, sesión 63): `/faq` del sitio nuevo, la página `data-page="faq"` de la maqueta (hoy no existe: sigue 404 en
// producción). Entra invisible: su dirección la agrega historia al final (D-F5-03). La parte de experiencias = `src/data/faq.ts` importado con
// las reglas firmadas (D-F5-04, D-F5-12); `/experiencias/faq` sigue con su página de hoy (C44). Estática, sin llamadas a la API.
// Título = el `<h1>` de hoy (`src/app/experiencias/faq/page.tsx:39`; hoy esa página no tiene título propio).
export const metadata: Metadata = { title: 'Preguntas Frecuentes', alternates: canonicalDe('/faq') }

export default function Page() {
  return (
    <main data-testid="sn-faq">
      <HeroeFaq />
      <CategoriasFaq />
      <ContactoFaq />
    </main>
  )
}
