'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Globe, Lock, Users, DollarSign, Eye, EyeOff,
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Loader2, Calendar, MapPin, Clock, ChevronLeft, ChevronRight,
  RefreshCw, AlertCircle, CheckCircle, X, Pencil
} from 'lucide-react'
import { ImageUploader, GalleryUploader } from '@/components/admin/ImageUploader'
import MapPicker from '@/components/admin/MapPicker'
import { formatFechaMexico } from '@/lib/dates'
import { CAPACIDAD_SIN_TOPE } from '@/types/catalogos'
import {
  esRequiereConfirmacion,
  type EditarFechaPayload,
  type EditarFechaResponse,
  type EventoExperiencia,
} from '@/types/eventos-experiencia'
import { hoyMexico, horaCorta, horario, sinTope } from '@/app/admin/eventos/components/fechas'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { formatMXN } from '@/types/reservas'
import {
  REGLA_NINO_VACIA,
  precioNino,
  reglaNinoCompleta,
  type ReglaNino,
  type TipoPrecioNino,
} from '@/types/compra-experiencias'
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

interface Experiencia {
  id: string
  nombre: string
  descripcion: string
  tipo_experiencia: string
  duracion_horas: number
  precio_por_persona: number
  precio_persona_adicional: number
  personas_incluidas: number
  precio_nino: number | null
  // NI1 (Fase 4a, C6): `tipo_precio_nino` es el interruptor; null = sin regla (niños pagan como adulto)
  edad_maxima_nino: number | null
  tipo_precio_nino: TipoPrecioNino | null
  porcentaje_nino: number | null
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

// ─── Editar una fecha (EV3 + NV1, Fase 3 de PLAN-EXP-SIN-FALLAS) ──────────────────────────
// Contrato: EXP-FASE3-CONTRATO.md §C1/§F1. Los tipos son de @/types/eventos-experiencia.

/** D6 (Fase 4a): lo que se avisa ANTES de publicar una fecha; ya existe la compra en línea (WEB1). */
const AVISO_PUBLICAR =
  'Al publicarla, la fecha se ve en la web y se puede comprar en línea hasta 24 horas antes. ¿Publicarla?'

// ─── NI1: regla de niño de la experiencia (Fase 4a de PLAN-EXP-SIN-FALLAS, contrato EXP-FASE4 §C6/§F6) ──
/** Mismo texto que el 400 del backend (C6). */
const ERROR_REGLA_INCOMPLETA =
  'Para cobrar distinto a los niños llena la edad máxima y el precio (porcentaje o monto)'
const EDAD_NINO_MIN = 1
const EDAD_NINO_MAX = 17

/** Lo que se manda: apagado = los 4 campos null; con tipo, solo el valor de ese tipo (el otro, null). */
function reglaNinoDelForm(f: ReglaNino): ReglaNino {
  if (f.tipo_precio_nino == null) return { ...REGLA_NINO_VACIA }
  return {
    edad_maxima_nino: f.edad_maxima_nino,
    tipo_precio_nino: f.tipo_precio_nino,
    porcentaje_nino: f.tipo_precio_nino === 'porcentaje' ? f.porcentaje_nino : null,
    precio_nino: f.tipo_precio_nino === 'monto' ? f.precio_nino : null,
  }
}

/** El error de captura de la regla, o null si se puede mandar (el servidor la vuelve a validar). */
function validarReglaNino(f: ReglaNino): string | null {
  const r = reglaNinoDelForm(f)
  if (r.tipo_precio_nino == null) return null
  if (!reglaNinoCompleta(r)) return ERROR_REGLA_INCOMPLETA
  const edad = r.edad_maxima_nino as number
  if (!Number.isInteger(edad) || edad < EDAD_NINO_MIN || edad > EDAD_NINO_MAX) {
    return `La edad máxima va de ${EDAD_NINO_MIN} a ${EDAD_NINO_MAX} años.`
  }
  if (r.tipo_precio_nino === 'porcentaje') {
    const p = r.porcentaje_nino as number
    if (!Number.isFinite(p) || p < 0 || p > 100) return 'El porcentaje va de 0 a 100.'
  } else {
    const m = r.precio_nino as number
    if (!Number.isFinite(m) || m < 0) return 'El precio del niño no puede ser negativo.'
  }
  return null
}

const formatoPorcentaje = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })

/** «Un niño de hasta 12 años paga $550.00 (50 % de $1,100.00)» — con `precioNino()`, el espejo del backend.
 * Privadas (Fase 4b, D16-1/F5): `precioAdulto` = precio por persona ADICIONAL, porque el niño solo paga distinto en los
 * lugares adicionales: «Un niño adicional de hasta 12 años paga $550.00 (50 % de $1,100.00 por persona adicional)». */
