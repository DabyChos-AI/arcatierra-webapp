'use client'

// R15 v2 · F4 (sesión 62): elegir personas de UNA fecha pública y mandarla al carrito, en la ficha de una experiencia del sitio nuevo.
// Contrato v2 §9-F4 D-F4-04, D-F4-11 P-7, D-F4-12 (selector propio), D-F4-13; cadena-v2/f4/experiencias-F4.md §3.4.
// La MISMA conducta que src/components/experiencias/SelectorFecha.tsx, con el diseño del sitio nuevo. El de hoy no se importa: al agregar
// abre el carrito lateral (`abrirCarrito()`, :132), y en el sitio nuevo ese carrito no se abre nunca (D-F3-13). De él solo se importan sus
// funciones exportadas. Lo que se guarda en `arcaTierraCart` es el mismo renglón de hoy (`itemDeFecha`, :105-119) con `agregarExperiencia`
// de lib/carrito.ts; al agregar, el aviso propio «{nombre} agregado al carrito» (D-F3-22 P-13, D-F4-12 P-9) y el contador de la cabecera
// sube solo (`cartUpdated`); «Comprar ahora» va al checkout de F3 como hoy (:135-140). Textos y cuentas de hoy (:84-99, :142-146, :171-272).
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import { formatFechaMexico } from '@/lib/dates'
import { agregarExperiencia } from '@/lib/carrito'
import { linkWhatsApp } from '@/lib/whatsapp'
import { horario } from '@/app/admin/eventos/components/fechas'
import { formatMXN } from '@/types/reservas'
import { esVendible, nombreDeFecha, textoWhatsAppFecha } from '@/components/experiencias/SelectorFecha'
import { MAX_LUGARES_POR_COMPRA, subtotalExperiencia, type FechaPublica } from '@/types/compra-experiencias'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { FOCO_BOTON } from '@/components/sitio-nuevo/ui/clases'
import { itemDeFecha, textoLugares } from './experiencias'

const FECHA_LARGA: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
const MOTIVO_GENERICO = 'Esta fecha no se vende en línea.'
const BASE = 'sn-detalle-experiencia-selector'

type Props = {
  fecha: FechaPublica
  /** La foto de la experiencia para el renglón del carrito. */
  imagen?: string
}

