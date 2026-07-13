'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Truck, Calendar, RefreshCw, Search, Eye, X, MapPin,
  ChevronLeft, ChevronRight, AlertTriangle, Clock,
  CheckCircle, Package, FileText, Phone, Mail
} from 'lucide-react'
import { formatFechaMexico, formatFechaHoraMexico } from '@/lib/dates'

// ─── Types ───────────────────────────────────────────────

interface EntregaUsuario {
  id: string | null
  nombre: string | null
  email: string | null
  telefono: string | null
}

interface EntregaSuscripcion {
  id: string | null
  nombre: string | null
  direccion_entrega: string | null
  colonia: string | null
  tipo_entrega: string | null
}

interface Entrega {
  id: string
  fecha_entrega: string | null
  estado: string
  tipo_canasta: string | null
  productos_incluidos: unknown[] | null
  precio_total: number | null
  notas: string | null
  fecha_creacion: string | null
  fecha_actualizacion: string | null
  usuario: EntregaUsuario
  suscripcion: EntregaSuscripcion
}

interface EntregaDetalle extends Entrega {
  suscripcion: EntregaSuscripcion & {
    frecuencia: string | null
    canasta: string | null
  }
}

interface Metricas {
  por_estado: Record<string, number>
  entregas_hoy: number
  entregas_proximos_7dias: number
  entregadas_este_mes: number
  total: number
}

interface CalendarioDia {
  fecha: string
  total: number
  por_estado: Record<string, number>
}

interface RutaZona {
  colonia: string
  total_entregas: number
  entregas: Record<string, unknown>[]
}

// ─── Constants ───────────────────────────────────────────

const ESTADO_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
  programada: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Programada' },
  preparacion: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'En preparacion' },
  en_ruta: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En ruta' },
  entregada: { bg: 'bg-green-100', text: 'text-green-700', label: 'Entregada' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
}

const ESTADO_FLOW = ['pendiente', 'programada', 'preparacion', 'en_ruta', 'entregada']

type ViewMode = 'tabla' | 'calendario' | 'ruta'
type TabKey = 'datos' | 'productos' | 'acciones'

// ─── Component ───────────────────────────────────────────

