'use client'

// R15 v2 · F6 (acceso): /auth/restablecer del sitio nuevo (la liga del correo, `/auth/restablecer?token=…`). Contrato v2 §8-F6, D-F6-04, D-F6-09,
// D-F6-10 P-5; cadena-v2/f6/acceso-F6.md §4.2. Original = `src/app/auth/restablecer/page.tsx` (T), R11b · ACC1 y su C19:
// EL TOKEN ES UNA CREDENCIAL. Se lee de la URL UNA vez (el lector dentro de `<Suspense>`), se borra de la barra con `history.replaceState`, vive
// solo en la memoria del componente, viaja SOLO en el cuerpo de `POST ${API_URL}/api/auth/restablecer` (nunca en la URL de la API) con
// `referrerPolicy: 'no-referrer'`, y no se imprime en ningún lado (ni consola, ni atributos, ni testids, ni avisos). La `metadata` de la página
// pone `referrer: 'no-referrer'` para TODO lo que pide el documento (también el armazón). Textos importados de `src/app/auth/recuperar/textos.ts`.
import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { HREF_INICIAR_SESION } from '@/components/sitio-nuevo/armazon/enlaces'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import { API_URL } from '@/lib/api'
import type { RestablecerPayload } from '@/types/cuenta'
import { TEXTO_SIN_CONEXION, TEXTO_SIN_TOKEN, motivoPassword } from '@/app/auth/recuperar/textos'
import EncabezadoAcceso from './EncabezadoAcceso'
import { PASSWORD_MAX, PASSWORD_MIN, esErrorDeEnlace, resultadoRestablecer, type ErrorRestablecer } from './reglas'

/** Liga suelta dentro de un aviso (CONTRATO-BASE §5.7). */
const LIGA = unirClases('font-sn-texto font-medium text-sn-ink underline hover:text-sn-terra', FOCO)

/**
 * El único que llama `useSearchParams()` (T:35-45): le pasa el token al padre UNA vez y lo borra de la barra de direcciones (C19): queda solo
 * en la memoria del componente, no en el historial ni en capturas. Si la persona recarga, ya no hay token: el aviso «sin token».
 */
function LectorToken({ onToken }: { onToken: (token: string) => void }) {
  const token = useSearchParams().get('token') ?? ''
  const leido = useRef(false)
  useEffect(() => {
    if (leido.current) return
    leido.current = true
    onToken(token.trim())
    if (token) window.history.replaceState(window.history.state, '', window.location.pathname)
  }, [token, onToken])
  return null
}

export default function Restablecer() {
  // undefined = todavía no se lee la URL; '' = la liga no trae token (T:51).
  const [token, setToken] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorRestablecer | null>(null)
  const [listo, setListo] = useState<string | null>(null)
  const candado = useRef(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (candado.current || !token) return
    const motivo = motivoPassword(password, confirmacion)
    if (motivo) {
      setError({ codigo: 'local', texto: motivo })
      return
    }
    candado.current = true
    setEnviando(true)
    setError(null)
    try {
      const cuerpo: RestablecerPayload = { token, password }
      const res = await fetch(`${API_URL}/api/auth/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      })
      const datos: unknown = await res.json().catch(() => null)
      const r = resultadoRestablecer(res.ok, res.status, datos)
      if (r.tipo === 'listo') {
        setListo(r.texto)
        setPassword('')
        setConfirmacion('')
      } else {
        setError(r.error)
      }
    } catch {
      setError({ codigo: 'servidor', texto: TEXTO_SIN_CONEXION })
    } finally {
      candado.current = false
      setEnviando(false)
    }
  }

  const estado = token === undefined ? 'leyendo' : token === '' ? 'sin-token' : listo ? 'listo' : 'formulario'

  return (
    <>
      <Suspense fallback={null}>
        <LectorToken onToken={setToken} />
      </Suspense>
      <EncabezadoAcceso titulo="Crear contraseña nueva" />
      <Seccion fondo="warm" espacio="ninguno" className="py-8 min-[861px]:py-12">
        <Contenedor>
          <div data-testid="sn-acceso-restablecer" data-estado={estado} className="mx-auto w-full max-w-[435px]">
            <Tarjeta fondo="white" relleno="amplio">
              {estado === 'sin-token' && (
                <div data-testid="sn-acceso-restablecer-sin-token">
                  <AvisoEnLinea tono="error" as="div">
                    <p className="m-0">{TEXTO_SIN_TOKEN}</p>
                    <p className="m-0 mt-3">
                      <Link href="/auth/recuperar" data-testid="sn-acceso-restablecer-pedir" className={LIGA}>
                        Pedir un enlace nuevo
                      </Link>
                    </p>
                  </AvisoEnLinea>
                </div>
              )}

              {estado === 'listo' && (
                <div className="flex flex-col gap-4">
                  <AvisoEnLinea tono="exito" testId="sn-acceso-restablecer-listo">
                    {listo}
                  </AvisoEnLinea>
                  <Boton href={HREF_INICIAR_SESION} anchoCompleto testId="sn-acceso-restablecer-entrar">
                    Iniciar sesión
                  </Boton>
                </div>
              )}

              {estado === 'formulario' && (
                <form onSubmit={enviar} noValidate data-testid="sn-acceso-restablecer-form" className="flex flex-col gap-4">
                  <Campo
                    etiqueta="Contraseña nueva"
                    tipo="password"
                    autoComplete="new-password"
                    maxLength={PASSWORD_MAX}
                    ayuda={`Mínimo ${PASSWORD_MIN} caracteres.`}
                    value={password}
                    onChange={(ev) => {
                      setPassword(ev.target.value)
                      if (error?.codigo === 'local') setError(null)
                    }}
                    testId="sn-acceso-restablecer-password"
                  />
                  <Campo
                    etiqueta="Escríbela otra vez"
                    tipo="password"
                    autoComplete="new-password"
                    maxLength={PASSWORD_MAX}
                    value={confirmacion}
                    onChange={(ev) => {
                      setConfirmacion(ev.target.value)
                      if (error?.codigo === 'local') setError(null)
                    }}
                    testId="sn-acceso-restablecer-confirmar"
                  />
                  <Boton type="submit" anchoCompleto cargando={enviando} textoCargando="Guardando…" testId="sn-acceso-restablecer-enviar">
                    Guardar contraseña
                  </Boton>
                  {/* T-14 (F7, D-F7-14): el aviso va DEBAJO del botón; arriba, al quitarse con el reenvío, el botón subía hacia «Volver a
                      iniciar sesión». */}
                  {error && (
                    <div data-testid="sn-acceso-restablecer-error" data-codigo={error.codigo}>
                      <AvisoEnLinea tono="error" as="div">
                        <p className="m-0">{error.texto}</p>
                        {esErrorDeEnlace(error) && (
                          <p className="m-0 mt-2">
                            <Link href="/auth/recuperar" data-testid="sn-acceso-restablecer-pedir" className={LIGA}>
                              Pedir un enlace nuevo
                            </Link>
                          </p>
                        )}
                      </AvisoEnLinea>
                    </div>
                  )}
                </form>
              )}

              {estado !== 'listo' && (
                <div className={unirClases('text-center', estado !== 'leyendo' && 'mt-6')}>
                  <Boton variante="texto" tamano="chico" href={HREF_INICIAR_SESION} testId="sn-acceso-volver">
                    Volver a iniciar sesión
                  </Boton>
                </div>
              )}
            </Tarjeta>
          </div>
        </Contenedor>
      </Seccion>
    </>
  )
}
