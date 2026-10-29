import Link from 'next/link'
import { FOCO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): la tarjeta de la maqueta (`.receta-card`, `.contact-channel`, `.banner-3p-v7-card`, `.tipo-card`):
// radio 14 px, borde 1 px `border` (decoración), fondo blanco o warm, relleno 0 · 28 · 32 px. Con `href`, toda la tarjeta es una liga con
// su foco; el contenido lo pasa quien la usa.

const FONDOS = { white: 'bg-white', warm: 'bg-sn-warm', cream: 'bg-sn-cream' } as const
const RELLENOS = { ninguno: '', normal: 'p-7', amplio: 'p-8' } as const

type Props = {
  as?: 'article' | 'div' | 'li'
  fondo?: keyof typeof FONDOS
  borde?: boolean
  relleno?: keyof typeof RELLENOS
  /** Toda la tarjeta lleva a esta dirección. */
  href?: string
  /** `aria-label` de la liga cuando el texto de dentro no basta. */
  etiquetaAccesible?: string
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Tarjeta({
  as: Elemento = 'article',
  fondo = 'white',
  borde = true,
  relleno = 'ninguno',
  href,
  etiquetaAccesible,
  testId = 'sn-tarjeta',
  className,
  children,
}: Props) {
  const clases = unirClases(
    'relative block overflow-hidden rounded-sn-tarjeta text-sn-ink',
    FONDOS[fondo],
    borde && 'border border-solid border-sn-border',
    RELLENOS[relleno],
    className,
  )
  if (href) {
    return (
      <Elemento data-testid={testId} className={clases}>
        <Link
          href={href}
          aria-label={etiquetaAccesible}
          className={unirClases('block h-full text-sn-ink no-underline hover:text-sn-ink', FOCO)}
        >
          {children}
        </Link>
      </Elemento>
    )
  }
  return (
    <Elemento data-testid={testId} className={clases}>
      {children}
    </Elemento>
  )
}
