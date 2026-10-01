'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Search, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { useVendedoras, type Vendedora } from '@/hooks/useVendedoras'
import { hoyMexico } from '@/app/admin/eventos/components/fechas'
import type { ItemCatalogo, ListaCatalogo, TipoCatalogo } from '@/types/planeacion'
import {
  calcularCotizacion,
  formatMXN,
  initialWizardData,
  redondearCentavos,
  textoCorreo,
  textoCupon,
  type CuponEvaluado,
  type ExperienciaCatalogo,
  type IdiomaCliente,
  type Personal,
  type PreciosReserva,
  type Reserva,
  type ResultadoCorreo,
  type Reseller,
  type WizardAction,
  type WizardAddon,
  type WizardData,
  type WizardStep,
} from '@/types/reservas'
import WizardSteps from '../../components/WizardSteps'
import MultiSelectGuias from '../../components/MultiSelectGuias'
import { extraerMensajeError } from './errores'
import LineaCotizacion, { textoAdultosAdicionales, textoNinosAdicionales } from './LineaCotizacion'

interface ModalNuevaReservaProps {
  onClose: () => void
  /** `avisos`: lo que el paso 6 no pudo hacer (link MP, envio de la cotizacion). */
  onCreated: (id: string, bookingId: string, avisos?: string[]) => void
  /** RC1: YYYY-MM-DD del día tocado en el calendario. Solo se precarga si es hoy o después
   *  (hoy de México): el back rechaza las fechas pasadas (PD1). */
  fechaSugerida?: string
  /** LD2-b: lead con el que se abre (Leads › «Convertir a reserva»). Se lee de
   *  `GET /api/admin/leads/{id}` y precarga el paso 1 (y la experiencia si está en la lista). */
  leadIdInicial?: string
}

const STEPS: { num: number; label: string }[] = [
  { num: 1, label: 'Cliente' },
  { num: 2, label: 'Experiencia' },
  { num: 3, label: 'Add-ons' },
  { num: 4, label: 'Cotizacion' },
  { num: 5, label: 'Asignaciones' },
  { num: 6, label: 'Confirmacion' },
]

// Catalogos editables de PS1 (/admin/catalogos). Chinampa se guarda por NOMBRE;
// fuente y cocina por id.
const TIPOS_CATALOGO: TipoCatalogo[] = ['fuentes', 'chinampas', 'cocinas']

interface EstadoCatalogo {
  items: ItemCatalogo[]
  cargando: boolean
  error: string | null
}

type Catalogos = Record<TipoCatalogo, EstadoCatalogo>

const CATALOGOS_INICIALES: Catalogos = {
  fuentes: { items: [], cargando: true, error: null },
  chinampas: { items: [], cargando: true, error: null },
  cocinas: { items: [], cargando: true, error: null },
}

interface GrupoCatalogo {
  tipo: string
  etiqueta: string
}

const GRUPOS_FUENTE: GrupoCatalogo[] = [
  { tipo: 'canal', etiqueta: 'Canal' },
  { tipo: 'persona', etiqueta: 'Persona' },
]

const GRUPOS_COCINA: GrupoCatalogo[] = [
  { tipo: 'cocina', etiqueta: 'Cocina' },
  { tipo: 'chef_invitado', etiqueta: 'Chef invitado' },
]

// RF1 (R1): la lista de resellers sale SOLO de la API. Antes, si fallaba, se ofrecía una lista fija
// con ids «fallback-*» y el alta mandaba un id falso (400 «reseller_id inválido»). Ahora: aviso,
// botón de reintentar y el select sin opciones (sin reseller no se avanza; «Cliente directo» sí).
type EstadoResellers =
  | { tipo: 'cargando' }
  | { tipo: 'ok' }
  | { tipo: 'error'; mensaje: string }

// Lo que el asistente lee de GET /api/admin/leads. `nombre` puede venir NULL (LD4): los leads
// de la web con solo correo o teléfono.
interface LeadMini {
  id: string
  nombre: string | null
  email?: string | null
  telefono?: string | null
  estado_lead?: string | null
}

// LD2-b: lo que el asistente usa de `GET /api/admin/leads/{id}` (C5: las llaves de un item del
// listado; aquí solo las que se leen).
interface LeadDetalle extends LeadMini {
  experiencia_id: string | null
  experiencia_nombre: string | null
  reserva_creada_id: string | null
  reserva_booking_id: string | null
}

/** Estado de la precarga desde un lead. `nombre` = cómo se le nombra en el aviso. */
type LeadInicialEstado =
  | { tipo: 'cargando' }
  | { tipo: 'ok'; leadId: string; nombre: string }
  | { tipo: 'error'; mensaje: string }

const ESTADO_LEAD_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  en_cotizacion: 'En cotización',
  convertido_a_reserva: 'Convertido',
  descartado: 'Descartado',
}

// ─── Fase 4b (sesión 40): precios del servidor (C2) y cupones (C3) ───────────────────────

/** GET /api/admin/reservas/precios para (experiencia, reseller). `ok` = el asistente ya cotiza con ellos. */
type EstadoPrecios =
  | { tipo: 'sin_experiencia' }
  | { tipo: 'cargando' }
  | { tipo: 'ok' }
  | { tipo: 'error'; mensaje: string }

/** POST /api/admin/reservas/evaluar-cupon. El resultado vive en `wiz.cuponEvaluado` (SET_CUPON). */
type EstadoRevisionCupon =
  | { tipo: 'quieto' }
  | { tipo: 'revisando' }
  | { tipo: 'error'; mensaje: string }

/** Respuesta del alta (C5): el detalle de la reserva + `avisos` + el cupón que evaluó el servidor.
 *  R1 (C6): `cotizacion_correo` = cómo quedó el correo de la cotización (convención `{encolado, motivo}`
 *  de la Fase 2); no viene en la API vieja. */
type RespuestaAlta = Reserva & {
  avisos?: string[]
  cupon?: CuponEvaluado | null
  /** CUP2 / DR5 (R1, C19): por qué el código NO descontó (cortesía, vencido, agotado…); null = nada que avisar. */
  cupon_motivo?: string | null
  cotizacion_correo?: ResultadoCorreo | null
}

/** El aviso que la API vieja mandaba por su cuenta cuando no había correo (con la llave nueva no se repite). */
const AVISO_COTIZACION_SIN_CORREO_VIEJO = 'La cotización no se envió'

/** Para comparar el código escrito con el evaluado (el backend lo normaliza igual: strip + mayúsculas). */
function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase()
}

/** Los precios del catálogo de una experiencia (lo que se usa mientras llegan los del servidor). */
function accionExperiencia(exp: ExperienciaCatalogo, horaFinSugerida?: string): WizardAction {
  return {
    type: 'SET_EXPERIENCIA',
    id: exp.id,
    nombre: exp.nombre,
    precioBase: Number(exp.precio_por_persona ?? 0),
    precioAdicional: Number(exp.precio_persona_adicional ?? 0),
    personasIncluidas: Number(exp.personas_incluidas ?? 9),
    horaFinSugerida,
  }
}

/** RS1: «Tarifa de {reseller}: $X el grupo (catálogo $Y)»; null si el precio es el del catálogo. */
function textoTarifa(wiz: WizardData, resellers: Reseller[]): string | null {
  if (wiz.fuentePrecio !== 'tarifa_reseller') return null
  const nombre = resellers.find((r) => r.id === wiz.resellerId)?.nombre ?? 'el reseller'
  return `Tarifa de ${nombre}: ${formatMXN(wiz.precioBase)} el grupo (catálogo ${formatMXN(wiz.precioCatalogo)})`
}

/** NI1: la ayuda del campo Niños. La regla solo se afirma cuando los precios del servidor ya llegaron. */
function textoNinosAyuda(wiz: WizardData, preciosListos: boolean): string {
  if (!wiz.experienciaId || !preciosListos) return 'De los invitados, cuántos son niños.'
  if (!wiz.reglaNino) return 'Esta experiencia no tiene precio de niño: los niños pagan como adulto.'
  return `Los niños de hasta ${wiz.reglaNino.edad_maxima} años llenan primero los lugares adicionales y ahí pagan ${formatMXN(wiz.precioNinoAdicional)} cada uno; dentro de las ${wiz.personasIncluidas} incluidas el precio no cambia.`
}

function wizardReducer(state: WizardData, action: WizardAction): WizardData {
  const next = aplicarAccion(state, action)
  // Los niños son parte de los invitados: si los invitados bajan (a mano o al
  // cambiar de experiencia), los niños se ajustan al nuevo máximo.
  return next.ninos > next.invMin ? { ...next, ninos: Math.max(0, next.invMin) } : next
}

