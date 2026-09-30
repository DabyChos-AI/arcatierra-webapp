'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Gift,
  Info,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import type { ItemCatalogo, ListaCatalogo, TipoCatalogo } from '@/types/planeacion'
import { extraerMensajeError } from './errores'
import {
  formatMXN,
  calcularCotizacion,
  initialWizardData,
  type Cotizacion,
  type ExperienciaCatalogo,
  type IdiomaCliente,
  type ManifestInvitado,
  type Personal,
  type Reserva,
} from '@/types/reservas'

// El backend expone en `cotizacion` el precio base, el adicional por persona y
// cuantas personas cubre el base (`invitados_incluidos`, dato de la experiencia).
// No estan en el tipo Cotizacion base; los leemos con esta extension.
interface CotizacionConCatalogo extends Cotizacion {
  precio_base_experiencia?: number
  precio_adicional_por_persona?: number
  invitados_incluidos?: number
}
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

  // Catalogos
  const [vendedoras, setVendedoras] = useState<Personal[]>([])
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

  // Toast handler
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

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
      const [resV, resG, resA] = await Promise.all([
        fetch(`${API_URL}/api/admin/personal?es_vendedor=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/admin/personal?es_guia=true`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_URL}/api/experiencias/admin?tipo=${encodeURIComponent('ADC EXPERIENCIAS')}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ])
      if (resV.ok) {
        const data = await resV.json()
        const arr: Personal[] = Array.isArray(data) ? data : data?.items ?? []
        setVendedoras(arr.filter((v) => v.activo !== false && v.es_vendedor))
      }
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
          vendedor_id: form.vendedorId || undefined,
          nombre_cliente: form.nombreCliente.trim() || undefined,
          notas_internas: form.notasInternas,
          notas_alergias: form.notasAlergias,
          notas_cliente: form.notasCliente,
          // PS1: siempre presentes; null limpia
          ninos: form.ninos,
          staff: form.staff,
          cortesia: form.cortesia,
          codigo_promocional: form.codigoPromocional.trim() || null,
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
      const data = (await res.json().catch(() => null)) as Reserva | null
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
    if (
      !window.confirm(
        `Cancelar la reserva ${reserva.booking_id}?\nEsta accion no se puede deshacer.`,
      )
    )
      return
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
            motivo: motivoCancelacion,
            procesar_reembolso: procesarReembolso,
          }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      showToast('Reserva cancelada', 'success')
      onUpdated()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al cancelar', 'error')
    }
  }

  if (loading && !reserva) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-medium max-w-md w-full p-8 flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
          <span className="text-sm text-verde">Cargando reserva...</span>
        </div>
      </div>
    )
  }

  if (error || !reserva || !form) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto">
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
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-36 sm:pt-40 pb-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detalle-title"
    >
      <div className="bg-white rounded-lg shadow-medium max-w-5xl w-full max-h-[92vh] flex flex-col">
        {/* Header */}
        <header className="border-b border-neutro-borde px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
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
        <div className="border-b border-neutro-borde px-6 overflow-x-auto">
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
              vendedoras={vendedoras}
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
            />
          )}
          {tab === 'comunicaciones' && <TabComunicaciones />}
          {tab === 'auditoria' && <TabAuditoria reserva={reserva} />}
          {tab === 'acciones' && (
            <TabAcciones
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

        <footer className="border-t border-neutro-borde px-6 py-4 flex items-center justify-end gap-2">
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
          onCreated={() => {
            showToast('Link generado', 'success')
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
          onSaved={() => {
            showToast('Pago registrado', 'success')
            fetchReserva(true)
            onUpdated()
          }}
          onClose={() => setShowPagoManual(false)}
        />
      )}
      {showReagendar && (
        <ModalReagendar
          reservaId={reserva.id}
          bookingId={reserva.booking_id}
          fechaActual={reserva.fecha_experiencia}
          horaActual={reserva.hora_inicio}
          onSaved={() => {
            showToast('Reserva reagendada', 'success')
            fetchReserva(true)
            onUpdated()
          }}
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
  vendedoras,
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
}: {
  reserva: Reserva
  form: FormDatos
  setForm: React.Dispatch<React.SetStateAction<FormDatos | null>>
  vendedoras: Personal[]
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
}) {
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
      <div className="bg-azul-bg border border-azul/30 rounded-lg p-3 text-sm text-azul flex gap-2">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Cualquier cambio que afecte fecha, hora, # invitados o monto total disparara un
          email de actualizacion al cliente al guardar.
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
            className={`text-xs mt-1 ${ninosExcede ? 'text-rojo' : 'text-verde-suave'}`}
          >
            {ninosExcede
              ? `Máximo ${form.invMin} (los invitados)`
              : 'Pagan y cuentan; el precio no cambia'}
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
            {vendedoras.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
                {v.apellidos ? ` ${v.apellidos}` : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 items-start">
        <Field label="Código promocional" htmlFor="d-codigo">
          <input
            id="d-codigo"
            type="text"
            value={form.codigoPromocional}
            onChange={(e) => updateForm('codigoPromocional', e.target.value)}
            placeholder="Opcional"
            maxLength={50}
            data-testid="detalle-codigo"
            className={inputClass}
          />
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
  // Cortesía: la experiencia y los add-ons quedan como valor de referencia y el
  // total es $0. La fila "Cortesía" cuadra la suma con el total que manda el backend.
  const ajusteCortesia = reserva.cortesia
    ? Number(reserva.precio_base) +
      Number(reserva.monto_addons) +
      Number(reserva.propina_monto) -
      Number(reserva.monto_descuento) -
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
                  <td className="px-3 py-2 text-verde">{a.nombre}</td>
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
                      aria-label={`Eliminar ${a.nombre}`}
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
  const cot = reserva.cotizacion as CotizacionConCatalogo | undefined
  const nuevaCotizacion = calcularCotizacion({
    ...initialWizardData,
    invMin: manifestCount,
    precioBase: cot?.precio_base_experiencia ?? 0,
    precioAdicional: cot?.precio_adicional_por_persona ?? 0,
    personasIncluidas: cot?.invitados_incluidos ?? 9,
    addons: (reserva.addons ?? []).map((a) => ({
      id: a.addon_id,
      nombre: a.nombre,
      cantidad: a.cantidad,
      precio_unitario: Number(a.precio_unitario),
    })),
    propinaPct: Number(reserva.propina_pct),
    descuento: Number(reserva.monto_descuento),
    anticipo: Number(reserva.monto_anticipo),
    cortesia: reserva.cortesia === true,
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
                <strong className="tabular-nums text-terracota">{formatMXN(nuevoTotal)}</strong>{' '}
                (para {manifestCount} invitados). ¿Continuar?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
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
}: {
  reserva: Reserva
  totalPagado: number
  saldoPendiente: number
  cortesia: boolean
  onAbrirPagoManual: () => void
  onAbrirLinkMP: () => void
}) {
  const pagos = reserva.pagos ?? []
  const total = Number(reserva.monto_total)
  const porcentaje = total > 0 ? Math.min(100, (totalPagado / total) * 100) : 0
  // Cortesía: lo que valdría (experiencia + add-ons), solo de referencia.
  const valorCortesia = Number(reserva.precio_base) + Number(reserva.monto_addons)

  return (
    <div className="space-y-4">
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

      <div className="bg-white border border-neutro-borde rounded-lg overflow-hidden">
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
                    {p.fecha_pago?.slice(0, 10) ?? p.fecha_registro.slice(0, 10)}
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
                          : 'bg-amarillo-bg text-amarillo border border-amarillo/30'
                      }`}
                      title={
                        p.mp_status === 'pending'
                          ? 'Estado pending: el cliente aun no completa el pago. Al pagar, MercadoPago notifica via webhook y el estado cambia automaticamente a approved.'
                          : undefined
                      }
                    >
                      {p.mp_status}
                    </span>
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
        <div className="flex gap-2">
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
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TAB 5 — Comunicaciones (placeholder Fase D)
// ============================================================================
function TabComunicaciones() {
  return (
    <div className="bg-neutro-light/40 border border-neutro-borde rounded-lg p-6 text-center">
      <Info className="h-8 w-8 mx-auto text-verde-suave mb-2" aria-hidden="true" />
      <p className="text-sm text-verde">
        Sera alimentado en Fase D — emails transaccionales no enviados aun.
      </p>
    </div>
  )
}

// ============================================================================
// TAB 6 — Auditoria
// ============================================================================
function TabAuditoria({ reserva }: { reserva: Reserva }) {
  const eventos = [
    {
      ts: reserva.fecha_creacion,
      titulo: 'Reserva creada',
      descripcion: `Booking ${reserva.booking_id}`,
    },
    {
      ts: reserva.fecha_actualizacion,
      titulo: 'Ultima actualizacion',
      descripcion: `Estado: ${reserva.estado} · Pago: ${reserva.estado_pago}`,
    },
  ]

  return (
    <div className="space-y-2">
      {eventos.map((ev, idx) => (
        <div
          key={idx}
          className="border border-neutro-borde rounded-lg p-3 bg-white flex gap-3"
        >
          <CalendarClock
            className="h-5 w-5 text-verde-suave flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-verde">{ev.titulo}</p>
            <p className="text-xs text-verde-suave">
              {new Date(ev.ts).toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-verde-suave">{ev.descripcion}</p>
          </div>
        </div>
      ))}
      <p className="text-xs text-verde-suave italic">
        El log completo de auditoria se incorpora en una fase posterior.
      </p>
    </div>
  )
}

// ============================================================================
// TAB 7 — Acciones
// ============================================================================
function TabAcciones({
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
        <div className="flex items-center gap-2">
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
            className="flex-1 border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
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
          Cambiar la fecha y hora de la experiencia, notificando al cliente.
        </p>
        <button
          type="button"
          onClick={onAbrirReagendar}
          className="inline-flex items-center gap-2 bg-azul hover:opacity-90 text-white px-3 py-2 rounded-lg text-sm font-medium"
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
          className="w-full border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rojo/30 focus:border-rojo"
          placeholder="Razon de la cancelacion..."
        />
        <label className="flex items-center gap-2 text-sm text-verde cursor-pointer mt-2 mb-3">
          <input
            type="checkbox"
            checked={procesarReembolso}
            onChange={(e) => setProcesarReembolso(e.target.checked)}
            className="w-4 h-4 text-rojo border-neutro-borde rounded focus:ring-rojo"
          />
          Procesar reembolso de pagos aprobados
        </label>
        <button
          type="button"
          onClick={onCancelarReserva}
          className="inline-flex items-center gap-2 bg-rojo hover:opacity-90 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Cancelar reserva
        </button>
      </div>
    </div>
  )
}
