'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
  Utensils,
  Inbox,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  AlertTriangle,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'
import { formatMXN } from '@/types/reservas'
import { API_URL } from '@/lib/api'
import {
  CateringItem,
  CateringListResponse,
  CateringStats,
  EstadoCatering,
  Vendedor,
  ESTADO_BADGE,
  formatFechaEvento,
} from './types'
import ModalNuevaSolicitud from './components/ModalNuevaSolicitud'
import ModalDetalleCatering from './components/ModalDetalleCatering'

// ─── Constantes ──────────────────────────────────────────────
type FiltroEstado = '' | EstadoCatering

const TABS: { key: FiltroEstado; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'sin_contactar', label: 'Sin contactar' },
  { key: 'cotizando', label: 'Cotizando' },
  { key: 'cerrada_ganada', label: 'Cerradas ganadas' },
  { key: 'cerrada_perdida', label: 'Cerradas perdidas' },
]

const PER_PAGE = 20

// ─── Componente ──────────────────────────────────────────────
export default function CateringPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  // Datos
  const [items, setItems] = useState<CateringItem[]>([])
  const [stats, setStats] = useState<CateringStats | null>(null)
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paginación + filtros
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('')
  const [filtroVendedor, setFiltroVendedor] = useState<string>('')
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Modales
  const [nuevaOpen, setNuevaOpen] = useState(false)
  const [detalle, setDetalle] = useState<CateringItem | null>(null)

  // ─── Fetchers ──────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!token) return
    try {
      setStatsLoading(true)
      const res = await fetch(`${API_URL}/api/admin/catering/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data: CateringStats = await res.json()
        setStats(data)
      }
    } catch {
      /* stats no críticos */
    } finally {
      setStatsLoading(false)
    }
  }, [token])

  const fetchList = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      })
      if (filtroEstado) params.set('estado', filtroEstado)
      if (filtroVendedor) params.set('vendedor_id', filtroVendedor)
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      if (busqueda) params.set('search', busqueda)

      const res = await fetch(`${API_URL}/api/admin/catering?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} cargando solicitudes`)
      }
      const data: CateringListResponse = await res.json()
      setItems(data.items)
      setTotalCount(data.total)
      setTotalPages(data.total_pages)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [token, page, filtroEstado, filtroVendedor, fechaDesde, fechaHasta, busqueda])

  // Vendedores para el dropdown (fallback silencioso si falla)
  const fetchVendedores = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(
        `${API_URL}/api/admin/personal?es_vendedor=true`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) return
      const data = await res.json()
      // Tolera tanto {items:[...]} (contrato Fase E) como un array plano.
      const arr: Array<{
        id: string
        nombre: string
        apellidos?: string | null
        activo?: boolean
        es_vendedor?: boolean
      }> = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : []
      setVendedores(
        arr
          .filter((p) => p.activo !== false)
          .map((p) => ({
            id: String(p.id),
            nombre: `${p.nombre}${p.apellidos ? ` ${p.apellidos}` : ''}`.trim(),
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      )
    } catch {
      /* dropdown vacío si falla — el filtro "Todos" sigue funcionando */
    }
  }, [token])

  // Reset page al cambiar filtros
  useEffect(() => {
    setPage(1)
  }, [filtroEstado, filtroVendedor, fechaDesde, fechaHasta, busqueda])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchVendedores()
  }, [fetchVendedores])

  // Debounce búsqueda 300ms
  useEffect(() => {
    const handle = setTimeout(() => setBusqueda(busquedaInput.trim()), 300)
    return () => clearTimeout(handle)
  }, [busquedaInput])

  // ─── Callbacks modales ─────────────────────────────────────
  const handleCreated = (item: CateringItem) => {
    setNuevaOpen(false)
    fetchList()
    fetchStats()
    setDetalle(item) // abre el detalle de la recién creada
  }

  const handleChanged = (updated: CateringItem) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
    setDetalle((prev) => (prev && prev.id === updated.id ? updated : prev))
    fetchStats()
  }

  const handleDeleted = (id: string) => {
    setDetalle(null)
    setItems((prev) => prev.filter((it) => it.id !== id))
    fetchList()
    fetchStats()
  }

  const handleRefresh = () => {
    fetchList()
    fetchStats()
  }

  // ─── KPI cards ─────────────────────────────────────────────
  const kpiCards = useMemo(() => {
    if (!stats) return null
    return [
      {
        title: 'Sin contactar',
        value: stats.sin_contactar,
        icon: Inbox,
        bgClass: 'bg-[#B15543]/10',
        textClass: 'text-[#B15543]',
      },
      {
        title: 'Cotizando',
        value: stats.cotizando,
        icon: Clock,
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-600',
      },
      {
        title: 'Cerradas ganadas (mes)',
        value: stats.cerradas_ganadas_mes,
        icon: CheckCircle,
        bgClass: 'bg-[#33503E]/10',
        textClass: 'text-[#33503E]',
      },
      {
        title: 'Monto cotizado (mes)',
        value: formatMXN(stats.monto_cotizado_mes || 0),
        icon: DollarSign,
        bgClass: 'bg-[#33503E]/10',
        textClass: 'text-[#1F3024]',
      },
    ]
  }, [stats])

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#B15543]/10">
            <Utensils className="h-6 w-6 text-[#B15543]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Catering — Solicitudes
            </h1>
            <p className="text-gray-600 mt-1">
              Bandeja de solicitudes recibidas (formulario público, email,
              WhatsApp, manual)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNuevaOpen(true)}
            aria-label="Nueva solicitud manual"
            className="flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg hover:bg-[#975543] focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nueva solicitud (manual)</span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Actualizar lista de solicitudes"
            className="flex items-center gap-2 px-4 py-2 bg-[#33503E] text-white rounded-lg hover:bg-[#475A52] disabled:opacity-50"
            disabled={loading || statsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading || statsLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading || !kpiCards
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
              >
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-lg bg-gray-200" />
                  <div className="ml-3 flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-5 bg-gray-300 rounded w-12" />
                  </div>
                </div>
              </div>
            ))
          : kpiCards.map((kpi, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${kpi.bgClass}`}>
                    <kpi.icon
                      className={`h-5 w-5 ${kpi.textClass}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">
                      {kpi.title}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {kpi.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Tabs estado */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const active = filtroEstado === tab.key
            return (
              <button
                key={tab.key || 'todos'}
                type="button"
                onClick={() => setFiltroEstado(tab.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-[#33503E] text-white border-[#33503E]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#33503E]/50 hover:text-[#33503E]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Vendedor + fechas + búsqueda */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="filtro-vendedor" className="text-xs text-gray-500">
              Vendedor
            </label>
            <select
              id="filtro-vendedor"
              value={filtroVendedor}
              onChange={(e) => setFiltroVendedor(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="fecha-desde" className="text-xs text-gray-500">
              Desde
            </label>
            <input
              id="fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="fecha-hasta" className="text-xs text-gray-500">
              Hasta
            </label>
            <input
              id="fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <label htmlFor="busqueda-catering" className="text-xs text-gray-500 block mb-1">
              Buscar
            </label>
            <Search
              className="absolute left-3 top-[34px] h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="busqueda-catering"
              type="search"
              placeholder="Nombre, empresa, email, mensaje…"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            />
            {busquedaInput && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setBusquedaInput('')}
                className="absolute right-2 top-[30px] p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" aria-hidden="true" />
          <span className="text-red-700">{error}</span>
          <button
            type="button"
            onClick={fetchList}
            className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Inbox className="h-12 w-12 mx-auto text-gray-300 mb-3" aria-hidden="true" />
            <p className="text-lg font-medium">No hay solicitudes</p>
            <p className="text-sm mt-1">
              Cuando llegue una solicitud de catering aparecerá aquí. También
              puedes crear una manualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Solicitud</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo evento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha evento</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Invitados</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const badge = ESTADO_BADGE[it.estado]
                  return (
                    <tr
                      key={it.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setDetalle(it)}
                    >
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {formatFechaHoraMexico(it.fecha_solicitud)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {it.contacto_nombre || 'Sin nombre'}
                        </div>
                        {it.contacto_email && (
                          <div className="text-xs text-gray-500 break-all">
                            {it.contacto_email}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {it.empresa || (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {it.tipo_evento || (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {formatFechaEvento(it.fecha_evento)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {it.numero_invitados_aprox ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {it.vendedor_nombre || (
                          <span className="text-gray-400 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          aria-label={`Ver detalle de la solicitud de ${it.contacto_nombre || it.contacto_email || it.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetalle(it)
                          }}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-[#33503E]"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {totalCount} solicitudes &middot; Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Página anterior"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Página siguiente"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalNuevaSolicitud
        open={nuevaOpen}
        token={token}
        onClose={() => setNuevaOpen(false)}
        onCreated={handleCreated}
      />

      {detalle && (
        <ModalDetalleCatering
          key={detalle.id}
          item={detalle}
          token={token}
          vendedores={vendedores}
          onClose={() => setDetalle(null)}
          onChanged={handleChanged}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
