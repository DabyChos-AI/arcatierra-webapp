'use client'

// «Contenido del sitio» (WF7, DR61; R15 · F1, sesión 54). Contrato: R15-CONTRATO.md §9 C13–C15; formas exactas en
// src/types/contenido-sitio.ts (del líder). Permiso `contenido_sitio` (admin y super_admin): la API responde 403 a los demás.
// - UNA lectura de todo (GET /api/admin/contenido-sitio?incluir_archivados=true, con el Bearer, como todo el panel) y cada
//   pestaña filtra su sección; los cambios reemplazan el elemento en su lugar (no se recarga todo).
// - Lo que se publica sale en el sitio nuevo (link de revisión) en ≤ 1 min (la API pública cachea 60 s); lo vacío sale
//   con la marca «FALTA» (§4). En arcatierra.dabychos.com no cambia nada hasta el lanzamiento (§0.5).
// - Con AdminTopbar como la mayoría de las pantallas (el título «Contenido del sitio» lo agrega front-pulido a su TITLES).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, ExternalLink, LayoutTemplate, RefreshCw } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  NOMBRE_SECCION,
  SECCIONES_CONTENIDO,
  type ItemContenido,
  type SeccionContenido,
} from '@/types/contenido-sitio'
import AdminTopbar from '../components/AdminTopbar'
import PanelSeccion from './components/PanelSeccion'
import {
  TEXTO_SESION,
  TEXTO_SIN_PERMISO,
  clasificarError,
  normalizarTodos,
  type ResultadoError,
} from './components/contenido'

/** El link de revisión del sitio nuevo (R15 §3.1; pide la contraseña de Traefik). */
const SITIO_REVISION = 'https://arcatierra-nuevo.dabychos.com'

