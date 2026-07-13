'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Handshake,
  Plus,
  RefreshCw,
  Search,
  X,
  Edit2,
  UserX,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { formatMXN } from '@/types/reservas'
import type {
  Reseller,
  ResellerDetalle,
  ResellerListResponse,
  ResellerTipo,
  ExperienciaPrivada,
  MonedaTarifa,
  TarifasNegociadas,
} from '@/types/catalogos'
import AdminTopbar from '../components/AdminTopbar'

const PER_PAGE = 20

const TIPOS: { value: ResellerTipo; label: string }[] = [
  { value: 'turoperador', label: 'Turoperador' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'embajada', label: 'Embajada' },
  { value: 'medios', label: 'Medios' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'otro', label: 'Otro' },
]

function tipoLabel(tipo: string): string {
  return TIPOS.find((t) => t.value === tipo)?.label ?? tipo
}

interface TarifaRow {
  expId: string
  precio: number
  moneda: MonedaTarifa
}

interface FormReseller {
  nombre: string
  tipo: ResellerTipo
  contacto_nombre: string
  contacto_email: string
  contacto_tel: string
  comision_porcentaje: string
  idioma_default: string
  moneda_default: string
  notas_internas: string
  activo: boolean
}

const FORM_INICIAL: FormReseller = {
  nombre: '',
  tipo: 'turoperador',
  contacto_nombre: '',
  contacto_email: '',
  contacto_tel: '',
  comision_porcentaje: '',
  idioma_default: 'es',
  moneda_default: 'MXN',
  notas_internas: '',
  activo: true,
}

function rowsToRecord(rows: TarifaRow[]): TarifasNegociadas {
  const rec: TarifasNegociadas = {}
  for (const r of rows) {
    if (r.expId) rec[r.expId] = { precio_pp: r.precio, moneda: r.moneda }
  }
  return rec
}

function recordToRows(rec: TarifasNegociadas): TarifaRow[] {
  return Object.entries(rec).map(([expId, t]) => ({
    expId,
    precio: t.precio_pp,
    moneda: t.moneda,
  }))
}

