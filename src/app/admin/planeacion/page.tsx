'use client'

// Planeación semanal. PS1 (sesión 35): la Junta de lunes a domingo. R4 (sesión 44): la grilla editable.
// Lee GET /api/admin/planeacion/grilla (SemanaGrilla). Quien tiene `reservas` (puede_editar) edita en la
// tarjeta con los MISMOS PATCH que el detalle (con `version`: 409 si alguien lo cambió), agrega eventos
// internos y abre la reserva; los montos se VEN solo con `reportes` y se capturan en el detalle (DR14).
// Guías y cocina ven la misma grilla sin lápices, sin notas crudas, sin huecos y sin montos.

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Ticket,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { descargar } from '@/lib/descargas'
import { volverAlLoginDelPanel } from '@/lib/fetchPanel'
import type { SemanaGrilla } from '@/types/planeacion'
import AdminTopbar from '../components/AdminTopbar'
import ModalEventoInterno from '../eventos/components/ModalEventoInterno'
import { useCatalogosEventos } from '../eventos/components/useCatalogosEventos'
import { extraerMensajeError } from '../reservas/components/errores'
import GrillaSemana from './components/GrillaSemana'
import { SOLO_FECHA, hoyMexico, lunesDe, sumarDias } from './components/fechas'

const TIEMPO_MAXIMO = 30_000
const AVISO_MS = 4_000

/** Error con un mensaje ya listo para mostrarse (el `detail` del backend). */
class ErrorLegible extends Error {}

/** Traduce cualquier fallo de fetch a un mensaje en español; nunca «Failed to fetch». */
function mensajeDeFallo(e: unknown): string {
  if (e instanceof ErrorLegible) return e.message
  const nombre = e instanceof Error ? e.name : ''
  return nombre === 'TimeoutError' || nombre === 'AbortError'
    ? 'El servidor tardó más de 30 segundos en responder. Reintenta.'
    : 'Sin conexión con el servidor. Revisa tu internet y reintenta.'
}

async function lanzarSiFallo(res: Response): Promise<void> {
  if (res.ok) return
  if (res.status === 401) {
    volverAlLoginDelPanel()
    throw new ErrorLegible('Tu sesión expiró. Vuelve a iniciar sesión para continuar.')
  }
  const cuerpo = await res.json().catch(() => ({}))
  throw new ErrorLegible(extraerMensajeError(cuerpo, res.status))
}

