'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import {
  formatMXN,
  type Personal,
  type Reserva,
  type ReservaEstado,
} from '@/types/reservas'
import BadgeEstado from '../../components/BadgeEstado'
import BadgeEstadoPago from '../../components/BadgeEstadoPago'

interface ReservasTablaProps {
  refreshKey: number
  onRowClick: (id: string) => void
}

interface ListResponse {
  items: Reserva[]
  total: number
  page: number
  per_page: number
}

type SortKey = 'booking_id' | 'fecha_experiencia' | 'monto_total'
type SortOrder = 'asc' | 'desc'

const ESTADO_OPTIONS: { value: '' | ReservaEstado; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'tentativa', label: 'Tentativa' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'reagendada', label: 'Reagendada' },
]

const PER_PAGE_OPTIONS = [10, 20, 50, 100]

function compareReservas(a: Reserva, b: Reserva, key: SortKey): number {
  switch (key) {
    case 'booking_id':
      return a.booking_id.localeCompare(b.booking_id)
    case 'fecha_experiencia': {
      const da = `${a.fecha_experiencia}T${a.hora_inicio}`
      const db = `${b.fecha_experiencia}T${b.hora_inicio}`
      return da.localeCompare(db)
    }
    case 'monto_total':
      return a.monto_total - b.monto_total
  }
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 inline-block ml-1 opacity-50" aria-hidden="true" />
  return order === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 inline-block ml-1" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 inline-block ml-1" aria-hidden="true" />
  )
}

