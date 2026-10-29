import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): aviso dentro de la página (no es Avisos.tsx, que son los avisos flotantes de siempre). Colores de
// la maqueta: éxito green y error terra (`.colonia-validator-result.ok` / `.nok`); info ink; atención ink con filete amber. Texto que pasa
// AA sobre warm y white (green 6.20 · 7.36, terra 4.78 · 5.68, ink 11.45 · 13.6). El color no es lo único: el error se anuncia con
// role="alert" y los demás con role="status", y el texto lo pasa quien lo usa.

const TONOS = {
  info: 'border-sn-muted text-sn-ink',
  exito: 'border-sn-green text-sn-green',
  error: 'border-sn-terra text-sn-terra',
  atencion: 'border-sn-amber text-sn-ink',
} as const

type Props = {
  tono: keyof typeof TONOS
  as?: 'p' | 'div'
  testId?: string
  className?: string
  children: React.ReactNode
}

export default function AvisoEnLinea({ tono, as: Elemento = 'p', testId = 'sn-aviso', className, children }: Props) {
  return (
    <Elemento
      data-testid={testId}
      data-tono={tono}
      role={tono === 'error' ? 'alert' : 'status'}
      className={unirClases('m-0 border-0 border-l-[3px] border-solid py-1 pl-3 font-sn-texto text-sn-cuerpo-sm font-medium', TONOS[tono], className)}
    >
      {children}
    </Elemento>
  )
}
