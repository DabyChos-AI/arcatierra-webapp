'use client'

// R11 (K5, sesión 50, 16-oct-2026) · Campana de notificaciones del panel (R11-CONTRATO.md §4.5.3).
// Se monta UNA vez en AdminHeader. API con el Bearer de la sesión (el mismo camino que AdminSidebar):
//   GET  ${API_URL}/api/admin/notificaciones?limite=20[&antes_de=<id>] → NotificacionesRespuesta
//   POST ${API_URL}/api/admin/notificaciones/{id}/leida      → 204 (idempotente; 404 si ya no la puede ver)
//   POST ${API_URL}/api/admin/notificaciones/leidas          → 200 { marcadas }
//   POST ${API_URL}/api/admin/notificaciones/{id}/atendida   → 204 (solo TIPOS_CON_ATENCION; otro tipo 409)
// Los títulos no traen nombres, correos ni teléfonos (los arma el backend). Relee cada NOTIFICACIONES_CADA_MS, al abrir
// y al cambiar de rol (las que se ven dependen del rol ACTIVO). Escape y clic fuera cierran. Solo navega a «/admin…».
//
// data-testid: `campana-abrir` · `campana-insignia` (no_leidas, «99+») · `campana-panel` · `campana-lista` ·
// `campana-item` (el BOTÓN de cada aviso: data-id, data-tipo, data-leida="1|0", data-atendida="1|0") ·
// `campana-atendida` (botón HERMANO del item) · `campana-atendida-etiqueta` · `campana-marcar-todas` · `campana-ver-mas` ·
// `campana-vacio` · `campana-cargando` · `campana-error` + `campana-reintentar`.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Bell, CheckCheck } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { formatFechaHoraMexico, formatFechaMexico } from '@/lib/dates'
import { aviso } from '@/components/ui/Avisos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { useMisRoles } from './MisRolesContext'
import {
  ETIQUETA_NOTIFICACION,
  NOTIFICACIONES_CADA_MS,
  TIPOS_CON_ATENCION,
  type Notificacion,
  type NotificacionesRespuesta,
  type TipoNotificacion,
} from '@/types/panel'

const LIMITE = 20
const TIPOS = Object.keys(ETIQUETA_NOTIFICACION) as TipoNotificacion[]

type EstadoCarga = 'cargando' | 'listo' | 'error'

function esRutaPanel(url: unknown): url is string {
  return typeof url === 'string' && url.startsWith('/admin') && !url.startsWith('//')
}

/** Llave faltante ≠ campana rota. */
function normalizar(cuerpo: unknown): NotificacionesRespuesta {
  const c = (typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {}) as Partial<NotificacionesRespuesta>
  const items: Notificacion[] = (Array.isArray(c.items) ? c.items : [])
    .filter((n): n is Notificacion => typeof n === 'object' && n !== null && Number.isFinite(Number(n.id)))
    .map((n) => ({
      id: Number(n.id),
      tipo: n.tipo,
      titulo: String(n.titulo ?? ''),
      detalle: typeof n.detalle === 'string' && n.detalle.trim() ? n.detalle : null,
      url: esRutaPanel(n.url) ? n.url : null,
      creada_en: String(n.creada_en ?? ''),
      leida: n.leida === true,
      atendida: n.atendida === true,
    }))
  const noLeidas = Number(c.no_leidas)
  const siguiente = c.siguiente === null || c.siguiente === undefined ? null : Number(c.siguiente)
  return {
    items,
    no_leidas: Number.isFinite(noLeidas) && noLeidas > 0 ? Math.floor(noLeidas) : 0,
    siguiente: siguiente !== null && Number.isFinite(siguiente) ? siguiente : null,
  }
}

/** «ahora», «hace 5 min», «hace 3 h», «hace 2 días»; desde 7 días, la fecha (hora de México). */
function haceCuanto(iso: string, ahora: number): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const min = Math.floor(Math.max(0, ahora - t) / 60_000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 7) return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
  return formatFechaMexico(iso, { year: undefined })
}

