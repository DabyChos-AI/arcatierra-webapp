// R15 v2 · F3 (sesión 61): los renglones de datos de la ficha (maqueta `.prod-detail-meta`). Contrato v2 §9-F3 D-F3-12, D-F3-22 (P-11);
// cadena-v2/f3/ficha-F3.md §4.2. Solo lo que existe hoy en la ficha (src/app/producto/[id]/client-page.tsx):
// - «Costo de envío: $100 | GRATIS en compras mayores a $1,000» (:444), con las cifras importadas de src/lib/envio.ts (antes escritas a
//   mano, D-11) y el formato de hoy de `formatPrice`.
// - «Empaque eco-friendly» (:335) en el renglón «Empaque» de la maqueta.
// - Cómo y cuándo se cosecha: no existe en ningún lado (F-5): marca.
// Origen, productor, contenido y frecuencia de la maqueta no se pintan (sin dato, la descripción ya es el contenido, y la ficha vende la
// compra única). Etiquetas en DM Mono 500 al 70 % de ink (4.81 sobre warm; la maqueta va al 55 % y no pasa).
import Falta from '@/components/sitio-nuevo/Falta'
import { COSTO_ENVIO, UMBRAL_ENVIO_GRATIS } from '@/lib/envio'
import { formatPrice } from '@/utils/formatters'

const RENGLON = 'grid grid-cols-1 gap-1 py-1.5 min-[861px]:grid-cols-[140px_minmax(0,1fr)] min-[861px]:gap-4'
const ETIQUETA = 'm-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink/70'
const VALOR = 'm-0 font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink'

export default function DatosFicha() {
  return (
    <div data-testid="sn-ficha-datos" className="border-t border-solid border-sn-border pt-7">
      <dl className="m-0 grid gap-[18px]">
        <div data-testid="sn-ficha-datos-envio" className={RENGLON}>
          <dt className={ETIQUETA}>Costo de envío</dt>
          <dd className={VALOR}>{`$${formatPrice(COSTO_ENVIO)} | GRATIS en compras mayores a $${formatPrice(UMBRAL_ENVIO_GRATIS)}`}</dd>
        </div>
        <div data-testid="sn-ficha-datos-empaque" className={RENGLON}>
          <dt className={ETIQUETA}>Empaque</dt>
          <dd className={VALOR}>eco-friendly</dd>
        </div>
      </dl>
      <p data-testid="sn-ficha-datos-cosecha" className="m-0 mt-[18px] py-1.5 font-sn-texto text-sn-cuerpo-xs">
        <Falta que="cómo y cuándo se cosecha" quien="Lucio y Pablo" />
      </p>
    </div>
  )
}
