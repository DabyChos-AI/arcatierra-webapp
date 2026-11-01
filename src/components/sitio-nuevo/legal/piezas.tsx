import Falta, { type QuienFalta } from '@/components/sitio-nuevo/Falta'

// R15 v2 · F5 (legales): las piezas de texto de los documentos legales. Cada apartado que Arca Tierra no ha dado es UNA marca (D-F5-11
// P-12 a; D-F2-05 «una marca por elemento»): su `que` nombra el apartado, sin cifras y sin los subtítulos de la maqueta.

export const TEXTO_LEGAL = 'm-0 font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink'
export const SUBTITULO_LEGAL = 'm-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-terra'

export function Apartado({ que, quien = 'David' }: { que: string; quien?: QuienFalta }) {
  return (
    <p className={TEXTO_LEGAL}>
      <Falta que={que} quien={quien} />
    </p>
  )
}
