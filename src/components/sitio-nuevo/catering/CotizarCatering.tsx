'use client'

// R15 v2 · F4 (catering): bloque 3 de /catering, el formulario «Cotiza tu evento». Contrato v2 §9-F4 D-F4-04, D-F4-09 (P-2, P-3, P-10),
// D-F4-10; cadena-v2/f4/catering-F4.md §2.3 y §5.1.
// - Es el formulario de hoy de /catering (`components/catering/QuoteRequestModal.tsx`): los mismos 8 campos con sus etiquetas, el teléfono,
//   el tipo y los invitados obligatorios (requeridos del navegador, como hoy), la misma revisión de nombre y correo con sus textos al enviar
//   y la misma ruta. El lugar va en `ubicacion` (cuerpo = subconjunto de `app/catering/contacto/page.tsx:78-90`): la lógica, en `solicitud.ts`.
// - Textos de hoy: «Cotiza tu evento» (`QuoteRequestModal.tsx:172`), «Cuéntanos sobre tu evento» (`contacto/page.tsx:138`), la frase de
//   `contacto/page.tsx:141` con la marca de David en lugar del plazo (PROM1 abierta, D-F4-09 P-2), «Solicitar cotización gratuita» y
//   «Enviando…» (`QuoteRequestModal.tsx:367`), «¡Gracias por contactarnos!» (`:376`), «Enviar otra solicitud» (`contacto/page.tsx:367`).
// - Un solo envío aunque se pulse dos veces (candado antes del await); el error no borra lo escrito; el éxito pinta el mensaje de la API.
// Medido en la maqueta: fondo warm; rejilla 494/642 con hueco de 64; el panel de la maqueta es cream, aquí blanco (las piezas de formulario
// van sobre warm o blanco, CONTRATO-BASE §5.8; D-F4-09 P-9); campos de dos en dos; botón recto a todo el ancho. Hasta 860 apilado.
import { useRef, useState } from 'react'
import Falta from '@/components/sitio-nuevo/Falta'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import {
  COTIZACION_VACIA,
  TEXTO_RECIBIDA,
  TIPOS_COTIZACION,
  cuerpoCotizacion,
  enviarSolicitud,
  errorCotizacion,
  textoErrorCotizacion,
  type CampoCotizacion,
  type FormCotizacion,
} from './solicitud'