export default function ElegirFecha({ fecha, imagen }: Props) {
  const router = useRouter()
  const [adultos, setAdultos] = useState(1)
  const [ninos, setNinos] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [agregado, setAgregado] = useState(false)

  const nombre = nombreDeFecha(fecha)
  const vendible = esVendible(fecha)
  const precioAdulto = fecha.precio_efectivo ?? 0
  const conRegla = fecha.precio_nino != null
  const precioNino = conRegla ? (fecha.precio_nino as number) : precioAdulto
  const tope = Math.min(MAX_LUGARES_POR_COMPRA, Math.max(0, fecha.max_por_compra ?? 0))
  const personas = adultos + ninos
  const total = subtotalExperiencia({ adultos, ninos, price: precioAdulto, precio_nino: precioNino })

  const cambiar = (quien: 'adultos' | 'ninos', delta: 1 | -1) => {
    setError(null)
    setAgregado(false)
    if (delta === 1 && personas >= tope) return
    if (delta === -1 && personas <= 1) return
    if (quien === 'adultos') setAdultos((n) => Math.max(0, n + delta))
    else setNinos((n) => Math.max(0, n + delta))
  }

  /** Guarda la fecha en el carrito (la misma fecha se reemplaza, como hoy). false si no se pudo. */
  const guardar = (): boolean => {
    const item = itemDeFecha(fecha, adultos, ninos, imagen)
    if (!item) return false
    try {
      agregarExperiencia(item)
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar al carrito. Intenta de nuevo.')
      return false
    }
  }

  const agregarAlCarrito = () => {
    setAgregado(guardar())
  }

  const comprarAhora = () => {
    if (guardar()) router.push('/checkout')
  }

  const etiquetaNinos = conRegla
    ? fecha.edad_maxima_nino != null
      ? `Niños de hasta ${fecha.edad_maxima_nino} años`
      : 'Niños'
    : 'Niños (pagan como adulto)'

  return (
    <div data-testid={BASE} data-evento-id={fecha.id} className="min-w-0 space-y-4">
      <div className="min-w-0 space-y-1.5">
        <p className="m-0 break-words font-sn-titulos text-sn-h5 font-normal text-sn-ink">{nombre}</p>
        <p data-testid={`${BASE}-cuando`} className="m-0 font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink">
          {formatFechaMexico(fecha.fecha_evento, FECHA_LARGA)}
        </p>
        <p data-testid={`${BASE}-hora`} className="m-0 font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink">
          {horario(fecha.hora_inicio, fecha.hora_fin)}
        </p>
        {fecha.punto_encuentro && (
          <p data-testid={`${BASE}-punto`} className="m-0 break-words font-sn-texto text-sn-cuerpo-sm font-normal text-sn-ink">
            Punto de encuentro: {fecha.punto_encuentro}
          </p>
        )}
      </div>

      {!vendible ? (
        <div className="space-y-3">
          <AvisoEnLinea tono="atencion" testId={`${BASE}-motivo`}>
            {fecha.motivo_no_vendible || MOTIVO_GENERICO}
          </AvisoEnLinea>
          <Boton href={linkWhatsApp(textoWhatsAppFecha(fecha))} externo forma="recta" anchoCompleto testId={`${BASE}-whatsapp`}>
            Reservar por WhatsApp
          </Boton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Contador
              id="adultos"
              etiqueta="Adultos"
              valor={adultos}
              puedeBajar={adultos > 0 && personas > 1}
              puedeSubir={personas < tope}
              onBajar={() => cambiar('adultos', -1)}
              onSubir={() => cambiar('adultos', 1)}
            />
            <Contador
              id="ninos"
              etiqueta={conRegla && fecha.edad_maxima_nino != null ? `Niños (hasta ${fecha.edad_maxima_nino} años)` : 'Niños'}
              valor={ninos}
              puedeBajar={ninos > 0 && personas > 1}
              puedeSubir={personas < tope}
              onBajar={() => cambiar('ninos', -1)}
              onSubir={() => cambiar('ninos', 1)}
            />
          </div>
          <p data-testid={`${BASE}-tope`} className="m-0 font-sn-texto text-sn-cuerpo-xs font-normal text-sn-ink">
            {personas >= tope ? `Llegaste al máximo: ${textoLugares(tope)} en esta compra.` : `Hasta ${textoLugares(tope)} en esta compra.`}
            {fecha.disponibles != null && <span data-testid={`${BASE}-disponibles`}> Quedan {textoLugares(fecha.disponibles)}.</span>}
          </p>

          <div className="space-y-1.5 rounded-sn-campo border border-solid border-sn-border bg-white p-3 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
            <div className="flex items-baseline justify-between gap-3">
              <span data-testid={`${BASE}-linea-adultos`} className="min-w-0">
                Adultos {adultos} × {formatMXN(precioAdulto)}
              </span>
              <span className="shrink-0 tabular-nums">{formatMXN(adultos * precioAdulto)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span data-testid={`${BASE}-linea-ninos`} className="min-w-0">
                {etiquetaNinos} {ninos} × {formatMXN(precioNino)}
              </span>
              <span className="shrink-0 tabular-nums">{formatMXN(ninos * precioNino)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-0 border-t border-solid border-sn-border pt-1.5 font-medium">
              <span>Total</span>
              <span data-testid={`${BASE}-total`} className="tabular-nums">
                {formatMXN(total)}
              </span>
            </div>
          </div>

          {error && (
            <AvisoEnLinea tono="error" testId={`${BASE}-error`}>
              {error}
            </AvisoEnLinea>
          )}

          <div className="grid grid-cols-1 gap-2 min-[861px]:grid-cols-2">
            <Boton variante="contorno" forma="recta" anchoCompleto onClick={agregarAlCarrito} testId={`${BASE}-agregar`}>
              Agregar al carrito
            </Boton>
            <Boton forma="recta" anchoCompleto onClick={comprarAhora} testId={`${BASE}-comprar`}>
              Comprar ahora
            </Boton>
          </div>
          {agregado && (
            <AvisoEnLinea tono="exito" testId="sn-detalle-experiencia-agregado">
              {`${nombre} agregado al carrito`}
            </AvisoEnLinea>
          )}
        </>
      )}
    </div>
  )
}

function Contador({
  id,
  etiqueta,
  valor,
  puedeBajar,
  puedeSubir,
  onBajar,
  onSubir,
}: {
  id: 'adultos' | 'ninos'
  etiqueta: string
  valor: number
  puedeBajar: boolean
  puedeSubir: boolean
  onBajar: () => void
  onSubir: () => void
}) {
  const etiquetaId = `${BASE}-${id}-etiqueta`
  const boton = `flex h-11 w-11 shrink-0 items-center justify-center rounded-sn-boton text-sn-ink hover:bg-sn-cream disabled:cursor-not-allowed disabled:opacity-40 ${FOCO_BOTON}`
  return (
    <div role="group" aria-labelledby={etiquetaId} className="min-w-0">
      <p id={etiquetaId} className="m-0 mb-1 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">
        {etiqueta}
      </p>
      <div className="flex items-center justify-between gap-1 rounded-sn-pildora border border-solid border-sn-muted bg-white p-1">
        <button
          type="button"
          data-testid={`${BASE}-${id}-menos`}
          onClick={onBajar}
          disabled={!puedeBajar}
          aria-label={`Quitar ${id === 'adultos' ? 'un adulto' : 'un niño'}`}
          className={boton}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <output data-testid={`${BASE}-${id}`} aria-live="polite" className="min-w-[2ch] text-center font-sn-mono text-sn-cuerpo font-medium tabular-nums text-sn-ink">
          {valor}
        </output>
        <button
          type="button"
          data-testid={`${BASE}-${id}-mas`}
          onClick={onSubir}
          disabled={!puedeSubir}
          aria-label={`Agregar ${id === 'adultos' ? 'un adulto' : 'un niño'}`}
          className={boton}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
