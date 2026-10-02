'use client'

import { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Info, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { hoyMexico, horaCorta } from '@/app/admin/eventos/components/fechas'
import type { MotivoReagenda, ReagendarResponse } from '@/types/reservas'
import { extraerMensajeError } from './errores'

interface ModalReagendarProps {
  reservaId: string
  bookingId?: string
  fechaActual: string
  horaActual: string
  /** HH:MM:SS o null. RG1: el back mueve la hora de término igual que el inicio. */
  horaFinActual?: string | null
  /** RGP1 (R8): duración del catálogo (`reserva.experiencia_duracion_horas`); se usa solo si la hora de término guardada
   *  no es posterior al inicio (la misma regla que el back en POST /reagendar). */
  duracionHoras?: number | null
  /** Guías asignados con correo y en total (el detalle los cuenta de `reserva.guias[].email`). */
  guiasConCorreo: number
  guiasTotal: number
  onSaved: (res: ReagendarResponse) => void
  onClose: () => void
}

// Mismos textos que MOTIVOS_REAGENDA del backend: la nota interna y el correo los usan.
const MOTIVOS: { value: MotivoReagenda; label: string }[] = [
  { value: 'cliente_solicito', label: 'A petición del cliente' },
  { value: 'clima', label: 'Clima' },
  { value: 'logistica_interna', label: 'Logística interna' },
  { value: 'fuerza_mayor', label: 'Fuerza mayor' },
  { value: 'otro', label: 'Otro' },
]

const MINUTOS_DIA = 24 * 60
// ReagendarRequest.notas: max_length=1000
const MAX_NOTAS = 1000

function aMinutos(hora: string | null | undefined): number | null {
  const m = /^(\d{2}):(\d{2})/.exec(hora ?? '')
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

function deMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function ModalReagendar({
  reservaId,
  bookingId,
  fechaActual,
  horaActual,
  horaFinActual,
  duracionHoras,
  guiasConCorreo,
  guiasTotal,
  onSaved,
  onClose,
}: ModalReagendarProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [nuevaFecha, setNuevaFecha] = useState<string>(fechaActual)
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState<string>(horaCorta(horaActual))
  const [motivo, setMotivo] = useState<MotivoReagenda>('cliente_solicito')
  const [notas, setNotas] = useState<string>('')
  const [notificarCliente, setNotificarCliente] = useState<boolean>(true)
  const [notificarGuias, setNotificarGuias] = useState<boolean>(guiasConCorreo > 0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const puedeAvisarGuias = guiasConCorreo > 0

  // La duración se conserva: fin nuevo = inicio nuevo + (fin − inicio). RGP1 (R8), la misma regla que el back
  // (admin_reservas.py, reagendar): si el fin guardado no es posterior al inicio (dato malo), la duración es la de la
  // experiencia; sin fin guardado o sin duración, no hay término que mover. Si cae en otro día, el back responde 400.
  const finNuevo = useMemo(() => {
    // Un numeric de Postgres puede llegar como texto («2.50»): se lee como número; inválido o ≤ 0 = sin duración
    const horasCatalogo = duracionHoras == null ? 0 : Number(duracionHoras)
    const inicio = aMinutos(horaActual)
    const fin = aMinutos(horaFinActual)
    const nuevoInicio = aMinutos(nuevaHoraInicio)
    if (inicio === null || fin === null || nuevoInicio === null) return null
    let duracion: number
    let origen: 'reserva' | 'catalogo'
    if (fin > inicio) {
      duracion = fin - inicio
      origen = 'reserva'
    } else if (Number.isFinite(horasCatalogo) && horasCatalogo > 0) {
      duracion = Math.round(horasCatalogo * 60)
      origen = 'catalogo'
    } else {
      return null
    }
    const minutos = nuevoInicio + duracion
    return { minutos, cruzaMedianoche: minutos >= MINUTOS_DIA, origen }
  }, [horaActual, horaFinActual, duracionHoras, nuevaHoraInicio])

  const sinCambios =
    nuevaFecha === fechaActual && nuevaHoraInicio === horaCorta(horaActual)

  async function handleSubmit() {
    if (!token) {
      setError('Sesion no valida')
      return
    }
    if (!nuevaFecha || !nuevaHoraInicio) {
      setError('Fecha y hora son obligatorias')
      return
    }
    if (sinCambios) {
      setError('La nueva fecha y hora son iguales a las actuales.')
      return
    }
    if (finNuevo?.cruzaMedianoche) {
      setError('La experiencia terminaría después de la medianoche: elige una hora más temprana.')
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
          // ReagendarRequest (C6): los seis campos en el primer nivel
          body: JSON.stringify({
            nueva_fecha: nuevaFecha,
            nueva_hora: nuevaHoraInicio,
            motivo,
            notas: notas.trim() || null,
            notificar_cliente: notificarCliente,
            notificar_guias: puedeAvisarGuias && notificarGuias,
          }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(extraerMensajeError(err, res.status))
      }
      const data = (await res.json()) as ReagendarResponse
      onSaved(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reagendar')
    } finally {
      setSubmitting(false)
    }
  }

  const etiquetaGuias =
    guiasTotal === 0
      ? 'no hay guías asignados'
      : `${guiasConCorreo} de ${guiasTotal} ${guiasTotal === 1 ? 'tiene' : 'tienen'} correo`

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reagendar-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col">
        <header className="shrink-0 border-b border-neutro-borde px-4 sm:px-6 py-4 flex items-center justify-between">
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

        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4">
          {error && (
            <div role="alert" className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo">
              {error}
            </div>
          )}

          <div className="bg-neutro-light rounded-lg p-3 text-sm">
            <p className="text-verde-suave">Fecha y hora actual</p>
            <p className="text-verde font-medium tabular-nums">
              {formatFechaMexico(fechaActual)} · {horaCorta(horaActual)}
              {horaFinActual ? `–${horaCorta(horaFinActual)}` : ''}
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
                min={hoyMexico()}
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
                aria-describedby={finNuevo ? 'reagendar-fin' : undefined}
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
            </div>
          </div>
          {finNuevo && (
            <p
              id="reagendar-fin"
              data-testid="reag-fin"
              data-origen={finNuevo.origen}
              className={`text-xs -mt-2 ${finNuevo.cruzaMedianoche ? 'text-rojo' : 'text-verde-suave'}`}
            >
              {finNuevo.cruzaMedianoche
                ? 'La experiencia terminaría después de la medianoche: elige una hora más temprana.'
                : finNuevo.origen === 'catalogo'
                  ? `Terminará a las ${deMinutos(finNuevo.minutos)} (duración de la experiencia).`
                  : `Terminará a las ${deMinutos(finNuevo.minutos)} (la duración no cambia).`}
            </p>
          )}

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
              Notas internas (opcional)
            </label>
            <textarea
              id="reagendar-notas"
              data-testid="reag-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              maxLength={MAX_NOTAS}
              aria-describedby="reagendar-notas-ayuda"
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              placeholder="Se guardan en la nota del reagendado; el cliente no las ve."
            />
            <p id="reagendar-notas-ayuda" className="text-xs text-verde-suave mt-1">
              {notas.length}/{MAX_NOTAS}
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-verde mb-1">Avisos por correo</legend>
            <label className="flex items-start gap-2 text-sm text-verde cursor-pointer">
              <input
                type="checkbox"
                data-testid="reag-notificar-cliente"
                checked={notificarCliente}
                onChange={(e) => setNotificarCliente(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-terracota border-neutro-borde rounded focus:ring-terracota"
              />
              <span>Avisar al cliente por correo (plantilla Reagendamiento)</span>
            </label>
            <label
              className={`flex items-start gap-2 text-sm ${
                puedeAvisarGuias ? 'text-verde cursor-pointer' : 'text-verde-suave cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                data-testid="reag-notificar-guias"
                checked={puedeAvisarGuias && notificarGuias}
                disabled={!puedeAvisarGuias}
                onChange={(e) => setNotificarGuias(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-terracota border-neutro-borde rounded focus:ring-terracota disabled:opacity-50"
              />
              <span>Avisar por correo a los guías asignados ({etiquetaGuias})</span>
            </label>
          </fieldset>

          <div
            data-testid="reag-aviso"
            className="bg-azul-bg border border-azul/30 rounded-lg p-3 text-sm text-verde flex gap-2"
          >
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-azul" aria-hidden="true" />
            <div className="space-y-1">
              <p>
                Al confirmar se cambian la fecha y la hora de inicio
                {finNuevo
                  ? finNuevo.origen === 'catalogo'
                    ? '; la hora de término sale de la duración de la experiencia'
                    : '; la hora de término se mueve igual'
                  : ' (la reserva no tiene una hora de término que mover)'}
                . El estado, la chinampa y
                los guías no cambian, y el cambio queda en las notas internas. El recordatorio del
                día anterior se calcula con la nueva fecha.
              </p>
              <p>
                {notificarCliente
                  ? 'Al cliente se le manda la plantilla Reagendamiento solo si está activa en su idioma y tiene correo real (las reservas del Sheet y de reseller no reciben correos).'
                  : 'Al cliente no se le manda la plantilla Reagendamiento: avísale tú.'}{' '}
                {puedeAvisarGuias && notificarGuias
                  ? `${guiasConCorreo === 1 ? 'El guía con correo recibe' : `Los ${guiasConCorreo} guías con correo reciben`} el cambio de fecha (sin datos del cliente).`
                  : 'A los guías no se les manda correo: avísales tú.'}
              </p>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-neutro-borde px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
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
            disabled={
              submitting || !nuevaFecha || !nuevaHoraInicio || finNuevo?.cruzaMedianoche === true
            }
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
