import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §3.1, §4): párrafos en Inter con la escala de la maqueta (17 · 16 · 14 · 13 px, tracking −0.3 px; la
// maqueta escribe la prosa en peso 300). `ink-suave` = ink al 70 % (`.sub-success-text`): solo sobre warm o white (4.81 · 5.24); sobre
// cream no llega a 4.5.

const TAMANOS = {
  grande: 'text-sn-cuerpo-lg',
  normal: 'text-sn-cuerpo',
  chico: 'text-sn-cuerpo-sm',
  mini: 'text-sn-cuerpo-xs',
} as const

const PESOS = { ligero: 'font-light', normal: 'font-normal', medio: 'font-medium' } as const

const TONOS = {
  ink: 'text-sn-ink',
  'ink-suave': 'text-sn-ink/70',
  warm: 'text-sn-warm',
  white: 'text-white',
} as const

type Props = {
  tamano?: keyof typeof TAMANOS
  peso?: keyof typeof PESOS
  tono?: keyof typeof TONOS
  /** Ancho máximo de párrafo (620 px, `.simple-hero-sub`). */
  ancho?: 'parrafo'
  as?: 'p' | 'span' | 'div' | 'li'
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Texto({
  tamano = 'normal',
  peso = 'ligero',
  tono = 'ink',
  ancho,
  as: Elemento = 'p',
  testId = 'sn-texto',
  className,
  children,
}: Props) {
  return (
    <Elemento
      data-testid={testId}
      className={unirClases('m-0 font-sn-texto', TAMANOS[tamano], PESOS[peso], TONOS[tono], ancho === 'parrafo' && 'max-w-sn-parrafo', className)}
    >
      {children}
    </Elemento>
  )
}
