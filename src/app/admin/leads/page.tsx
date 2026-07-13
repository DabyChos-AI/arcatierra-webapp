'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Inbox,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  AlertTriangle,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Phone,
  Clock,
  Info,
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'
import { API_URL } from '@/lib/api'

// ─── Types ───────────────────────────────────────────

type EstadoLead =
  | 'nuevo'
  | 'en_cotizacion'
  | 'convertido_a_reserva'
  | 'descartado'

type MedioContacto = 'whatsapp' | 'email'

interface ExperienciaSimple {
  id: string
  nombre: string
  tipo_experiencia: string
}

interface CrearLeadForm {
  nombre: string
  medio_contacto: MedioContacto
  email: string
  telefono: string
  experiencia_id: string
  mensaje: string
  vendedor_asignado_id: string
  notas_internas: string
}

const FORM_INICIAL: CrearLeadForm = {
  nombre: '',
  medio_contacto: 'whatsapp',
  email: '',
  telefono: '',
  experiencia_id: '',
  mensaje: '',
  vendedor_asignado_id: '',
  notas_internas: '',
}

interface Lead {
  id: string
  nombre: string | null
  email: string | null
  telefono: string | null
  medio_contacto: MedioContacto
  mensaje: string | null
  fecha_solicitud: string
  estado_lead: EstadoLead
  experiencia_id: string | null
  experiencia_nombre: string | null
  vendedor_asignado_id: string | null
  vendedor_nombre: string | null
  reserva_creada_id: string | null
  reserva_booking_id: string | null
  notas_internas: string | null
}

