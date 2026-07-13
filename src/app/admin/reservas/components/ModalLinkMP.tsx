'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Copy, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatMXN } from '@/types/reservas'
import { extraerMensajeError } from './errores'

interface ModalLinkMPProps {
  reservaId: string
  bookingId?: string
  totalActual: number
  anticipoSugerido: number
  balance: number
  onCreated: (preferenceId: string, initPoint: string) => void
  onClose: () => void
}

type TipoLink = 'anticipo' | 'balance' | 'total' | 'custom'

interface LinkResult {
  success: boolean
  preference_id: string | null
  init_point: string | null
  sandbox_init_point?: string | null
  monto?: number
  external_reference?: string
  tipo?: string
  warning?: string
}

export default function ModalLinkMP({
  reservaId,
  bookingId,
  totalActual,
  anticipoSugerido,
  balance,
  onCreated,
  onClose,
}: ModalLinkMPProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [tipo, setTipo] = useState<TipoLink>('anticipo')
  const [montoCustom, setMontoCustom] = useState<number>(0)
  const [porcentaje, setPorcentaje] = useState<number>(30)
  const [vigenciaDias, setVigenciaDias] = useState<number>(7)
  const [concepto, setConcepto] = useState<string>(
    `Anticipo reserva ${bookingId ?? ''}`.trim(),
  )
  const [enviarEmail, setEnviarEmail] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LinkResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Monto efectivo segun tipo
  const montoEfectivo = useMemo(() => {
    switch (tipo) {
      case 'anticipo':
        return anticipoSugerido
      case 'balance':
        return balance
      case 'total':
        return totalActual
      case 'custom':
        return montoCustom
    }
  }, [tipo, anticipoSugerido, balance, totalActual, montoCustom])

  // Bug 4b: calcular monto del anticipo desde un porcentaje sobre el total
  function aplicarPorcentaje(pct: number) {
    const clamped = Math.max(0, Math.min(100, pct))
    setPorcentaje(clamped)
    setMontoCustom(Math.round(totalActual * (clamped / 100) * 100) / 100)
  }

  const PRESETS_PCT = [30, 40, 50] as const

  useEffect(() => {
    // Auto-actualizar concepto cuando cambia tipo
    const baseId = bookingId ?? reservaId.slice(0, 8)
    if (tipo === 'anticipo') setConcepto(`Anticipo reserva ${baseId}`)
    else if (tipo === 'balance') setConcepto(`Balance reserva ${baseId}`)
    else if (tipo === 'total') setConcepto(`Pago total reserva ${baseId}`)
    else if (tipo === 'custom') {
      setConcepto(`Pago reserva ${baseId}`)
      // Bug 4b: sembrar el monto al abrir "Personalizado" para no mostrar $0.00
      setMontoCustom((prev) =>
        prev > 0 ? prev : Math.round(totalActual * (porcentaje / 100) * 100) / 100,
      )
    }
  }, [tipo, bookingId, reservaId, totalActual, porcentaje])

  async function handleSubmit() {
    if (!token) {
      setError('Sesion no valida')
      return
    }
    if (montoEfectivo <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      // Backend espera: { tipo: 'anticipo'|'balance'|'completo', monto_override?: number }
      // 'total' del UI → 'completo' del backend. 'custom' → 'anticipo' + monto_override.
      const tipoBackend =
        tipo === 'total' ? 'completo' : tipo === 'custom' ? 'anticipo' : tipo
      const payload: { tipo: string; monto_override?: number } = { tipo: tipoBackend }
      if (tipo === 'custom') {
        payload.monto_override = montoCustom
      }
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reservaId}/link-pago`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(extraerMensajeError(err, res.status))
      }
      const data = (await res.json()) as LinkResult
      // Backend devuelve 200 OK incluso si MP falla — verificar success
      if (!data.success || !data.init_point) {
        throw new Error(
          data.warning || 'MercadoPago no genero el link. Revisa configuracion MP_ACCESS_TOKEN.',
        )
      }
      setResult(data)
      onCreated(data.preference_id ?? '', data.init_point)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar link')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyLink() {
    if (!result?.init_point) return
    try {
      await navigator.clipboard.writeText(result.init_point)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.alert(result.init_point)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-link-mp-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[92vh] flex flex-col">
        <header className="border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
          <h2 id="modal-link-mp-title" className="font-display text-xl text-verde">
            Generar link de pago MercadoPago
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal link MP"
            className="p-1 rounded hover:bg-neutro-light text-verde-suave"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
          {error && (
            <div className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo">
              {error}
            </div>
          )}

          {!result ? (
            <>
              <fieldset>
                <legend className="text-sm font-medium text-verde mb-2">
                  Tipo de pago
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { v: 'anticipo' as TipoLink, label: 'Anticipo', monto: anticipoSugerido },
                      { v: 'balance' as TipoLink, label: 'Balance', monto: balance },
                      { v: 'total' as TipoLink, label: 'Total', monto: totalActual },
                      { v: 'custom' as TipoLink, label: 'Personalizado', monto: null },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.v}
                      className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm ${
                        tipo === opt.v
                          ? 'border-terracota bg-terracota/5'
                          : 'border-neutro-borde hover:bg-neutro-light'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipo-link"
                        value={opt.v}
                        checked={tipo === opt.v}
                        onChange={() => setTipo(opt.v)}
                        className="text-terracota focus:ring-terracota"
                      />
                      <span className="flex-1">
                        <span className="block text-verde font-medium">{opt.label}</span>
                        {opt.monto !== null && (
                          <span className="block text-xs text-verde-suave">
                            {formatMXN(opt.monto)}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {tipo === 'custom' && (
                <div className="border border-terracota/30 bg-terracota/5 rounded-lg p-3 space-y-3">
                  <p className="text-sm font-medium text-verde">
                    Calcular anticipo por porcentaje
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESETS_PCT.map((pct) => {
                      const activo = porcentaje === pct
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => aplicarPorcentaje(pct)}
                          aria-pressed={activo}
                          aria-label={`Anticipo del ${pct} por ciento`}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            activo
                              ? 'bg-terracota text-white border-terracota'
                              : 'bg-white text-verde border-neutro-borde hover:bg-neutro-light'
                          }`}
                        >
                          {pct}%
                        </button>
                      )
                    })}
                    <div className="flex items-center gap-1">
                      <label
                        htmlFor="link-mp-pct-libre"
                        className="text-sm text-verde-suave"
                      >
                        % libre
                      </label>
                      <input
                        id="link-mp-pct-libre"
                        type="number"
                        min={0}
                        max={100}
                        step="1"
                        value={porcentaje}
                        onChange={(e) => aplicarPorcentaje(Number(e.target.value))}
                        className="w-20 border border-neutro-borde rounded-lg px-2 py-1.5 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-verde">
                    Anticipo:{' '}
                    <span className="font-semibold tabular-nums">
                      {formatMXN(montoCustom)}
                    </span>{' '}
                    <span className="text-verde-suave">
                      ({porcentaje}% de {formatMXN(totalActual)})
                    </span>
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="link-mp-monto"
                  className="block text-sm font-medium text-verde mb-1"
                >
                  Monto (MXN)
                </label>
                <input
                  id="link-mp-monto"
                  type="number"
                  min={0}
                  step="0.01"
                  value={tipo === 'custom' ? montoCustom : montoEfectivo}
                  onChange={(e) => {
                    const monto = Number(e.target.value)
                    setMontoCustom(monto)
                    // Mantener el % del preview coherente con el monto crudo
                    setPorcentaje(
                      totalActual > 0
                        ? Math.round((monto / totalActual) * 100)
                        : 0,
                    )
                  }}
                  readOnly={tipo !== 'custom'}
                  className={`w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota ${
                    tipo !== 'custom' ? 'bg-neutro-light cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="link-mp-vigencia"
                    className="block text-sm font-medium text-verde mb-1"
                  >
                    Vigencia (dias)
                  </label>
                  <input
                    id="link-mp-vigencia"
                    type="number"
                    min={1}
                    max={30}
                    value={vigenciaDias}
                    onChange={(e) => setVigenciaDias(Number(e.target.value))}
                    className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enviarEmail}
                      onChange={(e) => setEnviarEmail(e.target.checked)}
                      className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                    />
                    Enviar email al cliente
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="link-mp-concepto"
                  className="block text-sm font-medium text-verde mb-1"
                >
                  Concepto
                </label>
                <input
                  id="link-mp-concepto"
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                />
              </div>

              <div className="bg-neutro-light rounded-lg p-3 text-xs text-verde-suave">
                Preview URL:{' '}
                <span className="italic">(se generara al guardar)</span>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-verde/10 border border-verde/30 rounded-lg p-3 text-sm text-verde">
                Link generado correctamente.
              </div>
              <div>
                <label className="block text-sm font-medium text-verde mb-1">
                  Link de pago
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={result.init_point ?? ''}
                    className="flex-1 border border-neutro-borde rounded-lg px-3 py-2 text-sm bg-neutro-light"
                    aria-label="Link MercadoPago generado"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-label="Copiar link"
                    className="inline-flex items-center gap-1 bg-terracota hover:bg-terracota-dark text-white px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-verde-suave">
                Preference ID: <span className="font-mono">{result.preference_id ?? '—'}</span>
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-neutro-borde px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light"
          >
            {result ? 'Cerrar' : 'Cancelar'}
          </button>
          {!result && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || montoEfectivo <= 0}
              className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Generar link
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
