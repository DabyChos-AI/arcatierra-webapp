'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useSession } from 'next-auth/react'
import {
  Mail,
  Pencil,
  Eye,
  Trash2,
  Plus,
  X,
  Send,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info,
} from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'
import { API_URL } from '@/lib/api'
import {
  Plantilla,
  PlantillaTipo,
  PlantillaIdioma,
  PlantillaPayload,
  PlantillasListResponse,
  PreviewResponse,
  MOCK_PLANTILLA,
  VARIABLES_JINJA,
  TIPO_LABELS,
  IDIOMA_LABELS,
  renderMock,
} from '@/types/plantillas-email'

// ─── Constants ───────────────────────────────────────

type FiltroTipo = '' | PlantillaTipo
type FiltroIdioma = '' | PlantillaIdioma

const TIPOS_TABS: { key: FiltroTipo; label: string }[] = [
  { key: '', label: 'Todos' },
  { key: 'confirmacion', label: 'Confirmación' },
  { key: 'recordatorio', label: 'Recordatorio' },
  { key: 'cotizacion', label: 'Cotización' },
  { key: 'cancelacion', label: 'Cancelación' },
  { key: 'reagendamiento', label: 'Reagendamiento' },
]

const TIPO_BADGE: Record<PlantillaTipo, string> = {
  confirmacion: 'bg-[#33503E]/10 text-[#33503E] border border-[#33503E]/30',
  recordatorio: 'bg-amber-50 text-amber-700 border border-amber-200',
  cotizacion: 'bg-[#B15543]/10 text-[#B15543] border border-[#B15543]/30',
  cancelacion: 'bg-red-50 text-red-700 border border-red-200',
  reagendamiento: 'bg-blue-50 text-blue-700 border border-blue-200',
}

const PER_PAGE = 25

interface ExperienciaSimple {
  id: string
  nombre: string
}

type ModalTab = 'datos' | 'cuerpo' | 'preview'

interface ToastState {
  kind: 'success' | 'error'
  message: string
}

const EMPTY_PAYLOAD: PlantillaPayload = {
  experiencia_id: null,
  tipo: 'confirmacion',
  idioma: 'es',
  asunto: '',
  cuerpo_html: '',
  cuerpo_texto: null,
  activa: true,
}

// ─── Component ───────────────────────────────────────

