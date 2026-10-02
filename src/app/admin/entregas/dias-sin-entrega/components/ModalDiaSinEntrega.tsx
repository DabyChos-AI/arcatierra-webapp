'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarOff, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { hoyMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { DiaNoHabilAdmin, ResultadoDiaNoHabil } from '@/types/datos-cliente'
import { MAX_MOTIVO, avisoFinDeSemana, diaDeLaSemana, fechaLarga, normalizarResultado } from './dias-sin-entrega'

/**
 * R6 · M10 — Agregar un día sin entrega (`POST /api/admin/dias-no-habiles` {fecha, motivo}) o editar el motivo de uno
 * (`PATCH /api/admin/dias-no-habiles/{fecha}` {motivo}: solo el motivo, para no disparar la recolocación de canastas).
 * Los errores del backend (400 fecha pasada / sin motivo, 403, 404, 409 ya existe) se quedan en el modal (role=alert).
 */
export default function ModalDiaSinEntrega({
  token,
  dia,
  onClose,
  onSaved,
}: {
  token: string
  /** null = agregar uno nuevo; un día = editar su motivo. */
  dia: DiaNoHabilAdmin | null
  onClose: () => void
  onSaved: (resultado: ResultadoDiaNoHabil, creado: boolean) => void
}) {
  const editando = dia !== null
  const hoy = hoyMexico()
  const [fecha, setFecha] = useState(dia?.fecha ?? '')
  const [motivo, setMotivo] = useState(dia?.motivo ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const motivoLimpio = motivo.trim()
  const fechaValida = editando || (/^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha >= hoy)
  const sinCambios = editando && motivoLimpio === dia.motivo.trim()
  const puedeGuardar = fechaValida && motivoLimpio.length > 0 && motivoLimpio.length <= MAX_MOTIVO && !sinCambios
  const avisoFinde = editando ? null : avisoFinDeSemana(fecha)
  // Escribir una fecha pasada a mano (el selector ya no las ofrece) se explica en el momento: «Agregar» queda apagado
  const fechaPasada = !editando && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha < hoy

  // Escape cierra (salvo a media petición)
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) onClose()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [guardando, onClose])

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (guardando) return
    if (!puedeGuardar) return
    setGuardando(true)
    setError(null)
    try {
      const res = await fetch(
        editando
          ? `${API_URL}/api/admin/dias-no-habiles/${encodeURIComponent(dia.fecha)}`
          : `${API_URL}/api/admin/dias-no-habiles`,
        {
          method: editando ? 'PATCH' : 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(editando ? { motivo: motivoLimpio } : { fecha, motivo: motivoLimpio }),
        },
      )
      const payload: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        setError(
          res.status === 403
            ? `No tienes permiso para cambiar los días sin entrega (${extraerMensajeError(payload, res.status)}).`
            : extraerMensajeError(payload, res.status),
        )
        return
      }
      const resultado = normalizarResultado(payload)
      if (!resultado) {
        setError('Se guardó, pero la respuesta no trae el resultado. Cierra y pulsa «Actualizar» para verlo.')
        return
      }
      onSaved(resultado, !editando)
    } catch {
      setError('Sin conexión con el servidor. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !guardando) onClose()
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="dsn-modal-titulo"
        data-testid="dsn-modal"
        onSubmit={guardar}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col"
      >
        <header className="shrink-0 px-6 py-4 border-b border-neutro-borde flex items-center justify-between gap-3">
          <h2 id="dsn-modal-titulo" className="font-display text-xl text-verde m-0 flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-terracota shrink-0" aria-hidden="true" />
            {editando ? 'Editar motivo' : 'Agregar día sin entrega'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar"
            className="p-2 hover:bg-neutro-light rounded-lg disabled:opacity-50"
          >
            <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-auto px-6 py-4 space-y-4">
          {editando ? (
            <p className="text-sm text-verde">
              <span className="font-medium">{diaDeLaSemana(dia)}</span> {fechaLarga(dia.fecha)}
            </p>
          ) : (
            <div>
              <label htmlFor="dsn-fecha" className="block text-sm font-medium text-verde mb-1">
                Fecha *
              </label>
              <input
                id="dsn-fecha"
                data-testid="dsn-fecha"
                type="date"
                min={hoy}
                required
                autoFocus
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                aria-describedby="dsn-fecha-ayuda"
                aria-invalid={fechaPasada ? true : undefined}
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
              <p id="dsn-fecha-ayuda" className="mt-1 text-xs text-verde-suave">
                Hoy o un día futuro. Las canastas de suscripción de ese día se corren al siguiente día hábil; los
                pedidos de la tienda NO se mueven (al guardar verás cuáles hay para avisarles).
              </p>
              {fechaPasada && (
                <p data-testid="dsn-fecha-pasada" role="alert" className="mt-1 text-xs text-rojo">
                  La fecha ya pasó: elige hoy o un día futuro.
                </p>
              )}
              {avisoFinde && !fechaPasada && (
                <p data-testid="dsn-aviso-finde" className="mt-1 text-xs text-terracota-dark">
                  {avisoFinde}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="dsn-motivo" className="block text-sm font-medium text-verde mb-1">
              Motivo *
            </label>
            <input
              id="dsn-motivo"
              data-testid="dsn-motivo-input"
              type="text"
              required
              maxLength={MAX_MOTIVO}
              autoFocus={editando}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Inventario de bodega"
              aria-describedby="dsn-motivo-ayuda"
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
            <p id="dsn-motivo-ayuda" className="mt-1 text-xs text-verde-suave">
              Lo ve el cliente en el calendario de entregas. {motivo.length}/{MAX_MOTIVO}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              data-testid="dsn-modal-error"
              className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className="shrink-0 flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t border-neutro-borde">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="dsn-guardar"
            disabled={guardando || !puedeGuardar}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {editando ? 'Guardar motivo' : 'Agregar'}
          </button>
        </footer>
      </form>
    </div>
  )
}
