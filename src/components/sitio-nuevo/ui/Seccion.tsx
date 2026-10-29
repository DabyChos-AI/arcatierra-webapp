import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §3.2, §4): una sección del sitio nuevo con el ritmo y los fondos de la maqueta. Ritmo medido: `normal`
// 56 px en el celular (`.simple-hero` a 390) y 80 px desde 860 px (hand-off §4); `grande` 72 → 96 px (`.chinampa-break`); `enfasis` 120 px
// (`.qs-manifesto`). Cada fondo trae su color de texto que pasa AA (§2.2); quien la usa no tiene que acordarse.

const FONDOS = {
  warm: 'bg-sn-warm text-sn-ink',
  cream: 'bg-sn-cream text-sn-ink',
  white: 'bg-white text-sn-ink',
  sand: 'bg-sn-sand text-sn-ink',
  terra: 'bg-sn-terra text-white',
  forest: 'bg-sn-forest text-sn-warm',
  green: 'bg-sn-green text-white',
  ink: 'bg-sn-ink text-sn-warm',
  ninguno: '',
} as const

const ESPACIOS = {
  normal: 'py-sn-seccion-movil min-[860px]:py-sn-seccion',
  grande: 'py-sn-seccion-lg-movil min-[860px]:py-sn-seccion-lg',
  enfasis: 'py-sn-seccion-xl',
  ninguno: '',
} as const

const BORDES = {
  arriba: 'border-t border-solid border-sn-border',
  abajo: 'border-b border-solid border-sn-border',
  // Arriba y abajo por separado, no con la utilidad de los dos lados: esa sería nueva y el minificador la uniría con la regla de hoy del
  // borde de abajo (cambia el texto de una regla de hoy, C16). Ojo: Tailwind lee también los comentarios; aquí no va ningún nombre de clase.
  ambos: 'border-t border-b border-solid border-sn-border',
} as const

type Props = {
  espacio?: keyof typeof ESPACIOS
  fondo?: keyof typeof FONDOS
  borde?: keyof typeof BORDES
  id?: string
  /** `aria-labelledby`: el id del título de la sección. */
  etiquetadaPor?: string
  as?: 'section' | 'div' | 'aside'
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function Seccion({
  espacio = 'normal',
  fondo = 'ninguno',
  borde,
  id,
  etiquetadaPor,
  as: Etiqueta = 'section',
  testId = 'sn-seccion',
  className,
  children,
}: Props) {
  return (
    <Etiqueta
      data-testid={testId}
      data-fondo={fondo}
      id={id}
      aria-labelledby={etiquetadaPor}
      className={unirClases('w-full', FONDOS[fondo], ESPACIOS[espacio], borde && BORDES[borde], className)}
    >
      {children}
    </Etiqueta>
  )
}
