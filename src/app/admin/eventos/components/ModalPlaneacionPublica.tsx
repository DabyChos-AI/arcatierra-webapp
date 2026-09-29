'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertTriangle, ClipboardList, Info, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
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

  const idsIniciales = evento.guias.map((g) => g.personal_id)
  const [chinampa, setChinampa] = useState(evento.chinampa ?? '')
  const [cocinaId, setCocinaId] = useState(evento.cocina_id ?? '')
  const [idioma, setIdioma] = useState<string>(evento.idioma ?? '')
  const [notas, setNotas] = useState(evento.notas_internas ?? '')
  const [guias, setGuias] = useState<string[]>(idsIniciales)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cerrar = () => {
    if (!saving) onClose()
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
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
      const res = await fetch(`${API_URL}/api/admin/eventos/${evento.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
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
              {evento.experiencia_nombre ?? evento.nombre_evento} ·{' '}
              {formatFechaMexico(evento.fecha_evento, { weekday: 'long' })} ·{' '}
              {horario(evento.hora_inicio, evento.hora_fin)}
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            disabled={saving}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectChinampa
              id="pp-chinampa"
              value={chinampa}
              guardada={evento.chinampa}
              chinampas={catalogos.chinampas}
              onChange={setChinampa}
            />
            <SelectCocina
              id="pp-cocina"
              value={cocinaId}
              guardada={
                evento.cocina_id ? { id: evento.cocina_id, nombre: evento.cocina_nombre } : null
              }
              cocinas={catalogos.cocinas}
              onChange={setCocinaId}
            />
            <SelectIdioma id="pp-idioma" value={idioma} onChange={setIdioma} />
          </div>

          <SelectorGuias
            id="pp-guias"
            guias={catalogos.guias}
            asignados={evento.guias}
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
            disabled={saving}
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
