'use client'

import { useState } from 'react'
import {
  X,
  AlertTriangle,
  Loader2,
  Plus,
  Pencil,
  Save,
  Trash2,
  Mail,
  Phone,
  Building2,
  Clock,
  Info,
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'
import { formatMXN } from '@/types/reservas'
import { API_URL } from '@/lib/api'
import {
  CateringItem,
  EstadoCatering,
  Vendedor,
  ESTADO_BADGE,
  ORIGEN_LABEL,
  TRANSICIONES,
  formatFechaEvento,
} from '../types'

type Tab = 'datos' | 'notas' | 'seguimiento'

interface EditForm {
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
}

function toEditForm(it: CateringItem): EditForm {
  return {
    contacto_nombre: it.contacto_nombre ?? '',
    contacto_email: it.contacto_email ?? '',
    contacto_tel: it.contacto_tel ?? '',
    empresa: it.empresa ?? '',
    tipo_evento: it.tipo_evento ?? '',
    fecha_evento: it.fecha_evento ?? '',
    numero_invitados_aprox:
      it.numero_invitados_aprox != null ? String(it.numero_invitados_aprox) : '',
    ubicacion: it.ubicacion ?? '',
    restricciones: it.restricciones ?? '',
    presupuesto_aprox:
      it.presupuesto_aprox != null ? String(it.presupuesto_aprox) : '',
    mensaje: it.mensaje ?? '',
  }
}

interface Props {
  item: CateringItem
  token: string | undefined
  vendedores: Vendedor[]
  onClose: () => void
  onChanged: (item: CateringItem) => void
  onDeleted: (id: string) => void
}

export default function ModalDetalleCatering({
  item: itemProp,
  token,
  vendedores,
  onClose,
  onChanged,
  onDeleted,
}: Props) {
  const [item, setItem] = useState<CateringItem>(itemProp)
  const [tab, setTab] = useState<Tab>('datos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Datos edición
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>(toEditForm(itemProp))

  // Notas
  const [nuevaNota, setNuevaNota] = useState('')

  // Seguimiento
  const [estadoDestino, setEstadoDestino] = useState<EstadoCatering | ''>('')
  const [motivoPerdida, setMotivoPerdida] = useState('')
  const [montoInput, setMontoInput] = useState<string>(
    item.monto_cotizado != null ? String(item.monto_cotizado) : '',
  )

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const applyUpdate = (updated: CateringItem) => {
    setItem(updated)
    setMontoInput(updated.monto_cotizado != null ? String(updated.monto_cotizado) : '')
    onChanged(updated)
  }

  // ─── Datos: guardar edición ───────────────────────────
  const guardarDatos = async () => {
    setError(null)
    const nombre = editForm.contacto_nombre.trim()
    const email = editForm.contacto_email.trim()
    if (!nombre) {
      setError('El nombre del contacto no puede quedar vacío')
      return
    }
    if (!email) {
      setError('El email del contacto no puede quedar vacío')
      return
    }
    const invitados = editForm.numero_invitados_aprox.trim()
      ? Number(editForm.numero_invitados_aprox)
      : null
    if (invitados !== null && (Number.isNaN(invitados) || invitados < 0)) {
      setError('El número de invitados debe ser un número válido')
      return
    }
    const presupuesto = editForm.presupuesto_aprox.trim()
      ? Number(editForm.presupuesto_aprox)
      : null
    if (presupuesto !== null && (Number.isNaN(presupuesto) || presupuesto < 0)) {
      setError('El presupuesto debe ser un número válido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/catering/${item.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          contacto_nombre: nombre,
          contacto_email: email,
          contacto_tel: editForm.contacto_tel.trim() || null,
          empresa: editForm.empresa.trim() || null,
          tipo_evento: editForm.tipo_evento.trim() || null,
          fecha_evento: editForm.fecha_evento || null,
          numero_invitados_aprox: invitados,
          ubicacion: editForm.ubicacion.trim() || null,
          restricciones: editForm.restricciones.trim() || null,
          presupuesto_aprox: presupuesto,
          mensaje: editForm.mensaje.trim() || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudieron guardar los cambios')
      }
      const updated: CateringItem = await res.json()
      applyUpdate(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // ─── Notas: agregar ───────────────────────────────────
  const agregarNota = async () => {
    const nota = nuevaNota.trim()
    if (!nota) {
      setError('La nota no puede estar vacía')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/catering/${item.id}/notas`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ nota }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo agregar la nota')
      }
      const data: { success: boolean; notas_internas: string } = await res.json()
      const updated = { ...item, notas_internas: data.notas_internas }
      setItem(updated)
      onChanged(updated)
      setNuevaNota('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // ─── Seguimiento: cambiar estado ──────────────────────
  const cambiarEstado = async () => {
    if (!estadoDestino) return
    if (estadoDestino === 'cerrada_perdida' && !motivoPerdida.trim()) {
      setError('El motivo de pérdida es obligatorio para cerrar como perdida')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const body: { estado: EstadoCatering; motivo_perdida?: string } = {
        estado: estadoDestino,
      }
      if (estadoDestino === 'cerrada_perdida') {
        body.motivo_perdida = motivoPerdida.trim()
      }
      const res = await fetch(`${API_URL}/api/admin/catering/${item.id}/estado`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo cambiar el estado')
      }
      const updated: CateringItem = await res.json()
      applyUpdate(updated)
      setEstadoDestino('')
      setMotivoPerdida('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // ─── Seguimiento: asignar vendedor ────────────────────
  const asignarVendedor = async (vendedorId: string) => {
    if (!vendedorId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/catering/${item.id}/asignar`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ vendedor_id: vendedorId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo asignar el vendedor')
      }
      const updated: CateringItem = await res.json()
      applyUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // ─── Seguimiento: guardar monto cotizado ──────────────
  const guardarMonto = async () => {
    setError(null)
    const monto = montoInput.trim() ? Number(montoInput) : null
    if (monto !== null && (Number.isNaN(monto) || monto < 0)) {
      setError('El monto cotizado debe ser un número válido')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/catering/${item.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ monto_cotizado: monto }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo guardar el monto')
      }
      const updated: CateringItem = await res.json()
      applyUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // ─── Eliminar ─────────────────────────────────────────
  const nuncaTocado =
    item.estado === 'sin_contactar' &&
    !item.notas_internas?.trim() &&
    item.monto_cotizado == null

  const eliminar = async () => {
    if (!nuncaTocado) return
    if (
      !window.confirm(
        '¿Eliminar esta solicitud de catering? Esta acción no se puede deshacer.',
      )
    )
      return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/catering/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 409) {
        const err = await res.json().catch(() => ({}))
        throw new Error(
          err?.detail ||
            'La solicitud tiene historial y no puede eliminarse. Usa "Cerrada perdida".',
        )
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo eliminar la solicitud')
      }
      onDeleted(item.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  const badge = ESTADO_BADGE[item.estado]
  const destinosValidos = TRANSICIONES[item.estado]

  const notasLineas = (item.notas_internas || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B15543]/40'
  const labelCls = 'text-xs text-gray-500 block mb-1'

  const tabs: { key: Tab; label: string }[] = [
    { key: 'datos', label: 'Datos' },
    { key: 'notas', label: 'Notas' },
    { key: 'seguimiento', label: 'Seguimiento' },
  ]

  // ─── Fila read-only para tab Datos ────────────────────
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="text-sm text-gray-800">
        {value || <span className="text-gray-400 italic">Sin dato</span>}
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}
            >
              {badge.label}
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              {item.contacto_nombre || 'Solicitud de catering'}
            </h2>
            <span className="text-xs text-gray-400">
              {ORIGEN_LABEL[item.origen]}
            </span>
          </div>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Secciones de la solicitud"
          className="flex gap-1 px-6 pt-4 border-b border-gray-200"
        >
          {tabs.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  active
                    ? 'border-[#B15543] text-[#B15543]'
                    : 'border-transparent text-gray-500 hover:text-[#33503E]'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle
                className="h-4 w-4 text-red-500 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* ─── TAB DATOS ─────────────────────────────── */}
          {tab === 'datos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Datos de la solicitud
                </h3>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm(toEditForm(item))
                      setEditing(true)
                      setError(null)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-[#33503E] hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setError(null)
                      }}
                      disabled={loading}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={guardarDatos}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#33503E] text-white rounded-lg hover:bg-[#475A52] disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                // ── Vista read-only ──
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      <span className="break-all">
                        {item.contacto_email || 'Sin email'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      <span>{item.contacto_tel || 'Sin teléfono'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" aria-hidden="true" />
                      <span>{item.empresa || 'Sin empresa'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>{formatFechaHoraMexico(item.fecha_solicitud)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Row label="Tipo de evento" value={item.tipo_evento} />
                    <Row
                      label="Fecha del evento"
                      value={
                        item.fecha_evento
                          ? formatFechaEvento(item.fecha_evento)
                          : null
                      }
                    />
                    <Row
                      label="Invitados (aprox.)"
                      value={
                        item.numero_invitados_aprox != null
                          ? String(item.numero_invitados_aprox)
                          : null
                      }
                    />
                    <Row
                      label="Presupuesto aprox."
                      value={
                        item.presupuesto_aprox != null
                          ? formatMXN(item.presupuesto_aprox)
                          : null
                      }
                    />
                    <Row label="Ubicación" value={item.ubicacion} />
                    <Row label="Restricciones" value={item.restricciones} />
                    <Row
                      label="Vendedor asignado"
                      value={item.vendedor_nombre}
                    />
                    <Row
                      label="Monto cotizado"
                      value={
                        item.monto_cotizado != null
                          ? formatMXN(item.monto_cotizado)
                          : null
                      }
                    />
                  </div>

                  <div>
                    <span className={labelCls}>Mensaje / detalles</span>
                    <div className="bg-[#E3DBCB]/40 border-l-[3px] border-[#CCBB9A] rounded-md p-3 text-sm italic text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {item.mensaje || (
                        <span className="text-gray-400 not-italic">
                          Sin mensaje
                        </span>
                      )}
                    </div>
                  </div>

                  {item.estado === 'cerrada_perdida' && item.motivo_perdida && (
                    <div>
                      <span className={labelCls}>Motivo de pérdida</span>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
                        {item.motivo_perdida}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // ── Vista edición inline ──
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ed-nombre" className={labelCls}>
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ed-nombre"
                      type="text"
                      value={editForm.contacto_nombre}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contacto_nombre: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-email" className={labelCls}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ed-email"
                      type="email"
                      value={editForm.contacto_email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contacto_email: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-tel" className={labelCls}>
                      Teléfono
                    </label>
                    <input
                      id="ed-tel"
                      type="tel"
                      value={editForm.contacto_tel}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contacto_tel: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-empresa" className={labelCls}>
                      Empresa
                    </label>
                    <input
                      id="ed-empresa"
                      type="text"
                      value={editForm.empresa}
                      onChange={(e) =>
                        setEditForm({ ...editForm, empresa: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-tipo" className={labelCls}>
                      Tipo de evento
                    </label>
                    <input
                      id="ed-tipo"
                      type="text"
                      value={editForm.tipo_evento}
                      onChange={(e) =>
                        setEditForm({ ...editForm, tipo_evento: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-fecha" className={labelCls}>
                      Fecha del evento
                    </label>
                    <input
                      id="ed-fecha"
                      type="date"
                      value={editForm.fecha_evento}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fecha_evento: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-invitados" className={labelCls}>
                      Invitados (aprox.)
                    </label>
                    <input
                      id="ed-invitados"
                      type="number"
                      min={0}
                      value={editForm.numero_invitados_aprox}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          numero_invitados_aprox: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="ed-presupuesto" className={labelCls}>
                      Presupuesto aprox. (MXN)
                    </label>
                    <input
                      id="ed-presupuesto"
                      type="number"
                      min={0}
                      step="0.01"
                      value={editForm.presupuesto_aprox}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          presupuesto_aprox: e.target.value,
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="ed-ubicacion" className={labelCls}>
                      Ubicación
                    </label>
                    <input
                      id="ed-ubicacion"
                      type="text"
                      value={editForm.ubicacion}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ubicacion: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="ed-restricciones" className={labelCls}>
                      Restricciones alimentarias
                    </label>
                    <input
                      id="ed-restricciones"
                      type="text"
                      value={editForm.restricciones}
                      onChange={(e) =>
                        setEditForm({ ...editForm, restricciones: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="ed-mensaje" className={labelCls}>
                      Mensaje / detalles
                    </label>
                    <textarea
                      id="ed-mensaje"
                      rows={3}
                      value={editForm.mensaje}
                      onChange={(e) =>
                        setEditForm({ ...editForm, mensaje: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB NOTAS ─────────────────────────────── */}
          {tab === 'notas' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Notas internas
              </h3>
              {notasLineas.length === 0 ? (
                <div className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-3">
                  Aún no hay notas. Agrega la primera abajo.
                </div>
              ) : (
                <ul className="space-y-2">
                  {notasLineas.map((linea, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 bg-gray-50 border-l-2 border-[#CCBB9A] rounded-md px-3 py-2 whitespace-pre-wrap"
                    >
                      {linea}
                    </li>
                  ))}
                </ul>
              )}

              <div>
                <label htmlFor="cat-nueva-nota" className="sr-only">
                  Nueva nota
                </label>
                <textarea
                  id="cat-nueva-nota"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  rows={3}
                  placeholder="Agregar nota (se firma con tu usuario y fecha)"
                  className={inputCls}
                  disabled={loading}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={agregarNota}
                    disabled={loading || !nuevaNota.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Agregar nota
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB SEGUIMIENTO ───────────────────────── */}
          {tab === 'seguimiento' && (
            <div className="space-y-6">
              {/* Estado */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">Actual:</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {destinosValidos.length === 0 ? (
                  <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>
                      Este es un estado final. No hay más transiciones disponibles.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="cat-estado-destino" className={labelCls}>
                        Cambiar a
                      </label>
                      <select
                        id="cat-estado-destino"
                        value={estadoDestino}
                        onChange={(e) => {
                          setEstadoDestino(e.target.value as EstadoCatering | '')
                          setMotivoPerdida('')
                        }}
                        disabled={loading}
                        className={`${inputCls} sm:w-auto`}
                      >
                        <option value="">— Selecciona nuevo estado —</option>
                        {destinosValidos.map((d) => (
                          <option key={d} value={d}>
                            {ESTADO_BADGE[d].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {estadoDestino === 'cerrada_perdida' && (
                      <div>
                        <label htmlFor="cat-motivo" className={labelCls}>
                          Motivo de pérdida{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="cat-motivo"
                          rows={2}
                          value={motivoPerdida}
                          onChange={(e) => setMotivoPerdida(e.target.value)}
                          placeholder="¿Por qué no avanzó? (precio, fecha, competencia…)"
                          className={inputCls}
                          disabled={loading}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={cambiarEstado}
                      disabled={
                        loading ||
                        !estadoDestino ||
                        (estadoDestino === 'cerrada_perdida' &&
                          !motivoPerdida.trim())
                      }
                      className="flex items-center gap-1 px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : null}
                      Aplicar cambio de estado
                    </button>
                  </div>
                )}
              </section>

              {/* Vendedor */}
              <section>
                <label htmlFor="cat-vendedor" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Vendedor asignado
                </label>
                <select
                  id="cat-vendedor"
                  value={item.vendedor_asignado_id || ''}
                  onChange={(e) => asignarVendedor(e.target.value)}
                  disabled={loading}
                  className={`${inputCls} sm:w-auto`}
                >
                  <option value="">Sin asignar</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
              </section>

              {/* Monto cotizado */}
              <section>
                <label htmlFor="cat-monto" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Monto cotizado (MXN)
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Monto total sin desglose por menú. El detalle del menú, si lo
                  hay, va en Notas o Mensaje.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    id="cat-monto"
                    type="number"
                    min={0}
                    step="0.01"
                    value={montoInput}
                    onChange={(e) => setMontoInput(e.target.value)}
                    placeholder="0.00"
                    disabled={loading}
                    className={`${inputCls} sm:w-52`}
                  />
                  <button
                    type="button"
                    onClick={guardarMonto}
                    disabled={loading}
                    className="flex items-center gap-1 px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    Guardar
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-wrap">
          {nuncaTocado ? (
            <button
              type="button"
              onClick={eliminar}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Eliminar
            </button>
          ) : (
            <span
              title="Lead con historial — usa 'Cerrada perdida' si no avanzó"
              className="inline-flex"
            >
              <button
                type="button"
                disabled
                aria-label="Eliminar (deshabilitado: lead con historial)"
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-lg text-sm cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
