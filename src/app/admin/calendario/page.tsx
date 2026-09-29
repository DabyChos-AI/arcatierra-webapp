'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Edit2, Eye, Loader2, Plus } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { EventoPlaneacion, ListaEventos } from '@/types/planeacion'
import { hoyMexico, horaCorta, sinTope, sumarDias } from '../eventos/components/fechas'
import ModalEventoInterno from '../eventos/components/ModalEventoInterno'
import ModalPlaneacionPublica from '../eventos/components/ModalPlaneacionPublica'
import ModalTickets from '../eventos/components/ModalTickets'
import { useCatalogosEventos } from '../eventos/components/useCatalogosEventos'
import ModalVerEvento from './components/ModalVerEvento'

// PS1 (29-sep): el calendario del panel lee GET /api/admin/planeacion/eventos (permiso
// `planeacion`: guías, cocina, admin). Antes leía el endpoint PÚBLICO, que ya no trae los
// internos, las fechas ocultas ni las notas.
//
// CAL1 (29-sep): «Ver», «Editar» y «Nuevo evento» eran alert() (Editar decía «Cambios
// aplicados» sin guardar nada, y «Nuevo evento» tenía un modo «simulado» que no creaba nada).
// El formulario viejo además mandaba visible_publico=true: una reunión interna habría salido
// en el calendario público. Ahora:
//   - Ver → ficha real de solo lectura (ModalVerEvento).
//   - Editar → los modales de /admin/eventos: planeación de una fecha pública o el evento
//     interno completo. Solo para quien tiene `reservas` (o es super_admin): es lo que pide
//     la API de eventos; guías y cocina solo ven.
//   - Nuevo evento → evento INTERNO (nunca visible en la web). Las fechas públicas se abren
//     en Experiencias.
type EventoCalendario = EventoPlaneacion

const DIAS_CALENDARIO = 90

// Clases completas (Tailwind no genera las armadas en caliente, como `bg-${color}-50`).
const ESTILO: Record<EventoPlaneacion['tipo'], { tarjeta: string; icono: string; texto: string; punto: string }> = {
  publica: {
    tarjeta: 'bg-green-50 border-green-200',
    icono: 'bg-green-100 text-green-700',
    texto: 'text-green-700',
    punto: 'bg-green-600',
  },
  interno: {
    tarjeta: 'bg-purple-50 border-purple-200',
    icono: 'bg-purple-100 text-purple-700',
    texto: 'text-purple-700',
    punto: 'bg-purple-600',
  },
  otro: {
    tarjeta: 'bg-gray-50 border-gray-200',
    icono: 'bg-gray-100 text-gray-600',
    texto: 'text-gray-600',
    punto: 'bg-gray-500',
  },
}

// Públicas: lugares ocupados. Internos: las personas que van.
function participantes(evento: EventoCalendario): number {
  return evento.tipo === 'interno' ? evento.personas ?? 0 : evento.capacidad_ocupada || 0
}

function textoParticipantes(evento: EventoCalendario): string {
  if (evento.tipo === 'interno') {
    return evento.personas != null ? `${evento.personas} personas` : 'Personas sin definir'
  }
  const capacidad = sinTope(evento.capacidad_maxima) ? 'sin tope' : evento.capacidad_maxima
  return `${evento.capacidad_ocupada}/${capacidad} participantes`
}

function textoTipo(evento: EventoCalendario): string {
  if (evento.tipo === 'publica') return 'Fecha pública'
  if (evento.tipo === 'interno') return 'Interno'
  return evento.tipo_evento
}

function tituloDe(evento: EventoCalendario): string {
  return evento.tipo === 'publica' ? evento.experiencia_nombre || evento.nombre_evento : evento.nombre_evento
}

