'use client'

// R15 v2 · F6 (acceso): /auth/signin del sitio nuevo (maqueta `#cuenta-noauth`). Contrato v2 §8-F6, D-F6-04, D-F6-06, D-F6-09, D-F6-10 P-5;
// cadena-v2/f6/acceso-F6.md §2. Original = `src/app/auth/signin/page.tsx` (S): la misma conducta, las mismas llamadas y los mismos textos.
// - Las dos pestañas de hoy (S:160-182) son las dos tarjetas de la maqueta: la blanca lleva el formulario del modo elegido y la crema invita al
//   otro modo (S:382-402). Un solo estado para los dos formularios, como hoy (S:18-23): el correo y la contraseña pasan de un modo al otro.
// - Entrar: `signIn('credentials', { redirect: false })` → `destinoTrasLogin` (S:43-86). Google: `signIn('google')` con el destino por omisión,
//   como hoy (S:88-100; no usa el `callbackUrl`). Crear cuenta: el proxy de hoy `POST /api/auth/create-account` (S:102-136).
// - Avisos del alta en la página (`ui/AvisoEnLinea`) y no flotantes (D-F6-09 P-3); la longitud de la contraseña se revisa antes del POST con el
//   texto del proxy (P-4); al cambiar de modo el foco va al título de la tarjeta blanca (P-11).
// - La sesión se lee en el navegador (`getSession`, como hoy): nada del cliente en el servidor (D-F6-10 P-5).
import { getSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Falta from '@/components/sitio-nuevo/Falta'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import EncabezadoAcceso from './EncabezadoAcceso'
import IconoGoogle from './IconoGoogle'
import { HREF_SUSCRIBIRSE } from '@/components/sitio-nuevo/compras/compras'
import {
  DATOS_VACIOS,
  DESTINO_POR_OMISION,
  PASSWORD_MIN,
  TEXTO_ALTA_LISTA,
  TEXTO_ALTA_SIN_CONEXION,
  TEXTO_ENTRAR_FALLIDO,
  TEXTO_ENTRAR_SIN_CONEXION,
  cuerpoAlta,
  destinoTrasLogin,
  motivoAlta,
  textoErrorAlta,
  type DatosAcceso,
} from './reglas'

type Modo = 'entrar' | 'crear'
type CampoConError = 'password' | 'confirmPassword'

/** Liga suelta dentro de un texto (CONTRATO-BASE §5.7: el `<a>` de hoy hereda el terracota de `globals.css`, 4.16 sobre warm). */
const LIGA = unirClases('text-sn-ink underline hover:text-sn-terra', FOCO)

function destino(): string {
  return typeof window === 'undefined' ? DESTINO_POR_OMISION : destinoTrasLogin(window.location.search, window.location.origin)
}

export default function Entrar() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>('entrar')
  const [cargando, setCargando] = useState(false)
  const [datos, setDatos] = useState<DatosAcceso>(DATOS_VACIOS)
  const [errorEntrar, setErrorEntrar] = useState<string | null>(null)
  const [errorCrear, setErrorCrear] = useState<string | null>(null)
  const [errorCampo, setErrorCampo] = useState<{ campo: CampoConError; texto: string } | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const candado = useRef(false)
  const tituloRef = useRef<HTMLDivElement>(null)
  const cambioDeModo = useRef(false)
  const refs = {
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null),
  }

  // Ya con sesión: a su destino, como hoy (S:25-33).
  useEffect(() => {
    const revisarSesion = async () => {
      const sesion = await getSession()
      if (sesion) router.push(destino())
    }
    revisarSesion()
  }, [router])

  // P-11: después de cambiar de modo (no al cargar), el foco va al título de la tarjeta blanca.
  useEffect(() => {
    if (!cambioDeModo.current) return
    cambioDeModo.current = false
    tituloRef.current?.focus()
  }, [modo])

  const cambiarModo = (nuevo: Modo) => {
    if (nuevo === modo) return
    cambioDeModo.current = true
    setErrorCrear(null)
    setErrorCampo(null)
    if (nuevo === 'crear') setExito(null)
    setModo(nuevo)
  }

  const escribir = (campo: keyof DatosAcceso) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const valor = e.target.value
    setDatos((d) => ({ ...d, [campo]: valor }))
    if (errorCampo && errorCampo.campo === campo) setErrorCampo(null)
  }

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (candado.current) return
    candado.current = true
    setErrorEntrar(null)
    setExito(null)
    setCargando(true)
    try {
      const res = await signIn('credentials', { email: datos.email.trim(), password: datos.password, redirect: false })
      if (res?.ok) {
        router.push(destino())
        router.refresh()
      } else {
        setErrorEntrar(TEXTO_ENTRAR_FALLIDO)
      }
    } catch {
      setErrorEntrar(TEXTO_ENTRAR_SIN_CONEXION)
    } finally {
      candado.current = false
      setCargando(false)
    }
  }

  const entrarConGoogle = async () => {
    setCargando(true)
    try {
      await signIn('google', { callbackUrl: DESTINO_POR_OMISION, redirect: true })
    } catch (error) {
      console.error('Error signing in:', error)
    } finally {
      setCargando(false)
    }
  }

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (candado.current) return
    const motivo = motivoAlta(datos)
    if (motivo) {
      setErrorCampo(motivo)
      refs[motivo.campo].current?.focus()
      return
    }
    candado.current = true
    setErrorCrear(null)
    setCargando(true)
    try {
      const res = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpoAlta(datos)),
      })
      const cuerpo: unknown = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorCrear(textoErrorAlta(cuerpo))
        return
      }
      setExito(TEXTO_ALTA_LISTA)
      cambiarModo('entrar')
    } catch {
      setErrorCrear(TEXTO_ALTA_SIN_CONEXION)
    } finally {
      candado.current = false
      setCargando(false)
    }
  }

  const errorDe = (campo: CampoConError) => (errorCampo && errorCampo.campo === campo ? errorCampo.texto : undefined)

  return (
    <>
      <EncabezadoAcceso titulo="Arca Tierra" texto={modo === 'crear' ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'} />

      <Seccion fondo="warm" espacio="ninguno" className="py-8 min-[861px]:py-12">
        <Contenedor>
          <div className="mx-auto grid w-full max-w-[435px] grid-cols-1 gap-7 min-[861px]:max-w-[900px] min-[861px]:grid-cols-2">
            {modo === 'entrar' ? (
              <Tarjeta fondo="white" relleno="amplio" testId="sn-acceso-entrar">
                <div ref={tituloRef} tabIndex={-1} className={unirClases('rounded-sn-boton', FOCO)}>
                  <Titulo nivel={2} tamano="h5" testId="sn-acceso-entrar-titulo">
                    Iniciar Sesión
                  </Titulo>
                </div>
                <form onSubmit={entrar} data-testid="sn-acceso-entrar-form" className="mt-6 flex flex-col gap-4">
                  <Campo
                    etiqueta="Correo"
                    tipo="email"
                    requerido
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={datos.email}
                    onChange={escribir('email')}
                    testId="sn-acceso-entrar-correo"
                  />
                  <Campo
                    etiqueta="Contraseña"
                    tipo="password"
                    requerido
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={datos.password}
                    onChange={escribir('password')}
                    testId="sn-acceso-entrar-password"
                  />
                  <Boton type="submit" anchoCompleto cargando={cargando} textoCargando="Entrando…" testId="sn-acceso-entrar-enviar">
                    Iniciar sesión
                  </Boton>
                  {/* T-14 (F7, D-F7-14): los avisos van DEBAJO del botón; arriba, al quitarse con el reenvío, el botón subía y el 2.º clic de
                      un doble clic caía en «¿Olvidaste tu contraseña?». */}
                  {exito && (
                    <AvisoEnLinea tono="exito" testId="sn-acceso-entrar-exito">
                      {exito}
                    </AvisoEnLinea>
                  )}
                  {errorEntrar && (
                    <AvisoEnLinea tono="error" testId="sn-acceso-entrar-error">
                      {errorEntrar}
                    </AvisoEnLinea>
                  )}
                  <div className="text-center">
                    <Boton variante="texto" tamano="chico" href="/auth/recuperar" testId="sn-acceso-entrar-olvide">
                      ¿Olvidaste tu contraseña?
                    </Boton>
                  </div>
                </form>
              </Tarjeta>
            ) : (
              <Tarjeta fondo="white" relleno="amplio" testId="sn-acceso-crear">
                <div ref={tituloRef} tabIndex={-1} className={unirClases('rounded-sn-boton', FOCO)}>
                  <Titulo nivel={2} tamano="h5" testId="sn-acceso-crear-titulo">
                    Crear Cuenta
                  </Titulo>
                </div>
                <form onSubmit={crear} data-testid="sn-acceso-crear-form" className="mt-6 flex flex-col gap-4">
                  <Campo
                    etiqueta="Nombre completo"
                    requerido
                    autoComplete="name"
                    placeholder="Tu nombre completo"
                    value={datos.name}
                    onChange={escribir('name')}
                    testId="sn-acceso-crear-nombre"
                  />
                  <Campo
                    etiqueta="Email"
                    tipo="email"
                    requerido
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={datos.email}
                    onChange={escribir('email')}
                    testId="sn-acceso-crear-correo"
                  />
                  <Campo
                    ref={refs.password}
                    etiqueta="Contraseña"
                    tipo="password"
                    requerido
                    autoComplete="new-password"
                    ayuda={`Mínimo ${PASSWORD_MIN} caracteres.`}
                    error={errorDe('password')}
                    value={datos.password}
                    onChange={escribir('password')}
                    testId="sn-acceso-crear-password"
                  />
                  <Campo
                    ref={refs.confirmPassword}
                    etiqueta="Confirmar contraseña"
                    tipo="password"
                    requerido
                    autoComplete="new-password"
                    placeholder="Confirma tu contraseña"
                    error={errorDe('confirmPassword')}
                    value={datos.confirmPassword}
                    onChange={escribir('confirmPassword')}
                    testId="sn-acceso-crear-confirmar"
                  />
                  <Boton type="submit" anchoCompleto cargando={cargando} testId="sn-acceso-crear-enviar">
                    Crear Cuenta
                  </Boton>
                  {/* T-14 (F7, D-F7-14): el aviso va DEBAJO del botón (no lo mueve al quitarse). */}
                  {errorCrear && (
                    <AvisoEnLinea tono="error" testId="sn-acceso-crear-error">
                      {errorCrear}
                    </AvisoEnLinea>
                  )}
                </form>
              </Tarjeta>
            )}

            {/* La tarjeta crema: la invitación al otro modo (S:382-402). Sin formulario: los campos no van sobre cream (CONTRATO-BASE §5.8). */}
            <div data-testid="sn-acceso-cambio" data-modo={modo === 'entrar' ? 'crear' : 'entrar'} className="flex">
              <Tarjeta fondo="cream" relleno="amplio" className="flex w-full flex-col justify-center">
                <Titulo nivel={2} tamano="h5" testId="sn-acceso-cambio-titulo">
                  {modo === 'entrar' ? '¿Eres nuevo en Arca Tierra?' : '¿Ya tienes cuenta?'}
                </Titulo>
                <div className="mt-6">
                  <Boton
                    variante="contorno"
                    sobreCrema
                    flecha
                    anchoCompleto
                    onClick={() => cambiarModo(modo === 'entrar' ? 'crear' : 'entrar')}
                    testId="sn-acceso-cambio-boton"
                  >
                    {modo === 'entrar' ? 'Crea tu cuenta' : 'Inicia sesión aquí'}
                  </Boton>
                </div>
              </Tarjeta>
            </div>
          </div>

          {/* Otras formas de entrar y los legales de hoy (S:326-377), debajo de las tarjetas como el «seguir como invitado» de la maqueta. */}
          <div data-testid="sn-acceso-otras" className="mx-auto mt-10 flex w-full max-w-[435px] flex-col items-stretch gap-4">
            <div data-testid="sn-acceso-otras-separador" className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px flex-1 bg-sn-border" />
              <Texto as="span" tamano="chico" tono="ink-suave">
                o continúa con
              </Texto>
              <span aria-hidden="true" className="h-px flex-1 bg-sn-border" />
            </div>
            <Boton variante="contorno" anchoCompleto cargando={cargando} onClick={entrarConGoogle} testId="sn-acceso-otras-google">
              <span className="inline-flex items-center gap-3">
                <IconoGoogle />
                Continuar con Google
              </span>
            </Boton>
            <Texto tamano="chico" className="text-center">
              <Falta
                que="entrar con Google en el link de revisión: alta de su dirección de regreso en la consola de Google"
                quien="David"
              />
            </Texto>
            <div className="text-center">
              {/* D-F7-15: `/suscripciones` lleva encendido a la pestaña «Canasta lista» de la tienda nueva; la liga va directo ahí. */}
              <Boton variante="texto" href={HREF_SUSCRIBIRSE} deshabilitado={cargando} testId="sn-acceso-otras-invitado">
                Continuar sin cuenta
              </Boton>
            </div>
            <Texto tamano="chico" tono="ink-suave" testId="sn-acceso-legal" className="text-center">
              Al iniciar sesión, aceptas nuestros{' '}
              <Link href="/terminos" data-testid="sn-acceso-legal-terminos" className={LIGA}>
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link href="/privacidad" data-testid="sn-acceso-legal-privacidad" className={LIGA}>
                Política de Privacidad
              </Link>
            </Texto>
          </div>
        </Contenedor>
      </Seccion>
    </>
  )
}
