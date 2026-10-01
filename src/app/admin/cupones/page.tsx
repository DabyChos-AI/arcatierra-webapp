'use client'

// Fase 4b de PLAN-EXP-SIN-FALLAS (sesión 40, 1-oct-2026) · CP1: pantalla de cupones del panel (F3, D16-4).
// Contrato: EXP-FASE4B-CONTRATO.md §C6/§F3. UN solo sistema de cupones para la tienda y las reservas privadas del
// panel (D12). Sin borrar: un cupón se desactiva (PATCH {activo}); los usados tienen FK desde pedidos y reservas.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  Edit2,
  Loader2,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  TicketPercent,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico, hoyMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { formatMXN } from '@/types/reservas'
import {
  textoAplicaA,
  textoUsos,
  textoValorCupon,
  type Cupon,
  type CuponesListResponse,
} from '@/types/cupones'
import AdminTopbar from '../components/AdminTopbar'
import ModalCupon from './components/ModalCupon'
import { ESTADO_CUPON_CLASE, ESTADO_CUPON_LABEL, estadoCupon } from './components/estadoCupon'

const PER_PAGE = 50

type FiltroActivo = '' | 'true' | 'false'

/** «1 oct 2026 – 31 dic 2026» · «Desde …» · «Hasta …» · «Sin fechas». */
function textoVigencia(c: Cupon): string {
  if (c.fecha_inicio && c.fecha_fin) {
    return `${formatFechaMexico(c.fecha_inicio)} – ${formatFechaMexico(c.fecha_fin)}`
  }
  if (c.fecha_inicio) return `Desde ${formatFechaMexico(c.fecha_inicio)}`
  if (c.fecha_fin) return `Hasta ${formatFechaMexico(c.fecha_fin)}`
  return 'Sin fechas'
}