export default function CampanaNotificaciones() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.accessToken
  const tokenRef = useRef<string | undefined>(token)
  tokenRef.current = token
  const hayToken = Boolean(token)
  const { rolActivo, estadoRoles } = useMisRoles()
  // Las que se ven dependen del rol activo: se relee al cambiarlo. Mientras mis-roles carga, no se pide nada.
  const claveRol = estadoRoles === 'cargando' ? null : `${estadoRoles}:${rolActivo?.id ?? ''}`

  const [abierto, setAbierto] = useState(false)
  const [items, setItems] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [siguiente, setSiguiente] = useState<number | null>(null)
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [mensajeError, setMensajeError] = useState('')
  const [cargandoMas, setCargandoMas] = useState(false)
  const [marcandoTodas, setMarcandoTodas] = useState(false)
  const [atendiendo, setAtendiendo] = useState<Set<number>>(() => new Set())
  const [ahora, setAhora] = useState(() => Date.now())
  // En celular el panel es `fixed` a lo ancho: arranca justo debajo de la campana (la barra se parte en dos renglones
  // y su alto cambia), medido al abrir. Desde sm cuelga del botón (absolute) y esto no se usa.
  const [topMovil, setTopMovil] = useState(64)

  const cajaRef = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)
  const peticionRef = useRef(0)
  const itemsRef = useRef<Notificacion[]>([])
  itemsRef.current = items
  const siguienteRef = useRef<number | null>(null)
  siguienteRef.current = siguiente
  const atendiendoRef = useRef<Set<number>>(new Set())
  const marcandoTodasRef = useRef(false)

  const llamar = useCallback(async (ruta: string, init?: RequestInit) => {
    const t = tokenRef.current
    return fetch(`${API_URL}${ruta}`, {
      ...init,
      cache: 'no-store',
      headers: { ...(init?.headers ?? {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    })
  }, [])

  /** La primera página. Si ya se habían cargado más con «Ver más», se conservan las más viejas. */
  const leer = useCallback(async () => {
    const numero = ++peticionRef.current
    try {
      const res = await llamar(`/api/admin/notificaciones?limite=${LIMITE}`)
      const cuerpo: unknown = await res.json().catch(() => null)
      if (numero !== peticionRef.current) return
      if (!res.ok) {
        setMensajeError(
          res.status === 401
            ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
            : res.status >= 500
              ? 'No se pudieron cargar los avisos. Intenta de nuevo.'
              : extraerMensajeError(cuerpo, res.status),
        )
        setEstado('error')
        return
      }
      const pagina = normalizar(cuerpo)
      const previos = itemsRef.current
      let lista = pagina.items
      let sig = pagina.siguiente
      if (pagina.siguiente !== null && pagina.items.length > 0 && previos.length > pagina.items.length) {
        const menor = Math.min(...pagina.items.map((n) => n.id))
        const viejos = previos.filter((n) => n.id < menor)
        if (viejos.length > 0) {
          lista = [...pagina.items, ...viejos]
          sig = siguienteRef.current
        }
      }
      setItems(lista)
      setSiguiente(sig)
      setNoLeidas(pagina.no_leidas)
      setMensajeError('')
      setEstado('listo')
      setAhora(Date.now())
    } catch {
      if (numero !== peticionRef.current) return
      setMensajeError('No se pudieron cargar los avisos: revisa tu conexión.')
      setEstado('error')
    }
  }, [llamar])

  // Al entrar, al cambiar de rol y cada NOTIFICACIONES_CADA_MS (si la pestaña está a la vista).
  useEffect(() => {
    if (!hayToken || claveRol === null) return
    setItems([])
    setSiguiente(null)
    setEstado('cargando')
    void leer()
    const intervalo = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      void leer()
    }, NOTIFICACIONES_CADA_MS)
    return () => window.clearInterval(intervalo)
  }, [hayToken, claveRol, leer])

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAbierto(false)
    if (devolverFoco) botonRef.current?.focus()
  }, [])

  // Escape y clic fuera.
  useEffect(() => {
    if (!abierto) return
    function alPresionar(e: MouseEvent) {
      if (e.detail > 1) return
      if (cajaRef.current && !cajaRef.current.contains(e.target as Node)) setAbierto(false)
    }
    function alTeclear(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const dentro = cajaRef.current?.contains(document.activeElement) ?? false
      setAbierto(false)
      if (dentro) botonRef.current?.focus()
    }
    document.addEventListener('mousedown', alPresionar)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alPresionar)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  function alternar() {
    if (abierto) {
      cerrar(false)
      return
    }
    const abajo = botonRef.current?.getBoundingClientRect().bottom
    setTopMovil(typeof abajo === 'number' && Number.isFinite(abajo) ? Math.round(abajo) + 8 : 64)
    setAbierto(true)
    setAhora(Date.now())
    if (hayToken) void leer()
  }

  async function abrirAviso(n: Notificacion) {
    if (!n.leida) {
      // Optimista: la insignia baja en el momento; si la API dice que no, se relee.
      setItems((lista) => lista.map((x) => (x.id === n.id ? { ...x, leida: true } : x)))
      setNoLeidas((c) => Math.max(0, c - 1))
    }
    if (n.url) {
      cerrar(false)
      router.push(n.url)
    }
    if (n.leida) return
    try {
      const res = await llamar(`/api/admin/notificaciones/${encodeURIComponent(String(n.id))}/leida`, {
        method: 'POST',
        keepalive: true,
      })
      if (!res.ok) void leer()
    } catch {
      void leer()
    }
  }

  async function marcarTodas() {
    if (marcandoTodasRef.current) return
    marcandoTodasRef.current = true
    setMarcandoTodas(true)
    try {
      const res = await llamar('/api/admin/notificaciones/leidas', { method: 'POST' })
      if (!res.ok) {
        const cuerpo: unknown = await res.json().catch(() => null)
        aviso.error(`No se pudieron marcar como leídas: ${extraerMensajeError(cuerpo, res.status)}`)
        return
      }
      setItems((lista) => lista.map((x) => ({ ...x, leida: true })))
      setNoLeidas(0)
      void leer()
    } catch {
      aviso.error('No se pudieron marcar como leídas: revisa tu conexión.')
    } finally {
      marcandoTodasRef.current = false
      setMarcandoTodas(false)
    }
  }

  async function marcarAtendida(n: Notificacion) {
    // Candado por aviso ANTES de cualquier await (doble clic = un solo POST).
    if (atendiendoRef.current.has(n.id)) return
    atendiendoRef.current.add(n.id)
    setAtendiendo(new Set(atendiendoRef.current))
    try {
      const res = await llamar(`/api/admin/notificaciones/${encodeURIComponent(String(n.id))}/atendida`, {
        method: 'POST',
      })
      if (!res.ok) {
        const cuerpo: unknown = await res.json().catch(() => null)
        aviso.error(`No se pudo marcar como atendida: ${extraerMensajeError(cuerpo, res.status)}`)
        void leer()
        return
      }
      setItems((lista) => lista.map((x) => (x.id === n.id ? { ...x, atendida: true } : x)))
      aviso.exito('Marcada como atendida')
    } catch {
      aviso.error('No se pudo marcar como atendida: revisa tu conexión.')
    } finally {
      atendiendoRef.current.delete(n.id)
      setAtendiendo(new Set(atendiendoRef.current))
    }
  }

  async function verMas() {
    const antes = siguienteRef.current
    if (antes === null || cargandoMas) return
    setCargandoMas(true)
    try {
      const res = await llamar(`/api/admin/notificaciones?limite=${LIMITE}&antes_de=${encodeURIComponent(String(antes))}`)
      const cuerpo: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        aviso.error(`No se pudieron cargar más avisos: ${extraerMensajeError(cuerpo, res.status)}`)
        return
      }
      const pagina = normalizar(cuerpo)
      setItems((lista) => {
        const vistos = new Set(lista.map((n) => n.id))
        return [...lista, ...pagina.items.filter((n) => !vistos.has(n.id))]
      })
      setSiguiente(pagina.siguiente)
      setNoLeidas(pagina.no_leidas)
    } catch {
      aviso.error('No se pudieron cargar más avisos: revisa tu conexión.')
    } finally {
      setCargandoMas(false)
    }
  }

  const insignia = noLeidas > 99 ? '99+' : String(noLeidas)
  const etiquetaBoton = noLeidas > 0 ? `Notificaciones: ${insignia} sin leer` : 'Notificaciones'

  return (
    <div className="relative" ref={cajaRef}>
      <button
        ref={botonRef}
        type="button"
        data-testid="campana-abrir"
        aria-label={etiquetaBoton}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        title="Notificaciones"
        onClick={alternar}
        className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {noLeidas > 0 && (
          <span
            data-testid="campana-insignia"
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracota px-1 text-[10px] font-semibold leading-none text-white"
          >
            {insignia}
          </span>
        )}
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          data-testid="campana-panel"
          style={{ '--campana-top': `${topMovil}px` } as React.CSSProperties}
          className="fixed inset-x-2 top-[var(--campana-top)] z-[7000] flex max-h-[calc(100dvh_-_var(--campana-top)_-_1rem)] flex-col overflow-hidden rounded-xl border border-neutro-borde bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[min(32rem,calc(100dvh-6rem))]"
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutro-borde px-4 py-3">
            <p className="mb-0 text-sm font-semibold text-verde">
              Notificaciones
              {noLeidas > 0 && <span className="ml-1 font-normal text-verde-suave">({insignia} sin leer)</span>}
            </p>
            {noLeidas > 0 && (
              <button
                type="button"
                data-testid="campana-marcar-todas"
                onClick={marcarTodas}
                disabled={marcandoTodas}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-terracota hover:bg-neutro-light disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {estado === 'cargando' && items.length === 0 && (
              <p data-testid="campana-cargando" role="status" className="mb-0 px-4 py-6 text-center text-sm text-verde-suave">
                Cargando avisos…
              </p>
            )}

            {estado === 'error' && items.length === 0 && (
              <div data-testid="campana-error" role="alert" className="m-3 rounded-lg bg-rojo-bg px-4 py-3">
                <p className="mb-0 break-words text-sm text-rojo">{mensajeError}</p>
                <button
                  type="button"
                  data-testid="campana-reintentar"
                  onClick={() => {
                    setEstado('cargando')
                    void leer()
                  }}
                  className="mt-2 rounded-lg border border-rojo/40 bg-white px-3 py-1.5 text-sm text-rojo hover:bg-rojo-bg"
                >
                  Reintentar
                </button>
              </div>
            )}

            {estado === 'listo' && items.length === 0 && (
              <p data-testid="campana-vacio" className="mb-0 px-4 py-6 text-center text-sm text-verde-suave">
                Sin avisos en los últimos 30 días
              </p>
            )}

            {items.length > 0 && (
              <ul data-testid="campana-lista" className="m-0 list-none divide-y divide-neutro-borde p-0">
                {items.map((n) => {
                  const conAtencion = TIPOS_CON_ATENCION.includes(n.tipo)
                  const etiqueta = TIPOS.includes(n.tipo) ? ETIQUETA_NOTIFICACION[n.tipo] : 'Aviso'
                  return (
                    <li key={n.id} className={n.leida ? 'bg-white' : 'bg-neutro-light'}>
                      <button
                        type="button"
                        data-testid="campana-item"
                        data-id={n.id}
                        data-tipo={n.tipo}
                        data-leida={n.leida ? '1' : '0'}
                        data-atendida={n.atendida ? '1' : '0'}
                        onClick={() => void abrirAviso(n)}
                        className="block w-full px-4 pb-2 pt-3 text-left hover:bg-neutro-crema/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracota/50"
                      >
                        <span className="flex items-center gap-2">
                          {!n.leida && <span className="h-2 w-2 shrink-0 rounded-full bg-terracota" aria-hidden="true" />}
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-verde-suave">
                            {etiqueta}
                          </span>
                          <time
                            dateTime={n.creada_en}
                            title={formatFechaHoraMexico(n.creada_en)}
                            className="shrink-0 text-xs text-verde-suave"
                          >
                            {haceCuanto(n.creada_en, ahora)}
                          </time>
                        </span>
                        <span className={`mt-1 block break-words text-sm ${n.leida ? 'text-verde-tipografia' : 'font-semibold text-verde'}`}>
                          {n.titulo}
                        </span>
                        {n.detalle && <span className="mt-0.5 block break-words text-xs text-verde-suave">{n.detalle}</span>}
                        <span className="sr-only">{n.leida ? ' (leída)' : ' (sin leer)'}</span>
                      </button>
                      {conAtencion && (
                        <div className="flex justify-end px-4 pb-3">
                          {n.atendida ? (
                            <span
                              data-testid="campana-atendida-etiqueta"
                              className="rounded-full bg-verde/10 px-2 py-0.5 text-xs font-medium text-verde"
                            >
                              Atendida
                            </span>
                          ) : (
                            <button
                              type="button"
                              data-testid="campana-atendida"
                              data-id={n.id}
                              onClick={() => void marcarAtendida(n)}
                              disabled={atendiendo.has(n.id)}
                              className="rounded-lg border border-verde/30 px-2.5 py-1 text-xs font-medium text-verde hover:bg-verde/10 disabled:opacity-50"
                            >
                              Marcar como atendida
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}

            {siguiente !== null && items.length > 0 && (
              <div className="border-t border-neutro-borde px-4 py-2 text-center">
                <button
                  type="button"
                  data-testid="campana-ver-mas"
                  onClick={() => void verMas()}
                  disabled={cargandoMas}
                  className="rounded px-3 py-1.5 text-sm font-medium text-terracota hover:bg-neutro-light disabled:opacity-50"
                >
                  {cargandoMas ? 'Cargando…' : 'Ver más'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
