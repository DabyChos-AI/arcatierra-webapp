import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §3.1, §4): títulos en DM Serif Display con la escala de la maqueta. Fija letra, peso, tamaño,
// interlineado, tracking, color y margen: globals.css le pone a h1…h6 Mendoza, peso 500, color, tracking y 1.25rem de margen (L91-115),
// y todo eso se pisa aquí. El nivel (la etiqueta) y el tamaño (lo que se ve) van por separado.

const TAMANOS = {
  'hero-xl': 'text-sn-hero-xl',
  hero: 'text-sn-hero',
  h2: 'text-sn-h2',
  h3: 'text-sn-h3',
  h4: 'text-sn-h4',
  h5: 'text-sn-h5',
  h6: 'text-sn-h6',
} as const

const POR_NIVEL = { 1: 'hero', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const

const TONOS = {
  ink: 'text-sn-ink',
  terra: 'text-sn-terra',
  green: 'text-sn-green',
  warm: 'text-sn-warm',
  white: 'text-white',
} as const

type Props = {
  nivel: 1 | 2 | 3 | 4 | 5 | 6
  tamano?: keyof typeof TAMANOS
  tono?: keyof typeof TONOS
  id?: string
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Titulo({ nivel, tamano, tono = 'ink', id, testId = 'sn-titulo', className, children }: Props) {
  const Etiqueta = `h${nivel}` as const
  return (
    <Etiqueta
      data-testid={testId}
      id={id}
      className={unirClases('m-0 font-sn-titulos font-normal', TAMANOS[tamano ?? POR_NIVEL[nivel]], TONOS[tono], className)}
    >
      {children}
    </Etiqueta>
  )
}
