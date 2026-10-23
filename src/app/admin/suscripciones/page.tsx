'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Package, DollarSign, Calendar, RefreshCw,
  Search, Eye, X, Pause, XCircle,
  ChevronLeft, ChevronRight, AlertTriangle, Repeat, CreditCard
} from 'lucide-react'
import { formatFechaMexico, formatFechaHoraMexico } from '@/lib/dates'
import { aviso, confirmar } from '@/components/ui/Avisos'

// R11b · SUB6 + SUB7 (decisión de David, 22-oct; contrato §4.8):
// - SUB6 «B»: ya no se pausa, reanuda ni reactiva. El panel hace lo mismo que el cliente: solo «Cancelar» (también en
//   MercadoPago: se detiene el cobro y las canastas futuras). `PUT …/estado` solo acepta `cancelada` (400 con otro, 409 si ya
//   estaba cancelada): el `detail` se muestra tal cual dentro del modal, que no se cierra.
// - SUB7: si MercadoPago rechaza el cobro de un periodo, la fila trae `cobro_fallido_desde` (y `cobro_fallido_detalle`, el
//   `status_detail` de MP) y las canastas se retienen hasta que el cobro se apruebe: insignia «Cobro rechazado desde <fecha>».
// - La campana (`cobro_fallido`) abre `?suscripcion_id=<id>`: `LectorSuscripcionId` (dentro de <Suspense>, como Pedidos) abre
//   ese detalle y limpia la URL.

// ─── Types ───────────────────────────────────────────────

interface SuscripcionUsuario {
  id: string | null
  nombre: string | null
  email: string | null
  telefono: string | null
}

interface Suscripcion {
  id: string
  nombre_suscripcion: string | null
  tipo_canasta: string | null
  frecuencia: string | null
  estado: string
  precio_base: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  dia_entrega: string | null
  direccion_entrega: string | null
  mp_status: string | null
  mp_preapproval_id: string | null
  tipo_entrega: string | null
  costo_envio: number | null
  fecha_creacion: string | null
  fecha_actualizacion: string | null
  usuario: SuscripcionUsuario
  /** SUB7 (R11b): ISO del primer cobro rechazado del episodio; null/ausente = al corriente. */
  cobro_fallido_desde?: string | null
  /** SUB7: `status_detail` de MercadoPago del último rechazo (p. ej. «cc_rejected_insufficient_amount»). */
  cobro_fallido_detalle?: string | null
}

interface SuscripcionDetalle extends Suscripcion {
  preferencias: string | null
  exclusiones: string | null
  notas: string | null
  mp_next_payment_date: string | null
  mp_last_payment_date: string | null
  ultimas_entregas: EntregaItem[]
  total_entregas: number
}

interface EntregaItem {
  id: string
  fecha_entrega: string | null
  estado: string
  tipo_canasta: string | null
  precio_total: number | null
  notas: string | null
  fecha_creacion: string | null
}

interface Metricas {
  total_activas: number
  total_pausadas: number
  total_canceladas: number
  mrr: number
  por_tipo_canasta: Record<string, number>
  proximas_entregas_7dias: number
  pagos_fallidos: number
}

// ─── Constants ───────────────────────────────────────────

const ESTADO_BADGE: Record<string, { bg: string; text: string }> = {
  activa: { bg: 'bg-green-100', text: 'text-green-700' },
  pausada: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-700' },
}

const ESTADO_LABELS: Record<string, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

const MP_STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  authorized: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
}

type TabKey = 'datos' | 'entregas' | 'acciones'

/** SUB6 (§4.8): el texto del diálogo de «Cancelar», el mismo que ve el cliente. */
const TEXTO_CANCELAR_SUSCRIPCION =
  'Se cancela también en MercadoPago: se detiene el cobro y las canastas futuras. Para volver, el cliente se suscribe de nuevo.'

/** SUB7: el `status_detail` de MercadoPago en palabras (los de `checkout/failure` y los que MP manda en cobros recurrentes). */
const MOTIVO_RECHAZO: Record<string, string> = {
  cc_rejected_insufficient_amount: 'Fondos insuficientes en la tarjeta',
  cc_rejected_card_disabled: 'Tarjeta deshabilitada',
  cc_rejected_call_for_authorize: 'El banco pide que el titular autorice el pago',
  cc_rejected_high_risk: 'Rechazado por seguridad del banco o de MercadoPago',
  cc_rejected_blacklist: 'Tarjeta bloqueada para pagos en línea',
  cc_rejected_max_attempts: 'Se superó el límite de intentos',
  cc_rejected_duplicated_payment: 'Pago duplicado',
  cc_rejected_duplicate_payment: 'Pago duplicado',
  cc_rejected_bad_filled_card_number: 'Número de tarjeta incorrecto',
  cc_rejected_bad_filled_date: 'Tarjeta vencida o fecha incorrecta',
  cc_rejected_bad_filled_security_code: 'Código de seguridad incorrecto',
  cc_rejected_bad_filled_other: 'Datos de la tarjeta incorrectos',
  cc_rejected_card_error: 'La tarjeta no se pudo procesar',
  cc_rejected_other_reason: 'El banco rechazó el pago',
}

