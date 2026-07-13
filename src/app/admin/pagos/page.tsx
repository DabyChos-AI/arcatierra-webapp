'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, DollarSign, Clock, XCircle, RefreshCw,
  Search, ChevronLeft, ChevronRight, X, Eye, AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'

interface Pago {
  id: string
  mp_payment_id: string | null
  mp_status: string
  mp_status_detail: string | null
  mp_payment_method: string | null
  mp_payment_type: string | null
  monto_total: number
  monto_neto: number | null
  comision_mp: number | null
  moneda: string
  tipo_pago: string
  origen: string
  fecha_pago: string | null
  fecha_registro: string
  numero_pedido: string | null
  pedido_id: string | null
  cliente_nombre: string | null
  cliente_email: string | null
}

interface PagoDetalle extends Pago {
  mp_preference_id: string | null
  mp_preapproval_id: string | null
  suscripcion_id: string | null
  usuario_id: string | null
  webhook_raw: Record<string, unknown> | null
  pedido_total: number | null
  pedido_estado: string | null
  cliente_telefono: string | null
}

interface Stats {
  total_recaudado: number
  cantidad_aprobados: number
  total_pendientes: number
  cantidad_pendientes: number
  total_rechazados: number
  cantidad_rechazados: number
  comisiones_mp_total: number
  por_metodo: { metodo: string; cantidad: number; total: number }[]
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
  in_process: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En proceso' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Reembolsado' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado' },
  charged_back: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Contracargo' },
}

