'use client'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Search, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import {
  calcularCotizacion,
  formatMXN,
  initialWizardData,
  type ExperienciaCatalogo,
  type IdiomaCliente,
  type Personal,
  type Reseller,
  type TipoCliente,
  type WizardAction,
  type WizardAddon,
  type WizardData,
  type WizardStep,
} from '@/types/reservas'
import WizardSteps from '../../components/WizardSteps'
import MultiSelectGuias from '../../components/MultiSelectGuias'
import { extraerMensajeError } from './errores'

interface ModalNuevaReservaProps {
  onClose: () => void
  onCreated: (id: string, bookingId: string) => void
}

const STEPS: { num: number; label: string }[] = [
  { num: 1, label: 'Cliente' },
  { num: 2, label: 'Experiencia' },
  { num: 3, label: 'Add-ons' },
  { num: 4, label: 'Cotizacion' },
  { num: 5, label: 'Asignaciones' },
  { num: 6, label: 'Confirmacion' },
]

const CHINAMPAS = ['', 'Sol', 'Garza', 'Techumbre', 'Otro']

const RESELLERS_FALLBACK: Reseller[] = [
  'Journey',
  'Jaunt',
  'Across Mexico',
  'Santander',
  'Culinary Backstreets',
  'Four Seasons',
  'Hyatt',
  'TCM',
  'NOMA',
  'Embajada Suiza',
].map((nombre) => ({
  id: `fallback-${nombre.toLowerCase().replace(/\s+/g, '-')}`,
  nombre,
  tipo: 'reseller',
  activo: true,
}))

interface LeadMini {
  id: string
  nombre: string
  email?: string | null
  telefono?: string | null
  estado?: string | null
}

function wizardReducer(state: WizardData, action: WizardAction): WizardData {
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
        horaFin: action.horaFinSugerida ?? state.horaFin,
      }
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

