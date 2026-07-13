'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { MotivoReagenda } from '@/types/reservas'
import { extraerMensajeError } from './errores'

interface ModalReagendarProps {
  reservaId: string
  bookingId?: string
  fechaActual: string
  horaActual: string
  onSaved: () => void
  onClose: () => void
}

const MOTIVOS: { value: MotivoReagenda; label: string }[] = [
  { value: 'cliente_solicito', label: 'Cliente solicito' },
  { value: 'clima', label: 'Clima' },
  { value: 'logistica_interna', label: 'Logistica interna' },
  { value: 'fuerza_mayor', label: 'Fuerza mayor' },
  { value: 'otro', label: 'Otro' },
]

function todayISO(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function ModalReagendar({
  reservaId,
  bookingId,
  fechaActual,
  horaActual,
  onSaved,
  onClose,
}: ModalReagendarProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [nuevaFecha, setNuevaFecha] = useState<string>(fechaActual)
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState<string>(
    horaActual?.slice(0, 5) ?? '',
  )
  const [motivo, setMotivo] = useState<MotivoReagenda>('cliente_solicito')
  const [notas, setNotas] = useState<string>('')
  const [notificarCliente, setNotificarCliente] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!token) {
      setError('Sesion no valida')
      return
    }
    if (!nuevaFecha || !nuevaHoraInicio) {
      setError('Fecha y hora son obligatorias')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reservaId}/reagendar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nueva_fecha: nuevaFecha,
            nueva_hora: nuevaHoraInicio,
            motivo,
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
      setError(err instanceof Error ? err.message : 'Error al reagendar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reagendar-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[92vh] flex flex-col">
        <header className="border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="modal-reagendar-title" className="font-display text-xl text-verde">
              Reagendar reserva
            </h2>
            {bookingId && (
              <p className="text-xs text-verde-suave mt-0.5 font-mono">{bookingId}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal reagendar"
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

          <div className="bg-neutro-light rounded-lg p-3 text-sm">
            <p className="text-verde-suave">Fecha y hora actual</p>
            <p className="text-verde font-medium tabular-nums">
              {fechaActual} · {horaActual?.slice(0, 5)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reagendar-fecha"
                className="block text-sm font-medium text-verde mb-1"
              >
                Nueva fecha
              </label>
              <input
                id="reagendar-fecha"
                type="date"
                min={todayISO()}
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
            </div>
            <div>
              <label
                htmlFor="reagendar-hora"
                className="block text-sm font-medium text-verde mb-1"
              >
                Nueva hora
              </label>
              <input
                id="reagendar-hora"
                type="time"
                value={nuevaHoraInicio}
                onChange={(e) => setNuevaHoraInicio(e.target.value)}
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reagendar-motivo"
              className="block text-sm font-medium text-verde mb-1"
            >
              Motivo
            </label>
            <select
              id="reagendar-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value as MotivoReagenda)}
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              {MOTIVOS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reagendar-notas"
              className="block text-sm font-medium text-verde mb-1"
            >
              Notas
            </label>
            <textarea
              id="reagendar-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              placeholder="Comentarios adicionales..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
            <input
              type="checkbox"
              checked={notificarCliente}
              onChange={(e) => setNotificarCliente(e.target.checked)}
              className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
            />
            Notificar al cliente por email
          </label>

          <div className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-3 text-sm text-amarillo flex gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Al confirmar se actualiza BD, se libera slot original, se reasigna chinampa,
              se envia email a cliente y guia, y se reprograman recordatorios.
            </p>
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
            disabled={submitting || !nuevaFecha || !nuevaHoraInicio}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Confirmar reagendado
          </button>
        </footer>
      </div>
    </div>
  )
}
