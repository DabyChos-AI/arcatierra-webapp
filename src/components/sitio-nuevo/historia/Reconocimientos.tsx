// R15 v2 · F5 (historia): el panel de sellos de Chinampas («Por qué importan») y de Nosotros («Reconocimientos»). Contrato v2 §9-F5
// D-F5-13; cadena-v2/f5/historia-F5.md §2.1 y §3.4. Componente de servidor, sin datos de la API.
// - UNESCO: la declaración de hoy, letra por letra (src/app/xochimilco/page.tsx:72-76; «1987» en la lista corta, D-F5-13 P-1 a).
// - FAO (SIPAM), RAMSAR y ANP no aparecen en ningún archivo del sitio (MAPA-CONTENIDO B §4.2, §11 #11): una marca por sello a nombre de
//   Lucio y Pablo (D-F5-06; D-F2-13 P-5). Los nombres de los sellos de la maqueta son genéricos (DR-17): no se pintan.
// Maqueta: panel cream con filete terra a la izquierda; la sigla en mono y el texto al lado.
// Sobre cream la sigla va en ink (terra chico no pasa AA ahí, CONTRATO-BASE-F1 §2.2).
import Falta from '@/components/sitio-nuevo/Falta'

const SELLOS_SIN_ORIGINAL = [
  { sello: 'fao', que: 'sello FAO (SIPAM) de las chinampas' },
  { sello: 'ramsar', que: 'sello RAMSAR de las chinampas' },
  { sello: 'anp', que: 'sello de Área Natural Protegida de las chinampas' },
] as const

type Props = {
  /** Base de los testids de cada renglón: `${base}-sello` con `data-sello`. */
  base: string
  /** testid del panel (solo donde el contrato lo fija). */
  testIdPanel?: string
  /** Las dos que mide la maqueta: dentro de «Por qué importan» (chinampas) y como sección propia (nosotros). */
  variante: 'chinampas' | 'nosotros'
}

// Medido en la maqueta (f5-historia/maqueta/medidas): chinampas = panel de radio 12 y relleno 24, renglones de 14 entre sí sin línea, sigla
// mono de 10 px en 70 px y texto de 14 px; nosotros = radio 14 y relleno 32, renglones con línea abajo (8 arriba y abajo), sigla mono de 11 px en
// 90 px y texto de 15 px. A ≤ 860 px la sigla va arriba del texto.
const PANEL = {
  chinampas: 'm-0 flex list-none flex-col gap-3.5 rounded-[12px] border-l-[3px] border-solid border-sn-terra bg-sn-cream p-6',
  nosotros: 'm-0 flex list-none flex-col gap-3.5 rounded-sn-tarjeta border-l-[3px] border-solid border-sn-terra bg-sn-cream p-6 min-[861px]:p-8',
} as const
const RENGLON = {
  chinampas: 'flex flex-col gap-1 min-[861px]:flex-row min-[861px]:items-baseline min-[861px]:gap-3.5',
  nosotros:
    'flex flex-col gap-1 border-b border-solid border-sn-border py-2 last:border-b-0 min-[861px]:grid min-[861px]:grid-cols-[90px_minmax(0,1fr)] min-[861px]:items-baseline min-[861px]:gap-6',
} as const
const SIGLA = {
  chinampas: 'shrink-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink min-[861px]:w-[70px]',
  nosotros: 'shrink-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-ink',
} as const
const TEXTO = { chinampas: 'font-sn-texto text-sn-cuerpo-sm text-sn-ink', nosotros: 'font-sn-texto text-[15px] leading-[1.55] text-sn-ink' } as const

export default function Reconocimientos({ base, testIdPanel, variante }: Props) {
  return (
    <ul data-testid={testIdPanel} className={PANEL[variante]}>
      <li data-testid={`${base}-sello`} data-sello="unesco" className={RENGLON[variante]}>
        <span className={SIGLA[variante]}>UNESCO</span>
        <span className={TEXTO[variante]}>
          En 1987, Xochimilco fue declarado Patrimonio Cultural y Natural de la Humanidad por la UNESCO, reconociendo su valor histórico,
          cultural y ecológico único.
        </span>
      </li>
      {SELLOS_SIN_ORIGINAL.map(({ sello, que }) => (
        <li key={sello} data-testid={`${base}-sello`} data-sello={sello} className={RENGLON[variante]}>
          {/* La marca ocupa el renglón entero (en Nosotros, las dos columnas de la rejilla). */}
          <span className="font-sn-texto text-sn-cuerpo-sm min-[861px]:col-span-2">
            <Falta que={que} quien="Lucio y Pablo" />
          </span>
        </li>
      ))}
    </ul>
  )
}
