'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit2,
  ExternalLink,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
  X,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { EventoPlaneacion, ListaEventos } from '@/types/planeacion'
import AdminTopbar from '../components/AdminTopbar'
import { etiquetaIdioma, nombreGuia } from './components/CamposPlaneacion'
import {
  etiquetaMes,
  finDelMes,
  hoyMexico,
  horario,
  primeroDelMes,
  sinTope,
  sumarMeses,
} from './components/fechas'
import ModalEventoInterno from './components/ModalEventoInterno'
import ModalPlaneacionPublica from './components/ModalPlaneacionPublica'
import ModalTickets from './components/ModalTickets'
import { useCatalogosEventos } from './components/useCatalogosEventos'

type Pestana = 'publicas' | 'internos'

const PESTANAS: { key: Pestana; label: string }[] = [
  { key: 'publicas', label: 'Fechas públicas' },
  { key: 'internos', label: 'Eventos internos' },
]

// «mié 30 sep»
function fechaCorta(iso: string): string {
  return formatFechaMexico(iso, { weekday: 'short', year: undefined })
}

function Guias({ evento }: { evento: EventoPlaneacion }) {
  if (evento.guias.length === 0) return <span className="text-verde-suave">—</span>
  return <span>{evento.guias.map((g) => nombreGuia(g)).join(', ')}</span>
}

/**
 * Eventos y fechas públicas (PS1): la planeación de las fechas públicas (chinampa, cocina,
 * idioma, guías, tickets vendidos por canal) y los eventos internos (Scouting, Montaje,
 * Descanso…). Las fechas públicas se crean y se les cambia fecha/cupo en Experiencias.
 */
