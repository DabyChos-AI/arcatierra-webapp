'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Package, TrendingUp, DollarSign, Clock, RefreshCw,
  Search, ChevronLeft, ChevronRight, X, Truck, Store,
  AlertTriangle, Eye, Ticket
} from 'lucide-react'
import { formatFechaHoraMexico, formatFechaMexico } from '@/lib/dates'
import { textoPersonas } from '@/types/compra-experiencias'
import { textoDireccion } from '@/types/datos-cliente'
import {
  aNumero,
  ESTADO_PAGADO_SIN_STOCK,
  ETIQUETA_PAGADO_SIN_STOCK,
  TEXTO_PAGADO_SIN_STOCK,
  type StockFaltante,
} from '@/types/tienda'
import {
  TEXTO_CONFIRMAR_REEMBOLSO,
  TEXTO_MARCAR_REEMBOLSADO,
  type AlertaPedido,
  type AvisosPagoPedido,
  type CausaCancelacion,
} from '@/types/reembolsos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { confirmar } from '@/components/ui/Avisos'
import {
  AlertaPedidoChip,
  AvisosPagoDetalle,
  PagosPedido,
  pedirReembolso,
  ResultadoReembolsoAviso,
  type PagoPedido,
  type ResultadoReembolsoVista,
} from './components/ReembolsosPedido'

/** Pedido de solo experiencias (Fase 4a, C3): sin envío ni fecha de entrega. */
const TIPO_ENTREGA_EXPERIENCIA = 'experiencia'

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
  /** R2 (STK4): lo que no se pudo descontar al llegar el pago; null si no faltó nada. */
  stock_faltante?: StockFaltante[] | null
  /** R5 (DR16 / contracargo): alerta de dinero en la lista; null o ausente = ninguna. */
  alerta?: AlertaPedido
}

/** Renglones válidos de `stock_faltante` (lista o null; si un JSONB llegara como texto, se lee igual). */
function faltanteDe(p: { stock_faltante?: unknown } | null | undefined): StockFaltante[] {
  let lista: unknown = p?.stock_faltante
  if (typeof lista === 'string') {
    try {
      lista = JSON.parse(lista)
    } catch {
      lista = null
    }
  }
  return Array.isArray(lista) ? lista.filter((f): f is StockFaltante => !!f && typeof f === 'object') : []
}

