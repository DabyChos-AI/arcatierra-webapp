'use client'

// Mi día (K4, R8, sesión 48, 2-oct-2026; DR22). Diseñada para el celular (390×844) primero.
// - El guía ligado a su ficha ve SUS experiencias de hoy (y mañana); cocina y encargadas ven todas; un guía sin ficha
//   ligada ve el aviso de ligarla (modo `sin_ficha`). El modo lo decide el backend (GET /api/admin/mi-dia).
// - Sin teléfono, correo ni ligas tel:/mailto: (el backend no los manda; aquí solo se pinta `ReservaMiDia`).
// - «Llegaron» guarda la hora y quién en `reservas_llegadas` (no versiona la reserva). Deshacer pide confirmación.
// - La fecha («hoy») la da el backend: nada de new Date() como hoy. Se refresca al volver a la pestaña y cada 2 min.
// - R9 (DR23, sesión 49): `?reserva=<uuid>` = el QR del portal del cliente, escaneado con la cámara del celular. Pide
//   GET /api/admin/mi-dia/reserva/{id} (`MiDiaBusqueda`): si está en tu día (hoy o mañana) cambia a esa pestaña, baja a
//   la tarjeta y la resalta; si no, una tarjeta arriba con el motivo y «Ver mi día». Sin el parámetro no cambia nada.
//   `useSearchParams` vive en un lector dentro de <Suspense> (Next 15 lo exige) para que el resto se prerenderice igual.

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RefreshCw, AlertTriangle, Info } from 'lucide-react'
import AdminTopbar from '../components/AdminTopbar'
import { API_URL } from '@/lib/api'
import { aviso, confirmar } from '@/components/ui/Avisos'
import { extraerMensajeError } from '../reservas/components/errores'
import type { DiaMiDia, LlegadaReserva, LlegadaResponse, MiDiaBusqueda, MiDiaResponse } from '@/types/mi-dia'
import TarjetaMiDia from './components/TarjetaMiDia'
import TarjetaBusqueda, { type EstadoBusqueda } from './components/TarjetaBusqueda'
import { dondeAbrir, normalizarBusqueda, normalizarMiDia } from './components/normalizar'
import { TEXTO_SIN_FICHA, fechaLarga, plural, textoVacio } from './components/textos'

const REFRESCO_MS = 120_000

const PESTANAS: { dia: DiaMiDia; etiqueta: string }[] = [
  { dia: 'hoy', etiqueta: 'Hoy' },
  { dia: 'manana', etiqueta: 'Mañana' },
]

/** Lee `?reserva=` (R9). Va solo dentro de <Suspense>: así el resto de Mi día no depende de los parámetros. */
function LectorReserva({ onCambio }: { onCambio: (id: string | null) => void }) {
  const id = (useSearchParams().get('reserva') ?? '').trim()
  useEffect(() => {
    onCambio(id || null)
  }, [id, onCambio])
  return null
}

