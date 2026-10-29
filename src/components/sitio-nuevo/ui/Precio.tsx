import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): cómo se ve un precio en el sitio nuevo. NO formatea ni decide nada: pinta el texto que le pasan
// (el precio sale de la API y lo formatea quien lo usa; ningún precio escrito en el código, contrato v2 §4). Medido en la maqueta: serif
// 18 px (`.product-price`), 24 px (`.exp-card-price`), 40 px (`.prod-price-amount`) o mono 13 px («$1,100 / persona» de la portada).

const TAMANOS_TITULOS = { chico: 'text-[18px] leading-[1.55]', normal: 'text-[24px] leading-[1.55]', grande: 'text-[40px] leading-[1.55]' } as const

type Props = {
  /** El precio ya formateado (lo pasa quien lo usa). */
  valor: string
  /** «persona», «250 g»… (sin la barra). */
  unidad?: string
  tamano?: keyof typeof TAMANOS_TITULOS
  letra?: 'titulos' | 'mono'
  testId?: string
  className?: string
}

export default function Precio({ valor, unidad, tamano = 'chico', letra = 'titulos', testId = 'sn-precio', className }: Props) {
  return (
    <p
      data-testid={testId}
      className={unirClases(
        'm-0 text-sn-ink',
        letra === 'mono'
          ? 'font-sn-mono text-[13px] font-medium leading-[1.55] tracking-[-0.3px]'
          : unirClases('font-sn-titulos font-normal tracking-[-0.3px]', TAMANOS_TITULOS[tamano]),
        className,
      )}
    >
      <span data-testid={`${testId}-valor`}>{valor}</span>
      {unidad && (
        <span data-testid={`${testId}-unidad`} className="font-sn-mono text-sn-cuerpo-xs">
          {/* La barra es decoración (como en la maqueta, «$1,100 / persona»): el lector lee el precio y la unidad. */}
          <span aria-hidden="true">{' / '}</span>
          {unidad}
        </span>
      )}
    </p>
  )
}
