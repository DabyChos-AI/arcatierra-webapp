import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §3.1, §4): eyebrows y metadatos en DM Mono, mayúsculas. Medido: `eyebrow` 11 px / 1.8 px (peso 700,
// `.simple-hero-eyebrow`), `etiqueta` 11 px / 1.2 px (peso 500, 36 veces en 7 páginas), `chica` 10 px / 1.1 px (pastillas), `micro` 9 px.
// El tono lo elige quien la usa según el fondo (§2.2): sobre `cream`, terra NO pasa como texto chico (4.13).

const TAMANOS = {
  eyebrow: 'text-sn-eyebrow',
  etiqueta: 'text-sn-etiqueta',
  chica: 'text-sn-etiqueta-sm',
  micro: 'text-sn-micro',
} as const

const TONOS = {
  terra: 'text-sn-terra',
  ink: 'text-sn-ink',
  green: 'text-sn-green',
  forest: 'text-sn-forest',
  warm: 'text-sn-warm',
  white: 'text-white',
  gold: 'text-sn-gold',
} as const

type Props = {
  tamano?: keyof typeof TAMANOS
  /** `medio` = 500; `negrita` = 700 (DM Mono llega a 500: el navegador lo engruesa). */
  peso?: 'medio' | 'negrita'
  tono?: keyof typeof TONOS
  as?: 'p' | 'span' | 'div'
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Etiqueta({
  tamano = 'etiqueta',
  peso,
  tono = 'terra',
  as: Elemento = 'p',
  testId = 'sn-etiqueta',
  className,
  children,
}: Props) {
  const pesoFinal = peso ?? (tamano === 'eyebrow' ? 'negrita' : 'medio')
  return (
    <Elemento
      data-testid={testId}
      className={unirClases(
        'm-0 font-sn-mono uppercase',
        TAMANOS[tamano],
        pesoFinal === 'negrita' ? 'font-bold' : 'font-medium',
        TONOS[tono],
        className,
      )}
    >
      {children}
    </Elemento>
  )
}
