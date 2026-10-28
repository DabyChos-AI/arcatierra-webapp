// R15 · F1 (WF1 + WF7, sesión 54): una cifra publicada de contenido_sitio (sección `cifras`, por clave): el valor con la letra de
// títulos y su descripción debajo. Si la clave no está publicada → la marca (contrato C9/C15: no se inventa ninguna cifra).
// Componente de servidor. testid estable: `sn-cifra-<clave>` (con `data-publicada="1|0"`).
import type { DatosCifra } from '@/types/contenido-sitio'
import Falta from './Falta'

export default function Cifra({ clave, cifra }: { clave: string; cifra: DatosCifra | undefined }) {
  if (!cifra) {
    return (
      <div data-testid={`sn-cifra-${clave}`} data-publicada="0" className="border-t border-sn-borde pt-4">
        <Falta que={`cifra «${clave}»`} quien="Lucio y Pablo" />
      </div>
    )
  }
  return (
    <div data-testid={`sn-cifra-${clave}`} data-publicada="1" className="border-t border-sn-borde pt-4">
      <p className="font-sn-titulos text-[44px] leading-none tracking-[-1px] text-sn-terra">{cifra.valor}</p>
      <p className="mt-2 text-sm leading-[1.5] text-sn-tinta/80">{cifra.descripcion}</p>
    </div>
  )
}
