'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Gift,
  Info,
  Loader2,
  Mail,
  Plus,
  StickyNote,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaHoraMexico, formatFechaMexico, hoyMexico } from '@/lib/dates'
import type { ItemCatalogo, ListaCatalogo, TipoCatalogo } from '@/types/planeacion'
import { TIPO_LABELS } from '@/types/plantillas-email'
import { horaCorta } from '@/app/admin/eventos/components/fechas'
import {
  useVendedoras,
  vendedoraFueraDeLista,
  type EstadoVendedoras,
} from '@/hooks/useVendedoras'
import { extraerMensajeError } from './errores'
import LineaCotizacion, { textoAdultosAdicionales, textoNinosAdicionales } from './LineaCotizacion'
import {
  formatMXN,
  calcularCotizacion,
  initialWizardData,
  MOTIVO_NO_ENVIO_TEXTO,
  puedeMarcarRealizada,
  redondearCentavos,
  textoCorreo,
  textoCupon,
  type CancelarResponse,
  type Comunicacion,
  type ComunicacionesResponse,
  type CuponEvaluado,
  type ExperienciaCatalogo,
  type IdiomaCliente,
  type ManifestInvitado,
  type MotivoNoEnvio,
  type PagoManualResponse,
  type PagoReserva,
  type Personal,
  type ReagendarResponse,
  type Reserva,
  type ResultadoGuias,
} from '@/types/reservas'
import BadgeEstado from '../../components/BadgeEstado'
import BadgeEstadoPago from '../../components/BadgeEstadoPago'
import MultiSelectGuias from '../../components/MultiSelectGuias'
import ModalLinkMP from './ModalLinkMP'
import ModalPagoManual from './ModalPagoManual'
import ModalReagendar from './ModalReagendar'

interface ModalDetalleReservaProps {
  reservaId: string
  onClose: () => void
  onUpdated: () => void
}

type TabKey =
  | 'datos'
  | 'addons'
  | 'manifest'
  | 'pagos'
  | 'comunicaciones'
  | 'auditoria'
  | 'acciones'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'datos', label: 'Datos' },
  { key: 'addons', label: 'Add-ons' },
  { key: 'manifest', label: 'Manifest' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'comunicaciones', label: 'Comunicaciones' },
  { key: 'auditoria', label: 'Auditoria' },
  { key: 'acciones', label: 'Acciones' },
]

interface FormDatos {
  fecha: string
  horaInicio: string
  horaFin: string
  invMin: number
  invMax: number
  chinampa: string
  idioma: IdiomaCliente
  vendedorId: string
  nombreCliente: string
  notasInternas: string
  notasAlergias: string
  notasCliente: string
  // PS1 (planeación semanal)
  contacto: string
  fuenteId: string
  cocinaId: string
  // De los invitados, cuántos son niños (pagan y cuentan; el precio no cambia)
  ninos: number
  // Aparte de los invitados: no se cobra ni suma platos/sillas
  staff: number
  codigoPromocional: string
  cortesia: boolean
}

// Catálogos editables de /admin/catalogos (solo los activos se ofrecen).
// null = todavía no carga o falló: no se puede decir que lo guardado esté archivado.
interface CatalogosReserva {
  fuentes: ItemCatalogo[] | null
  chinampas: ItemCatalogo[] | null
  cocinas: ItemCatalogo[] | null
}

const CATALOGOS_VACIOS: CatalogosReserva = { fuentes: null, chinampas: null, cocinas: null }

interface ToastState {
  msg: string
  type: 'success' | 'error'
}

// ─── Fase 2 (30-sep): lo que el panel dice de correos y cobros ─────────────────────────────

/** D15: el texto que se ve ANTES de cancelar (y se repite en el confirm). */
const AVISO_PAGO_EN_CAMINO =
  'Hay un pago de MercadoPago en camino (OXXO o en revisión). Puedes cancelar: si se acredita después, quedará registrado con una nota para devolverlo.'

/** Pagos reales de MercadoPago que siguen sin acreditarse (OXXO, en revisión). */
function pagosEnCamino(pagos: PagoReserva[]): PagoReserva[] {
  return pagos.filter(
    (p) => !!p.mp_payment_id && (p.mp_status === 'pending' || p.mp_status === 'in_process'),
  )
}

/** Links de pago generados que nadie ha cobrado (se vencen al cancelar o con un pago manual). */
function linksSinCobrar(pagos: PagoReserva[]): PagoReserva[] {
  return pagos.filter((p) => p.mp_status === 'pending' && !p.mp_payment_id)
}

function textoLinksPorVencer(n: number): string {
  return n === 1
    ? 'Se vencerá 1 link de pago sin cobrar.'
    : `Se vencerán ${n} links de pago sin cobrar.`
}

function textoLinksVencidos(n: number): string {
  return n === 1 ? 'Se venció 1 link de pago sin cobrar.' : `Se vencieron ${n} links de pago sin cobrar.`
}

/** RG1: qué pasó con el aviso a los guías (el motivo `sin_correo` aquí es de los guías, no del cliente). */
function textoGuias(g: ResultadoGuias | null | undefined): string {
  if (!g) return ''
  if (g.encolado) {
    const avisados =
      g.con_correo === 1
        ? 'Se está avisando por correo al guía con correo.'
        : `Se está avisando por correo a ${g.con_correo} guías.`
    const faltan =
      g.sin_correo === 1
        ? ' 1 guía no tiene correo: avísale tú.'
        : g.sin_correo > 1
          ? ` ${g.sin_correo} guías no tienen correo: avísales tú.`
          : ''
    return avisados + faltan
  }
  if (g.motivo === 'sin_guias' || (g.motivo === 'no_solicitado' && g.con_correo + g.sin_correo === 0)) {
    return 'No hay guías asignados a quienes avisar.'
  }
  if (g.motivo === 'sin_correo' || (g.motivo === 'no_solicitado' && g.con_correo === 0)) {
    return 'No se avisó a los guías: ninguno de los asignados tiene correo (avísales tú).'
  }
  if (g.motivo === 'no_solicitado') return 'No se avisó a los guías (no se pidió): avísales tú.'
  const motivo = g.motivo ? MOTIVO_NO_ENVIO_TEXTO[g.motivo] ?? g.motivo : 'sin motivo'
  return `No se avisó a los guías: ${motivo}.`
}

// ─── R1 (sesión 41): COT1 · reenviar la cotización desde Pagos (contrato R1 §3.5) ────────────

/** POST /api/admin/reservas/{id}/cotizacion-pdf. `encolado`/`motivo` son de R1 (convención de la
 *  Fase 2); las llaves de antes se conservan. `email_enviado` NO dice que salió: solo que se pidió. */
interface CotizacionPdfResponse {
  pdf_url: string
  pdf_path: string
  email_enviado: boolean
  encolado?: boolean
  motivo?: MotivoNoEnvio | null
}

type EstadoReenvioCotizacion =
  | { tipo: 'quieto' }
  | { tipo: 'enviando' }
  | { tipo: 'ok'; texto: string }
  | { tipo: 'error'; mensaje: string }

/** Nunca prometer el correo: con `encolado` se usa textoCorreo(); sin él, no se afirma nada. */
function textoReenvioCotizacion(res: CotizacionPdfResponse): string {
  if (typeof res.encolado === 'boolean') {
    return `Cotización generada. ${textoCorreo({ encolado: res.encolado, motivo: res.motivo ?? null })}`
  }
  return 'Cotización generada. El servidor no dijo si el correo puede salir: revisa la pestaña Comunicaciones.'
}

// ─── Fase 4b (sesión 40): NI1, CP1 y RS1 en el detalle (contrato F2) ───────────────────────

/** Respuesta del PATCH (C5): el detalle + el cupón, solo si se evaluó un código NUEVO. */
type RespuestaEdicion = Reserva & {
  cupon?: CuponEvaluado | null
  /** CUP2 / DR5 (R1, C19): por qué el código NO descontó al marcar o quitar la cortesía (null = nada que avisar). */
  cupon_motivo?: string | null
}

/** Lo que dijo el servidor del último código nuevo que se guardó (`detalle-cupon-estado`). */
interface EstadoCuponGuardado {
  cupon: CuponEvaluado | null
  /** Lo que de verdad descontó en la reserva (`monto_cupon` guardado). */
  monto: number
  /** C19 (CUP2): la frase del servidor; si viene, se muestra en lugar de textoCupon(). */
  motivo: string | null
}

const TEXTO_SIN_REPRECIO =
  'Reserva del Sheet: su precio no se recalcula al cambiar invitados o niños'

/** NI1 (D-c, C11): la ayuda del campo Niños con lo que trae `cotizacion`. */
function textoNinosDetalle(reserva: Reserva): string {
  const cot = reserva.cotizacion
  if (!cot) return 'De los invitados, cuántos son niños.'
  if (!cot.se_reprecia) return 'Reserva del Sheet: el precio no cambia'
  if (Number(cot.precio_nino_adicional) !== Number(cot.precio_adicional_por_persona)) {
    return `Los niños llenan primero los lugares adicionales y ahí pagan ${formatMXN(Number(cot.precio_nino_adicional))} cada uno; dentro de las ${cot.invitados_incluidos} incluidas el precio no cambia.`
  }
  return 'Sin precio de niño: pagan como adulto.'
}

/** Los avisos del back (D4, D15) no se pueden perder en un toast: van en un alert. */
function mostrarAvisos(avisos: string[] | null | undefined) {
  if (Array.isArray(avisos) && avisos.length > 0) window.alert(avisos.join('\n\n'))
}

// Correos de la reserva (GET /comunicaciones): una sola carga para Comunicaciones y Auditoría.
interface EstadoComunicaciones {
  items: Comunicacion[] | null
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
}

function useComunicaciones(reservaId: string, token: string | undefined): EstadoComunicaciones {
  const [items, setItems] = useState<Comunicacion[] | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mismo patrón que fetchReserva: API_URL directo + Bearer. Silencioso: no vacía `items`.
  const recargar = useCallback(async () => {
    if (!token) return
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reservaId}/comunicaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data = (await res.json()) as ComunicacionesResponse
      setItems(data.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los correos')
    } finally {
      setCargando(false)
    }
  }, [token, reservaId])

  return { items, cargando, error, recargar }
}

