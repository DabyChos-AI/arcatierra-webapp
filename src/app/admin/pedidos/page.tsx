'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package, TrendingUp, DollarSign, Clock, RefreshCw,
  Search, ChevronLeft, ChevronRight, X, Truck, Store,
  AlertTriangle, Eye
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'

interface Pedido {
  id: string
  numero_pedido: string
  total: number
  estado: string
  fecha_pedido: string
  fecha_entrega: string | null
  tipo_entrega: string
  metodo_pago: string
  costo_envio: number
  cliente_id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
}

interface PedidoDetalle extends Pedido {
  sub_total: number
  impuestos: number
  notas_entrega: string | null
  direccion_entrega: string
  items: {
    producto_id: string
    producto_nombre: string
    categoria: string
    cantidad: number
    precio_unitario_al_momento: number
    subtotal: number
  }[]
  pagos: {
    id: string
    mp_payment_id: string
    mp_status: string
    mp_payment_method: string
    monto_total: number
    fecha_pago: string
  }[]
  direccion_principal: {
    nombre_direccion: string
    calle: string
    numero_exterior: string
    numero_interior: string
    colonia: string
    codigo_postal: string
    ciudad: string
    estado: string
  } | null
}

interface Stats {
  total_hoy: number
  revenue_hoy: number
  total_semana: number
  revenue_semana: number
  pendientes_activos: number
  por_estado: Record<string, number>
}

