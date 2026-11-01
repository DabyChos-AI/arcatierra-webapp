'use client'

// R15 v2 · F5 (contacto): el formulario de /contacto (maqueta `.contact-form`) = el de hoy. D-F5-04, D-F5-11 (P-6, P-7);
// cadena-v2/f5/contacto-F5.md §2.2 y §6.
// - Misma ruta, mismo cuerpo, misma validación y mismos textos que hoy (`src/app/contacto/page.tsx`): la lógica, en `mensaje.ts`.
// - Textos de hoy: «Envíanos un mensaje» (`:155`), «Nombre» (`:160`), «Correo electrónico» (`:176`), «Asunto (opcional)» (`:194-195`),
//   «Mensaje» (`:211`), «He leído y acepto la» + «Política de Privacidad» → /privacidad (`:241-243`), la trampa «Sitio web» (`:246-259`),
//   «Enviando…» / «Enviar mensaje» (`:267`). El asunto es texto libre opcional, como hoy (P-6), no la lista de la maqueta.
// - El botón se puede pulsar siempre: si falta algo, dice qué en su campo (`role="alert"`) y lo enfoca; un solo envío aunque se pulse dos
//   veces (candado antes del await). Lo único distinto de hoy: el motivo y el resultado salen en la página en lugar del aviso flotante (P-7).
// - La casilla es la de hoy: la API la exige (`acepto_privacidad: Literal[True]`, `routers/contacto.py:52`); la maqueta no la trae.
// Diseño de la maqueta (medido, `.contact-form`): directo sobre el fondo warm (CONTRATO-BASE §5.8 lo permite), sin panel; 500 de ancho centrado a
// 1440, una columna, 80 abajo; botón píldora a todo el ancho.
import Link from 'next/link'
import { useId, useRef, useState } from 'react'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Casilla from '@/components/sitio-nuevo/ui/Casilla'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import {
  FORM_VACIO,
  MAXIMO,
  campoInvalido,
  cuerpoMensaje,
  enviarMensaje,
  type CampoContacto,
  type FormContacto,
} from './mensaje'

const ID_TITULO = 'sn-contacto-formulario-titulo'
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export default function FormularioContacto() {
  const idTrampa = useId()
  const [form, setForm] = useState<FormContacto>(FORM_VACIO)
  const [acepto, setAcepto] = useState(false)
  const [sitio, setSitio] = useState('')
  const [errores, setErrores] = useState<Partial<Record<CampoContacto, string>>>({})
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const candado = useRef(false)
  const refs = {
    nombre: useRef<Control>(null),
    email: useRef<Control>(null),
    asunto: useRef<Control>(null),
    mensaje: useRef<Control>(null),
    privacidad: useRef<HTMLInputElement>(null),
  }

  const cambiar = (campo: keyof FormContacto) => (e: React.ChangeEvent<Control>) => {
    const valor = e.target.value
    setForm((f) => ({ ...f, [campo]: valor }))
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }))
    setExito(null)
  }

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (candado.current) return
    const falta = campoInvalido(form, acepto)
    if (falta) {
      setErrores({ [falta.campo]: falta.motivo })
      setExito(null)
      refs[falta.campo].current?.focus()
      return
    }
    candado.current = true
    setEnviando(true)
    setErrorEnvio(null)
    setExito(null)
    try {
      const r = await enviarMensaje(cuerpoMensaje(form, sitio))
      if (r.ok) {
        setExito(r.texto)
        setForm(FORM_VACIO)
        setAcepto(false)
        setErrores({})
      } else {
        setErrorEnvio(r.texto)
      }
    } finally {
      candado.current = false
      setEnviando(false)
    }
  }

  return (
    <Seccion fondo="warm" espacio="ninguno" testId="sn-contacto-formulario" etiquetadaPor={ID_TITULO} className="pb-sn-seccion-movil min-[861px]:pb-sn-seccion">
      <Contenedor ancho="parrafo">
        <div className="mx-auto max-w-[500px]">
          <Titulo nivel={2} tamano="h4" id={ID_TITULO} testId={ID_TITULO} className="mb-8">
            Envíanos un mensaje
          </Titulo>
          <form data-testid="sn-contacto-formulario-form" onSubmit={enviar} noValidate className="flex flex-col gap-5">
            <Campo
              ref={refs.nombre}
              etiqueta="Nombre"
              name="nombre"
              autoComplete="name"
              maxLength={MAXIMO.nombre}
              value={form.nombre}
              onChange={cambiar('nombre')}
              error={errores.nombre}
              testId="sn-contacto-formulario-nombre"
            />
            <Campo
              ref={refs.email}
              etiqueta="Correo electrónico"
              tipo="email"
              name="email"
              autoComplete="email"
              maxLength={MAXIMO.email}
              value={form.email}
              onChange={cambiar('email')}
              error={errores.email}
              testId="sn-contacto-formulario-correo"
            />
            <Campo
              ref={refs.asunto}
              etiqueta="Asunto (opcional)"
              name="asunto"
              maxLength={MAXIMO.asunto}
              value={form.asunto}
              onChange={cambiar('asunto')}
              testId="sn-contacto-formulario-asunto"
            />
            <Campo
              ref={refs.mensaje}
              etiqueta="Mensaje"
              tipo="textarea"
              name="mensaje"
              filas={5}
              maxLength={MAXIMO.mensaje}
              value={form.mensaje}
              onChange={cambiar('mensaje')}
              error={errores.mensaje}
              testId="sn-contacto-formulario-mensaje"
            />
            <Casilla
              ref={refs.privacidad}
              name="privacidad"
              checked={acepto}
              onChange={(ev) => {
                setAcepto(ev.target.checked)
                if (errores.privacidad) setErrores((er) => ({ ...er, privacidad: undefined }))
                setExito(null)
              }}
              error={errores.privacidad}
              testId="sn-contacto-formulario-privacidad"
            >
              He leído y acepto la{' '}
              <Link
                href="/privacidad"
                data-testid="sn-contacto-formulario-privacidad-liga"
                className={unirClases('text-sn-ink underline hover:text-sn-terra', FOCO)}
              >
                Política de Privacidad
              </Link>
            </Casilla>

            {/* Trampa: invisible para personas y lectores de pantalla; un bot que la llena no deja nada guardado (routers/contacto.py:71). */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${idTrampa}-sitio`}>Sitio web</label>
              <input
                id={`${idTrampa}-sitio`}
                type="text"
                name="sitio"
                data-testid="sn-contacto-formulario-sitio"
                tabIndex={-1}
                autoComplete="off"
                value={sitio}
                onChange={(ev) => setSitio(ev.target.value)}
              />
            </div>

            {errorEnvio && (
              <AvisoEnLinea tono="error" testId="sn-contacto-formulario-error">
                {errorEnvio}
              </AvisoEnLinea>
            )}
            {exito && (
              <AvisoEnLinea tono="exito" testId="sn-contacto-formulario-exito">
                {exito}
              </AvisoEnLinea>
            )}
            <Boton
              type="submit"
              anchoCompleto
              flecha
              cargando={enviando}
              textoCargando="Enviando…"
              testId="sn-contacto-formulario-enviar"
            >
              Enviar mensaje
            </Boton>
          </form>
        </div>
      </Contenedor>
    </Seccion>
  )
}
