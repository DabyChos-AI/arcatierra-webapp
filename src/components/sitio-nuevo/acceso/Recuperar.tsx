'use client'

// R15 v2 · F6 (acceso): /auth/recuperar del sitio nuevo (la maqueta no la tiene: el armado de /auth/signin, D-F6-09 P-9). Contrato v2 §8-F6,
// D-F6-04, D-F6-09, D-F6-10 P-5; cadena-v2/f6/acceso-F6.md §4.1. Original = `src/app/auth/recuperar/page.tsx` (R), R11b · ACC1: POST público
// `${API_URL}/api/auth/recuperar` {email}, directo (el límite por IP necesita la IP real del cliente). El backend responde SIEMPRE lo mismo: se
// muestra su `message` tal cual y el formulario se va (no revela quién tiene cuenta). Textos importados de `src/app/auth/recuperar/textos.ts`.
// F7 (arreglos, T-14, D-F7-14): el aviso de error va debajo del botón de enviar, para que no lo mueva al quitarse.
import { useRef, useState } from 'react'
import { HREF_INICIAR_SESION } from '@/components/sitio-nuevo/armazon/enlaces'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import { API_URL } from '@/lib/api'
import { RECUPERAR_MINUTOS, type RecuperarPayload } from '@/types/cuenta'
import { TEXTO_CORREO_INVALIDO, TEXTO_SIN_CONEXION, correoValido } from '@/app/auth/recuperar/textos'
import EncabezadoAcceso from './EncabezadoAcceso'
import { resultadoRecuperar } from './reglas'

/** `maxLength` del correo de hoy (R:103) = `RecuperarRequest.email` `max_length=255` (`routers/auth.py`). No se pinta. */
const MAXIMO_CORREO = 255

export default function Recuperar() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const candado = useRef(false)
  const correoRef = useRef<HTMLInputElement>(null)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (candado.current) return
    const correo = email.trim()
    if (!correoValido(correo)) {
      setError(null)
      setErrorCorreo(TEXTO_CORREO_INVALIDO)
      correoRef.current?.focus()
      return
    }
    candado.current = true
    setEnviando(true)
    setError(null)
    setErrorCorreo(null)
    try {
      const cuerpo: RecuperarPayload = { email: correo }
      const res = await fetch(`${API_URL}/api/auth/recuperar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        cache: 'no-store',
      })
      const datos: unknown = await res.json().catch(() => null)
      const r = resultadoRecuperar(res.ok, res.status, datos)
      if (r.tipo === 'enviado') setMensaje(r.texto)
      else if (r.correo) setErrorCorreo(r.texto)
      else setError(r.texto)
    } catch {
      setError(TEXTO_SIN_CONEXION)
    } finally {
      candado.current = false
      setEnviando(false)
    }
  }

  return (
    <>
      <EncabezadoAcceso
        titulo="Recuperar contraseña"
        texto={
          mensaje
            ? undefined
            : `Escribe el correo de tu cuenta y te mandamos un enlace para crear una contraseña nueva. El enlace dura ${RECUPERAR_MINUTOS} minutos.`
        }
      />
      <Seccion fondo="warm" espacio="ninguno" className="py-8 min-[861px]:py-12">
        <Contenedor>
          <div className="mx-auto w-full max-w-[435px]">
            <Tarjeta fondo="white" relleno="amplio" testId="sn-acceso-recuperar">
              {mensaje ? (
                <AvisoEnLinea tono="exito" testId="sn-acceso-recuperar-enviado">
                  {mensaje}
                </AvisoEnLinea>
              ) : (
                <form onSubmit={enviar} noValidate data-testid="sn-acceso-recuperar-form" className="flex flex-col gap-4">
                  <Campo
                    ref={correoRef}
                    etiqueta="Correo"
                    tipo="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={MAXIMO_CORREO}
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(ev) => {
                      setEmail(ev.target.value)
                      setErrorCorreo(null)
                      setError(null)
                    }}
                    error={errorCorreo ?? undefined}
                    testId="sn-acceso-recuperar-correo"
                  />
                  <Boton type="submit" anchoCompleto cargando={enviando} textoCargando="Enviando…" testId="sn-acceso-recuperar-enviar">
                    Mandarme el enlace
                  </Boton>
                  {/* T-14 (F7, D-F7-14): el aviso va DEBAJO del botón; si fuera arriba, al quitarse con el reenvío el botón subiría y el
                      2.º clic de un doble clic caería en «Volver a iniciar sesión». */}
                  {error && (
                    <AvisoEnLinea tono="error" testId="sn-acceso-recuperar-error">
                      {error}
                    </AvisoEnLinea>
                  )}
                </form>
              )}
              <div className="mt-6 text-center">
                <Boton variante="texto" tamano="chico" href={HREF_INICIAR_SESION} testId="sn-acceso-volver">
                  Volver a iniciar sesión
                </Boton>
              </div>
            </Tarjeta>
          </div>
        </Contenedor>
      </Seccion>
    </>
  )
}
