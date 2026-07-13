'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, UserPlus, ShoppingCart, CreditCard, RefreshCw,
  Search, ChevronLeft, ChevronRight, X, Eye, AlertTriangle,
  Repeat, MapPin, Edit3, Shield, ShieldOff, Save, Phone, Mail,
  Plus, Trash2, Star, CheckCircle, XCircle
} from 'lucide-react'
import { formatFechaMexico, formatFechaHoraMexico } from '@/lib/dates'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('@/components/admin/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  )
})

// ─── Types ───────────────────────────────────────────

interface Cliente {
  id: string
  email: string
  nombre: string | null
  apellidos: string | null
  telefono: string | null
  estado: string
  tipo_usuario?: string
  fecha_registro: string
  ultima_conexion: string | null
  origen_registro: string | null
  total_pedidos: number
  total_gastado: number
}

interface ClienteDetalle extends Cliente {
  pedidos: {
    id: string
    numero_pedido: string
    total: number
    estado: string
    fecha_pedido: string
    tipo_entrega: string
    metodo_pago: string
  }[]
  pagos: {
    id: string
    mp_payment_id: string
    mp_status: string
    monto_total: number
    mp_payment_method: string
    tipo_pago: string
    fecha_pago: string
  }[]
  direcciones: {
    id: string
    nombre_direccion: string
    calle: string
    numero_exterior: string
    numero_interior: string
    colonia: string
    codigo_postal: string
    ciudad: string
    estado: string
    es_principal: boolean
  }[]
  suscripciones: {
    id: string
    estado: string
    tipo_canasta: string
    precio_base: number
    fecha_inicio: string
    mp_next_payment_date: string
  }[]
  estadisticas: {
    total_pedidos: number
    total_gastado: number
    primer_pedido: string | null
    ultimo_pedido: string | null
  }
}

interface DireccionCompleta {
  id: string
  nombre_direccion: string | null
  calle: string
  numero_exterior: string
  numero_interior: string | null
  colonia: string
  alcaldia: string | null
  codigo_postal: string
  ciudad: string | null
  estado: string | null
  referencias: string | null
  latitud: number | null
  longitud: number | null
  fotos: string[]
  instrucciones: Record<string, boolean>
  telefono_contacto: string | null
  telefono_contacto_2: string | null
  dia_preferido_entrega: string | null
  alergias_restricciones: string | null
  es_principal: boolean
  activa: boolean
  cobertura: {
    tiene_cobertura: boolean
    dias_disponibles: Record<string, boolean>
    costo_envio: number | null
    tiempo_minimo_dias: number | null
    municipio_zona: string | null
  }
}

interface ZonaEntregaResponse {
  cobertura: boolean
  codigo_postal: string
  colonias: string[]
  dias_disponibles: Record<string, boolean>
  municipio: string | null
  costo_envio: number | null
  tiempo_minimo_dias: number | null
}

interface DireccionFormData {
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior: string
  colonia: string
  alcaldia: string
  codigo_postal: string
  ciudad: string
  estado: string
  referencias: string
  latitud: number | null
  longitud: number | null
  telefono_contacto: string
  telefono_contacto_2: string
  dia_preferido_entrega: string
  instrucciones: Record<string, boolean>
}

interface Stats {
  total_clientes: number
  nuevos_este_mes: number
  con_pedidos: number
  con_suscripciones: number
  tasa_recompra: number
}

// ─── Constants ───────────────────────────────────────────

const ESTADO_PEDIDO_BADGE: Record<string, string> = {
  pagado: 'bg-green-100 text-green-700',
  entregado: 'bg-emerald-100 text-emerald-700',
  preparando: 'bg-amber-100 text-amber-700',
  en_ruta: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-red-100 text-red-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
}

const DIAS_SEMANA: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miercoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sabado',
  domingo: 'Domingo',
}

const INSTRUCCIONES_OPCIONES: { key: string; label: string }[] = [
  { key: 'timbrar', label: 'Timbrar' },
  { key: 'guardia', label: 'Dejar con guardia/recepcionista' },
  { key: 'llamar_antes', label: 'Llamar antes de llegar' },
]

const EMPTY_FORM: DireccionFormData = {
  nombre_direccion: '',
  calle: '',
  numero_exterior: '',
  numero_interior: '',
  colonia: '',
  alcaldia: '',
  codigo_postal: '',
  ciudad: '',
  estado: '',
  referencias: '',
  latitud: null,
  longitud: null,
  telefono_contacto: '',
  telefono_contacto_2: '',
  dia_preferido_entrega: '',
  instrucciones: { timbrar: false, guardia: false, llamar_antes: false },
}

type TabKey = 'datos' | 'historial' | 'acciones'

