'use client'

// R15 v2 · F6 (cuenta, sesión 64): el marco de Mi cuenta (f6/cuenta-F6.md §2; D-F6-08 P-1, D-F6-11 P-1…P-5). Lo pinta
// `src/app/nuevo/usuario/layout.tsx` alrededor de TODAS las pestañas (las de cuenta y las de compras), así que se queda montado al cambiar de
// pestaña: la tarjeta lateral no se vuelve a pedir ni parpadea. Pone el único <main> y el único <h1>; cada pestaña es una <section> con su h2.
//
// Diseño = la maqueta (`.simple-hero` + `.cuenta-grid`): rejilla de 1200 px con la tarjeta lateral de 240 px (nombre en serif, correo en
// mono, filete, la lista de pestañas en mono mayúsculas; la actual en terra con texto blanco) y el contenido a la derecha; hasta 860 px la
// tarjeta va arriba a lo ancho. «Métodos de pago» no pasa (C45, D-F6-06). Textos de hoy (DR-17): los nombres de `armazon/enlaces.ts`
// (ENLACES_CUENTA, el menú de usuario de hoy), «Mis Direcciones» (`usuario/dashboard/page.tsx:560`) y «Cerrar Sesión».
//
// Conducta de hoy: sin sesión, `router.push('/auth/signin')` (`usuario/dashboard/page.tsx:136-138`, `usuario/perfil/page.tsx:83-85`; el
// middleware ya manda a entrar antes de llegar aquí); «Cerrar Sesión» = `signOut({ callbackUrl: '/' })` (`armazon/MenuCuenta.tsx:145`).
// `GET /api/auth/me` UNA vez al tener sesión (hoy `perfil` la vuelve a pedir cada vez que NextAuth relee la sesión al volver a la ventana y
// borra lo que se estaba editando: defecto de hoy que no se copia). La pestaña actual sale de `useSelectedLayoutSegments()`: igual en el
// servidor y en el navegador (nada visible sale de `usePathname()`, `src/app/nuevo/layout.tsx`). 0 llamadas en el servidor (D-F6-10 P-5).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSelectedLayoutSegments } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { ENLACE_MI_CUENTA } from '@/components/sitio-nuevo/armazon/enlaces'
import { ContextoCuenta, type Cuenta, type EstadoMe, type MeCuenta } from './contexto'
import EncabezadoCuenta, { type OrigenNombre } from './EncabezadoCuenta'
import { PESTANAS_CUENTA } from './pestanas'
import { TEXTO_CERRAR_SESION, TEXTO_USUARIO_SIN_NOMBRE } from './textos'

const CLASE_ENLACE =
  'block w-full rounded-sn-campo border-0 px-3 py-2.5 text-left font-sn-mono text-sn-etiqueta font-medium uppercase no-underline transition-colors duration-150'
// La maqueta pinta las no elegidas en ink al 70 % (5.24 sobre blanco) y, al pasar el ratón, fondo cream con ink entero (13.6 · 11.9).
const CLASE_NO_ELEGIDA = 'bg-transparent text-sn-ink/70 hover:bg-sn-cream hover:text-sn-ink'
const CLASE_ELEGIDA = 'bg-sn-terra text-white hover:text-white'

