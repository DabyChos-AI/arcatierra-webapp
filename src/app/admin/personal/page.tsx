'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Briefcase,
  Plus,
  RefreshCw,
  Search,
  X,
  Edit2,
  UserX,
  Loader2,
  AlertTriangle,
  Users,
  Compass,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type {
  Personal,
  PersonalKPIs,
  PersonalListResponse,
  PersonalTab,
} from '@/types/catalogos'
import AdminTopbar from '../components/AdminTopbar'
import TabsPersonal from '../components/TabsPersonal'
import ChipRol from '../components/ChipRol'

const PER_PAGE = 20
const IDIOMAS: { value: string; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'fr', label: 'Francés' },
  { value: 'pt', label: 'Portugués' },
]
// Personas con datos incompletos conocidos (dato del equipo). Se muestra chip "(pdte)".
const NOMBRES_PDTE = ['Daniela', 'Rosy', 'Constanza']

function esPendiente(p: Personal): boolean {
  return NOMBRES_PDTE.includes(p.nombre) && (!p.apellidos || !p.email || !p.telefono)
}

interface FormPersonal {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  puesto: string
  es_vendedor: boolean
  es_guia: boolean
  idiomas: string[]
  notas_internas: string
  activo: boolean
}

const FORM_INICIAL: FormPersonal = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  puesto: '',
  es_vendedor: false,
  es_guia: false,
  idiomas: [],
  notas_internas: '',
  activo: true,
}

