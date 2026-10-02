'use client'

// R5 · TOT1 (decisión de David, 2-oct): en una reserva del Sheet se captura a mano «Total pactado (con propina)» y
// «Ya pagado (fuera del sistema)». Solo se pinta si el detalle trae `puede_capturar_total` (Sheet, no cortesía, no
// cancelada, con el permiso `reportes`). El PATCH, la versión y el 409 los lleva el detalle (onGuardar); aquí solo el
// formulario: manda el total (obligatorio) y lo pagado SOLO si se llenó.

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { formatMXN, type Reserva } from '@/types/reservas'

/** Lo que responde el detalle al guardar. `mensaje: null` = el aviso ya se mostró arriba (409 de versión). */
export type ResultadoCapturaTotal = { ok: true; texto: string } | { ok: false; mensaje: string | null }

const MAXIMO = 10_000_000

/** «24800», «24,800.50», «$24 800» → número; '' → null; texto que no es número → NaN. */
function leerMonto(texto: string): number | null {
  const limpio = texto.replace(/[$\s,]/g, '')
  if (limpio === '') return null
  return /^\d+(\.\d{1,2})?$/.test(limpio) ? Number(limpio) : NaN
}

export default function CapturaTotalSheet({
  reserva,
  onGuardar,
}: {
  reserva: Reserva
  onGuardar: (total: number, pagadoExterno: number | null) => Promise<ResultadoCapturaTotal>
}) {
  const totalGuardado = Number(reserva.monto_total) || 0
  const pagadoGuardado = Number(reserva.monto_pagado_acumulado) || 0
  const [total, setTotal] = useState(totalGuardado > 0 ? String(totalGuardado) : '')
  const [pagado, setPagado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<string | null>(null)

  // Tras guardar (o recargar) la reserva trae los montos nuevos: el formulario vuelve a ellos
  useEffect(() => {
    setTotal(totalGuardado > 0 ? String(totalGuardado) : '')
    setPagado('')
  }, [totalGuardado, pagadoGuardado])

  const totalNum = leerMonto(total)
  const pagadoNum = leerMonto(pagado)
  const errorLocal =
    totalNum === null
      ? 'Escribe el total pactado.'
      : Number.isNaN(totalNum)
        ? 'El total debe ser un número (hasta 2 decimales).'
        : totalNum <= 0
          ? 'El total debe ser mayor que cero.'
          : totalNum > MAXIMO
            ? `El total no puede pasar de ${formatMXN(MAXIMO)}.`
            : pagadoNum !== null && Number.isNaN(pagadoNum)
              ? 'Lo pagado debe ser un número (hasta 2 decimales).'
              : pagadoNum !== null && pagadoNum > totalNum
                ? 'Lo pagado no puede ser mayor que el total.'
                : null

  async function guardar() {
    if (errorLocal || totalNum === null || Number.isNaN(totalNum)) {
      setError(errorLocal)
      return
    }
    setGuardando(true)
    setError(null)
    setResultado(null)
    try {
      const r = await onGuardar(totalNum, pagadoNum === null || Number.isNaN(pagadoNum) ? null : pagadoNum)
      if (r.ok) setResultado(r.texto)
      else if (r.mensaje) setError(r.mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const inputClass =
    'w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota'

  return (
    <section
      data-testid="detalle-capturar-total"
      aria-labelledby="detalle-capturar-total-titulo"
      className="bg-white border border-terracota/30 rounded-lg p-3 space-y-3"
    >
      <div>
        <h3 id="detalle-capturar-total-titulo" className="text-sm font-semibold text-verde">
          Capturar total (reserva del Sheet)
        </h3>
        <p className="text-xs text-verde-suave mt-0.5">
          El precio del Sheet no se recalcula con el catálogo: escribe lo que se pactó con el cliente. El estado de
          pago y el saldo se recalculan con estos dos montos y el cambio queda en la Auditoría.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="d-total-pactado" className="block text-sm font-medium text-verde mb-1">
            Total pactado (con propina)
          </label>
          <input
            id="d-total-pactado"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={total}
            onChange={(e) => {
              setTotal(e.target.value)
              setError(null)
              setResultado(null)
            }}
            placeholder="Ej. 24800"
            data-testid="detalle-total-pactado"
            aria-describedby="d-total-pactado-ayuda"
            className={inputClass}
          />
          <p id="d-total-pactado-ayuda" className="text-xs text-verde-suave mt-1">
            Hoy: {formatMXN(totalGuardado)}
            {Number(reserva.propina_monto) > 0 && ` · propina ya cargada ${formatMXN(Number(reserva.propina_monto))}`}
          </p>
        </div>
        <div>
          <label htmlFor="d-pagado-externo" className="block text-sm font-medium text-verde mb-1">
            Ya pagado (fuera del sistema)
          </label>
          <input
            id="d-pagado-externo"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={pagado}
            onChange={(e) => {
              setPagado(e.target.value)
              setError(null)
              setResultado(null)
            }}
            placeholder="Opcional"
            data-testid="detalle-pagado-externo"
            aria-describedby="d-pagado-externo-ayuda"
            className={inputClass}
          />
          <p id="d-pagado-externo-ayuda" className="text-xs text-verde-suave mt-1">
            Hoy registrado: {formatMXN(pagadoGuardado)}. Vacío = se conserva; si la reserva dice «pagada» y no hay
            monto, se toma el total como pagado.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          data-testid="detalle-guardar-total"
          className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Guardar total
        </button>
      </div>
      {error && (
        <p
          role="alert"
          data-testid="detalle-total-error"
          className="bg-rojo-bg border border-rojo/30 rounded-lg p-2 text-sm text-rojo"
        >
          {error}
        </p>
      )}
      {resultado && (
        <p
          role="status"
          data-testid="detalle-total-resultado"
          className="bg-verde/10 border border-verde/30 rounded-lg p-2 text-sm text-verde"
        >
          {resultado}
        </p>
      )}
    </section>
  )
}