export default function MiDiaPage() {
  const { data: session } = useSession()
  const token = session?.accessToken
  const router = useRouter()

  const [dia, setDia] = useState<DiaMiDia>('hoy')
  const [datos, setDatos] = useState<MiDiaResponse | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enCurso, setEnCurso] = useState<ReadonlySet<string>>(new Set())

  // Candado por reserva (se pone ANTES de cualquier await) y número de pedido para ignorar respuestas viejas.
  const enCursoRef = useRef<Set<string>>(new Set())
  const pedidoRef = useRef(0)

  const cargar = useCallback(
    async (silencioso: boolean) => {
      if (!token) return
      const n = ++pedidoRef.current
      if (!silencioso) {
        setCargando(true)
        setError(null)
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/mi-dia?dia=${dia}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        const cuerpo: unknown = await res.json().catch(() => null)
        if (n !== pedidoRef.current) return
        if (!res.ok) {
          if (!silencioso) setError(extraerMensajeError(cuerpo, res.status))
          return
        }
        const normal = normalizarMiDia(cuerpo, dia)
        if (!normal) {
          if (!silencioso) setError('La respuesta del servidor no se pudo leer. Intenta de nuevo.')
          return
        }
        setDatos(normal)
        setError(null)
      } catch {
        if (n !== pedidoRef.current) return
        if (!silencioso) setError('No se pudo cargar Mi día. Revisa tu conexión e intenta de nuevo.')
      } finally {
        if (n === pedidoRef.current) setCargando(false)
      }
    },
    [token, dia],
  )

  // Carga al entrar y al cambiar de pestaña; refresco cada 2 min y al volver a la pestaña del navegador.
  useEffect(() => {
    void cargar(false)
    const intervalo = window.setInterval(() => void cargar(true), REFRESCO_MS)
    const alVolver = () => {
      if (document.visibilityState === 'visible') void cargar(true)
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [cargar])

  const vista = datos && datos.dia === dia ? datos : null

  // ─── R9 (DR23): la reserva del QR (`?reserva=<uuid>`) ───────────────────────
  const [reservaParam, setReservaParam] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState<EstadoBusqueda | null>(null)
  const busquedaRef = useRef(0) // descarta la respuesta de una búsqueda vieja
  const tokenRef = useRef(token)
  // La pestaña se abre UNA vez por búsqueda. Estado (no ref): «fuera de lista» solo se evalúa después de abrirla, así el
  // render en que llega la búsqueda (con la lista de antes) no hace parpadear la tarjeta.
  const [abierta, setAbierta] = useState<MiDiaBusqueda | null>(null)
  const scrollHechoRef = useRef<string | null>(null) // el scroll se hace UNA vez por QR, no en cada refresco
  const [releyendo, setReleyendo] = useState(false) // relectura silenciosa de la lista tras la búsqueda (punto 3)
  const hayToken = Boolean(token)

  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const buscar = useCallback(async (id: string) => {
    const n = ++busquedaRef.current
    setBusqueda({ estado: 'cargando', id })
    const t = tokenRef.current
    if (!t) return // sin sesión todavía: el efecto la vuelve a pedir cuando llegue
    try {
      const res = await fetch(`${API_URL}/api/admin/mi-dia/reserva/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${t}` },
        cache: 'no-store',
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (n !== busquedaRef.current) return
      if (res.status === 400 || res.status === 404 || res.status === 422) {
        setBusqueda({ estado: 'no_encontrada', id })
        return
      }
      if (!res.ok) {
        setBusqueda({ estado: 'error', id, mensaje: extraerMensajeError(cuerpo, res.status) })
        return
      }
      const b = normalizarBusqueda(cuerpo)
      setBusqueda(
        b
          ? { estado: 'listo', id, datos: b }
          : { estado: 'error', id, mensaje: 'La respuesta del servidor no se pudo leer. Intenta de nuevo.' },
      )
    } catch {
      if (n !== busquedaRef.current) return
      setBusqueda({ estado: 'error', id, mensaje: 'No se pudo buscar la reserva. Revisa tu conexión e intenta de nuevo.' })
    }
  }, [])

  // Un QR nuevo (o quitar el parámetro) reinicia la búsqueda; espera a tener la sesión.
  useEffect(() => {
    setAbierta(null)
    scrollHechoRef.current = null
    if (!reservaParam) {
      busquedaRef.current++
      setBusqueda(null)
      return
    }
    void buscar(reservaParam)
  }, [reservaParam, hayToken, buscar])

  const destino = busqueda?.estado === 'listo' ? dondeAbrir(busqueda.datos) : null
  const escaneadaId = destino?.reservaId ?? null

  // Está en tu día: abre su pestaña (una vez por búsqueda). Si ya era la pestaña a la vista, relee la lista en
  // silencio (pudo pedirse antes de que la asignaran).
  useEffect(() => {
    if (busqueda?.estado !== 'listo') return
    const d = dondeAbrir(busqueda.datos)
    if (!d || abierta === busqueda.datos) return
    setAbierta(busqueda.datos)
    if (d.dia !== dia) {
      setDatos(null)
      setDia(d.dia)
    } else if (datos && datos.dia === dia) {
      setReleyendo(true)
      void cargar(true).finally(() => setReleyendo(false))
    }
  }, [busqueda, abierta, dia, datos, cargar])

  // §9 C1-4: con `item`, la lista de ese día ya cargó (después de la búsqueda) y aun así no trae la tarjeta → se muestra
  // la tarjeta de búsqueda con los datos de arriba, sin motivo (data-resultado="fuera_de_lista").
  const fueraDeLista = Boolean(
    destino &&
      vista &&
      busqueda?.estado === 'listo' &&
      abierta === busqueda.datos &&
      !releyendo &&
      vista.dia === destino.dia &&
      !vista.items.some((it) => it.reserva_id === destino.reservaId),
  )

  // Baja a la tarjeta escaneada cuando ya está pintada (una sola vez por QR).
  useEffect(() => {
    if (!escaneadaId || scrollHechoRef.current === escaneadaId) return
    if (!vista || !vista.items.some((it) => it.reserva_id === escaneadaId)) return
    const el = document.querySelector<HTMLElement>(`[data-testid="midia-reserva-${CSS.escape(escaneadaId)}"]`)
    if (!el) return
    scrollHechoRef.current = escaneadaId
    el.scrollIntoView({ block: 'start' })
  }, [escaneadaId, vista])

  const cerrarBusqueda = useCallback(() => {
    busquedaRef.current++
    setBusqueda(null)
    router.replace('/admin/mi-dia')
  }, [router])

  const reintentarBusqueda = useCallback(() => {
    if (reservaParam) void buscar(reservaParam)
  }, [reservaParam, buscar])

  function cambiarDia(nuevo: DiaMiDia) {
    if (nuevo === dia) return
    setDatos(null)
    setDia(nuevo)
  }

  function tomarCandado(id: string): boolean {
    if (enCursoRef.current.has(id)) return false
    enCursoRef.current.add(id)
    setEnCurso(new Set(enCursoRef.current))
    return true
  }

  function soltarCandado(id: string) {
    enCursoRef.current.delete(id)
    setEnCurso(new Set(enCursoRef.current))
  }

  function ponerLlegada(id: string, llegada: LlegadaReserva | null) {
    setDatos((prev) =>
      prev ? { ...prev, items: prev.items.map((it) => (it.reserva_id === id ? { ...it, llegada } : it)) } : prev,
    )
  }

  async function llamarLlegada(id: string, metodo: 'POST' | 'DELETE', personas?: number | null): Promise<boolean> {
    if (!token) {
      aviso.error('Tu sesión expiró. Vuelve a iniciar sesión.')
      return false
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/mi-dia/${encodeURIComponent(id)}/llegada`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(metodo === 'POST' ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(metodo === 'POST' ? { body: JSON.stringify({ personas_llegaron: personas ?? null }) } : {}),
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        aviso.error(extraerMensajeError(cuerpo, res.status))
        void cargar(true) // otra persona pudo cambiarla: la lista se pone al día
        return false
      }
      const r = cuerpo as Partial<LlegadaResponse> | null
      ponerLlegada(id, r?.llegada ?? null)
      return true
    } catch {
      aviso.error('No se pudo guardar. Revisa tu conexión e intenta de nuevo.')
      return false
    }
  }

  async function marcar(id: string, personas: number | null) {
    if (!tomarCandado(id)) return
    try {
      if (await llamarLlegada(id, 'POST', personas)) aviso.exito('Llegada registrada.')
    } finally {
      soltarCandado(id)
    }
  }

  async function deshacer(id: string) {
    if (!tomarCandado(id)) return
    try {
      const ok = await confirmar({
        titulo: 'Deshacer llegada',
        mensaje: 'Se borra la hora de llegada de este grupo. Podrás marcarla otra vez.',
        textoAceptar: 'Deshacer',
        peligro: true,
      })
      if (!ok) return
      if (await llamarLlegada(id, 'DELETE')) aviso.exito('Llegada deshecha.')
    } finally {
      soltarCandado(id)
    }
  }

  const cuando = dia === 'hoy' ? 'hoy' : 'mañana'

  return (
    <div className="flex flex-col">
      <AdminTopbar />
      <div className="mx-auto w-full max-w-2xl space-y-4 py-4 sm:py-6">
        {/* Encabezado */}
        <header className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="mb-0 font-display text-3xl leading-tight text-verde">Mi día</h1>
            <button
              type="button"
              data-testid="midia-actualizar"
              aria-label="Actualizar"
              onClick={() => void cargar(false)}
              disabled={cargando}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutro-borde bg-white text-verde hover:bg-neutro-light disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${cargando ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
          {vista && (
            <>
              <p data-testid="midia-fecha" data-fecha={vista.fecha} className="text-base text-verde-tipografia">
                {fechaLarga(vista.fecha)}
              </p>
              {vista.modo === 'guia' && (
                <p data-testid="midia-saludo" className="text-lg font-semibold text-terracota">
                  {vista.guia_nombre ? `Hola, ${vista.guia_nombre}` : 'Hola'}
                </p>
              )}
              {vista.modo === 'todas' && (
                <p data-testid="midia-modo-todas" className="text-lg font-semibold text-terracota">
                  Todas las experiencias de {cuando}
                </p>
              )}
              {vista.modo !== 'sin_ficha' && (
                <p data-testid="midia-totales" className="text-sm text-verde-suave">
                  {plural(vista.items.length, 'experiencia', 'experiencias')} ·{' '}
                  {plural(vista.total_personas, 'persona', 'personas')} · {plural(vista.total_ninos, 'niño', 'niños')}
                </p>
              )}
            </>
          )}
        </header>

        {/* R9: la reserva escaneada que no está en tu día (o no existe) */}
        {busqueda && (!destino || fueraDeLista) && (
          <TarjetaBusqueda
            busqueda={busqueda}
            fueraDeLista={fueraDeLista}
            onCerrar={cerrarBusqueda}
            onReintentar={reintentarBusqueda}
          />
        )}

        {/* Pestañas Hoy / Mañana */}
        <div role="tablist" aria-label="Día" className="grid grid-cols-2 gap-1 rounded-xl bg-neutro-light p-1">
          {PESTANAS.map((p) => {
            const activa = p.dia === dia
            return (
              <button
                key={p.dia}
                type="button"
                role="tab"
                aria-selected={activa}
                data-testid={`midia-tab-${p.dia}`}
                onClick={() => cambiarDia(p.dia)}
                className={`min-h-[44px] rounded-lg text-base font-semibold transition-colors ${
                  activa ? 'bg-white text-terracota shadow-soft' : 'text-verde hover:bg-white/60'
                }`}
              >
                {p.etiqueta}
              </button>
            )
          })}
        </div>

        {/* Contenido (un error al actualizar se muestra encima de lo que ya se veía) */}
        {error && (
          <div data-testid="midia-error" role="alert" className="rounded-xl border border-rojo/30 bg-rojo-bg p-4">
            <p className="flex items-start gap-2 text-sm text-rojo">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
            <button
              type="button"
              data-testid="midia-reintentar"
              onClick={() => void cargar(false)}
              className="mt-3 min-h-[44px] rounded-lg bg-terracota px-4 text-sm font-semibold text-white hover:bg-terracota-dark"
            >
              Reintentar
            </button>
          </div>
        )}
        {error && !vista ? null : !vista ? (
          <div data-testid="midia-cargando" className="space-y-3" aria-busy="true">
            <span className="sr-only">Cargando…</span>
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-neutro-borde bg-white p-4">
                <div className="mb-3 h-7 w-24 rounded bg-neutro-light" />
                <div className="mb-2 h-4 w-48 rounded bg-neutro-light" />
                <div className="h-4 w-32 rounded bg-neutro-light" />
              </div>
            ))}
          </div>
        ) : vista.modo === 'sin_ficha' ? (
          <div
            data-testid="midia-sin-ficha"
            role="status"
            className="flex items-start gap-2 rounded-xl border border-amarillo/40 bg-amarillo-bg p-4 text-sm text-verde-tipografia"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amarillo" aria-hidden="true" />
            <p>{TEXTO_SIN_FICHA}</p>
          </div>
        ) : vista.items.length === 0 ? (
          <p
            data-testid="midia-vacio"
            className="rounded-xl border border-neutro-borde bg-white p-6 text-center text-base text-verde-suave"
          >
            {textoVacio(dia, vista.modo)}
          </p>
        ) : (
          <div data-testid="midia-lista" className="space-y-3">
            {vista.items.map((r) => (
              <TarjetaMiDia
                key={r.reserva_id}
                r={r}
                enCurso={enCurso.has(r.reserva_id)}
                onMarcar={marcar}
                onDeshacer={deshacer}
                escaneada={r.reserva_id === escaneadaId}
              />
            ))}
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        <LectorReserva onCambio={setReservaParam} />
      </Suspense>
    </div>
  )
}
