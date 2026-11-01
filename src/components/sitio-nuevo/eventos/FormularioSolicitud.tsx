'use client'

// R15 v2 · F4 (eventos): el formulario de solicitud de experiencia privada = el de hoy (`src/app/experiencias/[slug]/page.tsx:746-976`;
// DR-23 «el formulario se queda con lo que ya pide hoy»), con `ui/Campo` y `ui/Boton` tal cual. Lo usan /eventos (con la lista de privadas
// para elegir) y la ficha de privada de experiencias (con la experiencia fija, dentro de su diálogo): contrato v2 D-F4-07 P-15, D-F4-08.
// - Mismos campos, etiquetas, límites, validación, cuerpo y conducta: 400/422 dicen el motivo y no abren el canal; lo demás abre WhatsApp o
//   el correo de Experiencias (la lógica, en `solicitud.ts`). Sin texto nuevo de éxito (P-14).
// - Lo único nuevo es elegir la experiencia en /eventos (P-9): «Experiencia» · «Selecciona una experiencia» · «Elige una experiencia».
// - Nombre y correo de la sesión, como hoy (`[slug]/page.tsx:268-274`). El candado contra doble clic va antes del `await`.
// - Testids: `<testId>-…` (por omisión `sn-eventos-solicitud`); en la ficha, la base la pasa su dueño (D-F4-08).
// - `sinPanel` (D-F4-19): dentro de un diálogo que ya trae relleno (la ficha de experiencias), el formulario va sin su panel (fondo, radio
//   y relleno propios); en /eventos no se pasa y nada cambia.
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { API_URL } from '@/lib/api'
import { hoyMexico } from '@/lib/dates'
import { formatPrice } from '@/utils/formatters'
import { personasIncluidasValidas, textoAdicionalPrivada, textoGrupoPrivada } from '@/app/experiencias/[slug]/precio-privada'
import { enOracion } from '@/components/sitio-nuevo/tienda/oracion'
import Falta from '@/components/sitio-nuevo/Falta'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import { unirClases } from '@/components/sitio-nuevo/ui/clases'
import type { ExperienciaPrivada } from './privadas'
import {
  DATOS_VACIOS,
  HORARIOS_PRIVADOS,
  MAX_COMENTARIOS,
  MAX_EMAIL,
  MAX_NOMBRE,
  MAX_TELEFONO,
  PERSONAS_MAX,
  PERSONAS_MIN,
  TEXTO_ELIGE_EXPERIENCIA,
  cuerpoSolicitud,
  detalleLegible,
  enlaceCorreo,
  enlaceWhatsApp,
  esRechazo,
  validarSolicitud,
  type DatosSolicitud,
  type HorarioPrivado,
  type MedioContacto,
} from './solicitud'

type Props = {
  /** Base de los testids (D-F4-08). */
  testId?: string
  /** /eventos: la lista para elegir (null = todavía cargando). */
  experiencias?: ExperienciaPrivada[] | null
  /** Ficha de una privada: la experiencia fija (sin lista). */
  experiencia?: ExperienciaPrivada
  /** /eventos: la experiencia elegida desde fuera (la tarjeta «Solicitar Cotización») y su aviso. */
  elegidaId?: string
  onElegir?: (id: string) => void
  /** Después de abrir el canal (la ficha cierra su diálogo, como `cerrarModal()` de hoy). */
  onEnviada?: () => void
  /** Si se pasa, pinta «Cancelar» (`[slug]/page.tsx:949-954`). */
  onCancelar?: () => void
  /** Sin el panel propio (fondo warm, radio y relleno): para un contenedor que ya los trae, como `ui/Dialogo` (D-F4-19). */
  sinPanel?: boolean
  className?: string
}

/** El id del control «Experiencia» (lo enfoca /eventos al elegir desde una tarjeta). */
export const idControlExperiencia = (testId: string) => `${testId}-control-experiencia`

