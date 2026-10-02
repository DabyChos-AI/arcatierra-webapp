'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, CalendarPlus, Loader2, RefreshCw, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { esConflictoVersion } from '@/types/planeacion'
import type {
  EventoInternoPayload,
  EventoPlaneacion,
  EventoPlaneacionPatch,
} from '@/types/planeacion'
import {
  SelectChinampa,
  SelectCocina,
  SelectIdioma,
  SelectorGuias,
  inputClass,
} from './CamposPlaneacion'
import type { CatalogosEventos } from './useCatalogosEventos'
import { horaCorta, hoyMexico } from './fechas'
import { mismosIds, textoONull } from './utils'

// Lo que más se captura (el Sheet los trae así); se puede escribir cualquier otro
const SUGERENCIAS_NOMBRE = ['Scouting', 'Montaje', 'Descanso']

interface FormInterno {
  nombre: string
  descripcion: string
  fecha: string
  horaInicio: string
  horaFin: string
  chinampa: string
  cocinaId: string
  idioma: string
  personas: string
  notas: string
  guias: string[]
}

function formDe(evento: EventoPlaneacion | null, fechaSugerida: string | undefined): FormInterno {
  return {
    nombre: evento?.nombre_evento ?? '',
    descripcion: evento?.descripcion ?? '',
    fecha: evento?.fecha_evento ?? fechaSugerida ?? hoyMexico(),
    horaInicio: horaCorta(evento?.hora_inicio),
    horaFin: horaCorta(evento?.hora_fin),
    chinampa: evento?.chinampa ?? '',
    cocinaId: evento?.cocina_id ?? '',
    idioma: evento?.idioma ?? '',
    personas: evento?.personas != null ? String(evento.personas) : '',
    notas: evento?.notas_internas ?? '',
    guias: evento?.guias.map((g) => g.personal_id) ?? [],
  }
}

/**
 * Crear o editar un evento interno (Scouting, Montaje, Descanso…): oculto al público y
 * sin reserva. Crear → POST /internos. Editar → PATCH con todos los campos (null limpia).
 *
 * Fecha al crear: `fechaSugerida` (R4: la grilla manda el día donde se pulsó «Agregar
 * interno»); sin ella, hoy de México.
 *
 * R4 · versión: al editar se manda `version` = la `fecha_actualizacion` leída. Si alguien
 * cambió el evento mientras tanto, el backend responde 409 sin escribir nada: se muestra su
 * `detail` y «Recargar» relee el evento (y su versión nueva). Nunca se reintenta solo.
 */
