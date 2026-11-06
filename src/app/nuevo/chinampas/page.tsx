import type { Metadata } from 'next'
import ComoSumarte from '@/components/sitio-nuevo/historia/ComoSumarte'
import ElProblema from '@/components/sitio-nuevo/historia/ElProblema'
import HeroeChinampas from '@/components/sitio-nuevo/historia/HeroeChinampas'
import HistoriaChinampas from '@/components/sitio-nuevo/historia/HistoriaChinampas'
import PorQueImportan from '@/components/sitio-nuevo/historia/PorQueImportan'
import TrabajoEnLaChinampa from '@/components/sitio-nuevo/historia/TrabajoEnLaChinampa'
import { METADATA_CHINAMPAS } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F5 (historia, sesión 63): `/chinampas` del sitio nuevo, la página `data-page="chinampas"` de la maqueta (hoy no existe: sigue 404
// en producción; el contenido de hoy vive en /xochimilco, que se queda como está hasta F7, DR-7). Entra invisible: su dirección la agrega
// historia al final (D-F5-03). Orden de la maqueta con «Historia y Tradición» de hoy después del héroe (D-F5-13 P-5). Estática, sin datos
// de la API (D-F5-04). Título = el `h1` (D-F5-13 P-14).
export const metadata: Metadata = METADATA_CHINAMPAS

export default function Page() {
  return (
    <main data-testid="sn-chinampas">
      <HeroeChinampas />
      <HistoriaChinampas />
      <PorQueImportan />
      <ElProblema />
      <TrabajoEnLaChinampa />
      {/* «Cómo puedes ayudar»: lo de hoy para lo mismo (src/app/xochimilco/page.tsx:347-349, :350-352); botones en el orden de la maqueta
          con sus etiquetas de hoy (:365 → /experiencias, :359 → /tienda). */}
      <ComoSumarte
        base="sn-chinampas-ayudar"
        titulo="Apoya la Conservación de las Chinampas"
        texto="Cada producto que compras y cada experiencia que vives contribuye directamente a la conservación de este patrimonio de la humanidad."
        ligas={[
          { texto: 'Vivir la Experiencia', href: '/experiencias', testId: 'sn-chinampas-ayudar-experiencias' },
          { texto: 'Comprar Productos de Chinampas', href: '/tienda', testId: 'sn-chinampas-ayudar-tienda' },
        ]}
      />
    </main>
  )
}