export default function ContenidoSitioPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken
  // El token cambia de VALOR al renovarse: la lectura depende de que exista, no de su valor (s49).
  const tokenRef = useRef(token)
  const hayToken = Boolean(token)
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const [seccion, setSeccion] = useState<SeccionContenido>('portada')
  const [items, setItems] = useState<ItemContenido[] | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<ResultadoError | null>(null)
  const pedidoRef = useRef(0)

  const releer = useCallback(async (): Promise<ItemContenido[] | null> => {
    const tk = tokenRef.current
    if (!tk) return null
    const n = ++pedidoRef.current
    setCargando(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/contenido-sitio?incluir_archivados=true`, {
        headers: { Authorization: `Bearer ${tk}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000),
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        if (n === pedidoRef.current) setError(clasificarError(res.status, cuerpo, extraerMensajeError(cuerpo, res.status)))
        return null
      }
      const lista = normalizarTodos(cuerpo)
      if (n === pedidoRef.current) {
        setItems(lista)
        setError(null)
      }
      return lista
    } catch (e) {
      const porTiempo = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
      if (n === pedidoRef.current)
        setError({
          tipo: 'otro',
          texto: porTiempo ? 'El servidor tardó más de 30 segundos en responder. Reintenta.' : 'Sin conexión con el servidor. Revisa tu internet y reintenta.',
        })
      return null
    } finally {
      if (n === pedidoRef.current) setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (hayToken) void releer()
  }, [hayToken, releer])

  const porSeccion = useMemo(() => {
    const m = new Map<SeccionContenido, ItemContenido[]>()
    for (const s of SECCIONES_CONTENIDO) m.set(s, [])
    for (const i of items ?? []) m.get(i.seccion)?.push(i)
    return m
  }, [items])

  // Un elemento guardado reemplaza al suyo (o se agrega al final de su sección).
  const onItem = useCallback((item: ItemContenido) => {
    setItems((prev) => {
      const lista = prev ?? []
      const existe = lista.some((i) => i.id === item.id)
      const nueva = existe ? lista.map((i) => (i.id === item.id ? item : i)) : [...lista, item]
      return normalizarTodos({ items: nueva })
    })
  }, [])

  // /reordenar responde la sección sin archivados: esos reemplazan a los activos; los archivados se quedan.
  const onSeccion = useCallback((s: SeccionContenido, activos: ItemContenido[]) => {
    setItems((prev) => {
      const resto = (prev ?? []).filter((i) => i.seccion !== s || i.estado === 'archivado')
      return normalizarTodos({ items: [...resto, ...activos] })
    })
  }, [])

  const textoError =
    error?.tipo === 'sesion' ? TEXTO_SESION : error?.tipo === 'permiso' ? TEXTO_SIN_PERMISO : error && 'texto' in error ? error.texto : null

  return (
    <div className="flex h-full flex-col">
      <AdminTopbar />
      <div className="flex-1 space-y-6 overflow-auto p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-lg bg-terracota/10 p-2">
              <LayoutTemplate className="h-6 w-6 text-terracota" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="mb-0 font-display text-3xl text-verde">Contenido del sitio</h1>
              <p data-testid="cs-explicacion" className="mb-0 text-sm text-verde-tipografia">
                Lo que publiques aquí sale en el sitio nuevo (
                <a
                  href={SITIO_REVISION}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="cs-link-revision"
                  className="inline-flex items-center gap-0.5 font-medium text-terracota underline hover:text-terracota-dark"
                >
                  link de revisión
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                ) en 1 minuto o menos; lo que quede vacío sale ahí marcado «FALTA».
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="cs-actualizar"
            onClick={() => void releer()}
            disabled={cargando || !hayToken}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-neutro-borde bg-white px-4 text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </header>

        {/* A 390 las pestañas se recorren de lado; desde sm bajan de renglón: las 8 se ven sin recorrer (a 1280 no caben en una línea). */}
        <div role="tablist" aria-label="Secciones del sitio" className="flex gap-1 overflow-x-auto border-b border-neutro-borde sm:flex-wrap sm:overflow-visible">
          {SECCIONES_CONTENIDO.map((s) => {
            const activa = s === seccion
            const n = (porSeccion.get(s) ?? []).filter((i) => i.estado !== 'archivado').length
            return (
              <button
                key={s}
                id={`cs-tab-${s}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`cs-panel-${s}`}
                data-testid={`cs-tab-${s}`}
                data-cuantos={items ? n : undefined}
                onClick={() => setSeccion(s)}
                className={`-mb-px flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm transition-colors ${
                  activa ? 'border-terracota font-semibold text-terracota' : 'border-transparent text-verde-medio hover:text-verde'
                }`}
              >
                {NOMBRE_SECCION[s]}
                {items && (
                  <span className="rounded-full bg-neutro-light px-1.5 text-xs font-semibold text-verde-tipografia">{n}</span>
                )}
              </button>
            )
          })}
        </div>

        {!hayToken ? (
          <p data-testid="cs-sin-sesion" className="text-sm text-verde-medio" aria-busy={status === 'loading'}>
            {status === 'loading' ? 'Cargando…' : TEXTO_SESION}
          </p>
        ) : textoError && !items ? (
          <div
            data-testid={error?.tipo === 'permiso' ? 'cs-sin-permiso' : 'cs-error'}
            role="alert"
            className="rounded-xl border border-rojo/30 bg-rojo-bg p-4"
          >
            <p className="flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{textoError}</span>
            </p>
            {error?.tipo !== 'permiso' && (
              <button
                type="button"
                data-testid="cs-reintentar"
                onClick={() => void releer()}
                className="mt-3 min-h-[44px] rounded-lg bg-terracota px-4 text-sm font-semibold text-white hover:bg-terracota-dark"
              >
                Reintentar
              </button>
            )}
          </div>
        ) : !items ? (
          <p data-testid="cs-cargando" aria-busy="true" className="text-sm text-verde-medio">
            Cargando el contenido del sitio…
          </p>
        ) : (
          <>
            {textoError && (
              <p data-testid="cs-error-actualizar" role="alert" className="flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg p-3 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>No se pudo actualizar: {textoError} Lo que ves puede no estar al día.</span>
              </p>
            )}
            <PanelSeccion
              key={seccion}
              token={token ?? ''}
              seccion={seccion}
              items={porSeccion.get(seccion) ?? []}
              cargando={cargando}
              onItem={onItem}
              onSeccion={onSeccion}
              releer={releer}
            />
          </>
        )}
      </div>
    </div>
  )
}