export default function ModalEventoInterno({
  evento,
  fechaSugerida,
  catalogos,
  onClose,
  onSaved,
}: {
  // null = crear
  evento: EventoPlaneacion | null
  // Modo crear: fecha con la que abre el formulario (R4: opcional; sin ella, hoy de México)
  fechaSugerida?: string
  catalogos: CatalogosEventos
  onClose: () => void
  onSaved: (guardado: EventoPlaneacion, creado: boolean) => void
}) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  // Lo guardado (y su versión): cambia al «Recargar» tras un 409
  const [base, setBase] = useState<EventoPlaneacion | null>(evento)
  const idsIniciales = base?.guias.map((g) => g.personal_id) ?? []
  const [form, setForm] = useState<FormInterno>(() => formDe(evento, fechaSugerida))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // R4: `detail` del 409 (versión vieja)
  const [conflicto, setConflicto] = useState<string | null>(null)
  const [recargando, setRecargando] = useState(false)

  const set = <K extends keyof FormInterno>(campo: K, valor: FormInterno[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }))

  const cerrar = () => {
    if (!saving && !recargando) onClose()
  }

  // Relee el evento completo (permiso reservas) y pone en el formulario lo guardado
  const recargar = async () => {
    if (!token || !base) return
    setRecargando(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/eventos/${base.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const fresco = (await res.json()) as EventoPlaneacion
      setBase(fresco)
      setForm(formDe(fresco, fechaSugerida))
      setConflicto(null)
    } catch (err) {
      setError(`No se pudo recargar el evento: ${err instanceof Error ? err.message : 'sin conexión'}`)
    } finally {
      setRecargando(false)
    }
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError(null)
    const nombre = form.nombre.trim()
    if (!nombre) return setError('Escribe el nombre del evento')
    if (!form.fecha) return setError('Elige la fecha')
    if (!form.horaInicio) return setError('Escribe la hora de inicio')
    if (form.horaFin && form.horaFin <= form.horaInicio) {
      return setError('La hora de fin debe ser posterior a la hora de inicio')
    }
    let personas: number | null = null
    if (form.personas.trim() !== '') {
      personas = Number(form.personas)
      if (!Number.isInteger(personas) || personas < 0) {
        return setError('Personas debe ser un número entero, 0 o más')
      }
    }
    const idioma = form.idioma === 'es' || form.idioma === 'en' ? form.idioma : null

    setSaving(true)
    setConflicto(null)
    try {
      let res: Response
      if (base) {
        const patch: EventoPlaneacionPatch = {
          nombre_evento: nombre,
          descripcion: textoONull(form.descripcion),
          fecha_evento: form.fecha,
          hora_inicio: form.horaInicio,
          hora_fin: form.horaFin || null,
          chinampa: form.chinampa || null,
          cocina_id: form.cocinaId || null,
          idioma,
          personas,
          notas_internas: textoONull(form.notas),
        }
        // guias_ids reemplaza la lista y el backend exige guías activos: solo si cambió
        if (!mismosIds(form.guias, idsIniciales)) patch.guias_ids = form.guias
        // R4: la versión leída, tal cual (sin ella, el backend guarda como antes)
        if (base.fecha_actualizacion) patch.version = base.fecha_actualizacion
        res = await fetch(`${API_URL}/api/admin/eventos/${base.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
      } else {
        const payload: EventoInternoPayload = {
          nombre_evento: nombre,
          descripcion: textoONull(form.descripcion),
          fecha_evento: form.fecha,
          hora_inicio: form.horaInicio,
          hora_fin: form.horaFin || null,
          chinampa: form.chinampa || null,
          cocina_id: form.cocinaId || null,
          idioma,
          personas,
          notas_internas: textoONull(form.notas),
          guias_ids: form.guias,
        }
        res = await fetch(`${API_URL}/api/admin/eventos/internos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        const payload: unknown = await res.json().catch(() => null)
        if (esConflictoVersion(res.status, payload)) {
          setConflicto(payload.detail)
          return
        }
        throw new Error(extraerMensajeError(payload, res.status))
      }
      onSaved((await res.json()) as EventoPlaneacion, !base)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-20 pb-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      <form
        onSubmit={guardar}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interno-modal-titulo"
        data-testid="evento-modal"
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl">
          <h2
            id="interno-modal-titulo"
            className="font-display text-xl text-verde flex items-center gap-2"
          >
            <CalendarPlus className="h-5 w-5 text-terracota" aria-hidden="true" />
            {base ? 'Editar evento interno' : 'Nuevo evento interno'}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            disabled={saving || recargando}
            aria-label="Cerrar modal"
            className="p-2 hover:bg-neutro-light rounded-lg"
          >
            <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {catalogos.error && (
            <p className="text-sm text-verde bg-amarillo-bg border border-amarillo/30 rounded-lg p-3">
              {catalogos.error} Se muestra lo guardado.
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {conflicto && (
            <div
              role="alert"
              data-testid="evento-conflicto"
              className="p-3 bg-amarillo-bg border border-amarillo/40 rounded-lg text-sm text-verde space-y-2"
            >
              <p className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amarillo" aria-hidden="true" />
                <span>{conflicto}</span>
              </p>
              <button
                type="button"
                onClick={recargar}
                disabled={recargando}
                data-testid="evento-conflicto-recargar"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutro-borde bg-white text-verde text-sm hover:bg-neutro-light disabled:opacity-50"
              >
                {recargando ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                Recargar: se pierde lo que no guardaste
              </button>
            </div>
          )}

          <div>
            <label htmlFor="ei-nombre" className="block text-sm font-medium text-verde mb-1">
              Nombre <span className="text-rojo">*</span>
            </label>
            <input
              id="ei-nombre"
              type="text"
              required
              maxLength={255}
              list="ei-nombre-sugerencias"
              value={form.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder="Scouting, Montaje, Descanso…"
              data-testid="evento-nombre"
              className={inputClass}
            />
            <datalist id="ei-nombre-sugerencias">
              {SUGERENCIAS_NOMBRE.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="ei-descripcion" className="block text-sm font-medium text-verde mb-1">
              Descripción
            </label>
            <textarea
              id="ei-descripcion"
              rows={2}
              maxLength={4000}
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="ei-fecha" className="block text-sm font-medium text-verde mb-1">
                Fecha <span className="text-rojo">*</span>
              </label>
              <input
                id="ei-fecha"
                type="date"
                required
                value={form.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                data-testid="evento-fecha"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ei-hora-inicio" className="block text-sm font-medium text-verde mb-1">
                Inicio <span className="text-rojo">*</span>
              </label>
              <input
                id="ei-hora-inicio"
                type="time"
                required
                value={form.horaInicio}
                onChange={(e) => set('horaInicio', e.target.value)}
                data-testid="evento-hora-inicio"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ei-hora-fin" className="block text-sm font-medium text-verde mb-1">
                Fin
              </label>
              <input
                id="ei-hora-fin"
                type="time"
                value={form.horaFin}
                onChange={(e) => set('horaFin', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SelectChinampa
              id="ei-chinampa"
              value={form.chinampa}
              guardada={base?.chinampa ?? null}
              chinampas={catalogos.chinampas}
              onChange={(v) => set('chinampa', v)}
            />
            <SelectCocina
              id="ei-cocina"
              value={form.cocinaId}
              guardada={
                base?.cocina_id ? { id: base.cocina_id, nombre: base.cocina_nombre } : null
              }
              cocinas={catalogos.cocinas}
              onChange={(v) => set('cocinaId', v)}
            />
            <SelectIdioma id="ei-idioma" value={form.idioma} onChange={(v) => set('idioma', v)} />
            <div>
              <label htmlFor="ei-personas" className="block text-sm font-medium text-verde mb-1">
                Personas
              </label>
              <input
                id="ei-personas"
                type="number"
                min={0}
                step={1}
                value={form.personas}
                onChange={(e) => set('personas', e.target.value)}
                data-testid="evento-personas"
                className={`${inputClass} tabular-nums`}
              />
            </div>
          </div>

          <SelectorGuias
            id="ei-guias"
            guias={catalogos.guias}
            asignados={base?.guias ?? []}
            seleccion={form.guias}
            onChange={(ids) => set('guias', ids)}
          />

          <div>
            <label htmlFor="ei-notas" className="block text-sm font-medium text-verde mb-1">
              Notas internas
            </label>
            <textarea
              id="ei-notas"
              rows={2}
              maxLength={4000}
              value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutro-borde sticky bottom-0 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={cerrar}
            disabled={saving}
            className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || recargando}
            data-testid="evento-guardar"
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {base ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
