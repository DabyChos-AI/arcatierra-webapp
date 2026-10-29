import OptimizedImage from '@/components/ui/OptimizedImage'
import Falta, { type QuienFalta } from '@/components/sitio-nuevo/Falta'
import { unirClases } from './clases'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4): marco de foto con proporción fija y `next/image` (por `OptimizedImage`, sin tocarlo). Sin foto,
// la marca en bloque con lo que diga quien la usa (DR-17: la foto sale del sitio de hoy o de la base; la marca, solo si no existe).

const PROPORCIONES = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
  '3/4': 'aspect-[3/4]',
  '4/5': 'aspect-[4/5]',
} as const

const REDONDEOS = { ninguno: '', tarjeta: 'rounded-sn-tarjeta', panel: 'rounded-sn-panel' } as const

type Comun = {
  proporcion?: keyof typeof PROPORCIONES
  /** El `sizes` de next/image (por omisión, el ancho de la pantalla). */
  sizes?: string
  prioridad?: boolean
  redondeo?: keyof typeof REDONDEOS
  testId?: string
  className?: string
}

type ConFoto = Comun & { src: string; alt: string; decorativa?: false; falta?: never }
type Decorativa = Comun & { src: string; decorativa: true; alt?: never; falta?: never }
type SinFoto = Comun & { src?: undefined; falta: { que: string; quien: QuienFalta }; alt?: never; decorativa?: never }

export type FotoProps = ConFoto | Decorativa | SinFoto

export default function Foto(props: FotoProps) {
  const { proporcion = '4/3', sizes, prioridad, redondeo = 'ninguno', testId = 'sn-foto', className } = props
  const marco = unirClases('relative w-full overflow-hidden', PROPORCIONES[proporcion], REDONDEOS[redondeo], className)

  if (props.src === undefined) {
    // Sin proporción ni recorte: la marca en bloque trae su propio alto mínimo y tiene que verse entera.
    return (
      <div data-testid={testId} data-foto="falta" className={unirClases('flex w-full', REDONDEOS[redondeo], className)}>
        <Falta que={props.falta.que} quien={props.falta.quien} como="bloque" />
      </div>
    )
  }
  return (
    <div data-testid={testId} data-foto="si" className={marco}>
      <OptimizedImage src={props.src} alt={props.decorativa ? '' : props.alt} fill sizes={sizes} priority={prioridad} />
    </div>
  )
}