export default function PlantillasEmailPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken as string | undefined
  const adminEmail = (session?.user?.email ?? '') as string

  // Datos
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('')
  const [filtroIdioma, setFiltroIdioma] = useState<FiltroIdioma>('')
  const [filtroExperiencia, setFiltroExperiencia] = useState<string>('') // '' = todas, 'generica' = NULL, uuid = especifica
  const [soloActivas, setSoloActivas] = useState(false)

  // Experiencias para dropdown
  const [experiencias, setExperiencias] = useState<ExperienciaSimple[]>([])

  // Modal editor
  const [modalOpen, setModalOpen] = useState(false)
  const [modoCrear, setModoCrear] = useState(false)
  const [plantillaEditando, setPlantillaEditando] = useState<Plantilla | null>(null)
  const [formData, setFormData] = useState<PlantillaPayload>(EMPTY_PAYLOAD)
  const [formDirty, setFormDirty] = useState(false)
  const [savingForm, setSavingForm] = useState(false)
  const [sendingPreview, setSendingPreview] = useState(false)
  const [modalTab, setModalTab] = useState<ModalTab>('datos')
  const [modalError, setModalError] = useState<string | null>(null)

  // Ref textarea cuerpo HTML para insertar variables en cursor
  const cuerpoRef = useRef<HTMLTextAreaElement | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const handle = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(handle)
  }, [toast])

  // ─── Fetch listado ────────────────────────────────────

  const fetchPlantillas = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: '1',
        per_page: String(PER_PAGE),
      })
      if (filtroTipo) params.set('tipo', filtroTipo)
      if (filtroIdioma) params.set('idioma', filtroIdioma)
      if (filtroExperiencia === 'generica') {
        // Backend: omit param y filtrar luego (no hay flag is_null en API).
        // Marcamos para post-filter en cliente.
      } else if (filtroExperiencia) {
        params.set('experiencia_id', filtroExperiencia)
      }
      if (soloActivas) params.set('activa', 'true')

      const res = await fetch(
        `${API_URL}/api/admin/plantillas-email?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} cargando plantillas`)
      }
      const data: PlantillasListResponse = await res.json()
      let items = data.items
      if (filtroExperiencia === 'generica') {
        items = items.filter((p) => p.experiencia_id === null)
      }
      setPlantillas(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [token, filtroTipo, filtroIdioma, filtroExperiencia, soloActivas])

  useEffect(() => {
    if (status === 'authenticated') fetchPlantillas()
  }, [status, fetchPlantillas])

  // Fetch experiencias (catalogo) para dropdown del filtro y del editor
  useEffect(() => {
    if (!token) return
    let cancelled = false
    const fetchExps = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/experiencias/admin?tipo=${encodeURIComponent('EXPERIENCIAS PRIVADAS')}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (!res.ok) return
        const data = await res.json()
        const arr: { id: string; nombre: string }[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : []
        if (!cancelled) {
          setExperiencias(
            arr
              .map((e) => ({ id: String(e.id), nombre: e.nombre }))
              .sort((a, b) => a.nombre.localeCompare(b.nombre)),
          )
        }
      } catch {
        /* silencioso — dropdown queda vacio */
      }
    }
    fetchExps()
    return () => {
      cancelled = true
    }
  }, [token])

  // ─── Helpers experiencia ─────────────────────────────

  const experienciaLabel = useCallback(
    (p: Plantilla) =>
      p.experiencia_nombre ??
      (p.experiencia_id ? 'Experiencia desconocida' : 'Genérica'),
    [],
  )

  // ─── Abrir / cerrar modal ────────────────────────────

  const resetForm = (base?: Plantilla) => {
    if (base) {
      setFormData({
        experiencia_id: base.experiencia_id,
        tipo: base.tipo,
        idioma: base.idioma,
        asunto: base.asunto,
        cuerpo_html: base.cuerpo_html,
        cuerpo_texto: base.cuerpo_texto,
        activa: base.activa,
      })
    } else {
      setFormData(EMPTY_PAYLOAD)
    }
    setFormDirty(false)
    setModalTab('datos')
    setModalError(null)
  }

  const abrirEditor = async (id: string) => {
    if (!token) return
    try {
      setSavingForm(false)
      setModalError(null)
      const res = await fetch(`${API_URL}/api/admin/plantillas-email/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} cargando plantilla`)
      }
      const data: Plantilla = await res.json()
      setPlantillaEditando(data)
      setModoCrear(false)
      resetForm(data)
      setModalOpen(true)
    } catch (err) {
      setToast({
        kind: 'error',
        message: err instanceof Error ? err.message : 'No se pudo abrir la plantilla',
      })
    }
  }

  const abrirNueva = () => {
    setPlantillaEditando(null)
    setModoCrear(true)
    resetForm()
    setModalOpen(true)
  }

  const abrirPreviewDirecto = async (id: string) => {
    // Atajo: abre el modal en tab "preview".
    await abrirEditor(id)
    setModalTab('preview')
  }

  const cerrarModal = () => {
    if (formDirty) {
      const ok = window.confirm(
        '¿Descartar cambios? Tienes ediciones sin guardar.',
      )
      if (!ok) return
    }
    setModalOpen(false)
    setPlantillaEditando(null)
    setModoCrear(false)
    setFormDirty(false)
    setModalError(null)
    setModalTab('datos')
  }

  // ─── Mutaciones form ─────────────────────────────────

  const updateField = <K extends keyof PlantillaPayload>(
    key: K,
    value: PlantillaPayload[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setFormDirty(true)
  }

  const insertarVariable = (variable: string) => {
    const ta = cuerpoRef.current
    const token_str = `{{${variable}}}`
    if (!ta) {
      updateField('cuerpo_html', `${formData.cuerpo_html ?? ''}${token_str}`)
      return
    }
    const start = ta.selectionStart ?? formData.cuerpo_html.length
    const end = ta.selectionEnd ?? formData.cuerpo_html.length
    const current = formData.cuerpo_html ?? ''
    const next = current.slice(0, start) + token_str + current.slice(end)
    updateField('cuerpo_html', next)
    // Restaurar cursor despues del token insertado
    requestAnimationFrame(() => {
      if (!ta) return
      ta.focus()
      const pos = start + token_str.length
      ta.setSelectionRange(pos, pos)
    })
  }

  const validarForm = (): string | null => {
    const asunto = (formData.asunto || '').trim()
    const cuerpo = (formData.cuerpo_html || '').trim()
    if (!asunto) return 'El asunto es obligatorio'
    if (asunto.length > 500) return 'El asunto excede 500 caracteres'
    if (!cuerpo) return 'El cuerpo HTML es obligatorio'
    return null
  }

  const guardar = async () => {
    if (!token) return
    const err = validarForm()
    if (err) {
      setModalError(err)
      return
    }

    setSavingForm(true)
    setModalError(null)
    try {
      const body: PlantillaPayload = {
        experiencia_id: formData.experiencia_id || null,
        tipo: formData.tipo,
        idioma: formData.idioma,
        asunto: formData.asunto.trim(),
        cuerpo_html: formData.cuerpo_html,
        cuerpo_texto: formData.cuerpo_texto ?? null,
        activa: formData.activa ?? true,
      }

      let res: Response
      if (modoCrear) {
        res = await fetch(`${API_URL}/api/admin/plantillas-email`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
      } else if (plantillaEditando) {
        res = await fetch(
          `${API_URL}/api/admin/plantillas-email/${plantillaEditando.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        )
      } else {
        throw new Error('Estado inconsistente: sin plantilla a editar')
      }

      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} guardando plantilla`)
      }
      const saved: Plantilla = await res.json()

      // Refetch listado para sincronizar tabla
      await fetchPlantillas()

      if (modoCrear) {
        // Cerrar modal y mostrar exito
        setToast({ kind: 'success', message: 'Plantilla creada' })
        setModalOpen(false)
        setModoCrear(false)
        setFormDirty(false)
      } else {
        // SILENT REFETCH: NO cerrar modal, refresca estado local
        setPlantillaEditando(saved)
        resetForm(saved)
        setToast({ kind: 'success', message: 'Cambios guardados' })
      }
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'Error al guardar plantilla',
      )
    } finally {
      setSavingForm(false)
    }
  }

  const enviarPreview = async () => {
    if (!token || !plantillaEditando) return
    const dest = adminEmail.trim()
    if (!dest) {
      setModalError(
        'No se encontró tu email de admin en la sesión. Inicia sesión nuevamente.',
      )
      return
    }
    setSendingPreview(true)
    setModalError(null)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/plantillas-email/${plantillaEditando.id}/preview`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email_destino: dest }),
        },
      )
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} enviando preview`)
      }
      const data: PreviewResponse = await res.json()
      setToast({
        kind: 'success',
        message: `Preview enviado a ${data.email_destino}`,
      })
    } catch (err) {
      setModalError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar el preview',
      )
    } finally {
      setSendingPreview(false)
    }
  }

  const duplicar = async (p: Plantilla) => {
    if (!token) return
    try {
      const body: PlantillaPayload = {
        experiencia_id: p.experiencia_id,
        tipo: p.tipo,
        idioma: p.idioma,
        asunto: `(Copia) ${p.asunto}`.slice(0, 500),
        cuerpo_html: p.cuerpo_html,
        cuerpo_texto: p.cuerpo_texto,
        activa: false, // copias arrancan inactivas
      }
      const res = await fetch(`${API_URL}/api/admin/plantillas-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} duplicando plantilla`)
      }
      await fetchPlantillas()
      setToast({
        kind: 'success',
        message: 'Plantilla duplicada (inactiva)',
      })
    } catch (err) {
      setToast({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'No se pudo duplicar la plantilla',
      })
    }
  }

  const eliminar = async (p: Plantilla) => {
    if (!token) return
    const ok = window.confirm(
      `¿Eliminar la plantilla "${p.asunto}"?\nSi tiene envíos asociados se rechazará y deberás desactivarla en su lugar.`,
    )
    if (!ok) return
    try {
      const res = await fetch(
        `${API_URL}/api/admin/plantillas-email/${p.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (res.status === 409) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(
            () =>
              'No se puede eliminar: la plantilla está referenciada por emails enviados. Desactívala con el toggle "Activa".',
          )
        setToast({
          kind: 'error',
          message:
            typeof detail === 'string'
              ? detail
              : 'No se puede eliminar — referenciada en emails_enviados. Desactívala con el toggle "Activa".',
        })
        return
      }
      if (!res.ok) {
        const detail = await res
          .json()
          .then((d) => d.detail)
          .catch(() => null)
        throw new Error(detail || `Error ${res.status} eliminando plantilla`)
      }
      await fetchPlantillas()
      setToast({ kind: 'success', message: 'Plantilla eliminada' })
    } catch (err) {
      setToast({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'No se pudo eliminar la plantilla',
      })
    }
  }

  // ─── Render preview HTML (mock) ──────────────────────

  const cuerpoConMock = useMemo(
    () => renderMock(formData.cuerpo_html || '', MOCK_PLANTILLA),
    [formData.cuerpo_html],
  )
  const asuntoConMock = useMemo(
    () => renderMock(formData.asunto || '', MOCK_PLANTILLA),
    [formData.asunto],
  )

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#B15543]/10">
            <Mail className="h-6 w-6 text-[#B15543]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Plantillas de email
            </h1>
            <p className="text-gray-600 mt-1">
              Edita los correos automáticos que reciben los clientes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={abrirNueva}
            aria-label="Crear nueva plantilla"
            className="flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg hover:bg-[#975543] focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nueva plantilla</span>
          </button>
          <button
            type="button"
            onClick={fetchPlantillas}
            aria-label="Actualizar lista de plantillas"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#33503E] text-white rounded-lg hover:bg-[#475A52] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[#E3DBCB]/40 border-l-4 border-[#B15543] text-sm text-gray-700">
        <Info
          className="h-4 w-4 text-[#B15543] mt-0.5 flex-shrink-0"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          Estas plantillas se envían automáticamente cuando una reserva cambia
          de estado (confirmada/pagada) o cuando el cron diario manda los
          recordatorios del día siguiente. Las variables{' '}
          <code className="bg-white px-1 rounded text-xs">
            {'{{nombre_cliente}}'}
          </code>{' '}
          se reemplazan con los datos reales en el envío.
        </p>
      </div>

      {/* Toast global */}
      {toast && (
        <div
          className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
            toast.kind === 'success'
              ? 'bg-[#33503E]/5 border-[#33503E]/30 text-[#33503E]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
          role="status"
        >
          {toast.kind === 'success' ? (
            <CheckCircle
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Tabs tipo */}
        <div className="flex gap-2 flex-wrap">
          {TIPOS_TABS.map((tab) => {
            const active = filtroTipo === tab.key
            return (
              <button
                key={tab.key || 'todos'}
                type="button"
                onClick={() => setFiltroTipo(tab.key)}
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

        {/* Selects + toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label
              htmlFor="filtro-idioma"
              className="text-sm text-gray-600 sm:whitespace-nowrap"
            >
              Idioma
            </label>
            <select
              id="filtro-idioma"
              value={filtroIdioma}
              onChange={(e) =>
                setFiltroIdioma(e.target.value as FiltroIdioma)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E]"
            >
              <option value="">Todos</option>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label
              htmlFor="filtro-experiencia"
              className="text-sm text-gray-600 sm:whitespace-nowrap"
            >
              Experiencia
            </label>
            <select
              id="filtro-experiencia"
              value={filtroExperiencia}
              onChange={(e) => setFiltroExperiencia(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#33503E] focus:border-[#33503E] min-w-[14rem]"
            >
              <option value="">Todas</option>
              <option value="generica">Genérica (sin experiencia)</option>
              {experiencias.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none sm:ml-auto">
            <input
              type="checkbox"
              checked={soloActivas}
              onChange={(e) => setSoloActivas(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#33503E] focus:ring-[#33503E]"
            />
            Solo activas
          </label>
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
            onClick={fetchPlantillas}
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
                  <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  <div className="h-6 w-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 h-3 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : plantillas.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Mail
              className="h-12 w-12 mx-auto text-gray-300 mb-3"
              aria-hidden="true"
            />
            <p className="text-lg font-medium">
              No hay plantillas con estos filtros
            </p>
            <p className="text-sm mt-1">
              Crea la primera con el botón superior derecho.
            </p>
            <button
              type="button"
              onClick={abrirNueva}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg hover:bg-[#975543]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Crear primera plantilla</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Experiencia
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Idioma
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Asunto
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Activa
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Actualizado
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {plantillas.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => abrirEditor(p.id)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {p.experiencia_nombre ?? (
                        <span className="italic text-gray-400">Genérica</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_BADGE[p.tipo]}`}
                      >
                        {TIPO_LABELS[p.tipo]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {IDIOMA_LABELS[p.idioma]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-md">
                      <span className="block truncate" title={p.asunto}>
                        {p.asunto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.activa ? (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-[#33503E]/10 text-[#33503E] border border-[#33503E]/30"
                          title="Esta plantilla se enviará automáticamente"
                        >
                          Activa
                        </span>
                      ) : (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                          title="Inactiva: no se enviará más, pero los emails previos quedan en historial"
                        >
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {formatFechaHoraMexico(p.updated_at)}
                    </td>
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Editar plantilla ${experienciaLabel(p)} ${TIPO_LABELS[p.tipo]} ${IDIOMA_LABELS[p.idioma]}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirEditor(p.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#33503E]/10 text-[#33503E]"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Previsualizar plantilla"
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirPreviewDirecto(p.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#B15543]/10 text-[#B15543]"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Duplicar plantilla"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicar(p)
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar plantilla"
                          onClick={(e) => {
                            e.stopPropagation()
                            eliminar(p)
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal Editor ─────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal()
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 my-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#B15543]/10 flex-shrink-0">
                  <Mail
                    className="h-5 w-5 text-[#B15543]"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {modoCrear ? 'Nueva plantilla' : 'Editar plantilla'}
                  </h2>
                  {plantillaEditando && (
                    <p className="text-xs text-gray-500 truncate">
                      {experienciaLabel(plantillaEditando)} ·{' '}
                      {TIPO_LABELS[plantillaEditando.tipo]} ·{' '}
                      {IDIOMA_LABELS[plantillaEditando.idioma]}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-full bg-white shadow-sm"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3 bg-white border-b border-gray-200">
              <div
                className="flex gap-1 -mb-px"
                role="tablist"
                aria-label="Secciones del editor"
              >
                {(
                  [
                    { key: 'datos', label: 'Datos' },
                    { key: 'cuerpo', label: 'Cuerpo HTML' },
                    { key: 'preview', label: 'Vista previa' },
                  ] as { key: ModalTab; label: string }[]
                ).map((t) => {
                  const active = modalTab === t.key
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setModalTab(t.key)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        active
                          ? 'border-[#B15543] text-[#B15543]'
                          : 'border-transparent text-gray-600 hover:text-[#33503E]'
                      }`}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {modalError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle
                    className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-red-700 flex-1">
                    {modalError}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalError(null)}
                    aria-label="Cerrar error"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {modalTab === 'datos' && (
                <DatosTab
                  formData={formData}
                  updateField={updateField}
                  experiencias={experiencias}
                />
              )}

              {modalTab === 'cuerpo' && (
                <CuerpoTab
                  formData={formData}
                  updateField={updateField}
                  insertarVariable={insertarVariable}
                  cuerpoRef={cuerpoRef}
                />
              )}

              {modalTab === 'preview' && (
                <PreviewTab
                  asuntoConMock={asuntoConMock}
                  cuerpoConMock={cuerpoConMock}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-wrap sticky bottom-0">
              <div className="flex items-center gap-2">
                {!modoCrear && plantillaEditando && (
                  <button
                    type="button"
                    onClick={enviarPreview}
                    disabled={sendingPreview || !adminEmail}
                    title={
                      adminEmail
                        ? `Enviar preview a ${adminEmail}`
                        : 'No hay email de admin en sesión'
                    }
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    {sendingPreview ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>Enviar preview a mi correo</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={savingForm}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardar}
                  disabled={savingForm || !formDirty}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B15543] text-white rounded-lg text-sm hover:bg-[#975543] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingForm ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>
                    {savingForm
                      ? 'Guardando...'
                      : modoCrear
                      ? 'Crear plantilla'
                      : 'Guardar cambios'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-componentes del modal ───────────────────────

interface DatosTabProps {
  formData: PlantillaPayload
  updateField: <K extends keyof PlantillaPayload>(
    key: K,
    value: PlantillaPayload[K],
  ) => void
  experiencias: ExperienciaSimple[]
}

function DatosTab({ formData, updateField, experiencias }: DatosTabProps) {
  return (
    <form
      onSubmit={(e: FormEvent) => e.preventDefault()}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="modal-asunto"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Asunto <span className="text-red-500">*</span>
        </label>
        <input
          id="modal-asunto"
          type="text"
          required
          maxLength={500}
          value={formData.asunto}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('asunto', e.target.value)
          }
          placeholder="Ej: ¡Tu experiencia con Arca Tierra está confirmada! · {{booking_id}}"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
        />
        <p className="text-xs text-gray-500 mt-1">
          {(formData.asunto || '').length}/500 caracteres · puedes usar
          variables Jinja2
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="modal-tipo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            id="modal-tipo"
            value={formData.tipo}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              updateField('tipo', e.target.value as PlantillaTipo)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
          >
            <option value="confirmacion">Confirmación</option>
            <option value="recordatorio">Recordatorio</option>
            <option value="cotizacion">Cotización</option>
            <option value="cancelacion">Cancelación</option>
            <option value="reagendamiento">Reagendamiento</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="modal-idioma"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Idioma <span className="text-red-500">*</span>
          </label>
          <select
            id="modal-idioma"
            value={formData.idioma}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              updateField('idioma', e.target.value as PlantillaIdioma)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="modal-experiencia"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Experiencia
        </label>
        <select
          id="modal-experiencia"
          value={formData.experiencia_id ?? ''}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            updateField(
              'experiencia_id',
              e.target.value === '' ? null : e.target.value,
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40"
        >
          <option value="">Genérica (todas las experiencias)</option>
          {experiencias.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Si una experiencia tiene plantilla específica, gana sobre la genérica.
        </p>
      </div>

      <div>
        <label
          htmlFor="modal-cuerpo-texto"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Cuerpo en texto plano (opcional)
        </label>
        <textarea
          id="modal-cuerpo-texto"
          rows={3}
          value={formData.cuerpo_texto ?? ''}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            updateField(
              'cuerpo_texto',
              e.target.value === '' ? null : e.target.value,
            )
          }
          placeholder="Fallback para clientes que no soportan HTML."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40 font-mono text-xs"
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={formData.activa ?? true}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField('activa', e.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-[#33503E] focus:ring-[#33503E]"
        />
        <span>
          <strong>Activa</strong> — se enviará automáticamente cuando el
          dispatcher la seleccione.
        </span>
      </label>
    </form>
  )
}

interface CuerpoTabProps {
  formData: PlantillaPayload
  updateField: <K extends keyof PlantillaPayload>(
    key: K,
    value: PlantillaPayload[K],
  ) => void
  insertarVariable: (variable: string) => void
  cuerpoRef: React.MutableRefObject<HTMLTextAreaElement | null>
}

function CuerpoTab({
  formData,
  updateField,
  insertarVariable,
  cuerpoRef,
}: CuerpoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-4">
      <div>
        <label
          htmlFor="modal-cuerpo-html"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Cuerpo HTML <span className="text-red-500">*</span>
        </label>
        <textarea
          id="modal-cuerpo-html"
          ref={cuerpoRef}
          rows={20}
          value={formData.cuerpo_html}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            updateField('cuerpo_html', e.target.value)
          }
          placeholder={'<!doctype html><html><body>\n  <h2>Hola {{nombre_cliente}}</h2>\n  ...\n</body></html>'}
          spellCheck={false}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B15543]/40 font-mono text-xs leading-relaxed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Las variables{' '}
          <code className="bg-gray-100 px-1 rounded">{'{{nombre_cliente}}'}</code>{' '}
          se reemplazan al enviar. Usa los chips de la derecha.
        </p>
      </div>

      <aside className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Variables disponibles
        </p>
        <div className="flex flex-wrap gap-2">
          {VARIABLES_JINJA.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => insertarVariable(v.key)}
              title={v.descripcion}
              className="px-2 py-1 text-xs rounded-md bg-[#E3DBCB]/60 hover:bg-[#E3DBCB] text-[#33503E] border border-[#33503E]/20 font-mono"
            >
              {'{{'}
              {v.key}
              {'}}'}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Click en cualquier chip para insertarla en la posición del cursor del
          editor. <code>addons_lista</code> ya viene como{' '}
          <code>&lt;li&gt;</code> pre-construidos por el backend (no envolver
          en &lt;ul&gt; aparte si tu plantilla ya lo hace).
        </p>
      </aside>
    </div>
  )
}

interface PreviewTabProps {
  asuntoConMock: string
  cuerpoConMock: string
}

function PreviewTab({ asuntoConMock, cuerpoConMock }: PreviewTabProps) {
  return (
    <div className="space-y-3">
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-sm">
        <p className="text-xs text-gray-500 mb-1">Asunto</p>
        <p className="font-medium text-gray-900 break-words">
          {asuntoConMock || (
            <span className="italic text-gray-400">
              Sin asunto — completa la pestaña Datos.
            </span>
          )}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">
          Vista previa con datos de ejemplo. Así verá el cliente el email.
        </p>
        <iframe
          srcDoc={cuerpoConMock || '<p style="font-family:sans-serif;color:#888;padding:1rem">Sin contenido — escribe HTML en la pestaña Cuerpo HTML.</p>'}
          title="Vista previa del email"
          sandbox=""
          className="w-full h-96 border border-gray-300 rounded-lg bg-white"
        />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Esta vista renderiza las variables con datos hardcodeados (mock).
        El render real lo hace el backend con Jinja2 y los datos de la reserva.
        Para validar el envío real, usa <strong>“Enviar preview a mi correo”</strong>{' '}
        abajo.
      </p>
    </div>
  )
}