function motivoRechazo(detalle: string | null | undefined): string | null {
  const d = (detalle ?? '').trim()
  if (!d) return null
  return MOTIVO_RECHAZO[d] ?? `Motivo de MercadoPago: ${d}`
}

/**
 * R11b: `?suscripcion_id=<uuid>` (lo abre la campana con el aviso `cobro_fallido`). Es el ÚNICO que llama
 * `useSearchParams()` y va dentro de `<Suspense>`; leído el parámetro, limpia la URL (recargar no reabre el modal).
 */
function LectorSuscripcionId({ onSuscripcion }: { onSuscripcion: (id: string) => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = (searchParams.get('suscripcion_id') ?? '').trim()
  useEffect(() => {
    if (!id) return
    onSuscripcion(id)
    router.replace('/admin/suscripciones', { scroll: false })
  }, [id, onSuscripcion, router])
  return null
}

// ─── Component ───────────────────────────────────────────

export default function AdminSuscripcionesPage() {
  // List state
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [detalle, setDetalle] = useState<SuscripcionDetalle | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('datos')

  // Entregas paginadas en modal
  const [entregasPage, setEntregasPage] = useState(1)
  const [entregasTotalPages, setEntregasTotalPages] = useState(1)
  const [entregas, setEntregas] = useState<EntregaItem[]>([])
  const [loadingEntregas, setLoadingEntregas] = useState(false)

  // Acciones (SUB6: solo cancelar). Candado ANTES del await de `confirmar` (s48); el error se queda en el modal.
  const [accionLoading, setAccionLoading] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const accionEnCursoRef = useRef(false)
  const detalleIdRef = useRef<string | null>(null)

  // ─── Fetchers ────────────────────────────────────────

  const fetchMetricas = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/suscripciones/metricas')
      if (res.ok) setMetricas(await res.json())
    } catch { /* silently fail */ }
  }, [])

  const fetchSuscripciones = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado)
      if (filtroTipo !== 'todos') params.set('tipo_canasta', filtroTipo)
      if (busqueda) params.set('search', busqueda)

      const res = await fetch(`/api/admin/suscripciones?${params}`)
      if (!res.ok) throw new Error('Error cargando suscripciones')
      const data = await res.json()
      setSuscripciones(data.items)
      setTotalPages(data.pages)
      setTotalCount(data.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filtroEstado, filtroTipo, busqueda])

  useEffect(() => {
    fetchMetricas()
    fetchSuscripciones()
  }, [fetchMetricas, fetchSuscripciones])

  // ─── Detail modal ────────────────────────────────────

  const openDetalle = useCallback(async (id: string) => {
    detalleIdRef.current = id
    try {
      setLoadingDetalle(true)
      setModalOpen(true)
      setActiveTab('datos')
      setErrorAccion(null)
      const res = await fetch(`/api/admin/suscripciones/${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Error cargando detalle')
      const datos = await res.json()
      if (detalleIdRef.current === id) setDetalle(datos)
    } catch {
      if (detalleIdRef.current === id) setDetalle(null)
    } finally {
      if (detalleIdRef.current === id) setLoadingDetalle(false)
    }
  }, [])

  const closeModal = () => {
    detalleIdRef.current = null
    setModalOpen(false)
    setDetalle(null)
    setErrorAccion(null)
  }

  const abrirDesdeUrl = useCallback((id: string) => {
    void openDetalle(id)
  }, [openDetalle])

  // ─── Entregas tab ────────────────────────────────────

  const fetchEntregas = useCallback(async (suscId: string, pg: number) => {
    try {
      setLoadingEntregas(true)
      const params = new URLSearchParams({ page: String(pg), limit: '10' })
      const res = await fetch(`/api/admin/suscripciones/${suscId}/entregas?${params}`)
      if (!res.ok) throw new Error('Error cargando entregas')
      const data = await res.json()
      setEntregas(data.items)
      setEntregasTotalPages(data.pages)
    } catch {
      setEntregas([])
    } finally {
      setLoadingEntregas(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'entregas' && detalle) {
      fetchEntregas(detalle.id, entregasPage)
    }
  }, [activeTab, detalle, entregasPage, fetchEntregas])

  // Reset entregas pagination when opening a new detail
  useEffect(() => {
    setEntregasPage(1)
  }, [detalle?.id])

  // ─── Actions ─────────────────────────────────────────

  const cancelarSuscripcion = async () => {
    if (!detalle || accionEnCursoRef.current) return
    accionEnCursoRef.current = true
    setAccionLoading(true)
    setErrorAccion(null)
    try {
      const ok = await confirmar({
        titulo: 'Cancelar suscripción',
        mensaje: TEXTO_CANCELAR_SUSCRIPCION,
        textoAceptar: 'Sí, cancelar suscripción', // no repite el nombre del botón de la pestaña (s48)
        textoCancelar: 'Volver',
        peligro: true,
      })
      if (!ok) return
      const res = await fetch(`/api/admin/suscripciones/${encodeURIComponent(detalle.id)}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelada' }),
      })
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => null)
        const detail = err && typeof err === 'object' ? (err as { detail?: unknown }).detail : null
        setErrorAccion(typeof detail === 'string' && detail.trim() ? detail : `No se pudo cancelar (error ${res.status}).`)
        return
      }
      aviso.exito('Suscripción cancelada.')
      closeModal()
      fetchSuscripciones()
      fetchMetricas()
    } catch {
      setErrorAccion('No se pudo cancelar: revisa tu conexión e intenta de nuevo.')
    } finally {
      accionEnCursoRef.current = false
      setAccionLoading(false)
    }
  }

  // ─── Helpers ─────────────────────────────────────────

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setBusqueda(busquedaInput)
  }

  const formatMoney = (amount: number | null) => {
    return `$${(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string | null) => {
    return formatFechaMexico(dateStr)
  }

  const formatDateTime = (dateStr: string | null) => {
    return formatFechaHoraMexico(dateStr)
  }

  // Dynamic tipo_canasta values from metrics
  const tiposCanasta = metricas ? Object.keys(metricas.por_tipo_canasta) : []

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suscripciones</h1>
          <p className="text-gray-600 mt-1">Gestiona las suscripciones de canastas</p>
        </div>
        <button
          onClick={() => { fetchSuscripciones(); fetchMetricas() }}
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
            { title: 'Activas', value: metricas.total_activas, icon: Repeat, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Pausadas', value: metricas.total_pausadas, icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { title: 'MRR Mensual', value: formatMoney(metricas.mrr), icon: DollarSign, color: 'text-[#B15543]', bg: 'bg-orange-50' },
            { title: 'Entregas 7 dias', value: metricas.proximas_entregas_7dias, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Estado dropdown */}
          <select
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          {/* Tipo canasta dropdown */}
          <select
            value={filtroTipo}
            onChange={e => { setFiltroTipo(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
          >
            <option value="todos">Todos los tipos</option>
            {tiposCanasta.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          {/* Search */}
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

          {/* Refresh */}
          <button
            onClick={() => { fetchSuscripciones(); fetchMetricas() }}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            title="Refrescar"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchSuscripciones} className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
            Reintentar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-[#33503E]" />
            <span className="ml-2 text-gray-600">Cargando suscripciones...</span>
          </div>
        ) : suscripciones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No se encontraron suscripciones</p>
            <p className="text-sm">Intenta cambiar los filtros de busqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Suscripcion</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo Canasta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Frecuencia</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">MP Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha Inicio</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suscripciones.map(sub => {
                  const estadoBadge = ESTADO_BADGE[sub.estado] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  const mpBadge = sub.mp_status
                    ? MP_STATUS_BADGE[sub.mp_status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                    : null
                  return (
                    <tr
                      key={sub.id}
                      data-testid={`suscripcion-fila-${sub.id}`}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => openDetalle(sub.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[200px]">
                          {sub.nombre_suscripcion || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{sub.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{sub.usuario?.nombre || 'Sin nombre'}</div>
                        <div className="text-xs text-gray-500">{sub.usuario?.email || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{sub.tipo_canasta || '-'}</td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{sub.frecuencia || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatMoney(sub.precio_base)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                          {ESTADO_LABELS[sub.estado] || sub.estado}
                        </span>
                        {sub.cobro_fallido_desde && (
                          <span
                            data-testid={`suscripcion-cobro-fallido-${sub.id}`}
                            title={motivoRechazo(sub.cobro_fallido_detalle) ?? undefined}
                            className="mt-1 flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-rojo-bg px-2 py-0.5 text-xs font-medium text-rojo"
                          >
                            <CreditCard className="h-3 w-3" aria-hidden="true" />
                            Cobro rechazado desde {formatDate(sub.cobro_fallido_desde)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {mpBadge ? (
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${mpBadge.bg} ${mpBadge.text}`}>
                            {sub.mp_status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(sub.fecha_inicio)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); openDetalle(sub.id) }}
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
              {totalCount} suscripciones &middot; Pagina {page} de {totalPages}
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

      {/* ─── Detail Modal ──────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de la suscripción"
            data-testid="suscripcion-detalle"
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header - sticky */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {detalle ? (detalle.nombre_suscripcion || 'Suscripcion') : 'Cargando...'}
              </h2>
              <button onClick={closeModal} aria-label="Cerrar" data-testid="suscripcion-detalle-cerrar" className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm">
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
                    { key: 'entregas' as TabKey, label: `Entregas (${detalle.total_entregas})` },
                    { key: 'acciones' as TabKey, label: 'Acciones' },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      data-testid={`suscripcion-tab-${tab.key}`}
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
                          {ESTADO_LABELS[detalle.estado] || detalle.estado}
                        </span>
                        {detalle.mp_status && (
                          <>
                            <span className="text-sm text-gray-500 ml-4">MP:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              MP_STATUS_BADGE[detalle.mp_status]?.bg || 'bg-gray-100'
                            } ${MP_STATUS_BADGE[detalle.mp_status]?.text || 'text-gray-700'}`}>
                              {detalle.mp_status}
                            </span>
                          </>
                        )}
                      </div>

                      {/* SUB7: cobro rechazado (las canastas se retienen hasta que MercadoPago apruebe un cobro) */}
                      {detalle.cobro_fallido_desde && (
                        <div
                          data-testid="suscripcion-detalle-cobro-fallido"
                          role="status"
                          className="flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg p-4 text-sm text-rojo"
                        >
                          <CreditCard className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <div>
                            <p className="font-semibold">Cobro rechazado desde {formatDate(detalle.cobro_fallido_desde)}</p>
                            {motivoRechazo(detalle.cobro_fallido_detalle) && (
                              <p data-testid="suscripcion-detalle-cobro-motivo">{motivoRechazo(detalle.cobro_fallido_detalle)}</p>
                            )}
                            <p className="mt-1 text-gray-700">
                              Las canastas no salen hasta que MercadoPago apruebe un cobro (lo reintenta solo). Al cliente le llegó un
                              correo y lo ve en Mis suscripciones.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Suscripcion info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Suscripcion</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Nombre</span>
                            <p className="font-medium">{detalle.nombre_suscripcion || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Tipo canasta</span>
                            <p className="font-medium">{detalle.tipo_canasta || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Frecuencia</span>
                            <p className="font-medium capitalize">{detalle.frecuencia || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Precio base</span>
                            <p className="font-medium">{formatMoney(detalle.precio_base)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Dia de entrega</span>
                            <p className="font-medium capitalize">{detalle.dia_entrega || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Tipo entrega</span>
                            <p className="font-medium capitalize">{detalle.tipo_entrega || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Costo envio</span>
                            <p className="font-medium">{formatMoney(detalle.costo_envio)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Fecha inicio</span>
                            <p className="font-medium">{formatDate(detalle.fecha_inicio)}</p>
                          </div>
                          {detalle.fecha_fin && (
                            <div>
                              <span className="text-xs text-gray-500">Fecha fin</span>
                              <p className="font-medium">{formatDate(detalle.fecha_fin)}</p>
                            </div>
                          )}
                          {detalle.mp_preapproval_id && (
                            <div>
                              <span className="text-xs text-gray-500">MP Preapproval ID</span>
                              <p className="font-mono text-xs">{detalle.mp_preapproval_id}</p>
                            </div>
                          )}
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
                            <p className="font-medium">{detalle.usuario?.email || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Telefono</span>
                            <p className="font-medium">{detalle.usuario?.telefono || '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Direccion */}
                      {detalle.direccion_entrega && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Direccion de entrega</h3>
                          <p className="text-gray-700">{detalle.direccion_entrega}</p>
                        </div>
                      )}

                      {/* Preferencias y exclusiones */}
                      {(detalle.preferencias || detalle.exclusiones) && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Preferencias</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {detalle.preferencias && (
                              <div>
                                <span className="text-xs text-gray-500">Preferencias</span>
                                <p className="text-gray-700 bg-green-50 p-3 rounded-lg text-sm">{detalle.preferencias}</p>
                              </div>
                            )}
                            {detalle.exclusiones && (
                              <div>
                                <span className="text-xs text-gray-500">Exclusiones</span>
                                <p className="text-gray-700 bg-red-50 p-3 rounded-lg text-sm">{detalle.exclusiones}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Fechas MP */}
                      {(detalle.mp_next_payment_date || detalle.mp_last_payment_date) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {detalle.mp_last_payment_date && (
                            <div>
                              <span className="text-gray-500">Ultimo pago MP:</span>
                              <span className="ml-2 font-medium">{formatDateTime(detalle.mp_last_payment_date)}</span>
                            </div>
                          )}
                          {detalle.mp_next_payment_date && (
                            <div>
                              <span className="text-gray-500">Proximo pago MP:</span>
                              <span className="ml-2 font-medium">{formatDateTime(detalle.mp_next_payment_date)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Tab: Entregas ─── */}
                  {activeTab === 'entregas' && (
                    <div className="space-y-4">
                      {loadingEntregas ? (
                        <div className="flex items-center justify-center h-32">
                          <RefreshCw className="h-5 w-5 animate-spin text-[#33503E]" />
                          <span className="ml-2 text-gray-600">Cargando entregas...</span>
                        </div>
                      ) : entregas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                          <p>No hay entregas programadas</p>
                        </div>
                      ) : (
                        <>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="text-left px-3 py-2 font-medium text-gray-600">Fecha entrega</th>
                                  <th className="text-center px-3 py-2 font-medium text-gray-600">Estado</th>
                                  <th className="text-left px-3 py-2 font-medium text-gray-600">Tipo canasta</th>
                                  <th className="text-right px-3 py-2 font-medium text-gray-600">Precio</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entregas.map(entrega => {
                                  const entregaEstado = entrega.estado || 'programada'
                                  const entregaBadge: Record<string, { bg: string; text: string }> = {
                                    programada: { bg: 'bg-blue-100', text: 'text-blue-700' },
                                    entregada: { bg: 'bg-green-100', text: 'text-green-700' },
                                    cancelada: { bg: 'bg-red-100', text: 'text-red-700' },
                                    pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                                    retenida: { bg: 'bg-orange-100', text: 'text-orange-700' }, // SUB7: cobro pendiente
                                  }
                                  const badge = entregaBadge[entregaEstado] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                                  return (
                                    <tr key={entrega.id} className="border-t border-gray-100">
                                      <td className="px-3 py-2">{formatDate(entrega.fecha_entrega)}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                          {entregaEstado}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">{entrega.tipo_canasta || '-'}</td>
                                      <td className="px-3 py-2 text-right font-medium">{formatMoney(entrega.precio_total)}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                          {/* Entregas pagination */}
                          {entregasTotalPages > 1 && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Pagina {entregasPage} de {entregasTotalPages}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEntregasPage(p => Math.max(1, p - 1))}
                                  disabled={entregasPage <= 1}
                                  className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEntregasPage(p => Math.min(entregasTotalPages, p + 1))}
                                  disabled={entregasPage >= entregasTotalPages}
                                  className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ─── Tab: Acciones (SUB6: solo cancelar) ─── */}
                  {activeTab === 'acciones' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Estado actual: <span className="font-semibold">{ESTADO_LABELS[detalle.estado] || detalle.estado}</span>
                      </p>

                      {detalle.estado !== 'cancelada' ? (
                        <div className="border border-red-200 rounded-lg p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <div>
                                <p className="font-medium text-gray-900">Cancelar suscripción</p>
                                <p className="text-xs text-gray-500">{TEXTO_CANCELAR_SUSCRIPCION}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              data-testid="suscripcion-panel-cancelar"
                              onClick={() => void cancelarSuscripcion()}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              {accionLoading ? 'Cancelando…' : 'Cancelar suscripción'}
                            </button>
                          </div>
                          <p className="mt-3 text-xs text-gray-500">
                            Las suscripciones ya no se pausan ni se reactivan: el cliente puede cancelar y volver a suscribirse.
                          </p>
                          {errorAccion && (
                            <p
                              data-testid="suscripcion-panel-error"
                              role="alert"
                              className="mt-3 flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg p-3 text-sm text-rojo"
                            >
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                              {errorAccion}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                          <XCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p className="font-medium">Esta suscripción está cancelada</p>
                          <p className="text-sm">No hay acciones disponibles. Para volver, el cliente se suscribe de nuevo.</p>
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
      <Suspense fallback={null}>
        <LectorSuscripcionId onSuscripcion={abrirDesdeUrl} />
      </Suspense>
    </div>
  )
}