export default function PersonalPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [items, setItems] = useState<Personal[]>([])
  const [kpis, setKpis] = useState<PersonalKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [tab, setTab] = useState<PersonalTab>('todos')
  const [soloActivos, setSoloActivos] = useState(true)
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormPersonal>(FORM_INICIAL)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Desactivar
  const [desactivando, setDesactivando] = useState<string | null>(null)

  const fetchPersonal = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        tab,
        page: String(page),
        per_page: String(PER_PAGE),
      })
      if (busqueda) params.set('search', busqueda)
      if (soloActivos) params.set('activo', 'true')
      const res = await fetch(`${API_URL}/api/admin/personal?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data: PersonalListResponse = await res.json()
      setItems(data.items)
      setKpis(data.kpis)
      setTotalCount(data.total_count)
      setTotalPages(data.total_pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar personal')
    } finally {
      setLoading(false)
    }
  }, [token, tab, page, busqueda, soloActivos])

  useEffect(() => {
    setPage(1)
  }, [tab, busqueda, soloActivos])

  useEffect(() => {
    fetchPersonal()
  }, [fetchPersonal])

  // Debounce busqueda
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

  const openEditar = (p: Personal) => {
    setEditId(p.id)
    setForm({
      nombre: p.nombre,
      apellidos: p.apellidos ?? '',
      email: p.email ?? '',
      telefono: p.telefono ?? '',
      puesto: p.puesto ?? '',
      es_vendedor: p.es_vendedor,
      es_guia: p.es_guia,
      idiomas: p.idiomas ?? [],
      notas_internas: p.notas_internas ?? '',
      activo: p.activo,
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

  const toggleIdioma = (value: string) => {
    setForm((prev) => ({
      ...prev,
      idiomas: prev.idiomas.includes(value)
        ? prev.idiomas.filter((i) => i !== value)
        : [...prev.idiomas, value],
    }))
  }

  const rolesInvalidos = !form.es_vendedor && !form.es_guia

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    if (rolesInvalidos) {
      setFormError('Debe ser vendedor o guía')
      return
    }
    setSaving(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim() || null,
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
        puesto: form.puesto.trim() || null,
        es_vendedor: form.es_vendedor,
        es_guia: form.es_guia,
        idiomas: form.idiomas,
        notas_internas: form.notas_internas.trim() || null,
        activo: form.activo,
      }
      const url = editId
        ? `${API_URL}/api/admin/personal/${editId}`
        : `${API_URL}/api/admin/personal`
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
      await fetchPersonal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDesactivar = async (p: Personal) => {
    if (!token) return
    if (
      !window.confirm(
        `¿Desactivar a ${p.nombre}${p.apellidos ? ` ${p.apellidos}` : ''}? Podrás reactivarla después.`,
      )
    )
      return
    setDesactivando(p.id)
    try {
      const res = await fetch(`${API_URL}/api/admin/personal/${p.id}?hard=false`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      await fetchPersonal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar')
    } finally {
      setDesactivando(null)
    }
  }

  const kpiCards = useMemo(
    () => [
      { title: 'Total activos', value: kpis?.total ?? 0, textClass: 'text-verde', subtitle: null },
      {
        title: 'Vendedoras activas',
        value: kpis?.vendedoras_activas ?? 0,
        textClass: 'text-terracota',
        subtitle: null,
      },
      {
        title: 'Guías activos',
        value: kpis?.guias_activos ?? 0,
        textClass: 'text-verde',
        subtitle: null,
      },
      {
        title: 'Multi-rol',
        value: kpis?.multirol ?? 0,
        textClass: 'text-amarillo',
        subtitle: 'Vendedora + Guía',
      },
    ],
    [kpis],
  )

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-terracota/10">
              <Briefcase className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-verde">Personal</h1>
              <p className="text-sm text-verde-suave mt-1">
                Vendedoras y guías del módulo de reservas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCrear}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
            aria-label="Crear nueva persona"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva persona
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.title} className="bg-white rounded-lg border border-neutro-borde p-4">
              <p className="text-xs font-medium text-verde-suave">{kpi.title}</p>
              <p className={`text-2xl font-bold tabular-nums ${kpi.textClass}`}>{kpi.value}</p>
              {kpi.subtitle && <p className="text-xs text-verde-suave mt-0.5">{kpi.subtitle}</p>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <TabsPersonal current={tab} onChange={setTab} kpis={kpis} />

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde-suave"
              aria-hidden="true"
            />
            <label htmlFor="personal-search" className="sr-only">
              Buscar personal
            </label>
            <input
              id="personal-search"
              type="search"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Buscar por nombre, email..."
              className="w-full pl-9 pr-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-verde cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={soloActivos}
              onChange={(e) => setSoloActivos(e.target.checked)}
              className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
            />
            Solo activos
          </label>
          <button
            type="button"
            onClick={fetchPersonal}
            aria-label="Actualizar lista de personal"
            className="inline-flex items-center gap-2 px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde hover:bg-neutro-light"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex items-center gap-2 text-sm text-rojo">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchPersonal}
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
              <span className="ml-3 text-sm text-verde-suave">Cargando personal...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-verde-suave">
              <Users className="h-12 w-12 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
              <p className="font-medium">No hay personal en esta vista</p>
              <p className="text-sm mt-1">Ajusta los filtros o agrega una nueva persona.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                    <th className="px-4 py-3 font-medium text-verde">Persona</th>
                    <th className="px-4 py-3 font-medium text-verde">Email</th>
                    <th className="px-4 py-3 font-medium text-verde">Teléfono</th>
                    <th className="px-4 py-3 font-medium text-verde">Roles</th>
                    <th className="px-4 py-3 font-medium text-verde">Idiomas</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Reservas mes</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-b border-neutro-borde hover:bg-neutro-light/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-verde flex items-center gap-2 flex-wrap">
                          <span>
                            {p.nombre}
                            {p.apellidos ? ` ${p.apellidos}` : ''}
                          </span>
                          {esPendiente(p) && (
                            <span className="inline-block px-1.5 py-0.5 rounded-full text-xs bg-neutro-light text-verde-suave border border-neutro-borde">
                              (pdte)
                            </span>
                          )}
                          {!p.activo && (
                            <span className="inline-block px-1.5 py-0.5 rounded-full text-xs bg-rojo/10 text-rojo">
                              Inactiva
                            </span>
                          )}
                        </div>
                        {p.puesto && <div className="text-xs text-verde-suave mt-0.5">{p.puesto}</div>}
                      </td>
                      <td className="px-4 py-3 text-verde-suave">
                        {p.email || <span className="italic text-neutro-gris">—</span>}
                      </td>
                      <td className="px-4 py-3 text-verde-suave">
                        {p.telefono || <span className="italic text-neutro-gris">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.es_vendedor && <ChipRol rol="vendedora" />}
                          {p.es_guia && <ChipRol rol="guia" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.idiomas && p.idiomas.length > 0 ? (
                            p.idiomas.map((i) => (
                              <span
                                key={i}
                                className="inline-block px-1.5 py-0.5 rounded text-xs bg-neutro-light text-verde uppercase"
                              >
                                {i}
                              </span>
                            ))
                          ) : (
                            <span className="italic text-neutro-gris">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-verde-suave">
                        {p.eventos_mes_actual ? (
                          p.eventos_mes_actual.como_vendedor + p.eventos_mes_actual.como_guia
                        ) : (
                          <span className="italic text-neutro-gris" title="Disponible en el detalle de la persona">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditar(p)}
                            aria-label={`Editar ${p.nombre}`}
                            className="p-2 text-verde hover:bg-verde/10 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDesactivar(p)}
                            disabled={desactivando === p.id || !p.activo}
                            aria-label={`Desactivar ${p.nombre}`}
                            className="p-2 text-rojo hover:bg-rojo/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {desactivando === p.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <UserX className="h-4 w-4" aria-hidden="true" />
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

          {/* Paginacion */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-neutro-light border-t border-neutro-borde text-sm">
              <span className="text-verde-suave">
                {totalCount} personas · Página {page} de {totalPages}
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl">
              <h2 className="font-display text-xl text-verde flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-terracota" aria-hidden="true" />
                {editId ? 'Editar persona' : 'Nueva persona'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="per-nombre" className="block text-sm font-medium text-verde mb-1">
                    Nombre <span className="text-rojo">*</span>
                  </label>
                  <input
                    id="per-nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Daniela"
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div>
                  <label htmlFor="per-apellidos" className="block text-sm font-medium text-verde mb-1">
                    Apellidos
                  </label>
                  <input
                    id="per-apellidos"
                    type="text"
                    value={form.apellidos}
                    onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                    placeholder="Ej: Alemán"
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div>
                  <label htmlFor="per-email" className="block text-sm font-medium text-verde mb-1">
                    Email
                  </label>
                  <input
                    id="per-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@arcatierra.com"
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div>
                  <label htmlFor="per-telefono" className="block text-sm font-medium text-verde mb-1">
                    Teléfono
                  </label>
                  <input
                    id="per-telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="55 1234 5678"
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="per-puesto" className="block text-sm font-medium text-verde mb-1">
                    Puesto
                  </label>
                  <input
                    id="per-puesto"
                    type="text"
                    value={form.puesto}
                    onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                    placeholder="Ej: Directora comercial"
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
              </div>

              {/* Roles */}
              <div>
                <p className="block text-sm font-medium text-verde mb-2">
                  Roles <span className="text-rojo">*</span>
                </p>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.es_vendedor}
                      onChange={(e) => setForm({ ...form, es_vendedor: e.target.checked })}
                      className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                    />
                    Vendedora
                  </label>
                  <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.es_guia}
                      onChange={(e) => setForm({ ...form, es_guia: e.target.checked })}
                      className="w-4 h-4 text-verde border-neutro-borde rounded focus:ring-verde"
                    />
                    Guía
                  </label>
                </div>
                {rolesInvalidos && (
                  <p className="text-xs text-rojo mt-1">Debe ser vendedor o guía</p>
                )}
              </div>

              {/* Idiomas */}
              <div>
                <p className="block text-sm font-medium text-verde mb-2 flex items-center gap-1">
                  <Compass className="h-4 w-4 text-verde-suave" aria-hidden="true" /> Idiomas
                </p>
                <div className="flex gap-4 flex-wrap">
                  {IDIOMAS.map((idioma) => (
                    <label
                      key={idioma.value}
                      className="flex items-center gap-2 text-sm text-verde cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.idiomas.includes(idioma.value)}
                        onChange={() => toggleIdioma(idioma.value)}
                        className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                      />
                      {idioma.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="per-notas" className="block text-sm font-medium text-verde mb-1">
                  Notas internas
                </label>
                <textarea
                  id="per-notas"
                  rows={2}
                  value={form.notas_internas}
                  onChange={(e) => setForm({ ...form, notas_internas: e.target.value })}
                  className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                />
                Persona activa
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
                disabled={saving || rolesInvalidos}
                className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {editId ? 'Guardar cambios' : 'Crear persona'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
