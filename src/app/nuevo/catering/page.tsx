import type { Metadata } from 'next'
import CotizarCatering from '@/components/sitio-nuevo/catering/CotizarCatering'
import HeroeCatering from '@/components/sitio-nuevo/catering/HeroeCatering'
import PlanificaCatering from '@/components/sitio-nuevo/catering/PlanificaCatering'
import RazonesCatering from '@/components/sitio-nuevo/catering/RazonesCatering'
import TiposCatering from '@/components/sitio-nuevo/catering/TiposCatering'
import { METADATA_CATERING } from '@/components/sitio-nuevo/google/metadatos'

// R15 v2 · F4 (catering): /catering del sitio nuevo (maqueta `[data-page="catering"]`, 4 bloques, más el de lo que hoy tiene /catering y la
// maqueta no trae). Contrato v2 §8-F4 y §9-F4 D-F4-03, D-F4-04, D-F4-09, D-F4-10; cadena-v2/f4/catering-F4.md.
// Se ve en /catering (y solo en el link de revisión) cuando la entrega de direcciones de experiencias agregue la dirección (D-F4-03);
// /catering/contacto se queda como hoy (C44). Página estática, sin datos de la API en el servidor (D-F2-03). F7: título = el `h1` de hoy
// (CTG10) y su `canonical` (`sitio-nuevo/google/metadatos.ts`).
export const metadata: Metadata = METADATA_CATERING

export default function CateringNuevo() {
  return (
    <main data-testid="sn-catering">
      <HeroeCatering />
      <RazonesCatering />
      <TiposCatering />
      <CotizarCatering />
      <PlanificaCatering />
    </main>
  )
}
