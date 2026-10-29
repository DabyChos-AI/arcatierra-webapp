'use client'

// R15 v2 · F1: la cuenta en la cabecera del sitio nuevo (la maqueta pone un ícono). No se pierde nada del menú de usuario de hoy
// (TransparentHeader.tsx, DR-10): sin sesión lleva a «Iniciar Sesión»; con sesión abre las mismas ligas, «Panel de Administración» solo
// si la API dice que es empleado (la MISMA llamada de hoy: GET /api/auth/check-employee con el Bearer de la sesión; sesión, 30/min) y
// «Cerrar Sesión» con signOut({ callbackUrl: '/' }).
// Hidratación: useSession() empieza en 'loading' en el servidor y en el navegador; mientras tanto se pinta el mismo botón.
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { API_URL } from '@/lib/api'
import { ENLACE_PANEL, ENLACES_CUENTA, HREF_INICIAR_SESION } from './enlaces'

function IconoCuenta() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

type Props = {
  /** Clases del botón redondo (las pone la cabecera con los tokens de base). */
  claseBoton: string
  /** Clases del panel desplegable y de sus ligas. */
  clasePanel: string
  claseEnlace: string
}

export default function MenuCuenta({ claseBoton, clasePanel, claseEnlace }: Props) {
  const { data: session, status } = useSession()
  const [abierto, setAbierto] = useState(false)
  const [esEmpleado, setEsEmpleado] = useState(false)
  const idPanel = useId()
  const contenedorRef = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)
  const preguntado = useRef(false)
  const token = session?.accessToken

  // ¿Es empleado? Una sola vez por sesión, como hoy (solo responde sobre quien llama: la identidad va en el Authorization).
  useEffect(() => {
    if (status !== 'authenticated' || !token || preguntado.current) return
    preguntado.current = true
    let vigente = true
    fetch(`${API_URL}/api/auth/check-employee`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((datos: unknown) => {
        if (!vigente || !datos || typeof datos !== 'object') return
        setEsEmpleado((datos as { is_employee?: unknown }).is_employee === true)
      })
      .catch(() => {
        /* sin respuesta: no se pinta la liga del panel (el panel se protege en el middleware y en la API) */
      })
    return () => {
      vigente = false
    }
  }, [status, token])

  const cerrar = useCallback((regresarFoco: boolean) => {
    setAbierto(false)
    if (regresarFoco) botonRef.current?.focus()
  }, [])

  // Abierto: Escape cierra y regresa el foco; un clic fuera cierra.
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrar(true)
      }
    }
    const alTocar = (e: PointerEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) cerrar(false)
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('pointerdown', alTocar)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('pointerdown', alTocar)
    }
  }, [abierto, cerrar])

  if (status !== 'authenticated') {
    // 'loading' y 'unauthenticated' pintan lo mismo: la liga para entrar (sin sesión es a donde iría el clic).
    return (
      <div data-testid="sn-cabecera-cuenta" data-sesion={status === 'loading' ? 'cargando' : 'no'}>
        <Link href={HREF_INICIAR_SESION} data-testid="sn-cuenta-entrar" aria-label="Iniciar Sesión" className={claseBoton}>
          <IconoCuenta />
        </Link>
      </div>
    )
  }

  return (
    <div ref={contenedorRef} className="relative" data-testid="sn-cabecera-cuenta" data-sesion="si">
      <button
        ref={botonRef}
        type="button"
        data-testid="sn-cuenta-boton"
        aria-label="Mi cuenta"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((v) => !v)}
        className={claseBoton}
      >
        <IconoCuenta />
      </button>
      <div id={idPanel} data-testid="sn-cuenta-menu" hidden={!abierto} className={clasePanel}>
        <ul>
          {ENLACES_CUENTA.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                data-testid="sn-cuenta-enlace"
                data-href={e.href}
                className={claseEnlace}
                onClick={() => cerrar(false)}
              >
                {e.texto}
              </Link>
            </li>
          ))}
          {esEmpleado && (
            <li>
              <Link
                href={ENLACE_PANEL.href}
                data-testid="sn-cuenta-admin"
                data-href={ENLACE_PANEL.href}
                className={claseEnlace}
                onClick={() => cerrar(false)}
              >
                {ENLACE_PANEL.texto}
              </Link>
            </li>
          )}
          <li>
            <button
              type="button"
              data-testid="sn-cuenta-salir"
              className={`${claseEnlace} w-full text-left`}
              onClick={() => {
                cerrar(false)
                void signOut({ callbackUrl: '/' })
              }}
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