export default function CuponesPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [hoy] = useState(hoyMexico)
  const [items, setItems] = useState<Cupon[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const [busquedaInput, setBusquedaInput] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>('')
  const [page, setPage] = useState(1)

  // undefined = modal cerrado · null = nuevo · Cupon = editar
  const [modalCupon, setModalCupon] = useState<Cupon | null | undefined>(undefined)
  const [cambiando, setCambiando] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  // Solo la última petición pinta: una búsqueda vieja que llega tarde no pisa a la nueva
  const peticion = useRef(0)

  /** `silencioso` = recarga sin vaciar la tabla (tras guardar). */
  const cargar = useCallback(
    async (silencioso = false) => {
      if (!token) return
      const esta = ++peticion.current
      if (!silencioso) setCargando(true)
      setError(null)
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) })
        if (busqueda) params.set('q', busqueda)
        if (filtroActivo) params.set('activo', filtroActivo)
        const res = await fetch(`${API_URL}/api/admin/cupones?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const datos = await res.json().catch(() => null)
          throw new Error(extraerMensajeError(datos, res.status))
        }
        const datos: CuponesListResponse = await res.json()
        if (esta !== peticion.current) return
        setItems(datos.items)
        setTotal(datos.total)
      } catch (e) {
        if (esta !== peticion.current) return
        setError(
          e instanceof TypeError
            ? 'Sin conexión con el servidor. Revisa tu internet y reintenta.'
            : e instanceof Error
              ? e.message
              : 'No se pudieron cargar los cupones.',
        )
      } finally {
        if (esta === peticion.current) setCargando(false)
      }
    },
    [token, page, busqueda, filtroActivo],
  )

  useEffect(() => {
    setPage(1)
  }, [busqueda, filtroActivo])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    const h = setTimeout(() => setBusqueda(busquedaInput.trim()), 300)
    return () => clearTimeout(h)
  }, [busquedaInput])

  const cerrarModal = useCallback(() => setModalCupon(undefined), [])

  const alGuardar = useCallback(
    (c: Cupon) => {
      setModalCupon(undefined)
      // La fila editada se pinta ya con lo que devolvió el backend; luego se recarga sin vaciar la tabla
      setItems((prev) => (prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : prev))
      cargar(true)
    },
    [cargar],
  )

  /** Activar / desactivar sin recargar: la fila se queda donde está aunque el filtro ya no la incluya. */
  const alternarActivo = async (c: Cupon) => {
    if (!token || cambiando) return
    setErrorAccion(null)
    setCambiando(c.id)
    try {
      const res = await fetch(`${API_URL}/api/admin/cupones/${encodeURIComponent(c.id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !c.activo }),
      })
      if (!res.ok) {
        const datos = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(datos, res.status))
      }
      const actualizado: Cupon = await res.json()
      setItems((prev) => prev.map((x) => (x.id === actualizado.id ? actualizado : x)))
    } catch (e) {
      setErrorAccion(
        e instanceof TypeError
          ? 'Sin conexión con el servidor. Revisa tu internet y reintenta.'
          : e instanceof Error
            ? `No se pudo ${c.activo ? 'desactivar' : 'activar'} ${c.codigo}: ${e.message}`
            : 'No se pudo cambiar el cupón.',
      )
    } finally {
      setCambiando(null)
    }
  }

  const mensajeError = error ?? errorAccion

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />

      <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-auto">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-terracota/10 shrink-0">
              <TicketPercent className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl text-verde mb-0">Cupones</h1>
              <p className="text-sm text-verde-suave mt-1">
                Códigos de descuento de la tienda y de las reservas privadas del panel
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="cupon-nuevo"
            onClick={() => setModalCupon(null)}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo cupón
          </button>
        </header>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-verde-suave"
              aria-hidden="true"
            />
            <label htmlFor="cupones-buscar" className="sr-only">
              Buscar cupón
            </label>
            <input
              id="cupones-buscar"
              data-testid="cupones-buscar"
              type="search"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              placeholder="Buscar por código o descripción..."
              className="w-full pl-9 pr-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>
          <div>
            <label htmlFor="cupones-filtro-activo" className="sr-only">
              Filtrar por estado
            </label>
            <select
              id="cupones-filtro-activo"
              data-testid="cupones-filtro-activo"
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value as FiltroActivo)}
              className="w-full sm:w-auto border border-neutro-borde rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => cargar()}
            aria-label="Actualizar lista de cupones"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde hover:bg-neutro-light"
          >
            <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {mensajeError && (
          <div
            data-testid="cupones-error"
            role="alert"
            className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex items-center gap-2 text-sm text-rojo"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="min-w-0">{mensajeError}</span>
            {error ? (
              <button
                type="button"
                onClick={() => cargar()}
                className="ml-auto text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20 shrink-0"
              >
                Reintentar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setErrorAccion(null)}
                className="ml-auto text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20 shrink-0"
              >
                Cerrar
              </button>
            )}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-neutro-borde overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
              <span className="ml-3 text-sm text-verde-suave">Cargando cupones...</span>
            </div>
          ) : items.length === 0 ? (
            <div data-testid="cupones-vacio" className="text-center py-16 px-4 text-verde-suave">
              <TicketPercent className="h-12 w-12 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
              <p className="font-medium">
                {busqueda || filtroActivo ? 'Ningún cupón coincide con la búsqueda' : 'Todavía no hay cupones'}
              </p>
              <p className="text-sm mt-1">
                {busqueda || filtroActivo ? 'Ajusta la búsqueda o el filtro.' : 'Crea el primero con «Nuevo cupón».'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table data-testid="cupones-tabla" className="w-full text-sm">
                <thead>
                  <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                    <th className="px-4 py-3 font-medium text-verde">Código</th>
                    <th className="px-4 py-3 font-medium text-verde">Descripción</th>
                    <th className="px-4 py-3 font-medium text-verde">Descuento</th>
                    <th className="px-4 py-3 font-medium text-verde">Aplica a</th>
                    <th className="px-4 py-3 font-medium text-verde">Vigencia</th>
                    <th className="px-4 py-3 font-medium text-verde">Usos</th>
                    <th className="px-4 py-3 font-medium text-verde">Estado</th>
                    <th className="px-4 py-3 font-medium text-verde text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => {
                    const estado = estadoCupon(c, hoy)
                    return (
                      <tr
                        key={c.id}
                        data-testid={`cupon-fila-${c.codigo}`}
                        className="border-b border-neutro-borde hover:bg-neutro-light/50 align-top"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-verde whitespace-nowrap">{c.codigo}</td>
                        <td className="px-4 py-3 text-verde-suave min-w-[160px]">
                          {c.descripcion || <span className="italic text-neutro-gris">—</span>}
                        </td>
                        <td className="px-4 py-3 text-verde whitespace-nowrap">
                          {textoValorCupon(c)}
                          {Number(c.minimo_compra) > 0 && (
                            <span className="block text-xs text-verde-suave">
                              Mínimo {formatMXN(Number(c.minimo_compra))}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-verde-suave">{textoAplicaA(c)}</td>
                        <td className="px-4 py-3 text-verde-suave whitespace-nowrap">{textoVigencia(c)}</td>
                        <td
                          data-testid={`cupon-usos-${c.codigo}`}
                          className="px-4 py-3 tabular-nums text-verde whitespace-nowrap"
                          title={`${c.usos_pedidos} pedido(s) de la tienda · ${c.usos_reservas} reserva(s) privada(s)`}
                        >
                          {textoUsos(c)}
                          {c.usos > 0 && (
                            <span className="block text-xs text-verde-suave">
                              {c.usos_pedidos} tienda · {c.usos_reservas} reservas
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            data-testid={`cupon-estado-${c.codigo}`}
                            className={`inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${ESTADO_CUPON_CLASE[estado]}`}
                          >
                            {ESTADO_CUPON_LABEL[estado]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              data-testid={`cupon-editar-${c.codigo}`}
                              onClick={() => setModalCupon(c)}
                              aria-label={`Editar cupón ${c.codigo}`}
                              className="p-2 text-verde hover:bg-verde/10 rounded-lg"
                            >
                              <Edit2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              data-testid={`cupon-toggle-${c.codigo}`}
                              onClick={() => alternarActivo(c)}
                              disabled={cambiando === c.id}
                              aria-label={`${c.activo ? 'Desactivar' : 'Activar'} cupón ${c.codigo}`}
                              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs whitespace-nowrap disabled:opacity-50 ${
                                c.activo ? 'text-rojo hover:bg-rojo/10' : 'text-verde hover:bg-verde/10'
                              }`}
                            >
                              {cambiando === c.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              ) : c.activo ? (
                                <PowerOff className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Power className="h-4 w-4" aria-hidden="true" />
                              )}
                              {c.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && total > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-neutro-light border-t border-neutro-borde text-sm">
              <span className="text-verde-suave">
                {total} cupón(es){totalPages > 1 ? ` · Página ${page} de ${totalPages}` : ''}
              </span>
              {totalPages > 1 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border border-neutro-borde rounded-lg hover:bg-white disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 border border-neutro-borde rounded-lg hover:bg-white disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {modalCupon !== undefined && (
        <ModalCupon token={token} cupon={modalCupon} onClose={cerrarModal} onSaved={alGuardar} />
      )}
    </div>
  )
}