export default function EventosPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const catalogos = useCatalogosEventos(token)

  const [mes, setMes] = useState(() => primeroDelMes(hoyMexico()))
  const [pestana, setPestana] = useState<Pestana>('publicas')
  const [eventos, setEventos] = useState<EventoPlaneacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const [planeando, setPlaneando] = useState<EventoPlaneacion | null>(null)
  const [tickets, setTickets] = useState<EventoPlaneacion | null>(null)
  // undefined = cerrado; null = crear
  const [editandoInterno, setEditandoInterno] = useState<EventoPlaneacion | null | undefined>(
    undefined,
  )
  const [porBorrar, setPorBorrar] = useState<EventoPlaneacion | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null)

  // Descarta respuestas viejas si se cambia de mes a media carga
  const peticionRef = useRef(0)

  const fetchEventos = useCallback(
    async (silent = false) => {
      if (!token) return
      const id = ++peticionRef.current
      if (!silent) setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          desde: mes,
          hasta: finDelMes(mes),
          tipo: 'todos',
        })
        const res = await fetch(`${API_URL}/api/admin/eventos?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, res.status))
        }
        const data = (await res.json()) as ListaEventos
        if (id === peticionRef.current) setEventos(data.items ?? [])
      } catch (err) {
        if (id === peticionRef.current) {
          setError(err instanceof Error ? err.message : 'Error al cargar los eventos')
          if (!silent) setEventos([])
        }
      } finally {
        if (id === peticionRef.current && !silent) setLoading(false)
      }
    },
    [token, mes],
  )

  useEffect(() => {
    fetchEventos()
  }, [fetchEventos])

  const publicas = useMemo(() => eventos.filter((e) => e.tipo === 'publica'), [eventos])
  const internos = useMemo(() => eventos.filter((e) => e.tipo === 'interno'), [eventos])
  const lista = pestana === 'publicas' ? publicas : internos

  const cambiarMes = (nuevo: string) => {
    setMes(nuevo)
    setMensaje(null)
  }

  // Una fila se actualiza en su lugar con lo que responde el backend
  const reemplazarEvento = useCallback((actualizado: EventoPlaneacion) => {
    setEventos((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)))
  }, [])

  // Fecha sugerida para un interno nuevo: hoy si cae en el mes que se ve, si no el día 1
  const fechaSugerida = useMemo(() => {
    const hoy = hoyMexico()
    return primeroDelMes(hoy) === mes ? hoy : mes
  }, [mes])

  const handleInternoGuardado = (guardado: EventoPlaneacion, creado: boolean) => {
    setEditandoInterno(undefined)
    setPestana('internos')
    const enEsteMes = primeroDelMes(guardado.fecha_evento) === mes
    setMensaje(
      `«${guardado.nombre_evento}» ${creado ? 'creado' : 'guardado'} para el ${formatFechaMexico(
        guardado.fecha_evento,
        { weekday: 'long' },
      )}${enEsteMes ? '' : ' (en otro mes)'}.`,
    )
    // El orden (fecha, hora) y el mes los decide el backend: relectura silenciosa
    fetchEventos(true)
  }

  const confirmarBorrar = async () => {
    if (!token || !porBorrar) return
    setBorrando(true)
    setErrorBorrar(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/eventos/${porBorrar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const id = porBorrar.id
      setEventos((prev) => prev.filter((e) => e.id !== id))
      setMensaje(`«${porBorrar.nombre_evento}» borrado.`)
      setPorBorrar(null)
    } catch (err) {
      setErrorBorrar(err instanceof Error ? err.message : 'Error al borrar')
    } finally {
      setBorrando(false)
    }
  }

  const columnas = pestana === 'publicas' ? 8 : 7
  const esMesActual = primeroDelMes(hoyMexico()) === mes

  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {/* Header */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-terracota/10">
              <CalendarDays className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-verde">Eventos y fechas públicas</h1>
              <p className="text-sm text-verde-suave mt-1">
                Planeación de las fechas públicas (chinampa, cocina, guías, tickets por canal) y
                eventos internos
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Las fechas públicas se crean y se les cambia fecha/cupo en Experiencias */}
            <Link
              href="/admin/experiencias-publicas"
              data-testid="eventos-abrir-experiencias"
              className="inline-flex items-center gap-2 border border-terracota text-terracota hover:bg-terracota/10 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Abrir fechas en Experiencias
            </Link>
            <button
              type="button"
              onClick={() => setEditandoInterno(null)}
              data-testid="evento-nuevo-interno"
              className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg shadow-terracota transition-colors font-medium"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo evento interno
            </button>
          </div>
        </header>

        {/* Mes */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => cambiarMes(sumarMeses(mes, -1))}
            aria-label="Mes anterior"
            data-testid="eventos-mes-anterior"
            className="p-2 border border-neutro-borde rounded-lg text-verde hover:bg-neutro-light"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <p
            className="min-w-[11rem] text-center font-display text-lg text-verde capitalize"
            data-testid="eventos-mes"
            aria-live="polite"
          >
            {etiquetaMes(mes)}
          </p>
          <button
            type="button"
            onClick={() => cambiarMes(sumarMeses(mes, 1))}
            aria-label="Mes siguiente"
            data-testid="eventos-mes-siguiente"
            className="p-2 border border-neutro-borde rounded-lg text-verde hover:bg-neutro-light"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => cambiarMes(primeroDelMes(hoyMexico()))}
            disabled={esMesActual}
            data-testid="eventos-mes-hoy"
            className="px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => fetchEventos()}
            aria-label="Actualizar eventos"
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 border border-neutro-borde rounded-lg text-sm text-verde hover:bg-neutro-light"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {/* Pestañas */}
        <div className="border-b border-neutro-borde flex gap-1 overflow-x-auto" role="tablist">
          {PESTANAS.map((p) => {
            const activa = pestana === p.key
            const n = p.key === 'publicas' ? publicas.length : internos.length
            return (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => {
                  setPestana(p.key)
                  setMensaje(null)
                }}
                data-testid={`eventos-tab-${p.key}`}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  activa
                    ? 'border-terracota text-terracota font-semibold'
                    : 'border-transparent text-verde-suave hover:text-verde'
                }`}
              >
                {p.label}
                {!loading && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.25rem] px-1.5 rounded-full text-xs tabular-nums ${
                      activa ? 'bg-terracota/10 text-terracota' : 'bg-neutro-light text-verde-suave'
                    }`}
                  >
                    {n}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {mensaje && (
          <div
            role="status"
            data-testid="eventos-mensaje"
            className="bg-verde/10 border border-verde/30 rounded-lg p-3 flex items-center gap-2 text-sm text-verde"
          >
            <span>{mensaje}</span>
            <button
              type="button"
              onClick={() => setMensaje(null)}
              className="ml-auto p-1 rounded hover:bg-verde/10"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            data-testid="eventos-error"
            className="bg-rojo-bg border border-rojo/30 rounded-lg p-3 flex items-center gap-2 text-sm text-rojo"
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchEventos()}
              className="ml-auto text-xs bg-rojo/10 px-2 py-1 rounded hover:bg-rojo/20"
            >
              Reintentar
            </button>
          </div>
        )}

        {catalogos.error && (
          <div className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-3 flex items-center gap-2 text-sm text-verde">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amarillo" aria-hidden="true" />
            <span>{catalogos.error}</span>
            <button
              type="button"
              onClick={catalogos.recargar}
              className="ml-auto text-xs bg-white border border-neutro-borde px-2 py-1 rounded hover:bg-neutro-light"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista */}
        <div className="bg-white rounded-lg border border-neutro-borde overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="eventos-lista">
              <thead>
                <tr className="bg-neutro-light border-b border-neutro-borde text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Fecha</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Horario</th>
                  {pestana === 'publicas' ? (
                    <>
                      <th scope="col" className="px-4 py-3 font-medium text-verde">Experiencia</th>
                      <th scope="col" className="px-4 py-3 font-medium text-verde text-center">Cupo</th>
                      <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                        Tickets
                      </th>
                    </>
                  ) : (
                    <>
                      <th scope="col" className="px-4 py-3 font-medium text-verde">Evento</th>
                      <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                        Personas
                      </th>
                    </>
                  )}
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Chinampa</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde">Guías</th>
                  <th scope="col" className="px-4 py-3 font-medium text-verde text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columnas} className="px-4 py-12">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-terracota" aria-hidden="true" />
                        <span className="ml-3 text-sm text-verde-suave">Cargando eventos...</span>
                      </div>
                    </td>
                  </tr>
                ) : lista.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnas}
                      className="px-4 py-12 text-center text-verde-suave"
                      data-testid="eventos-vacio"
                    >
                      <CalendarDays className="h-10 w-10 mx-auto text-neutro-gris mb-3" aria-hidden="true" />
                      <p className="font-medium">
                        {error
                          ? 'No se pudieron cargar los eventos.'
                          : pestana === 'publicas'
                            ? 'Sin fechas públicas este mes'
                            : 'Sin eventos internos este mes'}
                      </p>
                      {!error && pestana === 'internos' && (
                        <button
                          type="button"
                          onClick={() => setEditandoInterno(null)}
                          className="mt-3 text-sm text-terracota underline hover:text-terracota-dark"
                        >
                          Crear un evento interno
                        </button>
                      )}
                    </td>
                  </tr>
                ) : pestana === 'publicas' ? (
                  publicas.map((ev) => (
                    <FilaPublica
                      key={ev.id}
                      evento={ev}
                      onPlaneacion={() => setPlaneando(ev)}
                      onTickets={() => setTickets(ev)}
                    />
                  ))
                ) : (
                  internos.map((ev) => (
                    <FilaInterno
                      key={ev.id}
                      evento={ev}
                      onEditar={() => setEditandoInterno(ev)}
                      onBorrar={() => {
                        setErrorBorrar(null)
                        setPorBorrar(ev)
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {planeando && (
        <ModalPlaneacionPublica
          evento={planeando}
          catalogos={catalogos}
          onClose={() => setPlaneando(null)}
          onSaved={(actualizado) => {
            reemplazarEvento(actualizado)
            setPlaneando(null)
            setMensaje(
              `Planeación guardada: ${actualizado.experiencia_nombre ?? actualizado.nombre_evento}, ${fechaCorta(actualizado.fecha_evento)}.`,
            )
          }}
        />
      )}

      {tickets && (
        <ModalTickets
          evento={tickets}
          fuentes={catalogos.fuentes}
          onClose={() => setTickets(null)}
          onEventoActualizado={reemplazarEvento}
        />
      )}

      {editandoInterno !== undefined && (
        <ModalEventoInterno
          key={editandoInterno?.id ?? 'nuevo'}
          evento={editandoInterno}
          fechaSugerida={fechaSugerida}
          catalogos={catalogos}
          onClose={() => setEditandoInterno(undefined)}
          onSaved={handleInternoGuardado}
        />
      )}

      {porBorrar && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-32 pb-8 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !borrando) setPorBorrar(null)
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="eventos-borrar-titulo"
            aria-describedby="eventos-borrar-texto"
            data-testid="eventos-confirmar-borrar"
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="px-6 py-4 border-b border-neutro-borde flex items-center justify-between">
              <h2
                id="eventos-borrar-titulo"
                className="font-display text-xl text-verde flex items-center gap-2"
              >
                <AlertTriangle className="h-5 w-5 text-rojo" aria-hidden="true" />
                Borrar «{porBorrar.nombre_evento}»
              </h2>
              <button
                type="button"
                onClick={() => setPorBorrar(null)}
                disabled={borrando}
                aria-label="Cerrar confirmación"
                className="p-2 hover:bg-neutro-light rounded-lg"
              >
                <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p id="eventos-borrar-texto" className="text-sm text-verde">
                Evento interno del {formatFechaMexico(porBorrar.fecha_evento, { weekday: 'long' })},{' '}
                {horario(porBorrar.hora_inicio, porBorrar.hora_fin)}. Se borra con sus guías
                asignados; no se puede deshacer.
              </p>
              {errorBorrar && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{errorBorrar}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutro-borde">
              <button
                type="button"
                onClick={() => setPorBorrar(null)}
                disabled={borrando}
                className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBorrar}
                disabled={borrando}
                data-testid="eventos-confirmar-borrar-si"
                className="inline-flex items-center gap-2 bg-rojo hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {borrando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilaPublica({
  evento,
  onPlaneacion,
  onTickets,
}: {
  evento: EventoPlaneacion
  onPlaneacion: () => void
  onTickets: () => void
}) {
  const tope = !sinTope(evento.capacidad_maxima)
  const disponibles = tope ? Math.max(0, (evento.capacidad_maxima ?? 0) - evento.capacidad_ocupada) : null
  const nombre = evento.experiencia_nombre ?? evento.nombre_evento
  return (
    <tr data-testid={`evento-fila-${evento.id}`} className="border-b border-neutro-borde hover:bg-neutro-light/50">
      <td className="px-4 py-3 text-verde whitespace-nowrap">{fechaCorta(evento.fecha_evento)}</td>
      <td className="px-4 py-3 text-verde whitespace-nowrap tabular-nums">
        {horario(evento.hora_inicio, evento.hora_fin)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-verde">{nombre}</span>
          {!evento.visible_publico && (
            <span
              className="inline-flex items-center gap-1 rounded-full text-xs px-2 py-0.5 bg-neutro-borde text-verde-suave"
              title="No se ve en la página: no se vende en línea"
              data-testid="evento-chip-oculta"
            >
              <EyeOff className="h-3 w-3" aria-hidden="true" />
              Oculta
            </span>
          )}
          {evento.estado !== 'activo' && (
            <span className="inline-block rounded-full text-xs px-2 py-0.5 bg-amarillo-bg text-verde">
              {evento.estado}
            </span>
          )}
        </div>
        {(evento.cocina_nombre || evento.idioma) && (
          <div className="text-xs text-verde-suave mt-0.5">
            {[evento.cocina_nombre, evento.idioma ? etiquetaIdioma(evento.idioma) : null]
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <span className="tabular-nums text-verde font-medium">
          {evento.capacidad_ocupada} / {tope ? evento.capacidad_maxima : 'sin tope'}
        </span>
        {disponibles !== null && (
          <div
            className={`text-xs tabular-nums ${disponibles === 0 ? 'text-rojo' : 'text-verde-suave'}`}
          >
            {disponibles === 0 ? 'Lleno' : `${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'}`}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center whitespace-nowrap text-verde tabular-nums">
        {evento.tickets_registrados} registrados · {evento.tickets_web} web
      </td>
      <td className="px-4 py-3 text-verde">{evento.chinampa ?? <span className="text-verde-suave">—</span>}</td>
      <td className="px-4 py-3 text-verde max-w-[220px]">
        <Guias evento={evento} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={onPlaneacion}
            aria-label={`Planeación de ${nombre}, ${fechaCorta(evento.fecha_evento)}`}
            data-testid={`evento-planeacion-${evento.id}`}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-verde hover:bg-verde/10 rounded-lg"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Planeación
          </button>
          <button
            type="button"
            onClick={onTickets}
            aria-label={`Tickets de ${nombre}, ${fechaCorta(evento.fecha_evento)}`}
            data-testid={`evento-tickets-${evento.id}`}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-terracota hover:bg-terracota/10 rounded-lg"
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            Tickets
          </button>
        </div>
      </td>
    </tr>
  )
}

