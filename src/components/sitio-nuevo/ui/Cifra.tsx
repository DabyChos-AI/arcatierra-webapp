import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): una cifra con su leyenda («Arca Tierra en números» de la tienda, «El problema» de chinampas).
// Medido: `.stats-col-num` serif clamp(28px, 3vw, 42px), tracking −1px; las de chinampas (sin clase) 72 px a 1440 y 48 px a 390, tracking
// −1.5px, interlineado 1 (el clamp de abajo da esos dos valores); leyenda en texto chico.
// No trae ningún número: `valor` lo pasa quien la usa (de `contenido_sitio` cuando haya ruta, o la marca FALTA mientras tanto, C40).

const TAMANOS = {
  normal: 'text-[clamp(28px,3vw,42px)] leading-none tracking-[-1px]',
  grande: 'text-[clamp(48px,5vw,72px)] leading-none tracking-[-1.5px]',
} as const

const TONOS = { ink: 'text-sn-ink', terra: 'text-sn-terra', warm: 'text-sn-warm', white: 'text-white' } as const

type Props = {
  valor: React.ReactNode
  leyenda: string
  tamano?: keyof typeof TAMANOS
  tono?: keyof typeof TONOS
  testId?: string
  className?: string
}

export default function Cifra({ valor, leyenda, tamano = 'normal', tono = 'ink', testId = 'sn-cifra', className }: Props) {
  return (
    <div data-testid={testId} className={unirClases('flex flex-col gap-2', className)}>
      <p data-testid={`${testId}-valor`} className={unirClases('m-0 font-sn-titulos font-normal', TAMANOS[tamano], TONOS[tono])}>
        {valor}
      </p>
      <p data-testid={`${testId}-leyenda`} className={unirClases('m-0 font-sn-texto text-sn-cuerpo-xs font-normal', TONOS[tono])}>
        {leyenda}
      </p>
    </div>
  )
}
