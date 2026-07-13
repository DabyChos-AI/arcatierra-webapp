'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatMXN, type TipoPago } from '@/types/reservas'
import { extraerMensajeError } from './errores'

interface ModalPagoManualProps {
  reservaId: string
  bookingId?: string
  saldoPendiente: number
  onSaved: () => void
  onClose: () => void
}

type MetodoPago = 'efectivo' | 'transferencia' | 'mp_manual'

const TIPOS: { value: TipoPago; label: string }[] = [
  { value: 'anticipo', label: 'Anticipo' },
  { value: 'balance', label: 'Balance' },
  { value: 'unico', label: 'Pago unico' },
  { value: 'pago_parcial', label: 'Pago parcial' },
]

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'mp_manual', label: 'MercadoPago (manual)' },
]

export default function ModalPagoManual({
  reservaId,
  bookingId,
  saldoPendiente,
  onSaved,
  onClose,
}: ModalPagoManualProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [tipoPago, setTipoPago] = useState<TipoPago>('anticipo')
  const [metodo, setMetodo] = useState<MetodoPago>('transferencia')
  const [monto, setMonto] = useState<number>(0)
  const [ref, setRef] = useState<string>('')
  const [notas, setNotas] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!token) {
      setError('Sesion no valida')
      return
    }
    if (monto <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }
    if (saldoPendiente > 0 && monto > saldoPendiente) {
      setError(`El monto no puede exceder el saldo pendiente (${formatMXN(saldoPendiente)})`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reservaId}/pagos`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo_pago: tipoPago,
            monto: Number(monto),
            metodo: metodo,
            notas: ref ? `${notas ?? ''} (ref: ${ref})`.trim() : notas,
          }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(extraerMensajeError(err, res.status))
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar pago')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pago-manual-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[92vh] flex flex-col">
        <header className="border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="modal-pago-manual-title" className="font-display text-xl text-verde">
              Registrar pago manual
            </h2>
            {bookingId && (
              <p className="text-xs text-verde-suave mt-0.5 font-mono">{bookingId}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal pago manual"
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

          <div className="bg-neutro-light rounded-lg p-3 text-sm flex justify-between">
            <span className="text-verde-suave">Saldo pendiente:</span>
            <span className="text-verde font-medium tabular-nums">
              {formatMXN(saldoPendiente)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="pago-tipo"
                className="block text-sm font-medium text-verde mb-1"
              >
                Tipo de pago
              </label>
              <select
                id="pago-tipo"
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value as TipoPago)}
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="pago-metodo"
                className="block text-sm font-medium text-verde mb-1"
              >
                Metodo
              </label>
              <select
                id="pago-metodo"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as MetodoPago)}
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              >
                {METODOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="pago-monto"
              className="block text-sm font-medium text-verde mb-1"
            >
              Monto (MXN)
            </label>
            <input
              id="pago-monto"
              type="number"
              min={0}
              step="0.01"
              max={saldoPendiente > 0 ? saldoPendiente : undefined}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>

          <div>
            <label
              htmlFor="pago-ref"
              className="block text-sm font-medium text-verde mb-1"
            >
              Referencia (opcional)
            </label>
            <input
              id="pago-ref"
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Ref transferencia o ticket MP"
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>

          <div>
            <label
              htmlFor="pago-notas"
              className="block text-sm font-medium text-verde mb-1"
            >
              Notas
            </label>
            <textarea
              id="pago-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              placeholder="Comentarios..."
            />
          </div>
        </div>

        <footer className="border-t border-neutro-borde px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || monto <= 0}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Registrar pago
          </button>
        </footer>
      </div>
    </div>
  )
}