export default function FormularioSolicitud({
  testId = 'sn-eventos-solicitud',
  experiencias,
  experiencia,
  elegidaId,
  onElegir,
  onEnviada,
  onCancelar,
  sinPanel = false,
  className,
}: Props) {
  const { data: session } = useSession()
  const [datos, setDatos] = useState<DatosSolicitud>(DATOS_VACIOS)
  const [elegidaPropia, setElegidaPropia] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const enviandoRef = useRef(false)

  const idElegida = elegidaId ?? elegidaPropia
  const elegida = experiencia ?? (experiencias ?? []).find((e) => e.id === idElegida) ?? null

  // Como hoy: con sesión, nombre y correo de la cuenta (`[slug]/page.tsx:268-274`).
  useEffect(() => {
    if (session?.user) {
      const usuario = session.user
      setDatos((d) => ({ ...d, nombre: usuario.name || '', email: usuario.email || '' }))
    }
  }, [session])

  const cambiar = <K extends keyof DatosSolicitud>(llave: K, valor: DatosSolicitud[K]) => setDatos((d) => ({ ...d, [llave]: valor }))

  const elegir = (id: string) => {
    if (onElegir) onElegir(id)
    else setElegidaPropia(id)
  }

  const enviar = async (medio: MedioContacto) => {
    if (enviandoRef.current) return
    setError(null)
    if (!elegida) {
      setError(TEXTO_ELIGE_EXPERIENCIA)
      return
    }
    const errorLocal = validarSolicitud(medio, datos)
    if (errorLocal) {
      setError(errorLocal)
      return
    }
    enviandoRef.current = true
    setEnviando(true)
    let rechazo: string | null = null
    try {
      const res = await fetch(`${API_URL}/api/experiencias/${elegida.id}/solicitud-privada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpoSolicitud(medio, datos)),
      })
      if (esRechazo(res.status)) {
        const cuerpo: unknown = await res.json().catch(() => null)
        rechazo = detalleLegible(
          cuerpo && typeof cuerpo === 'object' && 'detail' in cuerpo ? (cuerpo as { detail: unknown }).detail : null,
        )
      }
    } catch {
      // Error de red: no se guardó el lead, pero el canal se abre igual (como hoy).
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
    if (rechazo) {
      setError(rechazo)
      return
    }
    // El nombre de la experiencia en el mensaje, como hoy: el de la API.
    const url = medio === 'whatsapp' ? enlaceWhatsApp(elegida.nombre, datos) : enlaceCorreo(elegida.nombre, datos)
    window.open(url, '_blank')
    onEnviada?.()
  }

  // La pista de hoy (`[slug]/page.tsx:341, :845-848`): solo con un número real de la API (`personasIncluidasValidas`: entero > 0);
  // con 0, negativo o sin dato, «Un aproximado basta…» (D-F4-20).
  const incluidas = elegida ? personasIncluidasValidas(elegida.personas_incluidas) : null
  const pista =
    incluidas !== null ? `Incluye ${incluidas} personas; puedes pedir más o menos` : 'Un aproximado basta; lo confirmamos contigo'
  const adicional = elegida ? textoAdicionalPrivada(elegida.precio_persona_adicional) : null

  return (
    <form
      data-testid={`${testId}-formulario`}
      noValidate
      onSubmit={(e) => e.preventDefault()}
      className={unirClases(
        sinPanel
          ? 'flex flex-col gap-5 text-sn-ink'
          : 'flex flex-col gap-5 rounded-sn-panel bg-sn-warm px-6 py-7 text-sn-ink min-[861px]:px-11 min-[861px]:py-12',
        className,
      )}
    >
      {!experiencia && (
        <Campo
          testId={`${testId}-experiencia`}
          id={idControlExperiencia(testId)}
          tipo="select"
          etiqueta="Experiencia"
          value={idElegida}
          onChange={(e) => elegir(e.target.value)}
          deshabilitado={experiencias === null || experiencias === undefined}
          opciones={[
            { valor: '', etiqueta: 'Selecciona una experiencia' },
            ...(experiencias ?? []).map((e) => ({ valor: e.id, etiqueta: enOracion(e.nombre) })),
          ]}
        />
      )}

      {elegida && (
        <div data-testid={`${testId}-elegida`} data-experiencia-id={elegida.id} className="flex flex-col gap-1">
          <p className="m-0 font-sn-titulos text-sn-h5 font-normal">{enOracion(elegida.nombre)}</p>
          {elegida.precio !== null && (
            <p data-testid={`${testId}-elegida-precio`} className="m-0 font-sn-titulos text-sn-h5 font-normal text-sn-terra">
              ${formatPrice(elegida.precio)}
            </p>
          )}
          <p data-testid={`${testId}-elegida-grupo`} className="m-0 font-sn-texto text-sn-cuerpo-sm font-light">
            {textoGrupoPrivada(elegida.personas_incluidas)}
          </p>
          {adicional && (
            <p data-testid={`${testId}-elegida-adicional`} className="m-0 font-sn-texto text-sn-cuerpo-sm font-light">
              {adicional}
            </p>
          )}
        </div>
      )}

      <Campo
        testId={`${testId}-nombre`}
        etiqueta="Nombre completo"
        value={datos.nombre}
        onChange={(e) => cambiar('nombre', e.target.value)}
        maxLength={MAX_NOMBRE}
        autoComplete="name"
        requerido
      />
      <div className="grid grid-cols-1 gap-5 min-[861px]:grid-cols-2 min-[861px]:gap-4">
        <Campo
          testId={`${testId}-correo`}
          tipo="email"
          etiqueta="Email"
          value={datos.email}
          onChange={(e) => cambiar('email', e.target.value)}
          maxLength={MAX_EMAIL}
          autoComplete="email"
        />
        <Campo
          testId={`${testId}-telefono`}
          tipo="tel"
          etiqueta="Teléfono"
          value={datos.telefono}
          onChange={(e) => cambiar('telefono', e.target.value)}
          maxLength={MAX_TELEFONO}
          autoComplete="tel"
          ayuda="Para WhatsApp necesitamos tu teléfono; para correo, tu email."
        />
        <Campo
          testId={`${testId}-fecha`}
          tipo="date"
          etiqueta="Fecha deseada"
          min={hoyMexico()}
          value={datos.fecha}
          onChange={(e) => cambiar('fecha', e.target.value)}
        />
        <Campo
          testId={`${testId}-horario`}
          tipo="select"
          etiqueta="Horario preferido"
          value={datos.horario}
          onChange={(e) => {
            const opcion = HORARIOS_PRIVADOS.find((h) => h.valor === e.target.value)
            cambiar('horario', opcion ? (opcion.valor as HorarioPrivado) : '')
          }}
          opciones={[{ valor: '', etiqueta: 'Selecciona un horario' }, ...HORARIOS_PRIVADOS]}
        />
      </div>
      <Campo
        testId={`${testId}-personas`}
        tipo="number"
        etiqueta="Número de personas"
        inputMode="numeric"
        min={PERSONAS_MIN}
        max={PERSONAS_MAX}
        value={datos.personas}
        onChange={(e) => cambiar('personas', e.target.value)}
        ayuda={pista}
      />
      <Campo
        testId={`${testId}-comentarios`}
        tipo="textarea"
        etiqueta="Comentarios y requerimientos especiales"
        value={datos.comentarios}
        onChange={(e) => cambiar('comentarios', e.target.value)}
        maxLength={MAX_COMENTARIOS}
      />

      {error && (
        <AvisoEnLinea tono="error" testId={`${testId}-error`}>
          {error}
        </AvisoEnLinea>
      )}

      <p data-testid={`${testId}-privacidad`} className="m-0 font-sn-texto text-sn-cuerpo-xs">
        <Falta que="aviso de privacidad del formulario de solicitud" quien="David" />
      </p>

      <div className="flex flex-col gap-3 min-[861px]:flex-row min-[861px]:flex-wrap">
        <Boton testId={`${testId}-whatsapp`} onClick={() => enviar('whatsapp')} deshabilitado={enviando}>
          Contactar por WhatsApp
        </Boton>
        <Boton testId={`${testId}-email`} variante="contorno" onClick={() => enviar('email')} deshabilitado={enviando}>
          Contactar por Email
        </Boton>
        {onCancelar && (
          <Boton testId={`${testId}-cancelar`} variante="texto" onClick={onCancelar}>
            Cancelar
          </Boton>
        )}
      </div>
    </form>
  )
}