function FilaInterno({
  evento,
  onEditar,
  onBorrar,
}: {
  evento: EventoPlaneacion
  onEditar: () => void
  onBorrar: () => void
}) {
  return (
    <tr data-testid={`evento-fila-${evento.id}`} className="border-b border-neutro-borde hover:bg-neutro-light/50">
      <td className="px-4 py-3 text-verde whitespace-nowrap">{fechaCorta(evento.fecha_evento)}</td>
      <td className="px-4 py-3 text-verde whitespace-nowrap tabular-nums">
        {horario(evento.hora_inicio, evento.hora_fin)}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-verde">{evento.nombre_evento}</div>
        {evento.descripcion && (
          <div className="text-xs text-verde-suave mt-0.5 max-w-md truncate" title={evento.descripcion}>
            {evento.descripcion}
          </div>
        )}
        {(evento.cocina_nombre || evento.idioma) && (
          <div className="text-xs text-verde-suave mt-0.5">
            {[evento.cocina_nombre, evento.idioma ? etiquetaIdioma(evento.idioma) : null]
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center tabular-nums text-verde">
        {evento.personas ?? <span className="text-verde-suave">—</span>}
      </td>
      <td className="px-4 py-3 text-verde">{evento.chinampa ?? <span className="text-verde-suave">—</span>}</td>
      <td className="px-4 py-3 text-verde max-w-[220px]">
        <Guias evento={evento} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={onEditar}
            aria-label={`Editar ${evento.nombre_evento}, ${fechaCorta(evento.fecha_evento)}`}
            className="p-2 text-verde hover:bg-verde/10 rounded-lg"
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onBorrar}
            aria-label={`Borrar ${evento.nombre_evento}, ${fechaCorta(evento.fecha_evento)}`}
            className="p-2 text-rojo hover:bg-rojo/10 rounded-lg"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  )
}