export default function ReservasTabla({ refreshKey, onRowClick }: ReservasTablaProps) {
  const { data: session, status } = useSession()

  const [items, setItems] = useState<Reserva[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<'' | ReservaEstado>('')
  const [vendedorId, setVendedorId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [vendedores, setVendedores] = useState<Personal[]>([])

  // Sort
  const [sortBy, setSortBy] = useState<SortKey>('fecha_experiencia')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Cancel inflight
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)

  // Debounce busqueda 400ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setBusqueda(busquedaInput.trim())
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [busquedaInput])

  // Reset page cuando cambien filtros
  useEffect(() => {
    setPage(1)
  }, [estado, vendedorId, fechaDesde, fechaHasta, busqueda, perPage])

  const token = session?.accessToken as string | undefined

  const fetchVendedoras = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/api/admin/personal?es_vendedor=true`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const arr: Personal[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : []
      setVendedores(arr.filter((v) => v.activo !== false && v.es_vendedor))
    } catch {
      /* silencioso */
    }
  }, [token])

  const fetchReservas = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      })
      if (estado) params.set('estado', estado)
      if (vendedorId) params.set('vendedor_id', vendedorId)
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      if (busqueda) params.set('busqueda', busqueda)

      const res = await fetch(`${API_URL}/api/admin/reservas?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data: ListResponse = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [token, page, perPage, estado, vendedorId, fechaDesde, fechaHasta, busqueda])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchVendedoras()
    }
  }, [status, fetchVendedoras])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReservas()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError('Sesion no autenticada')
    }
  }, [status, refreshKey, fetchReservas])

  const limpiarFiltros = () => {
    setBusquedaInput('')
    setBusqueda('')
    setEstado('')
    setVendedorId('')
    setFechaDesde('')
    setFechaHasta('')
    setPage(1)
  }

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const sortedItems = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      const cmp = compareReservas(a, b, sortBy)
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return copy
  }, [items, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const cancelarReserva = async (reserva: Reserva) => {
    if (!token) return
    const confirm = window.confirm(
      `Cancelar la reserva ${reserva.booking_id}?\nEsta accion no se puede deshacer.`,
    )
    if (!confirm) return
    setCancelandoId(reserva.id)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reserva.id}/cancelar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo: 'Cancelacion desde tabla' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || `Error ${res.status}`)
      }
      await fetchReservas()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Error al cancelar')
    } finally {
      setCancelandoId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white border border-neutro-borde rounded-lg p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[240px]">
            <label htmlFor="busqueda-reservas" className="sr-only">
              Buscar reservas
            </label>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde-suave"
              aria-hidden="true"
            />
            <input
              id="busqueda-reservas"
              type="search"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Buscar por booking ID, cliente, experiencia..."
              className="w-full pl-9 pr-9 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
            {busquedaInput && (
              <button
                type="button"
                aria-label="Limpiar busqueda"
                onClick={() => setBusquedaInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-verde-suave hover:text-verde"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div>
            <label htmlFor="filtro-estado" className="block text-xs text-verde-suave mb-1">
              Estado
            </label>
            <select
              id="filtro-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as '' | ReservaEstado)}
              className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              {ESTADO_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-vendedora" className="block text-xs text-verde-suave mb-1">
              Vendedora
            </label>
            <select
              id="filtro-vendedora"
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              <option value="">Todas</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                  {v.apellidos ? ` ${v.apellidos}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-desde" className="block text-xs text-verde-suave mb-1">
              Desde
            </label>
            <input
              id="filtro-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>

          <div>
            <label htmlFor="filtro-hasta" className="block text-xs text-verde-suave mb-1">
              Hasta
            </label>
            <input
              id="filtro-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="px-3 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-neutro-borde rounded-lg overflow-hidden">
        {error && (
          <div className="bg-rojo-bg border-b border-rojo/30 p-4 flex items-center gap-3">
            <span className="text-sm text-rojo flex-1">
              Error al cargar reservas. {error}
            </span>
            <button
              type="button"
              onClick={fetchReservas}
              className="text-sm bg-white text-rojo border border-rojo/30 px-3 py-1 rounded hover:bg-rojo/10"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutro-light border-b border-neutro-borde sticky top-0 z-10">
                <th
                  scope="col"
                  className="text-left px-3 py-3 font-medium text-verde cursor-pointer select-none"
                  onClick={() => toggleSort('booking_id')}
                >
                  Booking
                  <SortIcon active={sortBy === 'booking_id'} order={sortOrder} />
                </th>
                <th
                  scope="col"
                  className="text-left px-3 py-3 font-medium text-verde cursor-pointer select-none"
                  onClick={() => toggleSort('fecha_experiencia')}
                >
                  Fecha / Hora
                  <SortIcon active={sortBy === 'fecha_experiencia'} order={sortOrder} />
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Experiencia
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Cliente / Reseller
                </th>
                <th scope="col" className="text-center px-3 py-3 font-medium text-verde">
                  Inv
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Vendedora
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Guias
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Chinampa
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Estado
                </th>
                <th scope="col" className="text-left px-3 py-3 font-medium text-verde">
                  Pago
                </th>
                <th
                  scope="col"
                  className="text-right px-3 py-3 font-medium text-verde cursor-pointer select-none"
                  onClick={() => toggleSort('monto_total')}
                >
                  Total
                  <SortIcon active={sortBy === 'monto_total'} order={sortOrder} />
                </th>
                <th scope="col" className="text-center px-3 py-3 font-medium text-verde">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutro-borde">
                    <td colSpan={12} className="px-3 py-3">
                      <div className="h-5 bg-neutro-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-10 text-center text-verde-suave">
                    <p className="mb-3">No hay reservas con estos filtros.</p>
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className="text-sm text-terracota underline hover:text-terracota-dark"
                    >
                      Limpiar filtros
                    </button>
                  </td>
                </tr>
              ) : (
                sortedItems.map((r) => {
                  const invitados =
                    r.numero_invitados_max && r.numero_invitados_max !== r.numero_invitados_min
                      ? `${r.numero_invitados_min}-${r.numero_invitados_max}`
                      : String(r.numero_invitados_min)
                  const clienteReseller = r.reseller_nombre ?? r.usuario_nombre ?? '—'
                  const guias = r.guias ?? []
                  const guiasMostrar = guias.slice(0, 2).map((g) => g.nombre).join(', ')
                  const guiasExtra = guias.length > 2 ? `+${guias.length - 2}` : ''
                  const guiasTooltip = guias.map((g) => g.nombre).join(', ')
                  const cancelable =
                    r.estado !== 'cancelada' &&
                    r.estado !== 'realizada' &&
                    r.estado !== 'reagendada'

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-neutro-borde hover:bg-neutro-light/40"
                    >
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => onRowClick(r.id)}
                          className="font-mono text-xs text-terracota underline hover:text-terracota-dark"
                          aria-label={`Ver detalle de ${r.booking_id}`}
                        >
                          {r.booking_id}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-verde whitespace-nowrap">
                        {r.fecha_experiencia} · {r.hora_inicio.slice(0, 5)}
                      </td>
                      <td className="px-3 py-3 text-verde max-w-[200px] truncate" title={r.experiencia_nombre ?? ''}>
                        {r.experiencia_nombre ?? '—'}
                      </td>
                      <td className="px-3 py-3 text-verde max-w-[180px] truncate" title={clienteReseller}>
                        {clienteReseller}
                      </td>
                      <td className="px-3 py-3 text-center text-verde tabular-nums">{invitados}</td>
                      <td className="px-3 py-3 text-verde">{r.vendedor_nombre ?? '—'}</td>
                      <td className="px-3 py-3 text-verde" title={guiasTooltip || undefined}>
                        {guias.length > 0
                          ? `${guiasMostrar}${guiasExtra ? ` ${guiasExtra}` : ''}`
                          : r.guia_id
                          ? '1 asignado'
                          : '—'}
                      </td>
                      <td className="px-3 py-3 text-verde">{r.chinampa_asignada ?? '—'}</td>
                      <td className="px-3 py-3">
                        <BadgeEstado estado={r.estado} />
                      </td>
                      <td className="px-3 py-3">
                        <BadgeEstadoPago estado={r.estado_pago} />
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-verde font-medium">
                        {formatMXN(r.monto_total)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onRowClick(r.id)}
                            aria-label={`Ver detalle de ${r.booking_id}`}
                            className="p-1.5 rounded-lg hover:bg-verde/10 text-verde"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelarReserva(r)}
                            disabled={!cancelable || cancelandoId === r.id}
                            aria-label={`Cancelar ${r.booking_id}`}
                            className="p-1.5 rounded-lg hover:bg-rojo/10 text-rojo disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {cancelandoId === r.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutro-light/40 border-t border-neutro-borde flex-wrap gap-3">
          <div className="flex items-center gap-3 text-sm text-verde-suave">
            <span>
              {total} reservas · Pagina {page} de {totalPages}
            </span>
            <label className="flex items-center gap-2">
              <span>Por pagina:</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="border border-neutro-borde rounded px-2 py-1 text-sm"
                aria-label="Reservas por pagina"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              aria-label="Pagina anterior"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-neutro-borde rounded-lg text-verde hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              aria-label="Pagina siguiente"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-neutro-borde rounded-lg text-verde hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
