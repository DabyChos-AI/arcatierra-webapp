'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Globe, Lock, Users, DollarSign, Eye, EyeOff, 
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Loader2, Calendar, MapPin, Clock, ChevronLeft, ChevronRight,
  RefreshCw, AlertCircle, CheckCircle, X
} from 'lucide-react'
import { ImageUploader, GalleryUploader } from '@/components/admin/ImageUploader'
import MapPicker from '@/components/admin/MapPicker'
import { formatFechaMexico } from '@/lib/dates'
import { CAPACIDAD_SIN_TOPE } from '@/types/catalogos'
import DisplayCapacidad from './DisplayCapacidad'
import DisplayDuracion from './DisplayDuracion'

// Dias de la semana: 0=domingo .. 6=sabado (convencion backend dias_disponibles)
const DIAS_SEMANA: { value: number; label: string }[] = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
]

// Normaliza "HH:MM:SS" o "HH:MM" a "HH:MM" (el backend puede devolver con segundos)
function normalizaHora(h: string): string {
  return h.slice(0, 5)
}

interface Experiencia {
  id: string
  nombre: string
  descripcion: string
  tipo_experiencia: string
  duracion_horas: number
  precio_por_persona: number
  precio_persona_adicional: number
  precio_nino: number | null
  capacidad_maxima: number
  ubicacion: string
  coordenadas: string | null
  incluye: string[]
  requisitos: string[]
  informacion_importante: string[]
  imagen_principal: string | null
  galeria_imagenes: string[]
  disponible: boolean
  temporada: string | null
  dias_disponibles: number[]
  horarios_disponibles: string[]
  fecha_creacion: string
  fecha_actualizacion: string
}

interface Evento {
  id: string
  nombre_evento: string
  fecha_evento: string
  hora_inicio: string
  hora_fin: string | null
  capacidad_maxima: number
  capacidad_ocupada: number
  lugares_disponibles: number
  precio_base: number | null
  estado: string
  notas_internas: string | null
}

interface Notificacion {
  tipo: 'success' | 'error' | 'info'
  mensaje: string
}

interface ExperienciasAdminPageProps {
  tipoExperiencia: 'EXPERIENCIAS PUBLICAS' | 'EXPERIENCIAS PRIVADAS'
  titulo: string
  colorTema: 'green' | 'purple'
}