export default function AdminPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')

  // Modal
  const [detalle, setDetalle] = useState<PagoDetalle | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pagos/stats')
      if (res.ok) setStats(await res.json())
    } catch {}
  }, [])

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), per_page: '20' })
      if (filtroStatus) params.set('mp_status', filtroStatus)
      if (filtroTipo) params.set('tipo_pago', filtroTipo)
      if (busqueda) params.set('busqueda', busqueda)

      const res = await fetch(`/api/admin/pagos?${params}`)
      if (!res.ok) throw new Error('Error cargando pagos')
      const data = await res.json()
      setPagos(data.items)
      setTotalPages(data.total_pages)
      setTotalCount(data.total_count)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filtroStatus, filtroTipo, busqueda])

  useEffect(() => {
    fetchStats()
    fetchPagos()
  }, [fetchStats, fetchPagos])

  const openDetalle = async (pagoId: string) => {
    try {
      setLoadingDetalle(true)
      setModalOpen(true)
      const res = await fetch(`/api/admin/pagos/${pagoId}`)
      if (!res.ok) throw new Error('Error cargando detalle')
      setDetalle(await res.json())
    } catch {
      setDetalle(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setBusqueda(busquedaInput)
  }

  const formatDate = (dateStr: string | null) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Historial de Pagos</h1>
          <p className="text-gray-600 mt-1">Seguimiento de transacciones MercadoPago</p>
        </div>
        <button
          onClick={() => { fetchPagos(); fetchStats() }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total recaudado', value: formatMoney(stats.total_recaudado), sub: `${stats.cantidad_aprobados} aprobados`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Pendientes', value: formatMoney(stats.total_pendientes), sub: `${stats.cantidad_pendientes} pagos`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { title: 'Rechazados', value: formatMoney(stats.total_rechazados), sub: `${stats.cantidad_rechazados} pagos`, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { title: 'Comisiones MP', value: formatMoney(stats.comisiones_mp_total), sub: 'Total cobrado', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">{kpi.title}</p>
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-400">{kpi.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desglose por método */}
      {stats && stats.por_metodo.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Desglose por método de pago</h3>
          <div className="flex flex-wrap gap-4">
            {stats.por_metodo.map(m => (
              <div key={m.metodo} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium capitalize">{m.metodo}</span>
                <span className="text-xs text-gray-500">({m.cantidad})</span>
                <span className="text-sm font-bold text-green-700">{formatMoney(m.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <form onSubmit={handleBusqueda} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID pago, N° pedido o email..."
                value={busquedaInput}
                onChange={e => setBusquedaInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
          <select
            value={filtroStatus}
            onChange={e => { setFiltroStatus(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="approved">Aprobado</option>
            <option value="pending">Pendiente</option>
            <option value="rejected">Rechazado</option>
            <option value="in_process">En proceso</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <select
            value={filtroTipo}
            onChange={e => { setFiltroTipo(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los tipos</option>
            <option value="unico">Pago único</option>
            <option value="suscripcion">Suscripción</option>
            <option value="reembolso">Reembolso</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchPagos} className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Cargando pagos...</span>
          </div>
        ) : pagos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No se encontraron pagos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ID Pago MP</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Método</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map(pago => {
                  const badge = STATUS_BADGE[pago.mp_status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: pago.mp_status }
                  return (
                    <tr
                      key={pago.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => { e.preventDefault(); openDetalle(pago.id) }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{pago.mp_payment_id || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{pago.numero_pedido || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-xs">{pago.cliente_nombre || '-'}</div>
                        <div className="text-xs text-gray-500">{pago.cliente_email}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatMoney(pago.monto_total)}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600 capitalize">
                        {pago.mp_payment_method || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(pago.fecha_registro)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); e.preventDefault(); openDetalle(pago.id) }}
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
              {totalCount} pagos &middot; Página {page} de {totalPages}
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

      {/* Modal Detalle Pago */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setDetalle(null) } }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Header modal - sticky para que la X siempre sea visible */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {detalle ? `Pago ${detalle.mp_payment_id || detalle.id.slice(0, 8)}` : 'Cargando...'}
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
                {/* Estado */}
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    STATUS_BADGE[detalle.mp_status]?.bg || 'bg-gray-100'
                  } ${STATUS_BADGE[detalle.mp_status]?.text || 'text-gray-700'}`}>
                    {STATUS_BADGE[detalle.mp_status]?.label || detalle.mp_status}
                  </span>
                  {detalle.mp_status_detail && (
                    <span className="text-sm text-gray-500">{detalle.mp_status_detail}</span>
                  )}
                  <span className="ml-auto text-2xl font-bold text-gray-900">{formatMoney(detalle.monto_total)}</span>
                </div>

                {/* Datos del pago */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">ID Pago MP</span>
                    <p className="font-mono text-sm">{detalle.mp_payment_id || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Método</span>
                    <p className="font-medium text-sm capitalize">{detalle.mp_payment_method || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Tipo</span>
                    <p className="font-medium text-sm capitalize">{detalle.mp_payment_type || '-'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Tipo de pago</span>
                    <p className="font-medium text-sm capitalize">{detalle.tipo_pago}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Origen</span>
                    <p className="font-medium text-sm">{detalle.origen}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Moneda</span>
                    <p className="font-medium text-sm">{detalle.moneda}</p>
                  </div>
                </div>

                {/* Montos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto total</span>
                      <span className="font-bold">{formatMoney(detalle.monto_total)}</span>
                    </div>
                    {detalle.monto_neto != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monto neto</span>
                        <span>{formatMoney(detalle.monto_neto)}</span>
                      </div>
                    )}
                    {detalle.comision_mp != null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión MercadoPago</span>
                        <span className="text-red-600">-{formatMoney(detalle.comision_mp)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pedido y cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detalle.numero_pedido && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Pedido</h4>
                      <p className="font-mono text-sm font-medium">{detalle.numero_pedido}</p>
                      {detalle.pedido_estado && (
                        <span className="text-xs text-gray-500">Estado: {detalle.pedido_estado}</span>
                      )}
                      {detalle.pedido_total != null && (
                        <p className="text-sm mt-1">Total pedido: {formatMoney(detalle.pedido_total)}</p>
                      )}
                    </div>
                  )}
                  {detalle.cliente_email && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h4>
                      <p className="font-medium text-sm">{detalle.cliente_nombre || '-'}</p>
                      <p className="text-xs text-gray-500">{detalle.cliente_email}</p>
                      {detalle.cliente_telefono && (
                        <p className="text-xs text-gray-500">{detalle.cliente_telefono}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Fecha de pago:</span>
                    <span className="ml-2 font-medium">{formatDate(detalle.fecha_pago)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha registro:</span>
                    <span className="ml-2 font-medium">{formatDate(detalle.fecha_registro)}</span>
                  </div>
                </div>

                {/* Webhook data */}
                {detalle.webhook_raw && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Datos webhook (raw)</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-64">
                      {JSON.stringify(detalle.webhook_raw, null, 2)}
                    </pre>
                  </div>
                )}
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
