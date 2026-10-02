'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertTriangle, ClipboardList, Info, Loader2, RefreshCw, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { esConflictoVersion } from '@/types/planeacion'
import type { EventoPlaneacion, EventoPlaneacionPatch } from '@/types/planeacion'
import {
  SelectChinampa,
  SelectCocina,
  SelectIdioma,
  SelectorGuias,
  inputClass,
} from './CamposPlaneacion'
import type { CatalogosEventos } from './useCatalogosEventos'
import { horario } from './fechas'
import { mismosIds } from './utils'

/**
 * Planeación de una fecha pública: chinampa, cocina, idioma, guías y notas.
 * El PATCH lleva SOLO esos campos (el backend rechaza cualquier otro en una pública:
 * fecha, horario y cupo se cambian en Experiencias).
 *
 * R4 · versión: el PATCH lleva `version` = la `fecha_actualizacion` leída. Si alguien cambió la
 * fecha mientras tanto → 409 sin escribir nada: se muestra su `detail` y «Recargar» relee la
 * fecha (y su versión nueva). Nunca se reintenta solo.
 */
export default function ModalPlaneacionPublica({
  evento,
  catalogos,
  onClose,
  onSaved,
}: {
  evento: EventoPlaneacion
  catalogos: CatalogosEventos
  onClose: () => void
  onSaved: (actualizado: EventoPlaneacion) => void
}) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  // Lo guardado (y su versión): cambia al «Recargar» tras un 409
  const [base, setBase] = useState<EventoPlaneacion>(evento)
  const idsIniciales = base.guias.map((g) => g.personal_id)
  const [chinampa, setChinampa] = useState(evento.chinampa ?? '')
  const [cocinaId, setCocinaId] = useState(evento.cocina_id ?? '')
  const [idioma, setIdioma] = useState<string>(evento.idioma ?? '')
  const [notas, setNotas] = useState(evento.notas_internas ?? '')
  const [guias, setGuias] = useState<string[]>(() => evento.guias.map((g) => g.personal_id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // R4: `detail` del 409 (versión vieja)
  const [conflicto, setConflicto] = useState<string | null>(null)
  const [recargando, setRecargando] = useState(false)

  const cerrar = () => {
    if (!saving && !recargando) onClose()
  }

  // Relee la fecha completa (permiso reservas) y pone en el formulario lo guardado
  const recargar = async () => {
    if (!token) return
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
      setChinampa(fresco.chinampa ?? '')
      setCocinaId(fresco.cocina_id ?? '')
      setIdioma(fresco.idioma ?? '')
      setNotas(fresco.notas_internas ?? '')
      setGuias(fresco.guias.map((g) => g.personal_id))
      setConflicto(null)
    } catch (err) {
      setError(`No se pudo recargar la fecha: ${err instanceof Error ? err.message : 'sin conexión'}`)
    } finally {
      setRecargando(false)
    }
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    setConflicto(null)
    try {
      const patch: EventoPlaneacionPatch = {
        chinampa: chinampa || null,
        cocina_id: cocinaId || null,
        idioma: idioma === 'es' || idioma === 'en' ? idioma : null,
        notas_internas: notas.trim() || null,
      }
      // guias_ids reemplaza la lista completa y el backend valida que cada guía siga
      // activo: se manda solo si cambió, para no chocar con un guía dado de baja.
      if (!mismosIds(guias, idsIniciales)) patch.guias_ids = guias
      // R4: la versión leída, tal cual (sin ella, el backend guarda como antes)
      if (base.fecha_actualizacion) patch.version = base.fecha_actualizacion
      const res = await fetch(`${API_URL}/api/admin/eventos/${base.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const payload: unknown = await res.json().catch(() => null)
        if (esConflictoVersion(res.status, payload)) {
          setConflicto(payload.detail)
          return
        }
        throw new Error(extraerMensajeError(payload, res.status))
      }
      onSaved((await res.json()) as EventoPlaneacion)
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
        aria-labelledby="planeacion-modal-titulo"
        data-testid="evento-modal"
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl">
          <div>
            <h2
              id="planeacion-modal-titulo"
              className="font-display text-xl text-verde flex items-center gap-2"
            >
              <ClipboardList className="h-5 w-5 text-terracota" aria-hidden="true" />
              Planeación de la fecha
            </h2>
            <p className="text-sm text-verde-suave mt-0.5">
              {base.experiencia_nombre ?? base.nombre_evento} ·{' '}
              {formatFechaMexico(base.fecha_evento, { weekday: 'long' })} ·{' '}
              {horario(base.hora_inicio, base.hora_fin)}
            </p>
          </div>
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
          <div className="bg-azul-bg border border-azul/30 rounded-lg p-3 text-sm text-azul flex gap-2">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              La fecha, el horario y el cupo se cambian en{' '}
              <Link href="/admin/experiencias-publicas" className="underline font-medium">
                Experiencias
              </Link>
              .
            </p>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectChinampa
              id="pp-chinampa"
              value={chinampa}
              guardada={base.chinampa}
              chinampas={catalogos.chinampas}
              onChange={setChinampa}
            />
            <SelectCocina
              id="pp-cocina"
              value={cocinaId}
              guardada={
                base.cocina_id ? { id: base.cocina_id, nombre: base.cocina_nombre } : null
              }
              cocinas={catalogos.cocinas}
              onChange={setCocinaId}
            />
            <SelectIdioma id="pp-idioma" value={idioma} onChange={setIdioma} />
          </div>

          <SelectorGuias
            id="pp-guias"
            guias={catalogos.guias}
            asignados={base.guias}
            seleccion={guias}
            onChange={setGuias}
          />

          <div>
            <label htmlFor="pp-notas" className="block text-sm font-medium text-verde mb-1">
              Notas internas
            </label>
            <textarea
              id="pp-notas"
              rows={3}
              maxLength={4000}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
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
            Guardar planeación
          </button>
        </div>
      </form>
    </div>
  )
}
