'use client'

// R15 v2 · F4 (catering): la propuesta corporativa de hoy en el sitio nuevo (DR-10: la maqueta no la trae y no se pierde). Contrato v2
// §9-F4 D-F4-09 (P-5 B, P-2, P-7, P-10), D-F4-10; cadena-v2/f4/catering-F4.md §5.2.
// Es `components/catering/CorporateRequestModal.tsx` reescrita con `ui/Dialogo` y `ui/Campo`: los mismos campos, etiquetas, opciones,
// topes, revisión y textos, el mismo cuerpo y la misma ruta (la lógica, en `solicitud.ts`, con su prueba contra la de hoy). Cambia solo cómo
// avisa: el motivo sale en el campo y el error del envío dentro del diálogo, no en un aviso flotante. El éxito pinta el mensaje de la API
// (o el respaldo de hoy, `CorporateRequestModal.tsx:56`); el texto de hoy de `:236` trae el plazo de respuesta y no se escribe (PROM1).
// Títulos de hoy: «Solicitar Propuesta Corporativa» / «Solicitud Enviada» (`:216`), «¡Gracias por tu interés!» (`:234`), «Cerrar» (`:221`, `:253`).
// Al cerrar, el formulario se vacía (como hoy, `:130-138`): el diálogo cerrado no está en el DOM.
import { useRef, useState } from 'react'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Dialogo from '@/components/sitio-nuevo/ui/Dialogo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import {
  ASISTENTES,
  CORPORATIVO_VACIO,
  MAXIMO_CORPORATIVO,
  TEXTO_RECIBIDA,
  TIPOS_CORPORATIVO,
  campoInvalidoCorporativo,
  cuerpoCorporativo,
  enviarSolicitud,
  textoErrorCorporativo,
  type CampoCorporativo,
  type FormCorporativo,
} from './solicitud'

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
const SIN_ELEGIR = { valor: '', etiqueta: 'Selecciona una opción' }