export default function ResellersPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [items, setItems] = useState<Reseller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [soloActivos, setSoloActivos] = useState(true)
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Expandible detalle
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detalle, setDetalle] = useState<ResellerDetalle | null>(null)
  const [detalleLoading, setDetalleLoading] = useState(false)

  // Catalogo experiencias privadas (para tarifas)
  const [experiencias, setExperiencias] = useState<ExperienciaPrivada[]>([])

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormReseller>(FORM_INICIAL)
  const [tarifaRows, setTarifaRows] = useState<TarifaRow[]>([])
  const [rawJson, setRawJson] = useState('{}')
  const [rawJsonError, setRawJsonError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [desactivando, setDesactivando] = useState<string | null>(null)

  const fetchResellers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      })
      if (filtroTipo) params.set('tipo', filtroTipo)
      if (busqueda) params.set('search', busqueda)
      if (soloActivos) params.set('activo', 'true')
      const res = await fetch(`${API_URL}/api/admin/resellers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data: ResellerListResponse = await res.json()
      setItems(data.items)
      setTotalCount(data.total_count)
      setTotalPages(data.total_pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resellers')
    } finally {
      setLoading(false)
    }
  }, [token, page, filtroTipo, busqueda, soloActivos])

  const fetchExperiencias = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(
        `${API_URL}/api/experiencias/admin?tipo=${encodeURIComponent('EXPERIENCIAS PRIVADAS')}&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) return
      const data = await res.json()
      const arr: ExperienciaPrivada[] = Array.isArray(data) ? data : data?.items ?? []
      setExperiencias(arr)
    } catch {
      /* silencioso: el editor de tarifas queda con select vacio */
    }
  }, [token])

  useEffect(() => {
    setPage(1)
  }, [filtroTipo, busqueda, soloActivos])

  useEffect(() => {
    fetchResellers()
  }, [fetchResellers])

  useEffect(() => {
    fetchExperiencias()
  }, [fetchExperiencias])

  useEffect(() => {
    const h = setTimeout(() => setBusqueda(busquedaInput.trim()), 300)
    return () => clearTimeout(h)
  }, [busquedaInput])

  const nombreExperiencia = (expId: string): string =>
    experiencias.find((e) => e.id === expId)?.nombre ?? expId

  // ─── Expandible ───
  const toggleExpand = async (r: Reseller) => {
    if (expandedId === r.id) {
      setExpandedId(null)
      setDetalle(null)
      return
    }
    setExpandedId(r.id)
    setDetalle(null)
    if (!token) return
    setDetalleLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/resellers/${r.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setDetalle(await res.json())
      }
    } catch {
      /* silencioso */
    } finally {
      setDetalleLoading(false)
    }
  }

  // ─── Modal ───
  const openCrear = () => {
    setEditId(null)
    setForm(FORM_INICIAL)
    setTarifaRows([])
    setRawJson('{}')
    setRawJsonError(null)
    setFormError(null)
    setModalOpen(true)
  }

  const openEditar = (r: Reseller) => {
    setEditId(r.id)
    setForm({
      nombre: r.nombre,
      tipo: r.tipo,
      contacto_nombre: r.contacto_nombre ?? '',
      contacto_email: r.contacto_email ?? '',
      contacto_tel: r.contacto_tel ?? '',
      comision_porcentaje: r.comision_porcentaje != null ? String(r.comision_porcentaje) : '',
      idioma_default: r.idioma_default ?? 'es',
      moneda_default: r.moneda_default ?? 'MXN',
      notas_internas: r.notas_internas ?? '',
      activo: r.activo,
    })
    const rows = recordToRows(r.tarifas_negociadas ?? {})
    setTarifaRows(rows)
    setRawJson(JSON.stringify(rowsToRecord(rows), null, 2))
    setRawJsonError(null)
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditId(null)
    setForm(FORM_INICIAL)
    setTarifaRows([])
    setRawJson('{}')
    setRawJsonError(null)
    setFormError(null)
  }

  // Mantener rawJson sincronizado cuando se edita la tabla de tarifas
  const syncRows = (rows: TarifaRow[]) => {
    setTarifaRows(rows)
    setRawJson(JSON.stringify(rowsToRecord(rows), null, 2))
    setRawJsonError(null)
  }

  const addTarifaRow = () =>
    syncRows([...tarifaRows, { expId: '', precio: 0, moneda: 'MXN' }])

  const updateTarifaRow = (idx: number, patch: Partial<TarifaRow>) =>
    syncRows(tarifaRows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))

  const removeTarifaRow = (idx: number) =>
    syncRows(tarifaRows.filter((_, i) => i !== idx))

  // Editar el JSON crudo → parsear a filas
  const onRawJsonChange = (val: string) => {
    setRawJson(val)
    try {
      const parsed = JSON.parse(val) as TarifasNegociadas
      setTarifaRows(recordToRows(parsed))
      setRawJsonError(null)
    } catch {
      setRawJsonError('JSON inválido — corrige para sincronizar la tabla')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    // Validar que todas las filas de tarifa tengan experiencia seleccionada
    if (tarifaRows.some((r) => !r.expId)) {
      setFormError('Cada tarifa debe tener una experiencia seleccionada')
      return
    }
    setSaving(true)
    try {
      const comision =
        form.comision_porcentaje.trim() === '' ? null : Number(form.comision_porcentaje)
      const camposBody = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        contacto_nombre: form.contacto_nombre.trim() || null,
        contacto_email: form.contacto_email.trim() || null,
        contacto_tel: form.contacto_tel.trim() || null,
        comision_porcentaje: comision,
        idioma_default: form.idioma_default,
        moneda_default: form.moneda_default,
        notas_internas: form.notas_internas.trim() || null,
        activo: form.activo,
      }
      const tarifas = rowsToRecord(tarifaRows)

      if (editId) {
        // 1) campos (SIN tarifas)
        const resCampos = await fetch(`${API_URL}/api/admin/resellers/${editId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(camposBody),
        })
        if (!resCampos.ok) {
          const payload = await resCampos.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, resCampos.status))
        }
        // 2) tarifas (reemplazo entero)
        const resTarifas = await fetch(`${API_URL}/api/admin/resellers/${editId}/tarifas`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tarifas_negociadas: tarifas }),
        })
        if (!resTarifas.ok) {
          const payload = await resTarifas.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, resTarifas.status))
        }
      } else {
        // Crear: POST con todo (tarifas incluidas)
        const res = await fetch(`${API_URL}/api/admin/resellers`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...camposBody, tarifas_negociadas: tarifas }),
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, res.status))
        }
      }
      setModalOpen(false)
      closeModal()
      await fetchResellers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDesactivar = async (r: Reseller) => {
    if (!token) return
    if (!window.confirm(`¿Desactivar el reseller ${r.nombre}?`)) return
    setDesactivando(r.id)
    try {
      const res = await fetch(`${API_URL}/api/admin/resellers/${r.id}?hard=false`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      await fetchResellers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desactivar')
    } finally {
      setDesactivando(null)
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
              <Handshake className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-verde">Resellers / Clientes B2B</h1>
              <p className="text-sm text-verde-suave mt-1">
                Turoperadores, hoteles, corporativos y aliados con tarifas negociadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCrear}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
            aria-label="Crear nuevo reseller"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo Reseller
          </button>
        </header>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div>
            <label htmlFor="reseller-tipo" className="sr-only">
              Filtrar por tipo
            </label>
            <select
              id="reseller-tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde-suave"
              aria-hidden="true"
            />
            <label htmlFor="reseller-search" className="sr-only">
              Buscar reseller
            </label>
            <input
              id="reseller-search"
              type="search"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Buscar reseller..."
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
            onClick={fetchResellers}
            aria-label="Actualizar lista de resellers"
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
              onClick={fetchResellers}
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
              <span className="ml-3 text-sm text-verde-suave">Cargando resellers...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-verde-suave">
              <Handshake className="h-12 w-12 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
              <p className="font-medium">No hay resellers en esta vista</p>
              <p className="text-sm mt-1">Ajusta los filtros o agrega un nuevo reseller.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                    <th className="px-4 py-3 font-medium text-verde">Reseller</th>
                    <th className="px-4 py-3 font-medium text-verde">Tipo</th>
                    <th className="px-4 py-3 font-medium text-verde">Contacto</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Reservas</th>
                    <th className="px-4 py-3 font-medium text-verde">Tarifas</th>
                    <th className="px-4 py-3 font-medium text-verde">Estado</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => {
                    const tieneTarifas = Object.keys(r.tarifas_negociadas ?? {}).length > 0
                    const expanded = expandedId === r.id
                    return (
                      <Fragment key={r.id}>
                        <tr className="border-b border-neutro-borde hover:bg-neutro-light/50">
                          <td className="px-4 py-3 font-medium text-verde">{r.nombre}</td>
                          <td className="px-4 py-3 text-verde-suave">{tipoLabel(r.tipo)}</td>
                          <td className="px-4 py-3 text-verde-suave">
                            {r.contacto_nombre || <span className="italic text-neutro-gris">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center tabular-nums text-verde-suave">
                            {r.reservas_count}
                          </td>
                          <td className="px-4 py-3">
                            {tieneTarifas ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-verde/10 text-verde">
                                configuradas
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-neutro-light text-verde-suave">
                                sin tarifas
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {r.activo ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-verde/10 text-verde">
                                Activo
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-rojo/10 text-rojo">
                                Inactivo
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleExpand(r)}
                                aria-label={`${expanded ? 'Contraer' : 'Expandir'} reservas de ${r.nombre}`}
                                aria-expanded={expanded}
                                className="p-2 text-verde hover:bg-verde/10 rounded-lg"
                              >
                                {expanded ? (
                                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditar(r)}
                                aria-label={`Editar ${r.nombre}`}
                                className="p-2 text-verde hover:bg-verde/10 rounded-lg"
                              >
                                <Edit2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDesactivar(r)}
                                disabled={desactivando === r.id || !r.activo}
                                aria-label={`Desactivar ${r.nombre}`}
                                className="p-2 text-rojo hover:bg-rojo/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {desactivando === r.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <UserX className="h-4 w-4" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-neutro-light/30">
                            <td colSpan={7} className="px-4 py-3">
                              {detalleLoading ? (
                                <div className="flex items-center gap-2 text-sm text-verde-suave">
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                  Cargando reservas...
                                </div>
                              ) : !detalle || detalle.reservas.length === 0 ? (
                                <p className="text-sm text-verde-suave italic">
                                  Sin reservas registradas para este reseller.
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-verde mb-2">
                                    Últimas reservas ({detalle.reservas.length})
                                  </p>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-left text-verde-suave">
                                          <th className="px-2 py-1 font-medium">Booking</th>
                                          <th className="px-2 py-1 font-medium">Fecha</th>
                                          <th className="px-2 py-1 font-medium text-right">Monto</th>
                                          <th className="px-2 py-1 font-medium">Estado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {detalle.reservas.map((rv) => (
                                          <tr key={rv.booking_id} className="border-t border-neutro-borde">
                                            <td className="px-2 py-1 font-mono">
                                              <a
                                                href="/admin/reservas"
                                                className="text-terracota hover:underline"
                                              >
                                                {rv.booking_id}
                                              </a>
                                            </td>
                                            <td className="px-2 py-1 text-verde">
                                              {rv.fecha_experiencia}
                                            </td>
                                            <td className="px-2 py-1 text-right tabular-nums text-verde">
                                              {rv.monto_total != null ? formatMXN(rv.monto_total) : '—'}
                                            </td>
                                            <td className="px-2 py-1 text-verde-suave">{rv.estado}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-neutro-light border-t border-neutro-borde text-sm">
              <span className="text-verde-suave">
                {totalCount} resellers · Página {page} de {totalPages}
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="font-display text-xl text-verde flex items-center gap-2">
                <Handshake className="h-5 w-5 text-terracota" aria-hidden="true" />
                {editId ? 'Editar reseller' : 'Nuevo reseller'}
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

            <div className="p-6 space-y-6">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="res-nombre" className="block text-sm font-medium text-verde mb-1">
                    Nombre <span className="text-rojo">*</span>
                  </label>
                  <input
                    id="res-nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  />
                </div>
                <div>
                  <label htmlFor="res-tipo" className="block text-sm font-medium text-verde mb-1">
                    Tipo
                  </label>
                  <select
                    id="res-tipo"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as ResellerTipo })}
                    className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contacto principal */}
              <fieldset className="border border-neutro-borde rounded-lg p-4">
                <legend className="text-sm font-semibold text-verde px-2">Contacto principal</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="res-cnombre" className="block text-xs text-verde-suave mb-1">
                      Nombre
                    </label>
                    <input
                      id="res-cnombre"
                      type="text"
                      value={form.contacto_nombre}
                      onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-cemail" className="block text-xs text-verde-suave mb-1">
                      Email
                    </label>
                    <input
                      id="res-cemail"
                      type="email"
                      value={form.contacto_email}
                      onChange={(e) => setForm({ ...form, contacto_email: e.target.value })}
                      className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-ctel" className="block text-xs text-verde-suave mb-1">
                      Teléfono
                    </label>
                    <input
                      id="res-ctel"
                      type="tel"
                      value={form.contacto_tel}
                      onChange={(e) => setForm({ ...form, contacto_tel: e.target.value })}
                      className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Configuracion comercial */}
              <fieldset className="border border-neutro-borde rounded-lg p-4">
                <legend className="text-sm font-semibold text-verde px-2">
                  Configuración comercial
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="res-comision" className="block text-xs text-verde-suave mb-1">
                      Comisión (%)
                    </label>
                    <input
                      id="res-comision"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.comision_porcentaje}
                      onChange={(e) => setForm({ ...form, comision_porcentaje: e.target.value })}
                      placeholder="Ej: 10"
                      className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-idioma" className="block text-xs text-verde-suave mb-1">
                      Idioma default
                    </label>
                    <select
                      id="res-idioma"
                      value={form.idioma_default}
                      onChange={(e) => setForm({ ...form, idioma_default: e.target.value })}
                      className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                    >
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="res-moneda" className="block text-xs text-verde-suave mb-1">
                      Moneda default
                    </label>
                    <select
                      id="res-moneda"
                      value={form.moneda_default}
                      onChange={(e) => setForm({ ...form, moneda_default: e.target.value })}
                      className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                    >
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Editor de tarifas negociadas */}
              <fieldset className="border border-neutro-borde rounded-lg p-4">
                <legend className="text-sm font-semibold text-verde px-2">
                  Tarifas negociadas (experiencias privadas)
                </legend>
                <div className="space-y-2">
                  {tarifaRows.length === 0 && (
                    <p className="text-xs text-verde-suave italic">
                      Sin tarifas configuradas. Agrega una fila para negociar precios por experiencia.
                    </p>
                  )}
                  {tarifaRows.map((row, idx) => (
                    <div key={idx} className="flex items-end gap-2 flex-wrap">
                      <div className="flex-1 min-w-[180px]">
                        <label htmlFor={`tarifa-exp-${idx}`} className="block text-xs text-verde-suave mb-1">
                          Experiencia
                        </label>
                        <select
                          id={`tarifa-exp-${idx}`}
                          value={row.expId}
                          onChange={(e) => updateTarifaRow(idx, { expId: e.target.value })}
                          className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                        >
                          <option value="">— Selecciona experiencia —</option>
                          {experiencias.map((exp) => (
                            <option key={exp.id} value={exp.id}>
                              {exp.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-28">
                        <label htmlFor={`tarifa-precio-${idx}`} className="block text-xs text-verde-suave mb-1">
                          Precio p/p
                        </label>
                        <input
                          id={`tarifa-precio-${idx}`}
                          type="number"
                          min="0"
                          value={row.precio}
                          onChange={(e) => updateTarifaRow(idx, { precio: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                        />
                      </div>
                      <div className="w-24">
                        <label htmlFor={`tarifa-moneda-${idx}`} className="block text-xs text-verde-suave mb-1">
                          Moneda
                        </label>
                        <select
                          id={`tarifa-moneda-${idx}`}
                          value={row.moneda}
                          onChange={(e) =>
                            updateTarifaRow(idx, { moneda: e.target.value as MonedaTarifa })
                          }
                          className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
                        >
                          <option value="MXN">MXN</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTarifaRow(idx)}
                        aria-label={`Quitar tarifa ${nombreExperiencia(row.expId)}`}
                        className="p-2 text-rojo hover:bg-rojo/10 rounded-lg mb-0.5"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTarifaRow}
                    className="inline-flex items-center gap-1 text-sm text-terracota hover:text-terracota-dark mt-1"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Agregar tarifa
                  </button>
                </div>

                {/* Escape hatch JSON */}
                <div className="mt-4">
                  <label htmlFor="tarifas-json" className="block text-xs text-verde-suave mb-1">
                    JSON crudo (sincronizado — edición avanzada)
                  </label>
                  <textarea
                    id="tarifas-json"
                    rows={4}
                    value={rawJson}
                    onChange={(e) => onRawJsonChange(e.target.value)}
                    spellCheck={false}
                    className={`w-full px-3 py-2 border rounded-lg text-xs font-mono focus:ring-2 focus:ring-terracota/30 focus:border-terracota ${
                      rawJsonError ? 'border-rojo' : 'border-neutro-borde'
                    }`}
                  />
                  {rawJsonError && <p className="text-xs text-rojo mt-1">{rawJsonError}</p>}
                </div>
              </fieldset>

              <div>
                <label htmlFor="res-notas" className="block text-sm font-medium text-verde mb-1">
                  Notas internas
                </label>
                <textarea
                  id="res-notas"
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
                Reseller activo
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
                disabled={saving || !!rawJsonError}
                className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {editId ? 'Guardar cambios' : 'Crear reseller'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
