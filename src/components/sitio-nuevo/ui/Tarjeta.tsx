import Link from 'next/link'
import { GRUPO_TARJETA, LEVANTA } from '@/components/sitio-nuevo/movimiento'
import { FOCO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): la tarjeta de la maqueta (`.receta-card`, `.contact-channel`, `.banner-3p-v7-card`, `.tipo-card`):
// radio 14 px, borde 1 px `border` (decoración), fondo blanco o warm, relleno 0 · 28 · 32 px. Con `href`, toda la tarjeta es una liga con
// su foco; el contenido lo pasa quien la usa.
// F8 (D-F8-16, P-1): la tarjeta que es liga sube 4 px al pasar el ratón (maqueta `.banner-3p-v7-card:hover`) y es el grupo, con nombre, de lo que lleve
// adentro (la flecha de las puertas avanza; D-F8-23). Solo donde hay ratón (movimiento.ts, D-F8-19); sin sombra (carta de la diseñadora §4).

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
    href && GRUPO_TARJETA,
    href && LEVANTA,
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
