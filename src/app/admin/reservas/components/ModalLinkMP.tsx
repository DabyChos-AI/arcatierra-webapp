'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Copy, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { formatMXN, textoCorreo, type LinkPagoResponse } from '@/types/reservas'
import { extraerMensajeError } from './errores'

interface ModalLinkMPProps {
  reservaId: string
  bookingId?: string
  totalActual: number
  anticipoSugerido: number
  balance: number
  onCreated: (res: LinkPagoResponse) => void
  onClose: () => void
}

type TipoLink = 'anticipo' | 'balance' | 'total' | 'custom'

// LinkPagoRequest (C7): vigencia_dias entero 1–30, concepto ≤120 (vacío = no se manda)
interface LinkPagoPayload {
  tipo: string
  monto_override?: number
  vigencia_dias?: number
  concepto?: string
  enviar_email: boolean
}

const VIGENCIA_MIN = 1
const VIGENCIA_MAX = 30
const MAX_CONCEPTO = 120

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
  // Texto: vacío = sin vencimiento (no se manda vigencia_dias)
  const [vigenciaDias, setVigenciaDias] = useState<string>('7')
  const [concepto, setConcepto] = useState<string>(
    `Anticipo reserva ${bookingId ?? ''}`.trim(),
  )
  const [enviarEmail, setEnviarEmail] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LinkPagoResponse | null>(null)
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

  // Auto-actualizar el concepto SOLO cuando cambia el tipo (antes también al mover el %,
  // y borraba lo que la vendedora hubiera escrito)
  useEffect(() => {
    const baseId = bookingId ?? reservaId.slice(0, 8)
    if (tipo === 'anticipo') setConcepto(`Anticipo reserva ${baseId}`)
    else if (tipo === 'balance') setConcepto(`Balance reserva ${baseId}`)
    else if (tipo === 'total') setConcepto(`Pago total reserva ${baseId}`)
    else if (tipo === 'custom') setConcepto(`Pago reserva ${baseId}`)
  }, [tipo, bookingId, reservaId])

  useEffect(() => {
    if (tipo !== 'custom') return
    // Bug 4b: sembrar el monto al abrir "Personalizado" para no mostrar $0.00
    setMontoCustom((prev) =>
      prev > 0 ? prev : Math.round(totalActual * (porcentaje / 100) * 100) / 100,
    )
  }, [tipo, totalActual, porcentaje])

  async function handleSubmit() {
    if (!token) {
      setError('Sesion no valida')
      return
    }
    if (montoEfectivo <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    const vigenciaTexto = vigenciaDias.trim()
    const vigencia = vigenciaTexto === '' ? null : Number(vigenciaTexto)
    if (
      vigencia !== null &&
      (!Number.isInteger(vigencia) || vigencia < VIGENCIA_MIN || vigencia > VIGENCIA_MAX)
    ) {
      setError(`La vigencia va de ${VIGENCIA_MIN} a ${VIGENCIA_MAX} días (vacía = sin vencimiento).`)
      return
    }
    const conceptoLimpio = concepto.trim()
    if (conceptoLimpio.length > MAX_CONCEPTO) {
      setError(`El concepto admite hasta ${MAX_CONCEPTO} caracteres.`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      // Backend espera: { tipo: 'anticipo'|'balance'|'completo', monto_override?: number }
      // 'total' del UI → 'completo' del backend. 'custom' → 'anticipo' + monto_override.
      const tipoBackend =
        tipo === 'total' ? 'completo' : tipo === 'custom' ? 'anticipo' : tipo
      const payload: LinkPagoPayload = { tipo: tipoBackend, enviar_email: enviarEmail }
      if (tipo === 'custom') {
        payload.monto_override = montoCustom
      }
      if (vigencia !== null) payload.vigencia_dias = vigencia
      if (conceptoLimpio) payload.concepto = conceptoLimpio
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
      const data = (await res.json()) as LinkPagoResponse
      // Backend devuelve 200 OK incluso si MP falla — verificar success
      if (!data.success || !data.init_point) {
        throw new Error(
          data.warning || 'MercadoPago no genero el link. Revisa configuracion MP_ACCESS_TOKEN.',
        )
      }
      setResult(data)
      onCreated(data)
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
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-link-mp-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col">
        <header className="shrink-0 border-b border-neutro-borde px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
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

        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4">
          {error && (
            <div role="alert" className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo">
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

              <div>
                <label
                  htmlFor="link-mp-vigencia"
                  className="block text-sm font-medium text-verde mb-1"
                >
                  Vigencia (días)
                </label>
                <input
                  id="link-mp-vigencia"
                  data-testid="link-vigencia"
                  type="number"
                  inputMode="numeric"
                  min={VIGENCIA_MIN}
                  max={VIGENCIA_MAX}
                  step={1}
                  value={vigenciaDias}
                  onChange={(e) => setVigenciaDias(e.target.value)}
                  aria-describedby="link-mp-vigencia-ayuda"
                  className="w-32 border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                />
                <p id="link-mp-vigencia-ayuda" className="text-xs text-verde-suave mt-1">
                  De {VIGENCIA_MIN} a {VIGENCIA_MAX} días: el link deja de aceptar pagos al terminar
                  ese día (hora de México). Vacío = sin vencimiento.
                </p>
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
                  data-testid="link-concepto"
                  type="text"
                  maxLength={MAX_CONCEPTO}
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  aria-describedby="link-mp-concepto-ayuda"
                  className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                />
                <p id="link-mp-concepto-ayuda" className="text-xs text-verde-suave mt-1">
                  Lo que el cliente ve en MercadoPago ({concepto.length}/{MAX_CONCEPTO}).
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm text-verde cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="link-enviar-email"
                  checked={enviarEmail}
                  onChange={(e) => setEnviarEmail(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-terracota border-neutro-borde rounded focus:ring-terracota"
                />
                <span>
                  Enviar email al cliente
                  <span className="block text-xs text-verde-suave">
                    Usa la plantilla «Link de pago» (Plantillas Email) solo si está activa en el
                    idioma de la reserva y el cliente tiene correo real; si no, no sale nada y te
                    decimos por qué.
                  </span>
                </span>
              </label>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-verde/10 border border-verde/30 rounded-lg p-3 text-sm text-verde">
                Link generado correctamente.
              </div>
              <div>
                <p className="block text-sm font-medium text-verde mb-1">Link de pago</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={result.init_point ?? ''}
                    className="flex-1 min-w-0 border border-neutro-borde rounded-lg px-3 py-2 text-sm bg-neutro-light"
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
              <div className="text-sm text-verde space-y-1">
                <p className="tabular-nums">Monto: {formatMXN(Number(result.monto))}</p>
                {result.concepto && <p className="break-words">Concepto: {result.concepto}</p>}
                <p data-testid="link-resultado-vence">
                  {result.vence_en
                    ? `Vence: ${formatFechaMexico(result.vence_en)} (al terminar el día, hora de México)`
                    : 'Sin vencimiento'}
                </p>
              </div>
              {result.correo_cliente && (
                <p
                  data-testid="link-resultado-correo"
                  className={`text-sm rounded-lg p-3 border ${
                    result.correo_cliente.encolado
                      ? 'bg-verde/10 border-verde/30 text-verde'
                      : 'bg-amarillo-bg border-amarillo/30 text-verde'
                  }`}
                >
                  {textoCorreo(result.correo_cliente)}
                </p>
              )}
              <p className="text-xs text-verde-suave break-all">
                Preference ID: <span className="font-mono">{result.preference_id ?? '—'}</span>
              </p>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-neutro-borde px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
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