const ESTADOS_BADGE: Record<string, { bg: string; text: string }> = {
  esperando_pago: { bg: 'bg-gray-100', text: 'text-gray-700' },
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  pagado: { bg: 'bg-green-100', text: 'text-green-700' },
  confirmado: { bg: 'bg-green-100', text: 'text-green-700' },
  preparando: { bg: 'bg-amber-100', text: 'text-amber-700' },
  empacado: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  en_ruta: { bg: 'bg-blue-100', text: 'text-blue-700' },
  entregado: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700' },
  reembolsado: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

const ESTADO_LABELS: Record<string, string> = {
  esperando_pago: 'Esperando pago',
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  empacado: 'Empacado',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

const FILTRO_ESTADOS = [
  'todos', 'esperando_pago', 'pendiente', 'pagado', 'confirmado',
  'preparando', 'empacado', 'en_ruta', 'entregado', 'cancelado', 'reembolsado'
]

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  esperando_pago: ['pagado', 'cancelado'],
  pendiente: ['pagado', 'confirmado', 'cancelado'],
  pagado: ['confirmado', 'preparando', 'cancelado', 'reembolsado'],
  confirmado: ['preparando', 'cancelado', 'reembolsado'],
  preparando: ['empacado', 'cancelado'],
  empacado: ['en_ruta', 'cancelado'],
  en_ruta: ['entregado'],
  entregado: ['reembolsado'],
  cancelado: [],
  reembolsado: [],
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')

  // Modal state
  const [detalle, setDetalle] = useState<PedidoDetalle | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pedidos/stats')
      if (res.ok) setStats(await res.json())
    } catch {}
  }, [])

  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), per_page: '20' })
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado)
      if (busqueda) params.set('busqueda', busqueda)

      const res = await fetch(`/api/admin/pedidos?${params}`)
      if (!res.ok) throw new Error('Error cargando pedidos')
      const data = await res.json()
      setPedidos(data.items)
      setTotalPages(data.total_pages)
      setTotalCount(data.total_count)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filtroEstado, busqueda])

  useEffect(() => {
    fetchStats()
    fetchPedidos()
    const interval = setInterval(() => {
      fetchStats()
      fetchPedidos()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchStats, fetchPedidos])

  const openDetalle = async (pedidoId: string) => {
    try {
      setLoadingDetalle(true)
      setModalOpen(true)
      const res = await fetch(`/api/admin/pedidos/${pedidoId}`)
      if (!res.ok) throw new Error('Error cargando detalle')
      const data = await res.json()
      setDetalle(data)
      setNuevoEstado('')
    } catch {
      setDetalle(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const cambiarEstado = async () => {
    if (!detalle || !nuevoEstado) return
    try {
      setCambiandoEstado(true)
      const res = await fetch(`/api/admin/pedidos/${detalle.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al cambiar estado')
        return
      }
      // Refresh
      setModalOpen(false)
      setDetalle(null)
      fetchPedidos()
      fetchStats()
    } catch {
      alert('Error de red al cambiar estado')
    } finally {
      setCambiandoEstado(false)
    }
  }

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setBusqueda(busquedaInput)
  }

  const handleFiltroEstado = (estado: string) => {
    setPage(1)
    setFiltroEstado(estado)
  }

  const formatDate = (dateStr: string) => {
    return formatFechaHoraMexico(dateStr, {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatMoney = (amount: number) => {
    return `$${(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-1">Administra y da seguimiento a los pedidos</p>
        </div>
        <button
          onClick={() => { fetchPedidos(); fetchStats() }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: 'Pedidos hoy', value: stats.total_hoy, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Revenue hoy', value: formatMoney(stats.revenue_hoy), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Pedidos semana', value: stats.total_semana, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { title: 'Revenue semana', value: formatMoney(stats.revenue_semana), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { title: 'Activos', value: stats.pendientes_activos, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filtro por estado - tabs */}
          <div className="flex flex-wrap gap-2 flex-1">
            {FILTRO_ESTADOS.map(e => (
              <button
                key={e}
                onClick={() => handleFiltroEstado(e)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filtroEstado === e
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {e === 'todos' ? 'Todos' : ESTADO_LABELS[e] || e}
                {e !== 'todos' && stats?.por_estado?.[e] ? ` (${stats.por_estado[e]})` : ''}
              </button>
            ))}
          </div>
          {/* Búsqueda */}
          <form onSubmit={handleBusqueda} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedido o cliente..."
                value={busquedaInput}
                onChange={e => setBusquedaInput(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              Buscar
            </button>
            {busqueda && (
              <button
                type="button"
                onClick={() => { setBusquedaInput(''); setBusqueda(''); setPage(1) }}
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
          <button onClick={fetchPedidos} className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Cargando pedidos...</span>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No se encontraron pedidos</p>
            <p className="text-sm">Intenta cambiar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">N° Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Entrega</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => {
                  const badge = ESTADOS_BADGE[pedido.estado] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  return (
                    <tr
                      key={pedido.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => { e.preventDefault(); openDetalle(pedido.id) }}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                        {pedido.numero_pedido}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{pedido.cliente_nombre || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-500">{pedido.cliente_email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(pedido.fecha_pedido)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatMoney(pedido.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {ESTADO_LABELS[pedido.estado] || pedido.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {pedido.tipo_entrega === 'recoger_bodega' ? (
                          <span className="inline-flex items-center text-xs text-orange-600">
                            <Store className="h-3.5 w-3.5 mr-1" />Bodega
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-blue-600">
                            <Truck className="h-3.5 w-3.5 mr-1" />Domicilio
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); e.preventDefault(); openDetalle(pedido.id) }}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {totalCount} pedidos &middot; Página {page} de {totalPages}
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

      {/* Modal Detalle */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setDetalle(null) } }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Header modal - sticky para que la X siempre sea visible */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {detalle ? `Pedido ${detalle.numero_pedido}` : 'Cargando...'}
              </h2>
              <button onClick={() => { setModalOpen(false); setDetalle(null) }} className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingDetalle ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : detalle ? (
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Estado + Cambiar estado */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-gray-500">Estado actual:</span>
                    <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      ESTADOS_BADGE[detalle.estado]?.bg || 'bg-gray-100'
                    } ${ESTADOS_BADGE[detalle.estado]?.text || 'text-gray-700'}`}>
                      {ESTADO_LABELS[detalle.estado] || detalle.estado}
                    </span>
                  </div>
                  {TRANSICIONES_VALIDAS[detalle.estado]?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        value={nuevoEstado}
                        onChange={e => setNuevoEstado(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Cambiar a...</option>
                        {TRANSICIONES_VALIDAS[detalle.estado].map(e => (
                          <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                        ))}
                      </select>
                      <button
                        onClick={cambiarEstado}
                        disabled={!nuevoEstado || cambiandoEstado}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {cambiandoEstado ? 'Guardando...' : 'Actualizar'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Cliente */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Nombre</span>
                      <p className="font-medium">{detalle.cliente_nombre || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Email</span>
                      <p className="font-medium">{detalle.cliente_email || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Teléfono</span>
                      <p className="font-medium">{detalle.cliente_telefono || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                {(detalle.direccion_entrega || detalle.direccion_principal) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dirección de entrega</h3>
                    {detalle.direccion_principal ? (
                      <p className="text-gray-700">
                        {detalle.direccion_principal.calle} {detalle.direccion_principal.numero_exterior}
                        {detalle.direccion_principal.numero_interior ? ` Int. ${detalle.direccion_principal.numero_interior}` : ''}
                        , {detalle.direccion_principal.colonia}, CP {detalle.direccion_principal.codigo_postal}
                        , {detalle.direccion_principal.ciudad}
                      </p>
                    ) : (
                      <p className="text-gray-700">{detalle.direccion_entrega}</p>
                    )}
                  </div>
                )}

                {/* Notas de entrega */}
                {detalle.notas_entrega && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notas de entrega</h3>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{detalle.notas_entrega}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Items ({detalle.items?.length || 0})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Producto</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600">Cant.</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Precio</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalle.items?.map((item, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-2">
                              <div className="font-medium">{item.producto_nombre || item.producto_id}</div>
                              {item.categoria && <div className="text-xs text-gray-500">{item.categoria}</div>}
                            </td>
                            <td className="px-3 py-2 text-center">{item.cantidad}</td>
                            <td className="px-3 py-2 text-right">{formatMoney(item.precio_unitario_al_momento)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatMoney(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {detalle.sub_total != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatMoney(detalle.sub_total)}</span>
                      </div>
                    )}
                    {detalle.costo_envio != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo envío</span>
                        <span>{formatMoney(detalle.costo_envio)}</span>
                      </div>
                    )}
                    {detalle.impuestos != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impuestos</span>
                        <span>{formatMoney(detalle.impuestos)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
                      <span>Total</span>
                      <span className="text-green-700">{formatMoney(detalle.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Pagos */}
                {detalle.pagos && detalle.pagos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Pagos</h3>
                    <div className="space-y-2">
                      {detalle.pagos.map(pago => (
                        <div key={pago.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500">ID MP:</span>
                            <span className="ml-1 font-mono text-xs">{pago.mp_payment_id || '-'}</span>
                            <span className="ml-3 text-xs text-gray-500">{pago.mp_payment_method || ''}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              pago.mp_status === 'approved' ? 'bg-green-100 text-green-700' :
                              pago.mp_status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {pago.mp_status}
                            </span>
                            <span className="font-semibold">{formatMoney(pago.monto_total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo de entrega:</span>
                    <span className="ml-2 font-medium">
                      {detalle.tipo_entrega === 'recoger_bodega' ? 'Recoger en bodega' : 'Envío a domicilio'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Método de pago:</span>
                    <span className="ml-2 font-medium">{detalle.metodo_pago || '-'}</span>
                  </div>
                  {detalle.fecha_entrega && (
                    <div>
                      <span className="text-gray-500">Fecha entrega:</span>
                      <span className="ml-2 font-medium">{formatDate(detalle.fecha_entrega)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">No se pudo cargar el detalle</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
