'use client'

// R11 (K3, sesión 50, 16-oct-2026) · Búsqueda global del panel (R11-CONTRATO.md §4.5.1).
// Se monta UNA vez en AdminHeader (la barra de TODAS las páginas del panel): el botón de la barra, el atajo ⌘K / Ctrl+K
// (UN solo listener, aquí) y el diálogo.
// API: GET ${API_URL}/api/admin/buscar?q=<2..60>&limite=5 con el Bearer de la sesión (el mismo camino que AdminSidebar,
// la vecina de la barra) → BusquedaRespuesta (src/types/panel.ts, del líder). La API solo manda los grupos que el rol
// activo puede ver, y nunca correos ni teléfonos (se puede BUSCAR por ellos; aquí solo se pinta título y subtítulo).
//
// Reglas:
//   - Espera BUSQUEDA_ESPERA_MS entre teclas; con menos de BUSQUEDA_MIN caracteres no llama. Cada petición nueva (o cada
//     tecla) cancela la anterior con AbortController, y un contador descarta cualquier respuesta vieja.
//   - Escape cierra SOLO este diálogo: el manejador del diálogo detiene la propagación, así los modales de abajo (que
//     escuchan Escape en window/document) no se cierran.
//   - Foco atrapado (Tab da la vuelta dentro del diálogo); al cerrar regresa a donde estaba (patrón de Avisos.tsx).
//   - z-[8000]: encima de los modales del panel (60…1300) y debajo del diálogo de confirmar (9000) y los avisos (9500).
//   - Solo navega a rutas del panel («/admin…»).
//
// data-testid: `busqueda-global-abrir` (botón) · `busqueda-global-dialogo` (role=dialog, data-estado) ·
// `busqueda-global-input` · `busqueda-global-cerrar` · `busqueda-ayuda` · `busqueda-cargando` · `busqueda-vacio` ·
// `busqueda-error` (role=alert) + `busqueda-reintentar` · `busqueda-resultados` (listbox) · `busqueda-grupo-<tipo>` ·
// `busqueda-resultado` (role=option, data-tipo, data-url, data-activo="1" en el marcado).

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  BUSQUEDA_ESPERA_MS,
  BUSQUEDA_MAX,
  BUSQUEDA_MIN,
  type BusquedaRespuesta,
  type GrupoBusqueda,
  type ResultadoBusqueda,
  type TipoResultadoBusqueda,
} from '@/types/panel'

const LIMITE = 5
const TIPOS: TipoResultadoBusqueda[] = ['reserva', 'pedido', 'cliente', 'lead']
const ETIQUETA_POR_OMISION: Record<TipoResultadoBusqueda, string> = {
  reserva: 'Reservas',
  pedido: 'Pedidos',
  cliente: 'Clientes',
  lead: 'Leads',
}

type EstadoBusqueda = 'inactivo' | 'cargando' | 'listo' | 'error'

/** Solo rutas del panel: nada externo ni «//host». */
function esRutaPanel(url: unknown): url is string {
  return typeof url === 'string' && url.startsWith('/admin') && !url.startsWith('//')
}

/** Llave faltante ≠ diálogo roto: solo grupos conocidos, con resultados que traen id, título y una ruta del panel. */
function normalizar(cuerpo: unknown): GrupoBusqueda[] {
  if (typeof cuerpo !== 'object' || cuerpo === null) return []
  const grupos = (cuerpo as Partial<BusquedaRespuesta>).grupos
  if (!Array.isArray(grupos)) return []
  const salida: GrupoBusqueda[] = []
  for (const g of grupos) {
    if (typeof g !== 'object' || g === null || !TIPOS.includes(g.tipo)) continue
    const items: ResultadoBusqueda[] = (Array.isArray(g.items) ? g.items : [])
      .filter((r): r is ResultadoBusqueda => typeof r === 'object' && r !== null && esRutaPanel(r.url))
      .map((r) => ({
        id: String(r.id ?? ''),
        titulo: String(r.titulo ?? ''),
        subtitulo: typeof r.subtitulo === 'string' && r.subtitulo.trim() ? r.subtitulo : null,
        url: r.url,
      }))
    if (items.length === 0) continue
    salida.push({ tipo: g.tipo, etiqueta: g.etiqueta || ETIQUETA_POR_OMISION[g.tipo], items })
  }
  return salida
}

