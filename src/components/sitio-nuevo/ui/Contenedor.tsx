import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §3.5, §4): ancho máximo y márgenes laterales del sitio nuevo. Medido en la maqueta: 1280 px en 13
// contenedores, 1200, 1100, 880 (títulos) y 620 (párrafos); relleno lateral de 40 px en escritorio y 24 px en el celular (hand-off §4),
// con el corte de la maqueta en 860 px (hand-off §10).

const ANCHOS = {
  contenido: 'max-w-sn-contenido',
  medio: 'max-w-sn-medio',
  angosto: 'max-w-sn-angosto',
  titulo: 'max-w-sn-titulo',
  parrafo: 'max-w-sn-parrafo',
} as const

type Props = {
  ancho?: keyof typeof ANCHOS
  /** Relleno lateral (24 px → 40 px desde 860 px). */
  relleno?: boolean
  as?: 'div' | 'header' | 'footer' | 'nav' | 'main' | 'article'
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Contenedor({ ancho = 'contenido', relleno = true, as: Etiqueta = 'div', testId = 'sn-contenedor', className, children }: Props) {
  return (
    <Etiqueta
      data-testid={testId}
      className={unirClases('mx-auto w-full', ANCHOS[ancho], relleno && 'px-sn-lateral-movil min-[860px]:px-sn-lateral', className)}
    >
      {children}
    </Etiqueta>
  )
}