function aplicarAccion(state: WizardData, action: WizardAction): WizardData {
  switch (action.type) {
    case 'RESET':
      return initialWizardData
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'NEXT':
      return state.step < 6 ? { ...state, step: (state.step + 1) as WizardStep } : state
    case 'PREV':
      return state.step > 1 ? { ...state, step: (state.step - 1) as WizardStep } : state
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value } as WizardData
    case 'SET_TIPO_CLIENTE':
      return { ...state, tipoCliente: action.tipo }
    case 'SET_EXPERIENCIA':
      return {
        ...state,
        experienciaId: action.id,
        experienciaNombre: action.nombre,
        precioBase: action.precioBase,
        precioAdicional: action.precioAdicional,
        personasIncluidas: action.personasIncluidas,
        // Fase 4b: lo del catálogo mientras llegan los precios del servidor (SET_PRECIOS).
        // Sin regla conocida, un niño adicional paga como adulto (si quedara en 0, saldría gratis).
        precioNinoAdicional: action.precioAdicional,
        fuentePrecio: 'catalogo',
        reglaNino: null,
        precioCatalogo: action.precioBase,
        comisionPct: null,
        // Si los invitados seguian en las incluidas de la experiencia anterior (no
        // se tocaron), siguen a las de ESTA. Si se escribió otro número, se respeta,
        // aunque sea menor: se registran los invitados reales (29-sep).
        invMin:
          state.invMin === state.personasIncluidas ? action.personasIncluidas : state.invMin,
        horaFin: action.horaFinSugerida ?? state.horaFin,
      }
    // F1 (C2): los precios con que cotiza el servidor para (experiencia, reseller)
    case 'SET_PRECIOS': {
      const p = action.precios
      // Una respuesta que llegó tarde, de otra experiencia, no pisa la elegida
      if (p.experiencia_id && p.experiencia_id.toLowerCase() !== state.experienciaId.toLowerCase()) {
        return state
      }
      const incluidas = Number(p.personas_incluidas) || state.personasIncluidas
      return {
        ...state,
        precioBase: Number(p.precio_grupo),
        precioAdicional: Number(p.precio_adicional),
        // Sin regla de niño el servidor manda el adicional; si llegara vacío, NO puede quedar en 0
        precioNinoAdicional: Number(p.precio_nino_adicional ?? p.precio_adicional),
        personasIncluidas: incluidas,
        // La misma regla que SET_EXPERIENCIA
        invMin: state.invMin === state.personasIncluidas ? incluidas : state.invMin,
        fuentePrecio: p.fuente_precio,
        reglaNino: p.regla_nino ?? null,
        precioCatalogo: Number(p.precio_catalogo ?? p.precio_grupo),
        comisionPct: p.comision_pct == null ? null : Number(p.comision_pct),
      }
    }
    // F1 (C3): el código evaluado (null = sin código o sin revisar)
    case 'SET_CUPON':
      return { ...state, cuponEvaluado: action.cupon }
    case 'TOGGLE_ADDON': {
      const exists = state.addons.find((a) => a.id === action.addon.id)
      if (exists) {
        return {
          ...state,
          addons: state.addons.filter((a) => a.id !== action.addon.id),
        }
      }
      return { ...state, addons: [...state.addons, action.addon] }
    }
    case 'UPDATE_ADDON_CANTIDAD':
      return {
        ...state,
        addons: state.addons.map((a) =>
          a.id === action.addonId ? { ...a, cantidad: Math.max(1, action.cantidad) } : a,
        ),
      }
    case 'TOGGLE_GUIA':
      return {
        ...state,
        guiasIds: state.guiasIds.includes(action.guiaId)
          ? state.guiasIds.filter((g) => g !== action.guiaId)
          : [...state.guiasIds, action.guiaId],
      }
    case 'PREFILL_FROM_LEAD':
      return {
        ...state,
        leadId: action.lead.id,
        clienteNombre: action.lead.nombre,
        clienteEmail: action.lead.email ?? '',
        clienteTelefono: action.lead.telefono ?? '',
      }
    default:
      return state
  }
}

/** UI5 (R1): el cupón dejó el total en $0 (sin ser cortesía). */
function totalCubiertoPorCupon(cot: ReturnType<typeof calcularCotizacion>): boolean {
  return cot.total <= 0 && cot.monto_cupon > 0
}

/** Con total $0 no hay nada que cobrar: MercadoPago rechaza un link en $0 (el back avisaría el fallo). */
function sinCobro(wiz: WizardData, cot: ReturnType<typeof calcularCotizacion>): boolean {
  return wiz.cortesia || cot.total <= 0
}