export default function CalendarioPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // Editar pide el permiso `reservas` (o super_admin). El layout no comparte los permisos:
  // se pide el mismo endpoint que usa él (mismo patrón que /admin/planeacion).
  const [puedeEditar, setPuedeEditar] = useState(false)
  useEffect(() => {
    let cancelado = false
    fetch('/api/admin/roles/mis-roles')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { permisos_activos?: unknown; rol_activo?: { nombre?: unknown } | null } | null) => {
        if (cancelado || !data) return
        const permisos = Array.isArray(data.permisos_activos) ? data.permisos_activos : []
        setPuedeEditar(permisos.includes('reservas') || data.rol_activo?.nombre === 'super_admin')
      })
      .catch(() => {
        /* sin permisos a la vista, el calendario queda de solo lectura */
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Los catálogos (chinampas, cocinas, guías, fuentes) solo se piden si se puede editar:
  // a una guía le responderían 403.
  const catalogos = useCatalogosEventos(puedeEditar ? token : undefined)

  const [viendo, setViendo] = useState<EventoCalendario | null>(null)
  const [planeando, setPlaneando] = useState<EventoCalendario | null>(null)
  const [tickets, setTickets] = useState<EventoCalendario | null>(null)
  // undefined = cerrado · null = crear · evento = editar
  const [editandoInterno, setEditandoInterno] = useState<EventoCalendario | null | undefined>(undefined)

  // Hoy y los próximos 90 días. Sin eventos simulados de respaldo: con el calendario en manos
  // de guías y cocina, un evento inventado se leería como real.
  const fetchEventos = useCallback(
    async (silencioso = false) => {
      if (!token) return
      try {
        if (!silencioso) setLoading(true)
        setError(null)
        const hoy = hoyMexico()
        const params = new URLSearchParams({ desde: hoy, hasta: sumarDias(hoy, DIAS_CALENDARIO) })
        const response = await fetch(`${API_URL}/api/admin/planeacion/eventos?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, response.status))
        }
        const data = (await response.json()) as ListaEventos
        setEventos(data.items ?? [])
      } catch (err) {
        if (!silencioso) setEventos([])
        setError(`No se pudieron cargar los eventos: ${err instanceof Error ? err.message : 'sin conexión'}`)
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    fetchEventos()
  }, [fetchEventos])

  // Tras guardar en un modal, se reemplaza la tarjeta y se relee la lista en silencio
  // (una fecha pudo moverse fuera del rango de 90 días).
  const reemplazar = (actualizado: EventoPlaneacion) => {
    setEventos((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)))
    fetchEventos(true)
  }

  const editar = (evento: EventoCalendario) => {
    setViendo(null)
    if (evento.tipo === 'publica') setPlaneando(evento)
    else if (evento.tipo === 'interno') setEditandoInterno(evento)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 text-purple-600 mr-3" aria-hidden="true" />
            Calendario de Eventos
          </h1>
          <p className="text-gray-600 mt-1">
            Fechas públicas y eventos internos de hoy a {DIAS_CALENDARIO} días
          </p>
          {error && (
            <p className="text-orange-600 text-sm mt-1" role="alert">
              {error}{' '}
              <button type="button" onClick={() => fetchEventos()} className="underline hover:no-underline">
                Reintentar
              </button>
            </p>
          )}
          {mensaje && (
            <p className="text-green-700 text-sm mt-1" role="status" data-testid="calendario-mensaje">
              {mensaje}
            </p>
          )}
        </div>
        {puedeEditar && (
          <button
            type="button"
            onClick={() => setEditandoInterno(null)}
            disabled={loading}
            data-testid="calendario-nuevo-interno"
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Nuevo evento interno</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Próximos eventos {!loading && `(${eventos.length})`}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" aria-hidden="true" />
                <span className="ml-2 text-gray-600">Cargando eventos…</span>
              </div>
            ) : eventos.length > 0 ? (
              <div className="space-y-4" data-testid="calendario-lista">
                {eventos.map((evento) => {
                  // fecha_evento es YYYY-MM-DD: se compara como texto (new Date() la corre un día)
                  const hoy = hoyMexico()
                  let fechaTexto = formatFechaMexico(evento.fecha_evento)
                  if (evento.fecha_evento === hoy) fechaTexto = 'Hoy'
                  else if (evento.fecha_evento === sumarDias(hoy, 1)) fechaTexto = 'Mañana'
                  const estilo = ESTILO[evento.tipo] ?? ESTILO.otro
                  const editable = puedeEditar && (evento.tipo === 'publica' || evento.tipo === 'interno')

                  return (
                    <div
                      key={evento.id}
                      data-testid={`calendario-evento-${evento.id}`}
                      className={`flex items-center justify-between gap-3 p-4 border rounded-lg ${estilo.tarjeta}`}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`p-2 rounded-lg ${estilo.icono}`}>
                          <Calendar className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-0">{tituloDe(evento)}</h3>
                          <p className="text-sm text-gray-600">
                            {fechaTexto}, {horaCorta(evento.hora_inicio)} · {evento.chinampa || 'Chinampa sin asignar'}
                          </p>
                          <p className={`text-xs ${estilo.texto}`}>
                            {textoParticipantes(evento)} · {textoTipo(evento)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setViendo(evento)}
                          aria-label={`Ver ${tituloDe(evento)}`}
                          data-testid={`calendario-ver-${evento.id}`}
                          className={`p-2 rounded-lg hover:bg-white/70 ${estilo.texto}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {editable && (
                          <button
                            type="button"
                            onClick={() => editar(evento)}
                            aria-label={`Editar ${tituloDe(evento)}`}
                            data-testid={`calendario-editar-${evento.id}`}
                            className={`p-2 rounded-lg hover:bg-white/70 ${estilo.texto}`}
                          >
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" aria-hidden="true" />
                <p>No hay eventos en los próximos {DIAS_CALENDARIO} días</p>
                {puedeEditar && <p className="text-sm">Usa «Nuevo evento interno» para agregar uno.</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Eventos (próximos {DIAS_CALENDARIO} días)</span>
                <span className="font-semibold text-gray-900">{eventos.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Participantes total</span>
                <span className="font-semibold text-gray-900">
                  {eventos.reduce((sum, e) => sum + participantes(e), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Eventos activos</span>
                <span className="font-semibold text-green-600">
                  {eventos.filter((e) => e.estado === 'activo').length}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Tipos de eventos</h3>
              <div className="space-y-2" data-testid="calendario-tipos">
                {(
                  [
                    ['publica', 'Fechas públicas'],
                    ['interno', 'Internos'],
                    ['otro', 'Otros'],
                  ] as const
                ).map(([tipo, etiqueta]) => (
                  <div key={tipo} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${ESTILO[tipo].punto}`} aria-hidden="true" />
                      {etiqueta}
                    </span>
                    <span className="text-sm font-medium">{eventos.filter((e) => e.tipo === tipo).length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {viendo && (
        <ModalVerEvento
          evento={viendo}
          puedeEditar={puedeEditar}
          onClose={() => setViendo(null)}
          onEditar={() => editar(viendo)}
          onTickets={() => {
            setTickets(viendo)
            setViendo(null)
          }}
        />
      )}

      {planeando && (
        <ModalPlaneacionPublica
          evento={planeando}
          catalogos={catalogos}
          onClose={() => setPlaneando(null)}
          onSaved={(actualizado) => {
            reemplazar(actualizado)
            setPlaneando(null)
            setMensaje(`Planeación guardada: ${tituloDe(actualizado)}.`)
          }}
        />
      )}

      {tickets && (
        <ModalTickets
          evento={tickets}
          fuentes={catalogos.fuentes}
          onClose={() => setTickets(null)}
          onEventoActualizado={reemplazar}
        />
      )}

      {editandoInterno !== undefined && (
        <ModalEventoInterno
          key={editandoInterno?.id ?? 'nuevo'}
          evento={editandoInterno}
          fechaSugerida={hoyMexico()}
          catalogos={catalogos}
          onClose={() => setEditandoInterno(undefined)}
          onSaved={(guardado, creado) => {
            setEditandoInterno(undefined)
            if (creado) {
              setMensaje(`Evento interno creado: ${guardado.nombre_evento}.`)
              fetchEventos(true)
            } else {
              reemplazar(guardado)
              setMensaje(`Evento guardado: ${guardado.nombre_evento}.`)
            }
          }}
        />
      )}
    </div>
  )
}