const SELECTOR_ENFOCABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function BusquedaGlobal() {
  const router = useRouter()
  const { data: session } = useSession()
  // La renovación de NextAuth cambia el VALOR del token: la búsqueda lo lee de un ref y no se repite por eso.
  const tokenRef = useRef<string | undefined>(undefined)
  tokenRef.current = session?.accessToken

  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<EstadoBusqueda>('inactivo')
  const [grupos, setGrupos] = useState<GrupoBusqueda[]>([])
  /** La búsqueda (sin espacios a los lados) a la que pertenecen `grupos` o el error. */
  const [qResultados, setQResultados] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [activo, setActivo] = useState(0)
  const [intento, setIntento] = useState(0)
  const [atajo, setAtajo] = useState('Ctrl K')

  const dialogoRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const focoPrevioRef = useRef<HTMLElement | null>(null)
  const controladorRef = useRef<AbortController | null>(null)
  const peticionRef = useRef(0)

  const idBase = useId()
  const idLista = `${idBase}-lista`
  const idAyuda = `${idBase}-ayuda`
  const idOpcion = (i: number) => `${idBase}-opcion-${i}`

  const q = texto.trim()
  const corta = q.length < BUSQUEDA_MIN
  const pendiente = !corta && (estado === 'cargando' || qResultados !== q)
  const planos = useMemo(() => grupos.flatMap((g) => g.items), [grupos])

  // El atajo que se pinta en la barra (después de montar: el servidor no sabe la plataforma).
  useEffect(() => {
    const plataforma = typeof navigator !== 'undefined' ? `${navigator.platform} ${navigator.userAgent}` : ''
    if (/Mac|iPhone|iPad/i.test(plataforma)) setAtajo('⌘K')
  }, [])

  const abiertoRef = useRef(false)
  useEffect(() => {
    abiertoRef.current = abierto
  }, [abierto])

  const abrir = useCallback(() => {
    if (abiertoRef.current) {
      // Ya abierto (⌘K otra vez): solo regresa el foco al campo.
      inputRef.current?.focus()
      inputRef.current?.select()
      return
    }
    setAbierto(true)
  }, [])

  const cerrar = useCallback(() => {
    controladorRef.current?.abort()
    controladorRef.current = null
    peticionRef.current += 1
    setAbierto(false)
    setTexto('')
    setGrupos([])
    setQResultados('')
    setMensajeError('')
    setEstado('inactivo')
    setActivo(0)
  }, [])

  // ⌘K / Ctrl+K desde cualquier página del panel. UN solo listener (este componente se monta una vez).
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'k') return
      // Con el diálogo de confirmar abierto (z-9000) no se abre nada debajo de él.
      if (document.querySelector('[data-testid="confirmar-dialogo"]')) return
      e.preventDefault()
      abrir()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abrir])

  // Foco: al abrir guarda dónde estaba y enfoca el campo; al cerrar lo regresa (Avisos.tsx:201-207).
  useEffect(() => {
    if (!abierto) return
    focoPrevioRef.current = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    return () => {
      const previo = focoPrevioRef.current
      if (previo && typeof previo.focus === 'function' && document.contains(previo)) previo.focus()
    }
  }, [abierto])

  // La búsqueda: espera entre teclas, cancela la anterior, descarta respuestas viejas.
  useEffect(() => {
    if (!abierto) return
    controladorRef.current?.abort()
    controladorRef.current = null
    const numero = ++peticionRef.current
    if (q.length < BUSQUEDA_MIN) {
      setEstado('inactivo')
      return
    }
    const temporizador = window.setTimeout(async () => {
      const controlador = new AbortController()
      controladorRef.current = controlador
      setEstado('cargando')
      try {
        const token = tokenRef.current
        const res = await fetch(
          `${API_URL}/api/admin/buscar?q=${encodeURIComponent(q)}&limite=${LIMITE}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            cache: 'no-store',
            signal: controlador.signal,
          },
        )
        const cuerpo: unknown = await res.json().catch(() => null)
        if (numero !== peticionRef.current) return
        if (!res.ok) {
          setMensajeError(
            res.status === 401
              ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
              : res.status >= 500
                ? 'No se pudo buscar. Intenta de nuevo.'
                : extraerMensajeError(cuerpo, res.status),
          )
          setGrupos([])
          setQResultados(q)
          setEstado('error')
          return
        }
        setGrupos(normalizar(cuerpo))
        setMensajeError('')
        setQResultados(q)
        setActivo(0)
        setEstado('listo')
      } catch {
        if (controlador.signal.aborted || numero !== peticionRef.current) return
        setMensajeError('No se pudo buscar: revisa tu conexión e intenta de nuevo.')
        setGrupos([])
        setQResultados(q)
        setEstado('error')
      } finally {
        if (controladorRef.current === controlador) controladorRef.current = null
      }
    }, BUSQUEDA_ESPERA_MS)
    return () => {
      window.clearTimeout(temporizador)
      controladorRef.current?.abort()
      controladorRef.current = null
    }
  }, [abierto, q, intento])

  // Si cambia la lista, el marcado se queda dentro de ella.
  useEffect(() => {
    if (activo >= planos.length) setActivo(0)
  }, [planos.length, activo])

  // El resultado marcado se ve (scroll dentro de la lista).
  useEffect(() => {
    if (!abierto || planos.length === 0) return
    document.getElementById(idOpcion(activo))?.scrollIntoView({ block: 'nearest' })
    // idOpcion depende solo de idBase
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, abierto, planos.length])

  const navegar = useCallback(
    (r: ResultadoBusqueda | undefined) => {
      if (!r || !esRutaPanel(r.url)) return
      cerrar()
      router.push(r.url)
    },
    [cerrar, router],
  )

  function alTeclearDialogo(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      // Solo este diálogo: los modales de abajo escuchan Escape en window (ModalCupon, ModalDiaSinEntrega) o en document
      // (FiltroMultiple). En el App Router React escucha EN document, así que stopPropagation no basta para los de
      // document: stopImmediatePropagation corta también a los que se registraron después (todos los de componentes).
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      cerrar()
      return
    }
    if (e.key === 'Tab') {
      const enfocables = Array.from(dialogoRef.current?.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLE) ?? [])
      if (enfocables.length === 0) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const actual = document.activeElement
      if (e.shiftKey && (actual === primero || !dialogoRef.current?.contains(actual))) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (actual === ultimo || !dialogoRef.current?.contains(actual))) {
        e.preventDefault()
        primero.focus()
      }
    }
  }

  function alTeclearInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (planos.length === 0) return
      const paso = e.key === 'ArrowDown' ? 1 : -1
      setActivo((i) => (i + paso + planos.length) % planos.length)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      // Mientras llega la búsqueda de lo que se acaba de escribir, Enter no abre un resultado viejo.
      if (pendiente || estado !== 'listo') return
      navegar(planos[activo])
    }
  }

  const estadoDialogo = corta ? 'inactivo' : pendiente ? 'cargando' : estado === 'error' ? 'error' : planos.length ? 'listo' : 'vacio'
  const conLista = !corta && planos.length > 0 && estado !== 'error'

  let indice = -1
  return (
    <>
      <button
        type="button"
        data-testid="busqueda-global-abrir"
        aria-label="Buscar (Ctrl+K)"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        title={`Buscar reservas, pedidos, clientes y leads (${atajo})`}
        onClick={abrir}
        className="flex items-center gap-2 p-2 text-gray-600 hover:text-green-700 hover:bg-gray-100 rounded-lg sm:border sm:border-neutro-borde sm:px-3"
      >
        <Search className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline text-sm">Buscar</span>
        <kbd className="hidden md:inline-flex items-center rounded border border-neutro-borde bg-white px-1.5 py-0.5 font-mono text-xs text-verde-suave">
          {atajo}
        </kbd>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-[8000] flex items-start justify-center bg-black/50 px-4 pt-16 sm:pt-24"
          onMouseDown={(e) => {
            // Clic fuera cierra; el 2.º mousedown de un doble clic (detail 2) no cuenta (Avisos.tsx:231).
            if (e.target === e.currentTarget && e.detail <= 1) cerrar()
          }}
          onKeyDown={alTeclearDialogo}
        >
          <div
            ref={dialogoRef}
            role="dialog"
            aria-modal="true"
            aria-label="Buscar en el panel"
            data-testid="busqueda-global-dialogo"
            data-estado={estadoDialogo}
            className="flex w-full min-w-0 max-w-xl max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-neutro-borde px-3 py-2">
              <Search className="h-5 w-5 shrink-0 text-verde-suave" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                role="combobox"
                aria-expanded={conLista}
                aria-controls={idLista}
                aria-autocomplete="list"
                aria-activedescendant={conLista && !pendiente ? idOpcion(activo) : undefined}
                aria-describedby={idAyuda}
                aria-label="Buscar reservas, pedidos, clientes y leads"
                data-testid="busqueda-global-input"
                value={texto}
                maxLength={BUSQUEDA_MAX}
                autoComplete="off"
                spellCheck={false}
                placeholder="Folio, nombre, correo o teléfono"
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={alTeclearInput}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-verde-tipografia placeholder:text-verde-suave focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                data-testid="busqueda-global-cerrar"
                aria-label="Cerrar búsqueda"
                onClick={cerrar}
                className="shrink-0 rounded p-1.5 text-verde-suave hover:bg-neutro-light hover:text-verde"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={pendiente}>
              {corta && (
                <p id={idAyuda} data-testid="busqueda-ayuda" className="mb-0 px-4 py-6 text-sm text-verde-suave">
                  Escribe al menos {BUSQUEDA_MIN} letras. Busca reservas, pedidos, clientes y leads por folio, nombre, correo o
                  teléfono.
                </p>
              )}

              {!corta && pendiente && planos.length === 0 && (
                <p id={idAyuda} data-testid="busqueda-cargando" role="status" className="mb-0 px-4 py-6 text-sm text-verde-suave">
                  Buscando…
                </p>
              )}

              {!corta && !pendiente && estado === 'error' && (
                <div id={idAyuda} data-testid="busqueda-error" role="alert" className="m-3 rounded-lg bg-rojo-bg px-4 py-3">
                  <p className="mb-0 break-words text-sm text-rojo">{mensajeError}</p>
                  <button
                    type="button"
                    data-testid="busqueda-reintentar"
                    onClick={() => setIntento((n) => n + 1)}
                    className="mt-2 rounded-lg border border-rojo/40 bg-white px-3 py-1.5 text-sm text-rojo hover:bg-rojo-bg"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!corta && !pendiente && estado === 'listo' && planos.length === 0 && (
                <p id={idAyuda} data-testid="busqueda-vacio" role="status" className="mb-0 break-words px-4 py-6 text-sm text-verde-suave">
                  Sin resultados para «{qResultados}».
                </p>
              )}

              {conLista && (
                <div
                  id={idLista}
                  role="listbox"
                  aria-label="Resultados"
                  data-testid="busqueda-resultados"
                  className={`py-2 transition-opacity ${pendiente ? 'opacity-60' : ''}`}
                >
                  {!pendiente && (
                    <p id={idAyuda} className="sr-only">
                      Usa las flechas para elegir y Enter para abrir.
                    </p>
                  )}
                  {grupos.map((g) => {
                    const idGrupo = `${idBase}-grupo-${g.tipo}`
                    return (
                      <div key={g.tipo} role="group" aria-labelledby={idGrupo} data-testid={`busqueda-grupo-${g.tipo}`}>
                        <p
                          id={idGrupo}
                          className="mb-0 px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-verde-suave"
                        >
                          {g.etiqueta}
                        </p>
                        {g.items.map((r) => {
                          indice += 1
                          const i = indice
                          const marcado = i === activo
                          return (
                            <div
                              key={`${g.tipo}-${r.id}-${i}`}
                              id={idOpcion(i)}
                              role="option"
                              aria-selected={marcado}
                              data-testid="busqueda-resultado"
                              data-tipo={g.tipo}
                              data-url={r.url}
                              data-activo={marcado ? '1' : undefined}
                              onMouseMove={() => {
                                if (!marcado) setActivo(i)
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => navegar(r)}
                              className={`mx-2 cursor-pointer rounded-lg px-3 py-2 ${
                                marcado ? 'bg-neutro-light ring-1 ring-terracota/40' : 'hover:bg-neutro-light'
                              }`}
                            >
                              <p className="mb-0 truncate text-sm font-medium text-verde">{r.titulo}</p>
                              {r.subtitulo && <p className="mb-0 truncate text-xs text-verde-suave">{r.subtitulo}</p>}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
