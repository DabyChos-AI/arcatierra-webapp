import type { Metadata } from 'next'
import HeroeRecetas from '@/components/sitio-nuevo/recetas/HeroeRecetas'
import RecetaSemana from '@/components/sitio-nuevo/recetas/RecetaSemana'
import ListaRecetas from '@/components/sitio-nuevo/recetas/ListaRecetas'
import ConsejosRecetas from '@/components/sitio-nuevo/recetas/ConsejosRecetas'
import CierreRecetas from '@/components/sitio-nuevo/recetas/CierreRecetas'

// R15 v2 · F5 (recetas, sesión 63): `/recetas` del sitio nuevo, la página `data-page="recetas"` de la maqueta (contrato v2 D-F5-03,
// D-F5-12; cadena-v2/f5/recetas-F5.md §2). Entra invisible: su dirección la agrega historia al final. Las 23 recetas salen de
// `src/data/recetas.ts` importado (D-F5-04); «Ver Receta» lleva a la página de hoy de cada una (C44). Estática: 0 llamadas a la API.
// Metadatos de hoy (`src/app/recetas/page.tsx:4-28`): el título sin «- Arca Tierra» (la plantilla del layout raíz ya pone la marca) y sin la
// imagen de `openGraph`, que no existe en `public/` (D-F5-12 P-8, hallazgo H-2).
export const metadata: Metadata = {
  title: 'Recetas Agroecológicas',
  description:
    'Descubre recetas deliciosas y sustentables con ingredientes agroecológicos. Aprovecha cada parte de las plantas y conecta con técnicas ancestrales de cocina.',
  keywords: [
    'recetas agroecológicas',
    'cocina sustentable',
    'aprovechamiento integral',
    'verduras de temporada',
    'fermentación',
    'comida orgánica',
    'técnicas ancestrales',
  ],
  openGraph: {
    title: 'Recetas Agroecológicas - Arca Tierra',
    description: 'Descubre recetas deliciosas y sustentables con ingredientes agroecológicos',
  },
}

export default function Page() {
  return (
    <main data-testid="sn-recetas">
      <HeroeRecetas />
      <RecetaSemana />
      <ListaRecetas />
      <ConsejosRecetas />
      <CierreRecetas />
    </main>
  )
}