function FormularioCorporativo({ alEnviar }: { alEnviar: (mensaje: string) => void }) {
  const [form, setForm] = useState<FormCorporativo>(CORPORATIVO_VACIO)
  const [invalido, setInvalido] = useState<{ campo: CampoCorporativo; motivo: string } | null>(null)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const candado = useRef(false)
  const refs: Record<CampoCorporativo, React.RefObject<Control>> = {
    nombre: useRef<Control>(null),
    empresa: useRef<Control>(null),
    correo: useRef<Control>(null),
    telefono: useRef<Control>(null),
    tipo: useRef<Control>(null),
    asistentes: useRef<Control>(null),
    fecha: useRef<Control>(null),
    mensaje: useRef<Control>(null),
  }

  const cambiar = (campo: CampoCorporativo) => (e: React.ChangeEvent<Control>) => {
    const valor = e.target.value
    setForm((f) => ({ ...f, [campo]: valor }))
    if (invalido?.campo === campo) setInvalido(null)
  }
  const error = (campo: CampoCorporativo) => (invalido?.campo === campo ? invalido.motivo : undefined)

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (candado.current) return
    const falta = campoInvalidoCorporativo(form)
    if (falta) {
      setInvalido(falta)
      refs[falta.campo].current?.focus()
      return
    }
    candado.current = true
    setEnviando(true)
    setErrorEnvio(null)
    try {
      const r = await enviarSolicitud(cuerpoCorporativo(form))
      if (r.ok) {
        setInvalido(null)
        alEnviar(r.mensaje ?? TEXTO_RECIBIDA)
        return
      }
      // El diálogo no se cierra en error: lo escrito se queda para reintentar (como hoy, `CorporateRequestModal.tsx:186`).
      setErrorEnvio(textoErrorCorporativo(r))
    } finally {
      candado.current = false
      setEnviando(false)
    }
  }

  return (
    <form data-testid="sn-catering-corporativa-formulario" onSubmit={enviar} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          ref={refs.nombre}
          etiqueta="Nombre completo*"
          name="name"
          value={form.nombre}
          onChange={cambiar('nombre')}
          maxLength={MAXIMO_CORPORATIVO.nombre}
          requerido
          autoComplete="name"
          error={error('nombre')}
          testId="sn-catering-corporativa-nombre"
        />
        <Campo
          ref={refs.empresa}
          etiqueta="Empresa*"
          name="company"
          value={form.empresa}
          onChange={cambiar('empresa')}
          maxLength={MAXIMO_CORPORATIVO.empresa}
          requerido
          autoComplete="organization"
          error={error('empresa')}
          testId="sn-catering-corporativa-empresa"
        />
        <Campo
          ref={refs.correo}
          etiqueta="Correo electrónico*"
          tipo="email"
          name="email"
          value={form.correo}
          onChange={cambiar('correo')}
          maxLength={MAXIMO_CORPORATIVO.correo}
          requerido
          autoComplete="email"
          error={error('correo')}
          testId="sn-catering-corporativa-correo"
        />
        <Campo
          ref={refs.telefono}
          etiqueta="Teléfono*"
          tipo="tel"
          name="phone"
          value={form.telefono}
          onChange={cambiar('telefono')}
          maxLength={MAXIMO_CORPORATIVO.telefono}
          requerido
          autoComplete="tel"
          error={error('telefono')}
          testId="sn-catering-corporativa-telefono"
        />
        <Campo
          ref={refs.tipo}
          etiqueta="Tipo de evento*"
          tipo="select"
          name="eventType"
          opciones={[SIN_ELEGIR, ...TIPOS_CORPORATIVO]}
          value={form.tipo}
          onChange={cambiar('tipo')}
          requerido
          error={error('tipo')}
          testId="sn-catering-corporativa-tipo"
        />
        <Campo
          ref={refs.asistentes}
          etiqueta="Número estimado de asistentes*"
          tipo="select"
          name="attendees"
          opciones={[SIN_ELEGIR, ...ASISTENTES]}
          value={form.asistentes}
          onChange={cambiar('asistentes')}
          requerido
          error={error('asistentes')}
          testId="sn-catering-corporativa-personas"
        />
      </div>
      <Campo
        ref={refs.fecha}
        etiqueta="Fecha tentativa del evento"
        tipo="date"
        name="date"
        value={form.fecha}
        onChange={cambiar('fecha')}
        testId="sn-catering-corporativa-fecha"
      />
      <Campo
        ref={refs.mensaje}
        etiqueta="Detalles adicionales"
        tipo="textarea"
        name="message"
        filas={4}
        maxLength={MAXIMO_CORPORATIVO.mensaje}
        placeholder="Cuéntanos más sobre tu evento, necesidades dietéticas especiales, ubicación, etc."
        value={form.mensaje}
        onChange={cambiar('mensaje')}
        testId="sn-catering-corporativa-mensaje"
      />
      {errorEnvio && (
        <AvisoEnLinea tono="error" testId="sn-catering-corporativa-error">
          {errorEnvio}
        </AvisoEnLinea>
      )}
      <div>
        <Boton type="submit" cargando={enviando} textoCargando="Enviando..." testId="sn-catering-corporativa-enviar">
          Enviar solicitud
        </Boton>
      </div>
    </form>
  )
}

export default function PropuestaCorporativa() {
  const [abierto, setAbierto] = useState(false)
  const [enviada, setEnviada] = useState<string | null>(null)

  const abrir = () => {
    setEnviada(null)
    setAbierto(true)
  }
  const cerrar = () => setAbierto(false)

  return (
    <>
      <Boton variante="contorno" onClick={abrir} testId="sn-catering-planifica-corporativa-abrir">
        Solicitar propuesta corporativa
      </Boton>
      <Dialogo
        abierto={abierto}
        onCerrar={cerrar}
        titulo={enviada === null ? 'Solicitar Propuesta Corporativa' : 'Solicitud Enviada'}
        etiquetaCerrar="Cerrar"
        testId="sn-catering-corporativa"
      >
        {enviada === null ? (
          <FormularioCorporativo alEnviar={setEnviada} />
        ) : (
          <div data-testid="sn-catering-corporativa-exito" role="status" className="flex flex-col items-start gap-4">
            <Titulo nivel={3} tamano="h5">
              ¡Gracias por tu interés!
            </Titulo>
            <Texto testId="sn-catering-corporativa-exito-texto">{enviada}</Texto>
            <Boton onClick={cerrar} testId="sn-catering-corporativa-exito-cerrar">
              Cerrar
            </Boton>
          </div>
        )}
      </Dialogo>
    </>
  )
}
