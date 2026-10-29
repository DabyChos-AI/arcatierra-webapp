import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): pastillas de estado y categoría de la maqueta. Medido: «3 lugares» 9 px, peso 500, tracking 1.2 px,
// relleno 5/12, radio 6, blanco sobre terra (5.68) o sobre green (7.36); `warm` con texto ink (11.45); `.exp-tag-pill` 10 px, fondo blanco,
// borde y texto terra (5.68), radio 999, relleno 8/14.

const TONOS = {
  terra: 'bg-sn-terra text-white',
  green: 'bg-sn-green text-white',
  warm: 'bg-sn-warm text-sn-ink',
  contorno: 'border border-solid border-sn-terra bg-white text-sn-terra',
} as const

type Props = {
  tono?: keyof typeof TONOS
  forma?: 'recta' | 'pildora'
  tamano?: 'micro' | 'chica'
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Insignia({ tono = 'terra', forma = 'recta', tamano = 'micro', testId = 'sn-insignia', className, children }: Props) {
  return (
    <span
      data-testid={testId}
      className={unirClases(
        'inline-flex items-center font-sn-mono font-medium uppercase',
        tamano === 'micro' ? 'text-sn-micro px-3 py-[5px]' : 'text-sn-etiqueta-sm px-3.5 py-2',
        forma === 'pildora' ? 'rounded-sn-pildora' : 'rounded-sn-boton',
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}
