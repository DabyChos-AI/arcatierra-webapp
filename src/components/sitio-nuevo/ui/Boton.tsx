import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FOCO_BOTON, FOCO_BOTON_SOBRE_OSCURO, unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): botón y botón-liga del sitio nuevo. Sin texto propio: todo lo pinta `children` (y `textoCargando`
// mientras carga). Medido en la maqueta: mono en mayúsculas, peso 500; `normal` = 12 px con relleno 14/28 (`.cross-sell-cta`,
// `.hero-side-cta`), `chico` = 11 px con 11/22 (`.popup-cta`); pastilla 999 px o recto 6 px. Hover de la maqueta que pasa AA (C17,
// medido en el arnés): el primario pasa a fondo ink (`.colonia-validator-form button:hover`; el `.btn-terra:hover` de opacidad 0.85 baja a
// 4.21 y no se usa), el contorno se llena (`.qs-cta-outline:hover`), el suave pasa a terra (`.btn-ghost-dark:hover`), sobre oscuro el
// contorno sube a 60 % y el texto a blanco (`.btn-canasta-ghost:hover`). Sobre cream, terra da 4.13: el contorno y la liga van en ink.

type Variante = 'primario' | 'contorno' | 'suave' | 'texto'

type Comun = {
  variante?: Variante
  tamano?: 'normal' | 'chico'
  forma?: 'pildora' | 'recta'
  /** En fondos terra, forest, green o ink (CONTRATO-BASE-F1 §2.2). */
  sobreOscuro?: boolean
  /** En fondo cream: terra no llega a 4.5 (4.13), así que el contorno y la liga van en ink (§2.2). */
  sobreCrema?: boolean
  /** Flecha decorativa a la derecha (ícono, `aria-hidden`). */
  flecha?: boolean
  anchoCompleto?: boolean
  /** `aria-label` cuando el texto visible no basta. */
  etiquetaAccesible?: string
  testId?: string
  className?: string
  children: React.ReactNode
}

type ComoLiga = Comun & {
  href: string
  /** Abre en otra pestaña con `rel="noopener noreferrer"`. */
  externo?: boolean
  deshabilitado?: boolean
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  type?: never
  cargando?: never
  textoCargando?: never
}

type ComoBoton = Comun & {
  href?: undefined
  externo?: never
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  deshabilitado?: boolean
  cargando?: boolean
  /** Lo que se lee mientras `cargando` (lo pasa quien usa el botón). */
  textoCargando?: string
}

export type BotonProps = ComoLiga | ComoBoton

const COLORES: Record<Variante, { claro: string; crema: string; oscuro: string }> = {
  primario: {
    claro: 'bg-sn-terra text-white hover:bg-sn-ink hover:text-white',
    crema: 'bg-sn-terra text-white hover:bg-sn-ink hover:text-white',
    // Sobre oscuro la opacidad 0.85 de la maqueta sí pasa (5.45 medido sobre terra).
    oscuro: 'bg-sn-gold text-sn-ink hover:text-sn-ink hover:opacity-85',
  },
  contorno: {
    claro: 'border border-solid border-sn-terra bg-transparent text-sn-terra hover:bg-sn-terra hover:text-white',
    crema: 'border border-solid border-sn-ink bg-transparent text-sn-ink hover:bg-sn-ink hover:text-sn-cream',
    oscuro: 'border border-solid border-sn-warm/40 bg-transparent text-sn-warm hover:border-sn-warm/60 hover:text-white',
  },
  suave: {
    claro: 'bg-sn-warm text-sn-ink hover:text-sn-terra',
    crema: 'bg-sn-warm text-sn-ink hover:text-sn-terra',
    oscuro: 'bg-sn-warm text-sn-ink hover:text-sn-terra',
  },
  texto: {
    claro: 'bg-transparent text-sn-terra hover:text-sn-ink',
    crema: 'bg-transparent text-sn-ink hover:text-sn-forest',
    oscuro: 'bg-transparent text-sn-warm hover:text-white',
  },
}

export default function Boton(props: BotonProps) {
  const {
    variante = 'primario',
    tamano = 'normal',
    forma = 'pildora',
    sobreOscuro = false,
    sobreCrema = false,
    flecha = false,
    anchoCompleto = false,
    etiquetaAccesible,
    testId = 'sn-boton',
    className,
    children,
    deshabilitado = false,
  } = props
  const esTexto = variante === 'texto'

  const clases = unirClases(
    'inline-flex items-center justify-center gap-2 font-sn-mono font-medium uppercase no-underline',
    'transition-[opacity,color,background-color,border-color] duration-200',
    esTexto
      ? unirClases('min-h-6 px-0 py-1', tamano === 'chico' ? 'text-sn-boton-sm' : 'text-sn-boton')
      : tamano === 'chico'
        ? 'text-sn-boton-sm px-[22px] py-[11px]'
        : 'text-sn-boton min-h-11 px-7 py-3.5',
    !esTexto && (forma === 'pildora' ? 'rounded-sn-pildora' : 'rounded-sn-boton'),
    sobreOscuro ? COLORES[variante].oscuro : sobreCrema ? COLORES[variante].crema : COLORES[variante].claro,
    sobreOscuro ? FOCO_BOTON_SOBRE_OSCURO : FOCO_BOTON,
    anchoCompleto && 'w-full',
    deshabilitado && 'cursor-not-allowed opacity-60',
    className,
  )

  const contenido = (texto: React.ReactNode) => (
    <>
      <span>{texto}</span>
      {flecha && <ArrowRight aria-hidden="true" focusable="false" className="h-[1.15em] w-[1.15em] shrink-0" strokeWidth={1.75} />}
    </>
  )

  if (props.href !== undefined) {
    if (deshabilitado) {
      return (
        <span data-testid={testId} aria-disabled="true" aria-label={etiquetaAccesible} className={clases}>
          {contenido(children)}
        </span>
      )
    }
    if (props.externo) {
      return (
        <a
          data-testid={testId}
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={etiquetaAccesible}
          onClick={props.onClick}
          className={clases}
        >
          {contenido(children)}
        </a>
      )
    }
    return (
      <Link data-testid={testId} href={props.href} aria-label={etiquetaAccesible} onClick={props.onClick} className={clases}>
        {contenido(children)}
      </Link>
    )
  }

  const cargando = props.cargando === true
  return (
    <button
      data-testid={testId}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={deshabilitado || cargando}
      aria-busy={cargando || undefined}
      aria-label={etiquetaAccesible}
      className={clases}
    >
      {contenido(cargando && props.textoCargando ? props.textoCargando : children)}
    </button>
  )
}