function todayISO(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
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

export default function ModalNuevaReserva({ onClose, onCreated }: ModalNuevaReservaProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [wiz, dispatch] = useReducer(wizardReducer, initialWizardData)

  // Bug 10: normalizar el default de invitados a 9 al abrir el wizard
  // (min real para experiencias privadas; el backend rechaza < 9).
  useEffect(() => {
    if (wiz.invMin < 9) {
      dispatch({ type: 'SET_FIELD', field: 'invMin', value: 9 })
    }
    // Solo en el montaje inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Catalogos
  const [experiencias, setExperiencias] = useState<ExperienciaCatalogo[]>([])
  const [addonsCat, setAddonsCat] = useState<ExperienciaCatalogo[]>([])
  const [resellers, setResellers] = useState<Reseller[]>(RESELLERS_FALLBACK)
  const [vendedoras, setVendedoras] = useState<Personal[]>([])
  const [guias, setGuias] = useState<Personal[]>([])

  // Lead picker
  const [showLeadPicker, setShowLeadPicker] = useState(false)
  const [leadsBuscados, setLeadsBuscados] = useState<LeadMini[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsQuery, setLeadsQuery] = useState('')

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cot = useMemo(() => calcularCotizacion(wiz), [wiz])

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
        setExperiencias(arr)
      }
      if (resAdc.ok) {
        const data = await resAdc.json()
        const arr: ExperienciaCatalogo[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : []
        setAddonsCat(arr)
      }
    } catch {
      /* silencioso */
    }
  }, [token])

  const fetchResellers = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/api/admin/resellers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      const arr: Reseller[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : []
      if (arr.length > 0) setResellers(arr.filter((r) => r.activo !== false))
    } catch {
      /* fallback hardcoded ya inicializado */
    }
  }, [token])

  const fetchPersonal = useCallback(async () => {
    if (!token) return
    try {
      const [resV, resG] = await Promise.all([
        fetch(`${API_URL}/api/admin/personal?es_vendedor=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/personal?es_guia=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (resV.ok) {
        const data = await resV.json()
        const arr: Personal[] = Array.isArray(data) ? data : data?.items ?? []
        setVendedoras(arr.filter((v) => v.activo !== false && v.es_vendedor))
      }
      if (resG.ok) {
        const data = await resG.json()
        const arr: Personal[] = Array.isArray(data) ? data : data?.items ?? []
        setGuias(arr.filter((g) => g.activo !== false && g.es_guia))
      }
    } catch {
      /* silencioso */
    }
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
    fetchPersonal()
  }, [token, fetchExperiencias, fetchResellers, fetchPersonal])

  // === Validacion por paso ===
  const pasoValido = useMemo(() => {
    switch (wiz.step) {
      case 1:
        return wiz.tipoCliente === 'directo'
          ? wiz.clienteNombre.trim().length > 0
          : !!wiz.resellerId
      case 2:
        return (
          !!wiz.experienciaId &&
          !!wiz.fecha &&
          !!wiz.horaInicio &&
          wiz.invMin >= 9
        )
      case 3:
        return true
      case 4:
        return cot.total > 0 && wiz.anticipo <= cot.total
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
        experiencia_id: wiz.experienciaId,
        fecha_experiencia: wiz.fecha,
        hora_inicio: wiz.horaInicio,
        hora_fin: wiz.horaFin || undefined,
        numero_invitados_min: wiz.invMin,
        numero_invitados_max: wiz.invMax || undefined,
        chinampa_asignada: wiz.chinampa || undefined,
        addons: wiz.addons.map((a) => ({ addon_id: a.id, cantidad: a.cantidad })),
        monto_descuento: wiz.descuento,
        motivo_descuento: wiz.motivoDescuento || undefined,
        propina_pct: wiz.propinaPct,
        monto_anticipo: wiz.anticipo,
        vendedor_id: wiz.vendedorId,
        guias_ids: wiz.guiasIds,
        notas_internas: wiz.notasInternas || undefined,
        notas_alergias: wiz.notasAlergias || undefined,
        notas_cliente: wiz.notasCliente || undefined,
        generar_link_mp: wiz.generarLinkMp,
        enviar_cotizacion_pdf: wiz.enviarCotizacionPdf,
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
      const data = await res.json()
      onCreated(data.id, data.booking_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reserva')
    } finally {
      setSubmitting(false)
    }
  }

  function selectExperiencia(id: string) {
    const exp = experiencias.find((e) => e.id === id)
    if (!exp) return
    const horaFinSugerida = wiz.horaInicio
      ? sumarHoras(wiz.horaInicio, exp.duracion_horas ?? 0)
      : undefined
    dispatch({
      type: 'SET_EXPERIENCIA',
      id: exp.id,
      nombre: exp.nombre,
      precioBase: Number(exp.precio_por_persona ?? 0),
      precioAdicional: Number(exp.precio_persona_adicional ?? 0),
      horaFinSugerida,
    })
  }

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
        nombre: lead.nombre,
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
        l.nombre.toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (l.telefono ?? '').toLowerCase().includes(q),
    )
  }, [leadsBuscados, leadsQuery])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nueva-reserva-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-4xl w-full max-h-[92vh] flex flex-col">
        <header className="border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
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

        <div className="px-6 pt-4">
          <WizardSteps
            steps={STEPS}
            current={wiz.step}
            onJump={(num) => {
              if (num < wiz.step) dispatch({ type: 'SET_STEP', step: num as WizardStep })
            }}
          />
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
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
              onAbrirLeadPicker={abrirLeadPicker}
            />
          )}
          {wiz.step === 2 && (
            <Paso2Experiencia
              wiz={wiz}
              dispatch={dispatch}
              experiencias={experiencias}
              onSelectExperiencia={selectExperiencia}
            />
          )}
          {wiz.step === 3 && (
            <Paso3Addons wiz={wiz} dispatch={dispatch} addonsCat={addonsCat} />
          )}
          {wiz.step === 4 && <Paso4Cotizacion wiz={wiz} dispatch={dispatch} cot={cot} />}
          {wiz.step === 5 && (
            <Paso5Asignaciones
              wiz={wiz}
              dispatch={dispatch}
              vendedoras={vendedoras}
              guias={guias}
              guiasPendientes={guiasPendientes}
            />
          )}
          {wiz.step === 6 && (
            <Paso6Confirmacion wiz={wiz} dispatch={dispatch} cot={cot} />
          )}
        </div>

        <footer className="border-t border-neutro-borde px-6 py-4 flex items-center justify-between">
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
  onAbrirLeadPicker,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  resellers: Reseller[]
  onAbrirLeadPicker: () => void
}) {
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
            value={wiz.resellerId ?? ''}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'resellerId', value: e.target.value })
            }
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          >
            <option value="">— Selecciona reseller —</option>
            {resellers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-verde-suave">
              Datos del cliente
              {wiz.leadId && (
                <span className="ml-2 text-xs text-terracota">(prellenado desde lead)</span>
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
            <div>
              <label
                htmlFor="cliente-idioma"
                className="block text-sm font-medium text-verde mb-1"
              >
                Idioma
              </label>
              <select
                id="cliente-idioma"
                value={wiz.clienteIdioma}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'clienteIdioma',
                    value: e.target.value as IdiomaCliente,
                  })
                }
                className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              >
                <option value="es">Espanol</option>
                <option value="en">Ingles</option>
              </select>
            </div>
            <div className="flex items-end">
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
  onSelectExperiencia,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  experiencias: ExperienciaCatalogo[]
  onSelectExperiencia: (id: string) => void
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
            Precio base 1-9 personas: {formatMXN(wiz.precioBase)} · Adicional:{' '}
            {formatMXN(wiz.precioAdicional)}/persona
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="exp-fecha" className="block text-sm font-medium text-verde mb-1">
            Fecha *
          </label>
          <input
            id="exp-fecha"
            type="date"
            min={todayISO()}
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

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="exp-inv-min" className="block text-sm font-medium text-verde mb-1">
            Invitados *
          </label>
          <input
            id="exp-inv-min"
            type="number"
            min={9}
            value={wiz.invMin}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'invMin',
                value: Math.max(9, Number(e.target.value)),
              })
            }
            aria-describedby="exp-inv-min-help"
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          />
          <p
            id="exp-inv-min-help"
            className={`mt-1 text-xs ${wiz.invMin < 9 ? 'text-rojo' : 'text-verde-suave'}`}
          >
            Mínimo 9 personas para experiencias privadas
          </p>
        </div>
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
        <div>
          <label
            htmlFor="exp-chinampa"
            className="block text-sm font-medium text-verde mb-1"
          >
            Chinampa
          </label>
          <select
            id="exp-chinampa"
            value={wiz.chinampa}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'chinampa', value: e.target.value })
            }
            className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
          >
            {CHINAMPAS.map((c) => (
              <option key={c || 'ninguna'} value={c}>
                {c || 'Ninguna'}
              </option>
            ))}
          </select>
        </div>
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
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  cot: ReturnType<typeof calcularCotizacion>
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between border-b border-neutro-borde pb-2">
        <div>
          <p className="font-medium text-verde">{wiz.experienciaNombre ?? 'Experiencia'}</p>
          <p className="text-xs text-verde-suave">
            {wiz.invMin} invitados ({cot.adicionales} adicionales sobre 9)
          </p>
        </div>
        <p className="font-medium text-verde tabular-nums">
          {formatMXN(cot.subtotal_experiencia)}
        </p>
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

      <div className="flex items-center gap-2">
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
          className="border border-neutro-borde rounded px-2 py-1 flex-1 text-sm"
        />
      </div>

      {/* C09 — Propina sobre subtotal_experiencia */}
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

      <div className="flex justify-between border-t border-neutro-borde pt-3 text-lg font-display font-semibold text-verde">
        <span>TOTAL</span>
        <span data-testid="wiz-total" className="tabular-nums">
          {formatMXN(cot.total)}
        </span>
      </div>

      <div className="flex items-center gap-2">
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
  guias,
  guiasPendientes,
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  vendedoras: Personal[]
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
              {v.apellidos ? ` ${v.apellidos}` : ''}
            </option>
          ))}
        </select>
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
}: {
  wiz: WizardData
  dispatch: React.Dispatch<WizardAction>
  cot: ReturnType<typeof calcularCotizacion>
}) {
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
            <p>
              Idioma:{' '}
              <strong>{wiz.clienteIdioma === 'es' ? 'Espanol' : 'Ingles'}</strong>
            </p>
          </>
        ) : (
          <p>
            Reseller ID: <strong>{wiz.resellerId ?? '—'}</strong>
          </p>
        )}
      </ResumenSeccion>

      <ResumenSeccion titulo="Experiencia">
        <p>
          <strong>{wiz.experienciaNombre ?? '—'}</strong>
        </p>
        <p>
          {wiz.fecha} · {wiz.horaInicio}
          {wiz.horaFin ? ` - ${wiz.horaFin}` : ''}
        </p>
        <p>
          {wiz.invMin}
          {wiz.invMax && wiz.invMax > wiz.invMin ? `-${wiz.invMax}` : ''} invitados
        </p>
        {wiz.chinampa && (
          <p>
            Chinampa: <strong>{wiz.chinampa}</strong>
          </p>
        )}
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
        <p>
          Subtotal experiencia:{' '}
          <strong className="tabular-nums">{formatMXN(cot.subtotal_experiencia)}</strong>
        </p>
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
          Propina ({wiz.propinaPct}%):{' '}
          <strong className="tabular-nums">{formatMXN(cot.propina_monto)}</strong>
        </p>
        <p className="text-lg font-display text-verde">
          TOTAL: <strong className="tabular-nums">{formatMXN(cot.total)}</strong>
        </p>
        <p>
          Anticipo: <strong className="tabular-nums">{formatMXN(wiz.anticipo)}</strong>
        </p>
        <p>
          Balance: <strong className="tabular-nums">{formatMXN(cot.balance)}</strong>
        </p>
      </ResumenSeccion>

      <ResumenSeccion titulo="Asignaciones">
        <p>
          Vendedora ID: <strong>{wiz.vendedorId || '—'}</strong>
        </p>
        <p>
          Guias asignados: <strong>{wiz.guiasIds.length}</strong>
        </p>
      </ResumenSeccion>

      <div className="space-y-2 border-t border-neutro-borde pt-4">
        <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
          <input
            type="checkbox"
            checked={wiz.generarLinkMp}
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
        </label>
        <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
          <input
            type="checkbox"
            checked={wiz.enviarCotizacionPdf}
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
      className="fixed inset-0 bg-black/50 z-[70] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar lead existente"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-lg w-full max-h-[80vh] flex flex-col">
        <header className="border-b border-neutro-borde px-4 py-3 flex items-center justify-between">
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
        <div className="p-4 border-b border-neutro-borde">
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
                    className="w-full text-left px-3 py-2 rounded hover:bg-neutro-light"
                  >
                    <p className="text-sm font-medium text-verde">{l.nombre}</p>
                    <p className="text-xs text-verde-suave">
                      {l.email ?? 'sin email'}
                      {l.telefono ? ` · ${l.telefono}` : ''}
                      {l.estado ? ` · ${l.estado}` : ''}
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