interface LeadsListResponse {
  items: Lead[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

interface LeadsStats {
  nuevos: number
  en_cotizacion: number
  convertidos_mes_actual: number
  descartados: number
  tasa_conversion: number
}

interface Vendedor {
  id: string
  nombre: string
}

// ─── Constants ───────────────────────────────────────

// TODO Fase E: Reemplazar con fetch a /api/admin/personal cuando ese endpoint exista.
// Estos UUIDs son los reales obtenidos de:
//   docker exec arca-postgres psql -U arca_app -d arcatierra \
//     -c "SELECT id, nombre, apellidos FROM personal WHERE activo=true AND es_vendedor=true ORDER BY nombre;"
// Actualizado 2026-05-22 tras ejecutar FASE-A-ALINEACION-V10.sql (C04, C06, C10):
//   - Removidas: Joy, Melissa Lopez, Santiago (ya no están en tabla `personal`)
//   - Agregada: Daniela Alemán (vendedora + guía multi-rol, C10)
const VENDEDORES_HARDCODED: Vendedor[] = [
  { id: '75eb5a1d-b05d-4bf6-9c66-6778fd315262', nombre: 'Daniela Alemán' },
  { id: '6041aa86-04d1-4da2-9b2d-f9e3b742e9ea', nombre: 'Sof Ortega' },
  { id: '976ed503-db38-453a-9840-af12ddb0e770', nombre: 'Sofia Santiago' },
  { id: '36d73a4b-4f14-4f42-97fa-243cef5e2798', nombre: 'Zara Arroyo' },
]

const ESTADO_BADGE: Record<EstadoLead, { label: string; classes: string }> = {
  nuevo: {
    label: 'Nuevo',
    classes: 'bg-[#B15543]/10 text-[#B15543] border border-[#B15543]/30',
  },
  en_cotizacion: {
    label: 'En cotizacion',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  convertido_a_reserva: {
    label: 'Convertido',
    classes: 'bg-[#33503E]/10 text-[#33503E] border border-[#33503E]/30',
  },
  descartado: {
    label: 'Descartado',
    classes: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
}

type FiltroEstado = '' | EstadoLead

const TABS: { key: FiltroEstado; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'nuevo', label: 'Nuevos' },
  { key: 'en_cotizacion', label: 'En cotizacion' },
  { key: 'convertido_a_reserva', label: 'Convertidos' },
  { key: 'descartado', label: 'Descartados' },
]

const PER_PAGE = 20

// ─── Helpers ─────────────────────────────────────────

function vendedorNombre(id: string | null): string {
  if (!id) return 'Sin asignar'
  const v = VENDEDORES_HARDCODED.find((x) => x.id === id)
  return v ? v.nombre : 'Vendedor desconocido'
}

// ─── Component ───────────────────────────────────────

export default function AdminLeadsPage() {
  // Datos
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paginacion + filtros
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('')
  const [filtroVendedor, setFiltroVendedor] = useState<string>('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Modal detalle
  const [modalOpen, setModalOpen] = useState(false)
  const [leadDetalle, setLeadDetalle] = useState<Lead | null>(null)
  const [accionLoading, setAccionLoading] = useState(false)
  const [nuevaNota, setNuevaNota] = useState('')
  const [accionError, setAccionError] = useState<string | null>(null)

  // Modal crear lead
  const [crearOpen, setCrearOpen] = useState(false)
  const [crearForm, setCrearForm] = useState<CrearLeadForm>(FORM_INICIAL)
  const [crearLoading, setCrearLoading] = useState(false)
  const [crearError, setCrearError] = useState<string | null>(null)
  const [experiencias, setExperiencias] = useState<ExperienciaSimple[]>([])

  // ─── Fetchers ────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await fetch('/api/admin/leads/stats')
      if (res.ok) {
        const data: LeadsStats = await res.json()
        setStats(data)
      }
    } catch {
      /* silently fail — stats no son criticos */
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      })
      if (filtroEstado) params.set('estado', filtroEstado)
      if (filtroVendedor) params.set('vendedor_id', filtroVendedor)
      if (busqueda) params.set('busqueda', busqueda)

      const res = await fetch(`/api/admin/leads?${params.toString()}`)
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} cargando leads`)
      }
      const data: LeadsListResponse = await res.json()
      setLeads(data.items)
      setTotalCount(data.total_count)
      setTotalPages(data.total_pages)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, filtroEstado, filtroVendedor, busqueda])

  // Reset page cuando cambian filtros
  useEffect(() => {
    setPage(1)
  }, [filtroEstado, filtroVendedor, busqueda])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Debounce busqueda 300ms
  useEffect(() => {
    const handle = setTimeout(() => {
      setBusqueda(busquedaInput.trim())
    }, 300)
    return () => clearTimeout(handle)
  }, [busquedaInput])

  // Cargar experiencias disponibles para el dropdown del modal crear
  useEffect(() => {
    let cancelled = false
    const fetchExperiencias = async () => {
      try {
        const res = await fetch(`${API_URL}/api/experiencias?limit=100`)
        if (!res.ok) return
        const data = await res.json()
        const arr: ExperienciaSimple[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : []
        if (!cancelled) {
          setExperiencias(
            arr
              .map((e) => ({
                id: String(e.id),
                nombre: e.nombre,
                tipo_experiencia: e.tipo_experiencia,
              }))
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
          )
        }
      } catch {
        // silencioso: si falla el dropdown queda vacio (campo opcional)
      }
    }
    fetchExperiencias()
    return () => {
      cancelled = true
    }
  }, [])

  // ─── Modal ───────────────────────────────────────────

  const openDetalle = (lead: Lead) => {
    setLeadDetalle(lead)
    setNuevaNota('')
    setAccionError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setLeadDetalle(null)
    setNuevaNota('')
    setAccionError(null)
  }

  // ─── Modal Crear Lead ────────────────────────────────

  const openCrear = () => {
    setCrearForm(FORM_INICIAL)
    setCrearError(null)
    setCrearOpen(true)
  }

  const closeCrear = () => {
    if (crearLoading) return
    setCrearOpen(false)
    setCrearForm(FORM_INICIAL)
    setCrearError(null)
  }

  const handleCrearSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCrearError(null)

    const nombre = crearForm.nombre.trim()
    const medio = crearForm.medio_contacto
    const email = crearForm.email.trim()
    const telefono = crearForm.telefono.trim()

    if (!nombre) {
      setCrearError('El nombre es obligatorio')
      return
    }
    if (medio === 'whatsapp' && !telefono) {
      setCrearError('Telefono requerido si el medio es WhatsApp')
      return
    }
    if (medio === 'email' && !email) {
      setCrearError('Email requerido si el medio es Email')
      return
    }

    setCrearLoading(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          medio_contacto: medio,
          email: email || null,
          telefono: telefono || null,
          experiencia_id: crearForm.experiencia_id || null,
          mensaje: crearForm.mensaje.trim() || null,
          vendedor_asignado_id: crearForm.vendedor_asignado_id || null,
          notas_internas: crearForm.notas_internas.trim() || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || 'No se pudo crear el lead')
      }

      // Exito: cerrar modal y refrescar listado + stats
      setCrearOpen(false)
      setCrearForm(FORM_INICIAL)
      await Promise.all([fetchLeads(), fetchStats()])
    } catch (err) {
      setCrearError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCrearLoading(false)
    }
  }

  const refreshLead = useCallback(
    async (leadId: string): Promise<Lead | null> => {
      // Refetch listado para mantener tabla sync, y ademas extraer el lead actualizado
      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(PER_PAGE),
        })
        if (filtroEstado) params.set('estado', filtroEstado)
        if (filtroVendedor) params.set('vendedor_id', filtroVendedor)
        if (busqueda) params.set('busqueda', busqueda)
        const res = await fetch(`/api/admin/leads?${params.toString()}`)
        if (!res.ok) return null
        const data: LeadsListResponse = await res.json()
        setLeads(data.items)
        setTotalCount(data.total_count)
        setTotalPages(data.total_pages)
        const updated = data.items.find((l) => l.id === leadId) || null
        return updated
      } catch {
        return null
      }
    },
    [page, filtroEstado, filtroVendedor, busqueda],
  )

  // ─── Actions ─────────────────────────────────────────

  const cambiarEstado = async (estado: EstadoLead) => {
    if (!leadDetalle) return
    if (estado === 'convertido_a_reserva') {
      setAccionError('La conversion a reserva estara disponible en Fase C.')
      return
    }
    try {
      setAccionLoading(true)
      setAccionError(null)
      const res = await fetch(
        `/api/admin/leads/${leadDetalle.id}/estado`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado_lead: estado }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error al cambiar estado')
      }
      const updated = await refreshLead(leadDetalle.id)
      if (updated) setLeadDetalle(updated)
      fetchStats()
    } catch (err) {
      setAccionError(
        err instanceof Error ? err.message : 'Error al cambiar estado',
      )
    } finally {
      setAccionLoading(false)
    }
  }

  const asignarVendedor = async (vendedorId: string) => {
    if (!leadDetalle) return
    try {
      setAccionLoading(true)
      setAccionError(null)
      const res = await fetch(
        `/api/admin/leads/${leadDetalle.id}/asignar`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendedor_id: vendedorId }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error al asignar vendedor')
      }
      const updated = await refreshLead(leadDetalle.id)
      if (updated) setLeadDetalle(updated)
    } catch (err) {
      setAccionError(
        err instanceof Error ? err.message : 'Error al asignar vendedor',
      )
    } finally {
      setAccionLoading(false)
    }
  }

  const agregarNota = async () => {
    if (!leadDetalle) return
    const nota = nuevaNota.trim()
    if (!nota) {
      setAccionError('La nota no puede estar vacia.')
      return
    }
    try {
      setAccionLoading(true)
      setAccionError(null)
      const res = await fetch(
        `/api/admin/leads/${leadDetalle.id}/notas`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nota }),
        },
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error al agregar nota')
      }
      const data: { success: boolean; notas_internas: string } = await res.json()
      // Reemplazar inline en leadDetalle para feedback inmediato
      setLeadDetalle((prev) =>
        prev ? { ...prev, notas_internas: data.notas_internas } : prev,
      )
      setNuevaNota('')
      // Tambien refrescar tabla por si ordenamos por updated en el futuro
      refreshLead(leadDetalle.id)
    } catch (err) {
      setAccionError(
        err instanceof Error ? err.message : 'Error al agregar nota',
      )
    } finally {
      setAccionLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchLeads()
    fetchStats()
  }

  // ─── KPI cards data ─────────────────────────────────

  const kpiCards = useMemo(() => {
    if (!stats) return null
    return [
      {
        title: 'Nuevos',
        value: stats.nuevos,
        icon: Inbox,
        color: '#B15543',
        bgClass: 'bg-[#B15543]/10',
        textClass: 'text-[#B15543]',
      },
      {
        title: 'En cotizacion',
        value: stats.en_cotizacion,
        icon: Mail,
        color: '#F59E0B',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-600',
      },
      {
        title: 'Convertidos este mes',
        value: stats.convertidos_mes_actual,
        icon: CheckCircle,
        color: '#33503E',
        bgClass: 'bg-[#33503E]/10',
        textClass: 'text-[#33503E]',
      },
      {
        title: 'Tasa conversion',
        value: `${(stats.tasa_conversion * 100).toFixed(1)}%`,
        icon: CheckCircle,
        color: '#33503E',
        bgClass: 'bg-[#33503E]/10',
        textClass: 'text-[#33503E]',
      },
    ]
  }, [stats])

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#B15543]/10">
            <Inbox className="h-6 w-6 text-[#B15543]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bandeja de Leads
            </h1>
            <p className="text-gray-600 mt-1">
              Solicitudes de experiencias privadas pendientes de procesar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCrear}
            aria-label="Agregar nuevo lead"
            className="flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg hover:bg-[#975543] focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Agregar lead</span>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Actualizar lista de leads"
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

      {/* Tip explicativo */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[#E3DBCB]/40 border-l-4 border-[#B15543] text-sm text-gray-700">
        <Info
          className="h-4 w-4 text-[#B15543] mt-0.5 flex-shrink-0"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          Las solicitudes que llegan por la pagina web aparecen aqui
          automaticamente.
          {!statsLoading && stats && stats.nuevos > 0 && (
            <>
              {' '}Hoy hay{' '}
              <strong className="text-[#B15543]">
                {stats.nuevos} sin procesar
              </strong>
              .
            </>
          )}
          {!statsLoading && stats && stats.nuevos === 0 && (
            <> No tienes leads nuevos pendientes.</>
          )}
        </p>
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

        {/* Vendedor + busqueda */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label
              htmlFor="filtro-vendedor"
              className="text-sm text-gray-600 sm:whitespace-nowrap"
            >
              Vendedor
            </label>
            <select
              id="filtro-vendedor"
              value={filtroVendedor}
              onChange={(e) => setFiltroVendedor(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            >
              <option value="">Todos</option>
              {VENDEDORES_HARDCODED.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <label htmlFor="busqueda-leads" className="sr-only">
              Buscar leads
            </label>
            <input
              id="busqueda-leads"
              type="search"
              placeholder="Buscar por nombre, email, telefono o mensaje..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            />
            {busquedaInput && (
              <button
                type="button"
                aria-label="Limpiar busqueda"
                onClick={() => setBusquedaInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
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
          <AlertTriangle
            className="h-5 w-5 text-red-400 mr-2"
            aria-hidden="true"
          />
          <span className="text-red-700">{error}</span>
          <button
            type="button"
            onClick={fetchLeads}
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
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
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
            <Mail
              className="h-12 w-12 mx-auto text-gray-300 mb-3"
              aria-hidden="true"
            />
            <p className="text-lg font-medium">No hay leads pendientes</p>
            <p className="text-sm mt-1">
              Cuando un cliente solicite una experiencia privada, aparecera
              aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Experiencia
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Medio
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Vendedor
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Fecha
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const badge = ESTADO_BADGE[lead.estado_lead]
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => openDetalle(lead)}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {lead.nombre || 'Sin nombre'}
                        </div>
                        {lead.email && (
                          <div className="text-xs text-gray-500">
                            {lead.email}
                          </div>
                        )}
                        {lead.telefono && (
                          <div className="text-xs text-gray-500">
                            {lead.telefono}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {lead.experiencia_nombre || (
                          <span className="text-gray-400 italic">
                            Sin especificar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lead.medio_contacto === 'whatsapp' ? (
                          <span
                            className="inline-flex items-center justify-center text-green-600"
                            title="WhatsApp"
                          >
                            <MessageCircle
                              className="h-4 w-4"
                              aria-label="WhatsApp"
                            />
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center text-blue-600"
                            title="Email"
                          >
                            <Mail className="h-4 w-4" aria-label="Email" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {lead.vendedor_nombre ||
                          vendedorNombre(lead.vendedor_asignado_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatFechaHoraMexico(lead.fecha_solicitud)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          aria-label={`Ver detalle del lead ${lead.nombre || lead.email || lead.id}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            openDetalle(lead)
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

        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {totalCount} leads &middot; Pagina {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Pagina anterior"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Pagina siguiente"
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

      {/* ─── Detail Modal ──────────────────────────────── */}
      {modalOpen && leadDetalle && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[leadDetalle.estado_lead].classes}`}
                >
                  {ESTADO_BADGE[leadDetalle.estado_lead].label}
                </span>
                <h2 className="text-xl font-bold text-gray-900">
                  {leadDetalle.nombre ||
                    leadDetalle.email ||
                    'Lead sin nombre'}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {accionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle
                    className="h-4 w-4 text-red-500 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-red-700">{accionError}</span>
                </div>
              )}

              {/* Lead card (estilo mockup v8: border-left terracota) */}
              <section className="border-l-4 border-l-[#B15543] bg-white shadow-sm rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  {leadDetalle.nombre || 'Sin nombre'}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" aria-hidden="true" />
                    <span className="break-all">
                      {leadDetalle.email || 'Sin email'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" aria-hidden="true" />
                    <span>{leadDetalle.telefono || 'Sin telefono'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {formatFechaHoraMexico(leadDetalle.fecha_solicitud)}
                    </span>
                  </span>
                  {leadDetalle.reserva_booking_id && (
                    <span className="flex items-center gap-1 text-[#33503E]">
                      <CheckCircle className="h-3 w-3" aria-hidden="true" />
                      <span>Reserva: {leadDetalle.reserva_booking_id}</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Experiencia interesada
                    </label>
                    <input
                      type="text"
                      disabled
                      value={leadDetalle.experiencia_nombre || 'Sin especificar'}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Medio de contacto
                    </label>
                    <input
                      type="text"
                      disabled
                      value={
                        leadDetalle.medio_contacto === 'whatsapp'
                          ? 'WhatsApp'
                          : 'Email'
                      }
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500 block mb-1">
                    Mensaje del cliente
                  </label>
                  <div className="bg-[#E3DBCB]/40 border-l-[3px] border-[#CCBB9A] rounded-md p-3 text-sm italic text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {leadDetalle.mensaje || (
                      <span className="text-gray-400 not-italic">
                        Sin mensaje
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* Estado */}
              <section>
                <label
                  htmlFor="select-estado"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  Estado del lead
                </label>
                <select
                  id="select-estado"
                  value={leadDetalle.estado_lead}
                  onChange={(e) =>
                    cambiarEstado(e.target.value as EstadoLead)
                  }
                  disabled={accionLoading}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E] w-full sm:w-auto"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="en_cotizacion">En cotizacion</option>
                  <option
                    value="convertido_a_reserva"
                    disabled={!leadDetalle.reserva_creada_id}
                  >
                    Convertido a reserva
                    {!leadDetalle.reserva_creada_id
                      ? ' (requiere reserva)'
                      : ''}
                  </option>
                  <option value="descartado">Descartado</option>
                </select>
              </section>

              {/* Vendedor */}
              <section>
                <label
                  htmlFor="select-vendedor"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  Vendedor asignado
                </label>
                <select
                  id="select-vendedor"
                  value={leadDetalle.vendedor_asignado_id || ''}
                  onChange={(e) => {
                    if (e.target.value) asignarVendedor(e.target.value)
                  }}
                  disabled={accionLoading}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E] w-full sm:w-auto"
                >
                  <option value="">Sin asignar</option>
                  {VENDEDORES_HARDCODED.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
                {/* TODO Fase E: dropdown alimentado por GET /api/admin/personal */}
              </section>

              {/* Notas internas */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Notas internas
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto mb-3">
                  {leadDetalle.notas_internas ? (
                    leadDetalle.notas_internas
                  ) : (
                    <span className="text-gray-400 italic">
                      Aun no hay notas. Agrega la primera abajo.
                    </span>
                  )}
                </div>
                <label htmlFor="nueva-nota" className="sr-only">
                  Nueva nota
                </label>
                <textarea
                  id="nueva-nota"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  rows={3}
                  placeholder="Agregar nota nueva (se firmara con tu usuario y fecha)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
                  disabled={accionLoading}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={agregarNota}
                    disabled={accionLoading || !nuevaNota.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {accionLoading ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Agregar nota
                  </button>
                </div>
              </section>
            </div>

            {/* Footer con acciones rapidas */}
            <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-wrap">
              <button
                type="button"
                onClick={() => cambiarEstado('descartado')}
                disabled={
                  accionLoading || leadDetalle.estado_lead === 'descartado'
                }
                className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Marcar descartado
              </button>

              <div className="flex gap-2 flex-wrap">
                <span title="Disponible en Fase C">
                  <button
                    type="button"
                    disabled
                    aria-label="Convertir a reserva (disponible en Fase C)"
                    className="flex items-center gap-1 px-3 py-2 bg-[#33503E]/40 text-white rounded-lg text-sm cursor-not-allowed opacity-60"
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Convertir a reserva
                  </button>
                </span>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#33503E] text-white rounded-lg text-sm hover:bg-[#475A52]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Crear Lead ──────────────────────────── */}
      {crearOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCrear()
          }}
        >
          <form
            onSubmit={handleCrearSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-4 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#B15543]/10">
                  <Plus className="h-5 w-5 text-[#B15543]" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Agregar lead
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCrear}
                aria-label="Cerrar modal"
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                disabled={crearLoading}
              >
                <X className="h-5 w-5 text-gray-500" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {crearError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle
                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{crearError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="crear-nombre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="crear-nombre"
                  type="text"
                  required
                  maxLength={255}
                  value={crearForm.nombre}
                  onChange={(e) =>
                    setCrearForm({ ...crearForm, nombre: e.target.value })
                  }
                  placeholder="Nombre del cliente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="crear-medio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Medio de contacto <span className="text-red-500">*</span>
                </label>
                <select
                  id="crear-medio"
                  value={crearForm.medio_contacto}
                  onChange={(e) =>
                    setCrearForm({
                      ...crearForm,
                      medio_contacto: e.target.value as MedioContacto,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="crear-telefono"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefono
                    {crearForm.medio_contacto === 'whatsapp' && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <input
                    id="crear-telefono"
                    type="tel"
                    maxLength={50}
                    value={crearForm.telefono}
                    onChange={(e) =>
                      setCrearForm({ ...crearForm, telefono: e.target.value })
                    }
                    placeholder="55 1234 5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="crear-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                    {crearForm.medio_contacto === 'email' && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <input
                    id="crear-email"
                    type="email"
                    maxLength={255}
                    value={crearForm.email}
                    onChange={(e) =>
                      setCrearForm({ ...crearForm, email: e.target.value })
                    }
                    placeholder="cliente@correo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="crear-experiencia"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Experiencia interesada
                </label>
                <select
                  id="crear-experiencia"
                  value={crearForm.experiencia_id}
                  onChange={(e) =>
                    setCrearForm({
                      ...crearForm,
                      experiencia_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                >
                  <option value="">Sin especificar</option>
                  {experiencias.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="crear-vendedor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Vendedor asignado
                </label>
                <select
                  id="crear-vendedor"
                  value={crearForm.vendedor_asignado_id}
                  onChange={(e) =>
                    setCrearForm({
                      ...crearForm,
                      vendedor_asignado_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                >
                  <option value="">Sin asignar</option>
                  {VENDEDORES_HARDCODED.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="crear-mensaje"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mensaje del cliente
                </label>
                <textarea
                  id="crear-mensaje"
                  rows={3}
                  maxLength={2000}
                  value={crearForm.mensaje}
                  onChange={(e) =>
                    setCrearForm({ ...crearForm, mensaje: e.target.value })
                  }
                  placeholder="Detalles de la solicitud, fecha tentativa, numero de personas, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                />
              </div>

              <div>
                <label
                  htmlFor="crear-notas"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nota interna (opcional)
                </label>
                <textarea
                  id="crear-notas"
                  rows={2}
                  maxLength={2000}
                  value={crearForm.notas_internas}
                  onChange={(e) =>
                    setCrearForm({
                      ...crearForm,
                      notas_internas: e.target.value,
                    })
                  }
                  placeholder="Visible solo para el equipo. Se firma con tu usuario y fecha."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
              <button
                type="button"
                onClick={closeCrear}
                disabled={crearLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={crearLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg text-sm hover:bg-[#975543] disabled:opacity-50"
              >
                {crearLoading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{crearLoading ? 'Guardando...' : 'Guardar lead'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