function vistaPreviaNino(f: ReglaNino, precioAdulto: number, esPrivada = false): string {
  const r = reglaNinoDelForm(f)
  if (r.tipo_precio_nino == null || validarReglaNino(f)) {
    return 'Llena la edad máxima y el precio para ver cuánto paga un niño.'
  }
  const paga = precioNino(r, precioAdulto)
  const nino = esPrivada ? 'Un niño adicional' : 'Un niño'
  const inicio = `${nino} de hasta ${r.edad_maxima_nino} años paga ${formatMXN(paga)}`
  if (r.tipo_precio_nino === 'porcentaje') {
    const base = esPrivada ? `${formatMXN(precioAdulto)} por persona adicional` : formatMXN(precioAdulto)
    return `${inicio} (${formatoPorcentaje.format(r.porcentaje_nino as number)} % de ${base})`
  }
  const tope = (r.precio_nino as number) > precioAdulto ? '; nunca más que un adulto' : ''
  const adulto = esPrivada ? 'un adulto adicional' : 'un adulto'
  return `${inicio} (monto fijo; ${adulto} paga ${formatMXN(precioAdulto)}${tope})`
}

/** Leer un input numérico: vacío o inválido = null. */
function numeroONull(valor: string): number | null {
  if (valor.trim() === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

// ─── Toggle y DELETE de una fecha con ventas de la página web (C7 / C11) ──────────────────────────────────
type RespuestaAccionFecha = { success?: boolean; message?: string; avisos?: string[] }
type ResultadoAccionFecha =
  | { estado: 'ok'; data: RespuestaAccionFecha }
  | { estado: 'cancelado' }
  | { estado: 'error'; mensaje: string }

/**
 * PATCH toggle o DELETE de una fecha por el proxy del panel. Con compradores web el back responde 409
 * `requiere_confirmacion` (nada cambia): se pregunta con su `mensaje` y, si se acepta, se reintenta con
 * `?confirmar=true` (entonces se les manda el correo de cancelación y vienen `avisos`).
 */
async function accionFechaConConfirmacion(url: string, method: 'PATCH' | 'DELETE'): Promise<ResultadoAccionFecha> {
  const pedir = async (confirmar: boolean) => {
    const res = await fetch(confirmar ? `${url}?confirmar=true` : url, { method })
    const data: unknown = await res.json().catch(() => null)
    return { res, data }
  }
  let { res, data } = await pedir(false)
  if (res.status === 409) {
    const detalle =
      typeof data === 'object' && data !== null && 'detail' in data ? (data as { detail: unknown }).detail : null
    if (esRequiereConfirmacion(detalle)) {
      if (!window.confirm(detalle.mensaje)) return { estado: 'cancelado' }
      ;({ res, data } = await pedir(true))
    }
  }
  const cuerpo = (data ?? {}) as RespuestaAccionFecha
  if (res.ok && cuerpo.success) return { estado: 'ok', data: cuerpo }
  return { estado: 'error', mensaje: extraerMensajeError(data, res.status) }
}

/** El formulario del modal Editar fecha: todo texto, como lo dan los inputs. */
interface FormEditarFecha {
  fecha: string
  horaInicio: string
  horaFin: string
  /** Vacío = sin tope (se manda CAPACIDAD_SIN_TOPE). */
  cupo: string
  /** Vacío = el precio de la experiencia (se manda null). */
  precio: string
  notas: string
  motivo: string
}

function formDeEvento(ev: EventoExperiencia): FormEditarFecha {
  return {
    fecha: ev.fecha_evento,
    horaInicio: horaCorta(ev.hora_inicio),
    horaFin: horaCorta(ev.hora_fin),
    cupo: sinTope(ev.capacidad_maxima) ? '' : String(ev.capacidad_maxima),
    precio: ev.precio_base == null ? '' : String(ev.precio_base),
    notas: ev.notas_internas ?? '',
    motivo: '',
  }
}

/** Cambió el día o la hora de inicio: con lugares vendidos pide confirmación y motivo (D7). */
function mueveLaFecha(ev: EventoExperiencia, f: FormEditarFecha): boolean {
  return f.fecha !== ev.fecha_evento || f.horaInicio !== horaCorta(ev.hora_inicio)
}

/** Arma el PATCH con SOLO lo que cambió respecto a lo guardado, o el error de captura. */
function payloadEditarFecha(
  ev: EventoExperiencia,
  f: FormEditarFecha,
): { payload: EditarFechaPayload } | { error: string } {
  if (!f.fecha || !f.horaInicio) return { error: 'Elige la fecha y la hora de inicio.' }
  const payload: EditarFechaPayload = {}
  if (f.fecha !== ev.fecha_evento) payload.fecha_evento = f.fecha
  if (f.horaInicio !== horaCorta(ev.hora_inicio)) payload.hora_inicio = f.horaInicio
  // Si solo cambia el inicio, el fin NO se manda: el back lo mueve con la misma duración
  if (f.horaFin !== horaCorta(ev.hora_fin)) payload.hora_fin = f.horaFin || null

  const cupoTexto = f.cupo.trim()
  let cupo = CAPACIDAD_SIN_TOPE
  if (cupoTexto !== '') {
    const n = Number(cupoTexto)
    if (!Number.isInteger(n) || n < 1) {
      return { error: 'El cupo debe ser un número entero mayor que 0 (vacío = sin tope).' }
    }
    if (n > CAPACIDAD_SIN_TOPE) {
      return { error: 'Ese cupo es demasiado grande: deja el campo vacío para no poner tope.' }
    }
    cupo = n
  }
  // Una fecha sin cupo definido (null) guardada con el campo vacío queda sin tope
  if (cupo !== ev.capacidad_maxima) payload.capacidad_maxima = cupo

  const precioTexto = f.precio.trim()
  let precio: number | null = null
  if (precioTexto !== '') {
    const p = Number(precioTexto)
    if (!Number.isFinite(p) || p < 0) return { error: 'El precio no puede ser negativo.' }
    precio = p
  }
  if (precio !== ev.precio_base) payload.precio_base = precio

  if (f.notas !== (ev.notas_internas ?? '')) payload.notas_internas = f.notas.trim() ? f.notas : null

  const motivo = f.motivo.trim()
  if (motivo && mueveLaFecha(ev, f) && ev.capacidad_ocupada > 0) payload.motivo = motivo
  return { payload }
}

type RespuestaPatchFecha =
  | { ok: true; data: EditarFechaResponse }
  | { ok: false; status: number; detail: unknown; mensaje: string }

/** PATCH por el proxy del panel (inyecta el JWT). Lanza solo si no hubo respuesta (red). */
async function patchFecha(eventoId: string, payload: EditarFechaPayload): Promise<RespuestaPatchFecha> {
  const res = await fetch(`/api/experiencias-admin/eventos/${encodeURIComponent(eventoId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data: unknown = await res.json().catch(() => null)
  if (res.ok) return { ok: true, data: data as EditarFechaResponse }
  const detail =
    typeof data === 'object' && data !== null && 'detail' in data
      ? (data as { detail: unknown }).detail
      : null
  return { ok: false, status: res.status, detail, mensaje: extraerMensajeError(data, res.status) }
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
  const [eventos, setEventos] = useState<EventoExperiencia[]>([])
  const [loadingEventos, setLoadingEventos] = useState(false)

  // Modal «Editar fecha» (EV3)
  const [editandoFecha, setEditandoFecha] = useState<EventoExperiencia | null>(null)
  const [formFecha, setFormFecha] = useState<FormEditarFecha | null>(null)
  const [guardandoFecha, setGuardandoFecha] = useState(false)
  const [errorFecha, setErrorFecha] = useState<string | null>(null)

  const [notificacion, setNotificacion] = useState<Notificacion | null>(null)
  // Los avisos de las fechas son largos: más tiempo para leerlos, y una notificación nueva
  // no se borra con el temporizador de la anterior.
  const notificacionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_horas: 3,
    precio_por_persona: 0,
    precio_persona_adicional: 0,
    personas_incluidas: 9,
    // NI1: se capturan aquí; lo que se manda sale de reglaNinoDelForm() (apagado = 4 null)
    precio_nino: null as number | null,
    edad_maxima_nino: null as number | null,
    tipo_precio_nino: null as TipoPrecioNino | null,
    porcentaje_nino: null as number | null,
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
  // NI1: error de captura de la regla de niño (se muestra dentro del recuadro)
  const [errorNino, setErrorNino] = useState<string | null>(null)

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
  // "Personas incluidas" es regla de las reservas privadas; las publicas se cobran por persona
  const esPrivada = tipoExperiencia === 'EXPERIENCIAS PRIVADAS'
  // NV1 / D6: «Visible en la web» solo existe para las fechas de experiencias públicas
  const esPublica = tipoExperiencia === 'EXPERIENCIAS PUBLICAS'

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
        mostrarNotificacion('error', data.detail || data.message || 'Error al cambiar estado')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCrear = async () => {
    const errorRegla = validarReglaNino(formData)
    setErrorNino(errorRegla)
    if (errorRegla) {
      mostrarNotificacion('error', errorRegla)
      return
    }
    setLoadingAction('crear')
    try {
      const payload = {
        ...formData,
        ...reglaNinoDelForm(formData),
        tipo_experiencia: tipoExperiencia,
        incluye: formData.incluye.filter(i => i.trim() !== ''),
        requisitos: formData.requisitos.filter(r => r.trim() !== ''),
        informacion_importante: formData.informacion_importante.filter(i => i.trim() !== ''),
        coordenadas: formData.coordenadas || null,
        temporada: formData.temporada || null,
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
        // 400 de la regla de niño (C6) o 422 de Pydantic: siempre como texto
        mostrarNotificacion('error', extraerMensajeError(data, res.status))
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleEditar = async () => {
    if (!selectedExperiencia) return
    const errorRegla = validarReglaNino(formData)
    setErrorNino(errorRegla)
    if (errorRegla) {
      mostrarNotificacion('error', errorRegla)
      return
    }
    setLoadingAction('editar')
    try {
      const payload = {
        ...formData,
        ...reglaNinoDelForm(formData),
        incluye: formData.incluye.filter(i => i.trim() !== ''),
        requisitos: formData.requisitos.filter(r => r.trim() !== ''),
        informacion_importante: formData.informacion_importante.filter(i => i.trim() !== ''),
        coordenadas: formData.coordenadas || null,
        temporada: formData.temporada || null,
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
        // 400 de la regla de niño (C6) o 422 de Pydantic: siempre como texto
        mostrarNotificacion('error', extraerMensajeError(data, res.status))
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
        // FastAPI responde los errores en `detail`, no en `message`
        mostrarNotificacion('error', data.detail || data.message || 'Error al eliminar')
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

  // C7: desactivar una fecha con compradores web pide confirmación (409) y trae `avisos` (correo de cancelación)
  const handleToggleEvento = async (eventoId: string) => {
    try {
      const r = await accionFechaConConfirmacion(
        `/api/experiencias-admin/eventos/${encodeURIComponent(eventoId)}/toggle`,
        'PATCH',
      )
      if (r.estado === 'cancelado') {
        mostrarNotificacion('info', 'No se cambió la fecha.')
        return
      }
      if (r.estado === 'error') {
        mostrarNotificacion('error', r.mensaje)
        return
      }
      avisarResultado(r.data.message || 'Fecha actualizada', r.data.avisos)
      if (selectedExperiencia) fetchEventos(selectedExperiencia.id)
    } catch {
      mostrarNotificacion('error', 'Error de conexión')
    }
  }

  // C11: eliminar (cancelar) una fecha con compradores web también pide confirmación (409) y trae `avisos`
  const handleEliminarEvento = async (eventoId: string) => {
    if (!confirm('¿Eliminar este evento?')) return
    try {
      const r = await accionFechaConConfirmacion(
        `/api/experiencias-admin/eventos/${encodeURIComponent(eventoId)}`,
        'DELETE',
      )
      if (r.estado === 'cancelado') {
        mostrarNotificacion('info', 'No se eliminó la fecha.')
        return
      }
      if (r.estado === 'error') {
        mostrarNotificacion('error', r.mensaje)
        return
      }
      avisarResultado(r.data.message || 'Fecha eliminada', r.data.avisos)
      if (selectedExperiencia) fetchEventos(selectedExperiencia.id)
    } catch {
      mostrarNotificacion('error', 'Error de conexión')
    }
  }

  // ─── Editar fecha y «Visible en la web» (EV3 + NV1) ───
  const aplicarEventoActualizado = (ev: EventoExperiencia | null | undefined) => {
    if (!ev?.id) {
      if (selectedExperiencia) fetchEventos(selectedExperiencia.id)
      return
    }
    setEventos((prev) => prev.map((e) => (e.id === ev.id ? ev : e)))
  }

  /** avisos[] del back: uno va en la notificación; dos o más, en un alert para que no se pierdan. */
  const avisarResultado = (titulo: string, avisos: string[] | null | undefined) => {
    const lista = Array.isArray(avisos) ? avisos.filter(Boolean) : []
    if (lista.length >= 2) {
      window.alert(lista.join('\n\n'))
      mostrarNotificacion('success', titulo)
    } else if (lista.length === 1) {
      mostrarNotificacion('info', `${titulo}. ${lista[0]}`)
    } else {
      mostrarNotificacion('success', titulo)
    }
  }

  const abrirEditarFecha = (ev: EventoExperiencia) => {
    setEditandoFecha(ev)
    setFormFecha(formDeEvento(ev))
    setErrorFecha(null)
  }

  const cerrarEditarFecha = () => {
    if (guardandoFecha) return
    setEditandoFecha(null)
    setFormFecha(null)
    setErrorFecha(null)
  }

  const guardarFecha = async () => {
    if (!editandoFecha || !formFecha) return
    const armado = payloadEditarFecha(editandoFecha, formFecha)
    if ('error' in armado) {
      setErrorFecha(armado.error)
      return
    }
    if (Object.keys(armado.payload).length === 0) {
      setErrorFecha('No cambiaste nada.')
      return
    }
    setGuardandoFecha(true)
    setErrorFecha(null)
    try {
      let resp = await patchFecha(editandoFecha.id, armado.payload)
      // D7: mover día u hora con lugares vendidos pide confirmación (409) y se reenvía
      if (!resp.ok && resp.status === 409) {
        const detalle = resp.detail
        if (esRequiereConfirmacion(detalle)) {
          if (!window.confirm(`${detalle.mensaje} ¿Moverla?`)) {
            setErrorFecha('No se movió la fecha.')
            return
          }
          resp = await patchFecha(editandoFecha.id, {
            ...armado.payload,
            confirmar_con_vendidos: true,
          })
        }
      }
      if (!resp.ok) {
        setErrorFecha(resp.mensaje)
        return
      }
      aplicarEventoActualizado(resp.data.evento)
      setEditandoFecha(null)
      setFormFecha(null)
      avisarResultado('Fecha actualizada', resp.data.avisos)
    } catch {
      setErrorFecha('Error de conexión. Reintenta.')
    } finally {
      setGuardandoFecha(false)
    }
  }

  // D6: publicar avisa ANTES del PATCH que el pago en la web falla; ocultar no pregunta
  const handleVisibleEvento = async (evento: EventoExperiencia) => {
    const publicar = !evento.visible_publico
    if (publicar && !window.confirm(AVISO_PUBLICAR)) return
    setLoadingAction(`visible-${evento.id}`)
    try {
      const resp = await patchFecha(evento.id, { visible_publico: publicar })
      if (!resp.ok) {
        mostrarNotificacion('error', resp.mensaje)
        return
      }
      aplicarEventoActualizado(resp.data.evento)
      avisarResultado(publicar ? 'Fecha publicada en la web' : 'Fecha oculta de la web', resp.data.avisos)
    } catch {
      mostrarNotificacion('error', 'Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  const mostrarNotificacion = (tipo: 'success' | 'error' | 'info', mensaje: string) => {
    setNotificacion({ tipo, mensaje })
    if (notificacionTimer.current) clearTimeout(notificacionTimer.current)
    notificacionTimer.current = setTimeout(() => setNotificacion(null), Math.max(4000, mensaje.length * 60))
  }

  useEffect(
    () => () => {
      if (notificacionTimer.current) clearTimeout(notificacionTimer.current)
    },
    [],
  )

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_horas: 3,
      precio_por_persona: 0,
      precio_persona_adicional: 0,
      personas_incluidas: 9,
      precio_nino: null,
      edad_maxima_nino: null,
      tipo_precio_nino: null,
      porcentaje_nino: null,
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
    setErrorNino(null)
  }

  const abrirModalEditar = (exp: Experiencia) => {
    setSelectedExperiencia(exp)
    setFormData({
      nombre: exp.nombre,
      descripcion: exp.descripcion,
      duracion_horas: exp.duracion_horas,
      precio_por_persona: exp.precio_por_persona,
      precio_persona_adicional: exp.precio_persona_adicional || 0,
      personas_incluidas: exp.personas_incluidas || 9,
      // NI1: lo guardado (antes se forzaba 12 y el back lo descartaba)
      precio_nino: exp.precio_nino ?? null,
      edad_maxima_nino: exp.edad_maxima_nino ?? null,
      tipo_precio_nino: exp.tipo_precio_nino ?? null,
      porcentaje_nino: exp.porcentaje_nino ?? null,
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
      horarios_disponibles: (exp.horarios_disponibles || []).map((h) => horaCorta(h))
    })
    setActiveTab('info')
    setErrorNino(null)
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
        // z por encima de los modales (1100 / 1200): los avisos de la pestaña Eventos se veían detrás
        <div
          data-testid="exp-notificacion"
          data-tipo={notificacion.tipo}
          role="status"
          className={`fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-[1300] flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg ${
          notificacion.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          notificacion.tipo === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {notificacion.tipo === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" /> :
           <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />}
          <span className="flex-1 text-sm">{notificacion.mensaje}</span>
          <button type="button" onClick={() => setNotificacion(null)} className="ml-2 shrink-0" aria-label="Cerrar aviso">
            <X className="h-4 w-4" aria-hidden="true" />
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
                      {esPrivada && (
                        <p className="text-xs font-normal text-gray-500">1-{exp.personas_incluidas || 9} personas</p>
                      )}
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {esPrivada ? `Precio base 1-${formData.personas_incluidas} px (MXN) *` : 'Precio por persona (MXN) *'}
                      </label>
                      <input
                        type="number"
                        value={formData.precio_por_persona}
                        onChange={(e) => setFormData(prev => ({ ...prev, precio_por_persona: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                      />
                    </div>
                    
                    {esPrivada && (
                      <div>
                        <label htmlFor="exp-personas-incluidas" className="block text-sm font-medium mb-1">Personas incluidas *</label>
                        <input
                          id="exp-personas-incluidas"
                          type="number"
                          value={formData.personas_incluidas}
                          onChange={(e) => setFormData(prev => ({ ...prev, personas_incluidas: Math.max(1, parseInt(e.target.value) || 1) }))}
                          min="1"
                          aria-describedby="exp-personas-incluidas-ayuda"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                        />
                        <p id="exp-personas-incluidas-ayuda" className="text-xs text-gray-500 mt-1">
                          Las que cubre el precio base. También es el mínimo al reservar.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {esPrivada ? `Persona adicional (desde la ${formData.personas_incluidas + 1})` : 'Persona Adicional'}
                      </label>
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

                  {/* NI1 (Fase 4a): regla de niño. «Cobrar distinto a los niños» = tipo_precio_nino; apagado manda los 4 campos null */}
                  {(() => {
                    const ninoActiva = formData.tipo_precio_nino != null
                    const precioNinoLegado =
                      showModal === 'editar' &&
                      selectedExperiencia?.tipo_precio_nino == null &&
                      selectedExperiencia?.precio_nino != null
                        ? selectedExperiencia.precio_nino
                        : null
                    const cambiarRegla = (cambios: Partial<ReglaNino>) => {
                      setFormData((prev) => ({ ...prev, ...cambios }))
                      setErrorNino(null)
                    }
                    return (
                      <div
                        data-testid="exp-nino"
                        className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span id="exp-nino-activa-etiqueta" className="text-sm font-medium text-blue-800">
                            Cobrar distinto a los niños
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ninoActiva}
                            aria-labelledby="exp-nino-activa-etiqueta"
                            data-testid="exp-nino-activa"
                            onClick={() =>
                              cambiarRegla({ tipo_precio_nino: ninoActiva ? null : 'porcentaje' })
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                              ninoActiva ? (colorTema === 'green' ? 'bg-green-500' : 'bg-purple-500') : 'bg-gray-300'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                ninoActiva ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {!ninoActiva ? (
                          <p className="text-xs text-gray-600">Apagado: los niños pagan como adulto.</p>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label htmlFor="exp-nino-edad" className="block text-xs text-gray-600 mb-1">
                                  Edad máxima (años)
                                </label>
                                <input
                                  id="exp-nino-edad"
                                  data-testid="exp-nino-edad"
                                  type="number"
                                  inputMode="numeric"
                                  min={EDAD_NINO_MIN}
                                  max={EDAD_NINO_MAX}
                                  step={1}
                                  value={formData.edad_maxima_nino ?? ''}
                                  onChange={(e) => cambiarRegla({ edad_maxima_nino: numeroONull(e.target.value) })}
                                  placeholder="Ej: 12"
                                  className={`w-full min-w-0 px-4 py-2 border rounded-lg bg-white focus:ring-2 ${theme.ring}`}
                                />
                              </div>
                              <fieldset className="min-w-0">
                                <legend className="block text-xs text-gray-600 mb-1">Cómo se cobra</legend>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 py-2">
                                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                      type="radio"
                                      name="exp-nino-tipo"
                                      data-testid="exp-nino-tipo-porcentaje"
                                      checked={formData.tipo_precio_nino === 'porcentaje'}
                                      onChange={() => cambiarRegla({ tipo_precio_nino: 'porcentaje' })}
                                    />
                                    {/* Privadas (Fase 4b, C11): el % es del precio por persona ADICIONAL */}
                                    {esPrivada ? '% del precio por persona adicional' : '% del precio de adulto'}
                                  </label>
                                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                      type="radio"
                                      name="exp-nino-tipo"
                                      data-testid="exp-nino-tipo-monto"
                                      checked={formData.tipo_precio_nino === 'monto'}
                                      onChange={() => cambiarRegla({ tipo_precio_nino: 'monto' })}
                                    />
                                    Monto fijo
                                  </label>
                                </div>
                              </fieldset>
                              {formData.tipo_precio_nino === 'porcentaje' ? (
                                <div>
                                  <label htmlFor="exp-nino-porcentaje" className="block text-xs text-gray-600 mb-1">
                                    {esPrivada
                                      ? 'Porcentaje del precio por persona adicional (%)'
                                      : 'Porcentaje del precio de adulto (%)'}
                                  </label>
                                  <input
                                    id="exp-nino-porcentaje"
                                    data-testid="exp-nino-porcentaje"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    max={100}
                                    step="0.01"
                                    value={formData.porcentaje_nino ?? ''}
                                    onChange={(e) => cambiarRegla({ porcentaje_nino: numeroONull(e.target.value) })}
                                    placeholder="Ej: 50"
                                    className={`w-full min-w-0 px-4 py-2 border rounded-lg bg-white focus:ring-2 ${theme.ring}`}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label htmlFor="exp-nino-monto" className="block text-xs text-gray-600 mb-1">
                                    Precio por niño (MXN)
                                  </label>
                                  <input
                                    id="exp-nino-monto"
                                    data-testid="exp-nino-monto"
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step="0.01"
                                    value={formData.precio_nino ?? ''}
                                    onChange={(e) => cambiarRegla({ precio_nino: numeroONull(e.target.value) })}
                                    placeholder="Ej: 350"
                                    className={`w-full min-w-0 px-4 py-2 border rounded-lg bg-white focus:ring-2 ${theme.ring}`}
                                  />
                                </div>
                              )}
                            </div>
                            <p data-testid="exp-nino-preview" aria-live="polite" className="text-sm font-medium text-blue-900">
                              {esPrivada
                                ? vistaPreviaNino(formData, formData.precio_persona_adicional, true)
                                : vistaPreviaNino(formData, formData.precio_por_persona)}
                            </p>
                            {/* Las fechas con precio propio solo existen en públicas (Fase 4b, C11) */}
                            {!esPrivada && (
                              <p className="text-xs text-gray-500">
                                Si una fecha tiene precio propio, el precio del niño se calcula sobre el de esa fecha.
                              </p>
                            )}
                          </>
                        )}

                        {errorNino && (
                          <p
                            data-testid="exp-nino-error"
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                          >
                            {errorNino}
                          </p>
                        )}
                        {!ninoActiva && precioNinoLegado != null && (
                          <p data-testid="exp-nino-legado" className="text-xs text-amber-800">
                            Esta experiencia tenía guardado un precio de niño de {formatMXN(precioNinoLegado)} sin edad
                            máxima, así que no se cobraba. Si guardas con el interruptor apagado, se borra; para usarlo,
                            enciéndelo y elige «Monto fijo».
                          </p>
                        )}
                        {esPrivada && (
                          <p data-testid="exp-nino-privadas" className="text-xs text-gray-600">
                            En las reservas privadas, los niños llenan primero los lugares adicionales y ahí pagan
                            este precio; dentro de las {formData.personas_incluidas} incluidas el precio del grupo no
                            cambia.
                          </p>
                        )}
                      </div>
                    )
                  })()}
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
                    {eventos.map((evento) => {
                      // Una fecha cancelada no se reactiva ni se edita (el back responde 400)
                      const cancelada = evento.estado === 'cancelado'
                      const cambiandoVisible = loadingAction === `visible-${evento.id}`
                      return (
                      <div
                        key={evento.id}
                        data-testid="exp-evento-fila"
                        className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border ${
                          evento.estado === 'activo' ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {!cancelada && (
                          <button
                            type="button"
                            onClick={() => handleToggleEvento(evento.id)}
                            aria-label={evento.estado === 'activo' ? 'Desactivar esta fecha' : 'Activar esta fecha'}
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
                          )}

                          <div className="min-w-0">
                            <p className="font-medium text-sm" data-testid="exp-evento-fecha">
                              {formatFechaMexico(evento.fecha_evento, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500" data-testid="exp-evento-horario">
                              {horario(evento.hora_inicio, evento.hora_fin)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="text-right" data-testid="exp-evento-cupo">
                            {sinTope(evento.capacidad_maxima) ? (
                              <>
                                <p className="text-sm font-medium">{evento.capacidad_ocupada} reservados</p>
                                <p className="text-xs text-gray-500 italic">sin tope</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium">
                                  {evento.capacidad_ocupada}/{evento.capacidad_maxima}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {evento.lugares_disponibles} disponibles
                                </p>
                              </>
                            )}
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

                          {/* NV1 / D6: solo las fechas de experiencias públicas se ven en la web */}
                          {esPublica && (
                            <div className="flex items-center gap-2">
                              <span
                                data-testid="exp-evento-visible-chip"
                                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                  evento.visible_publico
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {evento.visible_publico ? 'En la web' : 'Oculta'}
                              </span>
                              {!cancelada && (
                                <button
                                  type="button"
                                  data-testid="exp-evento-visible"
                                  aria-pressed={evento.visible_publico}
                                  aria-label="Visible en la web"
                                  aria-busy={cambiandoVisible}
                                  title={evento.visible_publico ? 'Ocultar de la web' : 'Mostrar en la web'}
                                  onClick={() => handleVisibleEvento(evento)}
                                  disabled={cambiandoVisible}
                                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                                    evento.visible_publico ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                      evento.visible_publico ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          )}

                          {!cancelada && (
                            <button
                              type="button"
                              data-testid="exp-evento-editar"
                              onClick={() => abrirEditarFecha(evento)}
                              aria-label="Editar fecha"
                              title="Editar fecha"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEliminarEvento(evento.id)}
                            aria-label="Eliminar esta fecha"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      )
                    })}
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
                Se quitará <strong>{selectedExperiencia.nombre}</strong> del panel y de la página.
                {' '}Si ya tiene reservas, leads o códigos QR, su historial se conserva para los reportes.
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
                  min={hoyMexico()}
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

      {/* Modal Editar fecha (EV3): manda solo lo que cambió; D7 con vendidos pide confirmación */}
      {editandoFecha && formFecha && (() => {
        const vendidos = editandoFecha.capacidad_ocupada
        const pideMotivo = vendidos > 0 && mueveLaFecha(editandoFecha, formFecha)
        const armado = payloadEditarFecha(editandoFecha, formFecha)
        const hayCambios = 'error' in armado || Object.keys(armado.payload).length > 0
        const finSeMueve =
          !!editandoFecha.hora_fin &&
          formFecha.horaInicio !== horaCorta(editandoFecha.hora_inicio) &&
          formFecha.horaFin === horaCorta(editandoFecha.hora_fin)
        const cambiar = (campo: keyof FormEditarFecha, valor: string) => {
          setFormFecha((prev) => (prev ? { ...prev, [campo]: valor } : prev))
          setErrorFecha(null)
        }
        return (
          <div
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-[1200] px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-fecha-titulo"
          >
            <div
              data-testid="modal-editar-fecha"
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col"
            >
              <div className="shrink-0 border-b px-6 py-4 flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 id="editar-fecha-titulo" className="font-sans text-lg font-semibold text-gray-900 mb-0">
                    Editar fecha
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedExperiencia?.nombre ? `${selectedExperiencia.nombre} · ` : ''}
                    {formatFechaMexico(editandoFecha.fecha_evento, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarEditarFecha}
                  aria-label="Cerrar editar fecha"
                  className="p-1 rounded-lg hover:bg-gray-100 shrink-0"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                {errorFecha && (
                  <p
                    data-testid="editar-fecha-error"
                    role="alert"
                    className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3"
                  >
                    {errorFecha}
                  </p>
                )}

                <div>
                  <label htmlFor="editar-fecha-fecha" className="block text-sm font-medium mb-1">Fecha *</label>
                  <input
                    id="editar-fecha-fecha"
                    data-testid="editar-fecha-fecha"
                    type="date"
                    value={formFecha.fecha}
                    min={hoyMexico()}
                    onChange={(e) => cambiar('fecha', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editar-fecha-hora-inicio" className="block text-sm font-medium mb-1">Hora inicio *</label>
                    <input
                      id="editar-fecha-hora-inicio"
                      data-testid="editar-fecha-hora-inicio"
                      type="time"
                      value={formFecha.horaInicio}
                      onChange={(e) => cambiar('horaInicio', e.target.value)}
                      className={`w-full min-w-0 px-3 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="editar-fecha-hora-fin" className="block text-sm font-medium mb-1">Hora fin</label>
                    <input
                      id="editar-fecha-hora-fin"
                      data-testid="editar-fecha-hora-fin"
                      type="time"
                      value={formFecha.horaFin}
                      onChange={(e) => cambiar('horaFin', e.target.value)}
                      aria-describedby={finSeMueve ? 'editar-fecha-fin-ayuda' : undefined}
                      className={`w-full min-w-0 px-3 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                    />
                  </div>
                </div>
                {finSeMueve && (
                  <p id="editar-fecha-fin-ayuda" data-testid="editar-fecha-fin-ayuda" className="text-xs text-gray-500 -mt-2">
                    Si no cambias la hora de fin, se mueve con el inicio (misma duración).
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editar-fecha-cupo" className="block text-sm font-medium mb-1">Cupo</label>
                    <input
                      id="editar-fecha-cupo"
                      data-testid="editar-fecha-cupo"
                      type="number"
                      inputMode="numeric"
                      min={Math.max(1, vendidos)}
                      step={1}
                      value={formFecha.cupo}
                      onChange={(e) => cambiar('cupo', e.target.value)}
                      placeholder="Sin tope"
                      aria-describedby="editar-fecha-cupo-ayuda"
                      className={`w-full min-w-0 px-3 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                    />
                    <p id="editar-fecha-cupo-ayuda" className="text-xs text-gray-500 mt-1">
                      Vendidos: {vendidos}. Vacío = sin tope.
                      {editandoFecha.capacidad_maxima == null && ' Esta fecha no tenía cupo definido: al guardar queda sin tope.'}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="editar-fecha-precio" className="block text-sm font-medium mb-1">Precio</label>
                    <input
                      id="editar-fecha-precio"
                      data-testid="editar-fecha-precio"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={formFecha.precio}
                      onChange={(e) => cambiar('precio', e.target.value)}
                      placeholder="El de la experiencia"
                      aria-describedby="editar-fecha-precio-ayuda"
                      className={`w-full min-w-0 px-3 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                    />
                    <p id="editar-fecha-precio-ayuda" className="text-xs text-gray-500 mt-1">
                      Vacío = el precio de la experiencia
                      {selectedExperiencia ? ` ($${selectedExperiencia.precio_por_persona.toLocaleString()})` : ''}.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="editar-fecha-notas" className="block text-sm font-medium mb-1">Notas internas</label>
                  <textarea
                    id="editar-fecha-notas"
                    data-testid="editar-fecha-notas"
                    value={formFecha.notas}
                    onChange={(e) => cambiar('notas', e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${theme.ring}`}
                    placeholder="Solo visibles para el equipo"
                  />
                </div>

                {pideMotivo && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <label htmlFor="editar-fecha-motivo" className="block text-sm font-medium mb-1 text-amber-900">
                      Motivo del cambio
                    </label>
                    <textarea
                      id="editar-fecha-motivo"
                      data-testid="editar-fecha-motivo"
                      value={formFecha.motivo}
                      onChange={(e) => cambiar('motivo', e.target.value)}
                      rows={2}
                      maxLength={500}
                      aria-describedby="editar-fecha-motivo-ayuda"
                      className={`w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 ${theme.ring}`}
                    />
                    <p id="editar-fecha-motivo-ayuda" className="text-xs text-amber-900 mt-1">
                      Esta fecha tiene {vendidos} {vendidos === 1 ? 'lugar vendido' : 'lugares vendidos'}. El motivo queda
                      en las notas de la fecha. Al guardar verás si se les avisó por correo a los compradores de la página
                      web; a los de otros canales avísales tú.
                    </p>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  data-testid="editar-fecha-cancelar"
                  onClick={cerrarEditarFecha}
                  disabled={guardandoFecha}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  data-testid="editar-fecha-guardar"
                  onClick={guardarFecha}
                  disabled={guardandoFecha || !hayCambios}
                  title={hayCambios ? undefined : 'No hay cambios que guardar'}
                  className={`px-4 py-2 ${theme.primary} text-white rounded-lg disabled:opacity-50 flex items-center gap-2`}
                >
                  {guardandoFecha && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