export default function MarcoCuenta({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const segmentos = useSelectedLayoutSegments()
  const [me, setMe] = useState<MeCuenta | null>(null)
  const [estadoMe, setEstadoMe] = useState<EstadoMe>('cargando')
  const [saliendo, setSaliendo] = useState(false)
  const turno = useRef(0)
  const pedido = useRef(false)

  const pedirMe = useCallback(async () => {
    const mio = ++turno.current
    setEstadoMe('cargando')
    try {
      // La misma llamada de hoy (`usuario/perfil/page.tsx:94-98`): el proxy interno, con la sesión de NextAuth.
      const respuesta = await fetch('/api/auth/me', { headers: { 'Content-Type': 'application/json' } })
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
      const datos: unknown = await respuesta.json()
      if (mio !== turno.current) return
      setMe(datos && typeof datos === 'object' ? (datos as MeCuenta) : null)
      setEstadoMe('listo')
    } catch {
      if (mio === turno.current) setEstadoMe('error')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated' && !pedido.current) {
      pedido.current = true
      void pedirMe()
    }
  }, [status, router, pedirMe])

  const actualizarMe = useCallback((cambios: Partial<MeCuenta>) => {
    setMe((antes) => ({ ...(antes ?? {}), ...cambios }))
  }, [])

  const cuenta = useMemo<Cuenta>(
    () => ({ me, estadoMe, recargarMe: () => void pedirMe(), actualizarMe }),
    [me, estadoMe, pedirMe, actualizarMe],
  )

  // El saludo de hoy: `dashboardData?.usuario?.nombre || session?.user?.name || 'Usuario'` (`usuario/dashboard/page.tsx:364`); el `nombre`
  // del resumen y el de `/me` son la misma columna. Hasta que `/me` responde (bien o mal) no se pinta ningún nombre: así no cambia dos veces.
  const sabiendo = status === 'loading' || (status === 'authenticated' && estadoMe === 'cargando')
  let nombre: string | null = null
  let origen: OrigenNombre = 'cargando'
  if (!sabiendo) {
    if (me?.nombre) {
      nombre = me.nombre
      origen = 'me'
    } else if (session?.user?.name) {
      nombre = session.user.name
      origen = 'sesion'
    } else {
      nombre = TEXTO_USUARIO_SIN_NOMBRE
      origen = 'ninguno'
    }
  }
  // La tarjeta lateral: el nombre y el correo de Datos de hoy (`usuario/perfil/page.tsx:115-116`, `:329-330`).
  const nombreLateral = me?.nombre_completo || me?.nombre || session?.user?.name || ''
  const correoLateral = me?.email || session?.user?.email || ''

  const pestanaActual = segmentos[0] ?? null
  const enDetalle = segmentos.length > 1

  return (
    <ContextoCuenta.Provider value={cuenta}>
      <main data-testid="sn-mi-cuenta">
        <EncabezadoCuenta nombre={nombre} origen={origen} />
        <Contenedor ancho="medio" className="py-8 min-[861px]:py-12">
          <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[240px_minmax(0,1fr)]">
            <div
              data-testid="sn-mi-cuenta-lateral"
              className="self-start rounded-sn-tarjeta border border-solid border-sn-border bg-white p-[22px]"
            >
              <div className="mb-[18px] border-0 border-b border-solid border-sn-border pb-[18px]">
                {sabiendo ? (
                  <div aria-hidden="true" className="flex flex-col gap-2">
                    <span className="block h-[22px] w-3/4 rounded-sn-boton bg-sn-ink/10" />
                    <span className="block h-[11px] w-full rounded-sn-boton bg-sn-ink/10" />
                  </div>
                ) : (
                  <>
                    {nombreLateral && (
                      <p
                        data-testid="sn-mi-cuenta-lateral-nombre"
                        className="m-0 mb-1 font-sn-titulos text-sn-h5 font-normal text-sn-ink [overflow-wrap:anywhere]"
                      >
                        {nombreLateral}
                      </p>
                    )}
                    {correoLateral && (
                      <p
                        data-testid="sn-mi-cuenta-lateral-correo"
                        className="m-0 font-sn-mono text-sn-etiqueta font-normal tracking-normal text-sn-ink/70 [overflow-wrap:anywhere]"
                      >
                        {correoLateral}
                      </p>
                    )}
                  </>
                )}
              </div>
              <nav aria-label={ENLACE_MI_CUENTA.texto} data-testid="sn-mi-cuenta-menu">
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {PESTANAS_CUENTA.map((p) => {
                    const elegida = p.segmento !== null && p.segmento === pestanaActual
                    return (
                      <li key={p.id}>
                        <Link
                          href={p.href}
                          data-testid="sn-mi-cuenta-menu-enlace"
                          data-pestana={p.id}
                          aria-current={elegida ? (enDetalle ? 'true' : 'page') : undefined}
                          className={unirClases(CLASE_ENLACE, elegida ? CLASE_ELEGIDA : CLASE_NO_ELEGIDA, FOCO)}
                        >
                          {p.texto}
                        </Link>
                      </li>
                    )
                  })}
                  <li>
                    <button
                      type="button"
                      data-testid="sn-mi-cuenta-menu-salir"
                      disabled={saliendo}
                      onClick={() => {
                        if (saliendo) return
                        setSaliendo(true)
                        void signOut({ callbackUrl: '/' })
                      }}
                      className={unirClases(CLASE_ENLACE, CLASE_NO_ELEGIDA, 'cursor-pointer disabled:cursor-wait', FOCO)}
                    >
                      {TEXTO_CERRAR_SESION}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex min-w-0 flex-col gap-[22px]">{children}</div>
          </div>
        </Contenedor>
      </main>
    </ContextoCuenta.Provider>
  )
}