export default function AdminEntregasPage() {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('tabla')

  // List state
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroColonia, setFiltroColonia] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [detalle, setDetalle] = useState<EntregaDetalle | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('datos')

  // Actions
  const [accionLoading, setAccionLoading] = useState(false)
  const [notasEdit, setNotasEdit] = useState('')
  const [editingNotas, setEditingNotas] = useState(false)

  // Calendario state
  const [calendarioDias, setCalendarioDias] = useState<CalendarioDia[]>([])
  const [calMes, setCalMes] = useState(new Date().getMonth() + 1)
  const [calAnio, setCalAnio] = useState(new Date().getFullYear())
  const [loadingCalendario, setLoadingCalendario] = useState(false)

  // Ruta del dia state
  const [rutaZonas, setRutaZonas] = useState<RutaZona[]>([])
  const [rutaFecha, setRutaFecha] = useState(new Date().toISOString().split('T')[0])
  const [rutaTotal, setRutaTotal] = useState(0)
  const [loadingRuta, setLoadingRuta] = useState(false)

  // ─── Fetchers ────────────────────────────────────────

  const fetchMetricas = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/entregas/metricas')
      if (res.ok) setMetricas(await res.json())
    } catch { /* silently fail */ }
  }, [])

  const fetchEntregas = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado)
      if (filtroFechaDesde) params.set('fecha_desde', filtroFechaDesde)
      if (filtroFechaHasta) params.set('fecha_hasta', filtroFechaHasta)
      if (filtroColonia) params.set('colonia', filtroColonia)
      if (busqueda) params.set('search', busqueda)

      const res = await fetch(`/api/admin/entregas?${params}`)
      if (!res.ok) throw new Error('Error cargando entregas')
      const data = await res.json()
      setEntregas(data.items)
      setTotalPages(data.pages)
      setTotalCount(data.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filtroEstado, filtroFechaDesde, filtroFechaHasta, filtroColonia, busqueda])

  const fetchCalendario = useCallback(async () => {
    try {
      setLoadingCalendario(true)
      const params = new URLSearchParams({ mes: String(calMes), anio: String(calAnio) })
      const res = await fetch(`/api/admin/entregas/calendario?${params}`)
      if (!res.ok) throw new Error('Error cargando calendario')
      const data = await res.json()
      setCalendarioDias(data.dias)
    } catch {
      setCalendarioDias([])
    } finally {
      setLoadingCalendario(false)
    }
  }, [calMes, calAnio])

  const fetchRuta = useCallback(async () => {
    try {
      setLoadingRuta(true)
      const params = new URLSearchParams({ fecha: rutaFecha })
      const res = await fetch(`/api/admin/entregas/ruta-del-dia?${params}`)
      if (!res.ok) throw new Error('Error cargando ruta')
      const data = await res.json()
      setRutaZonas(data.zonas)
      setRutaTotal(data.total_entregas)
    } catch {
      setRutaZonas([])
    } finally {
      setLoadingRuta(false)
    }
  }, [rutaFecha])

  useEffect(() => {
    fetchMetricas()
  }, [fetchMetricas])

  useEffect(() => {
    if (viewMode === 'tabla') fetchEntregas()
  }, [viewMode, fetchEntregas])

  useEffect(() => {
    if (viewMode === 'calendario') fetchCalendario()
  }, [viewMode, fetchCalendario])

  useEffect(() => {
    if (viewMode === 'ruta') fetchRuta()
  }, [viewMode, fetchRuta])

  // ─── Detail modal ────────────────────────────────────

  const openDetalle = async (id: string) => {
    try {
      setLoadingDetalle(true)
      setModalOpen(true)
      setActiveTab('datos')
      setEditingNotas(false)
      const res = await fetch(`/api/admin/entregas/${id}`)
      if (!res.ok) throw new Error('Error cargando detalle')
      const data = await res.json()
      setDetalle(data)
      setNotasEdit(data.notas || '')
    } catch {
      setDetalle(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setDetalle(null)
    setEditingNotas(false)
  }

  // ─── Actions ─────────────────────────────────────────

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!detalle) return
    try {
      setAccionLoading(true)
      const res = await fetch(`/api/admin/entregas/${detalle.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al cambiar estado')
        return
      }
      // Refresh
      const updated = await fetch(`/api/admin/entregas/${detalle.id}`)
      if (updated.ok) {
        const data = await updated.json()
        setDetalle(data)
      }
      fetchEntregas()
      fetchMetricas()
    } catch {
      alert('Error de red al cambiar estado')
    } finally {
      setAccionLoading(false)
    }
  }

  const guardarNotas = async () => {
    if (!detalle) return
    try {
      setAccionLoading(true)
      const res = await fetch(`/api/admin/entregas/${detalle.id}/notas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas: notasEdit }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al guardar notas')
        return
      }
      setDetalle({ ...detalle, notas: notasEdit })
      setEditingNotas(false)
    } catch {
      alert('Error de red al guardar notas')
    } finally {
      setAccionLoading(false)
    }
  }

  // ─── Helpers ─────────────────────────────────────────

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setBusqueda(busquedaInput)
  }

  const formatMoney = (amount: number | null) =>
    `$${(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (dateStr: string | null) => formatFechaMexico(dateStr)
  const formatDateTime = (dateStr: string | null) => formatFechaHoraMexico(dateStr)

  const getNextEstado = (current: string): string | null => {
    const idx = ESTADO_FLOW.indexOf(current)
    if (idx >= 0 && idx < ESTADO_FLOW.length - 1) return ESTADO_FLOW[idx + 1]
    return null
  }

  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entregas Programadas</h1>
          <p className="text-gray-600 mt-1">Gestiona las entregas de canastas y suscripciones</p>
        </div>
        <button
          onClick={() => { fetchEntregas(); fetchMetricas() }}
          className="flex items-center space-x-2 px-4 py-2 bg-[#33503E] text-white rounded-lg hover:bg-[#475A52]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPI Cards */}
      {metricas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Entregas hoy', value: metricas.entregas_hoy, icon: Truck, color: 'text-[#B15543]', bg: 'bg-orange-50' },
            { title: 'Proximos 7 dias', value: metricas.entregas_proximos_7dias, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Entregadas este mes', value: metricas.entregadas_este_mes, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Total entregas', value: metricas.total, icon: Package, color: 'text-gray-600', bg: 'bg-gray-50' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">{kpi.title}</p>
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View mode tabs */}
      <div className="flex gap-2">
        {[
          { key: 'tabla' as ViewMode, label: 'Tabla', icon: Package },
          { key: 'calendario' as ViewMode, label: 'Calendario', icon: Calendar },
          { key: 'ruta' as ViewMode, label: 'Ruta del dia', icon: MapPin },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === tab.key
                ? 'bg-[#33503E] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── VISTA TABLA ─── */}
      {viewMode === 'tabla' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <select
                value={filtroEstado}
                onChange={e => { setFiltroEstado(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
              >
                <option value="todos">Todos los estados</option>
                {Object.entries(ESTADO_BADGE).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>

              <input
                type="date"
                value={filtroFechaDesde}
                onChange={e => { setFiltroFechaDesde(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                placeholder="Desde"
              />
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={e => { setFiltroFechaHasta(e.target.value); setPage(1) }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                placeholder="Hasta"
              />

              <form onSubmit={handleBusqueda} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={busquedaInput}
                    onChange={e => setBusquedaInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52]">
                  Buscar
                </button>
                {(busqueda || filtroFechaDesde || filtroFechaHasta || filtroColonia) && (
                  <button
                    type="button"
                    onClick={() => { setBusquedaInput(''); setBusqueda(''); setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroColonia(''); setPage(1) }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
              <button onClick={fetchEntregas} className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
                Reintentar
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-6 w-6 animate-spin text-[#33503E]" />
                <span className="ml-2 text-gray-600">Cargando entregas...</span>
              </div>
            ) : entregas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-lg font-medium">No se encontraron entregas</p>
                <p className="text-sm">Intenta cambiar los filtros de busqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha entrega</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Colonia</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Notas</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.map(entrega => {
                      const badge = ESTADO_BADGE[entrega.estado] || { bg: 'bg-gray-100', text: 'text-gray-700', label: entrega.estado }
                      return (
                        <tr
                          key={entrega.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => openDetalle(entrega.id)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{formatDate(entrega.fecha_entrega)}</div>
                            <div className="text-xs text-gray-400 font-mono">{entrega.id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{entrega.usuario?.nombre || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-500">{entrega.usuario?.email || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 text-sm">{entrega.suscripcion?.colonia || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatMoney(entrega.precio_total)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm max-w-[150px] truncate">
                            {entrega.notas || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); openDetalle(entrega.id) }}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-[#33503E]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  {totalCount} entregas &middot; Pagina {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── VISTA CALENDARIO ─── */}
      {viewMode === 'calendario' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Mes navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (calMes === 1) { setCalMes(12); setCalAnio(a => a - 1) }
                else setCalMes(m => m - 1)
              }}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {MESES[calMes - 1]} {calAnio}
            </h2>
            <button
              onClick={() => {
                if (calMes === 12) { setCalMes(1); setCalAnio(a => a + 1) }
                else setCalMes(m => m + 1)
              }}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {loadingCalendario ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-6 w-6 animate-spin text-[#33503E]" />
              <span className="ml-2 text-gray-600">Cargando calendario...</span>
            </div>
          ) : calendarioDias.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No hay entregas en este mes</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
              ))}

              {/* Calendar cells */}
              {(() => {
                const firstDay = new Date(calAnio, calMes - 1, 1)
                const lastDay = new Date(calAnio, calMes, 0)
                const startDow = (firstDay.getDay() + 6) % 7 // Monday = 0
                const daysInMonth = lastDay.getDate()

                const diasMap: Record<string, CalendarioDia> = {}
                calendarioDias.forEach(d => { diasMap[d.fecha] = d })

                const cells = []
                // Empty cells before first day
                for (let i = 0; i < startDow; i++) {
                  cells.push(<div key={`empty-${i}`} className="h-20" />)
                }
                // Day cells
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = `${calAnio}-${String(calMes).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const diaData = diasMap[dateStr]
                  const isToday = dateStr === new Date().toISOString().split('T')[0]

                  cells.push(
                    <div
                      key={day}
                      className={`h-20 border rounded-lg p-1.5 text-xs ${
                        isToday ? 'border-[#33503E] bg-green-50' : 'border-gray-100'
                      } ${diaData ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => {
                        if (diaData) {
                          setRutaFecha(dateStr)
                          setViewMode('ruta')
                        }
                      }}
                    >
                      <div className={`font-medium ${isToday ? 'text-[#33503E]' : 'text-gray-700'}`}>{day}</div>
                      {diaData && (
                        <div className="mt-1">
                          <div className="font-bold text-[#33503E]">{diaData.total}</div>
                          <div className="flex gap-1 flex-wrap">
                            {Object.entries(diaData.por_estado).map(([estado, count]) => {
                              const b = ESTADO_BADGE[estado]
                              return b ? (
                                <span key={estado} className={`${b.bg} ${b.text} px-1 rounded text-[10px]`}>
                                  {count}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }
                return cells
              })()}
            </div>
          )}
        </div>
      )}

      {/* ─── VISTA RUTA DEL DIA ─── */}
      {viewMode === 'ruta' && (
        <div className="space-y-4">
          {/* Date selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
            <MapPin className="h-5 w-5 text-[#33503E]" />
            <span className="text-sm font-medium text-gray-700">Fecha:</span>
            <input
              type="date"
              value={rutaFecha}
              onChange={e => setRutaFecha(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            />
            <span className="text-sm text-gray-500">
              {rutaTotal} entregas en {rutaZonas.length} zonas
            </span>
          </div>

          {loadingRuta ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-gray-200">
              <RefreshCw className="h-6 w-6 animate-spin text-[#33503E]" />
              <span className="ml-2 text-gray-600">Cargando ruta...</span>
            </div>
          ) : rutaZonas.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-medium">No hay entregas para esta fecha</p>
              <p className="text-sm">Selecciona otra fecha o revisa el calendario</p>
            </div>
          ) : (
            rutaZonas.map((zona, zIdx) => (
              <div key={zIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#33503E] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{zona.colonia}</span>
                  </div>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                    {zona.total_entregas} entrega{zona.total_entregas !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {zona.entregas.map((ent, eIdx) => {
                    const entId = String(ent.id || '')
                    const entNombre = String(ent.usuario_nombre || 'Sin nombre')
                    const entDir = String(ent.direccion_entrega || '-')
                    const entTel = ent.usuario_telefono ? String(ent.usuario_telefono) : null
                    const entEstado = String(ent.estado || 'pendiente')
                    return (
                      <div
                        key={eIdx}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                        onClick={() => openDetalle(entId)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{entNombre}</div>
                          <div className="text-xs text-gray-500">{entDir}</div>
                          {entTel && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" /> {entTel}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            ESTADO_BADGE[entEstado]?.bg || 'bg-gray-100'
                          } ${ESTADO_BADGE[entEstado]?.text || 'text-gray-700'}`}>
                            {ESTADO_BADGE[entEstado]?.label || entEstado}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Detail Modal ──────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {detalle ? `Entrega - ${formatDate(detalle.fecha_entrega)}` : 'Cargando...'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetalle ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-6 w-6 animate-spin text-[#33503E]" />
              </div>
            ) : detalle ? (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                  {([
                    { key: 'datos' as TabKey, label: 'Datos' },
                    { key: 'productos' as TabKey, label: 'Productos' },
                    { key: 'acciones' as TabKey, label: 'Acciones' },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? 'border-[#33503E] text-[#33503E]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 max-h-[65vh] overflow-y-auto">
                  {/* ─── Tab: Datos ─── */}
                  {activeTab === 'datos' && (
                    <div className="space-y-6">
                      {/* Estado badge */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                        <span className="text-sm text-gray-500">Estado:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ESTADO_BADGE[detalle.estado]?.bg || 'bg-gray-100'
                        } ${ESTADO_BADGE[detalle.estado]?.text || 'text-gray-700'}`}>
                          {ESTADO_BADGE[detalle.estado]?.label || detalle.estado}
                        </span>
                      </div>

                      {/* Entrega info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Entrega</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Fecha entrega</span>
                            <p className="font-medium">{formatDate(detalle.fecha_entrega)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Tipo canasta</span>
                            <p className="font-medium">{detalle.tipo_canasta || detalle.suscripcion?.canasta || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Precio total</span>
                            <p className="font-medium">{formatMoney(detalle.precio_total)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Tipo entrega</span>
                            <p className="font-medium capitalize">{detalle.suscripcion?.tipo_entrega || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Creada</span>
                            <p className="font-medium">{formatDateTime(detalle.fecha_creacion)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Actualizada</span>
                            <p className="font-medium">{formatDateTime(detalle.fecha_actualizacion)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cliente */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Nombre</span>
                            <p className="font-medium">{detalle.usuario?.nombre || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Email</span>
                            <p className="font-medium flex items-center gap-1">
                              {detalle.usuario?.email || '-'}
                              {detalle.usuario?.email && (
                                <a href={`mailto:${detalle.usuario.email}`} className="text-[#33503E]">
                                  <Mail className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Telefono</span>
                            <p className="font-medium flex items-center gap-1">
                              {detalle.usuario?.telefono || '-'}
                              {detalle.usuario?.telefono && (
                                <a
                                  href={`https://wa.me/52${detalle.usuario.telefono.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Direccion */}
                      {detalle.suscripcion?.direccion_entrega && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Direccion de entrega</h3>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-700">{detalle.suscripcion.direccion_entrega}</p>
                            {detalle.suscripcion.colonia && (
                              <p className="text-sm text-gray-500 mt-1">Colonia: {detalle.suscripcion.colonia}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Suscripcion */}
                      {detalle.suscripcion?.nombre && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Suscripcion</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-gray-500">Nombre</span>
                              <p className="font-medium">{detalle.suscripcion.nombre}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Frecuencia</span>
                              <p className="font-medium capitalize">{detalle.suscripcion.frecuencia || '-'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notas */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase">Notas</h3>
                          {!editingNotas && (
                            <button
                              onClick={() => setEditingNotas(true)}
                              className="text-xs text-[#33503E] hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" /> Editar
                            </button>
                          )}
                        </div>
                        {editingNotas ? (
                          <div className="space-y-2">
                            <textarea
                              value={notasEdit}
                              onChange={e => setNotasEdit(e.target.value)}
                              rows={3}
                              maxLength={2000}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                              placeholder="Agregar notas de entrega..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={guardarNotas}
                                disabled={accionLoading}
                                className="px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50"
                              >
                                {accionLoading ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button
                                onClick={() => { setEditingNotas(false); setNotasEdit(detalle.notas || '') }}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                            {detalle.notas || 'Sin notas'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Tab: Productos ─── */}
                  {activeTab === 'productos' && (
                    <div className="space-y-4">
                      {!detalle.productos_incluidos || (detalle.productos_incluidos as unknown[]).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                          <p>No hay productos registrados para esta entrega</p>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left px-3 py-2 font-medium text-gray-600">Producto</th>
                                <th className="text-right px-3 py-2 font-medium text-gray-600">Cantidad (kg)</th>
                                <th className="text-left px-3 py-2 font-medium text-gray-600">Notas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(detalle.productos_incluidos as Record<string, unknown>[]).map((prod, idx) => (
                                <tr key={idx} className="border-t border-gray-100">
                                  <td className="px-3 py-2 font-medium">{(prod.producto_id as string) || (prod.nombre as string) || '-'}</td>
                                  <td className="px-3 py-2 text-right">{(prod.cantidad_kg as number) || (prod.cantidad as number) || '-'}</td>
                                  <td className="px-3 py-2 text-gray-500 text-xs max-w-[200px] truncate">{(prod.razon as string) || (prod.notas as string) || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Tab: Acciones ─── */}
                  {activeTab === 'acciones' && (
                    <div className="space-y-4">
                      {/* Estado flow visual */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-3">Flujo de estado:</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {ESTADO_FLOW.map((est, idx) => {
                            const badge = ESTADO_BADGE[est]
                            const isCurrent = detalle.estado === est
                            const isPast = ESTADO_FLOW.indexOf(detalle.estado) > idx
                            return (
                              <div key={est} className="flex items-center gap-1">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  isCurrent ? `${badge.bg} ${badge.text} ring-2 ring-offset-1 ring-[#33503E]`
                                  : isPast ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {badge.label}
                                </span>
                                {idx < ESTADO_FLOW.length - 1 && (
                                  <ChevronRight className="h-3 w-3 text-gray-300" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Next state action */}
                      {detalle.estado !== 'cancelada' && detalle.estado !== 'entregada' && (
                        <div className="border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-gray-900">Avanzar estado</p>
                                <p className="text-xs text-gray-500">
                                  Cambiar de &quot;{ESTADO_BADGE[detalle.estado]?.label}&quot; a &quot;{ESTADO_BADGE[getNextEstado(detalle.estado) || '']?.label}&quot;
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const next = getNextEstado(detalle.estado)
                                if (next) cambiarEstado(next)
                              }}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm font-medium hover:bg-[#475A52] disabled:opacity-50"
                            >
                              {accionLoading ? 'Cambiando...' : `Marcar como ${ESTADO_BADGE[getNextEstado(detalle.estado) || '']?.label}`}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cancel */}
                      {detalle.estado !== 'cancelada' && detalle.estado !== 'entregada' && (
                        <div className="border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium text-gray-900">Cancelar entrega</p>
                                <p className="text-xs text-gray-500">La entrega sera marcada como cancelada</p>
                              </div>
                            </div>
                            <button
                              onClick={() => cambiarEstado('cancelada')}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                            >
                              {accionLoading ? 'Cancelando...' : 'Cancelar entrega'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Already completed */}
                      {detalle.estado === 'entregada' && (
                        <div className="bg-green-50 rounded-lg p-6 text-center">
                          <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <p className="font-medium text-green-700">Esta entrega fue completada</p>
                        </div>
                      )}

                      {detalle.estado === 'cancelada' && (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                          <AlertTriangle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p className="font-medium">Esta entrega fue cancelada</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">No se pudo cargar el detalle</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
