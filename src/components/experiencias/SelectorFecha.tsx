'use client'

/**
 * F1 · Fase 4a de PLAN-EXP-SIN-FALLAS (WEB1, sesión 39) — contrato EXP-FASE4-CONTRATO.md §F1.
 *
 * Elegir personas de UNA fecha pública y mandarla al carrito. Lo usan `/calendario` y la rama pública de
 * `/experiencias/[slug]`. No exige sesión: el checkout acepta invitados (D13-1). El precio que se muestra es
 * el del feed (C5); el servidor vuelve a cotizar al apartar y al pagar, así que aquí nada se «cobra».
 *
 * - Vendible (`vendible_en_linea`): adultos (1 por defecto) y niños (0); total de 1 a `max_por_compra`.
 * - No vendible: el motivo del servidor y «Reservar por WhatsApp».
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Minus, Plus, ShoppingCart } from 'lucide-react'
import { formatFechaMexico } from '@/lib/dates'
import { abrirCarrito, agregarExperiencia } from '@/lib/carrito'
import { linkWhatsApp } from '@/lib/whatsapp'
import { horaCorta, horario } from '@/app/admin/eventos/components/fechas'
import { formatMXN } from '@/types/reservas'
import {
  MAX_LUGARES_POR_COMPRA,
  subtotalExperiencia,
  type FechaPublica,
  type ItemCarritoExperiencia,
} from '@/types/compra-experiencias'

/** Imagen del renglón del carrito cuando la página no tiene la de la experiencia. */
const IMAGEN_POR_DEFECTO = '/images/experiencias/hero-experiencias.jpg'

const FECHA_LARGA: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

const MOTIVO_GENERICO = 'Esta fecha no se vende en línea.'

/** Nombre que ve el cliente: el de la experiencia (el de la fecha es un respaldo). */
export function nombreDeFecha(fecha: Pick<FechaPublica, 'experiencia_nombre' | 'nombre_evento'>): string {
  return fecha.experiencia_nombre || fecha.nombre_evento
}

/**
 * ¿Se puede comprar en línea? Lo decide el servidor (`vendible_en_linea`); aquí solo se cuida que venga lo
 * necesario para armar el renglón. Un feed sin los campos de la Fase 4 cuenta como NO vendible.
 */
export function esVendible(fecha: FechaPublica): boolean {
  return (
    fecha.vendible_en_linea === true &&
    fecha.precio_efectivo != null &&
    !!fecha.experiencia_id &&
    (fecha.max_por_compra ?? 0) >= 1
  )
}

/** Mensaje de WhatsApp de una fecha (F1). */
export function textoWhatsAppFecha(fecha: FechaPublica): string {
  return `Hola, quiero reservar ${nombreDeFecha(fecha)} el ${formatFechaMexico(
    fecha.fecha_evento,
    FECHA_LARGA,
  )} a las ${horaCorta(fecha.hora_inicio)}`
}

function textoLugares(n: number): string {
  return `${n} ${n === 1 ? 'lugar' : 'lugares'}`
}

interface SelectorFechaProps {
  fecha: FechaPublica
  /** Imagen de la experiencia para el renglón del carrito. */
  imagen?: string
  /** Se llama con el renglón guardado (antes de abrir el carrito o de ir al checkout). */
  onAgregado?: (item: ItemCarritoExperiencia) => void
}