const ID_TITULO = 'sn-catering-cotizar-titulo'
const OPCIONES_TIPO = [{ valor: '', etiqueta: 'Selecciona una opción' }, ...TIPOS_COTIZACION.map((t) => ({ valor: t, etiqueta: t }))]
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export default function CotizarCatering() {
  const [form, setForm] = useState<FormCotizacion>(COTIZACION_VACIA)
  const [errores, setErrores] = useState<Partial<Record<CampoCotizacion, string>>>({})
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState<string | null>(null)
  const candado = useRef(false)
  const nombreRef = useRef<Control>(null)
  const correoRef = useRef<Control>(null)
  const exitoRef = useRef<HTMLHeadingElement>(null)

  const cambiar = (campo: CampoCotizacion) => (e: React.ChangeEvent<Control>) => {
    const valor = e.target.value
    setForm((f) => ({ ...f, [campo]: valor }))
    if (errores[campo]) setErrores((er) => ({ ...er, [campo]: undefined }))
  }

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (candado.current) return
    const falta = errorCotizacion(form)
    if (falta) {
      setErrores({ [falta.campo]: falta.motivo })
      ;(falta.campo === 'nombre' ? nombreRef : correoRef).current?.focus()
      return
    }
    candado.current = true
    setEnviando(true)
    setErrorEnvio(null)
    try {
      const r = await enviarSolicitud(cuerpoCotizacion(form))
      if (r.ok) {
        setExito(r.mensaje ?? TEXTO_RECIBIDA)
        setForm(COTIZACION_VACIA)
        setErrores({})
        requestAnimationFrame(() => exitoRef.current?.focus())
      } else {
        setErrorEnvio(textoErrorCotizacion(r))
      }
    } finally {
      candado.current = false
      setEnviando(false)
    }
  }

  return (
    <Seccion testId="sn-catering-cotizar" id="cotizar" etiquetadaPor={ID_TITULO} className="scroll-mt-20">
      <Contenedor>
        <Etiqueta tamano="eyebrow" tono="terra" testId="sn-catering-cotizar-etiqueta" className="mb-3.5">
          Cotiza tu evento
        </Etiqueta>
        <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[minmax(0,494fr)_minmax(0,642fr)] min-[861px]:gap-16">
          <div>
            <Titulo nivel={2} id={ID_TITULO} testId={ID_TITULO} className="mb-[18px]">
              Cuéntanos sobre tu evento
            </Titulo>
            <Texto peso="ligero" testId="sn-catering-cotizar-texto">
              Nuestro equipo te contactará en menos de{' '}
              <Falta que="tiempo de respuesta a una solicitud de catering" quien="David" /> para cotizar.
            </Texto>
          </div>

          <div className="rounded-sn-tarjeta border border-solid border-sn-border bg-white px-6 py-7 min-[861px]:px-8 min-[861px]:py-9">
            {exito !== null ? (
              <div data-testid="sn-catering-cotizar-exito" role="status" className="flex flex-col items-start gap-4">
                <Titulo nivel={3} tamano="h5" testId="sn-catering-cotizar-exito-titulo">
                  <span ref={exitoRef} tabIndex={-1} className="outline-none">
                    ¡Gracias por contactarnos!
                  </span>
                </Titulo>
                <Texto testId="sn-catering-cotizar-exito-mensaje">{exito}</Texto>
                <Boton variante="contorno" forma="recta" onClick={() => setExito(null)} testId="sn-catering-cotizar-exito-otra">
                  Enviar otra solicitud
                </Boton>
              </div>
            ) : (
              <form data-testid="sn-catering-cotizar-formulario" onSubmit={enviar} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <Campo
                    ref={nombreRef}
                    etiqueta="Nombre completo *"
                    name="name"
                    value={form.nombre}
                    onChange={cambiar('nombre')}
                    requerido
                    autoComplete="name"
                    error={errores.nombre}
                    testId="sn-catering-cotizar-nombre"
                  />
                  <Campo
                    ref={correoRef}
                    etiqueta="Correo electrónico *"
                    tipo="email"
                    name="email"
                    value={form.correo}
                    onChange={cambiar('correo')}
                    requerido
                    autoComplete="email"
                    error={errores.correo}
                    testId="sn-catering-cotizar-correo"
                  />
                  <Campo
                    etiqueta="Teléfono *"
                    tipo="tel"
                    name="phone"
                    value={form.telefono}
                    onChange={cambiar('telefono')}
                    requerido
                    autoComplete="tel"
                    testId="sn-catering-cotizar-telefono"
                  />
                  <Campo
                    etiqueta="Tipo de evento *"
                    tipo="select"
                    name="eventType"
                    opciones={OPCIONES_TIPO}
                    value={form.tipo}
                    onChange={cambiar('tipo')}
                    requerido
                    testId="sn-catering-cotizar-tipo"
                  />
                  <Campo
                    etiqueta="Número de invitados *"
                    tipo="number"
                    name="guestCount"
                    min={1}
                    value={form.personas}
                    onChange={cambiar('personas')}
                    requerido
                    testId="sn-catering-cotizar-personas"
                  />
                  <Campo
                    etiqueta="Fecha del evento"
                    tipo="date"
                    name="eventDate"
                    value={form.fecha}
                    onChange={cambiar('fecha')}
                    testId="sn-catering-cotizar-fecha"
                  />
                </div>
                <Campo
                  etiqueta="Lugar del evento"
                  name="eventLocation"
                  placeholder="Ciudad o ubicación"
                  value={form.lugar}
                  onChange={cambiar('lugar')}
                  testId="sn-catering-cotizar-lugar"
                />
                <Campo
                  etiqueta="Detalles adicionales"
                  tipo="textarea"
                  name="message"
                  filas={3}
                  placeholder="Cuéntanos más sobre tu evento, requerimientos especiales, etc."
                  value={form.mensaje}
                  onChange={cambiar('mensaje')}
                  testId="sn-catering-cotizar-mensaje"
                />
                {errorEnvio && (
                  <AvisoEnLinea tono="error" testId="sn-catering-cotizar-error">
                    {errorEnvio}
                  </AvisoEnLinea>
                )}
                <Boton
                  type="submit"
                  forma="recta"
                  anchoCompleto
                  flecha
                  cargando={enviando}
                  textoCargando="Enviando…"
                  testId="sn-catering-cotizar-enviar"
                  className="mt-1"
                >
                  Solicitar cotización gratuita
                </Boton>
              </form>
            )}
          </div>
        </div>
      </Contenedor>
    </Seccion>
  )
}
