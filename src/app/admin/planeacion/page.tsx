'use client'

// Planeación semanal (PS1 Ola 2): la junta de turismo de lunes a domingo.
// Sin montos, comerciales, contacto, fuente ni estado de pago: eso solo sale en
// el Excel completo, que se ofrece si el backend dice `puede_ver_completa`.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  CalendarRange,
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
import { volverAlLoginDelPanel } from '@/lib/fetchPanel'
import type { SemanaPlaneacion } from '@/types/planeacion'
import AdminTopbar from '../components/AdminTopbar'
import { extraerMensajeError } from '../reservas/components/errores'
import TablaPlaneacion from './components/TablaPlaneacion'
import { SOLO_FECHA, hoyMexico, lunesDe, sumarDias } from './components/fechas'

const TIEMPO_MAXIMO = 30_000

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

/** Nombre del archivo desde `Content-Disposition` (filename* o filename). */
function nombreDeArchivo(res: Response, porDefecto: string): string {
  const cd = res.headers.get('content-disposition') || ''
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1]
  if (utf8) {
    try {
      return decodeURIComponent(utf8.replace(/"/g, ''))
    } catch {
      /* cae al filename simple */
    }
  }
  return /filename="?([^";]+)"?/i.exec(cd)?.[1] || porDefecto
}

/** Mismo patrón que /admin/reportes: blob → objectURL → <a download> → revoke. */
async function descargar(res: Response, porDefecto: string): Promise<void> {
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreDeArchivo(res, porDefecto)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function PlaneacionPage() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const [hoy] = useState(hoyMexico)
  // Cualquier día: el backend responde la semana (lunes a domingo) que lo contiene
  const [fecha, setFecha] = useState(hoy)
  const [semana, setSemana] = useState<SemanaPlaneacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const [descargando, setDescargando] = useState<'junta' | 'completa' | null>(null)
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null)

  // El link a Eventos es para quien tiene el permiso 'reservas' o es super_admin. El
  // layout no comparte `permisosActivos`, así que se pide el mismo endpoint que usa él.
  // Si cambia de rol en el encabezado, el link se actualiza al recargar (aceptado).
  const [puedeVerEventos, setPuedeVerEventos] = useState(false)

  useEffect(() => {
    let cancelado = false
    fetch('/api/admin/roles/mis-roles')
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: { permisos_activos?: unknown; rol_activo?: { nombre?: unknown } | null } | null) => {
          if (cancelado || !data) return
          const permisos = Array.isArray(data.permisos_activos) ? data.permisos_activos : []
          setPuedeVerEventos(
            permisos.includes('reservas') || data.rol_activo?.nombre === 'super_admin',
          )
        },
      )
      .catch(() => {
        /* sin permisos a la vista no se ofrece el link; la página sigue igual */
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelado = false
    const cargar = async () => {
      // Refetch silencioso: la semana anterior se queda en pantalla mientras llega la nueva
      setCargando(true)
      setError(null)
      try {
        const res = await fetch(
          `${API_URL}/api/admin/planeacion/semana?fecha=${encodeURIComponent(fecha)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(TIEMPO_MAXIMO),
          },
        )
        await lanzarSiFallo(res)
        const data = (await res.json()) as SemanaPlaneacion | null
        if (!data || !Array.isArray(data.dias) || !data.totales) {
          throw new ErrorLegible('El servidor respondió algo inesperado. Reintenta.')
        }
        if (!cancelado) setSemana(data)
      } catch (e) {
        if (!cancelado) setError(mensajeDeFallo(e))
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [token, fecha, intento])

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
  const semanaVacia = !!semana && semana.dias.every((d) => d.filas.length === 0)
  const botonNav =
    'inline-flex items-center gap-1 rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm text-verde transition hover:bg-neutro-light'

  return (
    <div className="flex h-full flex-col">
      <AdminTopbar />

      <div className="flex-1 space-y-6 overflow-auto p-4 sm:p-6">
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
          {puedeVerEventos && (
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
          <div className="flex gap-2">
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
                  className="font-heading text-lg font-bold text-verde"
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
              <TablaPlaneacion dias={semana.dias} hoy={hoy} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