export default function SelectorFecha({ fecha, imagen, onAgregado }: SelectorFechaProps) {
  const router = useRouter()
  const [adultos, setAdultos] = useState(1)
  const [ninos, setNinos] = useState(0)
  const [error, setError] = useState<string | null>(null)

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
    if (delta === 1 && personas >= tope) return
    if (delta === -1 && personas <= 1) return
    if (quien === 'adultos') setAdultos((n) => Math.max(0, n + delta))
    else setNinos((n) => Math.max(0, n + delta))
  }

  /** Guarda la fecha en el carrito (la misma fecha se reemplaza). null si no se pudo. */
  const guardar = (): ItemCarritoExperiencia | null => {
    if (!vendible || !fecha.experiencia_id) return null
    try {
      const item = agregarExperiencia({
        evento_id: fecha.id,
        experiencia_id: fecha.experiencia_id,
        name: nombre,
        fecha: fecha.fecha_evento,
        hora: horaCorta(fecha.hora_inicio),
        hora_fin: fecha.hora_fin ? horaCorta(fecha.hora_fin) : null,
        adultos,
        ninos,
        price: precioAdulto,
        precio_nino: precioNino,
        edad_maxima_nino: conRegla ? fecha.edad_maxima_nino : null,
        punto_encuentro: fecha.punto_encuentro,
        image: imagen || IMAGEN_POR_DEFECTO,
      })
      setError(null)
      return item
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar al carrito. Intenta de nuevo.')
      return null
    }
  }

  const agregarAlCarrito = () => {
    const item = guardar()
    if (!item) return
    onAgregado?.(item)
    abrirCarrito()
  }

  const comprarAhora = () => {
    const item = guardar()
    if (!item) return
    onAgregado?.(item)
    router.push('/checkout')
  }

  const etiquetaNinos = conRegla
    ? fecha.edad_maxima_nino != null
      ? `Niños de hasta ${fecha.edad_maxima_nino} años`
      : 'Niños'
    : 'Niños (pagan como adulto)'

  return (
    <div data-testid="selector-fecha" data-evento-id={fecha.id} className="space-y-4 min-w-0">
      {/* Qué y cuándo */}
      <div className="space-y-1.5 min-w-0">
        <p className="font-display text-lg text-verde leading-tight break-words mb-0">{nombre}</p>
        <p data-testid="fecha-cuando" className="flex items-start gap-2 text-sm text-verde-tipografia">
          <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-terracota" aria-hidden="true" />
          <span className="min-w-0">
            {formatFechaMexico(fecha.fecha_evento, FECHA_LARGA)}
          </span>
        </p>
        <p className="flex items-center gap-2 text-sm text-verde-tipografia">
          <Clock className="h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
          <span data-testid="fecha-hora">{horario(fecha.hora_inicio, fecha.hora_fin)}</span>
        </p>
        {fecha.punto_encuentro && (
          <p data-testid="fecha-punto-encuentro" className="flex items-start gap-2 text-sm text-verde-tipografia">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-terracota" aria-hidden="true" />
            <span className="min-w-0 break-words">Punto de encuentro: {fecha.punto_encuentro}</span>
          </p>
        )}
      </div>

      {!vendible ? (
        /* No se vende en línea: el motivo del servidor + WhatsApp */
        <div className="space-y-3">
          <p
            data-testid="fecha-motivo"
            className="rounded-lg border border-amarillo/40 bg-amarillo-bg px-3 py-2 text-sm text-verde-tipografia"
          >
            {fecha.motivo_no_vendible || MOTIVO_GENERICO}
          </p>
          <a
            data-testid="fecha-whatsapp"
            href={linkWhatsApp(textoWhatsAppFecha(fecha))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-verde px-4 py-3 font-semibold text-white transition-colors hover:bg-verde-dark"
          >
            Reservar por WhatsApp
          </a>
        </div>
      ) : (
        <>
          {/* Personas */}
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
          <p data-testid="fecha-tope" className="text-xs text-verde-suave -mt-1">
            {personas >= tope
              ? `Llegaste al máximo: ${textoLugares(tope)} en esta compra.`
              : `Hasta ${textoLugares(tope)} en esta compra.`}
            {fecha.disponibles != null && (
              <span data-testid="fecha-disponibles"> Quedan {textoLugares(fecha.disponibles)}.</span>
            )}
          </p>

          {/* Desglose */}
          <div className="rounded-lg border border-neutro-borde bg-neutro-light p-3 text-sm space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span data-testid="fecha-linea-adultos" className="min-w-0 text-verde-tipografia">
                Adultos {adultos} × {formatMXN(precioAdulto)}
              </span>
              <span className="shrink-0 tabular-nums text-verde">{formatMXN(adultos * precioAdulto)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span data-testid="fecha-linea-ninos" className="min-w-0 text-verde-tipografia">
                {etiquetaNinos} {ninos} × {formatMXN(precioNino)}
              </span>
              <span className="shrink-0 tabular-nums text-verde">{formatMXN(ninos * precioNino)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-neutro-borde pt-1.5 font-semibold">
              <span className="text-verde">Total</span>
              <span data-testid="fecha-total" className="tabular-nums text-terracota text-base">
                {formatMXN(total)}
              </span>
            </div>
          </div>

          {error && (
            <p
              data-testid="fecha-error"
              role="alert"
              className="rounded-lg border border-rojo/30 bg-rojo-bg px-3 py-2 text-sm text-rojo"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              data-testid="fecha-agregar"
              onClick={agregarAlCarrito}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-terracota px-4 py-3 font-semibold text-terracota transition-colors hover:bg-terracota hover:text-white"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Agregar al carrito
            </button>
            <button
              type="button"
              data-testid="fecha-comprar"
              onClick={comprarAhora}
              className="rounded-xl bg-terracota px-4 py-3 font-semibold text-white transition-colors hover:bg-terracota-oscuro"
            >
              Comprar ahora
            </button>
          </div>
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
  const etiquetaId = `fecha-${id}-etiqueta`
  return (
    <div role="group" aria-labelledby={etiquetaId} className="min-w-0">
      <p id={etiquetaId} className="mb-1 text-sm font-medium text-verde">
        {etiqueta}
      </p>
      <div className="flex items-center justify-between gap-1 rounded-lg border border-neutro-borde bg-white p-1">
        <button
          type="button"
          data-testid={`fecha-${id}-menos`}
          onClick={onBajar}
          disabled={!puedeBajar}
          aria-label={`Quitar ${id === 'adultos' ? 'un adulto' : 'un niño'}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-verde hover:bg-neutro-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <output
          data-testid={`fecha-${id}`}
          aria-live="polite"
          className="min-w-[2ch] text-center font-semibold tabular-nums text-verde"
        >
          {valor}
        </output>
        <button
          type="button"
          data-testid={`fecha-${id}-mas`}
          onClick={onSubir}
          disabled={!puedeSubir}
          aria-label={`Agregar ${id === 'adultos' ? 'un adulto' : 'un niño'}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-verde hover:bg-neutro-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