/** Cantidades de producto: enteras sin decimales; fraccionarias (granel viejo) con dos. */
function cantidadLegible(valor: unknown): string {
  const n = aNumero(valor)
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

/** R5 (C4): `stock_devuelto` del PATCH de estado → «Volvieron N unidades al stock.» (null si no volvió nada). */
function textoDeStockDevuelto(valor: unknown): string | null {
  const n = aNumero(valor)
  if (!(n > 0)) return null
  return n === 1 ? 'Volvió 1 unidad al stock.' : `Volvieron ${cantidadLegible(n)} unidades al stock.`
}

/**
 * PED1 (R1): una línea de `experiencias` del detalle (`GET /api/admin/pedidos/{id}`, C10 de la Fase 4a):
 * las fechas compradas en la página, de `pedidos.contenido_carrito.experiencias`
 * (`_contenido_experiencia` de routers/payments.py). Todo opcional: el checkout viejo
 * (routers/checkout.py) guardaba otra forma, sin evento_id ni fecha.
 */
interface ExperienciaPedido {
  evento_id?: string
  experiencia_id?: string
  nombre?: string
  fecha?: string // AAAA-MM-DD
  hora_inicio?: string // HH:MM
  hora_fin?: string | null
  punto_encuentro?: string | null
  adultos?: number
  ninos?: number
  cantidad?: number
  precio_adulto?: number
  precio_nino?: number
  precio?: number
  subtotal?: number
  comprador?: { alergias?: string | null } | null
}

/** Personas de una línea: con adultos/niños («3 personas (2 adultos, 1 niño)») o solo la cantidad. */
function personasDeLinea(e: ExperienciaPedido): string {
  if (typeof e.adultos === 'number' || typeof e.ninos === 'number') {
    return textoPersonas(Number(e.adultos ?? 0), Number(e.ninos ?? 0))
  }
  const n = Number(e.cantidad ?? 0)
  return `${n} ${n === 1 ? 'persona' : 'personas'}`
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
  /** PED1: la API siempre la manda (lista vacía si el pedido no tiene experiencias). */
  experiencias?: ExperienciaPedido[]
  /** R5: cada pago con `mp_status_detail` y `reembolso` (opcionales: una API vieja no los manda). */
  pagos: PagoPedido[]
  /** R5 (RE1): tiene el permiso `reembolsos`. false = sin botón «Reembolsar»; ausente = el backend decide (403). */
  puede_reembolsar?: boolean
  /** R5 (DR15/DR16): pago doble, contracargo y reembolso parcial, con sus frases. */
  avisos?: AvisosPagoPedido | null
  direccion_principal: DireccionCliente | null
  /** PEDD1 (R7): la dirección guardada a la que apunta el pedido (`pedidos.direccion_id`); null si no tiene. Ausente = API vieja. */
  direccion_pedido?: DireccionCliente | null
  /** PED5 (R7): una línea por cambio de estado con nota: «[dd/mm/aaaa hh:mm Nombre] estado: nota». null = ninguna. */
  notas_internas?: string | null
}

/** Mismas llaves en `direccion_principal` y `direccion_pedido` (admin_pedidos.py). */
interface DireccionCliente {
  nombre_direccion: string | null
  calle: string
  numero_exterior: string
  numero_interior: string | null
  colonia: string
  codigo_postal: string
  ciudad: string | null
  estado: string | null
  referencias?: string | null
}

/** PED5 (R7): tope de la nota del cambio de estado (el backend responde 400 si pasa). */
const MAX_NOTA_ESTADO = 500

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
  // R2 (STK4): llegó el pago sin stock — alguien tiene que resolverlo (cambio o reembolso)
  [ESTADO_PAGADO_SIN_STOCK]: { bg: 'bg-orange-600', text: 'text-white' },
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
  [ESTADO_PAGADO_SIN_STOCK]: ETIQUETA_PAGADO_SIN_STOCK,
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  empacado: 'Empacado',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

const FILTRO_ESTADOS = [
  'todos', 'esperando_pago', 'pendiente', 'pagado', ESTADO_PAGADO_SIN_STOCK, 'confirmado',
  'preparando', 'empacado', 'en_ruta', 'entregado', 'cancelado', 'reembolsado'
]

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  esperando_pago: ['pagado', 'cancelado'],
  pendiente: ['pagado', 'confirmado', 'cancelado'],
  pagado: ['confirmado', 'preparando', 'cancelado', 'reembolsado'],
  // R2 (STK4): se resuelve a mano; el backend valida (admin_pedidos.TRANSICIONES_VALIDAS) y no ajusta stock solo
  [ESTADO_PAGADO_SIN_STOCK]: ['pagado', 'cancelado', 'reembolsado'],
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
  // PED5 (R7): «Nota (opcional)» del cambio de estado; se manda como `notas` y queda en `notas_internas`
  const [notaEstado, setNotaEstado] = useState('')
  // C10: al cancelar/reembolsar un pedido con experiencias, el back dice qué lugares liberó y si hay reembolso.
  // El modal se cierra al guardar, así que el aviso queda en la página hasta que lo cierren.
  // R2 (C8): pasar a «pagado» un pedido sin descontar descuenta stock; si no alcanza, el estado FINAL es
  // pagado_sin_stock y llega `aviso_stock` (se muestra aparte, en `pedido-aviso-stock`).
  // R5 (C4): cancelar/reembolsar un pedido con stock descontado lo devuelve; `stock_devuelto` > 0 se dice en el aviso.
  const [avisoEstado, setAvisoEstado] = useState<{
    numero: string
    texto: string | null
    textoStock: string | null
    textoStockDevuelto: string | null
  } | null>(null)
  // R5: error del cambio de estado (403 de «reembolsado» sin permiso, transición inválida…) dentro del modal
  const [errorEstado, setErrorEstado] = useState<string | null>(null)
  // R5 (REEM1): «La cancela Arca Tierra» → causa 'arca_tierra' (reembolso del 100 % aunque falten menos de 48 h)
  const [causaArcaTierra, setCausaArcaTierra] = useState(false)
  // R5 (RE1): pago que se está reembolsando (deshabilita los botones) y el resultado que se muestra
  const [reembolsando, setReembolsando] = useState<string | null>(null)
  const [resultadoReembolso, setResultadoReembolso] = useState<ResultadoReembolsoVista | null>(null)
  // Candado síncrono contra el doble clic (el `disabled` llega hasta el siguiente render)
  const reembolsoEnCursoRef = useRef(false)
  // Pedido abierto en el modal: una respuesta que llega tarde no pisa el detalle de otro pedido
  const detalleIdRef = useRef<string | null>(null)

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
    detalleIdRef.current = pedidoId
    setErrorEstado(null)
    setCausaArcaTierra(false)
    try {
      setLoadingDetalle(true)
      setModalOpen(true)
      const res = await fetch(`/api/admin/pedidos/${pedidoId}`)
      if (!res.ok) throw new Error('Error cargando detalle')
      const data = await res.json()
      if (detalleIdRef.current !== pedidoId) return
      setDetalle(data)
      setNuevoEstado('')
      setNotaEstado('')
    } catch {
      if (detalleIdRef.current === pedidoId) setDetalle(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const cerrarModal = () => {
    detalleIdRef.current = null
    setModalOpen(false)
    setDetalle(null)
    setErrorEstado(null)
    setCausaArcaTierra(false)
    setNotaEstado('')
  }

  /** Relee el detalle SIN el spinner (no desmonta el modal ni pierde el scroll). Si falla, se queda el que había. */
  const recargarDetalle = async (pedidoId: string) => {
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}`)
      if (!res.ok) return
      const data = await res.json()
      if (detalleIdRef.current !== pedidoId) return
      setDetalle(data)
      setNuevoEstado('')
      setCausaArcaTierra(false)
      setNotaEstado('')
    } catch {}
  }

  /** RE1: devuelve un pago con MercadoPago (dinero real). Confirmación, un solo envío, resultado tal cual y recarga. */
  const reembolsar = async (pago: PagoPedido) => {
    if (!detalle || reembolsoEnCursoRef.current) return
    // K1 (R8): el candado va ANTES del diálogo (que es asíncrono) y se suelta si la persona cancela (T218c: un solo POST)
    reembolsoEnCursoRef.current = true
    const monto = formatMoney(Number(pago.monto_total) || 0)
    const ok = await confirmar({
      titulo: 'Reembolsar pago',
      mensaje: TEXTO_CONFIRMAR_REEMBOLSO(monto),
      textoAceptar: 'Reembolsar',
      peligro: true,
    })
    if (!ok) {
      reembolsoEnCursoRef.current = false
      return
    }
    const pedidoId = detalle.id
    const numero = detalle.numero_pedido
    setReembolsando(pago.id)
    setResultadoReembolso(null)
    try {
      const resultado = await pedirReembolso(pago.id)
      setResultadoReembolso({ ...resultado, pedidoId, numero })
      await recargarDetalle(pedidoId)
      fetchPedidos()
      fetchStats()
    } finally {
      reembolsoEnCursoRef.current = false
      setReembolsando(null)
    }
  }

  const cambiarEstado = async () => {
    if (!detalle || !nuevoEstado) return
    try {
      setCambiandoEstado(true)
      setAvisoEstado(null)
      setErrorEstado(null)
      // REEM1: `causa` solo si marcaron la casilla (y la casilla solo existe para cancelar/reembolsar con experiencias)
      const payload: { estado: string; causa?: CausaCancelacion; notas?: string } = { estado: nuevoEstado }
      if (muestraCausa && causaArcaTierra) payload.causa = 'arca_tierra'
      // PED5 (R7): la nota solo si escribieron algo (el backend agrega una línea a `notas_internas`)
      const nota = notaEstado.trim()
      if (nota) payload.notas = nota
      const res = await fetch(`/api/admin/pedidos/${detalle.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err: unknown = await res.json().catch(() => null)
        setErrorEstado(extraerMensajeError(err, res.status))
        return
      }
      const data: { aviso?: unknown; aviso_stock?: unknown; estado_nuevo?: unknown; stock_devuelto?: unknown } | null =
        await res.json().catch(() => null)
      const texto = data && typeof data.aviso === 'string' && data.aviso.trim() ? data.aviso : null
      let textoStock = data && typeof data.aviso_stock === 'string' && data.aviso_stock.trim() ? data.aviso_stock : null
      if (!textoStock && data?.estado_nuevo === ESTADO_PAGADO_SIN_STOCK && nuevoEstado !== ESTADO_PAGADO_SIN_STOCK) {
        // Pediste «pagado» y quedó sin stock: aunque el back no mande el texto, se dice
        textoStock = `quedó como «${ETIQUETA_PAGADO_SIN_STOCK}». ${TEXTO_PAGADO_SIN_STOCK}`
      }
      const textoStockDevuelto = textoDeStockDevuelto(data?.stock_devuelto)
      if (texto || textoStock || textoStockDevuelto) {
        setAvisoEstado({ numero: detalle.numero_pedido, texto, textoStock, textoStockDevuelto })
      }
      // Refresh
      cerrarModal()
      fetchPedidos()
      fetchStats()
    } catch {
      setErrorEstado('Error de red al cambiar el estado: no hubo respuesta del servidor. Revisa el pedido y vuelve a intentarlo.')
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

  // PED1 (R1): lo que se compró, productos (pedido_items) y fechas de experiencia (`experiencias`)
  const productosDetalle = detalle?.items ?? []
  // R2 (STK4): pagado sin stock — el texto de qué hacer y lo que faltó (producto, pedido, disponible al pagar)
  const faltanteDetalle = faltanteDe(detalle)
  const sinStockDetalle = detalle?.estado === ESTADO_PAGADO_SIN_STOCK
  const experienciasDetalle: ExperienciaPedido[] = Array.isArray(detalle?.experiencias)
    ? detalle.experiencias.filter((e): e is ExperienciaPedido => !!e && typeof e === 'object')
    : []
  // R5 (REEM1): la casilla de la causa, solo al cancelar/reembolsar un pedido con experiencias
  const muestraCausa =
    experienciasDetalle.length > 0 && (nuevoEstado === 'cancelado' || nuevoEstado === 'reembolsado')
  // R5 (RE1): el resultado va dentro del modal si está abierto ese pedido; si no, en la página (nunca los dos)
  const resultadoEnModal =
    !!resultadoReembolso && modalOpen && !!detalle && detalle.id === resultadoReembolso.pedidoId

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
                type="button"
                data-testid={`filtro-estado-${e}`}
                aria-pressed={filtroEstado === e}
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
          {/* Búsqueda. R5 (C6): a 390 el input se encoge (min-w-0) y la fila puede bajar de renglón: con el «×» de
              una búsqueda activa medía 422 px y ensanchaba la página (y el modal fixed del detalle). */}
          <form onSubmit={handleBusqueda} className="flex flex-wrap gap-2 w-full lg:w-auto">
            <div className="relative flex-1 min-w-0 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar pedido o cliente..."
                aria-label="Buscar pedido o cliente"
                value={busquedaInput}
                onChange={e => setBusquedaInput(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 shrink-0">
              Buscar
            </button>
            {busqueda && (
              <button
                type="button"
                onClick={() => { setBusquedaInput(''); setBusqueda(''); setPage(1) }}
                aria-label="Limpiar búsqueda"
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 shrink-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* C10: lugares liberados y reembolso al cancelar/reembolsar un pedido con experiencias */}
      {avisoEstado && (
        <div
          data-testid="pedido-aviso"
          role="status"
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3"
        >
          <Ticket className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 space-y-1 text-sm text-amber-900">
            {avisoEstado.texto && (
              <p>
                <span className="font-semibold">Pedido {avisoEstado.numero}: </span>
                {avisoEstado.texto}
              </p>
            )}
            {avisoEstado.textoStock && (
              <p data-testid="pedido-aviso-stock" className="flex items-start gap-1.5 text-orange-900">
                <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Pedido {avisoEstado.numero}: </span>
                  {avisoEstado.textoStock}
                </span>
              </p>
            )}
            {avisoEstado.textoStockDevuelto && (
              <p data-testid="pedido-aviso-stock-devuelto">
                <span className="font-semibold">Pedido {avisoEstado.numero}: </span>
                {avisoEstado.textoStockDevuelto}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAvisoEstado(null)}
            aria-label="Cerrar aviso"
            className="p-1 rounded hover:bg-amber-100 shrink-0"
          >
            <X className="h-4 w-4 text-amber-700" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* R5 (RE1): resultado de un reembolso cuyo modal ya se cerró */}
      {resultadoReembolso && !resultadoEnModal && (
        <ResultadoReembolsoAviso resultado={resultadoReembolso} onCerrar={() => setResultadoReembolso(null)} />
      )}

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
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            data-testid="pedido-estado"
                            data-estado={pedido.estado}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badge.bg} ${badge.text}`}
                          >
                            {pedido.estado === ESTADO_PAGADO_SIN_STOCK && (
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            )}
                            {ESTADO_LABELS[pedido.estado] || pedido.estado}
                          </span>
                          {/* R5 (DR16 / contracargo) */}
                          <AlertaPedidoChip pedidoId={pedido.id} alerta={pedido.alerta} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {pedido.tipo_entrega === TIPO_ENTREGA_EXPERIENCIA ? (
                          <span className="inline-flex items-center text-xs text-emerald-700">
                            <Ticket className="h-3.5 w-3.5 mr-1" aria-hidden="true" />Experiencia
                          </span>
                        ) : pedido.tipo_entrega === 'recoger_bodega' ? (
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
                          aria-label={`Ver pedido ${pedido.numero_pedido}`}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
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
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal() }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Header modal - sticky para que la X siempre sea visible */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {detalle ? `Pedido ${detalle.numero_pedido}` : 'Cargando...'}
              </h2>
              <button
                onClick={cerrarModal}
                aria-label="Cerrar detalle del pedido"
                className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {loadingDetalle ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : detalle ? (
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Estado + Cambiar estado */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Estado actual:</span>
                    <span
                      data-testid="pedido-detalle-estado"
                      data-estado={detalle.estado}
                      className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        ESTADOS_BADGE[detalle.estado]?.bg || 'bg-gray-100'
                      } ${ESTADOS_BADGE[detalle.estado]?.text || 'text-gray-700'}`}
                    >
                      {detalle.estado === ESTADO_PAGADO_SIN_STOCK && (
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      {ESTADO_LABELS[detalle.estado] || detalle.estado}
                    </span>
                  </div>
                  {TRANSICIONES_VALIDAS[detalle.estado]?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        data-testid="pedido-cambiar-estado"
                        aria-label="Nuevo estado del pedido"
                        value={nuevoEstado}
                        onChange={e => { setNuevoEstado(e.target.value); setErrorEstado(null) }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Cambiar a...</option>
                        {TRANSICIONES_VALIDAS[detalle.estado].map(e => (
                          <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        data-testid="pedido-actualizar-estado"
                        onClick={cambiarEstado}
                        disabled={!nuevoEstado || cambiandoEstado}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {cambiandoEstado ? 'Guardando...' : 'Actualizar'}
                      </button>
                    </div>
                  )}
                </div>

                {/* PED5 (R7): nota del cambio de estado. Va en su propio renglón, NUNCA dentro del grupo
                    select + «Actualizar» (T88d hace clic en el following-sibling::button[1] del select). */}
                {TRANSICIONES_VALIDAS[detalle.estado]?.length > 0 && (
                  <div>
                    <label htmlFor="pedido-estado-nota" className="block text-sm text-gray-600 mb-1">
                      Nota (opcional)
                    </label>
                    <textarea
                      id="pedido-estado-nota"
                      data-testid="pedido-estado-nota"
                      value={notaEstado}
                      onChange={e => setNotaEstado(e.target.value)}
                      maxLength={MAX_NOTA_ESTADO}
                      rows={2}
                      aria-describedby="pedido-estado-nota-ayuda"
                      placeholder="Por qué cambia el estado (queda en las notas internas del pedido)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                    />
                    <p id="pedido-estado-nota-ayuda" className="flex justify-between gap-2 text-xs text-gray-500">
                      <span>Se guarda con tu nombre, la fecha y el estado nuevo. Solo la ve el equipo.</span>
                      <span data-testid="pedido-estado-nota-contador" className="tabular-nums shrink-0">
                        {notaEstado.length}/{MAX_NOTA_ESTADO}
                      </span>
                    </p>
                  </div>
                )}

                {/* R5: marcar «reembolsado» NO devuelve dinero (fuera del grupo select + «Actualizar», T88d) */}
                {nuevoEstado === 'reembolsado' && (
                  <p
                    data-testid="pedido-texto-marcar-reembolsado"
                    className="flex items-start gap-1.5 text-sm text-purple-900 bg-purple-50 border border-purple-200 rounded-lg p-3"
                  >
                    <AlertTriangle className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{TEXTO_MARCAR_REEMBOLSADO}</span>
                  </p>
                )}

                {/* R5 (REEM1): la causa de la cancelación de un pedido con experiencias */}
                {muestraCausa && (
                  <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      data-testid="pedido-causa-arca-tierra"
                      checked={causaArcaTierra}
                      onChange={e => setCausaArcaTierra(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span>La cancela Arca Tierra (reembolso del 100 %)</span>
                  </label>
                )}

                {errorEstado && (
                  <p
                    data-testid="pedido-estado-error"
                    role="alert"
                    className="flex items-start gap-1.5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errorEstado}</span>
                  </p>
                )}
                </div>

                {/* R5 (DR15/DR16): pago doble, contracargo o reembolso parcial */}
                <AvisosPagoDetalle avisos={detalle.avisos} />

                {/* R2 (STK4): el pago llegó sin stock. Se resuelve con «Cambiar a…» (pagado, cancelado o reembolsado);
                    nada se devuelve ni se ajusta solo. Si ya se resolvió, la tabla queda como historial. */}
                {(sinStockDetalle || faltanteDetalle.length > 0) && (
                  <div
                    data-testid="pedido-sin-stock"
                    role={sinStockDetalle ? 'alert' : undefined}
                    className={`rounded-lg border p-4 space-y-3 ${
                      sinStockDetalle ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {sinStockDetalle ? (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <p data-testid="pedido-sin-stock-texto" className="text-sm text-orange-900">
                          <span className="font-semibold">{ETIQUETA_PAGADO_SIN_STOCK}. </span>
                          {TEXTO_PAGADO_SIN_STOCK}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-700">Al llegar el pago faltó stock de:</p>
                    )}
                    {faltanteDetalle.length > 0 && (
                      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                        <table data-testid="pedido-stock-faltante" className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Producto</th>
                              <th className="text-center px-3 py-2 font-medium text-gray-600">Pedido</th>
                              <th className="text-center px-3 py-2 font-medium text-gray-600">Disponible</th>
                            </tr>
                          </thead>
                          <tbody>
                            {faltanteDetalle.map((f, i) => (
                              <tr
                                key={`${f.itemcode}-${i}`}
                                data-testid="pedido-stock-faltante-fila"
                                className="border-t border-gray-100"
                              >
                                <td className="px-3 py-2">
                                  <div className="font-medium">{f.nombre || f.itemcode}</div>
                                  {f.nombre && <div className="text-xs text-gray-500">{f.itemcode}</div>}
                                </td>
                                <td className="px-3 py-2 text-center">{cantidadLegible(f.cantidad)}</td>
                                <td className="px-3 py-2 text-center font-semibold text-orange-700">
                                  {cantidadLegible(f.disponible)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

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

                {/* Dirección (R6): primero la DEL PEDIDO (a donde se entrega); la principal del cliente
                    debajo y solo si es distinta. Antes se pintaba la principal como si fuera la del pedido. */}
                {(detalle.direccion_entrega?.trim() || detalle.direccion_principal || detalle.direccion_pedido) && (() => {
                  const delPedido = detalle.direccion_entrega?.trim() ?? ''
                  const p = detalle.direccion_principal
                  // PEDD1 (R7): la dirección guardada del pedido (`direccion_id`) va en lugar de la principal
                  const dp = detalle.direccion_pedido ?? null
                  // El mismo formato que guarda el backend en `direccion_entrega` (texto_direccion)
                  const principal = p && !dp ? textoDireccion(p) : ''
                  const comparable = (t: string) =>
                    t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
                  const mostrarPrincipal = !!principal && comparable(principal) !== comparable(delPedido)
                  return (
                    <div data-testid="pedido-direccion">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dirección de entrega</h3>
                      <p data-testid="pedido-direccion-entrega" className={delPedido ? 'text-gray-700' : 'text-gray-500 italic'}>
                        {delPedido || 'El pedido no trae dirección.'}
                      </p>
                      {dp && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500">
                            Dirección del pedido{dp.nombre_direccion?.trim() ? ` (${dp.nombre_direccion.trim()})` : ''}
                          </span>
                          <p data-testid="pedido-direccion-pedido" className="text-gray-700">{textoDireccion(dp)}</p>
                        </div>
                      )}
                      {mostrarPrincipal && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500">Dirección principal del cliente</span>
                          <p data-testid="pedido-direccion-principal" className="text-gray-700">{principal}</p>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Notas de entrega */}
                {detalle.notas_entrega && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notas de entrega</h3>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{detalle.notas_entrega}</p>
                  </div>
                )}

                {/* PED5 (R7): notas de los cambios de estado, una línea por cambio, tal cual (texto, no HTML) */}
                {(detalle.notas_internas ?? '').trim() && (
                  <div data-testid="pedido-notas-internas">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notas internas</h3>
                    <ul className="space-y-1 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      {(detalle.notas_internas ?? '')
                        .split('\n')
                        .filter(linea => linea.trim())
                        .map((linea, i) => (
                          <li
                            key={i}
                            data-testid="pedido-nota-linea"
                            className="text-sm text-gray-700 whitespace-pre-wrap break-words"
                          >
                            {linea}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* PED1 (R1): las fechas de experiencia compradas en la página. Antes solo se pintaban
                    los productos y un pedido de experiencia decía «Items (0)». */}
                {experienciasDetalle.length > 0 && (
                  <div data-testid="pedido-experiencias">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                      Experiencias ({experienciasDetalle.length})
                    </h3>
                    {/* Lista (no tabla): a 390 px cuatro columnas no caben en el modal */}
                    <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {experienciasDetalle.map((e, i) => {
                        const horas = e.hora_inicio
                          ? `${e.hora_inicio}${e.hora_fin ? `–${e.hora_fin}` : ''}`
                          : ''
                        const alergias = e.comprador?.alergias?.trim()
                        const subtotal =
                          typeof e.subtotal === 'number'
                            ? e.subtotal
                            : Number(e.precio ?? 0) * Number(e.cantidad ?? 0)
                        const precios =
                          typeof e.precio_adulto === 'number'
                            ? `${formatMoney(e.precio_adulto)} por adulto${
                                Number(e.ninos ?? 0) > 0 && typeof e.precio_nino === 'number'
                                  ? ` · ${formatMoney(e.precio_nino)} por niño`
                                  : ''
                              }`
                            : `${formatMoney(Number(e.precio ?? 0))} por persona`
                        return (
                          <li
                            key={e.evento_id ?? `${e.experiencia_id ?? 'exp'}-${i}`}
                            data-testid="pedido-experiencia"
                            className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{e.nombre || 'Experiencia'}</p>
                              {(e.fecha || horas) && (
                                <p className="text-xs text-gray-500">
                                  {e.fecha ? formatFechaMexico(e.fecha) : ''}
                                  {e.fecha && horas ? ' · ' : ''}
                                  {horas}
                                </p>
                              )}
                              {e.punto_encuentro && (
                                <p className="text-xs text-gray-500">{e.punto_encuentro}</p>
                              )}
                              <p className="mt-0.5">{personasDeLinea(e)}</p>
                              <p className="text-xs text-gray-500">{precios}</p>
                              {alergias && (
                                <p className="text-xs text-amber-700 mt-0.5">Alergias: {alergias}</p>
                              )}
                            </div>
                            <p className="font-medium whitespace-nowrap">{formatMoney(subtotal)}</p>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {/* Productos (pedido_items). Un pedido de solo experiencias no lleva esta sección. */}
                {(productosDetalle.length > 0 || experienciasDetalle.length === 0) && (
                <div data-testid="pedido-productos">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Productos ({productosDetalle.length})
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
                        {productosDetalle.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                              Sin productos
                            </td>
                          </tr>
                        ) : (
                          productosDetalle.map((item, i) => (
                            <tr key={i} className="border-t border-gray-100">
                              <td className="px-3 py-2">
                                <div className="font-medium">{item.producto_nombre || item.producto_id}</div>
                                {item.categoria && <div className="text-xs text-gray-500">{item.categoria}</div>}
                              </td>
                              <td className="px-3 py-2 text-center">{item.cantidad}</td>
                              <td className="px-3 py-2 text-right">{formatMoney(item.precio_unitario_al_momento)}</td>
                              <td className="px-3 py-2 text-right font-medium">{formatMoney(item.subtotal)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

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
                    {/* R5 (RE1): «Reembolsar» por pago aprobado de MercadoPago (solo con el permiso `reembolsos`) */}
                    <PagosPedido
                      pagos={detalle.pagos}
                      puedeReembolsar={detalle.puede_reembolsar}
                      reembolsando={reembolsando}
                      onReembolsar={reembolsar}
                      formatMoney={formatMoney}
                    />
                  </div>
                )}

                {/* R5 (RE1): resultado del reembolso de este pedido, junto al botón (la recarga no cierra el modal) */}
                {resultadoReembolso && resultadoEnModal && (
                  <ResultadoReembolsoAviso resultado={resultadoReembolso} onCerrar={() => setResultadoReembolso(null)} />
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo de entrega:</span>
                    <span className="ml-2 font-medium">
                      {detalle.tipo_entrega === TIPO_ENTREGA_EXPERIENCIA
                        ? 'Experiencia (sin envío)'
                        : detalle.tipo_entrega === 'recoger_bodega'
                          ? 'Recoger en bodega'
                          : 'Envío a domicilio'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Método de pago:</span>
                    <span className="ml-2 font-medium">{detalle.metodo_pago || '-'}</span>
                  </div>
                  {detalle.fecha_entrega && (
                    <div>
                      <span className="text-gray-500">Fecha entrega:</span>
                      {/* PEDF1 (R7): es una fecha (date), sin hora: formatDate le agregaba una hora («12:00 a.m.») que no existe */}
                      <span data-testid="pedido-fecha-entrega" className="ml-2 font-medium">
                        {formatFechaMexico(detalle.fecha_entrega)}
                      </span>
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
