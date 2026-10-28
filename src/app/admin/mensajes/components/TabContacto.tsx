'use client'

// Pestaña «Contacto» de la bandeja (WF11, R11b): los mensajes de /contacto, más nuevos primero. Filtro por estado, búsqueda
// (nombre, correo, asunto y mensaje; la hace el backend) y páginas de 20. El clic en una fila abre el detalle; un cambio de
// estado actualiza la fila en su lugar (no desaparece aunque el filtro ya no la incluya: se ve al recargar).

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { ErrorPanel, pedirAlPanel } from '@/lib/fetchPanel'
import { ETIQUETA_ESTADO_MENSAJE, type EstadoMensaje, type MensajeContacto, type MensajesRespuesta } from '@/types/mensajes'
import ModalMensaje from './ModalMensaje'
import {
  CLASE_ESTADO_MENSAJE,
  ESTADOS_MENSAJE,
  POR_PAGINA_MENSAJES,
  esEstadoMensaje,
  fechaHora,
  normalizarMensajes,
  plural,
} from './mensajes'

interface Props {
  token: string
  /** `?mensaje_id=` (campana): abre ese detalle al entrar. */
  mensajeInicial: string | null
  onMensajeInicialUsado: () => void
}

const ESPERA_BUSQUEDA_MS = 400

