'use client'

import { useState } from 'react'
import { Plus, X, AlertTriangle, Loader2, Utensils } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { CateringItem, OrigenCatering } from '../types'

// Orígenes seleccionables al crear manualmente (NO formulario_publico)
const ORIGEN_OPTS: { value: OrigenCatering; label: string }[] = [
  { value: 'admin_manual', label: 'Manual (admin)' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

interface FormNueva {
  contacto_nombre: string
  contacto_email: string
  contacto_tel: string
  empresa: string
  tipo_evento: string
  fecha_evento: string
  numero_invitados_aprox: string
  ubicacion: string
  restricciones: string
  presupuesto_aprox: string
  mensaje: string
  origen: OrigenCatering
}

const FORM_INICIAL: FormNueva = {
  contacto_nombre: '',
  contacto_email: '',
  contacto_tel: '',
  empresa: '',
  tipo_evento: '',
  fecha_evento: '',
  numero_invitados_aprox: '',
  ubicacion: '',
  restricciones: '',
  presupuesto_aprox: '',
  mensaje: '',
  origen: 'admin_manual',
}

interface Props {
  open: boolean
  token: string | undefined
  onClose: () => void
  onCreated: (item: CateringItem) => void
}

export default function ModalNuevaSolicitud({
  open,
  token,
  onClose,
  onCreated,
}: Props) {
  const [form, setForm] = useState<FormNueva>(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const set = <K extends keyof FormNueva>(key: K, value: FormNueva[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleClose = () => {
    if (loading) return
    setForm(FORM_INICIAL)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const nombre = form.contacto_nombre.trim()
    const email = form.contacto_email.trim()
    if (!nombre) {
      setError('El nombre del contacto es obligatorio')
      return
    }
    if (!email) {
      setError('El email del contacto es obligatorio')
      return
    }

    // numero_invitados_aprox / presupuesto_aprox → number | null
    const invitados = form.numero_invitados_aprox.trim()
      ? Number(form.numero_invitados_aprox)
      : null
    if (invitados !== null && (Number.isNaN(invitados) || invitados < 0)) {
      setError('El número de invitados debe ser un número válido')
      return
    }
    const presupuesto = form.presupuesto_aprox.trim()
      ? Number(form.presupuesto_aprox)
      : null
    if (presupuesto !== null && (Number.isNaN(presupuesto) || presupuesto < 0)) {
      setError('El presupuesto debe ser un número válido')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/catering`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contacto_nombre: nombre,
          contacto_email: email,
          contacto_tel: form.contacto_tel.trim() || null,
          empresa: form.empresa.trim() || null,
          tipo_evento: form.tipo_evento.trim() || null,
          fecha_evento: form.fecha_evento || null,
          numero_invitados_aprox: invitados,
          ubicacion: form.ubicacion.trim() || null,
          restricciones: form.restricciones.trim() || null,
          presupuesto_aprox: presupuesto,
          mensaje: form.mensaje.trim() || null,
          origen: form.origen,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo crear la solicitud')
      }
      const item: CateringItem = await res.json()
      setForm(FORM_INICIAL)
      onCreated(item)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-4 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#B15543]/10">
              <Utensils className="h-5 w-5 text-[#B15543]" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Nueva solicitud (manual)
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle
                className="h-4 w-4 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cat-nombre" className={labelCls}>
                Nombre del contacto <span className="text-red-500">*</span>
              </label>
              <input
                id="cat-nombre"
                type="text"
                required
                maxLength={255}
                value={form.contacto_nombre}
                onChange={(e) => set('contacto_nombre', e.target.value)}
                placeholder="Nombre de quien solicita"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-email" className={labelCls}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="cat-email"
                type="email"
                required
                maxLength={255}
                value={form.contacto_email}
                onChange={(e) => set('contacto_email', e.target.value)}
                placeholder="contacto@correo.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-tel" className={labelCls}>
                Teléfono
              </label>
              <input
                id="cat-tel"
                type="tel"
                maxLength={50}
                value={form.contacto_tel}
                onChange={(e) => set('contacto_tel', e.target.value)}
                placeholder="55 1234 5678"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-empresa" className={labelCls}>
                Empresa
              </label>
              <input
                id="cat-empresa"
                type="text"
                maxLength={255}
                value={form.empresa}
                onChange={(e) => set('empresa', e.target.value)}
                placeholder="Nombre de la empresa"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-tipo" className={labelCls}>
                Tipo de evento
              </label>
              <input
                id="cat-tipo"
                type="text"
                maxLength={255}
                value={form.tipo_evento}
                onChange={(e) => set('tipo_evento', e.target.value)}
                placeholder="Boda, corporativo, cumpleaños…"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-fecha" className={labelCls}>
                Fecha del evento
              </label>
              <input
                id="cat-fecha"
                type="date"
                value={form.fecha_evento}
                onChange={(e) => set('fecha_evento', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-invitados" className={labelCls}>
                Invitados (aprox.)
              </label>
              <input
                id="cat-invitados"
                type="number"
                min={0}
                value={form.numero_invitados_aprox}
                onChange={(e) => set('numero_invitados_aprox', e.target.value)}
                placeholder="Ej. 80"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cat-presupuesto" className={labelCls}>
                Presupuesto aprox. (MXN)
              </label>
              <input
                id="cat-presupuesto"
                type="number"
                min={0}
                step="0.01"
                value={form.presupuesto_aprox}
                onChange={(e) => set('presupuesto_aprox', e.target.value)}
                placeholder="Ej. 50000"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cat-ubicacion" className={labelCls}>
              Ubicación
            </label>
            <input
              id="cat-ubicacion"
              type="text"
              maxLength={500}
              value={form.ubicacion}
              onChange={(e) => set('ubicacion', e.target.value)}
              placeholder="Dirección o zona del evento"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="cat-restricciones" className={labelCls}>
              Restricciones alimentarias
            </label>
            <input
              id="cat-restricciones"
              type="text"
              maxLength={500}
              value={form.restricciones}
              onChange={(e) => set('restricciones', e.target.value)}
              placeholder="Vegano, sin gluten, alergias…"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="cat-mensaje" className={labelCls}>
              Mensaje / detalles
            </label>
            <textarea
              id="cat-mensaje"
              rows={3}
              maxLength={2000}
              value={form.mensaje}
              onChange={(e) => set('mensaje', e.target.value)}
              placeholder="Detalles del evento, menú deseado, notas del cliente, etc."
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="cat-origen" className={labelCls}>
              Origen de la solicitud
            </label>
            <select
              id="cat-origen"
              value={form.origen}
              onChange={(e) => set('origen', e.target.value as OrigenCatering)}
              className={inputCls}
            >
              {ORIGEN_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg text-sm hover:bg-[#975543] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{loading ? 'Guardando…' : 'Crear solicitud'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
