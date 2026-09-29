'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Edit2, Loader2, Plus, Ticket, Trash2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { formatMXN } from '@/types/reservas'
import type {
  EventoPlaneacion,
  ItemCatalogo,
  ListaTickets,
  ResumenTickets,
  VentaTicket,
  VentaTicketPatch,
  VentaTicketPayload,
} from '@/types/planeacion'
import { inputClass } from './CamposPlaneacion'
import { hoyMexico, horario, sinTope } from './fechas'
import { textoONull } from './utils'

// Las ventas de la página web ocupan cupo solas (carrito): no se registran a mano
function esPaginaWeb(f: ItemCatalogo): boolean {
  return (
    f.nombre
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim() === 'pagina web'
  )
}

interface FormVenta {
  // null = agregando; si no, el id de la venta que se edita
  ventaId: string | null
  fuenteId: string
  cantidad: string
  monto: string
  fecha: string
  notas: string
}

/**
 * Tickets vendidos por canal de una fecha pública. Cada venta ocupa cupo (igual que la web),
 * así que un 409 «Solo quedan N lugares» se muestra aquí. Tras cada cambio se relee la lista
 * en silencio para refrescar el resumen, y la fila de la página con `onEventoActualizado`.
 */
export default function ModalTickets({
  evento,
  fuentes,
  onClose,
  onEventoActualizado,
}: {
  evento: EventoPlaneacion
  // fuentes activas del catálogo (se ofrecen solo los canales, sin «Página web»)
  fuentes: ItemCatalogo[]
  onClose: () => void
  onEventoActualizado: (evento: EventoPlaneacion) => void
}) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [ventas, setVentas] = useState<VentaTicket[]>([])
  const [resumen, setResumen] = useState<ResumenTickets | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  const [form, setForm] = useState<FormVenta | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [porBorrar, setPorBorrar] = useState<VentaTicket | null>(null)
  const [borrando, setBorrando] = useState(false)

  const canales = fuentes.filter((f) => f.tipo === 'canal' && !esPaginaWeb(f))
  // Ref para no volver a cargar cada vez que la página pase una función nueva
  const onEventoRef = useRef(onEventoActualizado)
  useEffect(() => {
    onEventoRef.current = onEventoActualizado
  }, [onEventoActualizado])

  const cargar = useCallback(
    async (silent = false) => {
      if (!token) return
      if (!silent) setCargando(true)
      setErrorCarga(null)
      try {
        const res = await fetch(`${API_URL}/api/admin/eventos/${evento.id}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, res.status))
        }
        const data = (await res.json()) as ListaTickets
        setVentas(data.items ?? [])
        setResumen(data.resumen)
        if (data.evento) onEventoRef.current(data.evento)
      } catch (err) {
        setErrorCarga(err instanceof Error ? err.message : 'Error al cargar los tickets')
      } finally {
        if (!silent) setCargando(false)
      }
    },
    [token, evento.id],
  )

  useEffect(() => {
    cargar()
  }, [cargar])

  const abrirAgregar = () => {
    setError(null)
    setMensaje(null)
    setPorBorrar(null)
    setForm({
      ventaId: null,
      fuenteId: canales.length === 1 ? canales[0].id : '',
      cantidad: '1',
      monto: '',
      fecha: hoyMexico(),
      notas: '',
    })
  }

  const abrirEditar = (v: VentaTicket) => {
    setError(null)
    setMensaje(null)
    setPorBorrar(null)
    setForm({
      ventaId: v.id,
      fuenteId: v.fuente_id ?? '',
      cantidad: String(v.cantidad),
      monto: v.monto != null ? String(v.monto) : '',
      fecha: v.fecha_venta,
      notas: v.notas ?? '',
    })
  }

  const ventaEditada = form?.ventaId ? ventas.find((v) => v.id === form.ventaId) ?? null : null
  // La fuente de una venta que se edita se muestra aunque no se ofrezca (web, persona, archivada)
  const fuenteFuera =
    ventaEditada?.fuente_id && !canales.some((c) => c.id === ventaEditada.fuente_id)
      ? { id: ventaEditada.fuente_id, nombre: ventaEditada.fuente_nombre ?? 'Fuente guardada' }
      : null

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !form) return
    setError(null)
    setMensaje(null)
    const cantidad = Number(form.cantidad)
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return setError('La cantidad debe ser un número entero mayor que 0')
    }
    let monto: number | null = null
    if (form.monto.trim() !== '') {
      monto = Number(form.monto)
      if (!Number.isFinite(monto) || monto < 0) return setError('El monto debe ser 0 o más')
    }
    if (!form.ventaId && !form.fuenteId) return setError('Elige el canal de la venta')

    setSaving(true)
    try {
      let res: Response
      if (form.ventaId) {
        const patch: VentaTicketPatch = {
          cantidad,
          monto,
          notas: textoONull(form.notas),
        }
        // fuente y fecha: null = no cambia («sin desglose» se queda así si no se elige canal)
        if (form.fuenteId) patch.fuente_id = form.fuenteId
        if (form.fecha) patch.fecha_venta = form.fecha
        res = await fetch(`${API_URL}/api/admin/eventos/${evento.id}/tickets/${form.ventaId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
      } else {
        const payload: VentaTicketPayload = {
          fuente_id: form.fuenteId,
          cantidad,
          monto,
          notas: textoONull(form.notas),
        }
        if (form.fecha) payload.fecha_venta = form.fecha
        res = await fetch(`${API_URL}/api/admin/eventos/${evento.id}/tickets`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const venta = (await res.json()) as VentaTicket
      // La fila se pinta con la respuesta; el resumen y la fila de la página, con la relectura
      setVentas((prev) =>
        form.ventaId ? prev.map((v) => (v.id === venta.id ? venta : v)) : [venta, ...prev],
      )
      setMensaje(
        form.ventaId
          ? 'Venta actualizada.'
          : `${venta.cantidad} ${venta.cantidad === 1 ? 'ticket registrado' : 'tickets registrados'}.`,
      )
      setForm(null)
      await cargar(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const confirmarBorrar = async () => {
    if (!token || !porBorrar) return
    setBorrando(true)
    setError(null)
    setMensaje(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/eventos/${evento.id}/tickets/${porBorrar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const id = porBorrar.id
      setVentas((prev) => prev.filter((v) => v.id !== id))
      setMensaje(
        `Venta borrada: se liberaron ${porBorrar.cantidad} ${porBorrar.cantidad === 1 ? 'lugar' : 'lugares'}.`,
      )
      if (form?.ventaId === id) setForm(null)
      setPorBorrar(null)
      await cargar(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar')
    } finally {
      setBorrando(false)
    }
  }

  const cerrar = () => {
    if (!saving && !borrando) onClose()
  }

  const capacidad = resumen?.capacidad_maxima ?? evento.capacidad_maxima
  const ocupada = resumen?.capacidad_ocupada ?? evento.capacidad_ocupada

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-20 pb-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tickets-modal-titulo"
        data-testid="tickets-modal"
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl z-10">
          <div>
            <h2
              id="tickets-modal-titulo"
              className="font-display text-xl text-verde flex items-center gap-2"
            >
              <Ticket className="h-5 w-5 text-terracota" aria-hidden="true" />
              Tickets por canal
            </h2>
            <p className="text-sm text-verde-suave mt-0.5">
              {evento.experiencia_nombre ?? evento.nombre_evento} ·{' '}
              {formatFechaMexico(evento.fecha_evento, { weekday: 'long' })} ·{' '}
              {horario(evento.hora_inicio, evento.hora_fin)}
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            disabled={saving || borrando}
            aria-label="Cerrar modal de tickets"
            className="p-2 hover:bg-neutro-light rounded-lg"
          >
            <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Resumen */}
          <div
            data-testid="tickets-resumen"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            aria-live="polite"
          >
            <div className="bg-neutro-light border border-neutro-borde rounded-lg p-3">
              <p className="text-xs text-verde-suave">Ocupados</p>
              <p className="text-lg font-display font-semibold text-verde tabular-nums">
                {ocupada}
                {!sinTope(capacidad) && (
                  <span className="text-sm text-verde-suave"> / {capacidad}</span>
                )}
              </p>
            </div>
            <div className="bg-verde/10 border border-verde/30 rounded-lg p-3">
              <p className="text-xs text-verde-suave">Disponibles</p>
              <p className="text-lg font-display font-semibold text-verde tabular-nums">
                {sinTope(capacidad)
                  ? 'Sin tope'
                  : resumen?.disponibles ?? Math.max(0, (capacidad ?? 0) - ocupada)}
              </p>
            </div>
            <div className="bg-terracota/5 border border-terracota/20 rounded-lg p-3">
              <p className="text-xs text-verde-suave">Registrados a mano</p>
              <p className="text-lg font-display font-semibold text-verde tabular-nums">
                {resumen?.tickets_registrados ?? evento.tickets_registrados}
              </p>
            </div>
            <div className="bg-azul-bg border border-azul/30 rounded-lg p-3">
              <p className="text-xs text-verde-suave">Página web</p>
              <p className="text-lg font-display font-semibold text-verde tabular-nums">
                {resumen?.tickets_web ?? evento.tickets_web}
              </p>
            </div>
          </div>

          {mensaje && (
            <div
              role="status"
              className="bg-verde/10 border border-verde/30 rounded-lg p-3 text-sm text-verde"
            >
              {mensaje}
            </div>
          )}

          {errorCarga && ventas.length > 0 && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 bg-amarillo-bg border border-amarillo/30 rounded-lg text-sm text-verde"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amarillo" aria-hidden="true" />
              <span>No se pudo actualizar el resumen: {errorCarga}</span>
              <button
                type="button"
                onClick={() => cargar(true)}
                className="ml-auto text-xs bg-white border border-neutro-borde px-2 py-1 rounded hover:bg-neutro-light"
              >
                Reintentar
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              data-testid="tickets-error"
              className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Ventas */}
          <div className="border border-neutro-borde rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="tickets-tabla">
                <thead>
                  <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                    <th scope="col" className="px-3 py-2 font-medium text-verde">Canal</th>
                    <th scope="col" className="px-3 py-2 font-medium text-verde text-center">Cantidad</th>
                    <th scope="col" className="px-3 py-2 font-medium text-verde text-right">Monto</th>
                    <th scope="col" className="px-3 py-2 font-medium text-verde">Fecha de venta</th>
                    <th scope="col" className="px-3 py-2 font-medium text-verde">Notas</th>
                    <th scope="col" className="px-3 py-2 font-medium text-verde text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8">
                        <div className="flex items-center justify-center text-sm text-verde-suave">
                          <Loader2 className="h-5 w-5 animate-spin text-terracota mr-2" aria-hidden="true" />
                          Cargando ventas...
                        </div>
                      </td>
                    </tr>
                  ) : errorCarga && ventas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-sm text-rojo">
                        {errorCarga}{' '}
                        <button
                          type="button"
                          onClick={() => cargar()}
                          className="ml-2 text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20"
                        >
                          Reintentar
                        </button>
                      </td>
                    </tr>
                  ) : ventas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-verde-suave">
                        Sin ventas registradas a mano para esta fecha.
                      </td>
                    </tr>
                  ) : (
                    ventas.map((v) => (
                      <tr
                        key={v.id}
                        data-testid={`tickets-fila-${v.id}`}
                        className={`border-b border-neutro-borde ${
                          form?.ventaId === v.id ? 'bg-terracota/5' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-verde">
                          {v.fuente_id ? (
                            v.fuente_nombre ?? '—'
                          ) : (
                            <span className="italic text-verde-suave">Sin desglose</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center tabular-nums text-verde font-medium">
                          {v.cantidad}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-verde">
                          {v.monto != null ? formatMXN(v.monto) : '—'}
                        </td>
                        <td className="px-3 py-2 text-verde whitespace-nowrap">
                          {formatFechaMexico(v.fecha_venta)}
                        </td>
                        <td className="px-3 py-2 text-verde-suave max-w-[200px] truncate" title={v.notas ?? undefined}>
                          {v.notas ?? '—'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => abrirEditar(v)}
                              aria-label={`Editar venta de ${v.cantidad} (${v.fuente_nombre ?? 'sin desglose'})`}
                              className="p-1.5 text-verde hover:bg-verde/10 rounded-lg"
                            >
                              <Edit2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setError(null)
                                setPorBorrar(v)
                              }}
                              aria-label={`Borrar venta de ${v.cantidad} (${v.fuente_nombre ?? 'sin desglose'})`}
                              className="p-1.5 text-rojo hover:bg-rojo/10 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirmación de borrado, dentro del modal */}
          {porBorrar && (
            <div
              role="alertdialog"
              aria-labelledby="tickets-borrar-texto"
              data-testid="tickets-confirmar-borrar"
              className="border border-rojo/30 bg-rojo-bg/50 rounded-lg p-3 flex flex-wrap items-center gap-3"
            >
              <p id="tickets-borrar-texto" className="text-sm text-verde flex-1">
                ¿Borrar la venta de {porBorrar.cantidad} ({porBorrar.fuente_nombre ?? 'sin desglose'})?
                Libera {porBorrar.cantidad} {porBorrar.cantidad === 1 ? 'lugar' : 'lugares'}.
              </p>
              <button
                type="button"
                onClick={() => setPorBorrar(null)}
                disabled={borrando}
                className="px-3 py-1.5 text-sm text-verde border border-neutro-borde rounded-lg bg-white hover:bg-neutro-light disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBorrar}
                disabled={borrando}
                data-testid="tickets-confirmar-borrar-si"
                className="inline-flex items-center gap-1 bg-rojo hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {borrando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Sí, borrar
              </button>
            </div>
          )}

          {/* Agregar / editar */}
          {form ? (
            <form
              onSubmit={guardar}
              className="bg-neutro-light/40 border border-neutro-borde rounded-lg p-4 space-y-3"
              aria-label={form.ventaId ? 'Editar venta' : 'Agregar venta'}
            >
              <p className="text-sm font-medium text-verde">
                {form.ventaId ? 'Editar venta' : 'Agregar venta'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="tk-fuente" className="block text-xs text-verde-suave mb-1">
                    Canal {!form.ventaId && <span className="text-rojo">*</span>}
                  </label>
                  <select
                    id="tk-fuente"
                    value={form.fuenteId}
                    onChange={(e) => setForm({ ...form, fuenteId: e.target.value })}
                    required={!form.ventaId}
                    data-testid="tickets-fuente"
                    aria-describedby="tk-fuente-nota"
                    className={inputClass}
                  >
                    <option value="">
                      {ventaEditada && !ventaEditada.fuente_id
                        ? 'Sin desglose (se queda así)'
                        : '— Elige el canal —'}
                    </option>
                    {fuenteFuera && <option value={fuenteFuera.id}>{fuenteFuera.nombre}</option>}
                    {canales.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <p id="tk-fuente-nota" className="text-xs text-verde-suave mt-1">
                    Las ventas de la página se cuentan solas.
                  </p>
                </div>
                <div>
                  <label htmlFor="tk-cantidad" className="block text-xs text-verde-suave mb-1">
                    Cantidad <span className="text-rojo">*</span>
                  </label>
                  <input
                    id="tk-cantidad"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    data-testid="tickets-cantidad"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label htmlFor="tk-monto" className="block text-xs text-verde-suave mb-1">
                    Monto (MXN)
                  </label>
                  <input
                    id="tk-monto"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    placeholder="Opcional"
                    data-testid="tickets-monto"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label htmlFor="tk-fecha" className="block text-xs text-verde-suave mb-1">
                    Fecha de venta
                  </label>
                  <input
                    id="tk-fecha"
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="tk-notas" className="block text-xs text-verde-suave mb-1">
                    Notas
                  </label>
                  <input
                    id="tk-notas"
                    type="text"
                    maxLength={2000}
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    placeholder="Opcional"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(null)
                    setError(null)
                  }}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm text-verde border border-neutro-borde rounded-lg bg-white hover:bg-neutro-light disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  data-testid="tickets-guardar"
                  className="inline-flex items-center gap-1 bg-terracota hover:bg-terracota-dark text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {form.ventaId ? 'Guardar venta' : 'Registrar tickets'}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={abrirAgregar}
              disabled={cargando}
              data-testid="tickets-agregar"
              className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Agregar venta
            </button>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-neutro-borde">
          <button
            type="button"
            onClick={cerrar}
            disabled={saving || borrando}
            className="px-4 py-2 text-sm text-verde border border-neutro-borde rounded-lg hover:bg-neutro-light disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