export default function TabContacto({ token, mensajeInicial, onMensajeInicialUsado }: Props) {
  const [estado, setEstado] = useState<EstadoMensaje | ''>('')
  const [buscar, setBuscar] = useState('')
  const [q, setQ] = useState('')
  const [pagina, setPagina] = useState(1)
  const [datos, setDatos] = useState<MensajesRespuesta | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [abierto, setAbierto] = useState<string | null>(null)
  const pedidoRef = useRef(0)

  // La búsqueda espera a que la persona deje de teclear.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(buscar.trim())
      setPagina(1)
    }, ESPERA_BUSQUEDA_MS)
    return () => window.clearTimeout(t)
  }, [buscar])

  useEffect(() => {
    if (!mensajeInicial) return
    setAbierto(mensajeInicial)
    onMensajeInicialUsado()
  }, [mensajeInicial, onMensajeInicialUsado])

  const cargar = useCallback(async () => {
    const n = ++pedidoRef.current
    setCargando(true)
    setError(null)
    const params = new URLSearchParams({
      estado,
      q,
      page: String(pagina),
      limit: String(POR_PAGINA_MENSAJES),
    })
    try {
      const cuerpo = await pedirAlPanel<unknown>(`${API_URL}/api/admin/mensajes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (n !== pedidoRef.current) return
      setDatos(normalizarMensajes(cuerpo))
    } catch (e) {
      if (n !== pedidoRef.current) return
      setError(e instanceof ErrorPanel ? e.mensaje : 'No se pudieron cargar los mensajes.')
    } finally {
      if (n === pedidoRef.current) setCargando(false)
    }
  }, [token, estado, q, pagina])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const actualizarFila = useCallback((m: MensajeContacto) => {
    setDatos((prev) => {
      if (!prev) return prev
      const antes = prev.items.find((it) => it.id === m.id)
      const delta = antes ? (antes.estado === 'nuevo' ? -1 : 0) + (m.estado === 'nuevo' ? 1 : 0) : 0
      return {
        ...prev,
        items: prev.items.map((it) => (it.id === m.id ? m : it)),
        nuevos: Math.max(0, prev.nuevos + delta),
      }
    })
  }, [])

  const cerrar = useCallback(() => setAbierto(null), [])

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / POR_PAGINA_MENSAJES)) : 1

  return (
    <section aria-label="Mensajes de contacto" className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor="mensajes-buscar" className="block text-xs text-verde-medio">
            Buscar
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verde-medio" aria-hidden="true" />
            <input
              id="mensajes-buscar"
              data-testid="mensajes-buscar"
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Nombre, correo, asunto o texto"
              className="min-h-[44px] w-full rounded-lg border border-neutro-borde bg-white pl-9 pr-3 text-sm text-verde-tipografia"
            />
          </div>
        </div>
        <div>
          <label htmlFor="mensajes-filtro-estado" className="block text-xs text-verde-medio">
            Estado
          </label>
          <select
            id="mensajes-filtro-estado"
            data-testid="mensajes-filtro-estado"
            value={estado}
            onChange={(e) => {
              setEstado(esEstadoMensaje(e.target.value) ? e.target.value : '')
              setPagina(1)
            }}
            className="mt-1 min-h-[44px] rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde"
          >
            <option value="">Todos</option>
            {ESTADOS_MENSAJE.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO_MENSAJE[e]}
              </option>
            ))}
          </select>
        </div>
        {datos && (
          <p data-testid="mensajes-total" className="pb-3 text-sm text-verde-medio">
            {plural(datos.total, 'mensaje', 'mensajes')} · {plural(datos.nuevos, 'nuevo', 'nuevos')}
          </p>
        )}
      </div>

      {error && (
        <div data-testid="mensajes-error" role="alert" className="rounded-xl border border-rojo/30 bg-rojo-bg p-4">
          <p className="flex items-start gap-2 text-sm text-rojo">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
          <button
            type="button"
            data-testid="mensajes-reintentar"
            onClick={() => void cargar()}
            className="mt-3 min-h-[44px] rounded-lg bg-terracota px-4 text-sm font-semibold text-white hover:bg-terracota-dark"
          >
            Reintentar
          </button>
        </div>
      )}

      {cargando && !datos ? (
        <p data-testid="mensajes-cargando" aria-busy="true" className="text-sm text-verde-medio">
          Cargando mensajes…
        </p>
      ) : datos && datos.items.length === 0 && !error ? (
        <div
          data-testid="mensajes-vacio"
          className="flex flex-col items-center gap-2 rounded-xl border border-neutro-borde bg-white p-8 text-center text-verde-medio"
        >
          <Inbox className="h-8 w-8" aria-hidden="true" />
          <p>{q || estado ? 'Ningún mensaje coincide con el filtro.' : 'Todavía no hay mensajes de contacto.'}</p>
        </div>
      ) : datos ? (
        <ul
          data-testid="mensajes-lista"
          aria-busy={cargando}
          className={`divide-y divide-neutro-borde overflow-hidden rounded-xl border border-neutro-borde bg-white ${cargando ? 'opacity-60' : ''}`}
        >
          {datos.items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                data-testid={`mensaje-${m.id}`}
                data-estado={m.estado}
                onClick={() => setAbierto(m.id)}
                className="block w-full px-4 py-3 text-left hover:bg-neutro-light"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`min-w-0 truncate text-sm ${m.estado === 'nuevo' ? 'font-semibold text-verde' : 'text-verde-tipografia'}`}>
                    {m.nombre} <span className="font-normal text-verde-medio">· {m.email}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-verde-medio">{fechaHora(m.creado_en)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CLASE_ESTADO_MENSAJE[m.estado]}`}>
                      {ETIQUETA_ESTADO_MENSAJE[m.estado]}
                    </span>
                  </span>
                </span>
                <span className="mt-1 block truncate text-sm text-verde">{m.asunto ?? '(sin asunto)'}</span>
                <span className="mt-0.5 block truncate text-xs text-verde-medio">{m.mensaje}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {datos && datos.total > POR_PAGINA_MENSAJES && (
        <nav aria-label="Páginas de mensajes" className="flex items-center justify-end gap-2 text-sm text-verde">
          <button
            type="button"
            data-testid="mensajes-pagina-anterior"
            aria-label="Página anterior"
            disabled={pagina <= 1 || cargando}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutro-borde bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            data-testid="mensajes-pagina-siguiente"
            aria-label="Página siguiente"
            disabled={pagina >= totalPaginas || cargando}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutro-borde bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}

      {abierto && <ModalMensaje mensajeId={abierto} token={token} onCerrar={cerrar} onActualizado={actualizarFila} />}
    </section>
  )
}