export default function ExperienciasAdminPage({ 
  tipoExperiencia, 
  titulo, 
  colorTema 
}: ExperienciasAdminPageProps) {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activas' | 'inactivas'>('todos')
  
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 20,
    total: 0,
    paginas: 0
  })
  
  const [showModal, setShowModal] = useState<'crear' | 'editar' | 'eliminar' | null>(null)
  const [selectedExperiencia, setSelectedExperiencia] = useState<Experiencia | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'eventos'>('info')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loadingEventos, setLoadingEventos] = useState(false)
  
  const [notificacion, setNotificacion] = useState<Notificacion | null>(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_horas: 3,
    precio_por_persona: 0,
    precio_persona_adicional: 0,
    precio_nino: null as number | null,
    edad_maxima_nino: 12,
    capacidad_maxima: 10,
    ubicacion: 'Xochimilco, CDMX',
    coordenadas: '',
    temporada: '',
    incluye: [''],
    requisitos: [''],
    informacion_importante: [''],
    imagen_principal: '',
    galeria_imagenes: [] as string[],
    disponible: true,
    dias_disponibles: [] as number[],
    horarios_disponibles: [] as string[]
  })

  const [temporadasDisponibles, setTemporadasDisponibles] = useState<string[]>([
    'Todo el año',
    'Primavera',
    'Verano', 
    'Otoño',
    'Invierno',
    'Temporada de lluvias',
    'Temporada seca'
  ])
  const [showNewTemporada, setShowNewTemporada] = useState(false)
  const [newTemporadaName, setNewTemporadaName] = useState('')

  const [showNewEventModal, setShowNewEventModal] = useState(false)
  const [newEventForm, setNewEventForm] = useState({
    fecha_evento: '',
    hora_inicio: '10:00',
    hora_fin: '',
    capacidad_maxima: 0,
    precio_base: 0,
    notas_internas: ''
  })

  const colors = {
    green: {
      primary: 'bg-green-600 hover:bg-green-700',
      light: 'bg-green-100 text-green-800',
      icon: 'text-green-600',
      ring: 'focus:ring-green-500',
      badge: 'bg-green-100 text-green-700'
    },
    purple: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      light: 'bg-purple-100 text-purple-800',
      icon: 'text-purple-600',
      ring: 'focus:ring-purple-500',
      badge: 'bg-purple-100 text-purple-700'
    }
  }
  const theme = colors[colorTema]
  const IconTipo = colorTema === 'green' ? Globe : Lock

  const fetchExperiencias = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        tipo: tipoExperiencia,
        page: paginacion.pagina.toString(),
        limit: paginacion.limite.toString()
      })
      
      if (filtroEstado !== 'todos') {
        params.append('disponible', filtroEstado === 'activas' ? 'true' : 'false')
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      const res = await fetch(`/api/experiencias-admin?${params}`)
      const data = await res.json()
      
      setExperiencias(data.items || [])
      setPaginacion(prev => ({
        ...prev,
        total: data.total || 0,
        paginas: data.pages || 0
      }))
    } catch (error) {
      console.error('Error fetching experiencias:', error)
      mostrarNotificacion('error', 'Error al cargar experiencias')
    } finally {
      setLoading(false)
    }
  }, [tipoExperiencia, paginacion.pagina, paginacion.limite, filtroEstado, searchTerm])

  const fetchEventos = async (experienciaId: string) => {
    setLoadingEventos(true)
    try {
      const res = await fetch(`/api/experiencias-admin/${experienciaId}/eventos`)
      const data = await res.json()
      setEventos(data.eventos || [])
    } catch (error) {
      console.error('Error fetching eventos:', error)
    } finally {
      setLoadingEventos(false)
    }
  }

  const handleToggle = async (id: string) => {
    setLoadingAction(id)
    try {
      const res = await fetch(`/api/experiencias-admin/${id}/toggle`, {
        method: 'PATCH'
      })
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', data.message)
        fetchExperiencias()
      } else {
        mostrarNotificacion('error', data.message || 'Error al cambiar estado')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCrear = async () => {
    setLoadingAction('crear')
    try {
      const payload = {
        ...formData,
        tipo_experiencia: tipoExperiencia,
        incluye: formData.incluye.filter(i => i.trim() !== ''),
        requisitos: formData.requisitos.filter(r => r.trim() !== ''),
        informacion_importante: formData.informacion_importante.filter(i => i.trim() !== ''),
        coordenadas: formData.coordenadas || null,
        temporada: formData.temporada || null,
        precio_nino: formData.precio_nino,
        galeria_imagenes: formData.galeria_imagenes
      }
      
      const res = await fetch('/api/experiencias-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', 'Experiencia creada exitosamente')
        setShowModal(null)
        resetForm()
        fetchExperiencias()
      } else {
        mostrarNotificacion('error', data.detail || data.message || 'Error al crear')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleEditar = async () => {
    if (!selectedExperiencia) return
    setLoadingAction('editar')
    try {
      const payload = {
        ...formData,
        incluye: formData.incluye.filter(i => i.trim() !== ''),
        requisitos: formData.requisitos.filter(r => r.trim() !== ''),
        informacion_importante: formData.informacion_importante.filter(i => i.trim() !== ''),
        coordenadas: formData.coordenadas || null,
        temporada: formData.temporada || null,
        precio_nino: formData.precio_nino,
        galeria_imagenes: formData.galeria_imagenes
      }
      
      const res = await fetch(`/api/experiencias-admin/${selectedExperiencia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', 'Experiencia actualizada')
        setShowModal(null)
        fetchExperiencias()
      } else {
        mostrarNotificacion('error', data.detail || 'Error al actualizar')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleEliminar = async () => {
    if (!selectedExperiencia) return
    setLoadingAction('eliminar')
    try {
      const res = await fetch(`/api/experiencias-admin/${selectedExperiencia.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', data.message)
        setShowModal(null)
        setSelectedExperiencia(null)
        fetchExperiencias()
      } else {
        mostrarNotificacion('error', data.message || 'Error al eliminar')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCrearEvento = async () => {
    if (!selectedExperiencia) return
    try {
      const params = new URLSearchParams({
        fecha_evento: newEventForm.fecha_evento,
        hora_inicio: newEventForm.hora_inicio
      })
      if (newEventForm.hora_fin) params.append('hora_fin', newEventForm.hora_fin)
      if (newEventForm.capacidad_maxima) params.append('capacidad_maxima', newEventForm.capacidad_maxima.toString())
      if (newEventForm.precio_base) params.append('precio_base', newEventForm.precio_base.toString())
      if (newEventForm.notas_internas) params.append('notas_internas', newEventForm.notas_internas)
      
      const res = await fetch(
        `/api/experiencias-admin/${selectedExperiencia.id}/eventos?${params}`,
        { method: 'POST' }
      )
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', 'Evento creado')
        setShowNewEventModal(false)
        setNewEventForm({ fecha_evento: '', hora_inicio: '10:00', hora_fin: '', capacidad_maxima: 0, precio_base: 0, notas_internas: '' })
        fetchEventos(selectedExperiencia.id)
      } else {
        mostrarNotificacion('error', data.detail || 'Error al crear evento')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    }
  }

  const handleToggleEvento = async (eventoId: string) => {
    try {
      const res = await fetch(
        `/api/experiencias-admin/eventos/${eventoId}/toggle`,
        { method: 'PATCH' }
      )
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', data.message)
        if (selectedExperiencia) fetchEventos(selectedExperiencia.id)
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    }
  }

  const handleEliminarEvento = async (eventoId: string) => {
    if (!confirm('¿Eliminar este evento?')) return
    try {
      const res = await fetch(
        `/api/experiencias-admin/eventos/${eventoId}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      
      if (data.success) {
        mostrarNotificacion('success', data.message)
        if (selectedExperiencia) fetchEventos(selectedExperiencia.id)
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    }
  }

  const mostrarNotificacion = (tipo: 'success' | 'error' | 'info', mensaje: string) => {
    setNotificacion({ tipo, mensaje })
    setTimeout(() => setNotificacion(null), 4000)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_horas: 3,
      precio_por_persona: 0,
      precio_persona_adicional: 0,
      precio_nino: null,
      edad_maxima_nino: 12,
      capacidad_maxima: 10,
      ubicacion: 'Xochimilco, CDMX',
      coordenadas: '',
      temporada: '',
      incluye: [''],
      requisitos: [''],
      informacion_importante: [''],
      imagen_principal: '',
      galeria_imagenes: [],
      disponible: true,
      dias_disponibles: [],
      horarios_disponibles: []
    })
    setShowNewTemporada(false)
    setNewTemporadaName('')
  }

  const abrirModalEditar = (exp: Experiencia) => {
    setSelectedExperiencia(exp)
    setFormData({
      nombre: exp.nombre,
      descripcion: exp.descripcion,
      duracion_horas: exp.duracion_horas,
      precio_por_persona: exp.precio_por_persona,
      precio_persona_adicional: exp.precio_persona_adicional || 0,
      precio_nino: exp.precio_nino,
      edad_maxima_nino: 12,
      capacidad_maxima: exp.capacidad_maxima,
      ubicacion: exp.ubicacion,
      coordenadas: exp.coordenadas || '',
      temporada: exp.temporada || '',
      incluye: exp.incluye.length > 0 ? exp.incluye : [''],
      requisitos: exp.requisitos.length > 0 ? exp.requisitos : [''],
      informacion_importante: exp.informacion_importante.length > 0 ? exp.informacion_importante : [''],
      imagen_principal: exp.imagen_principal || '',
      galeria_imagenes: exp.galeria_imagenes || [],
      disponible: exp.disponible,
      dias_disponibles: exp.dias_disponibles || [],
      horarios_disponibles: (exp.horarios_disponibles || []).map(normalizaHora)
    })
    setActiveTab('info')
    setShowModal('editar')
  }

  useEffect(() => {
    fetchExperiencias()
  }, [fetchExperiencias])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (paginacion.pagina === 1) {
        fetchExperiencias()
      } else {
        setPaginacion(prev => ({ ...prev, pagina: 1 }))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const totalActivas = experiencias.filter(e => e.disponible).length
  const totalInactivas = experiencias.filter(e => !e.disponible).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IconTipo className={`h-7 w-7 ${theme.icon}`} />
            {titulo}
          </h1>
          <p className="text-gray-500 mt-1">
            {tipoExperiencia === 'EXPERIENCIAS PUBLICAS' 
              ? 'Experiencias abiertas al público general'
              : 'Experiencias exclusivas para grupos privados'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal('crear') }}
          className={`flex items-center gap-2 px-4 py-2 ${theme.primary} text-white rounded-lg transition-colors`}
        >
          <Plus className="h-5 w-5" />
          Nueva Experiencia
        </button>
      </div>

      {/* Notificación */}
      {notificacion && (
        <div className={`fixed top-4 right-4 z-[1100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          notificacion.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notificacion.tipo === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {notificacion.tipo === 'success' ? <CheckCircle className="h-5 w-5" /> :
           notificacion.tipo === 'error' ? <AlertCircle className="h-5 w-5" /> :
           <AlertCircle className="h-5 w-5" />}
          <span>{notificacion.mensaje}</span>
          <button onClick={() => setNotificacion(null)} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${theme.light} rounded-lg`}>
              <IconTipo className={`h-5 w-5 ${theme.icon}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{paginacion.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalActivas}</p>
              <p className="text-xs text-gray-500">Activas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <EyeOff className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">{totalInactivas}</p>
              <p className="text-xs text-gray-500">Inactivas</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {experiencias.reduce(
                  (sum, e) => sum + (e.capacidad_maxima === CAPACIDAD_SIN_TOPE ? 0 : e.capacidad_maxima),
                  0
                )}
              </p>
              <p className="text-xs text-gray-500">Capacidad Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar experiencia..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent`}
            />
          </div>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'activas' | 'inactivas')}
            className={`px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
          >
            <option value="todos">Todos los estados</option>
            <option value="activas">✅ Activas</option>
            <option value="inactivas">⬜ Inactivas</option>
          </select>
          
          <button
            onClick={fetchExperiencias}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Actualizar"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={`h-8 w-8 animate-spin ${theme.icon}`} />
            <span className="ml-3 text-gray-500">Cargando experiencias...</span>
          </div>
        ) : experiencias.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <IconTipo className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron experiencias</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experiencia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración estimada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {experiencias.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggle(exp.id)}
                        disabled={loadingAction === exp.id}
                        className={`p-2 rounded-lg transition-colors ${
                          exp.disponible 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        } disabled:opacity-50`}
                        title={exp.disponible ? 'Desactivar' : 'Activar'}
                      >
                        {loadingAction === exp.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : exp.disponible ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {exp.imagen_principal ? (
                            <img 
                              src={exp.imagen_principal} 
                              alt={exp.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <IconTipo className={`h-5 w-5 ${theme.icon}`} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">{exp.nombre}</p>
                            {exp.nombre === 'DEL CAMPO A LA BARRA' && (
                              <span className="inline-block px-1.5 py-0.5 rounded-full text-xs bg-[#B15543]/10 text-[#B15543] whitespace-nowrap">
                                TODO rename
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {exp.ubicacion}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      ${exp.precio_por_persona.toLocaleString()}
                    </td>
                    
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <DisplayCapacidad valor={exp.capacidad_maxima} />
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <DisplayDuracion horas={exp.duracion_horas} />
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => abrirModalEditar(exp)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedExperiencia(exp); setShowModal('eliminar') }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {paginacion.paginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando {((paginacion.pagina - 1) * paginacion.limite) + 1} - {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)} de {paginacion.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacion.pagina === 1}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm">
                {paginacion.pagina} / {paginacion.paginas}
              </span>
              <button
                onClick={() => setPaginacion(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacion.pagina === paginacion.paginas}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {(showModal === 'crear' || showModal === 'editar') && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[1100] pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {showModal === 'editar' ? 'Editar Experiencia' : 'Nueva Experiencia'}
              </h2>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs (solo en editar) */}
            {showModal === 'editar' && (
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`py-4 border-b-2 font-medium text-sm ${
                      activeTab === 'info' 
                        ? `border-${colorTema}-500 text-${colorTema}-600` 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📋 Información
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('eventos')
                      if (selectedExperiencia) fetchEventos(selectedExperiencia.id)
                    }}
                    className={`py-4 border-b-2 font-medium text-sm ${
                      activeTab === 'eventos' 
                        ? `border-${colorTema}-500 text-${colorTema}-600` 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📅 Eventos ({eventos.length})
                  </button>
                </nav>
              </div>
            )}
            
            {/* Tab Info */}
            {(showModal === 'crear' || activeTab === 'info') && (
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <IconTipo className={`h-5 w-5 ${theme.icon}`} />
                    Información Básica
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        placeholder="Ej: Chinampa en Familia"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Ubicación *</label>
                      <input
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        placeholder="Xochimilco, CDMX"
                      />
                    </div>
                    
                    <div>
                      <MapPicker
                        value={formData.coordenadas}
                        onChange={(coords) => setFormData(prev => ({ ...prev, coordenadas: coords }))}
                        label="Ubicación en Mapa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">🗓️ Temporada</label>
                      {!showNewTemporada ? (
                        <div className="flex gap-2">
                          <select
                            value={formData.temporada}
                            onChange={(e) => {
                              if (e.target.value === '__nueva__') {
                                setShowNewTemporada(true)
                                setNewTemporadaName('')
                              } else {
                                setFormData(prev => ({ ...prev, temporada: e.target.value }))
                              }
                            }}
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                          >
                            <option value="">Seleccionar temporada</option>
                            {temporadasDisponibles.map((temp) => (
                              <option key={temp} value={temp}>{temp}</option>
                            ))}
                            <option value="__nueva__">➕ Agregar nueva temporada...</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTemporadaName}
                            onChange={(e) => setNewTemporadaName(e.target.value)}
                            placeholder="Nombre de la nueva temporada"
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newTemporadaName.trim()) {
                                setTemporadasDisponibles(prev => [...prev, newTemporadaName.trim()])
                                setFormData(prev => ({ ...prev, temporada: newTemporadaName.trim() }))
                                setShowNewTemporada(false)
                              }
                            }}
                            className={`px-3 py-2 ${theme.primary} text-white rounded-lg`}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewTemporada(false)
                              setNewTemporadaName('')
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <ImageUploader
                        value={formData.imagen_principal}
                        onChange={(url) => setFormData(prev => ({ ...prev, imagen_principal: url }))}
                        categoria="experiencias"
                        label="Imagen Principal (para listados y hero)"
                        placeholder="Arrastra una imagen o haz clic para seleccionar"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <GalleryUploader
                        value={formData.galeria_imagenes}
                        onChange={(urls) => setFormData(prev => ({ ...prev, galeria_imagenes: urls }))}
                        categoria="experiencias"
                        label="Galería de Imágenes (carrusel en página de detalle)"
                        maxImages={10}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Descripción *</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        placeholder="Descripción detallada..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className={`h-5 w-5 ${theme.icon}`} />
                    Precios y Capacidad
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Precio base 1-9 px (MXN) *</label>
                      <input
                        type="number"
                        value={formData.precio_por_persona}
                        onChange={(e) => setFormData(prev => ({ ...prev, precio_por_persona: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Persona Adicional</label>
                      <input
                        type="number"
                        value={formData.precio_persona_adicional}
                        onChange={(e) => setFormData(prev => ({ ...prev, precio_persona_adicional: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="exp-capacidad" className="block text-sm font-medium mb-1">Capacidad Máx *</label>
                      <div className="flex gap-2">
                        <input
                          id="exp-capacidad"
                          type="number"
                          value={formData.capacidad_maxima}
                          onChange={(e) => setFormData(prev => ({ ...prev, capacidad_maxima: parseInt(e.target.value) || 1 }))}
                          min="1"
                          className={`flex-1 min-w-0 px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, capacidad_maxima: CAPACIDAD_SIN_TOPE }))}
                          className="px-2 py-2 text-xs border rounded-lg hover:bg-gray-50 whitespace-nowrap"
                          title="Marcar sin tope (999)"
                        >
                          Sin tope
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">999 = sin tope</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Duración (hrs) *</label>
                      <input
                        type="number"
                        value={formData.duracion_horas}
                        onChange={(e) => setFormData(prev => ({ ...prev, duracion_horas: parseFloat(e.target.value) || 1 }))}
                        min="0.5"
                        step="0.5"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                      />
                    </div>
                  </div>

                  {/* Precio Niño */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium mb-2 text-blue-800">
                      👶 Precio para Niños (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Precio niño ($)</label>
                        <input
                          type="number"
                          value={formData.precio_nino ?? ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            precio_nino: e.target.value ? parseFloat(e.target.value) : null 
                          }))}
                          min="0"
                          placeholder="Ej: 350"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Edad máxima (años)</label>
                        <select
                          value={formData.edad_maxima_nino}
                          onChange={(e) => setFormData(prev => ({ ...prev, edad_maxima_nino: parseInt(e.target.value) }))}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        >
                          {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(edad => (
                            <option key={edad} value={edad}>Menores de {edad} años</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Deja vacío el precio si no aplica tarifa especial para niños
                    </p>
                  </div>
                </div>

                {/* Disponibilidad: dias + horarios */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className={`h-5 w-5 ${theme.icon}`} />
                    Disponibilidad
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Días disponibles</label>
                    <div className="flex flex-wrap gap-2">
                      {DIAS_SEMANA.map((dia) => {
                        const activo = formData.dias_disponibles.includes(dia.value)
                        return (
                          <button
                            key={dia.value}
                            type="button"
                            aria-pressed={activo}
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                dias_disponibles: activo
                                  ? prev.dias_disponibles.filter(d => d !== dia.value)
                                  : [...prev.dias_disponibles, dia.value].sort((a, b) => a - b)
                              }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                              activo
                                ? `${theme.primary} text-white border-transparent`
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {dia.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Días de la semana en que se puede reservar esta experiencia.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Horarios disponibles</label>
                    <div className="space-y-2">
                      {formData.horarios_disponibles.length === 0 && (
                        <p className="text-xs text-gray-400 italic">
                          Sin horarios configurados. Agrega uno abajo.
                        </p>
                      )}
                      {formData.horarios_disponibles.map((hora, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="time"
                            aria-label={`Horario ${idx + 1}`}
                            value={hora}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                horarios_disponibles: prev.horarios_disponibles.map((h, i) =>
                                  i === idx ? e.target.value : h
                                )
                              }))
                            }
                            className={`px-3 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                horarios_disponibles: prev.horarios_disponibles.filter((_, i) => i !== idx)
                              }))
                            }
                            aria-label={`Quitar horario ${idx + 1}`}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          horarios_disponibles: [...prev.horarios_disponibles, '10:00']
                        }))
                      }
                      className={`mt-2 inline-flex items-center gap-1 text-sm ${theme.icon} hover:underline`}
                    >
                      <Plus className="h-4 w-4" />
                      Agregar horario
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className={`h-5 w-5 ${theme.icon}`} />
                    Estado y Visibilidad
                  </h3>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.disponible}
                      onChange={(e) => setFormData(prev => ({ ...prev, disponible: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`relative w-14 h-8 rounded-full transition-colors ${
                      formData.disponible ? (colorTema === 'green' ? 'bg-green-500' : 'bg-purple-500') : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        formData.disponible ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </div>
                    <span className="ml-3 text-sm font-medium">
                      {formData.disponible ? '✅ Visible en la web pública' : '⬜ Oculta (solo admin)'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab Eventos */}
            {showModal === 'editar' && activeTab === 'eventos' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Fechas/Eventos Programados</h3>
                  <button
                    onClick={() => setShowNewEventModal(true)}
                    className={`flex items-center gap-2 px-3 py-2 ${theme.primary} text-white rounded-lg text-sm`}
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Evento
                  </button>
                </div>
                
                {loadingEventos ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className={`h-6 w-6 animate-spin ${theme.icon}`} />
                  </div>
                ) : eventos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No hay eventos programados</p>
                    <p className="text-sm">Crea fechas para que los usuarios puedan reservar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eventos.map((evento) => (
                      <div 
                        key={evento.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          evento.estado === 'activo' ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleToggleEvento(evento.id)}
                            className={`p-1.5 rounded ${
                              evento.estado === 'activo' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {evento.estado === 'activo' 
                              ? <ToggleRight className="h-4 w-4" /> 
                              : <ToggleLeft className="h-4 w-4" />}
                          </button>
                          
                          <div>
                            <p className="font-medium text-sm">
                              {formatFechaMexico(new Date(evento.fecha_evento + 'T00:00:00'), {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {evento.hora_inicio} {evento.hora_fin ? `- ${evento.hora_fin}` : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {evento.capacidad_ocupada}/{evento.capacidad_maxima}
                            </p>
                            <p className="text-xs text-gray-500">
                              {evento.lugares_disponibles} disponibles
                            </p>
                          </div>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            evento.estado === 'activo' 
                              ? 'bg-green-100 text-green-700' 
                              : evento.estado === 'cancelado'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {evento.estado}
                          </span>
                          
                          <button
                            onClick={() => handleEliminarEvento(evento.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Footer (solo en tab info) */}
            {(showModal === 'crear' || activeTab === 'info') && (
              <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={showModal === 'editar' ? handleEditar : handleCrear}
                  disabled={loadingAction === 'crear' || loadingAction === 'editar'}
                  className={`px-4 py-2 ${theme.primary} text-white rounded-lg disabled:opacity-50 flex items-center gap-2`}
                >
                  {(loadingAction === 'crear' || loadingAction === 'editar') && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {showModal === 'editar' ? 'Guardar Cambios' : 'Crear Experiencia'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showModal === 'eliminar' && selectedExperiencia && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[1100] pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                ¿Eliminar experiencia?
              </h3>
              <p className="text-center text-gray-500 mb-4">
                Esta acción eliminará <strong>{selectedExperiencia.nombre}</strong>.
                {selectedExperiencia.disponible && ' Si tiene reservas, solo se desactivará.'}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminar}
                  disabled={loadingAction === 'eliminar'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingAction === 'eliminar' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Evento */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[1200] pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold">Nuevo Evento/Fecha</h3>
              <button onClick={() => setShowNewEventModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha *</label>
                <input
                  type="date"
                  value={newEventForm.fecha_evento}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, fecha_evento: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    value={newEventForm.hora_inicio}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, hora_inicio: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={newEventForm.hora_fin}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, hora_fin: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidad</label>
                  <input
                    type="number"
                    value={newEventForm.capacidad_maxima || ''}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, capacidad_maxima: parseInt(e.target.value) || 0 }))}
                    placeholder="Usar de experiencia"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio</label>
                  <input
                    type="number"
                    value={newEventForm.precio_base || ''}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, precio_base: parseFloat(e.target.value) || 0 }))}
                    placeholder="Usar de experiencia"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notas Internas</label>
                <textarea
                  value={newEventForm.notas_internas}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, notas_internas: e.target.value }))}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                  placeholder="Notas solo visibles para admin..."
                />
              </div>
            </div>
            
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowNewEventModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearEvento}
                disabled={!newEventForm.fecha_evento || !newEventForm.hora_inicio}
                className={`px-4 py-2 ${theme.primary} text-white rounded-lg disabled:opacity-50`}
              >
                Crear Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