export default function PlaneacionPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [hoy] = useState(hoyMexico)
  // Cualquier día: el backend responde la semana (lunes a domingo) que lo contiene
  const [fecha, setFecha] = useState(hoy)
  const [semana, setSemana] = useState<SemanaGrilla | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const [descargando, setDescargando] = useState<'junta' | 'completa' | null>(null)
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null)

  const [soloHuecos, setSoloHuecos] = useState(false)
  const [internoFecha, setInternoFecha] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; n: number } | null>(null)

  // La última petición manda: una semana vieja (o una recarga superada) nunca pisa a la nueva
  const ultimaPeticion = useRef(0)
  const fechaActual = useRef(fecha)
  useEffect(() => {
    fechaActual.current = fecha
  }, [fecha])

  const puedeEditar = !!semana?.puede_editar
  // Catálogos (chinampas, cocinas, fuentes, guías) solo para quien edita
  const catalogos = useCatalogosEventos(puedeEditar ? token : undefined)

  const pedirSemana = useCallback(
    async (dia: string): Promise<SemanaGrilla> => {
      const res = await fetch(
        `${API_URL}/api/admin/planeacion/grilla?fecha=${encodeURIComponent(dia)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(TIEMPO_MAXIMO),
        },
      )
      await lanzarSiFallo(res)
      const data = (await res.json()) as SemanaGrilla | null
      if (!data || !Array.isArray(data.dias) || !data.totales) {
        throw new ErrorLegible('El servidor respondió algo inesperado. Reintenta.')
      }
      return data
    },
    [token],
  )

  useEffect(() => {
    if (!token) return
    const n = ++ultimaPeticion.current
    // Refetch silencioso: la semana anterior se queda en pantalla mientras llega la nueva
    setCargando(true)
    setError(null)
    pedirSemana(fecha)
      .then((data) => {
        if (n === ultimaPeticion.current) setSemana(data)
      })
      .catch((e: unknown) => {
        if (n === ultimaPeticion.current) setError(mensajeDeFallo(e))
      })
      .finally(() => {
        if (n === ultimaPeticion.current) setCargando(false)
      })
  }, [token, fecha, intento, pedirSemana])

  /**
   * Relee la semana EN SILENCIO tras guardar (o tras un 409): no desmonta la grilla (el guard de
   * «Cargando la semana…» es `cargando && !semana`) ni la atenúa, así que el scroll y los editores
   * abiertos se quedan. Devuelve lo nuevo para que el editor de un 409 tome el valor y la versión vigentes.
   */
  const recargar = useCallback(async (): Promise<SemanaGrilla | null> => {
    if (!token) return null
    const n = ++ultimaPeticion.current
    try {
      const data = await pedirSemana(fechaActual.current)
      if (n === ultimaPeticion.current) {
        setSemana(data)
        setError(null)
      }
      return data
    } catch (e) {
      if (n === ultimaPeticion.current) setError(mensajeDeFallo(e))
      return null
    } finally {
      if (n === ultimaPeticion.current) setCargando(false)
    }
  }, [token, pedirSemana])

  const avisar = useCallback((texto: string) => {
    setAviso((prev) => ({ texto, n: (prev?.n ?? 0) + 1 }))
  }, [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), AVISO_MS)
    return () => clearTimeout(t)
  }, [aviso])

  const irA = (nueva: string) => {
    setErrorDescarga(null)
    setFecha(nueva)
  }

  const descargarJunta = useCallback(async () => {
    if (!token || !semana) return
    setDescargando('junta')
    setErrorDescarga(null)
    try {
      const res = await fetch(
        `${API_URL}/api/admin/planeacion/junta-turismo?fecha=${encodeURIComponent(semana.lunes)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(TIEMPO_MAXIMO),
        },
      )
      await lanzarSiFallo(res)
      await descargar(res, `junta-turismo-${semana.lunes}.xlsx`)
    } catch (e) {
      setErrorDescarga(mensajeDeFallo(e))
    } finally {
      setDescargando(null)
    }
  }, [token, semana])

  const descargarCompleta = useCallback(async () => {
    if (!token || !semana) return
    setDescargando('completa')
    setErrorDescarga(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/reportes/planeacion_semanal/exportar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ formato: 'xlsx', filtros: { semana: semana.lunes } }),
        signal: AbortSignal.timeout(TIEMPO_MAXIMO),
      })
      await lanzarSiFallo(res)
      await descargar(res, `planeacion-semanal-${semana.lunes}.xlsx`)
    } catch (e) {
      setErrorDescarga(mensajeDeFallo(e))
    } finally {
      setDescargando(null)
    }
  }, [token, semana])

  const lunes = lunesDe(fecha)
  const semanaVacia = !!semana && semana.dias.every((d) => d.items.length === 0)
  const conHuecosTotal = semana?.totales.con_huecos ?? 0
  const botonNav =
    'inline-flex items-center gap-1 rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm text-verde transition hover:bg-neutro-light'

  return (
    <div className="flex h-full flex-col">
      <AdminTopbar />

      <div className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:px-0">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-terracota/10 p-2">
              <CalendarRange className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-verde">Planeación semanal</h1>
              <p className="mt-1 text-sm text-verde-suave">
                Experiencias privadas, fechas públicas y eventos internos de lunes a domingo.
              </p>
            </div>
          </div>
          {puedeEditar && (
            <Link
              href="/admin/eventos"
              className="inline-flex items-center gap-2 text-sm text-terracota underline hover:text-terracota-dark"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Registrar tickets y eventos internos
            </Link>
          )}
        </header>

        {/* Navegación de semanas */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-neutro-borde bg-neutro-light px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="planeacion-anterior"
              onClick={() => irA(sumarDias(lunes, -7))}
              aria-label="Semana anterior"
              className={botonNav}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              data-testid="planeacion-hoy"
              onClick={() => irA(hoyMexico())}
              className={botonNav}
            >
              Esta semana
            </button>
            <button
              type="button"
              data-testid="planeacion-siguiente"
              onClick={() => irA(sumarDias(lunes, 7))}
              aria-label="Semana siguiente"
              className={botonNav}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="planeacion-fecha"
              className="text-xs font-semibold uppercase tracking-wide text-verde-suave"
            >
              Ir a la semana del día
            </label>
            <input
              id="planeacion-fecha"
              data-testid="planeacion-fecha"
              type="date"
              value={fecha}
              onChange={(e) => {
                if (SOLO_FECHA.test(e.target.value)) irA(e.target.value)
              }}
              className="rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm"
            />
          </div>
          {cargando && semana && (
            <span className="inline-flex items-center gap-1 pb-2 text-xs text-verde-suave">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Cargando…
            </span>
          )}
        </div>

        {cargando && !semana ? (
          <div className="flex items-center justify-center gap-2 py-16 text-verde-suave">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Cargando la semana…
          </div>
        ) : !semana ? (
          <div
            data-testid="planeacion-error"
            className="flex flex-col items-center gap-3 rounded-xl border border-rojo/30 bg-rojo-bg px-4 py-10"
          >
            <p className="text-center text-sm text-rojo">
              No se pudo cargar la planeación: {error ?? 'error desconocido'}
            </p>
            <button
              type="button"
              onClick={() => setIntento((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutro-borde bg-white px-3 py-2 text-xs font-semibold text-verde-tipografia transition hover:bg-neutro-light"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : (
          <section className="space-y-4" aria-labelledby="planeacion-rango">
            {error && (
              <div
                data-testid="planeacion-error"
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rojo/30 bg-rojo-bg px-4 py-3 text-sm text-rojo"
              >
                <span>
                  No se pudo cargar la semana pedida: {error}. Se sigue mostrando la anterior.
                </span>
                <button
                  type="button"
                  onClick={() => setIntento((n) => n + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutro-borde bg-white px-3 py-1.5 text-xs font-semibold text-verde-tipografia transition hover:bg-neutro-light"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reintentar
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="planeacion-rango"
                  data-testid="planeacion-semana"
                  data-lunes={semana.lunes}
                  data-domingo={semana.domingo}
                  className="m-0 font-heading text-lg font-bold text-verde"
                >
                  Semana del {formatFechaMexico(semana.lunes)} al{' '}
                  {formatFechaMexico(semana.domingo)}
                </h2>
                <p data-testid="planeacion-totales" className="mt-1 text-sm text-verde-suave">
                  <strong className="text-verde">{semana.totales.eventos}</strong>{' '}
                  {semana.totales.eventos === 1 ? 'evento' : 'eventos'} ·{' '}
                  <strong className="text-verde">{semana.totales.pax}</strong> personas ·{' '}
                  <strong className="text-verde">{semana.totales.ninos}</strong> niños ·{' '}
                  <strong className="text-verde">{semana.totales.staff}</strong> staff
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="planeacion-descargar-junta"
                  onClick={descargarJunta}
                  disabled={descargando !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white transition hover:bg-verde-claro disabled:opacity-60"
                >
                  {descargando === 'junta' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  Descargar Junta Turismo
                </button>
                {semana.puede_ver_completa && (
                  <button
                    type="button"
                    data-testid="planeacion-descargar-completa"
                    onClick={descargarCompleta}
                    disabled={descargando !== null}
                    className="inline-flex items-center gap-2 rounded-lg bg-terracota px-4 py-2 text-sm font-semibold text-white transition hover:bg-terracota-dark disabled:opacity-60"
                  >
                    {descargando === 'completa' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                    )}
                    Descargar planeación completa
                  </button>
                )}
              </div>
            </div>

            {/* HUE1 en la grilla: solo quien edita ve los huecos */}
            {puedeEditar && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={soloHuecos}
                  data-testid="planeacion-solo-huecos"
                  data-con-huecos={conHuecosTotal}
                  onClick={() => setSoloHuecos((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    soloHuecos
                      ? 'border-terracota bg-terracota text-white'
                      : 'border-neutro-borde bg-white text-verde hover:bg-neutro-light'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`relative inline-block h-4 w-7 rounded-full transition ${
                      soloHuecos ? 'bg-white/40' : 'bg-neutro-borde'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
                        soloHuecos ? 'left-3.5' : 'left-0.5'
                      }`}
                    />
                  </span>
                  Solo privadas con huecos
                  <span
                    className={`rounded-full px-2 py-px text-xs font-semibold tabular-nums ${
                      soloHuecos ? 'bg-white text-terracota-dark' : 'bg-amarillo-bg text-verde-tipografia'
                    }`}
                  >
                    {conHuecosTotal}
                  </span>
                </button>
                {soloHuecos && conHuecosTotal === 0 && (
                  <span data-testid="planeacion-sin-huecos" className="text-sm text-verde-suave">
                    Ninguna privada de esta semana tiene datos pendientes.
                  </span>
                )}
              </div>
            )}

            {errorDescarga && (
              <p
                data-testid="planeacion-descarga-error"
                className="rounded-lg border border-rojo/30 bg-rojo-bg px-4 py-2 text-sm text-rojo"
              >
                No se pudo descargar: {errorDescarga}
              </p>
            )}

            {semanaVacia && (
              <p
                data-testid="planeacion-vacia"
                className="rounded-lg border border-neutro-borde bg-neutro-light px-4 py-3 text-sm text-verde-suave"
              >
                No hay experiencias ni eventos esta semana.
              </p>
            )}

            <div className={cargando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <GrillaSemana
                dias={semana.dias}
                hoy={hoy}
                puedeEditar={puedeEditar}
                soloHuecos={puedeEditar && soloHuecos}
                token={token}
                catalogos={catalogos}
                recargar={recargar}
                onGuardado={avisar}
                onAgregarInterno={setInternoFecha}
              />
            </div>
          </section>
        )}
      </div>

      {aviso && (
        <div
          key={aviso.n}
          role="status"
          data-testid="planeacion-guardado"
          className="fixed bottom-4 left-4 right-4 z-[650] flex items-center gap-2 rounded-lg bg-verde px-4 py-3 text-sm text-white shadow-lg sm:left-auto sm:max-w-sm"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{aviso.texto}</span>
        </div>
      )}

      {internoFecha && puedeEditar && (
        <ModalEventoInterno
          evento={null}
          fechaSugerida={internoFecha}
          catalogos={catalogos}
          onClose={() => setInternoFecha(null)}
          onSaved={(guardado) => {
            setInternoFecha(null)
            avisar(`Evento interno «${guardado.nombre_evento}» agregado.`)
            void recargar()
          }}
        />
      )}
    </div>
  )
}
