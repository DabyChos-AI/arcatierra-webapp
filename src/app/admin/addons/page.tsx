'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Plus,
  RefreshCw,
  Search,
  X,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  PackagePlus,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { formatMXN } from '@/types/reservas'
import type { Addon, AddonListResponse } from '@/types/catalogos'
import AdminTopbar from '../components/AdminTopbar'
import DisplayCapacidad from '../components/DisplayCapacidad'

const PER_PAGE = 20

interface FormAddon {
  nombre: string
  descripcion: string
  precio_por_persona: string
  capacidad_maxima: string
  disponible: boolean
}

const FORM_INICIAL: FormAddon = {
  nombre: '',
  descripcion: '',
  precio_por_persona: '0',
  capacidad_maxima: '0',
  disponible: true,
}

export default function AddonsPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [items, setItems] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [soloDisponibles, setSoloDisponibles] = useState(true)
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormAddon>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toggling, setToggling] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  const fetchAddons = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      })
      if (busqueda) params.set('search', busqueda)
      if (soloDisponibles) params.set('disponible', 'true')
      const res = await fetch(`${API_URL}/api/admin/addons?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data: AddonListResponse = await res.json()
      setItems(data.items)
      setTotalCount(data.total_count)
      setTotalPages(data.total_pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar add-ons')
    } finally {
      setLoading(false)
    }
  }, [token, page, busqueda, soloDisponibles])

  useEffect(() => {
    setPage(1)
  }, [busqueda, soloDisponibles])

  useEffect(() => {
    fetchAddons()
  }, [fetchAddons])

  useEffect(() => {
    const h = setTimeout(() => setBusqueda(busquedaInput.trim()), 300)
    return () => clearTimeout(h)
  }, [busquedaInput])

  // ─── Modal ───
  const openCrear = () => {
    setEditId(null)
    setForm(FORM_INICIAL)
    setFormError(null)
    setModalOpen(true)
  }

  const openEditar = (a: Addon) => {
    setEditId(a.id)
    setForm({
      nombre: a.nombre,
      descripcion: a.descripcion ?? '',
      precio_por_persona: String(a.precio_por_persona),
      capacidad_maxima: String(a.capacidad_maxima),
      disponible: a.disponible,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditId(null)
    setForm(FORM_INICIAL)
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio_por_persona: Number(form.precio_por_persona) || 0,
        capacidad_maxima: Number(form.capacidad_maxima) || 0,
        disponible: form.disponible,
      }
      const url = editId
        ? `${API_URL}/api/admin/addons/${editId}`
        : `${API_URL}/api/admin/addons`
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      setModalOpen(false)
      setEditId(null)
      setForm(FORM_INICIAL)
      await fetchAddons()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleDisponible = async (a: Addon) => {
    if (!token) return
    setToggling(a.id)
    try {
      const res = await fetch(`${API_URL}/api/admin/addons/${a.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disponible: !a.disponible }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      await fetchAddons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar disponibilidad')
    } finally {
      setToggling(null)
    }
  }

  const handleEliminar = async (a: Addon) => {
    if (!token) return
    if (!window.confirm(`¿Eliminar el add-on "${a.nombre}"?`)) return
    setEliminando(a.id)
    try {
      const res = await fetch(`${API_URL}/api/admin/addons/${a.id}?hard=false`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      await fetchAddons()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-terracota/10">
              <PackagePlus className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-verde">
                Catálogo de Add-ons
                {!loading && (
                  <span className="ml-2 text-lg text-verde-suave tabular-nums">({totalCount})</span>
                )}
              </h1>
              <p className="text-sm text-verde-suave mt-1">
                Servicios y items extra disponibles para sumar a reservas privadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCrear}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
            aria-label="Crear nuevo add-on"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo add-on
          </button>
        </header>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde-suave"
              aria-hidden="true"
            />
            <label htmlFor="addon-search" className="sr-only">
              Buscar add-on
            </label>
            <input
              id="addon-search"
              type="search"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Buscar add-on..."
              className="w-full pl-9 pr-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-verde cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
              className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
            />
            Solo disponibles
          </label>
          <button
            type="button"
            onClick={fetchAddons}
            aria-label="Actualizar lista de add-ons"
            className="inline-flex items-center gap-2 px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde hover:bg-neutro-light"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex items-center gap-2 text-sm text-rojo">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchAddons}
              className="ml-auto text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-neutro-borde overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
              <span className="ml-3 text-sm text-verde-suave">Cargando add-ons...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-verde-suave">
              <PackagePlus className="h-12 w-12 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
              <p className="font-medium">No hay add-ons en esta vista</p>
              <p className="text-sm mt-1">Ajusta los filtros o agrega un nuevo add-on.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                    <th className="px-4 py-3 font-medium text-verde">Nombre</th>
                    <th className="px-4 py-3 font-medium text-verde text-right">Precio (MXN)</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Capacidad máx</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Disponible</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="border-b border-neutro-borde hover:bg-neutro-light/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-verde">{a.nombre}</div>
                        {a.descripcion && (
                          <div className="text-xs text-verde-suave mt-0.5 max-w-md truncate">
                            {a.descripcion}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-verde font-medium">
                        {formatMXN(a.precio_por_persona)}
                      </td>
                      <td className="px-4 py-3 text-center text-verde">
                        <DisplayCapacidad valor={a.capacidad_maxima} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleDisponible(a)}
                          disabled={toggling === a.id}
                          aria-label={`${a.disponible ? 'Deshabilitar' : 'Habilitar'} ${a.nombre}`}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs disabled:opacity-50 ${
                            a.disponible
                              ? 'bg-verde/10 text-verde hover:bg-verde/20'
                              : 'bg-neutro-light text-verde-suave hover:bg-neutro-borde/40'
                          }`}
                        >
                          {toggling === a.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : a.disponible ? (
                            <ToggleRight className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                          )}
                          {a.disponible ? 'Disponible' : 'Oculto'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditar(a)}
                            aria-label={`Editar ${a.nombre}`}
                            className="p-2 text-verde hover:bg-verde/10 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(a)}
                            disabled={eliminando === a.id}
                            aria-label={`Eliminar ${a.nombre}`}
                            className="p-2 text-rojo hover:bg-rojo/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {eliminando === a.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-neutro-light border-t border-neutro-borde text-sm">
              <span className="text-verde-suave">
                {totalCount} add-ons · Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border border-neutro-borde rounded-lg hover:bg-white disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border border-neutro-borde rounded-lg hover:bg-white disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-20 pb-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl">
              <h2 className="font-display text-xl text-verde flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-terracota" aria-hidden="true" />
                {editId ? 'Editar add-on' : 'Nuevo add-on'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar modal"
                className="p-2 hover:bg-neutro-light rounded-lg"
                disabled={saving}
              >
                <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label htmlFor="addon-nombre" className="block text-sm font-medium text-verde mb-1">
                  Nombre <span className="text-rojo">*</span>
                </label>
                <input
                  id="addon-nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Mariachi"
                  className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addon-precio" className="block text-sm font-medium text-verde mb-1">
                    Precio por persona (MXN)
                  </label>
                  <input
                    id="addon-precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio_por_persona}
                    onChange={(e) => setForm({ ...form, precio_por_persona: e.target.value })}
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div>
                  <label htmlFor="addon-cap" className="block text-sm font-medium text-verde mb-1">
                    Capacidad máxima
                  </label>
                  <input
                    id="addon-cap"
                    type="number"
                    min="0"
                    value={form.capacidad_maxima}
                    onChange={(e) => setForm({ ...form, capacidad_maxima: e.target.value })}
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                  <p className="text-xs text-verde-suave mt-1">0 = sin límite específico</p>
                </div>
              </div>

              <div>
                <label htmlFor="addon-desc" className="block text-sm font-medium text-verde mb-1">
                  Descripción
                </label>
                <textarea
                  id="addon-desc"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                  className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                />
                Disponible
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutro-borde sticky bottom-0 bg-white rounded-b-xl">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {editId ? 'Guardar cambios' : 'Crear add-on'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