export default function ModalDetalleReserva({
  reservaId,
  onClose,
  onUpdated,
}: ModalDetalleReservaProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('datos')
  const [toast, setToast] = useState<ToastState | null>(null)

  // Form state (Datos tab)
  const [form, setForm] = useState<FormDatos | null>(null)
  const [selectedGuias, setSelectedGuias] = useState<string[]>([])
  const [savingDatos, setSavingDatos] = useState(false)
  const [savingGuias, setSavingGuias] = useState(false)
  // F2: lo que el servidor dijo del código nuevo al guardar (null = no se evaluó ninguno)
  const [cuponGuardado, setCuponGuardado] = useState<EstadoCuponGuardado | null>(null)

  // Catalogos
  // LD2-a: la misma lista de vendedoras que Leads, el asistente y la tabla
  const vendedorasEstado = useVendedoras(token)
  const [guiasDisponibles, setGuiasDisponibles] = useState<Personal[]>([])
  const [addonsCat, setAddonsCat] = useState<ExperienciaCatalogo[]>([])
  const [catalogos, setCatalogos] = useState<CatalogosReserva>(CATALOGOS_VACIOS)
  const [catalogosError, setCatalogosError] = useState<string | null>(null)

  // Sub-modales
  const [showLinkMP, setShowLinkMP] = useState(false)
  const [showPagoManual, setShowPagoManual] = useState(false)
  const [showReagendar, setShowReagendar] = useState(false)

  // Manifest state
  const [nuevoInvitado, setNuevoInvitado] = useState<ManifestInvitado>({
    nombre: '',
    edad: null,
    idioma: 'es',
    alergias: '',
  })

  // Add-on selector
  const [nuevoAddonId, setNuevoAddonId] = useState('')
  const [nuevoAddonCant, setNuevoAddonCant] = useState(1)

  // C38: actualizar cotizacion cuando el manifest excede los invitados cotizados
  const [savingCotizacion, setSavingCotizacion] = useState(false)

  // SAP
  const [flagSap, setFlagSap] = useState(false)
  const [numeroOvSap, setNumeroOvSap] = useState('')

  // Cancelar
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [procesarReembolso, setProcesarReembolso] = useState(false)
  // CN1: el back manda la plantilla Cancelación (si está activa) solo si se pide
  const [notificarClienteCancel, setNotificarClienteCancel] = useState(true)
  const [cancelando, setCancelando] = useState(false)

  // B6 / D9: «Marcar como realizada»
  const [marcandoRealizada, setMarcandoRealizada] = useState(false)

  // COT1 (R1): «Reenviar cotización» en Pagos
  const [reenvioCotizacion, setReenvioCotizacion] = useState<EstadoReenvioCotizacion>({ tipo: 'quieto' })

  // Correos de la reserva: los comparten las pestañas Comunicaciones y Auditoría (DT1-b)
  const comunicaciones = useComunicaciones(reservaId, token)
  const { recargar: recargarComunicaciones } = comunicaciones
  useEffect(() => {
    // Cada visita a esas pestañas relee en silencio: los correos salen en segundo plano
    if (tab === 'comunicaciones' || tab === 'auditoria') recargarComunicaciones()
  }, [tab, recargarComunicaciones])

  // Toast handler. Los mensajes de Fase 2 son largos (correo, links): más tiempo para leerlos,
  // y un toast nuevo no se borra con el temporizador del anterior.
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), Math.max(3000, msg.length * 60))
  }, [])
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    },
    [],
  )

  const fetchReserva = useCallback(async (silent = false) => {
    if (!token) return
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reservaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = (await res.json()) as Reserva
      setReserva(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reserva')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [token, reservaId])

  const fetchCatalogos = useCallback(async () => {
    if (!token) return
    try {
      const [resG, resA] = await Promise.all([
        fetch(`${API_URL}/api/admin/personal?es_guia=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_URL}/api/experiencias/admin?tipo=${encodeURIComponent('ADC EXPERIENCIAS')}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ])
      if (resG.ok) {
        const data = await resG.json()
        const arr: Personal[] = Array.isArray(data) ? data : data?.items ?? []
        setGuiasDisponibles(arr.filter((g) => g.activo !== false && g.es_guia))
      }
      if (resA.ok) {
        const data = await resA.json()
        const arr: ExperienciaCatalogo[] = Array.isArray(data)
          ? data
          : data?.items ?? []
        // "Oculto" en el catalogo de Add-ons = no se ofrece para agregarlo
        setAddonsCat(arr.filter((a) => a.disponible !== false))
      }
    } catch {
      /* silencioso */
    }
  }, [token])

  // PS1: fuentes, chinampas y cocinas (solo activos). Si uno falla, los selects
  // siguen mostrando el valor guardado y se avisa arriba del formulario.
  const fetchCatalogosReserva = useCallback(async () => {
    if (!token) return
    const tipos: TipoCatalogo[] = ['fuentes', 'chinampas', 'cocinas']
    const resultados = await Promise.all(
      tipos.map(async (tipo) => {
        try {
          const res = await fetch(
            `${API_URL}/api/admin/catalogos/${tipo}?incluir_inactivos=false`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          if (!res.ok) {
            const payload = await res.json().catch(() => null)
            return { tipo, items: null, error: extraerMensajeError(payload, res.status) }
          }
          const data = (await res.json()) as ListaCatalogo
          return { tipo, items: data.items ?? [], error: null }
        } catch {
          return { tipo, items: null, error: 'sin conexión' }
        }
      }),
    )
    const nuevos: CatalogosReserva = { ...CATALOGOS_VACIOS }
    const fallidos: string[] = []
    for (const r of resultados) {
      if (r.items) nuevos[r.tipo] = r.items
      else fallidos.push(`${r.tipo} (${r.error})`)
    }
    setCatalogos(nuevos)
    setCatalogosError(
      fallidos.length > 0 ? `No se pudo cargar el catálogo de ${fallidos.join(', ')}.` : null,
    )
  }, [token])

  useEffect(() => {
    fetchReserva()
    fetchCatalogos()
    fetchCatalogosReserva()
  }, [fetchReserva, fetchCatalogos, fetchCatalogosReserva])

  // CRITICO bug v9 fix: cuando carga reserva, sincronizar form y selectedGuias
  useEffect(() => {
    if (!reserva) return
    setForm({
      fecha: reserva.fecha_experiencia,
      horaInicio: reserva.hora_inicio?.slice(0, 5) ?? '',
      horaFin: reserva.hora_fin?.slice(0, 5) ?? '',
      invMin: reserva.numero_invitados_min,
      invMax: reserva.numero_invitados_max ?? 0,
      chinampa: reserva.chinampa_asignada ?? '',
      idioma: reserva.idioma,
      vendedorId: reserva.vendedor_id ?? '',
      nombreCliente: reserva.cliente_nombre ?? '',
      notasInternas: reserva.notas_internas ?? '',
      notasAlergias: reserva.notas_alergias ?? '',
      notasCliente: reserva.notas_cliente ?? '',
      contacto: reserva.contacto ?? '',
      fuenteId: reserva.fuente_id ?? '',
      cocinaId: reserva.cocina_id ?? '',
      ninos: reserva.ninos ?? 0,
      staff: reserva.staff ?? 0,
      codigoPromocional: reserva.codigo_promocional ?? '',
      cortesia: reserva.cortesia === true,
    })
    setSelectedGuias(
      reserva.guias?.map((g) => g.personal_id ?? g.id ?? '').filter(Boolean) ?? [],
    )
    setFlagSap(reserva.flag_sap)
    setNumeroOvSap(reserva.numero_ov_sap ?? '')
  }, [reserva])

  const guiasPendientes = useMemo(
    () =>
      guiasDisponibles
        .filter((g) => !g.email || !g.idiomas || g.idiomas.length === 0)
        .map((g) => g.id),
    [guiasDisponibles],
  )

  const totalPagado = useMemo(() => {
    if (!reserva?.pagos) return reserva?.monto_pagado_acumulado ?? 0
    return reserva.pagos.reduce(
      (sum, p) => (p.mp_status === 'approved' ? sum + Number(p.monto_total) : sum),
      0,
    )
  }, [reserva])

  const saldoPendiente = useMemo(() => {
    if (!reserva) return 0
    return Math.max(0, Number(reserva.monto_total) - totalPagado)
  }, [reserva, totalPagado])

  // === Handlers ===
  async function saveDatos() {
    if (!token || !form || !reserva) return
    if (form.ninos > form.invMin) {
      showToast('Los niños no pueden ser más que los invitados', 'error')
      return
    }
    const cambiaCortesia = form.cortesia !== (reserva.cortesia === true)
    // F2 (C5): el código va SOLO si cambió. Reenviarlo en cada guardado haría que, el día que exista
    // un cupón con el mismo texto que un folio del Sheet, re-guardar una reserva vieja lo aplicara.
    const codigoNuevo = form.codigoPromocional.trim()
    const cambiaCodigo = codigoNuevo !== (reserva.codigo_promocional ?? '').trim()
    setSavingDatos(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reserva.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha_experiencia: form.fecha,
          hora_inicio: form.horaInicio,
          hora_fin: form.horaFin || undefined,
          // PR1 (29-sep): solo si cambió. Con numero_invitados_min el backend RECALCULA el precio con
          // el catálogo actual, y 434 reservas del Sheet traen otro precio: guardar una nota les
          // cambiaba el total sin avisar.
          numero_invitados_min: form.invMin !== reserva.numero_invitados_min ? form.invMin : undefined,
          numero_invitados_max: form.invMax || undefined,
          // «Ninguna» limpia la chinampa (null explícito, contrato Ola 2 §1.4)
          chinampa_asignada: form.chinampa || null,
          idioma: form.idioma,
          // LD2-a: solo si cambió. El back rechaza (400) a quien ya no es vendedora activa, y
          // mandarla siempre impedía guardar cualquier cosa en esas reservas.
          vendedor_id:
            form.vendedorId && form.vendedorId !== (reserva.vendedor_id ?? '')
              ? form.vendedorId
              : undefined,
          nombre_cliente: form.nombreCliente.trim() || undefined,
          notas_internas: form.notasInternas,
          notas_alergias: form.notasAlergias,
          notas_cliente: form.notasCliente,
          // PS1: siempre presentes; null limpia (el código, solo si cambió: arriba)
          ninos: form.ninos,
          staff: form.staff,
          cortesia: form.cortesia,
          codigo_promocional: cambiaCodigo ? codigoNuevo || null : undefined,
          contacto: form.contacto.trim() || null,
          fuente_id: form.fuenteId || null,
          cocina_id: form.cocinaId || null,
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast(
        cambiaCortesia
          ? form.cortesia
            ? 'Cambios guardados: la reserva es cortesía (no se cobra)'
            : 'Cambios guardados: la reserva ya no es cortesía (montos recalculados)'
          : 'Cambios guardados',
        'success',
      )
      // El PATCH responde el detalle completo (con montos recalculados si cambió
      // la cortesía): refresco silencioso sin vaciar el estado.
      const data = (await res.json().catch(() => null)) as RespuestaEdicion | null
      // `cupon` solo llega si el servidor evaluó un código NUEVO; si no, no se dice nada
      const motivoCupon = data?.cupon_motivo?.trim() || null
      setCuponGuardado(
        data?.cupon || motivoCupon
          ? {
              cupon: data?.cupon ?? null,
              monto: Number(data?.monto_cupon ?? data?.cupon?.descuento ?? 0),
              motivo: motivoCupon,
            }
          : null,
      )
      if (data && data.id === reserva.id && data.booking_id) setReserva(data)
      else await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setSavingDatos(false)
    }
  }

  async function saveGuias() {
    if (!token || !reserva) return
    setSavingGuias(true)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reserva.id}/guias`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ guias_ids: selectedGuias }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast('Guias actualizados', 'success')
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar guias', 'error')
    } finally {
      setSavingGuias(false)
    }
  }

  async function addAddon() {
    if (!token || !reserva || !nuevoAddonId) return
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reserva.id}/addons`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addon_id: nuevoAddonId,
            cantidad: Math.max(1, nuevoAddonCant),
          }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      setNuevoAddonId('')
      setNuevoAddonCant(1)
      showToast('Add-on agregado', 'success')
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al agregar', 'error')
    }
  }

  async function deleteAddon(addonPivotId: string) {
    if (!token || !reserva) return
    if (!window.confirm('Eliminar este add-on?')) return
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reserva.id}/addons/${addonPivotId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast('Add-on eliminado', 'success')
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    }
  }

  async function addInvitado() {
    if (!token || !reserva) return
    if (!nuevoInvitado.nombre?.trim()) {
      showToast('El nombre es obligatorio', 'error')
      return
    }
    // Si manifest aun no tiene filas, materializar placeholders Guest 1..N antes
    // del append para no destruir la visualizacion al agregar el primer invitado real
    const listaBase: ManifestInvitado[] =
      reserva.manifest_invitados && reserva.manifest_invitados.length > 0
        ? reserva.manifest_invitados
        : Array.from(
            { length: reserva.numero_invitados_min },
            (_, i): ManifestInvitado => ({
              nombre: `Guest ${i + 1}`,
              edad: null,
              idioma: 'es',
              alergias: '',
            }),
          )
    const nuevaLista = [...listaBase, nuevoInvitado]
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reserva.id}/manifest`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ manifest_invitados: nuevaLista }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      setNuevoInvitado({ nombre: '', edad: null, idioma: 'es', alergias: '' })
      showToast('Invitado agregado', 'success')
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al agregar', 'error')
    }
  }

  async function updateInvitadoEnLista(
    idx: number,
    field: keyof ManifestInvitado,
    value: string | number | null,
  ) {
    if (!token || !reserva) return
    const listaBase: ManifestInvitado[] =
      reserva.manifest_invitados && reserva.manifest_invitados.length > 0
        ? reserva.manifest_invitados
        : Array.from(
            { length: reserva.numero_invitados_min },
            (_, i): ManifestInvitado => ({
              nombre: `Guest ${i + 1}`,
              edad: null,
              idioma: 'es',
              alergias: '',
            }),
          )
    const nuevaLista = listaBase.map((inv, i) =>
      i === idx ? { ...inv, [field]: value } : inv,
    )
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reserva.id}/manifest`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ manifest_invitados: nuevaLista }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    }
  }

  // C38: PATCH numero_invitados_min = N; el backend recalcula montos server-side.
  async function actualizarCotizacionInvitados(nuevoInvitados: number) {
    if (!token || !reserva) return
    setSavingCotizacion(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reserva.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero_invitados_min: nuevoInvitados }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast(
        reserva.cortesia ? 'Invitados actualizados (cortesía: total $0)' : 'Cotización actualizada',
        'success',
      )
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Error al actualizar cotización',
        'error',
      )
    } finally {
      setSavingCotizacion(false)
    }
  }

  async function saveSap() {
    if (!token || !reserva) return
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reserva.id}/sap`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flag_sap: flagSap,
          numero_ov_sap: numeroOvSap || undefined,
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast('SAP actualizado', 'success')
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar SAP', 'error')
    }
  }

  async function cancelarReserva() {
    if (!token || !reserva) return
    if (!motivoCancelacion.trim()) {
      showToast('Captura un motivo de cancelacion', 'error')
      return
    }
    // CN1 / D15: lo que va a pasar, dicho ANTES de confirmar
    const pagos = reserva.pagos ?? []
    const hayPagoEnCamino = pagosEnCamino(pagos).length > 0
    const linksPorVencer = linksSinCobrar(pagos).length
    const lineas = [`Cancelar la reserva ${reserva.booking_id}?`, 'Esta accion no se puede deshacer.']
    if (hayPagoEnCamino) lineas.push('', AVISO_PAGO_EN_CAMINO)
    if (linksPorVencer > 0) lineas.push('', textoLinksPorVencer(linksPorVencer))
    lineas.push(
      '',
      notificarClienteCancel
        ? 'Se le avisa al cliente por correo si la plantilla Cancelación está activa y tiene correo real.'
        : 'No se le manda correo al cliente.',
    )
    if (!window.confirm(lineas.join('\n'))) return
    setCancelando(true)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/reservas/${reserva.id}/cancelar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            motivo: motivoCancelacion.trim(),
            procesar_reembolso: procesarReembolso,
            notificar_cliente: notificarClienteCancel,
          }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data = (await res.json()) as CancelarResponse
      // Primero lo que no se puede perder (D4: vencer links a mano; D15), luego el resumen
      mostrarAvisos(data.avisos)
      const partes = ['Reserva cancelada.']
      if (data.links_vencidos > 0) partes.push(textoLinksVencidos(data.links_vencidos))
      partes.push(textoCorreo(data.correo_cliente))
      showToast(partes.filter(Boolean).join(' '), 'success')
      setMotivoCancelacion('')
      // Silent refetch: el detalle se queda abierto y muestra la reserva cancelada
      await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al cancelar', 'error')
    } finally {
      setCancelando(false)
    }
  }

  // B6 / D9: solo desde Confirmada o Pagada y con la fecha de hoy o antes (México). La regla de
  // verdad es del back (C7): un 400 se muestra tal cual.
  async function marcarRealizada() {
    if (!token || !reserva) return
    if (
      !window.confirm(
        `¿Marcar la reserva ${reserva.booking_id} como realizada? Hazlo cuando la experiencia ya ocurrió.`,
      )
    ) {
      return
    }
    setMarcandoRealizada(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reserva.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'realizada' }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast('Reserva marcada como realizada', 'success')
      // El PATCH responde el detalle completo: refresco silencioso sin vaciar el estado
      const data = (await res.json().catch(() => null)) as Reserva | null
      if (data && data.id === reserva.id && data.booking_id) setReserva(data)
      else await fetchReserva(true)
      onUpdated()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al marcar como realizada', 'error')
    } finally {
      setMarcandoRealizada(false)
    }
  }

  // COT1 (R1 §3.5): genera el PDF con los montos de hoy y pide mandarlo al correo de la reserva
  // (email_destino null). La guardia del back decide si sale; aquí solo se dice lo que respondió.
  async function reenviarCotizacion() {
    if (!token || !reserva || reserva.cortesia) return
    if (
      !window.confirm(
        `¿Reenviar la cotización de la reserva ${reserva.booking_id}? Se genera el PDF con los montos de hoy y se pide mandarlo al correo del cliente.`,
      )
    ) {
      return
    }
    setReenvioCotizacion({ tipo: 'enviando' })
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reserva.id}/cotizacion-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enviar_por_email: true, email_destino: null }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data = (await res.json()) as CotizacionPdfResponse
      setReenvioCotizacion({ tipo: 'ok', texto: textoReenvioCotizacion(data) })
    } catch (err) {
      setReenvioCotizacion({
        tipo: 'error',
        mensaje:
          err instanceof Error && !(err instanceof TypeError)
            ? err.message
            : 'sin conexión con el servidor',
      })
    }
  }

  // Resultados de los sub-modales (Fase 2): un toast que dice qué pasó con los correos y links
  function alReagendar(res: ReagendarResponse) {
    mostrarAvisos(res.avisos)
    const horas = res.hora_fin
      ? `${horaCorta(res.hora_inicio)}–${horaCorta(res.hora_fin)}`
      : horaCorta(res.hora_inicio)
    const partes = [
      `Reserva reagendada al ${formatFechaMexico(res.fecha_experiencia)} a las ${horas}.`,
      textoCorreo(res.correo_cliente),
      textoGuias(res.guias),
    ]
    showToast(partes.filter(Boolean).join(' '), 'success')
    fetchReserva(true)
    onUpdated()
  }

  function alRegistrarPago(res: PagoManualResponse) {
    mostrarAvisos(res.avisos)
    const partes = ['Pago registrado.']
    // correo_confirmacion no es null solo si el pago pasó la reserva de Tentativa a Confirmada
    if (res.correo_confirmacion) {
      partes.push('La reserva quedó Confirmada.', textoCorreo(res.correo_confirmacion, 'de confirmación'))
    }
    if (res.links_vencidos > 0) partes.push(textoLinksVencidos(res.links_vencidos))
    showToast(partes.filter(Boolean).join(' '), 'success')
    fetchReserva(true)
    onUpdated()
  }

  if (loading && !reserva) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-medium max-w-md w-full p-8 flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
          <span className="text-sm text-verde">Cargando reserva...</span>
        </div>
      </div>
    )
  }

  if (error || !reserva || !form) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-medium max-w-md w-full p-6">
          <div className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo mb-4">
            {error ?? 'No se pudo cargar la reserva.'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-neutro-borde hover:bg-neutro-gris text-verde rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detalle-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-5xl w-full max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col">
        {/* Header */}
        <header className="shrink-0 border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 id="modal-detalle-title" className="font-display text-xl text-verde">
                Reserva {reserva.booking_id}
              </h2>
              <BadgeEstado estado={reserva.estado} />
              <BadgeEstadoPago estado={reserva.estado_pago} />
            </div>
            <p className="text-xs text-verde-suave mt-1">
              {reserva.experiencia_nombre} · {formatFechaMexico(reserva.fecha_experiencia)} ·{' '}
              {reserva.hora_inicio?.slice(0, 5)} ·{' '}
              {reserva.numero_invitados_min} invitados
              {(reserva.ninos ?? 0) > 0 && ` (${reserva.ninos} ${reserva.ninos === 1 ? 'niño' : 'niños'})`}
              {(reserva.staff ?? 0) > 0 && ` · ${reserva.staff} staff`}
              {reserva.codigo_promocional && ` · Código ${reserva.codigo_promocional}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal detalle reserva"
            className="p-1 rounded hover:bg-neutro-light text-verde-suave"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Tabs */}
        <div className="shrink-0 border-b border-neutro-borde px-6 overflow-x-auto">
          <nav className="flex gap-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  tab === t.key
                    ? 'border-terracota text-terracota'
                    : 'border-transparent text-verde-suave hover:text-verde'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Toast */}
        {toast && (
          <div
            role="status"
            className={`mx-6 mt-4 rounded-lg p-3 text-sm ${
              toast.type === 'success'
                ? 'bg-verde/10 text-verde border border-verde/30'
                : 'bg-rojo-bg text-rojo border border-rojo/30'
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {tab === 'datos' && (
            <TabDatos
              reserva={reserva}
              form={form}
              setForm={setForm}
              vendedorasEstado={vendedorasEstado}
              guiasDisponibles={guiasDisponibles}
              selectedGuias={selectedGuias}
              setSelectedGuias={setSelectedGuias}
              guiasPendientes={guiasPendientes}
              catalogos={catalogos}
              catalogosError={catalogosError}
              saveDatos={saveDatos}
              saveGuias={saveGuias}
              savingDatos={savingDatos}
              savingGuias={savingGuias}
              cuponGuardado={cuponGuardado}
              onCambiaCodigo={() => setCuponGuardado(null)}
            />
          )}
          {tab === 'addons' && (
            <TabAddons
              reserva={reserva}
              addonsCat={addonsCat}
              nuevoAddonId={nuevoAddonId}
              setNuevoAddonId={setNuevoAddonId}
              nuevoAddonCant={nuevoAddonCant}
              setNuevoAddonCant={setNuevoAddonCant}
              onAdd={addAddon}
              onDelete={deleteAddon}
            />
          )}
          {tab === 'manifest' && (
            <TabManifest
              reserva={reserva}
              nuevoInvitado={nuevoInvitado}
              setNuevoInvitado={setNuevoInvitado}
              onAdd={addInvitado}
              onUpdate={updateInvitadoEnLista}
              onActualizarCotizacion={actualizarCotizacionInvitados}
              savingCotizacion={savingCotizacion}
            />
          )}
          {tab === 'pagos' && (
            <TabPagos
              reserva={reserva}
              totalPagado={totalPagado}
              saldoPendiente={saldoPendiente}
              cortesia={reserva.cortesia === true}
              onAbrirPagoManual={() => setShowPagoManual(true)}
              onAbrirLinkMP={() => setShowLinkMP(true)}
              reenvioCotizacion={reenvioCotizacion}
              onReenviarCotizacion={reenviarCotizacion}
            />
          )}
          {tab === 'comunicaciones' && <TabComunicaciones estado={comunicaciones} />}
          {tab === 'auditoria' && <TabAuditoria reserva={reserva} comunicaciones={comunicaciones} />}
          {tab === 'acciones' && (
            <TabAcciones
              realizada={
                reserva.estado === 'realizada'
                  ? { puede: false, motivo: 'Ya está marcada como realizada.' }
                  : puedeMarcarRealizada(reserva, hoyMexico())
              }
              marcandoRealizada={marcandoRealizada}
              onMarcarRealizada={marcarRealizada}
              cancelada={reserva.estado === 'cancelada'}
              pagosEnCamino={pagosEnCamino(reserva.pagos ?? []).length}
              linksPorVencer={linksSinCobrar(reserva.pagos ?? []).length}
              notificarCliente={notificarClienteCancel}
              setNotificarCliente={setNotificarClienteCancel}
              cancelando={cancelando}
              flagSap={flagSap}
              setFlagSap={setFlagSap}
              numeroOvSap={numeroOvSap}
              setNumeroOvSap={setNumeroOvSap}
              onSaveSap={saveSap}
              onAbrirReagendar={() => setShowReagendar(true)}
              motivoCancelacion={motivoCancelacion}
              setMotivoCancelacion={setMotivoCancelacion}
              procesarReembolso={procesarReembolso}
              setProcesarReembolso={setProcesarReembolso}
              onCancelarReserva={cancelarReserva}
            />
          )}
        </div>

        <footer className="shrink-0 border-t border-neutro-borde px-6 py-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light"
          >
            Cerrar
          </button>
        </footer>
      </div>

      {showLinkMP && !reserva.cortesia && (
        <ModalLinkMP
          reservaId={reserva.id}
          bookingId={reserva.booking_id}
          totalActual={Number(reserva.monto_total)}
          anticipoSugerido={Number(reserva.monto_anticipo)}
          balance={saldoPendiente}
          onCreated={(res) => {
            // El resultado (vencimiento y correo) se queda a la vista en el propio modal
            showToast(res.correo_cliente ? `Link generado. ${textoCorreo(res.correo_cliente)}` : 'Link generado', 'success')
            fetchReserva(true)
            onUpdated()
          }}
          onClose={() => setShowLinkMP(false)}
        />
      )}
      {showPagoManual && !reserva.cortesia && (
        <ModalPagoManual
          reservaId={reserva.id}
          bookingId={reserva.booking_id}
          saldoPendiente={saldoPendiente}
          tentativa={reserva.estado === 'tentativo' || reserva.estado === 'tentativa'}
          linksPendientes={linksSinCobrar(reserva.pagos ?? []).length}
          onSaved={alRegistrarPago}
          onClose={() => setShowPagoManual(false)}
        />
      )}
      {showReagendar && (
        <ModalReagendar
          reservaId={reserva.id}
          bookingId={reserva.booking_id}
          fechaActual={reserva.fecha_experiencia}
          horaActual={reserva.hora_inicio}
          horaFinActual={reserva.hora_fin ?? null}
          guiasConCorreo={(reserva.guias ?? []).filter((g) => !!g.email?.trim()).length}
          guiasTotal={(reserva.guias ?? []).length}
          onSaved={alReagendar}
          onClose={() => setShowReagendar(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// TAB 1 — Datos
// ============================================================================
function TabDatos({
  reserva,
  form,
  setForm,
  vendedorasEstado,
  guiasDisponibles,
  selectedGuias,
  setSelectedGuias,
  guiasPendientes,
  catalogos,
  catalogosError,
  saveDatos,
  saveGuias,
  savingDatos,
  savingGuias,
  cuponGuardado,
  onCambiaCodigo,
}: {
  reserva: Reserva
  form: FormDatos
  setForm: React.Dispatch<React.SetStateAction<FormDatos | null>>
  vendedorasEstado: EstadoVendedoras
  guiasDisponibles: Personal[]
  selectedGuias: string[]
  setSelectedGuias: React.Dispatch<React.SetStateAction<string[]>>
  guiasPendientes: string[]
  catalogos: CatalogosReserva
  catalogosError: string | null
  saveDatos: () => Promise<void>
  saveGuias: () => Promise<void>
  savingDatos: boolean
  savingGuias: boolean
  cuponGuardado: EstadoCuponGuardado | null
  onCambiaCodigo: () => void
}) {
  const cot = reserva.cotizacion
  // F2: las del Sheet nunca se re-precian (C5)
  const sinReprecio = cot?.se_reprecia === false
  // C19 (CUP2/DR5): la frase del servidor manda; si no viene, la del cupón evaluado
  const textoCuponGuardado = cuponGuardado
    ? cuponGuardado.motivo ||
      (cuponGuardado.cupon ? textoCupon(cuponGuardado.cupon, cuponGuardado.monto) : '')
    : ''
  const cuponGuardadoAplicado = !!cuponGuardado?.cupon?.aplicado && !cuponGuardado.motivo
  const updateForm = <K extends keyof FormDatos>(field: K, value: FormDatos[K]) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  // Lo guardado se muestra aunque ya no esté en el catálogo activo (chinampa «Otro»
  // de reservas viejas, una fuente o cocina archivada): si no, el select lo borraría.
  // La etiqueta "(archivada)" solo sale si el catálogo sí cargó y el valor no está.
  const fuentes = catalogos.fuentes ?? []
  const chinampas = catalogos.chinampas ?? []
  const cocinas = catalogos.cocinas ?? []
  const fuentesCanal = fuentes.filter((f) => f.tipo === 'canal')
  const fuentesPersona = fuentes.filter((f) => f.tipo === 'persona')
  const fuenteFueraDeCatalogo =
    reserva.fuente_id && !fuentes.some((f) => f.id === reserva.fuente_id)
      ? {
          id: reserva.fuente_id,
          nombre: `${reserva.fuente_nombre ?? 'Fuente guardada'}${catalogos.fuentes ? ' (archivada)' : ''}`,
        }
      : null
  const cocinasCocina = cocinas.filter((c) => c.tipo !== 'chef_invitado')
  const cocinasChef = cocinas.filter((c) => c.tipo === 'chef_invitado')
  const cocinaFueraDeCatalogo =
    reserva.cocina_id && !cocinas.some((c) => c.id === reserva.cocina_id)
      ? {
          id: reserva.cocina_id,
          nombre: `${reserva.cocina_nombre ?? 'Cocina guardada'}${catalogos.cocinas ? ' (archivada)' : ''}`,
        }
      : null
  // LD2-a: la vendedora guardada que ya no está en la lista de activas se ve con su nombre
  const vendedoraFuera = vendedoraFueraDeLista(
    vendedorasEstado,
    reserva.vendedor_id,
    reserva.vendedor_nombre,
  )
  const chinampaGuardada = reserva.chinampa_asignada ?? ''
  const chinampaFueraDeCatalogo =
    chinampaGuardada && !chinampas.some((c) => c.nombre === chinampaGuardada)
      ? chinampaGuardada
      : null

  const ninosExcede = form.ninos > form.invMin
  // Misma regla que el backend: con algo cobrado no puede pasar a cortesía
  const tienePagosAprobados =
    Number(reserva.monto_pagado_acumulado) > 0 ||
    (reserva.pagos ?? []).some((p) => p.mp_status === 'approved')

  const inputClass =
    'w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota'

  return (
    <div className="space-y-4">
      {/* DT1-a (30-sep): el aviso anterior prometía un correo al guardar que nunca se manda */}
      <div
        data-testid="detalle-aviso-sin-correo"
        className="bg-azul-bg border border-azul/30 rounded-lg p-3 text-sm text-azul flex gap-2"
      >
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Guardar estos cambios no le manda correo al cliente. Si cambias fecha, hora o
          invitados, avísale tú. Los correos enviados se ven en la pestaña Comunicaciones. Para
          cambiar la fecha con aviso por correo al cliente y a los guías, usa Acciones › Reagendar.
        </p>
      </div>

      {catalogosError && (
        <div
          role="status"
          className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-3 text-sm text-verde flex gap-2"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amarillo" aria-hidden="true" />
          <p>{catalogosError} Se muestra lo guardado en la reserva.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cliente" htmlFor="d-nombre-cliente">
          <input
            id="d-nombre-cliente"
            type="text"
            value={form.nombreCliente}
            onChange={(e) => updateForm('nombreCliente', e.target.value)}
            placeholder={reserva.reseller_nombre ? 'El huésped del reseller' : 'Nombre del cliente'}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </Field>
        <ReadOnly label="Email" value={reserva.cliente_email ?? reserva.usuario_email ?? '—'} />
        <ReadOnly label="Telefono" value={reserva.cliente_telefono ?? reserva.usuario_telefono ?? '—'} />
        <ReadOnly label="Reseller" value={reserva.reseller_nombre ?? '✕ Venta directa'} />
        <ReadOnly label="Experiencia" value={reserva.experiencia_nombre ?? '—'} />
        <ReadOnly
          label="Total"
          value={
            reserva.cortesia
              ? `${formatMXN(Number(reserva.monto_total))} · Cortesía`
              : formatMXN(Number(reserva.monto_total))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Contacto" htmlFor="d-contacto">
          <input
            id="d-contacto"
            type="text"
            value={form.contacto}
            onChange={(e) => updateForm('contacto', e.target.value)}
            placeholder="Quién coordina (nombre, teléfono, correo)"
            maxLength={200}
            data-testid="detalle-contacto"
            className={inputClass}
          />
        </Field>
        <Field label="Fuente" htmlFor="d-fuente">
          <select
            id="d-fuente"
            value={form.fuenteId}
            onChange={(e) => updateForm('fuenteId', e.target.value)}
            data-testid="detalle-fuente"
            className={inputClass}
          >
            <option value="">— Sin fuente —</option>
            {fuenteFueraDeCatalogo && (
              <option value={fuenteFueraDeCatalogo.id}>{fuenteFueraDeCatalogo.nombre}</option>
            )}
            {fuentesCanal.length > 0 && (
              <optgroup label="Canal">
                {fuentesCanal.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </optgroup>
            )}
            {fuentesPersona.length > 0 && (
              <optgroup label="Persona">
                {fuentesPersona.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Fecha" htmlFor="d-fecha">
          <input
            id="d-fecha"
            type="date"
            value={form.fecha}
            onChange={(e) => updateForm('fecha', e.target.value)}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </Field>
        <Field label="Hora inicio" htmlFor="d-hora-inicio">
          <input
            id="d-hora-inicio"
            type="time"
            value={form.horaInicio}
            onChange={(e) => updateForm('horaInicio', e.target.value)}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </Field>
        <Field label="Hora fin" htmlFor="d-hora-fin">
          <input
            id="d-hora-fin"
            type="time"
            value={form.horaFin}
            onChange={(e) => updateForm('horaFin', e.target.value)}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </Field>
      </div>

      {sinReprecio && (
        <p
          data-testid="detalle-sin-reprecio"
          role="note"
          className="bg-neutro-light/60 border border-neutro-borde rounded-lg p-3 text-sm text-verde flex gap-2"
        >
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-verde-suave" aria-hidden="true" />
          <span>{TEXTO_SIN_REPRECIO}</span>
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Invitados min" htmlFor="d-inv-min">
          <input
            id="d-inv-min"
            type="number"
            min={1}
            value={form.invMin}
            onChange={(e) => updateForm('invMin', Math.max(1, Number(e.target.value)))}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </Field>
        <Field label="Invitados max" htmlFor="d-inv-max">
          <input
            id="d-inv-max"
            type="number"
            min={0}
            value={form.invMax}
            onChange={(e) => updateForm('invMax', Math.max(0, Number(e.target.value)))}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </Field>
        <Field label="Niños (de los invitados)" htmlFor="d-ninos">
          <input
            id="d-ninos"
            type="number"
            min={0}
            max={form.invMin}
            value={form.ninos}
            onChange={(e) => updateForm('ninos', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            aria-invalid={ninosExcede}
            aria-describedby="d-ninos-ayuda"
            data-testid="detalle-ninos"
            className={`${inputClass} tabular-nums ${ninosExcede ? 'border-rojo' : ''}`}
          />
          <p
            id="d-ninos-ayuda"
            data-testid="detalle-ninos-ayuda"
            className={`text-xs mt-1 ${ninosExcede ? 'text-rojo' : 'text-verde-suave'}`}
          >
            {ninosExcede ? `Máximo ${form.invMin} (los invitados)` : textoNinosDetalle(reserva)}
          </p>
        </Field>
        <Field label="Staff" htmlFor="d-staff">
          <input
            id="d-staff"
            type="number"
            min={0}
            value={form.staff}
            onChange={(e) => updateForm('staff', Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            aria-describedby="d-staff-ayuda"
            data-testid="detalle-staff"
            className={`${inputClass} tabular-nums`}
          />
          <p id="d-staff-ayuda" className="text-xs mt-1 text-verde-suave">
            Aparte: no se cobra ni suma platos/sillas
          </p>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Chinampa" htmlFor="d-chinampa">
          <select
            id="d-chinampa"
            value={form.chinampa}
            onChange={(e) => updateForm('chinampa', e.target.value)}
            data-testid="detalle-chinampa"
            className={inputClass}
          >
            <option value="">Ninguna</option>
            {chinampaFueraDeCatalogo && (
              <option value={chinampaFueraDeCatalogo}>
                {chinampaFueraDeCatalogo}
                {catalogos.chinampas ? ' (fuera del catálogo)' : ''}
              </option>
            )}
            {chinampas.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cocina / chef" htmlFor="d-cocina">
          <select
            id="d-cocina"
            value={form.cocinaId}
            onChange={(e) => updateForm('cocinaId', e.target.value)}
            data-testid="detalle-cocina"
            className={inputClass}
          >
            <option value="">— Sin asignar —</option>
            {cocinaFueraDeCatalogo && (
              <option value={cocinaFueraDeCatalogo.id}>{cocinaFueraDeCatalogo.nombre}</option>
            )}
            {cocinasCocina.length > 0 && (
              <optgroup label="Cocina">
                {cocinasCocina.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </optgroup>
            )}
            {cocinasChef.length > 0 && (
              <optgroup label="Chef invitado">
                {cocinasChef.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Idioma" htmlFor="d-idioma">
          <select
            id="d-idioma"
            value={form.idioma}
            onChange={(e) => updateForm('idioma', e.target.value as IdiomaCliente)}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          >
            <option value="es">Espanol</option>
            <option value="en">Ingles</option>
          </select>
        </Field>
        <Field label="Vendedora" htmlFor="d-vendedor">
          <select
            id="d-vendedor"
            value={form.vendedorId}
            onChange={(e) => updateForm('vendedorId', e.target.value)}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          >
            <option value="">— Sin asignar —</option>
            {vendedoraFuera && (
              <option value={vendedoraFuera.id} disabled>
                {vendedoraFuera.nombre}
              </option>
            )}
            {vendedorasEstado.vendedoras.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
          </select>
          {vendedorasEstado.error && (
            <p data-testid="vendedoras-error" className="text-xs mt-1 text-terracota-dark">
              No se pudo cargar la lista de vendedoras ({vendedorasEstado.error}). Se muestra la
              guardada.
            </p>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 items-start">
        <Field label="Código promocional" htmlFor="d-codigo">
          <input
            id="d-codigo"
            type="text"
            value={form.codigoPromocional}
            onChange={(e) => {
              updateForm('codigoPromocional', e.target.value)
              onCambiaCodigo()
            }}
            placeholder="Opcional"
            maxLength={50}
            aria-describedby={textoCuponGuardado ? 'd-codigo-estado' : undefined}
            data-testid="detalle-codigo"
            className={inputClass}
          />
          {/* F2: lo que dijo el servidor del código NUEVO (aplicado en verde; referencia en gris) */}
          {cuponGuardado && textoCuponGuardado && (
            <p
              id="d-codigo-estado"
              data-testid="detalle-cupon-estado"
              role="status"
              className={`text-xs mt-1 ${
                cuponGuardadoAplicado ? 'font-medium text-verde' : 'text-verde-suave'
              }`}
            >
              {textoCuponGuardado}
            </p>
          )}
        </Field>
        <div className="pt-6">
          <label
            htmlFor="d-cortesia"
            className="flex items-center gap-2 text-sm text-verde cursor-pointer"
          >
            <input
              id="d-cortesia"
              type="checkbox"
              checked={form.cortesia}
              onChange={(e) => updateForm('cortesia', e.target.checked)}
              data-testid="detalle-cortesia"
              className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
            />
            <Gift className="h-4 w-4 text-morado" aria-hidden="true" />
            Cortesía (no se cobra)
          </label>
          <p className="text-xs text-verde-suave mt-1">
            {form.cortesia
              ? 'Total $0: sin anticipo ni link de pago. Al guardar se recalculan los montos.'
              : tienePagosAprobados
                ? 'Tiene pagos registrados: no puede pasar a cortesía.'
                : 'Al marcarla, el total queda en $0 al guardar.'}
          </p>
        </div>
      </div>

      <Field label="Notas internas" htmlFor="d-notas-internas">
        <textarea
          id="d-notas-internas"
          value={form.notasInternas}
          onChange={(e) => updateForm('notasInternas', e.target.value)}
          rows={2}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        />
      </Field>

      <Field label="Alergias / restricciones" htmlFor="d-notas-alergias">
        <textarea
          id="d-notas-alergias"
          value={form.notasAlergias}
          onChange={(e) => updateForm('notasAlergias', e.target.value)}
          rows={2}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        />
      </Field>

      <Field label="Notas del cliente" htmlFor="d-notas-cliente">
        <textarea
          id="d-notas-cliente"
          value={form.notasCliente}
          onChange={(e) => updateForm('notasCliente', e.target.value)}
          rows={2}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        />
      </Field>

      <button
        type="button"
        onClick={saveDatos}
        disabled={savingDatos || ninosExcede}
        data-testid="detalle-guardar-datos"
        className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {savingDatos && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Guardar cambios
      </button>

      <div className="border-t border-neutro-borde pt-4">
        <MultiSelectGuias
          id="detalle-guias"
          guias={guiasDisponibles}
          selectedIds={selectedGuias}
          onChange={setSelectedGuias}
          guiasPendientes={guiasPendientes}
          label="Guias asignados"
        />
        <button
          type="button"
          onClick={saveGuias}
          disabled={savingGuias}
          className="mt-3 inline-flex items-center gap-2 bg-verde hover:bg-verde-claro text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingGuias && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Guardar guias
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-verde mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-verde-suave">{label}</p>
      <p className="text-sm text-verde font-medium truncate" title={value}>
        {value}
      </p>
    </div>
  )
}

// ============================================================================
// TAB 2 — Add-ons
// ============================================================================
function TabAddons({
  reserva,
  addonsCat,
  nuevoAddonId,
  setNuevoAddonId,
  nuevoAddonCant,
  setNuevoAddonCant,
  onAdd,
  onDelete,
}: {
  reserva: Reserva
  addonsCat: ExperienciaCatalogo[]
  nuevoAddonId: string
  setNuevoAddonId: (v: string) => void
  nuevoAddonCant: number
  setNuevoAddonCant: (v: number) => void
  onAdd: () => void
  onDelete: (id: string) => void
}) {
  const addons = reserva.addons ?? []
  // CP1 (D-d, C11): el cupón va aparte del descuento manual
  const montoCupon = Number(reserva.monto_cupon ?? 0)
  const codigoCupon =
    reserva.cotizacion?.cupon?.codigo ?? reserva.cupon_codigo ?? reserva.codigo_promocional ?? ''
  // Cortesía: la experiencia y los add-ons quedan como valor de referencia y el
  // total es $0. La fila "Cortesía" cuadra la suma con el total que manda el backend.
  const ajusteCortesia = reserva.cortesia
    ? Number(reserva.precio_base) +
      Number(reserva.monto_addons) +
      Number(reserva.propina_monto) -
      Number(reserva.monto_descuento) -
      montoCupon -
      Number(reserva.monto_total)
    : 0

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutro-borde rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutro-light border-b border-neutro-borde">
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Add-on
              </th>
              <th scope="col" className="text-center px-3 py-2 font-medium text-verde">
                Cantidad
              </th>
              <th scope="col" className="text-right px-3 py-2 font-medium text-verde">
                Precio unitario
              </th>
              <th scope="col" className="text-right px-3 py-2 font-medium text-verde">
                Subtotal
              </th>
              <th scope="col" className="text-center px-3 py-2 font-medium text-verde">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {addons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-verde-suave">
                  No hay add-ons asignados a esta reserva.
                </td>
              </tr>
            ) : (
              addons.map((a) => (
                <tr key={a.id} className="border-b border-neutro-borde">
                  <td data-testid="detalle-addon-nombre" className="px-3 py-2 text-verde">
                    {a.addon_nombre ?? (
                      <span className="italic text-verde-suave">Add-on eliminado</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center text-verde tabular-nums">
                    {a.cantidad}
                  </td>
                  <td className="px-3 py-2 text-right text-verde tabular-nums">
                    {formatMXN(Number(a.precio_unitario))}
                  </td>
                  <td className="px-3 py-2 text-right text-verde font-medium tabular-nums">
                    {formatMXN(Number(a.subtotal))}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(a.id)}
                      aria-label={`Eliminar ${a.addon_nombre ?? 'add-on eliminado'}`}
                      className="p-1 rounded hover:bg-rojo/10 text-rojo"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-neutro-light/40">
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-verde-suave">
                Subtotal experiencia
              </td>
              <td className="px-3 py-2 text-right text-verde tabular-nums">
                {formatMXN(Number(reserva.precio_base))}
              </td>
              <td />
            </tr>
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-verde-suave">
                Add-ons
              </td>
              <td className="px-3 py-2 text-right text-verde tabular-nums">
                {formatMXN(Number(reserva.monto_addons))}
              </td>
              <td />
            </tr>
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-verde-suave">
                Propina ({Number(reserva.propina_pct).toFixed(1)}%)
              </td>
              <td className="px-3 py-2 text-right text-verde tabular-nums">
                {formatMXN(Number(reserva.propina_monto))}
              </td>
              <td />
            </tr>
            {Number(reserva.monto_descuento) > 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right text-verde-suave">
                  Descuento
                </td>
                <td className="px-3 py-2 text-right text-rojo tabular-nums">
                  -{formatMXN(Number(reserva.monto_descuento))}
                </td>
                <td />
              </tr>
            )}
            {montoCupon > 0 && (
              <tr data-testid="detalle-addons-cupon">
                <td colSpan={3} className="px-3 py-2 text-right text-verde-suave">
                  Cupón {codigoCupon}
                </td>
                <td className="px-3 py-2 text-right text-rojo tabular-nums">
                  −{formatMXN(montoCupon)}
                </td>
                <td />
              </tr>
            )}
            {reserva.cortesia && (
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right text-morado">
                  Cortesía (no se cobra)
                </td>
                <td className="px-3 py-2 text-right text-morado tabular-nums">
                  -{formatMXN(ajusteCortesia)}
                </td>
                <td />
              </tr>
            )}
            <tr className="border-t border-neutro-borde">
              <td colSpan={3} className="px-3 py-2 text-right text-verde font-medium">
                TOTAL
              </td>
              <td className="px-3 py-2 text-right text-verde font-display font-semibold tabular-nums">
                {formatMXN(Number(reserva.monto_total))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-neutro-light/40 border border-neutro-borde rounded-lg p-4">
        <p className="text-sm font-medium text-verde mb-2">Agregar add-on</p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label
              htmlFor="addon-select"
              className="block text-xs text-verde-suave mb-1"
            >
              Add-on del catalogo
            </label>
            <select
              id="addon-select"
              value={nuevoAddonId}
              onChange={(e) => setNuevoAddonId(e.target.value)}
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              <option value="">— Selecciona add-on —</option>
              {addonsCat.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} — {formatMXN(Number(a.precio_por_persona ?? 0))}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="addon-cantidad"
              className="block text-xs text-verde-suave mb-1"
            >
              Cantidad
            </label>
            <input
              id="addon-cantidad"
              type="number"
              min={1}
              value={nuevoAddonCant}
              onChange={(e) => setNuevoAddonCant(Math.max(1, Number(e.target.value)))}
              className="border border-neutro-borde rounded-lg px-3 py-2 text-sm w-24 tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!nuevoAddonId}
            className="inline-flex items-center gap-1 bg-terracota hover:bg-terracota-dark text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TAB 3 — Manifest
// ============================================================================
function ManifestRow({
  idx,
  inv,
  esPlaceholder,
  onUpdate,
}: {
  idx: number
  inv: ManifestInvitado
  esPlaceholder: boolean
  onUpdate: (
    idx: number,
    field: keyof ManifestInvitado,
    value: string | number | null,
  ) => Promise<void>
}) {
  const [nombre, setNombre] = useState(inv.nombre ?? '')
  const [edad, setEdad] = useState<string>(inv.edad != null ? String(inv.edad) : '')
  const [alergias, setAlergias] = useState(inv.alergias ?? '')

  useEffect(() => {
    setNombre(inv.nombre ?? '')
    setEdad(inv.edad != null ? String(inv.edad) : '')
    setAlergias(inv.alergias ?? '')
  }, [inv.nombre, inv.edad, inv.alergias])

  const inputClass =
    'w-full border border-transparent hover:border-neutro-borde focus:border-terracota rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-terracota/30 bg-transparent'

  return (
    <tr className="border-b border-neutro-borde">
      <td className="px-3 py-2">
        <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-terracota/10 text-terracota text-xs font-semibold tabular-nums">
          {idx + 1}
        </span>
      </td>
      <td className="px-3 py-1">
        <input
          type="text"
          aria-label={`Nombre invitado ${idx + 1}`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => {
            const trimmed = nombre.trim() || `Guest ${idx + 1}`
            if (trimmed !== (inv.nombre ?? '')) onUpdate(idx, 'nombre', trimmed)
          }}
          className={`${inputClass} text-verde ${
            esPlaceholder ? 'italic text-verde-suave' : ''
          }`}
        />
      </td>
      <td className="px-3 py-1">
        <input
          type="number"
          min={0}
          aria-label={`Edad invitado ${idx + 1}`}
          value={edad}
          onChange={(e) => setEdad(e.target.value)}
          onBlur={() => {
            const next = edad === '' ? null : Number(edad)
            if (next !== (inv.edad ?? null)) onUpdate(idx, 'edad', next)
          }}
          className={`${inputClass} text-verde tabular-nums`}
        />
      </td>
      <td className="px-3 py-1">
        <select
          aria-label={`Idioma invitado ${idx + 1}`}
          value={inv.idioma ?? 'es'}
          onChange={(e) => onUpdate(idx, 'idioma', e.target.value)}
          className={`${inputClass} text-verde`}
        >
          <option value="es">Espanol</option>
          <option value="en">Ingles</option>
        </select>
      </td>
      <td className="px-3 py-1">
        <input
          type="text"
          aria-label={`Alergias invitado ${idx + 1}`}
          value={alergias}
          onChange={(e) => setAlergias(e.target.value)}
          onBlur={() => {
            if (alergias !== (inv.alergias ?? '')) onUpdate(idx, 'alergias', alergias)
          }}
          className={`${inputClass} text-verde`}
          placeholder="—"
        />
      </td>
    </tr>
  )
}

function TabManifest({
  reserva,
  nuevoInvitado,
  setNuevoInvitado,
  onAdd,
  onUpdate,
  onActualizarCotizacion,
  savingCotizacion,
}: {
  reserva: Reserva
  nuevoInvitado: ManifestInvitado
  setNuevoInvitado: React.Dispatch<React.SetStateAction<ManifestInvitado>>
  onAdd: () => void
  onUpdate: (
    idx: number,
    field: keyof ManifestInvitado,
    value: string | number | null,
  ) => Promise<void>
  onActualizarCotizacion: (nuevoInvitados: number) => Promise<void>
  savingCotizacion: boolean
}) {
  const lista = reserva.manifest_invitados ?? []
  const esPlaceholder = lista.length === 0
  const listaRender: ManifestInvitado[] = esPlaceholder
    ? Array.from({ length: reserva.numero_invitados_min }, (_, i) => ({
        nombre: `Guest ${i + 1}`,
        edad: null,
        idioma: 'es',
        alergias: '',
      }))
    : lista

  // C38: comparar invitados reales del manifest vs los cotizados en la reserva.
  const [confirmando, setConfirmando] = useState(false)
  const cotizados = reserva.numero_invitados_min
  const manifestCount = lista.length
  const excedeCotizacion = manifestCount > cotizados

  const totalActual = Number(reserva.monto_total)
  // F2: la misma cuenta que hará el servidor al aceptar (precios GUARDADOS, niños, cupón ligado y,
  // en las del Sheet, su subtotal fijo)
  const cot = reserva.cotizacion
  const nuevaCotizacion = calcularCotizacion({
    ...initialWizardData,
    invMin: manifestCount,
    ninos: reserva.ninos ?? 0,
    precioBase: cot?.precio_base_experiencia ?? 0,
    precioAdicional: cot?.precio_adicional_por_persona ?? 0,
    precioNinoAdicional: cot?.precio_nino_adicional ?? cot?.precio_adicional_por_persona ?? 0,
    personasIncluidas: cot?.invitados_incluidos ?? 9,
    addons: (reserva.addons ?? []).map((a) => ({
      id: a.addon_id,
      nombre: a.addon_nombre ?? a.nombre ?? '',
      cantidad: a.cantidad,
      precio_unitario: Number(a.precio_unitario),
    })),
    propinaPct: Number(reserva.propina_pct),
    descuento: cot?.monto_descuento ?? Number(reserva.monto_descuento),
    cuponEvaluado: cot?.cupon
      ? {
          codigo: cot.cupon.codigo,
          es_cupon: true,
          aplicado: true,
          cupon_id: reserva.cupon_id ?? null,
          tipo: cot.cupon.tipo,
          valor: cot.cupon.valor,
          descuento: 0,
          motivo: null,
        }
      : null,
    cortesia: reserva.cortesia === true,
    subtotalFijo: cot && !cot.se_reprecia ? cot.subtotal_experiencia : null,
    // C11: el backend no recalcula la propina de las del Sheet (propina_fija); en las del panel, el %
    propinaFija: cot && !cot.se_reprecia ? cot.propina_monto : null,
  })
  const nuevoTotal = nuevaCotizacion.total

  return (
    <div className="space-y-4">
      {/* Cortesía: no se cotiza (decisión de David, 30-sep). Solo se ajusta el número
          de invitados, que sí cuenta para la planeación; el total sigue en $0. */}
      {excedeCotizacion && reserva.cortesia && (
        <div className="bg-morado-bg border border-morado/30 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Gift className="h-4 w-4 text-morado flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm text-verde">
                El manifest tiene {manifestCount} invitados y la reserva dice {cotizados}.
              </p>
              <p
                className="text-xs font-medium text-morado mt-1"
                data-testid="detalle-cortesia-sin-cotizacion"
              >
                Las cortesías no se cotizan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onActualizarCotizacion(manifestCount)}
            disabled={savingCotizacion}
            className="inline-flex items-center gap-1 bg-verde hover:bg-verde-claro text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {savingCotizacion && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Actualizar a {manifestCount} invitados
          </button>
        </div>
      )}

      {/* C38: badge + boton manual (NUNCA recalcula automaticamente) */}
      {excedeCotizacion && !reserva.cortesia && (
        <div className="bg-terracota/5 border border-terracota/30 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="h-4 w-4 text-terracota flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <span className="inline-block bg-terracota/10 text-terracota text-xs font-medium px-2 py-0.5 rounded-full">
                Excede cotización ({manifestCount} invitados vs {cotizados} cotizados)
              </span>
              <p className="text-xs text-verde-suave mt-1">
                El manifest tiene más invitados que los cotizados. Puedes actualizar la
                cotización para recalcular el precio.
              </p>
            </div>
          </div>
          {!confirmando ? (
            <button
              type="button"
              data-testid="manifest-actualizar-cotizacion"
              onClick={() => setConfirmando(true)}
              disabled={savingCotizacion}
              className="inline-flex items-center gap-1 bg-terracota hover:bg-terracota-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Actualizar cotización
            </button>
          ) : (
            <div className="bg-white border border-terracota/30 rounded-lg p-3 space-y-2">
              <p className="text-sm text-verde">
                Esto recalculará el precio de{' '}
                <strong className="tabular-nums">{formatMXN(totalActual)}</strong> a{' '}
                <strong data-testid="manifest-total-previsto" className="tabular-nums text-terracota">
                  {formatMXN(nuevoTotal)}
                </strong>{' '}
                (para {manifestCount} invitados). ¿Continuar?
              </p>
              {cot && !cot.se_reprecia && (
                <p className="text-xs text-verde-suave">{TEXTO_SIN_REPRECIO}.</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="manifest-confirmar-actualizacion"
                  onClick={async () => {
                    await onActualizarCotizacion(manifestCount)
                    setConfirmando(false)
                  }}
                  disabled={savingCotizacion}
                  className="inline-flex items-center gap-1 bg-terracota hover:bg-terracota-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {savingCotizacion && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  Sí, actualizar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  disabled={savingCotizacion}
                  className="px-3 py-1.5 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-neutro-borde rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutro-light border-b border-neutro-borde">
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde w-12">
                #
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Nombre
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde w-20">
                Edad
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde w-28">
                Idioma
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Alergias
              </th>
            </tr>
          </thead>
          <tbody>
            {listaRender.map((inv, idx) => (
              <ManifestRow
                key={idx}
                idx={idx}
                inv={inv}
                esPlaceholder={esPlaceholder}
                onUpdate={onUpdate}
              />
            ))}
          </tbody>
        </table>
        {esPlaceholder && (
          <p className="px-3 py-2 text-xs text-verde-suave bg-neutro-light/40 border-t border-neutro-borde italic">
            Guest 1 — Guest {reserva.numero_invitados_min} auto-generados. Edita
            los nombres directamente o agrega invitados adicionales abajo.
          </p>
        )}
      </div>

      <div className="bg-neutro-light/40 border border-neutro-borde rounded-lg p-4">
        <p className="text-sm font-medium text-verde mb-2">Agregar invitado</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nombre"
            aria-label="Nombre invitado"
            value={nuevoInvitado.nombre ?? ''}
            onChange={(e) =>
              setNuevoInvitado((prev) => ({ ...prev, nombre: e.target.value }))
            }
            className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <input
            type="number"
            min={0}
            placeholder="Edad"
            aria-label="Edad invitado"
            value={nuevoInvitado.edad ?? ''}
            onChange={(e) =>
              setNuevoInvitado((prev) => ({
                ...prev,
                edad: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <select
            aria-label="Idioma invitado"
            value={nuevoInvitado.idioma ?? 'es'}
            onChange={(e) =>
              setNuevoInvitado((prev) => ({ ...prev, idioma: e.target.value }))
            }
            className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          >
            <option value="es">Espanol</option>
            <option value="en">Ingles</option>
          </select>
          <input
            type="text"
            placeholder="Alergias"
            aria-label="Alergias invitado"
            value={nuevoInvitado.alergias ?? ''}
            onChange={(e) =>
              setNuevoInvitado((prev) => ({ ...prev, alergias: e.target.value }))
            }
            className="border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex items-center gap-1 bg-terracota hover:bg-terracota-dark text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar invitado
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// TAB 4 — Pagos
// ============================================================================
function TabPagos({
  reserva,
  totalPagado,
  saldoPendiente,
  cortesia,
  onAbrirPagoManual,
  onAbrirLinkMP,
  reenvioCotizacion,
  onReenviarCotizacion,
}: {
  reserva: Reserva
  totalPagado: number
  saldoPendiente: number
  cortesia: boolean
  onAbrirPagoManual: () => void
  onAbrirLinkMP: () => void
  reenvioCotizacion: EstadoReenvioCotizacion
  onReenviarCotizacion: () => void
}) {
  const pagos = reserva.pagos ?? []
  const total = Number(reserva.monto_total)
  const porcentaje = total > 0 ? Math.min(100, (totalPagado / total) * 100) : 0
  // Cortesía: lo que valdría (experiencia + add-ons), solo de referencia.
  const valorCortesia = Number(reserva.precio_base) + Number(reserva.monto_addons)

  return (
    <div className="space-y-4">
      <DesgloseCotizacion reserva={reserva} />

      {cortesia && (
        <div
          role="status"
          data-testid="pagos-cortesia"
          className="bg-morado-bg border border-morado/30 rounded-lg p-3 flex items-start gap-2"
        >
          <Gift className="h-5 w-5 text-morado flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-morado">Cortesía: no se cobra</p>
            <p className="text-xs text-verde-suave mt-0.5">
              Sin anticipo ni link de pago. Para cobrarla, quita la casilla «Cortesía» en la
              pestaña Datos.
            </p>
            <p
              className="text-xs font-medium text-morado mt-1"
              data-testid="detalle-cortesia-sin-cotizacion"
            >
              Las cortesías no se cotizan.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-verde-suave">Valor de la cortesía</p>
            <p className="text-base font-display font-semibold text-verde tabular-nums">
              {formatMXN(valorCortesia)}
            </p>
            {Number(reserva.monto_addons) > 0 && (
              <p className="text-xs text-verde-suave tabular-nums">
                Experiencia {formatMXN(Number(reserva.precio_base))} · Add-ons{' '}
                {formatMXN(Number(reserva.monto_addons))}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-verde/10 border border-verde/30 rounded-lg p-3">
          <p className="text-xs text-verde-suave">Total pagado</p>
          <p className="text-lg font-display font-semibold text-verde tabular-nums">
            {formatMXN(totalPagado)}
          </p>
        </div>
        <div className="bg-terracota/5 border border-terracota/20 rounded-lg p-3">
          <p className="text-xs text-verde-suave">Total reserva</p>
          <p className="text-lg font-display font-semibold text-verde tabular-nums">
            {formatMXN(total)}
          </p>
        </div>
        <div className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-3">
          <p className="text-xs text-verde-suave">Saldo pendiente</p>
          <p className="text-lg font-display font-semibold text-amarillo tabular-nums">
            {formatMXN(saldoPendiente)}
          </p>
        </div>
      </div>

      {!cortesia && (
        <div className="bg-white border border-neutro-borde rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-verde-suave mb-1">
            <span>Progreso de pago</span>
            <span className="tabular-nums">{porcentaje.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-neutro-light overflow-hidden">
            <div
              className="h-full bg-verde rounded-full transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      )}

      {/* R1: a 390 px las 6 columnas no caben; la tabla se desplaza aquí dentro (antes se cortaban
          Estado y Ref MP con overflow-hidden) */}
      <div className="bg-white border border-neutro-borde rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutro-light border-b border-neutro-borde">
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Fecha
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Tipo
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Metodo
              </th>
              <th scope="col" className="text-right px-3 py-2 font-medium text-verde">
                Monto
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Estado
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Ref MP
              </th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-verde-suave">
                  No hay pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((p) => (
                <tr key={p.id} className="border-b border-neutro-borde">
                  <td className="px-3 py-2 text-verde whitespace-nowrap">
                    {formatFechaMexico(p.fecha_pago ?? p.fecha_registro)}
                  </td>
                  <td className="px-3 py-2 text-verde">{p.tipo_pago}</td>
                  <td className="px-3 py-2 text-verde">
                    {p.mp_payment_method ?? p.origen}
                  </td>
                  <td className="px-3 py-2 text-right text-verde tabular-nums font-medium">
                    {formatMXN(Number(p.monto_total))}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.mp_status === 'approved'
                          ? 'bg-verde/10 text-verde border border-verde/30'
                          : p.mp_status === 'cancelled'
                            ? 'bg-neutro-light text-verde-suave border border-neutro-borde'
                            : 'bg-amarillo-bg text-verde border border-amarillo/30'
                      }`}
                    >
                      {p.mp_status}
                    </span>
                    {estadoPagoTexto(p) && (
                      <p className="text-xs text-verde-suave mt-0.5">{estadoPagoTexto(p)}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">
                    {p.init_point ? (
                      <a
                        href={p.init_point}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracota hover:text-terracota-dark underline"
                        title={p.mp_preference_id ?? undefined}
                      >
                        Abrir link
                      </a>
                    ) : (
                      <span className="text-verde-suave">
                        {p.mp_payment_id ?? p.mp_preference_id ?? '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!cortesia && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAbrirPagoManual}
            className="inline-flex items-center gap-2 bg-verde hover:bg-verde-claro text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Pago manual
          </button>
          <button
            type="button"
            onClick={onAbrirLinkMP}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Generar link MP
          </button>
          {/* COT1 (R1): si el correo de la cotización falló, se reenvía desde aquí (antes, a mano) */}
          <button
            type="button"
            data-testid="detalle-reenviar-cotizacion"
            onClick={onReenviarCotizacion}
            disabled={reenvioCotizacion.tipo === 'enviando'}
            className="inline-flex items-center gap-2 border border-neutro-borde text-verde hover:bg-neutro-light px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reenvioCotizacion.tipo === 'enviando' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
            Reenviar cotización
          </button>
        </div>
      )}
      {!cortesia && reenvioCotizacion.tipo === 'ok' && (
        <p
          data-testid="detalle-cotizacion-resultado"
          role="status"
          className="bg-verde/10 border border-verde/30 rounded-lg p-3 text-sm text-verde"
        >
          {reenvioCotizacion.texto}
        </p>
      )}
      {!cortesia && reenvioCotizacion.tipo === 'error' && (
        <p
          data-testid="detalle-cotizacion-error"
          role="alert"
          className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo"
        >
          No se pudo reenviar la cotización: {reenvioCotizacion.mensaje}
        </p>
      )}
    </div>
  )
}

/** «12 %», «12.5 %» */
function textoPorcentaje(pct: number): string {
  return `${Number(pct).toLocaleString('es-MX', { maximumFractionDigits: 2 })} %`
}

// F2: el desglose de `reserva.cotizacion` (C5). Las cifras de desglose salen de cotizar() sobre lo
// guardado; los montos (subtotal, propina, total…) son los GUARDADOS.
function DesgloseCotizacion({ reserva }: { reserva: Reserva }) {
  const cot = reserva.cotizacion
  if (!cot) return null
  const fijo = !cot.se_reprecia
  const montoCupon = Number(cot.monto_cupon ?? 0)
  const codigoCupon = cot.cupon?.codigo ?? reserva.cupon_codigo ?? reserva.codigo_promocional ?? ''
  const comision = cot.comision_pct ?? reserva.comision_pct ?? null
  const cortesia = reserva.cortesia === true
  // Cortesía: los renglones son de referencia; este cuadra la suma con el total ($0)
  const ajusteCortesia = cortesia
    ? redondearCentavos(
        cot.subtotal_experiencia +
          cot.subtotal_addons +
          cot.propina_monto -
          cot.monto_descuento -
          montoCupon -
          cot.monto_total,
      )
    : 0

  return (
    <section
      data-testid="detalle-cotizacion"
      aria-labelledby="detalle-cotizacion-titulo"
      className="bg-white border border-neutro-borde rounded-lg p-3 space-y-1"
    >
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h3 id="detalle-cotizacion-titulo" className="text-sm font-semibold text-verde">
          Cotización
        </h3>
        {cot.fuente_precio === 'tarifa_reseller' && (
          <span
            data-testid="detalle-tarifa"
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-verde/10 text-verde border border-verde/30"
          >
            Tarifa de reseller
          </span>
        )}
      </div>

      {fijo ? (
        <LineaCotizacion
          testid="detalle-linea-experiencia-sheet"
          etiqueta="Experiencia (precio guardado del Sheet)"
          monto={cot.subtotal_experiencia}
        />
      ) : (
        <>
          <LineaCotizacion
            testid="detalle-linea-grupo"
            etiqueta={`Grupo (hasta ${cot.invitados_incluidos} personas)`}
            monto={cot.precio_base_experiencia}
          />
          {cot.adultos_adicionales > 0 && (
            <LineaCotizacion
              testid="detalle-linea-adultos-adicionales"
              etiqueta={textoAdultosAdicionales(cot.adultos_adicionales, cot.precio_adicional_por_persona)}
              monto={redondearCentavos(cot.adultos_adicionales * cot.precio_adicional_por_persona)}
            />
          )}
          {cot.ninos_adicionales > 0 && (
            <LineaCotizacion
              testid="detalle-linea-ninos-adicionales"
              etiqueta={textoNinosAdicionales(cot.ninos_adicionales, cot.precio_nino_adicional)}
              monto={redondearCentavos(cot.ninos_adicionales * cot.precio_nino_adicional)}
            />
          )}
          <LineaCotizacion
            testid="detalle-linea-subtotal-experiencia"
            etiqueta="Subtotal experiencia"
            monto={cot.subtotal_experiencia}
            fuerte
          />
        </>
      )}
      {cot.subtotal_addons > 0 && (
        <LineaCotizacion testid="detalle-linea-addons" etiqueta="Add-ons" monto={cot.subtotal_addons} />
      )}
      {!cortesia && (
        <LineaCotizacion
          testid="detalle-linea-propina"
          etiqueta={`Propina (${textoPorcentaje(cot.propina_pct)})`}
          monto={cot.propina_monto}
        />
      )}
      {cot.monto_descuento > 0 && (
        <LineaCotizacion
          testid="detalle-linea-descuento"
          etiqueta={reserva.motivo_descuento ? `Descuento (${reserva.motivo_descuento})` : 'Descuento'}
          monto={cot.monto_descuento}
          negativo
        />
      )}
      {montoCupon > 0 && (
        <LineaCotizacion
          testid="detalle-cupon"
          etiqueta={`Cupón ${codigoCupon}:`}
          monto={montoCupon}
          negativo
        />
      )}
      {ajusteCortesia > 0 && (
        <LineaCotizacion
          testid="detalle-linea-cortesia"
          etiqueta="Cortesía (no se cobra)"
          monto={ajusteCortesia}
          negativo
        />
      )}
      <div className="border-t border-neutro-borde pt-1">
        <LineaCotizacion testid="detalle-total" etiqueta="Total" monto={cot.monto_total} fuerte />
      </div>
      {comision != null && (
        <p data-testid="detalle-comision" className="text-xs text-verde-suave pt-1">
          Comisión del reseller: {textoPorcentaje(comision)}
        </p>
      )}
    </section>
  )
}

// Pagos (Fase 2): qué es cada fila. Link = generado en el panel (sin mp_payment_id);
// su mp_status_detail dice si sigue sin cobrar, si se cobró o por qué se anuló.
const ESTADO_LINK: Record<string, string> = {
  link_generado: 'Link sin cobrar',
  link_cobrado: 'Link ya cobrado',
  anulado_por_cortesia: 'Link anulado al marcar la reserva como cortesía',
  anulado_por_cancelacion: 'Link anulado al cancelar la reserva',
  anulado_por_pago_manual: 'Link anulado por un pago manual (pedía más que el saldo)',
}

function esPagoManual(p: PagoReserva): boolean {
  return p.origen === 'manual' || p.mp_status_detail === 'manual'
}

function esLinkDePago(p: PagoReserva): boolean {
  return !p.mp_payment_id && !esPagoManual(p)
}

/** Una línea bajo el estado en la tabla de Pagos (null = no hace falta explicar). */
function estadoPagoTexto(p: PagoReserva): string | null {
  if (esLinkDePago(p)) {
    if (p.mp_status_detail && ESTADO_LINK[p.mp_status_detail]) return ESTADO_LINK[p.mp_status_detail]
    return p.mp_status === 'pending' ? ESTADO_LINK.link_generado : null
  }
  if (p.mp_payment_id && (p.mp_status === 'pending' || p.mp_status === 'in_process')) {
    return 'En camino (OXXO o en revisión)'
  }
  return null
}

const TIPO_PAGO_TEXTO: Record<string, string> = {
  anticipo: 'anticipo',
  balance: 'saldo',
  unico: 'pago único',
  pago_parcial: 'pago parcial',
  reembolso: 'reembolso',
  suscripcion: 'suscripción',
}

function tituloPagoMercadoPago(status: string): string {
  switch (status) {
    case 'approved':
      return 'Pago de MercadoPago acreditado'
    case 'pending':
    case 'in_process':
      return 'Pago de MercadoPago en camino (OXXO o en revisión)'
    case 'rejected':
      return 'Pago de MercadoPago rechazado'
    case 'refunded':
      return 'Pago de MercadoPago devuelto'
    case 'cancelled':
      return 'Pago de MercadoPago cancelado'
    default:
      return `Pago de MercadoPago (${status})`
  }
}

// ============================================================================
// TAB 5 — Comunicaciones (DT1-a, 30-sep): los correos que el sistema mandó o intentó
// mandar para esta reserva, de GET /api/admin/reservas/{id}/comunicaciones.
// ============================================================================
const MAX_ERROR_DETALLE = 120

function truncar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto
}

/** EM1 (R1 §3.7): `tipo` de los correos SIN plantilla, que desde R1 también llegan en `tipo`
 *  (COALESCE(e.tipo, p.tipo), §3.6). Los de plantilla se nombran con TIPO_LABELS. */
const TIPO_CORREO_SIN_PLANTILLA: Record<string, string> = {
  interna: 'Aviso interno',
  guias: 'Aviso a guías',
  catering: 'Correo de catering',
  aviso_movida: 'Aviso web: fecha movida',
  aviso_cancelada: 'Aviso web: fecha cancelada',
  aviso_reactivada: 'Aviso web: fecha reactivada',
  recordatorio_web: 'Recordatorio (compra web)',
}

/** Tipo de plantilla en español; los avisos sin plantilla se nombran por su asunto. Los asuntos
 *  especiales (sin plantilla, sin correo, PDF fallido) van primero: desde R1 esas filas también
 *  traen `tipo` y si no se perdería el porqué. */
function etiquetaComunicacion(c: Comunicacion): string {
  const asunto = (c.asunto ?? '').trim()
  // _enviar_para_reserva registra «(plantilla <tipo>/<idioma> faltante)» cuando no hay plantilla
  const faltante = /^\(plantilla ([a-z_]+)\/[a-z]+ faltante\)$/.exec(asunto)
  if (faltante) {
    const tipo = (TIPO_LABELS as Record<string, string>)[faltante[1]] ?? faltante[1]
    return `${tipo} (sin plantilla)`
  }
  if (asunto.includes('falta email')) return 'Correo al cliente (sin correo registrado)'
  if (asunto.includes('PDF cotizacion')) return 'Cotización (no se generó el PDF)'
  const deplantilla = c.tipo ? (TIPO_LABELS as Record<string, string>)[c.tipo] : undefined
  if (deplantilla) return deplantilla
  if (asunto.startsWith('Nueva reserva')) return 'Aviso interno: nueva reserva'
  // RG1: avisar_guias_reagendamiento (asunto exacto «Cambio de fecha: {folio} — {experiencia}»)
  if (asunto.startsWith('Cambio de fecha:')) return 'Aviso a guía: cambio de fecha'
  if (c.tipo) return TIPO_CORREO_SIN_PLANTILLA[c.tipo] ?? c.tipo
  return 'Aviso interno'
}

const ESTADO_CORREO: Record<string, { label: string; clase: string }> = {
  enviado: { label: 'Enviado', clase: 'bg-verde/10 text-verde border border-verde/30' },
  fallido: { label: 'No se envió', clase: 'bg-rojo-bg text-rojo border border-rojo/30' },
}

function TabComunicaciones({ estado }: { estado: EstadoComunicaciones }) {
  const { items, error, recargar } = estado

  // Primera carga (el padre la lanza al abrir la pestaña): sin datos todavía = cargando
  if (items === null && !error) {
    return (
      <div
        data-testid="comunicaciones-cargando"
        className="flex items-center gap-2 text-sm text-verde-suave py-6 justify-center"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Cargando correos…
      </div>
    )
  }

  if (error) {
    return (
      <div
        data-testid="comunicaciones-error"
        role="alert"
        className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo flex items-start gap-2"
      >
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="flex-1">No se pudieron cargar los correos: {error}</p>
        <button
          type="button"
          onClick={() => recargar()}
          className="text-xs underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const lista = items ?? []
  if (lista.length === 0) {
    return (
      <div
        data-testid="comunicaciones-vacio"
        className="bg-neutro-light/40 border border-neutro-borde rounded-lg p-6 text-center"
      >
        <Info className="h-8 w-8 mx-auto text-verde-suave mb-2" aria-hidden="true" />
        <p className="text-sm text-verde">Sin correos registrados</p>
        <p className="text-xs text-verde-suave mt-1">
          Aquí aparecen la confirmación, el recordatorio, la cotización, el reagendamiento, la
          cancelación, el link de pago, los avisos a guías y los avisos internos que el sistema
          mande para esta reserva.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-verde-suave">
        {lista.length} {lista.length === 1 ? 'correo' : 'correos'} (enviados o intentados), del
        más reciente al más antiguo.
      </p>
      <div className="bg-white border border-neutro-borde rounded-lg overflow-x-auto">
        <table data-testid="comunicaciones-lista" className="w-full text-sm">
          <thead>
            <tr className="bg-neutro-light border-b border-neutro-borde">
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Fecha
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Tipo
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Para
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Asunto
              </th>
              <th scope="col" className="text-left px-3 py-2 font-medium text-verde">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => {
              const estado = ESTADO_CORREO[c.estado ?? ''] ?? {
                label: c.estado ?? '—',
                clase: 'bg-amarillo-bg text-verde border border-amarillo/30',
              }
              return (
                <tr
                  key={c.id}
                  data-testid="comunicacion-fila"
                  data-estado={c.estado ?? ''}
                  className="border-b border-neutro-borde align-top"
                >
                  <td className="px-3 py-2 text-verde whitespace-nowrap">
                    {formatFechaHoraMexico(c.enviado_at ?? c.enviado_fecha)}
                  </td>
                  <td data-testid="comunicacion-tipo" className="px-3 py-2 text-verde">
                    {etiquetaComunicacion(c)}
                  </td>
                  <td className="px-3 py-2 text-verde break-all">
                    {c.destinatario_email || '—'}
                  </td>
                  <td data-testid="comunicacion-asunto" className="px-3 py-2 text-verde">
                    {c.asunto || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${estado.clase}`}
                    >
                      {estado.label}
                    </span>
                    {c.error_detalle && (
                      <p data-testid="comunicacion-error" className="text-xs text-rojo mt-1">
                        {truncar(c.error_detalle, MAX_ERROR_DETALLE)}
                      </p>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


// ============================================================================
// TAB 6 — Auditoria (DT1-b, 30-sep): línea de tiempo armada SOLO con lo que ya queda
// registrado con fecha: alta, notas fechadas, pagos/links, correos y guías asignados.
// ============================================================================
type TipoEventoAuditoria = 'alta' | 'nota' | 'pago' | 'correo' | 'guia'

interface EventoAuditoria {
  tipo: TipoEventoAuditoria
  /** 'AAAA-MM-DD HH:MM:SS' en hora de México: ordena y se pinta. */
  clave: string
  /** false = solo hay día (correo sin hora): no se inventa hora. */
  conHora: boolean
  /** Desempate a igual clave: el mayor es el más nuevo. */
  orden: number
  titulo: string
  detalle?: string
  quien?: string
}

const FORMATO_CLAVE_MEXICO = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Mexico_City',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/** ISO con zona → 'AAAA-MM-DD HH:MM:SS' en hora de México (null si no es fecha). */
function claveMexico(iso: string | null | undefined): string | null {
  if (!iso) return null
  const fecha = new Date(iso)
  if (isNaN(fecha.getTime())) return null
  const partes: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {}
  for (const p of FORMATO_CLAVE_MEXICO.formatToParts(fecha)) partes[p.type] = p.value
  return `${partes.year}-${partes.month}-${partes.day} ${partes.hour}:${partes.minute}:${partes.second}`
}

function pintarClave(ev: EventoAuditoria): string {
  const dia = formatFechaMexico(ev.clave.slice(0, 10))
  return ev.conHora ? `${dia}, ${ev.clave.slice(11, 16)}` : dia
}

// Renglones que escriben el panel y el sistema en notas_internas (C9): ya vienen en hora de México
const NOTA_FECHADA = /^\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})(?: ([^\]]+))?\]\s*(.*)$/

function eventoDeNota(texto: string, quien: string | undefined): { titulo: string; detalle: string } {
  const m = /^(CANCELADA|REAGENDADA):\s*(.*)$/.exec(texto)
  if (m) {
    return { titulo: m[1] === 'CANCELADA' ? 'Reserva cancelada' : 'Reserva reagendada', detalle: m[2] }
  }
  return { titulo: quien ? 'Nota interna' : 'Aviso del sistema', detalle: texto }
}

function armarEventos(reserva: Reserva, correos: Comunicacion[]): EventoAuditoria[] {
  const eventos: EventoAuditoria[] = []
  const agregar = (ev: Omit<EventoAuditoria, 'orden'>) => eventos.push({ ...ev, orden: eventos.length })

  const alta = claveMexico(reserva.fecha_creacion)
  if (alta) {
    agregar({
      tipo: 'alta',
      clave: alta,
      conHora: true,
      titulo: 'Reserva creada',
      detalle: `Folio ${reserva.booking_id}${
        reserva.origen === 'sheet_2026' ? ' · cargada del Sheet de planeación' : ''
      }`,
    })
  }

  for (const g of reserva.guias ?? []) {
    const clave = claveMexico(g.asignado_en)
    if (!clave) continue
    agregar({ tipo: 'guia', clave, conHora: true, titulo: 'Guía asignado', detalle: g.nombre })
  }

  // La API los manda del más nuevo al más viejo: se recorren al revés para que el desempate
  // (mismo segundo) deje arriba el más nuevo
  for (const p of [...(reserva.pagos ?? [])].reverse()) {
    const monto = formatMXN(Number(p.monto_total))
    const tipo = TIPO_PAGO_TEXTO[p.tipo_pago] ?? p.tipo_pago
    if (esPagoManual(p)) {
      const clave = claveMexico(p.fecha_pago ?? p.fecha_registro)
      if (!clave) continue
      agregar({
        tipo: 'pago',
        clave,
        conHora: true,
        titulo: 'Pago manual registrado',
        detalle: [monto, tipo, p.mp_payment_method].filter(Boolean).join(' · '),
      })
    } else if (p.mp_payment_id) {
      const clave = claveMexico(p.fecha_pago ?? p.fecha_registro)
      if (!clave) continue
      agregar({
        tipo: 'pago',
        clave,
        conHora: true,
        titulo: tituloPagoMercadoPago(p.mp_status),
        detalle: [monto, p.mp_payment_method, `pago ${p.mp_payment_id}`].filter(Boolean).join(' · '),
      })
    } else {
      // Link: se fecha cuando se generó; su estado de hoy (cobrado/anulado) va en el detalle
      const clave = claveMexico(p.fecha_registro)
      if (!clave) continue
      agregar({
        tipo: 'pago',
        clave,
        conHora: true,
        titulo: 'Link de pago generado',
        detalle: [monto, tipo, estadoPagoTexto(p) ?? p.mp_status].join(' · '),
      })
      // Cuándo se cobró o se anuló (pagos[].cerrado_en); sin ese dato, solo queda el estado de arriba
      const cierre = claveMexico(p.cerrado_en)
      if (cierre) {
        const detalleLink = p.mp_status_detail ?? ''
        agregar({
          tipo: 'pago',
          clave: cierre,
          conHora: true,
          titulo:
            detalleLink === 'link_cobrado'
              ? 'Link de pago cobrado'
              : detalleLink.startsWith('anulado_')
                ? 'Link de pago anulado'
                : 'Link de pago cerrado',
          detalle: [monto, tipo, ESTADO_LINK[detalleLink] ?? p.mp_status].join(' · '),
        })
      }
    }
  }

  for (const c of correos) {
    const clave = claveMexico(c.enviado_at)
    const soloDia = !clave && c.enviado_fecha ? `${c.enviado_fecha} 00:00:00` : null
    if (!clave && !soloDia) continue
    const estado = ESTADO_CORREO[c.estado ?? '']?.label ?? c.estado ?? '—'
    agregar({
      tipo: 'correo',
      clave: clave ?? soloDia ?? '',
      conHora: !!clave,
      titulo: `Correo: ${etiquetaComunicacion(c)}`,
      detalle: `${estado} · para ${c.destinatario_email || '—'}${
        c.asunto ? ` · «${truncar(c.asunto, MAX_ERROR_DETALLE)}»` : ''
      }`,
    })
  }

  for (const linea of (reserva.notas_internas ?? '').split('\n')) {
    const m = NOTA_FECHADA.exec(linea.trim())
    if (!m) continue
    const [, fecha, hora, quien, texto] = m
    const { titulo, detalle } = eventoDeNota(texto, quien)
    agregar({ tipo: 'nota', clave: `${fecha} ${hora}:00`, conHora: true, titulo, detalle, quien })
  }

  // Más nuevo arriba
  return eventos.sort((a, b) =>
    a.clave === b.clave ? b.orden - a.orden : a.clave < b.clave ? 1 : -1,
  )
}

const ICONO_EVENTO: Record<TipoEventoAuditoria, typeof CalendarClock> = {
  alta: CalendarClock,
  nota: StickyNote,
  pago: CreditCard,
  correo: Mail,
  guia: UserCheck,
}

function TabAuditoria({
  reserva,
  comunicaciones,
}: {
  reserva: Reserva
  comunicaciones: EstadoComunicaciones
}) {
  const { items, error, recargar } = comunicaciones
  const eventos = useMemo(() => armarEventos(reserva, items ?? []), [reserva, items])

  return (
    <div className="space-y-3">
      <p className="text-xs text-verde-suave">
        Del más reciente al más antiguo. Último cambio guardado:{' '}
        {formatFechaHoraMexico(reserva.fecha_actualizacion)}.
      </p>

      {items === null && !error && (
        <p className="text-xs text-verde-suave flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Cargando los correos…
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="bg-rojo-bg border border-rojo/30 rounded-lg p-2 text-xs text-rojo flex items-start gap-2"
        >
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="flex-1">No se pudieron cargar los correos (faltan en la lista): {error}</p>
          <button type="button" onClick={() => recargar()} className="underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      <ol className="space-y-2">
        {eventos.map((ev) => {
          const Icono = ICONO_EVENTO[ev.tipo]
          return (
            <li
              key={`${ev.tipo}-${ev.orden}`}
              data-testid="auditoria-evento"
              data-tipo={ev.tipo}
              className="border border-neutro-borde rounded-lg p-3 bg-white flex gap-3"
            >
              <Icono className="h-5 w-5 text-verde-suave flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-verde">{ev.titulo}</p>
                <p className="text-xs text-verde-suave">
                  {pintarClave(ev)}
                  {ev.quien ? ` · ${ev.quien}` : ''}
                </p>
                {ev.detalle && <p className="text-xs text-verde break-words mt-0.5">{ev.detalle}</p>}
              </div>
            </li>
          )
        })}
      </ol>

      <p className="text-xs text-verde-suave italic">
        Aquí sale lo que queda registrado con fecha: el alta, las notas fechadas (cancelar,
        reagendar, avisos del sistema), los pagos y links, los correos y los guías asignados. No se
        registran los cambios sueltos de campos (invitados, precio, chinampa, notas sin fecha…) ni
        quién los hizo.
      </p>
    </div>
  )
}

// ============================================================================
// TAB 7 — Acciones
// ============================================================================
function TabAcciones({
  realizada,
  marcandoRealizada,
  onMarcarRealizada,
  cancelada,
  pagosEnCamino: nPagosEnCamino,
  linksPorVencer,
  notificarCliente,
  setNotificarCliente,
  cancelando,
  flagSap,
  setFlagSap,
  numeroOvSap,
  setNumeroOvSap,
  onSaveSap,
  onAbrirReagendar,
  motivoCancelacion,
  setMotivoCancelacion,
  procesarReembolso,
  setProcesarReembolso,
  onCancelarReserva,
}: {
  /** B6: si se puede marcar como realizada y, si no, por qué (se muestra). */
  realizada: { puede: boolean; motivo: string | null }
  marcandoRealizada: boolean
  onMarcarRealizada: () => void
  cancelada: boolean
  /** Pagos de MercadoPago sin acreditar (OXXO, en revisión): D15. */
  pagosEnCamino: number
  /** Links sin cobrar que se vencen al cancelar (CN1). */
  linksPorVencer: number
  notificarCliente: boolean
  setNotificarCliente: (v: boolean) => void
  cancelando: boolean
  flagSap: boolean
  setFlagSap: (v: boolean) => void
  numeroOvSap: string
  setNumeroOvSap: (v: string) => void
  onSaveSap: () => void
  onAbrirReagendar: () => void
  motivoCancelacion: string
  setMotivoCancelacion: (v: string) => void
  procesarReembolso: boolean
  setProcesarReembolso: (v: boolean) => void
  onCancelarReserva: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="border border-verde/30 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-semibold text-verde mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Marcar como realizada
        </h3>
        <p className="text-sm text-verde-suave mb-2">
          Cuando la experiencia ya ocurrió. Solo desde Confirmada o Pagada, el día de la experiencia o
          después.
        </p>
        <button
          type="button"
          data-testid="accion-realizada"
          onClick={onMarcarRealizada}
          disabled={!realizada.puede || marcandoRealizada}
          aria-describedby={realizada.motivo ? 'accion-realizada-motivo' : undefined}
          className="inline-flex items-center gap-2 bg-verde hover:bg-verde-claro text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {marcandoRealizada ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          )}
          Marcar como realizada
        </button>
        {realizada.motivo && (
          <p
            id="accion-realizada-motivo"
            data-testid="accion-realizada-motivo"
            className="mt-2 text-xs text-verde-suave"
          >
            {realizada.motivo}
          </p>
        )}
      </div>

      <div className="border border-verde/30 rounded-lg p-4 bg-verde/5">
        <h3 className="text-sm font-semibold text-verde mb-2">Marcar en SAP</h3>
        <label className="flex items-center gap-2 text-sm text-verde cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={flagSap}
            onChange={(e) => setFlagSap(e.target.checked)}
            className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
          />
          Reserva subida a SAP
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="sap-ov"
            className="text-sm text-verde-suave whitespace-nowrap"
          >
            Numero OV SAP:
          </label>
          <input
            id="sap-ov"
            type="text"
            value={numeroOvSap}
            onChange={(e) => setNumeroOvSap(e.target.value)}
            placeholder="OV-12345"
            className="flex-1 min-w-0 border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <button
            type="button"
            onClick={onSaveSap}
            className="bg-verde hover:bg-verde-claro text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            Guardar SAP
          </button>
        </div>
      </div>

      <div className="border border-azul/30 rounded-lg p-4 bg-azul-bg">
        <h3 className="text-sm font-semibold text-azul mb-2">Reagendar</h3>
        <p className="text-sm text-verde-suave mb-2">
          {cancelada
            ? 'Una reserva cancelada no se puede reagendar.'
            : 'Cambia la fecha y la hora de inicio; la hora de término se mueve igual. Al reagendar eliges si se avisa por correo al cliente (con la plantilla Reagendamiento, cuando esté activa) y a los guías asignados que tengan correo.'}
        </p>
        <button
          type="button"
          onClick={onAbrirReagendar}
          disabled={cancelada}
          className="inline-flex items-center gap-2 bg-azul hover:opacity-90 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Abrir reagendado
        </button>
      </div>

      <div className="border border-rojo/30 rounded-lg p-4 bg-rojo-bg/50">
        <h3 className="text-sm font-semibold text-rojo mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Cancelar reserva
        </h3>
        {cancelada ? (
          <p className="text-sm text-verde">Esta reserva ya está cancelada.</p>
        ) : (
          <>
            <label
              htmlFor="cancel-motivo"
              className="block text-sm text-verde-suave mb-1"
            >
              Motivo
            </label>
            <textarea
              id="cancel-motivo"
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              rows={2}
              maxLength={1000}
              className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rojo/30 focus:border-rojo"
              placeholder="Razon de la cancelacion..."
            />
            <label className="flex items-center gap-2 text-sm text-verde cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={procesarReembolso}
                onChange={(e) => setProcesarReembolso(e.target.checked)}
                className="w-4 h-4 text-rojo border-neutro-borde rounded focus:ring-rojo"
              />
              Procesar reembolso de pagos aprobados
            </label>
            <label className="flex items-start gap-2 text-sm text-verde cursor-pointer mt-2">
              <input
                type="checkbox"
                data-testid="cancel-notificar-cliente"
                checked={notificarCliente}
                onChange={(e) => setNotificarCliente(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-rojo border-neutro-borde rounded focus:ring-rojo"
              />
              <span>
                Avisar al cliente por correo
                <span className="block text-xs text-verde-suave">
                  Con la plantilla Cancelación, solo si está activa en su idioma y el cliente tiene
                  correo real (las reservas del Sheet y de reseller no reciben correos).
                </span>
              </span>
            </label>

            {(nPagosEnCamino > 0 || linksPorVencer > 0) && (
              <div className="mt-3 space-y-2">
                {nPagosEnCamino > 0 && (
                  <p
                    data-testid="cancel-aviso-en-camino"
                    role="status"
                    className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-3 text-sm text-verde flex gap-2"
                  >
                    <AlertTriangle
                      className="h-4 w-4 flex-shrink-0 mt-0.5 text-amarillo"
                      aria-hidden="true"
                    />
                    <span>{AVISO_PAGO_EN_CAMINO}</span>
                  </p>
                )}
                {linksPorVencer > 0 && (
                  <p
                    data-testid="cancel-aviso-links"
                    className="bg-white border border-neutro-borde rounded-lg p-3 text-sm text-verde flex gap-2"
                  >
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-azul" aria-hidden="true" />
                    <span>
                      {textoLinksPorVencer(linksPorVencer)} MercadoPago deja de aceptarlos; si no
                      responde, te avisamos para vencerlos a mano.
                    </span>
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onCancelarReserva}
              disabled={cancelando}
              className="mt-3 inline-flex items-center gap-2 bg-rojo hover:opacity-90 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelando ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              )}
              Cancelar reserva
            </button>
          </>
        )}
      </div>
    </div>
  )
}
