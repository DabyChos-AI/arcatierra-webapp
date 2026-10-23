'use client'

// Detalle de un mensaje de /contacto (WF11, R11b). Se pide por id (así abre también desde la campana con
// `?mensaje_id=`). El estado se cambia a mano con el select (PATCH en el momento, candado contra doble cambio); abrir el
// detalle NO lo marca como leído. «Responder por correo» abre el correo del equipo con el asunto (no se manda nada desde
// aquí). Errores de la acción dentro del modal (role="alert"); el modal no se cierra.

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Mail, AlertTriangle } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { ErrorPanel, pedirAlPanel } from '@/lib/fetchPanel'
import { aviso } from '@/components/ui/Avisos'
import { ETIQUETA_ESTADO_MENSAJE, type CambiarEstadoMensaje, type EstadoMensaje, type MensajeContacto } from '@/types/mensajes'
import { CLASE_ESTADO_MENSAJE, ESTADOS_MENSAJE, esEstadoMensaje, fechaHora, ligaResponder, normalizarMensaje } from './mensajes'

interface Props {
  mensajeId: string
  token: string
  onCerrar: () => void
  onActualizado: (m: MensajeContacto) => void
}

function mensajeDe(e: unknown, porDefecto: string): string {
  return e instanceof ErrorPanel ? e.mensaje : porDefecto
}

export default function ModalMensaje({ mensajeId, token, onCerrar, onActualizado }: Props) {
  const [mensaje, setMensaje] = useState<MensajeContacto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const guardandoRef = useRef(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const cuerpo = await pedirAlPanel<unknown>(`${API_URL}/api/admin/mensajes/${encodeURIComponent(mensajeId)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      const m = normalizarMensaje(cuerpo)
      if (!m) setErrorCarga('La respuesta del servidor no se pudo leer. Intenta de nuevo.')
      setMensaje(m)
    } catch (e) {
      setErrorCarga(
        e instanceof ErrorPanel && (e.codigo === 404 || e.codigo === 422 || e.codigo === 400)
          ? 'No encontramos ese mensaje.'
          : mensajeDe(e, 'No se pudo cargar el mensaje.'),
      )
    } finally {
      setCargando(false)
    }
  }, [mensajeId, token])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  async function cambiarEstado(estado: EstadoMensaje) {
    if (!mensaje || estado === mensaje.estado || guardandoRef.current) return
    guardandoRef.current = true
    setGuardando(true)
    setErrorAccion(null)
    try {
      const body: CambiarEstadoMensaje = { estado }
      const cuerpo = await pedirAlPanel<unknown>(`${API_URL}/api/admin/mensajes/${encodeURIComponent(mensaje.id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const m = normalizarMensaje(cuerpo) ?? { ...mensaje, estado }
      setMensaje(m)
      onActualizado(m)
      aviso.exito(`Estado: ${ETIQUETA_ESTADO_MENSAJE[m.estado]}.`)
    } catch (e) {
      setErrorAccion(mensajeDe(e, 'No se pudo cambiar el estado.'))
    } finally {
      guardandoRef.current = false
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-3 pt-10 sm:pt-16"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && e.detail <= 1) onCerrar()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mensaje-detalle-titulo"
        data-testid="mensaje-detalle"
        className="flex max-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutro-borde px-4 py-3">
          <h2 id="mensaje-detalle-titulo" className="mb-0 font-display text-xl text-verde">
            Mensaje de contacto
          </h2>
          <button
            type="button"
            data-testid="mensaje-detalle-cerrar"
            aria-label="Cerrar"
            onClick={onCerrar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-verde hover:bg-neutro-light"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {cargando && !mensaje && <p className="text-sm text-verde-suave">Cargando…</p>}
          {errorCarga && (
            <div role="alert" className="rounded-lg border border-rojo/30 bg-rojo-bg p-3 text-sm text-rojo">
              <p>{errorCarga}</p>
              <button
                type="button"
                onClick={() => void cargar()}
                className="mt-2 rounded-lg bg-terracota px-3 py-1.5 text-sm font-semibold text-white hover:bg-terracota-dark"
              >
                Reintentar
              </button>
            </div>
          )}
          {mensaje && (
            <>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto,1fr]">
                <dt className="text-verde-suave">De</dt>
                <dd className="break-words font-medium text-verde">{mensaje.nombre}</dd>
                <dt className="text-verde-suave">Correo</dt>
                <dd className="break-all text-verde-tipografia">{mensaje.email}</dd>
                <dt className="text-verde-suave">Asunto</dt>
                <dd className="break-words text-verde-tipografia">{mensaje.asunto ?? '(sin asunto)'}</dd>
                <dt className="text-verde-suave">Recibido</dt>
                <dd className="text-verde-tipografia">{fechaHora(mensaje.creado_en)}</dd>
              </dl>

              <div className="whitespace-pre-wrap break-words rounded-lg border border-neutro-borde bg-neutro-light p-3 text-sm text-verde-tipografia">
                {mensaje.mensaje}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="mensaje-estado" className="block text-xs text-verde-suave">
                    Estado
                  </label>
                  <select
                    id="mensaje-estado"
                    data-testid="mensaje-estado"
                    value={mensaje.estado}
                    disabled={guardando}
                    onChange={(e) => {
                      if (esEstadoMensaje(e.target.value)) void cambiarEstado(e.target.value)
                    }}
                    className="mt-1 min-h-[44px] rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde disabled:opacity-60"
                  >
                    {ESTADOS_MENSAJE.map((e) => (
                      <option key={e} value={e}>
                        {ETIQUETA_ESTADO_MENSAJE[e]}
                      </option>
                    ))}
                  </select>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CLASE_ESTADO_MENSAJE[mensaje.estado]}`}>
                  {guardando ? 'Guardando…' : ETIQUETA_ESTADO_MENSAJE[mensaje.estado]}
                </span>
                <a
                  href={ligaResponder(mensaje)}
                  data-testid="mensaje-responder"
                  className="ml-auto inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-verde px-4 text-sm font-semibold text-white hover:bg-verde-claro hover:text-white"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Responder por correo
                </a>
              </div>
              {mensaje.atendido_en && (
                <p className="text-xs text-verde-suave">
                  Último cambio: {fechaHora(mensaje.atendido_en)}
                  {mensaje.atendido_por_nombre ? ` · ${mensaje.atendido_por_nombre}` : ''}
                </p>
              )}
              {errorAccion && (
                <p
                  data-testid="mensaje-detalle-error"
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg p-3 text-sm text-rojo"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {errorAccion}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
