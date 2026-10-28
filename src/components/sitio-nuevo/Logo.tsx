// R15 · F1 (WF1, sesión 54): el isotipo de la maqueta (la canasta terra con los puntos verdes) y «arca tierra» con la letra de
// títulos. Es el mismo SVG de la maqueta (cabecera 36×28, pie 56×44). Sin 'use client': lo usan la cabecera y el pie.

type Props = {
  /** Ancho del isotipo en px (alto = ancho × 0.8). */
  ancho?: number
  /** Clases del texto «arca tierra» (tamaño y color). */
  claseTexto?: string
  className?: string
}

const PUNTOS: ReadonlyArray<readonly [number, number]> = [
  ...[14, 24, 34, 44, 54, 64, 74, 84, 94].map((x) => [x, 72] as const),
  ...[19, 29, 39, 49, 59, 69, 79, 89].map((x) => [x, 79] as const),
  ...[24, 34, 44, 54, 64, 74, 84].map((x) => [x, 85] as const),
]

export function Isotipo({ ancho = 36 }: { ancho?: number }) {
  return (
    <svg
      width={ancho}
      height={Math.round(ancho * 0.8)}
      viewBox="0 0 110 88"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="block shrink-0"
    >
      <path
        d="M 6 24 C 14 18 22 22 30 18 C 38 22 46 16 54 20 C 62 16 70 22 78 18 C 86 22 94 18 104 24 L 104 30 C 96 56 78 64 55 64 C 32 64 14 56 6 30 Z"
        fill="#BA6440"
      />
      <g fill="#475A52">
        {PUNTOS.map(([cx, cy]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="2" ry="2.4" />
        ))}
      </g>
    </svg>
  )
}

export default function Logo({ ancho = 36, claseTexto = 'text-[32px] text-sn-terra', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-[10px] ${className}`}>
      <Isotipo ancho={ancho} />
      <span className={`whitespace-nowrap font-sn-titulos leading-none tracking-[-0.3px] ${claseTexto}`}>arca tierra</span>
    </span>
  )
}