// ─── Component ───────────────────────────────────────────

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [orden, setOrden] = useState('fecha_registro')

  // Modal
  const [detalle, setDetalle] = useState<ClienteDetalle | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('datos')

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editApellidos, setEditApellidos] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [accionLoading, setAccionLoading] = useState(false)

  // Direcciones CRUD state
  const [direccionesCompletas, setDireccionesCompletas] = useState<DireccionCompleta[]>([])
  const [loadingDirecciones, setLoadingDirecciones] = useState(false)
  const [dirFormOpen, setDirFormOpen] = useState(false)
  const [dirEditingId, setDirEditingId] = useState<string | null>(null)
  const [dirForm, setDirForm] = useState<DireccionFormData>({ ...EMPTY_FORM })
  const [dirSaving, setDirSaving] = useState(false)
  const [cpValidation, setCpValidation] = useState<ZonaEntregaResponse | null>(null)
  const [cpValidating, setCpValidating] = useState(false)

  // ─── Fetchers ────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/clientes/stats')
      if (res.ok) setStats(await res.json())
    } catch { /* silently fail */ }
  }, [])

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: String(page), per_page: '20', orden })
      if (busqueda) params.set('busqueda', busqueda)

      const res = await fetch(`/api/admin/clientes?${params}`)
      if (!res.ok) throw new Error('Error cargando clientes')
      const data = await res.json()
      setClientes(data.items)
      setTotalPages(data.total_pages)
      setTotalCount(data.total_count)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, busqueda, orden])

  useEffect(() => {
    fetchStats()
    fetchClientes()
  }, [fetchStats, fetchClientes])

  // ─── Direcciones fetcher ───────────────────────────

  const fetchDirecciones = useCallback(async (clienteId: string) => {
    try {
      setLoadingDirecciones(true)
      const res = await fetch(`/api/admin/direcciones/cliente/${clienteId}`)
      if (res.ok) {
        const data = await res.json()
        setDireccionesCompletas(data.direcciones || [])
      }
    } catch {
      /* silently fail */
    } finally {
      setLoadingDirecciones(false)
    }
  }, [])

  // ─── CP validation ─────────────────────────────────

  const validarCP = useCallback(async (cp: string) => {
    if (cp.length !== 5) {
      setCpValidation(null)
      return
    }
    try {
      setCpValidating(true)
      const res = await fetch(`/api/zonas-entrega/validar-cp/${cp}`)
      if (res.ok) {
        const data: ZonaEntregaResponse = await res.json()
        setCpValidation(data)
        // Auto-fill colonia if only one option
        if (data.cobertura && data.colonias.length === 1) {
          setDirForm(prev => ({ ...prev, colonia: data.colonias[0] }))
        }
        // Auto-fill alcaldia/municipio
        if (data.municipio) {
          setDirForm(prev => ({ ...prev, alcaldia: data.municipio || '' }))
        }
      } else {
        setCpValidation(null)
      }
    } catch {
      setCpValidation(null)
    } finally {
      setCpValidating(false)
    }
  }, [])

  // ─── Detail modal ────────────────────────────────────

  const openDetalle = async (clienteId: string) => {
    try {
      setLoadingDetalle(true)
      setModalOpen(true)
      setActiveTab('datos')
      setEditing(false)
      setDirFormOpen(false)
      setDirEditingId(null)
      setCpValidation(null)
      const res = await fetch(`/api/admin/clientes/${clienteId}`)
      if (!res.ok) throw new Error('Error cargando detalle')
      const data = await res.json()
      setDetalle(data)
      setEditNombre(data.nombre || '')
      setEditApellidos(data.apellidos || '')
      setEditEmail(data.email || '')
      setEditTelefono(data.telefono || '')
      // Fetch complete direcciones with cobertura data
      fetchDirecciones(clienteId)
    } catch {
      setDetalle(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setDetalle(null)
    setEditing(false)
    setDirFormOpen(false)
    setDirEditingId(null)
    setCpValidation(null)
    setDireccionesCompletas([])
  }

  const refreshDetalle = async (clienteId: string) => {
    try {
      const res = await fetch(`/api/admin/clientes/${clienteId}`)
      if (res.ok) {
        const data = await res.json()
        setDetalle(data)
        setEditNombre(data.nombre || '')
        setEditApellidos(data.apellidos || '')
        setEditEmail(data.email || '')
        setEditTelefono(data.telefono || '')
      }
    } catch { /* ignore */ }
  }

  // ─── Actions ─────────────────────────────────────────

  const guardarEdicion = async () => {
    if (!detalle) return
    try {
      setAccionLoading(true)
      const res = await fetch(`/api/admin/clientes/${detalle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          apellidos: editApellidos,
          email: editEmail,
          telefono: editTelefono,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al guardar')
        return
      }
      setEditing(false)
      await refreshDetalle(detalle.id)
      fetchClientes()
    } catch {
      alert('Error de red al guardar')
    } finally {
      setAccionLoading(false)
    }
  }

  const cambiarRol = async (nuevoRol: string) => {
    if (!detalle) return
    const confirmMsg = nuevoRol === 'empleado'
      ? 'Este usuario tendra acceso al panel admin. Continuar?'
      : 'Este usuario perdera acceso al panel admin. Continuar?'
    if (!confirm(confirmMsg)) return

    try {
      setAccionLoading(true)
      const res = await fetch(`/api/admin/clientes/${detalle.id}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_usuario: nuevoRol }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al cambiar rol')
        return
      }
      await refreshDetalle(detalle.id)
      fetchClientes()
    } catch {
      alert('Error de red al cambiar rol')
    } finally {
      setAccionLoading(false)
    }
  }

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!detalle) return
    const confirmMsg = nuevoEstado === 'bloqueado'
      ? 'El usuario no podra iniciar sesion. Continuar?'
      : 'El usuario podra iniciar sesion nuevamente. Continuar?'
    if (!confirm(confirmMsg)) return

    try {
      setAccionLoading(true)
      const res = await fetch(`/api/admin/clientes/${detalle.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al cambiar estado')
        return
      }
      await refreshDetalle(detalle.id)
      fetchClientes()
    } catch {
      alert('Error de red al cambiar estado')
    } finally {
      setAccionLoading(false)
    }
  }

  // ─── Direcciones CRUD actions ──────────────────────

  const openDirForm = (dir?: DireccionCompleta) => {
    if (dir) {
      // Edit mode
      setDirEditingId(dir.id)
      setDirForm({
        nombre_direccion: dir.nombre_direccion || '',
        calle: dir.calle || '',
        numero_exterior: dir.numero_exterior || '',
        numero_interior: dir.numero_interior || '',
        colonia: dir.colonia || '',
        alcaldia: dir.alcaldia || '',
        codigo_postal: dir.codigo_postal || '',
        ciudad: dir.ciudad || '',
        estado: dir.estado || '',
        referencias: dir.referencias || '',
        latitud: dir.latitud,
        longitud: dir.longitud,
        telefono_contacto: dir.telefono_contacto || '',
        telefono_contacto_2: dir.telefono_contacto_2 || '',
        dia_preferido_entrega: dir.dia_preferido_entrega || '',
        instrucciones: {
          timbrar: dir.instrucciones?.timbrar || false,
          guardia: dir.instrucciones?.guardia || false,
          llamar_antes: dir.instrucciones?.llamar_antes || false,
        },
      })
      // Validate CP to load colonias
      if (dir.codigo_postal && dir.codigo_postal.length === 5) {
        validarCP(dir.codigo_postal)
      }
    } else {
      // Create mode
      setDirEditingId(null)
      setDirForm({ ...EMPTY_FORM, instrucciones: { timbrar: false, guardia: false, llamar_antes: false } })
      setCpValidation(null)
    }
    setDirFormOpen(true)
  }

  const closeDirForm = () => {
    setDirFormOpen(false)
    setDirEditingId(null)
    setDirForm({ ...EMPTY_FORM })
    setCpValidation(null)
  }

  const guardarDireccion = async () => {
    if (!detalle) return
    if (!dirForm.calle.trim() || !dirForm.numero_exterior.trim() || !dirForm.codigo_postal.trim() || !dirForm.colonia.trim()) {
      alert('Calle, numero exterior, codigo postal y colonia son obligatorios')
      return
    }

    try {
      setDirSaving(true)

      const body: Record<string, unknown> = {
        nombre_direccion: dirForm.nombre_direccion || null,
        calle: dirForm.calle,
        numero_exterior: dirForm.numero_exterior,
        numero_interior: dirForm.numero_interior || null,
        colonia: dirForm.colonia,
        alcaldia: dirForm.alcaldia || null,
        codigo_postal: dirForm.codigo_postal,
        ciudad: dirForm.ciudad || null,
        estado: dirForm.estado || null,
        referencias: dirForm.referencias || null,
        latitud: dirForm.latitud,
        longitud: dirForm.longitud,
        telefono_contacto: dirForm.telefono_contacto || null,
        telefono_contacto_2: dirForm.telefono_contacto_2 || null,
        dia_preferido_entrega: dirForm.dia_preferido_entrega || null,
        instrucciones: dirForm.instrucciones,
      }

      let url: string
      let method: string

      if (dirEditingId) {
        url = `/api/admin/direcciones/cliente/${detalle.id}/${dirEditingId}`
        method = 'PUT'
      } else {
        url = `/api/admin/direcciones/cliente/${detalle.id}`
        method = 'POST'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al guardar direccion')
        return
      }

      closeDirForm()
      await fetchDirecciones(detalle.id)
      await refreshDetalle(detalle.id)
    } catch {
      alert('Error de red al guardar direccion')
    } finally {
      setDirSaving(false)
    }
  }

  const eliminarDireccion = async (dirId: string) => {
    if (!detalle) return
    if (!confirm('Eliminar esta direccion? Esta accion no se puede deshacer.')) return

    try {
      const res = await fetch(`/api/admin/direcciones/cliente/${detalle.id}/${dirId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al eliminar')
        return
      }
      await fetchDirecciones(detalle.id)
      await refreshDetalle(detalle.id)
    } catch {
      alert('Error de red al eliminar')
    }
  }

  const marcarPrincipal = async (dirId: string) => {
    if (!detalle) return
    try {
      const res = await fetch(`/api/admin/direcciones/cliente/${detalle.id}/${dirId}/principal`, {
        method: 'PUT',
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || 'Error al marcar como principal')
        return
      }
      await fetchDirecciones(detalle.id)
      await refreshDetalle(detalle.id)
    } catch {
      alert('Error de red')
    }
  }

  // ─── Helpers ─────────────────────────────────────────

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setBusqueda(busquedaInput)
  }

  const formatDate = (dateStr: string | null) => formatFechaMexico(dateStr)
  const formatDateTime = (dateStr: string | null) => formatFechaHoraMexico(dateStr)

  const formatMoney = (amount: number) =>
    `$${(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleCPChange = (cp: string) => {
    // Only allow digits, max 5
    const clean = cp.replace(/\D/g, '').slice(0, 5)
    setDirForm(prev => ({ ...prev, codigo_postal: clean }))
    if (clean.length === 5) {
      validarCP(clean)
    } else {
      setCpValidation(null)
    }
  }

  const handleCoordsChange = (coords: string) => {
    if (!coords) {
      setDirForm(prev => ({ ...prev, latitud: null, longitud: null }))
      return
    }
    const parts = coords.split(',').map(c => parseFloat(c.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setDirForm(prev => ({ ...prev, latitud: parts[0], longitud: parts[1] }))
    }
  }

  const getDiasDisponibles = (): string[] => {
    if (!cpValidation?.cobertura || !cpValidation.dias_disponibles) return []
    return Object.entries(cpValidation.dias_disponibles)
      .filter(([, available]) => available)
      .map(([dia]) => dia)
  }

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Clientes</h1>
          <p className="text-gray-600 mt-1">Base de clientes y usuarios de Arcatierra</p>
        </div>
        <button
          onClick={() => { fetchClientes(); fetchStats() }}
          className="flex items-center space-x-2 px-4 py-2 bg-[#33503E] text-white rounded-lg hover:bg-[#475A52]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: 'Total clientes', value: stats.total_clientes, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Nuevos este mes', value: stats.nuevos_este_mes, icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Con pedidos', value: stats.con_pedidos, icon: ShoppingCart, color: 'text-[#B15543]', bg: 'bg-orange-50' },
            { title: 'Con suscripciones', value: stats.con_suscripciones, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
            { title: 'Tasa recompra', value: `${stats.tasa_recompra}%`, icon: Repeat, color: 'text-amber-600', bg: 'bg-amber-50' },
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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <form onSubmit={handleBusqueda} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o telefono..."
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
          <select
            value={orden}
            onChange={e => { setOrden(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
          >
            <option value="fecha_registro">Fecha registro</option>
            <option value="ultima_conexion">Ultima conexion</option>
            <option value="nombre">Nombre</option>
            <option value="total_gastado">Total gastado</option>
            <option value="total_pedidos">Total pedidos</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchClientes} className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-[#33503E]" />
            <span className="ml-2 text-gray-600">Cargando clientes...</span>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-lg font-medium">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Telefono</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Pedidos</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total gastado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Registro</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr
                    key={cliente.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openDetalle(cliente.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {[cliente.nombre, cliente.apellidos].filter(Boolean).join(' ') || 'Sin nombre'}
                      </div>
                      <div className="flex items-center gap-1">
                        {cliente.estado === 'bloqueado' && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Bloqueado</span>
                        )}
                        {cliente.origen_registro && (
                          <span className="text-xs text-gray-400">{cliente.origen_registro}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cliente.email}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.telefono || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        cliente.total_pedidos > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cliente.total_pedidos}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatMoney(cliente.total_gastado)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(cliente.fecha_registro)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openDetalle(cliente.id) }}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-[#33503E]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {totalCount} clientes &middot; Pagina {page} de {totalPages}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {detalle ? `${detalle.nombre || ''} ${detalle.apellidos || ''}`.trim() || detalle.email : 'Cargando...'}
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
                    { key: 'historial' as TabKey, label: 'Historial' },
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
                      {/* Estado badges */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                        <span className="text-sm text-gray-500">Estado:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detalle.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {detalle.estado === 'activo' ? 'Activo' : 'Bloqueado'}
                        </span>
                        <span className="text-sm text-gray-500 ml-4">Rol:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          detalle.tipo_usuario === 'empleado' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {detalle.tipo_usuario === 'empleado' ? 'Empleado' : 'Cliente'}
                        </span>
                      </div>

                      {/* Edit toggle */}
                      <div className="flex justify-end">
                        {!editing ? (
                          <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1 text-sm text-[#33503E] hover:underline"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Editar datos
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={guardarEdicion}
                              disabled={accionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50"
                            >
                              <Save className="h-3.5 w-3.5" /> {accionLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={() => {
                                setEditing(false)
                                setEditNombre(detalle.nombre || '')
                                setEditApellidos(detalle.apellidos || '')
                                setEditEmail(detalle.email || '')
                                setEditTelefono(detalle.telefono || '')
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Info personal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">Nombre</span>
                          {editing ? (
                            <input value={editNombre} onChange={e => setEditNombre(e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]" />
                          ) : (
                            <p className="font-medium">{detalle.nombre || '-'}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Apellidos</span>
                          {editing ? (
                            <input value={editApellidos} onChange={e => setEditApellidos(e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]" />
                          ) : (
                            <p className="font-medium">{detalle.apellidos || '-'}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Email</span>
                          {editing ? (
                            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]" />
                          ) : (
                            <p className="font-medium flex items-center gap-1">
                              {detalle.email}
                              <a href={`mailto:${detalle.email}`} className="text-[#33503E]"><Mail className="h-3.5 w-3.5" /></a>
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Telefono</span>
                          {editing ? (
                            <input value={editTelefono} onChange={e => setEditTelefono(e.target.value)}
                              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]" />
                          ) : (
                            <p className="font-medium flex items-center gap-1">
                              {detalle.telefono || '-'}
                              {detalle.telefono && (
                                <a href={`https://wa.me/52${detalle.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600">
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Fecha registro</span>
                          <p className="font-medium">{formatDateTime(detalle.fecha_registro)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Ultima conexion</span>
                          <p className="font-medium">{formatDateTime(detalle.ultima_conexion)}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      {detalle.estadisticas && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-green-50 rounded-lg p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-[#33503E]">{detalle.estadisticas.total_pedidos}</p>
                            <p className="text-xs text-gray-600">Total pedidos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-[#33503E]">{formatMoney(detalle.estadisticas.total_gastado)}</p>
                            <p className="text-xs text-gray-600">Total gastado</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{formatDate(detalle.estadisticas.primer_pedido)}</p>
                            <p className="text-xs text-gray-600">Primer pedido</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{formatDate(detalle.estadisticas.ultimo_pedido)}</p>
                            <p className="text-xs text-gray-600">Ultimo pedido</p>
                          </div>
                        </div>
                      )}

                      {/* ─── Direcciones CRUD ─── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center">
                            <MapPin className="h-4 w-4 mr-1" /> Direcciones ({direccionesCompletas.length})
                          </h3>
                          {!dirFormOpen && (
                            <button
                              onClick={() => openDirForm()}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#33503E] text-white rounded-lg text-xs hover:bg-[#475A52]"
                            >
                              <Plus className="h-3.5 w-3.5" /> Agregar direccion
                            </button>
                          )}
                        </div>

                        {loadingDirecciones ? (
                          <div className="flex items-center justify-center py-6">
                            <RefreshCw className="h-5 w-5 animate-spin text-[#33503E]" />
                            <span className="ml-2 text-sm text-gray-500">Cargando direcciones...</span>
                          </div>
                        ) : direccionesCompletas.length === 0 && !dirFormOpen ? (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">Sin direcciones registradas</p>
                            <button
                              onClick={() => openDirForm()}
                              className="mt-2 text-sm text-[#33503E] hover:underline"
                            >
                              Agregar primera direccion
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {direccionesCompletas.map(dir => (
                              <div
                                key={dir.id}
                                className={`border rounded-lg p-3 text-sm ${
                                  dir.es_principal ? 'border-[#33503E] bg-green-50' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-gray-900">
                                        {dir.nombre_direccion || 'Sin nombre'}
                                      </span>
                                      {dir.es_principal && (
                                        <span className="text-xs bg-[#33503E] text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                          <Star className="h-3 w-3" /> Principal
                                        </span>
                                      )}
                                      {dir.cobertura?.tiene_cobertura ? (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                          <CheckCircle className="h-3 w-3" /> Cobertura
                                        </span>
                                      ) : (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                          <XCircle className="h-3 w-3" /> Sin cobertura
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-600 mt-1">
                                      {dir.calle} {dir.numero_exterior}
                                      {dir.numero_interior ? ` Int. ${dir.numero_interior}` : ''}, {dir.colonia}, CP {dir.codigo_postal}
                                      {dir.alcaldia ? `, ${dir.alcaldia}` : ''}
                                      {dir.ciudad ? `, ${dir.ciudad}` : ''}
                                    </p>
                                    {/* Additional info */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                      {dir.telefono_contacto && (
                                        <span className="flex items-center gap-0.5">
                                          <Phone className="h-3 w-3" /> {dir.telefono_contacto}
                                        </span>
                                      )}
                                      {dir.dia_preferido_entrega && (
                                        <span>Dia preferido: {DIAS_SEMANA[dir.dia_preferido_entrega] || dir.dia_preferido_entrega}</span>
                                      )}
                                      {dir.instrucciones && Object.entries(dir.instrucciones).filter(([, v]) => v).length > 0 && (
                                        <span>
                                          Instrucciones: {Object.entries(dir.instrucciones)
                                            .filter(([, v]) => v)
                                            .map(([k]) => INSTRUCCIONES_OPCIONES.find(o => o.key === k)?.label || k)
                                            .join(', ')}
                                        </span>
                                      )}
                                    </div>
                                    {dir.referencias && (
                                      <p className="text-xs text-gray-400 mt-1">Ref: {dir.referencias}</p>
                                    )}
                                    {/* Fotos thumbnails readonly */}
                                    {dir.fotos && dir.fotos.length > 0 && (
                                      <div className="flex gap-2 mt-2">
                                        {dir.fotos.map((foto, idx) => (
                                          <a key={idx} href={foto} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded border border-gray-200 overflow-hidden">
                                            <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Action buttons */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {!dir.es_principal && (
                                      <button
                                        onClick={() => marcarPrincipal(dir.id)}
                                        title="Marcar como principal"
                                        className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-[#33503E]"
                                      >
                                        <Star className="h-4 w-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openDirForm(dir)}
                                      title="Editar"
                                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => eliminarDireccion(dir.id)}
                                      title="Eliminar"
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ─── Direccion Form (inline) ─── */}
                        {dirFormOpen && (
                          <div className="mt-4 border border-[#33503E] rounded-lg p-4 bg-green-50/30">
                            <h4 className="text-sm font-semibold text-[#33503E] mb-3">
                              {dirEditingId ? 'Editar direccion' : 'Nueva direccion'}
                            </h4>

                            <div className="space-y-3">
                              {/* Row: Nombre de direccion */}
                              <div>
                                <label className="text-xs text-gray-500">Nombre de direccion (ej: Casa, Oficina)</label>
                                <input
                                  value={dirForm.nombre_direccion}
                                  onChange={e => setDirForm(prev => ({ ...prev, nombre_direccion: e.target.value }))}
                                  placeholder="Casa"
                                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                />
                              </div>

                              {/* Row: CP + Cobertura */}
                              <div>
                                <label className="text-xs text-gray-500">Codigo Postal *</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    value={dirForm.codigo_postal}
                                    onChange={e => handleCPChange(e.target.value)}
                                    placeholder="14000"
                                    maxLength={5}
                                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                  {cpValidating && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                                  )}
                                  {cpValidation && cpValidation.cobertura && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" /> Zona con cobertura
                                    </span>
                                  )}
                                  {cpValidation && !cpValidation.cobertura && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" /> Sin cobertura en esta zona
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Row: Colonia dropdown */}
                              <div>
                                <label className="text-xs text-gray-500">Colonia *</label>
                                {cpValidation && cpValidation.cobertura && cpValidation.colonias.length > 0 ? (
                                  <select
                                    value={dirForm.colonia}
                                    onChange={e => setDirForm(prev => ({ ...prev, colonia: e.target.value }))}
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  >
                                    <option value="">Seleccionar colonia...</option>
                                    {cpValidation.colonias.map(col => (
                                      <option key={col} value={col}>{col}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    value={dirForm.colonia}
                                    onChange={e => setDirForm(prev => ({ ...prev, colonia: e.target.value }))}
                                    placeholder="Colonia"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                )}
                              </div>

                              {/* Row: Calle + Numeros */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-1">
                                  <label className="text-xs text-gray-500">Calle *</label>
                                  <input
                                    value={dirForm.calle}
                                    onChange={e => setDirForm(prev => ({ ...prev, calle: e.target.value }))}
                                    placeholder="Av. Insurgentes"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Num. Exterior *</label>
                                  <input
                                    value={dirForm.numero_exterior}
                                    onChange={e => setDirForm(prev => ({ ...prev, numero_exterior: e.target.value }))}
                                    placeholder="123"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Num. Interior</label>
                                  <input
                                    value={dirForm.numero_interior}
                                    onChange={e => setDirForm(prev => ({ ...prev, numero_interior: e.target.value }))}
                                    placeholder="4A"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                              </div>

                              {/* Row: Alcaldia + Ciudad + Estado */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs text-gray-500">Alcaldia/Municipio</label>
                                  <input
                                    value={dirForm.alcaldia}
                                    onChange={e => setDirForm(prev => ({ ...prev, alcaldia: e.target.value }))}
                                    placeholder="Tlalpan"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Ciudad</label>
                                  <input
                                    value={dirForm.ciudad}
                                    onChange={e => setDirForm(prev => ({ ...prev, ciudad: e.target.value }))}
                                    placeholder="Ciudad de Mexico"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Estado</label>
                                  <input
                                    value={dirForm.estado}
                                    onChange={e => setDirForm(prev => ({ ...prev, estado: e.target.value }))}
                                    placeholder="CDMX"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                              </div>

                              {/* Row: Telefonos */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-500">Telefono de contacto</label>
                                  <input
                                    value={dirForm.telefono_contacto}
                                    onChange={e => setDirForm(prev => ({ ...prev, telefono_contacto: e.target.value }))}
                                    placeholder="55 1234 5678"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Telefono 2 (opcional)</label>
                                  <input
                                    value={dirForm.telefono_contacto_2}
                                    onChange={e => setDirForm(prev => ({ ...prev, telefono_contacto_2: e.target.value }))}
                                    placeholder="55 8765 4321"
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  />
                                </div>
                              </div>

                              {/* Row: Dia preferido */}
                              <div>
                                <label className="text-xs text-gray-500">Dia preferido de entrega</label>
                                {cpValidation?.cobertura && getDiasDisponibles().length > 0 ? (
                                  <select
                                    value={dirForm.dia_preferido_entrega}
                                    onChange={e => setDirForm(prev => ({ ...prev, dia_preferido_entrega: e.target.value }))}
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  >
                                    <option value="">Seleccionar dia...</option>
                                    {getDiasDisponibles().map(dia => (
                                      <option key={dia} value={dia}>{DIAS_SEMANA[dia] || dia}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <select
                                    value={dirForm.dia_preferido_entrega}
                                    onChange={e => setDirForm(prev => ({ ...prev, dia_preferido_entrega: e.target.value }))}
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                                  >
                                    <option value="">Seleccionar dia...</option>
                                    {Object.entries(DIAS_SEMANA).map(([key, label]) => (
                                      <option key={key} value={key}>{label}</option>
                                    ))}
                                  </select>
                                )}
                                {cpValidation?.cobertura && cpValidation.costo_envio !== null && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Costo de envio: ${cpValidation.costo_envio} | Tiempo minimo: {cpValidation.tiempo_minimo_dias} dias
                                  </p>
                                )}
                              </div>

                              {/* Row: Instrucciones checkboxes */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Instrucciones de entrega</label>
                                <div className="flex flex-wrap gap-4">
                                  {INSTRUCCIONES_OPCIONES.map(opt => (
                                    <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={dirForm.instrucciones[opt.key] || false}
                                        onChange={e => setDirForm(prev => ({
                                          ...prev,
                                          instrucciones: { ...prev.instrucciones, [opt.key]: e.target.checked },
                                        }))}
                                        className="rounded border-gray-300 text-[#33503E] focus:ring-[#33503E]"
                                      />
                                      {opt.label}
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* Row: Referencias */}
                              <div>
                                <label className="text-xs text-gray-500">Referencias</label>
                                <textarea
                                  value={dirForm.referencias}
                                  onChange={e => setDirForm(prev => ({ ...prev, referencias: e.target.value }))}
                                  placeholder="Entre calle X y calle Y, casa color azul..."
                                  rows={2}
                                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E] resize-none"
                                />
                              </div>

                              {/* Row: MapPicker */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Ubicacion en mapa</label>
                                <MapPicker
                                  value={
                                    dirForm.latitud !== null && dirForm.longitud !== null
                                      ? `${dirForm.latitud}, ${dirForm.longitud}`
                                      : ''
                                  }
                                  onChange={handleCoordsChange}
                                  zIndex={70}
                                />
                              </div>

                              {/* Buttons */}
                              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                                <button
                                  onClick={closeDirForm}
                                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={guardarDireccion}
                                  disabled={dirSaving}
                                  className="flex items-center gap-1 px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  {dirSaving ? 'Guardando...' : 'Guardar direccion'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Tab: Historial ─── */}
                  {activeTab === 'historial' && (
                    <div className="space-y-6">
                      {/* Pedidos */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                          Pedidos recientes ({detalle.pedidos.length})
                        </h3>
                        {detalle.pedidos.length === 0 ? (
                          <p className="text-gray-400 text-sm">Sin pedidos</p>
                        ) : (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="text-left px-3 py-2 font-medium text-gray-600">Pedido</th>
                                  <th className="text-left px-3 py-2 font-medium text-gray-600">Fecha</th>
                                  <th className="text-right px-3 py-2 font-medium text-gray-600">Total</th>
                                  <th className="text-center px-3 py-2 font-medium text-gray-600">Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detalle.pedidos.map(p => (
                                  <tr key={p.id} className="border-t border-gray-100">
                                    <td className="px-3 py-2 font-mono text-xs">{p.numero_pedido}</td>
                                    <td className="px-3 py-2 text-gray-600">{formatDate(p.fecha_pedido)}</td>
                                    <td className="px-3 py-2 text-right font-medium">{formatMoney(p.total)}</td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                        ESTADO_PEDIDO_BADGE[p.estado] || 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {p.estado}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Suscripciones */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                          Suscripciones ({detalle.suscripciones.length})
                        </h3>
                        {detalle.suscripciones.length === 0 ? (
                          <p className="text-gray-400 text-sm">Sin suscripciones</p>
                        ) : (
                          <div className="space-y-2">
                            {detalle.suscripciones.map(sub => (
                              <div key={sub.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{sub.tipo_canasta || '-'}</span>
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    sub.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {sub.estado}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{formatMoney(sub.precio_base)}/mes</p>
                                  <p className="text-xs text-gray-500">Proximo cobro: {formatDate(sub.mp_next_payment_date)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pagos */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                          Pagos recientes ({detalle.pagos.length})
                        </h3>
                        {detalle.pagos.length === 0 ? (
                          <p className="text-gray-400 text-sm">Sin pagos</p>
                        ) : (
                          <div className="space-y-2">
                            {detalle.pagos.map(pago => (
                              <div key={pago.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                  <span className="font-mono text-xs text-gray-500">{pago.mp_payment_id || '-'}</span>
                                  <span className="ml-2 text-xs text-gray-400">{pago.mp_payment_method}</span>
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
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Tab: Acciones ─── */}
                  {activeTab === 'acciones' && (
                    <div className="space-y-4">
                      {/* Cambiar rol */}
                      <div className="border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-gray-900">Cambiar rol</p>
                              <p className="text-xs text-gray-500">
                                Rol actual: <span className="font-semibold">{detalle.tipo_usuario === 'empleado' ? 'Empleado' : 'Cliente'}</span>
                              </p>
                            </div>
                          </div>
                          {detalle.tipo_usuario === 'cliente' ? (
                            <button
                              onClick={() => cambiarRol('empleado')}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50"
                            >
                              {accionLoading ? 'Cambiando...' : 'Promover a empleado'}
                            </button>
                          ) : (
                            <button
                              onClick={() => cambiarRol('cliente')}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                            >
                              {accionLoading ? 'Cambiando...' : 'Cambiar a cliente'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bloquear/desbloquear */}
                      <div className={`border rounded-lg p-4 ${
                        detalle.estado === 'activo' ? 'border-red-200' : 'border-green-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {detalle.estado === 'activo' ? (
                              <ShieldOff className="h-5 w-5 text-red-600" />
                            ) : (
                              <Shield className="h-5 w-5 text-green-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {detalle.estado === 'activo' ? 'Bloquear usuario' : 'Desbloquear usuario'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {detalle.estado === 'activo'
                                  ? 'El usuario no podra iniciar sesion ni realizar compras'
                                  : 'El usuario podra iniciar sesion y realizar compras nuevamente'}
                              </p>
                            </div>
                          </div>
                          {detalle.estado === 'activo' ? (
                            <button
                              onClick={() => cambiarEstado('bloqueado')}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                            >
                              {accionLoading ? 'Bloqueando...' : 'Bloquear'}
                            </button>
                          ) : (
                            <button
                              onClick={() => cambiarEstado('activo')}
                              disabled={accionLoading}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-50"
                            >
                              {accionLoading ? 'Desbloqueando...' : 'Desbloquear'}
                            </button>
                          )}
                        </div>
                      </div>
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