function sumarHoras(hora: string, horas: number): string {
  if (!hora || !horas) return ''
  const [h, m] = hora.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  const total = h * 60 + m + horas * 60
  const hh = Math.floor(total / 60) % 24
  const mm = Math.floor(total % 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export default function ModalNuevaReserva({
  onClose,
  onCreated,
  fechaSugerida,
  leadIdInicial,
}: ModalNuevaReservaProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  // RC1: con un día pasado se abre sin fecha (el back las rechaza: PD1)
  const [wiz, dispatch] = useReducer(wizardReducer, initialWizardData, (inicial) =>
    fechaSugerida && fechaSugerida >= hoyMexico() ? { ...inicial, fecha: fechaSugerida } : inicial,
  )

  // Al abrir, los invitados proponen las personas incluidas. Ya no es un mínimo
  // (29-sep, David): se pueden registrar menos para saber cuántos platos y sillas
  // preparar; el precio no baja del base.
  // Al abrir nadie ha escrito nada: el estado inicial trae 1 y se propone el número
  // de incluidas (así, al elegir la experiencia, sigue a las de ESA experiencia).
  useEffect(() => {
    if (wiz.invMin !== wiz.personasIncluidas) {
      dispatch({ type: 'SET_FIELD', field: 'invMin', value: wiz.personasIncluidas })
    }
    // Solo en el montaje inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Catalogos
  const [experiencias, setExperiencias] = useState<ExperienciaCatalogo[]>([])
  const [addonsCat, setAddonsCat] = useState<ExperienciaCatalogo[]>([])
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [estadoResellers, setEstadoResellers] = useState<EstadoResellers>({ tipo: 'cargando' })
  // LD2-a: la misma lista de vendedoras que Leads, el detalle y la tabla
  const vendedorasEstado = useVendedoras(token)
  const [guias, setGuias] = useState<Personal[]>([])
  const [catalogos, setCatalogos] = useState<Catalogos>(CATALOGOS_INICIALES)

  // Lead picker
  const [showLeadPicker, setShowLeadPicker] = useState(false)
  const [leadsBuscados, setLeadsBuscados] = useState<LeadMini[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsQuery, setLeadsQuery] = useState('')

  // LD2-b: precarga desde un lead (Leads › «Convertir a reserva»)
  const [leadInicial, setLeadInicial] = useState<LeadInicialEstado | null>(
    leadIdInicial ? { tipo: 'cargando' } : null,
  )
  // La experiencia del lead espera a que cargue la lista para elegirse como lo haría el usuario
  const [experienciaDelLead, setExperienciaDelLead] = useState<{ id: string; nombre: string | null } | null>(
    null,
  )
  const [avisoExperienciaLead, setAvisoExperienciaLead] = useState<string | null>(null)
  const [experienciasCargadas, setExperienciasCargadas] = useState(false)
  // El lead se precarga UNA vez: si el token se renueva con el asistente abierto no se
  // pisa lo que ya se escribió.
  const leadYaLeido = useRef<string | null>(null)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cot = useMemo(() => calcularCotizacion(wiz), [wiz])

  // Fase 4b: precios del servidor (C2) y revisión del código promocional (C3)
  const [precios, setPrecios] = useState<EstadoPrecios>({ tipo: 'sin_experiencia' })
  const [revisionCupon, setRevisionCupon] = useState<EstadoRevisionCupon>({ tipo: 'quieto' })
  // Con qué código (normalizado) y base se pidió la última revisión: decide si hace falta otra
  const ultimaRevision = useRef<{ codigo: string; base: number } | null>(null)
  // Solo la respuesta de la revisión más reciente cuenta
  const revisionVigente = useRef(0)
  // La base del cupón (D16-4 / §1.1): experiencia + add-ons, sin propina
  const baseCupon = redondearCentavos(cot.subtotal_experiencia + cot.subtotal_addons)

  // === Fetch catalogos ===
  // Backend correcto: /api/experiencias/admin (no /api/admin/experiencias).
  // Endpoint excluye ADC por defecto — para addons pasar tipo=ADC EXPERIENCIAS explicito.
  const fetchExperiencias = useCallback(async () => {
    if (!token) return
    try {
      const [resPriv, resAdc] = await Promise.all([
        fetch(
          `${API_URL}/api/experiencias/admin?tipo=${encodeURIComponent('EXPERIENCIAS PRIVADAS')}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${API_URL}/api/experiencias/admin?tipo=${encodeURIComponent('ADC EXPERIENCIAS')}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ])
      if (resPriv.ok) {
        const data = await resPriv.json()
        const arr: ExperienciaCatalogo[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : []
        // El backend rechaza reservar una experiencia inactiva: no ofrecerla
        setExperiencias(arr.filter((e) => e.disponible !== false))
        setExperienciasCargadas(true)
      }
      if (resAdc.ok) {
        const data = await resAdc.json()
        const arr: ExperienciaCatalogo[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : []
        // "Oculto" en el catalogo de Add-ons = no se ofrece (David, 2026-09-25)
        setAddonsCat(arr.filter((a) => a.disponible !== false))
      }
    } catch {
      /* silencioso */
    }
  }, [token])

  const fetchResellers = useCallback(async () => {
    if (!token) return
    setEstadoResellers({ tipo: 'cargando' })
    try {
      const res = await fetch(`${API_URL}/api/admin/resellers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        setEstadoResellers({ tipo: 'error', mensaje: extraerMensajeError(payload, res.status) })
        return
      }
      const data: unknown = await res.json()
      const items = Array.isArray(data)
        ? data
        : Array.isArray((data as { items?: unknown } | null)?.items)
        ? (data as { items: unknown[] }).items
        : null
      if (!items) {
        setEstadoResellers({ tipo: 'error', mensaje: 'respuesta inesperada del servidor' })
        return
      }
      setResellers((items as Reseller[]).filter((r) => r.activo !== false))
      setEstadoResellers({ tipo: 'ok' })
    } catch {
      setEstadoResellers({ tipo: 'error', mensaje: 'sin conexión con el servidor' })
    }
  }, [token])

  const fetchGuias = useCallback(async () => {
    if (!token) return
    try {
      const resG = await fetch(`${API_URL}/api/admin/personal?es_guia=true`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (resG.ok) {
        const data = await resG.json()
        const arr: Personal[] = Array.isArray(data) ? data : data?.items ?? []
        setGuias(arr.filter((g) => g.activo !== false && g.es_guia))
      }
    } catch {
      /* silencioso */
    }
  }, [token])

  // Fuentes, chinampas y cocinas en paralelo. Si uno falla, su select queda solo
  // con «—», se avisa, y el paso sigue usable (los tres son opcionales).
  const fetchCatalogos = useCallback(async () => {
    if (!token) return
    await Promise.all(
      TIPOS_CATALOGO.map(async (tipo) => {
        let estado: EstadoCatalogo
        try {
          const res = await fetch(
            `${API_URL}/api/admin/catalogos/${tipo}?incluir_inactivos=false`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            estado = { items: [], cargando: false, error: extraerMensajeError(err, res.status) }
          } else {
            const data: unknown = await res.json()
            const items = (data as Partial<ListaCatalogo> | null)?.items
            estado = Array.isArray(items)
              ? { items: items.filter((i) => i.activo !== false), cargando: false, error: null }
              : { items: [], cargando: false, error: 'respuesta inesperada del servidor' }
          }
        } catch {
          estado = { items: [], cargando: false, error: 'sin conexión con el servidor' }
        }
        setCatalogos((prev) => ({ ...prev, [tipo]: estado }))
      }),
    )
  }, [token])

  const fetchLeads = useCallback(async () => {
    if (!token) return
    setLeadsLoading(true)
    try {
      // Backend solo acepta UN estado por request. Hacer 2 fetch y mergear.
      const [resNuevo, resCotiz] = await Promise.all([
        fetch(`${API_URL}/api/admin/leads?estado=nuevo&per_page=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/leads?estado=en_cotizacion&per_page=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const extractItems = async (res: Response): Promise<LeadMini[]> => {
        if (!res.ok) return []
        const data = await res.json()
        const arr: LeadMini[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : []
        return arr
      }
      const [nuevos, cotizacion] = await Promise.all([
        extractItems(resNuevo),
        extractItems(resCotiz),
      ])
      // Mergear y deduplicar por id (defensivo)
      const merged = [...nuevos, ...cotizacion]
      const seen = new Set<string>()
      const deduped = merged.filter((l) => {
        if (seen.has(l.id)) return false
        seen.add(l.id)
        return true
      })
      setLeadsBuscados(deduped)
    } catch {
      setLeadsBuscados([])
    } finally {
      setLeadsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchExperiencias()
    fetchResellers()
    fetchGuias()
    fetchCatalogos()
  }, [token, fetchExperiencias, fetchResellers, fetchGuias, fetchCatalogos])

  // LD2-b: abrir desde un lead → GET /api/admin/leads/{id} (C5) y PREFILL_FROM_LEAD, el mismo
  // camino que «Buscar lead existente». Un 404 o un lead ya convertido dejan el asistente vacío.
  useEffect(() => {
    if (!leadIdInicial || !token || leadYaLeido.current === leadIdInicial) return
    let cancelado = false
    // Solo una lectura que terminó cuenta como hecha (StrictMode monta dos veces)
    const terminar = (estado: LeadInicialEstado) => {
      if (cancelado) return false
      leadYaLeido.current = leadIdInicial
      setLeadInicial(estado)
      return true
    }
    const cargar = async () => {
      setLeadInicial({ tipo: 'cargando' })
      try {
        const res = await fetch(`${API_URL}/api/admin/leads/${encodeURIComponent(leadIdInicial)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          const mensaje =
            res.status === 404
              ? 'No se encontró el lead (puede que lo hayan borrado). El asistente sigue vacío.'
              : `No se pudo leer el lead (${extraerMensajeError(payload, res.status)}). El asistente sigue vacío.`
          terminar({ tipo: 'error', mensaje })
          return
        }
        const lead = (await res.json()) as LeadDetalle
        if (cancelado) return
        // Un lead convertido ya tiene reserva: el back rechazaría ligarlo otra vez (LD4)
        if (lead.estado_lead === 'convertido_a_reserva' || lead.reserva_creada_id) {
          terminar({
            tipo: 'error',
            mensaje: lead.reserva_booking_id
              ? `Este lead ya se convirtió en la reserva ${lead.reserva_booking_id}. El asistente sigue vacío.`
              : 'Este lead ya se convirtió en una reserva. El asistente sigue vacío.',
          })
          return
        }
        if (
          !terminar({
            tipo: 'ok',
            leadId: lead.id,
            nombre: lead.nombre?.trim() || lead.email || lead.telefono || 'un cliente sin nombre',
          })
        ) {
          return
        }
        dispatch({
          type: 'PREFILL_FROM_LEAD',
          lead: {
            id: lead.id,
            nombre: lead.nombre ?? '',
            email: lead.email ?? undefined,
            telefono: lead.telefono ?? undefined,
          },
        })
        if (lead.experiencia_id) {
          setExperienciaDelLead({ id: lead.experiencia_id, nombre: lead.experiencia_nombre })
        }
      } catch {
        terminar({
          tipo: 'error',
          mensaje: 'Sin conexión con el servidor: no se pudo leer el lead. El asistente sigue vacío.',
        })
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [leadIdInicial, token])

  // === Validacion por paso ===
  const pasoValido = useMemo(() => {
    switch (wiz.step) {
      case 1:
        return wiz.tipoCliente === 'directo'
          ? wiz.clienteNombre.trim().length > 0
          : !!wiz.resellerId && wiz.clienteNombre.trim().length > 0
      case 2:
        return (
          !!wiz.experienciaId &&
          !!wiz.fecha &&
          !!wiz.horaInicio &&
          wiz.invMin >= 1 &&
          wiz.ninos >= 0 &&
          wiz.ninos <= wiz.invMin &&
          wiz.staff >= 0
        )
      case 3:
        return true
      case 4:
        // Cortesía: total $0 a propósito. UI5 (R1): un cupón que cubre todo también deja $0 y se
        // puede seguir (sin link de pago: paso 6). Un $0 sin cupón ni cortesía sigue bloqueado.
        // (con $0 por cupón el anticipo no aplica: se manda 0)
        return wiz.cortesia || totalCubiertoPorCupon(cot) || (cot.total > 0 && wiz.anticipo <= cot.total)
      case 5:
        return wiz.vendedorId.trim().length > 0
      case 6:
        return true
      default:
        return false
    }
  }, [wiz, cot])

  const guiasPendientes = useMemo(
    () =>
      guias
        .filter((g) => !g.email || !g.idiomas || g.idiomas.length === 0)
        .map((g) => g.id),
    [guias],
  )

  // === Submit final ===
  async function confirmarReserva() {
    if (!token) {
      setError('Sesion no valida')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        tipo_cliente: wiz.tipoCliente,
        lead_id: wiz.leadId || undefined,
        reseller_id: wiz.tipoCliente === 'reseller' ? wiz.resellerId : undefined,
        usuario_cliente:
          wiz.tipoCliente === 'directo'
            ? {
                nombre: wiz.clienteNombre,
                email: wiz.clienteEmail || undefined,
                telefono: wiz.clienteTelefono || undefined,
                idioma: wiz.clienteIdioma,
              }
            : undefined,
        // El cliente se ve siempre en la lista; con reseller es su huesped
        nombre_cliente: wiz.clienteNombre.trim() || undefined,
        // El idioma es de la experiencia (lo leen los guías en la Junta Turismo), no de
        // la cuenta: va también con reseller. Sin él, la API guardaba siempre "es".
        idioma: wiz.clienteIdioma,
        experiencia_id: wiz.experienciaId,
        fecha_experiencia: wiz.fecha,
        hora_inicio: wiz.horaInicio,
        hora_fin: wiz.horaFin || undefined,
        numero_invitados_min: wiz.invMin,
        numero_invitados_max: wiz.invMax || undefined,
        // Se guarda el nombre (lo leen PDF, correos y manifest)
        chinampa_asignada: wiz.chinampa || null,
        // PS1: niños son de los invitados; staff va aparte y no se cobra
        ninos: wiz.ninos,
        staff: wiz.staff,
        cortesia: wiz.cortesia,
        codigo_promocional: wiz.codigoPromocional.trim() || null,
        contacto: wiz.contacto.trim() || null,
        fuente_id: wiz.fuenteId || null,
        cocina_id: wiz.cocinaId || null,
        addons: wiz.addons.map((a) => ({ addon_id: a.id, cantidad: a.cantidad })),
        monto_descuento: wiz.descuento,
        motivo_descuento: wiz.motivoDescuento || undefined,
        propina_pct: wiz.propinaPct,
        monto_anticipo: sinCobro(wiz, cot) ? 0 : wiz.anticipo,
        vendedor_id: wiz.vendedorId,
        guias_ids: wiz.guiasIds,
        notas_internas: wiz.notasInternas || undefined,
        notas_alergias: wiz.notasAlergias || undefined,
        notas_cliente: wiz.notasCliente || undefined,
        // UI5: con total $0 (cupón que cubre todo) no hay link que generar
        generar_link_mp: sinCobro(wiz, cot) ? false : wiz.generarLinkMp,
        // Las cortesías no se cotizan (David, 30-sep)
        enviar_cotizacion_pdf: wiz.cortesia ? false : wiz.enviarCotizacionPdf,
      }
      const res = await fetch(`${API_URL}/api/admin/reservas`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(extraerMensajeError(err, res.status))
      }
      const data = (await res.json()) as RespuestaAlta
      const avisos = Array.isArray(data.avisos) ? [...data.avisos] : []
      // F1: el servidor recotiza y es la autoridad. Si su total o su cupón no son los que se
      // veían en el asistente, la página lo dice junto a los demás avisos del alta.
      const totalServidor = Number(data.monto_total)
      if (Number.isFinite(totalServidor) && Math.abs(totalServidor - cot.total) > 0.01) {
        avisos.push(
          `El total lo calculó el servidor: ${formatMXN(totalServidor)} (el asistente mostraba ${formatMXN(cot.total)}).`,
        )
      }
      // C19 (CUP2/DR5): si el servidor explica por qué el código no descontó, esa frase manda
      // (p. ej. cortesía con código: no gasta usos). Si no, el aviso de antes.
      const motivoCupon = data.cupon_motivo?.trim()
      if (motivoCupon) {
        avisos.push(motivoCupon)
      } else if (data.cupon && data.cupon.aplicado !== (wiz.cuponEvaluado?.aplicado === true)) {
        const aviso = textoCupon(data.cupon, Number(data.monto_cupon ?? data.cupon.descuento))
        if (aviso) avisos.push(aviso)
      }
      // C6 (R1): si se pidió mandar la cotización y NO salió, se dice por qué (textoCorreo). Si se
      // encoló no es un pendiente: la página solo lista pendientes. Sin la llave (API vieja) no se
      // promete nada: quedan los avisos del servidor tal cual.
      // Con cortesía el servidor ya agrega «Cortesía: no se envía cotización.» (TP27): no se repite.
      const correoCotizacion = data.cotizacion_correo
      const avisosFinales =
        body.enviar_cotizacion_pdf === true &&
        correoCotizacion &&
        !correoCotizacion.encolado &&
        correoCotizacion.motivo !== 'no_solicitado' &&
        correoCotizacion.motivo !== 'cortesia'
          ? [
              ...avisos.filter((a) => !a.startsWith(AVISO_COTIZACION_SIN_CORREO_VIEJO)),
              textoCorreo(correoCotizacion, 'de la cotización al cliente'),
            ]
          : avisos
      onCreated(data.id, data.booking_id, avisosFinales)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reserva')
    } finally {
      setSubmitting(false)
    }
  }

  // useCallback: también la usa el efecto que elige la experiencia del lead (LD2-b)
  const selectExperiencia = useCallback(
    (id: string) => {
      const exp = experiencias.find((e) => e.id === id)
      if (!exp) return
      const horaFinSugerida = wiz.horaInicio
        ? sumarHoras(wiz.horaInicio, exp.duracion_horas ?? 0)
        : undefined
      dispatch(accionExperiencia(exp, horaFinSugerida))
    },
    [experiencias, wiz.horaInicio],
  )

  // === F1 (C2): precios del servidor para (experiencia, reseller) ===
  // RF1: ya no hay lista de respaldo con ids falsos; todo reseller elegido viene de la API.
  const resellerParaPrecios = wiz.tipoCliente === 'reseller' && wiz.resellerId ? wiz.resellerId : ''

  // Vuelve a los precios del catálogo (sin tocar la hora de fin ni los invitados escritos)
  const restaurarPreciosCatalogo = useCallback(
    (id: string) => {
      const exp = experiencias.find((e) => e.id === id)
      if (exp) dispatch(accionExperiencia(exp))
    },
    [experiencias],
  )

  // Al cambiar experiencia, tipo de cliente o reseller: mientras carga, lo del catálogo; luego,
  // lo del servidor (tarifa del reseller, precio de niño, comisión). Si falla, se queda el catálogo
  // y el servidor recotiza al crear (F1: el total del servidor manda).
  useEffect(() => {
    if (!token || !wiz.experienciaId) {
      setPrecios({ tipo: 'sin_experiencia' })
      return
    }
    let cancelado = false
    restaurarPreciosCatalogo(wiz.experienciaId)
    setPrecios({ tipo: 'cargando' })
    const params = new URLSearchParams({ experiencia_id: wiz.experienciaId })
    if (resellerParaPrecios) params.set('reseller_id', resellerParaPrecios)
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/reservas/precios?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          if (!cancelado) setPrecios({ tipo: 'error', mensaje: extraerMensajeError(payload, res.status) })
          return
        }
        const data = (await res.json()) as PreciosReserva
        if (cancelado) return
        dispatch({ type: 'SET_PRECIOS', precios: data })
        setPrecios({ tipo: 'ok' })
      } catch {
        if (!cancelado) setPrecios({ tipo: 'error', mensaje: 'sin conexión con el servidor' })
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [token, wiz.experienciaId, resellerParaPrecios, restaurarPreciosCatalogo])

  // === F1 (C3): el código promocional se revisa en el servidor ===
  // Un código que no es cupón NO es error: queda como referencia (D12). Solo un fallo de red o del
  // servidor es error, y entonces no se descuenta nada (el servidor lo revisa al crear).
  const evaluarCupon = useCallback(
    async (codigoEscrito: string, base: number) => {
      const codigo = codigoEscrito.trim()
      const id = ++revisionVigente.current
      if (!codigo) {
        ultimaRevision.current = null
        dispatch({ type: 'SET_CUPON', cupon: null })
        setRevisionCupon({ tipo: 'quieto' })
        return
      }
      if (!token) return
      ultimaRevision.current = { codigo: normalizarCodigo(codigo), base }
      setRevisionCupon({ tipo: 'revisando' })
      const fallar = (mensaje: string) => {
        if (id !== revisionVigente.current) return
        ultimaRevision.current = null
        dispatch({ type: 'SET_CUPON', cupon: null })
        setRevisionCupon({ tipo: 'error', mensaje })
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/reservas/evaluar-cupon`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codigo, subtotal_reserva: base }),
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          fallar(extraerMensajeError(payload, res.status))
          return
        }
        const data = (await res.json()) as CuponEvaluado
        if (id !== revisionVigente.current) return
        dispatch({ type: 'SET_CUPON', cupon: data })
        setRevisionCupon({ tipo: 'quieto' })
      } catch {
        fallar('sin conexión con el servidor')
      }
    },
    [token],
  )

  // Escribir otro código invalida el evaluado (si no, se descontaría un cupón que ya no está escrito)
  const cambiarCodigo = useCallback(
    (valor: string) => {
      dispatch({ type: 'SET_FIELD', field: 'codigoPromocional', value: valor })
      if (wiz.cuponEvaluado || revisionCupon.tipo !== 'quieto') {
        revisionVigente.current += 1
        ultimaRevision.current = null
        dispatch({ type: 'SET_CUPON', cupon: null })
        setRevisionCupon({ tipo: 'quieto' })
      }
    },
    [wiz.cuponEvaluado, revisionCupon.tipo],
  )

  // Al salir del campo: se revisa, salvo que ya esté revisado ese mismo código con esa misma base
  const salirDelCodigo = useCallback(() => {
    const codigo = wiz.codigoPromocional.trim()
    const u = ultimaRevision.current
    if (codigo && u && wiz.cuponEvaluado && u.codigo === normalizarCodigo(codigo) && u.base === baseCupon) {
      return
    }
    evaluarCupon(codigo, baseCupon)
  }, [wiz.codigoPromocional, wiz.cuponEvaluado, baseCupon, evaluarCupon])

  // Si cambia la base (invitados, niños, add-ons, tarifa) de un cupón ya revisado: otra revisión
  // a los 400 ms (el mínimo de compra puede cumplirse o dejar de cumplirse)
  useEffect(() => {
    const u = ultimaRevision.current
    const c = wiz.cuponEvaluado
    if (!u || !c || !c.es_cupon || u.base === baseCupon) return
    const codigo = wiz.codigoPromocional.trim()
    if (normalizarCodigo(codigo) !== u.codigo) return
    const t = setTimeout(() => evaluarCupon(codigo, baseCupon), 400)
    return () => clearTimeout(t)
  }, [baseCupon, wiz.cuponEvaluado, wiz.codigoPromocional, evaluarCupon])

  // LD2-b: la experiencia del lead se elige cuando la lista ya cargó, con el mismo camino que
  // usa el usuario. Si no está (pública, archivada o inactiva), se avisa y se elige a mano.
  useEffect(() => {
    if (!experienciaDelLead || !experienciasCargadas) return
    if (experiencias.some((e) => e.id === experienciaDelLead.id)) {
      if (!wiz.experienciaId) selectExperiencia(experienciaDelLead.id)
    } else {
      setAvisoExperienciaLead(
        `La experiencia del lead${
          experienciaDelLead.nombre ? ` (${experienciaDelLead.nombre})` : ''
        } no está en la lista de experiencias privadas activas: elige una en el paso 2.`,
      )
    }
    setExperienciaDelLead(null)
  }, [experienciaDelLead, experienciasCargadas, experiencias, wiz.experienciaId, selectExperiencia])

  // === Lead picker ===
  function abrirLeadPicker() {
    setShowLeadPicker(true)
    if (leadsBuscados.length === 0) fetchLeads()
  }

  function seleccionarLead(lead: LeadMini) {
    dispatch({
      type: 'PREFILL_FROM_LEAD',
      lead: {
        id: lead.id,
        nombre: lead.nombre ?? '',
        email: lead.email ?? undefined,
        telefono: lead.telefono ?? undefined,
      },
    })
    setShowLeadPicker(false)
  }

  const leadsFiltrados = useMemo(() => {
    const q = leadsQuery.trim().toLowerCase()
    if (!q) return leadsBuscados
    return leadsBuscados.filter(
      (l) =>
        (l.nombre ?? '').toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.telefono ?? '').toLowerCase().includes(q),
    )
  }, [leadsBuscados, leadsQuery])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nueva-reserva-title"
    >
      {/* 390×844 (sesión 37): alto máximo al de la pantalla; lo que no debe encogerse, shrink-0 */}
      <div className="bg-white rounded-lg shadow-medium max-w-4xl w-full max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col">
        <header className="shrink-0 border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
          <h2 id="modal-nueva-reserva-title" className="font-display text-xl text-verde">
            Nueva Reserva
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal nueva reserva"
            className="p-1 rounded hover:bg-neutro-light text-verde-suave"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Las 6 etiquetas no caben a 390 px: se desplazan aquí dentro, no ensanchan la página */}
        <div className="shrink-0 px-6 pt-4 overflow-x-auto">
          <WizardSteps
            steps={STEPS}
            current={wiz.step}
            onJump={(num) => {
              if (num < wiz.step) dispatch({ type: 'SET_STEP', step: num as WizardStep })
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
          {/* LD2-b: de qué lead viene lo precargado, o por qué no se precargó */}
          {leadInicial?.tipo === 'cargando' && (
            <p
              data-testid="wiz-lead-cargando"
              role="status"
              className="mb-4 inline-flex items-center gap-2 text-sm text-verde-suave"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Cargando el lead…
            </p>
          )}
          {leadInicial?.tipo === 'ok' && wiz.leadId === leadInicial.leadId && (
            <p
              data-testid="wiz-lead-precargado"
              role="status"
              className="mb-4 bg-verde/10 border border-verde/30 rounded-lg p-3 text-sm text-verde"
            >
              Desde el lead de <strong>{leadInicial.nombre}</strong>
            </p>
          )}
          {leadInicial?.tipo === 'error' && (
            <p
              data-testid="wiz-lead-error"
              role="alert"
              className="mb-4 bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo"
            >
              {leadInicial.mensaje}
            </p>
          )}
          {avisoExperienciaLead && wiz.step <= 2 && !wiz.experienciaId && (
            <p
              data-testid="wiz-lead-experiencia-aviso"
              className="mb-4 bg-amarillo-bg border border-amarillo/40 rounded-lg p-3 text-sm text-verde"
            >
              {avisoExperienciaLead}
            </p>
          )}
          {error && (
            <div className="mb-4 bg-rojo-bg border border-rojo/30 rounded-lg p-3 text-sm text-rojo">
              {error}
            </div>
          )}

          {wiz.step === 1 && (
            <Paso1Cliente
              wiz={wiz}
              dispatch={dispatch}
              resellers={resellers}
              estadoResellers={estadoResellers}
              onReintentarResellers={fetchResellers}
              fuentes={catalogos.fuentes}
              onAbrirLeadPicker={abrirLeadPicker}
            />
          )}
          {wiz.step === 2 && (
            <Paso2Experiencia
              wiz={wiz}
              dispatch={dispatch}
              experiencias={experiencias}
              chinampas={catalogos.chinampas}
              cocinas={catalogos.cocinas}
              onSelectExperiencia={selectExperiencia}
              precios={precios}
              tarifa={textoTarifa(wiz, resellers)}
            />
          )}
          {wiz.step === 3 && (
            <Paso3Addons wiz={wiz} dispatch={dispatch} addonsCat={addonsCat} />
          )}
          {wiz.step === 4 && (
            <Paso4Cotizacion
              wiz={wiz}
              dispatch={dispatch}
              cot={cot}
              tarifa={textoTarifa(wiz, resellers)}
              revisionCupon={revisionCupon}
              onCambiarCodigo={cambiarCodigo}
              onSalirDelCodigo={salirDelCodigo}
            />
          )}
          {wiz.step === 5 && (
            <Paso5Asignaciones
              wiz={wiz}
              dispatch={dispatch}
              vendedoras={vendedorasEstado.vendedoras}
              vendedorasCargando={vendedorasEstado.cargando}
              vendedorasError={vendedorasEstado.error}
              guias={guias}
              guiasPendientes={guiasPendientes}
            />
          )}
          {wiz.step === 6 && (
            <Paso6Confirmacion
              wiz={wiz}
              dispatch={dispatch}
              cot={cot}
              fuentes={catalogos.fuentes.items}
              cocinas={catalogos.cocinas.items}
              resellers={resellers}
              vendedoras={vendedorasEstado.vendedoras}
            />
          )}
        </div>

        <footer className="shrink-0 border-t border-neutro-borde px-6 py-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light"
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            {wiz.step > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'PREV' })}
                className="px-4 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light"
              >
                Anterior
              </button>
            )}
            {wiz.step < 6 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'NEXT' })}
                disabled={!pasoValido}
                className="px-4 py-2 text-sm bg-terracota hover:bg-terracota-dark text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            )}
            {wiz.step === 6 && (
              <button
                type="button"
                onClick={confirmarReserva}
                disabled={submitting || !pasoValido}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-terracota hover:bg-terracota-dark text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Crear Reserva
              </button>
            )}
          </div>
        </footer>
      </div>

      {showLeadPicker && (
        <LeadPickerModal
          leads={leadsFiltrados}
          loading={leadsLoading}
          query={leadsQuery}
          onQueryChange={setLeadsQuery}
          onSelect={seleccionarLead}
          onClose={() => setShowLeadPicker(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// PASO 1 — Cliente
// ============================================================================
function Paso1Cliente({
  wiz,
  dispatch,
  resellers,
  estadoResellers,
  onReintentarResellers,
  fuentes,
  onAbrirLeadPicker,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  resellers: Reseller[]
  estadoResellers: EstadoResellers
  onReintentarResellers: () => void
  fuentes: EstadoCatalogo
  onAbrirLeadPicker: () => void
}) {
  const resellersListos = estadoResellers.tipo === 'ok' && resellers.length > 0
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-verde mb-2">Tipo de cliente</legend>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm ${
              wiz.tipoCliente === 'directo'
                ? 'border-terracota bg-terracota/5'
                : 'border-neutro-borde hover:bg-neutro-light'
            }`}
          >
            <input
              type="radio"
              name="tipo-cliente"
              checked={wiz.tipoCliente === 'directo'}
              onChange={() => dispatch({ type: 'SET_TIPO_CLIENTE', tipo: 'directo' })}
              className="text-terracota focus:ring-terracota"
            />
            <span className="text-verde font-medium">Cliente directo</span>
          </label>
          <label
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm ${
              wiz.tipoCliente === 'reseller'
                ? 'border-terracota bg-terracota/5'
                : 'border-neutro-borde hover:bg-neutro-light'
            }`}
          >
            <input
              type="radio"
              name="tipo-cliente"
              checked={wiz.tipoCliente === 'reseller'}
              onChange={() => dispatch({ type: 'SET_TIPO_CLIENTE', tipo: 'reseller' })}
              className="text-terracota focus:ring-terracota"
            />
            <span className="text-verde font-medium">Reseller / B2B</span>
          </label>
        </div>
      </fieldset>

      {wiz.tipoCliente === 'reseller' ? (
        <div>
          <label
            htmlFor="reseller-select"
            className="block text-sm font-medium text-verde mb-1"
          >
            Reseller
          </label>
          <select
            id="reseller-select"
            data-testid="wiz-reseller-select"
            value={wiz.resellerId ?? ''}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'resellerId', value: e.target.value })
            }
            disabled={!resellersListos}
            aria-describedby={resellersListos ? undefined : 'wiz-resellers-estado'}
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota disabled:bg-neutro-light disabled:cursor-not-allowed"
          >
            <option value="">— Selecciona reseller —</option>
            {resellers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          {/* RF1: sin lista de la API no se ofrece ningún reseller (nunca ids inventados) */}
          <div id="wiz-resellers-estado" className="mt-1 text-xs">
            {estadoResellers.tipo === 'cargando' && (
              <p
                data-testid="wiz-resellers-cargando"
                role="status"
                className="inline-flex items-center gap-1 text-verde-suave"
              >
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Cargando resellers…
              </p>
            )}
            {estadoResellers.tipo === 'error' && (
              <div
                data-testid="wiz-resellers-error"
                role="alert"
                className="flex flex-wrap items-center gap-2 bg-rojo-bg border border-rojo/30 rounded-lg p-2 text-rojo"
              >
                <span className="flex-1 min-w-0">
                  No se pudo cargar la lista de resellers ({estadoResellers.mensaje}). Sin la lista no
                  se puede ligar la reserva a un reseller: reintenta o regístrala como cliente directo.
                </span>
                <button
                  type="button"
                  data-testid="wiz-resellers-reintentar"
                  onClick={onReintentarResellers}
                  className="shrink-0 px-2 py-1 rounded bg-rojo/10 hover:bg-rojo/20 font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}
            {estadoResellers.tipo === 'ok' && resellers.length === 0 && (
              <p data-testid="wiz-resellers-vacio" className="text-verde-suave">
                No hay resellers activos. Dalos de alta en Resellers / B2B o registra la reserva como
                cliente directo.
              </p>
            )}
          </div>
          <label
            htmlFor="cliente-nombre-reseller"
            className="block text-sm font-medium text-verde mb-1 mt-4"
          >
            Nombre del cliente *
          </label>
          <input
            id="cliente-nombre-reseller"
            type="text"
            value={wiz.clienteNombre}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'clienteNombre', value: e.target.value })
            }
            placeholder="El huésped que manda el reseller"
            aria-describedby="cliente-nombre-reseller-ayuda"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <p id="cliente-nombre-reseller-ayuda" className="mt-1 text-xs text-verde-suave">
            Solo identifica la reserva. No se le mandan correos: el cliente es del reseller.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-verde-suave">
              Datos del cliente
              {wiz.leadId && (
                <>
                  <span className="ml-2 text-xs text-terracota">(prellenado desde lead)</span>
                  {/* LD4: un lead ya convertido responde 409; así se puede seguir sin ligarlo */}
                  <button
                    type="button"
                    data-testid="wiz-quitar-lead"
                    onClick={() => dispatch({ type: 'SET_FIELD', field: 'leadId', value: undefined })}
                    className="ml-2 text-xs text-verde-suave underline hover:text-verde"
                  >
                    Quitar lead
                  </button>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={onAbrirLeadPicker}
              className="text-sm text-terracota underline hover:text-terracota-dark"
            >
              Buscar lead existente
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label
                htmlFor="cliente-nombre"
                className="block text-sm font-medium text-verde mb-1"
              >
                Nombre completo *
              </label>
              <input
                id="cliente-nombre"
                type="text"
                value={wiz.clienteNombre}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'clienteNombre',
                    value: e.target.value,
                  })
                }
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
            </div>
            <div>
              <label
                htmlFor="cliente-email"
                className="block text-sm font-medium text-verde mb-1"
              >
                Email
              </label>
              <input
                id="cliente-email"
                type="email"
                value={wiz.clienteEmail}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'clienteEmail',
                    value: e.target.value,
                  })
                }
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
            </div>
            <div>
              <label
                htmlFor="cliente-telefono"
                className="block text-sm font-medium text-verde mb-1"
              >
                Telefono
              </label>
              <input
                id="cliente-telefono"
                type="tel"
                value={wiz.clienteTelefono}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'clienteTelefono',
                    value: e.target.value,
                  })
                }
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                <input
                  type="checkbox"
                  checked={wiz.clienteInternacional}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'clienteInternacional',
                      value: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                />
                Cliente internacional
              </label>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-neutro-borde pt-4">
        <div>
          <label htmlFor="cliente-idioma" className="block text-sm font-medium text-verde mb-1">
            Idioma de la experiencia
          </label>
          <select
            id="cliente-idioma"
            data-testid="wiz-idioma"
            value={wiz.clienteIdioma}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'clienteIdioma',
                value: e.target.value as IdiomaCliente,
              })
            }
            aria-describedby="cliente-idioma-ayuda"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
          <p id="cliente-idioma-ayuda" className="mt-1 text-xs text-verde-suave">
            Lo leen los guías en la Junta Turismo.
          </p>
        </div>
        <div>
          <label htmlFor="wiz-contacto" className="block text-sm font-medium text-verde mb-1">
            Contacto
          </label>
          <input
            id="wiz-contacto"
            data-testid="wiz-contacto"
            type="text"
            maxLength={200}
            value={wiz.contacto}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'contacto', value: e.target.value })
            }
            placeholder="Teléfono o correo"
            aria-describedby="wiz-contacto-ayuda"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <p id="wiz-contacto-ayuda" className="mt-1 text-xs text-verde-suave">
            Texto libre: con quién se coordina la reserva.
          </p>
        </div>
        <SelectCatalogo
          id="wiz-fuente"
          etiqueta="Fuente"
          nombreCatalogo="fuentes"
          catalogo={fuentes}
          grupos={GRUPOS_FUENTE}
          valor={wiz.fuenteId}
          valorDe={(item) => item.id}
          onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'fuenteId', value: v })}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Select de un catalogo PS1 (fuentes, chinampas, cocinas). Opcional: la opcion
// vacia «—» siempre esta, aunque el catalogo no cargue.
// ============================================================================
function SelectCatalogo({
  id,
  etiqueta,
  nombreCatalogo,
  catalogo,
  grupos,
  valor,
  valorDe,
  onChange,
}: {
  id: string
  etiqueta: string
  nombreCatalogo: string
  catalogo: EstadoCatalogo
  grupos?: GrupoCatalogo[]
  valor: string
  valorDe: (item: ItemCatalogo) => string
  onChange: (valor: string) => void
}) {
  const { items, cargando, error } = catalogo
  const opcion = (item: ItemCatalogo) => (
    <option key={item.id} value={valorDe(item)}>
      {item.nombre}
    </option>
  )
  const tiposAgrupados = new Set((grupos ?? []).map((g) => g.tipo))
  const sueltos = grupos ? items.filter((i) => !tiposAgrupados.has(i.tipo ?? '')) : items

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-verde mb-1">
        {etiqueta}
      </label>
      <select
        id={id}
        data-testid={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
      >
        <option value="">—</option>
        {grupos?.map((g) => {
          const delGrupo = items.filter((i) => i.tipo === g.tipo)
          return delGrupo.length > 0 ? (
            <optgroup key={g.tipo} label={g.etiqueta}>
              {delGrupo.map(opcion)}
            </optgroup>
          ) : null
        })}
        {sueltos.map(opcion)}
      </select>
      {cargando && <p className="mt-1 text-xs text-verde-suave">Cargando {nombreCatalogo}…</p>}
      {error && (
        <p data-testid={`${id}-aviso`} className="mt-1 text-xs text-terracota-dark">
          No se pudo cargar el catálogo de {nombreCatalogo} ({error}). Puedes seguir sin elegir.
        </p>
      )}
      {!cargando && !error && items.length === 0 && (
        <p className="mt-1 text-xs text-verde-suave">
          El catálogo de {nombreCatalogo} está vacío.
        </p>
      )}
    </div>
  )
}

// ============================================================================
// PASO 2 — Experiencia
// ============================================================================
function Paso2Experiencia({
  wiz,
  dispatch,
  experiencias,
  chinampas,
  cocinas,
  onSelectExperiencia,
  precios,
  tarifa,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  experiencias: ExperienciaCatalogo[]
  chinampas: EstadoCatalogo
  cocinas: EstadoCatalogo
  onSelectExperiencia: (id: string) => void
  precios: EstadoPrecios
  tarifa: string | null
}) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="exp-select"
          className="block text-sm font-medium text-verde mb-1"
        >
          Experiencia *
        </label>
        <select
          id="exp-select"
          value={wiz.experienciaId}
          onChange={(e) => onSelectExperiencia(e.target.value)}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        >
          <option value="">— Selecciona experiencia —</option>
          {experiencias.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre} — {formatMXN(Number(e.precio_por_persona ?? 0))}
            </option>
          ))}
        </select>
        {wiz.experienciaId && (
          <p className="mt-1 text-xs text-verde-suave">
            Precio base 1-{wiz.personasIncluidas} personas: {formatMXN(wiz.precioBase)} · Adicional:{' '}
            {formatMXN(wiz.precioAdicional)}/persona
          </p>
        )}
        {wiz.experienciaId && tarifa && (
          <p data-testid="wiz-tarifa-reseller" className="mt-1 text-xs font-medium text-verde">
            {tarifa}
          </p>
        )}
        {precios.tipo === 'cargando' && (
          <p
            data-testid="wiz-precios-cargando"
            role="status"
            className="mt-1 inline-flex items-center gap-1 text-xs text-verde-suave"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Actualizando precios…
          </p>
        )}
        {precios.tipo === 'error' && (
          <p data-testid="wiz-precios-error" className="mt-1 text-xs text-terracota-dark">
            No se pudieron leer los precios de esta reserva ({precios.mensaje}). Se muestra el
            catálogo; el total final lo calcula el servidor al crearla.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="exp-fecha" className="block text-sm font-medium text-verde mb-1">
            Fecha *
          </label>
          <input
            id="exp-fecha"
            type="date"
            min={hoyMexico()}
            value={wiz.fecha}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'fecha', value: e.target.value })
            }
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </div>
        <div>
          <label
            htmlFor="exp-hora-inicio"
            className="block text-sm font-medium text-verde mb-1"
          >
            Hora inicio *
          </label>
          <input
            id="exp-hora-inicio"
            type="time"
            value={wiz.horaInicio}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'horaInicio', value: e.target.value })
            }
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </div>
        <div>
          <label
            htmlFor="exp-hora-fin"
            className="block text-sm font-medium text-verde mb-1"
          >
            Hora fin
          </label>
          <input
            id="exp-hora-fin"
            type="time"
            value={wiz.horaFin}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'horaFin', value: e.target.value })
            }
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="exp-inv-min" className="block text-sm font-medium text-verde mb-1">
            Invitados *
          </label>
          <input
            id="exp-inv-min"
            type="number"
            min={1}
            value={wiz.invMin}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'invMin',
                value: Math.max(1, Number(e.target.value)),
              })
            }
            aria-describedby="exp-inv-min-help"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <p id="exp-inv-min-help" className="mt-1 text-xs text-verde-suave">
            {wiz.invMin < wiz.personasIncluidas
              ? `Menos de las ${wiz.personasIncluidas} incluidas: se cobra el precio base completo.`
              : `El precio base incluye hasta ${wiz.personasIncluidas} personas; cada persona extra se cobra aparte.`}
          </p>
        </div>
        <div>
          <label htmlFor="wiz-ninos" className="block text-sm font-medium text-verde mb-1">
            Niños
          </label>
          <input
            id="wiz-ninos"
            data-testid="wiz-ninos"
            type="number"
            min={0}
            max={wiz.invMin}
            step={1}
            value={wiz.ninos}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'ninos',
                value: Math.max(0, Math.min(wiz.invMin, Math.floor(Number(e.target.value) || 0))),
              })
            }
            aria-describedby="wiz-ninos-ayuda"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <p id="wiz-ninos-ayuda" data-testid="wiz-ninos-ayuda" className="mt-1 text-xs text-verde-suave">
            {textoNinosAyuda(wiz, precios.tipo === 'ok')}
          </p>
        </div>
        <div>
          <label htmlFor="wiz-staff" className="block text-sm font-medium text-verde mb-1">
            Staff
          </label>
          <input
            id="wiz-staff"
            data-testid="wiz-staff"
            type="number"
            min={0}
            step={1}
            value={wiz.staff}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'staff',
                value: Math.max(0, Math.floor(Number(e.target.value) || 0)),
              })
            }
            aria-describedby="wiz-staff-ayuda"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <p id="wiz-staff-ayuda" className="mt-1 text-xs text-verde-suave">
            Aparte: no se cobra ni suma platos ni sillas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="exp-inv-max" className="block text-sm font-medium text-verde mb-1">
            Invitados max (opcional)
          </label>
          <input
            id="exp-inv-max"
            type="number"
            min={0}
            value={wiz.invMax}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'invMax',
                value: Math.max(0, Number(e.target.value)),
              })
            }
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
        </div>
        <SelectCatalogo
          id="wiz-chinampa"
          etiqueta="Chinampa"
          nombreCatalogo="chinampas"
          catalogo={chinampas}
          valor={wiz.chinampa}
          valorDe={(item) => item.nombre}
          onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'chinampa', value: v })}
        />
        <SelectCatalogo
          id="wiz-cocina"
          etiqueta="Cocina / chef"
          nombreCatalogo="cocinas"
          catalogo={cocinas}
          grupos={GRUPOS_COCINA}
          valor={wiz.cocinaId}
          valorDe={(item) => item.id}
          onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'cocinaId', value: v })}
        />
      </div>
    </div>
  )
}

// ============================================================================
// PASO 3 — Add-ons
// ============================================================================
function Paso3Addons({
  wiz,
  dispatch,
  addonsCat,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  addonsCat: ExperienciaCatalogo[]
}) {
  if (addonsCat.length === 0) {
    return (
      <div className="text-sm text-verde-suave italic">
        No hay add-ons disponibles en el catalogo. Continua al siguiente paso.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-verde-suave">
        Selecciona los add-ons que se incluiran en la reserva.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {addonsCat.map((a) => {
          const selected = wiz.addons.find((x) => x.id === a.id)
          const isChecked = !!selected
          return (
            <div
              key={a.id}
              className={`border rounded-lg p-3 ${
                isChecked ? 'border-terracota bg-terracota/5' : 'border-neutro-borde'
              }`}
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const addon: WizardAddon = {
                      id: a.id,
                      nombre: a.nombre,
                      cantidad: 1,
                      precio_unitario: Number(a.precio_por_persona ?? 0),
                    }
                    dispatch({ type: 'TOGGLE_ADDON', addon })
                  }}
                  className="mt-1 w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                />
                <div className="flex-1">
                  <p className="text-sm text-verde font-medium">{a.nombre}</p>
                  <p className="text-xs text-verde-suave">
                    {formatMXN(Number(a.precio_por_persona ?? 0))}
                  </p>
                </div>
              </label>
              {isChecked && (
                <div className="mt-2 flex items-center gap-2">
                  <label
                    htmlFor={`addon-cant-${a.id}`}
                    className="text-xs text-verde-suave"
                  >
                    Cantidad:
                  </label>
                  <input
                    id={`addon-cant-${a.id}`}
                    type="number"
                    min={1}
                    value={selected.cantidad}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_ADDON_CANTIDAD',
                        addonId: a.id,
                        cantidad: Number(e.target.value),
                      })
                    }
                    className="border border-neutro-borde rounded px-2 py-1 text-sm w-20 tabular-nums"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// PASO 4 — Cotizacion (C02 + C03 + C09)
// ============================================================================
function Paso4Cotizacion({
  wiz,
  dispatch,
  cot,
  tarifa,
  revisionCupon,
  onCambiarCodigo,
  onSalirDelCodigo,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  cot: ReturnType<typeof calcularCotizacion>
  tarifa: string | null
  revisionCupon: EstadoRevisionCupon
  onCambiarCodigo: (valor: string) => void
  onSalirDelCodigo: () => void
}) {
  const estadoCupon = textoCupon(wiz.cuponEvaluado, cot.monto_cupon)
  function cambiarCortesia(activa: boolean) {
    dispatch({ type: 'SET_FIELD', field: 'cortesia', value: activa })
    // Cortesía: sin anticipo, link de pago ni cotización (no se cotiza). Al quitarla
    // vuelven a proponerse el link y el envío de la cotización.
    if (activa) dispatch({ type: 'SET_FIELD', field: 'anticipo', value: 0 })
    dispatch({ type: 'SET_FIELD', field: 'generarLinkMp', value: !activa })
    dispatch({ type: 'SET_FIELD', field: 'enviarCotizacionPdf', value: !activa })
  }

  return (
    <div className="space-y-4">
      {/* F1: desglose del precio de GRUPO (C02 + NI1), todo de calcularCotizacion(wiz) */}
      <div className="border-b border-neutro-borde pb-2 space-y-1">
        <p className="font-medium text-verde">{wiz.experienciaNombre ?? 'Experiencia'}</p>
        <p className="text-xs text-verde-suave">
          {wiz.invMin} invitados ({cot.adicionales} adicionales sobre {wiz.personasIncluidas})
          {wiz.ninos > 0 && ` · ${wiz.ninos} ${wiz.ninos === 1 ? 'niño' : 'niños'}`}
        </p>
        <LineaCotizacion
          testid="wiz-linea-grupo"
          etiqueta={`Grupo (hasta ${wiz.personasIncluidas} personas)`}
          monto={wiz.precioBase}
        />
        {tarifa && (
          <p data-testid="wiz-tarifa-reseller" className="text-xs font-medium text-verde-suave">
            {tarifa}
          </p>
        )}
        {cot.adultos_adicionales > 0 && (
          <LineaCotizacion
            testid="wiz-linea-adultos-adicionales"
            etiqueta={textoAdultosAdicionales(cot.adultos_adicionales, wiz.precioAdicional)}
            monto={redondearCentavos(cot.adultos_adicionales * wiz.precioAdicional)}
          />
        )}
        {cot.ninos_adicionales > 0 && (
          <LineaCotizacion
            testid="wiz-linea-ninos-adicionales"
            etiqueta={textoNinosAdicionales(cot.ninos_adicionales, wiz.precioNinoAdicional)}
            monto={redondearCentavos(cot.ninos_adicionales * wiz.precioNinoAdicional)}
          />
        )}
        <LineaCotizacion
          testid="wiz-linea-subtotal-experiencia"
          etiqueta="Subtotal experiencia"
          monto={cot.subtotal_experiencia}
          fuerte
        />
      </div>

      {wiz.addons.length > 0 && (
        <>
          <div className="flex justify-between">
            <p className="font-medium text-verde">
              Add-ons seleccionados ({wiz.addons.length})
            </p>
            <p className="font-medium text-verde tabular-nums">
              {formatMXN(cot.subtotal_addons)}
            </p>
          </div>
          <div
            data-testid="addons-detalle"
            className="bg-neutro-light rounded-lg p-3 space-y-1 text-sm"
          >
            <p className="text-xs font-semibold text-verde-suave uppercase mb-1">
              Detalle add-ons:
            </p>
            {wiz.addons.map((a) => (
              <div key={a.id} className="flex justify-between">
                <span className="text-verde">
                  {a.nombre} × {a.cantidad}
                </span>
                <span className="text-verde tabular-nums">
                  {formatMXN(a.cantidad * a.precio_unitario)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="cot-descuento" className="text-sm text-verde w-32">
          Descuento (MXN):
        </label>
        <input
          id="cot-descuento"
          type="number"
          min={0}
          value={wiz.descuento}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'descuento',
              value: Math.max(0, Number(e.target.value)),
            })
          }
          className="border border-neutro-borde rounded px-2 py-1 w-32 text-sm tabular-nums"
        />
        <input
          type="text"
          value={wiz.motivoDescuento}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'motivoDescuento',
              value: e.target.value,
            })
          }
          placeholder="Motivo"
          aria-label="Motivo del descuento"
          className="border border-neutro-borde rounded px-2 py-1 flex-1 min-w-[8rem] text-sm"
        />
      </div>

      {/* CP1 (C3): se revisa al salir del campo; un código que no es cupón queda de referencia */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="wiz-codigo-promocional" className="text-sm text-verde w-32">
            Código promocional:
          </label>
          <input
            id="wiz-codigo-promocional"
            data-testid="wiz-codigo-promocional"
            type="text"
            maxLength={50}
            value={wiz.codigoPromocional}
            onChange={(e) => onCambiarCodigo(e.target.value)}
            onBlur={onSalirDelCodigo}
            placeholder="Opcional"
            aria-describedby="wiz-codigo-promocional-ayuda"
            className="border border-neutro-borde rounded px-2 py-1 w-48 max-w-full text-sm"
          />
        </div>
        <div id="wiz-codigo-promocional-ayuda" className="mt-1 text-xs" aria-live="polite">
          {revisionCupon.tipo === 'revisando' ? (
            <p
              data-testid="wiz-cupon-revisando"
              className="inline-flex items-center gap-1 text-verde-suave"
            >
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Revisando el código…
            </p>
          ) : revisionCupon.tipo === 'error' ? (
            <p data-testid="wiz-cupon-error" className="text-terracota-dark">
              No se pudo revisar el código ({revisionCupon.mensaje}). Se guarda tal cual y el
              servidor lo revisa al crear la reserva.
            </p>
          ) : estadoCupon ? (
            <p
              data-testid="wiz-cupon-estado"
              className={wiz.cuponEvaluado?.aplicado ? 'font-medium text-verde' : 'text-verde-suave'}
            >
              {estadoCupon}
            </p>
          ) : (
            <p className="text-verde-suave">
              Si es un cupón activo, descuenta y se suma al descuento manual. Si no, se guarda como
              referencia.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="wiz-cortesia"
          data-testid="wiz-cortesia"
          type="checkbox"
          checked={wiz.cortesia}
          onChange={(e) => cambiarCortesia(e.target.checked)}
          aria-describedby="wiz-cortesia-ayuda"
          className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
        />
        <label htmlFor="wiz-cortesia" className="text-sm text-verde font-medium cursor-pointer">
          Cortesía
        </label>
        <span id="wiz-cortesia-ayuda" className="text-xs text-verde-suave">
          (total $0: sin propina, anticipo, link de pago ni cotización)
        </span>
      </div>

      {wiz.cortesia ? (
        <div
          data-testid="wiz-cortesia-aviso"
          className="bg-verde/5 border border-verde/20 rounded-lg p-3 text-sm text-verde font-medium"
        >
          Cortesía: no se cobra
        </div>
      ) : (
        // C09 — Propina sobre subtotal_experiencia
        <div className="bg-terracota/5 border border-terracota/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="wiz-propina-pct" className="text-sm text-verde flex-1">
              Propina (% sobre subtotal experiencia):
            </label>
            <input
              id="wiz-propina-pct"
              data-testid="wiz-propina-pct"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={wiz.propinaPct}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'propinaPct',
                  value: Math.max(0, Math.min(100, Number(e.target.value))),
                })
              }
              className="border border-neutro-borde rounded px-2 py-1 w-20 text-sm tabular-nums"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-verde">Monto propina:</span>
            <span
              data-testid="wiz-propina-monto"
              className="font-medium text-verde tabular-nums"
            >
              {formatMXN(cot.propina_monto)}
            </span>
          </div>
          <p className="text-xs text-terracota italic">
            * El servicio de propina no es facturable.
          </p>
        </div>
      )}

      {/* CP1: el cupón se SUMA al descuento manual; su monto ya trae el tope (calcularCotizacion) */}
      {cot.monto_cupon > 0 && wiz.cuponEvaluado && (
        <LineaCotizacion
          testid="wiz-linea-cupon"
          etiqueta={`Cupón ${wiz.cuponEvaluado.codigo}:`}
          monto={cot.monto_cupon}
          negativo
        />
      )}

      <div className="flex justify-between border-t border-neutro-borde pt-3 text-lg font-display font-semibold text-verde">
        <span>TOTAL</span>
        <span data-testid="wiz-total" className="tabular-nums">
          {formatMXN(cot.total)}
        </span>
      </div>

      {/* UI5 (R1): por qué un total en $0 deja seguir (cupón) o no (sin cupón ni cortesía) */}
      {!wiz.cortesia && totalCubiertoPorCupon(cot) && (
        <p
          data-testid="wiz-total-cero"
          className="bg-verde/5 border border-verde/20 rounded-lg p-3 text-sm text-verde"
        >
          El cupón cubre todo el total: la reserva queda en $0 sin anticipo ni link de pago. Si en
          realidad no se va a cobrar, márcala como Cortesía.
        </p>
      )}
      {!wiz.cortesia && cot.total <= 0 && !totalCubiertoPorCupon(cot) && (
        <p
          data-testid="wiz-total-cero-sin-cupon"
          className="bg-amarillo-bg border border-amarillo/40 rounded-lg p-3 text-sm text-verde"
        >
          El total quedó en $0. Para registrarla sin cobro marca «Cortesía»; si no, revisa el
          descuento.
        </p>
      )}

      {!sinCobro(wiz, cot) && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="cot-anticipo" className="text-sm text-verde w-32">
              Anticipo (MXN):
            </label>
            <input
              id="cot-anticipo"
              type="number"
              min={0}
              max={cot.total}
              value={wiz.anticipo}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'anticipo',
                  value: Math.max(0, Math.min(cot.total, Number(e.target.value))),
                })
              }
              className="border border-neutro-borde rounded px-2 py-1 w-32 text-sm tabular-nums"
            />
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'anticipo',
                  value: Math.round(cot.total * 0.5),
                })
              }
              className="text-xs text-terracota underline hover:text-terracota-dark"
            >
              Sugerencia 50%
            </button>
          </div>
          <div className="flex justify-between text-sm text-verde-suave">
            <span>Balance pendiente:</span>
            <span className="tabular-nums">{formatMXN(cot.balance)}</span>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// PASO 5 — Asignaciones (C07 multi-guia)
// ============================================================================
function Paso5Asignaciones({
  wiz,
  dispatch,
  vendedoras,
  vendedorasCargando,
  vendedorasError,
  guias,
  guiasPendientes,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  vendedoras: Vendedora[]
  vendedorasCargando: boolean
  vendedorasError: string | null
  guias: Personal[]
  guiasPendientes: string[]
}) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="asig-vendedor"
          className="block text-sm font-medium text-verde mb-1"
        >
          Vendedora *
        </label>
        <select
          id="asig-vendedor"
          value={wiz.vendedorId}
          onChange={(e) =>
            dispatch({ type: 'SET_FIELD', field: 'vendedorId', value: e.target.value })
          }
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        >
          <option value="">— Sin asignar —</option>
          {vendedoras.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
        {vendedorasCargando && (
          <p className="mt-1 text-xs text-verde-suave">Cargando vendedoras…</p>
        )}
        {vendedorasError && (
          <p data-testid="vendedoras-error" className="mt-1 text-xs text-terracota-dark">
            No se pudo cargar la lista de vendedoras ({vendedorasError}).
          </p>
        )}
      </div>

      <MultiSelectGuias
        id="wizard-guias"
        guias={guias}
        selectedIds={wiz.guiasIds}
        onChange={(ids) =>
          dispatch({ type: 'SET_FIELD', field: 'guiasIds', value: ids })
        }
        guiasPendientes={guiasPendientes}
        label="Guias asignados"
      />

      {wiz.invMin > 30 && (
        <div className="bg-azul-bg border border-azul/30 rounded-lg p-3 text-sm text-azul">
          Para grupos &gt; 30 invitados se sugieren 2 o mas guias.
        </div>
      )}

      <div>
        <label
          htmlFor="asig-notas-internas"
          className="block text-sm font-medium text-verde mb-1"
        >
          Notas internas
        </label>
        <textarea
          id="asig-notas-internas"
          value={wiz.notasInternas}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'notasInternas',
              value: e.target.value,
            })
          }
          rows={2}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        />
      </div>

      <div>
        <label
          htmlFor="asig-notas-alergias"
          className="block text-sm font-medium text-verde mb-1"
        >
          Alergias / restricciones
        </label>
        <textarea
          id="asig-notas-alergias"
          value={wiz.notasAlergias}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'notasAlergias',
              value: e.target.value,
            })
          }
          rows={2}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        />
      </div>

      <div>
        <label
          htmlFor="asig-notas-cliente"
          className="block text-sm font-medium text-verde mb-1"
        >
          Notas del cliente
        </label>
        <textarea
          id="asig-notas-cliente"
          value={wiz.notasCliente}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'notasCliente',
              value: e.target.value,
            })
          }
          rows={2}
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
        />
      </div>
    </div>
  )
}

// ============================================================================
// PASO 6 — Confirmacion
// ============================================================================
function Paso6Confirmacion({
  wiz,
  dispatch,
  cot,
  fuentes,
  cocinas,
  resellers,
  vendedoras,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  cot: ReturnType<typeof calcularCotizacion>
  fuentes: ItemCatalogo[]
  cocinas: ItemCatalogo[]
  resellers: Reseller[]
  vendedoras: Vendedora[]
}) {
  const fuente = fuentes.find((f) => f.id === wiz.fuenteId)
  const cocina = cocinas.find((c) => c.id === wiz.cocinaId)
  const tarifa = textoTarifa(wiz, resellers)
  // WZ1: nombres, no IDs, con las listas que el asistente ya cargó
  const reseller = resellers.find((r) => r.id === wiz.resellerId)
  const vendedora = vendedoras.find((v) => v.id === wiz.vendedorId)
  // UI5: cortesía o total $0 (cupón que cubre todo) = nada que cobrar
  const sinCobroReserva = sinCobro(wiz, cot)
  return (
    <div className="space-y-4">
      <ResumenSeccion titulo="Cliente">
        <p>
          Tipo: <strong>{wiz.tipoCliente === 'directo' ? 'Directo' : 'Reseller'}</strong>
        </p>
        {wiz.tipoCliente === 'directo' ? (
          <>
            <p>
              Nombre: <strong>{wiz.clienteNombre}</strong>
            </p>
            {wiz.clienteEmail && (
              <p>
                Email: <strong>{wiz.clienteEmail}</strong>
              </p>
            )}
            {wiz.clienteTelefono && (
              <p>
                Telefono: <strong>{wiz.clienteTelefono}</strong>
              </p>
            )}
          </>
        ) : (
          <>
            <p>
              Reseller: <strong data-testid="wiz-resumen-reseller">{reseller?.nombre ?? '—'}</strong>
            </p>
            <p>
              Huésped:{' '}
              <strong data-testid="wiz-resumen-huesped">{wiz.clienteNombre.trim() || '—'}</strong>
            </p>
          </>
        )}
        <p>
          Idioma:{' '}
          <strong data-testid="wiz-resumen-idioma">
            {wiz.clienteIdioma === 'en' ? 'Inglés' : 'Español'}
          </strong>
        </p>
        <p>
          Contacto: <strong data-testid="wiz-resumen-contacto">{wiz.contacto.trim() || '—'}</strong>
        </p>
        <p>
          Fuente:{' '}
          <strong data-testid="wiz-resumen-fuente">
            {fuente
              ? `${fuente.nombre} (${fuente.tipo === 'persona' ? 'persona' : 'canal'})`
              : '—'}
          </strong>
        </p>
      </ResumenSeccion>

      <ResumenSeccion titulo="Experiencia">
        <p>
          <strong>{wiz.experienciaNombre ?? '—'}</strong>
        </p>
        <p>
          {formatFechaMexico(wiz.fecha)} · {wiz.horaInicio}
          {wiz.horaFin ? ` - ${wiz.horaFin}` : ''}
        </p>
        <p>
          {wiz.invMin}
          {wiz.invMax && wiz.invMax > wiz.invMin ? `-${wiz.invMax}` : ''} invitados
        </p>
        <p>
          Niños: <strong data-testid="wiz-resumen-ninos">{wiz.ninos}</strong>{' '}
          <span className="text-verde-suave">(de los invitados)</span>
        </p>
        <p>
          Staff: <strong data-testid="wiz-resumen-staff">{wiz.staff}</strong>{' '}
          <span className="text-verde-suave">(aparte, no se cobra)</span>
        </p>
        <p>
          Chinampa: <strong data-testid="wiz-resumen-chinampa">{wiz.chinampa || '—'}</strong>
        </p>
        <p>
          Cocina / chef:{' '}
          <strong data-testid="wiz-resumen-cocina">{cocina?.nombre ?? '—'}</strong>
        </p>
      </ResumenSeccion>

      {wiz.addons.length > 0 && (
        <ResumenSeccion titulo={`Add-ons (${wiz.addons.length})`}>
          {wiz.addons.map((a) => (
            <p key={a.id}>
              {a.nombre} × {a.cantidad} —{' '}
              <strong>{formatMXN(a.cantidad * a.precio_unitario)}</strong>
            </p>
          ))}
        </ResumenSeccion>
      )}

      <ResumenSeccion titulo="Cotizacion">
        {wiz.cortesia && (
          <p data-testid="wiz-resumen-cortesia" className="font-medium">
            <strong className="text-terracota">Cortesía</strong>: no se cobra
          </p>
        )}
        <p>
          Subtotal experiencia:{' '}
          <strong className="tabular-nums">{formatMXN(cot.subtotal_experiencia)}</strong>
        </p>
        {tarifa && (
          <p data-testid="wiz-resumen-tarifa" className="text-verde-suave">
            {tarifa}
          </p>
        )}
        <p>
          Add-ons:{' '}
          <strong className="tabular-nums">{formatMXN(cot.subtotal_addons)}</strong>
        </p>
        {wiz.descuento > 0 && (
          <p>
            Descuento:{' '}
            <strong className="tabular-nums text-rojo">
              -{formatMXN(wiz.descuento)}
            </strong>
          </p>
        )}
        <p>
          Código promocional:{' '}
          <strong data-testid="wiz-resumen-codigo-promocional">
            {wiz.codigoPromocional.trim() || '—'}
          </strong>
        </p>
        {wiz.codigoPromocional.trim() && (
          <p
            data-testid="wiz-resumen-cupon"
            className={wiz.cuponEvaluado?.aplicado ? 'font-medium' : 'text-verde-suave'}
          >
            {textoCupon(wiz.cuponEvaluado, cot.monto_cupon) ||
              'Código sin revisar: el servidor lo revisa al crear la reserva.'}
          </p>
        )}
        {!wiz.cortesia && (
          <p>
            Propina ({wiz.propinaPct}%):{' '}
            <strong className="tabular-nums">{formatMXN(cot.propina_monto)}</strong>
          </p>
        )}
        <p className="text-lg font-display text-verde">
          TOTAL: <strong className="tabular-nums">{formatMXN(cot.total)}</strong>
        </p>
        {!sinCobro(wiz, cot) && (
          <>
            <p>
              Anticipo: <strong className="tabular-nums">{formatMXN(wiz.anticipo)}</strong>
            </p>
            <p>
              Balance: <strong className="tabular-nums">{formatMXN(cot.balance)}</strong>
            </p>
          </>
        )}
      </ResumenSeccion>

      <ResumenSeccion titulo="Asignaciones">
        <p>
          Vendedora: <strong data-testid="wiz-resumen-vendedora">{vendedora?.nombre ?? '—'}</strong>
        </p>
        <p>
          Guias asignados: <strong>{wiz.guiasIds.length}</strong>
        </p>
      </ResumenSeccion>

      <div className="space-y-2 border-t border-neutro-borde pt-4">
        <label
          className={`flex items-center gap-2 text-sm text-verde ${
            sinCobroReserva ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            data-testid="wiz-generar-link-mp"
            checked={wiz.generarLinkMp && !sinCobroReserva}
            disabled={sinCobroReserva}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'generarLinkMp',
                value: e.target.checked,
              })
            }
            className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
          />
          Generar link de pago MercadoPago automaticamente
          {wiz.cortesia ? (
            <span className="text-xs text-verde-suave">(no aplica: es cortesía)</span>
          ) : (
            sinCobroReserva && (
              <span className="text-xs text-verde-suave">(no aplica: el total es $0)</span>
            )
          )}
        </label>
        <label
          className={`flex items-center gap-2 text-sm text-verde ${
            wiz.cortesia ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            data-testid="wiz-enviar-cotizacion"
            checked={wiz.enviarCotizacionPdf && !wiz.cortesia}
            disabled={wiz.cortesia}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'enviarCotizacionPdf',
                value: e.target.checked,
              })
            }
            className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
          />
          Enviar cotizacion PDF por email al cliente
          {wiz.cortesia && (
            <span className="text-xs text-verde-suave">
              (no aplica: las cortesías no se cotizan)
            </span>
          )}
        </label>
      </div>
    </div>
  )
}

function ResumenSeccion({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-neutro-borde rounded-lg p-3 bg-neutro-light/40">
      <h3 className="text-xs font-semibold text-verde-suave uppercase mb-1">{titulo}</h3>
      <div className="text-sm text-verde space-y-0.5">{children}</div>
    </div>
  )
}

// ============================================================================
// Lead picker sub-modal
// ============================================================================
function LeadPickerModal({
  leads,
  loading,
  query,
  onQueryChange,
  onSelect,
  onClose,
}: {
  leads: LeadMini[]
  loading: boolean
  query: string
  onQueryChange: (q: string) => void
  onSelect: (lead: LeadMini) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar lead existente"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)] flex flex-col">
        <header className="shrink-0 border-b border-neutro-borde px-4 py-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-verde">Buscar lead existente</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador de leads"
            className="p-1 rounded hover:bg-neutro-light text-verde-suave"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="shrink-0 p-4 border-b border-neutro-borde">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde-suave"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar por nombre, email o telefono..."
              className="w-full pl-9 pr-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              aria-label="Buscar lead"
              data-testid="lead-picker-buscar"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {loading ? (
            <p className="text-sm text-verde-suave text-center py-4">Cargando leads...</p>
          ) : leads.length === 0 ? (
            <p className="text-sm text-verde-suave text-center py-4">
              No hay leads disponibles.
            </p>
          ) : (
            <ul className="space-y-1">
              {leads.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(l)}
                    data-testid="lead-picker-opcion"
                    className="w-full text-left px-3 py-2 rounded hover:bg-neutro-light"
                  >
                    <p className="text-sm font-medium text-verde">{l.nombre || 'Sin nombre'}</p>
                    <p className="text-xs text-verde-suave">
                      {l.email ?? 'sin email'}
                      {l.telefono ? ` · ${l.telefono}` : ''}
                      {l.estado_lead
                        ? ` · ${ESTADO_LEAD_LABEL[l.estado_lead] ?? l.estado_lead}`
                        : ''}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
