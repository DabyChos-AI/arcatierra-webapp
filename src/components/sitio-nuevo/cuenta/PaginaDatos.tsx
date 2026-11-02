'use client'

// R15 v2 · F6 (cuenta, sesión 64): la pestaña «Mi perfil» (Datos) de Mi cuenta, `/usuario/perfil` (f6/cuenta-F6.md §5; D-F6-11 P-11 = D).
// Lo de hoy que SÍ se guarda (`src/app/usuario/perfil/page.tsx`), con el aspecto de la maqueta (`.cuenta-card` «Información personal.» con
// etiqueta/valor en dos columnas y el botón abajo):
// - `/api/auth/me` lo pide el marco una vez (`contexto.ts`) y aquí se lee; después, como hoy, `GET /api/direcciones/` (`perfil:104-111`) para
//   calcular `direccion_principal`, que el PATCH manda igual que hoy aunque ya no sea un campo.
// - País se ve de solo lectura, con el respaldo de hoy «+52» (D-F6-11 P-11, D-F6-14 (e)); «Zona de entrega», «Dirección (calle y número)» y «Día favorito de entrega» no se pintan como
//   campos (hoy se cambian y no se guardan donde se leen: defecto de hoy a TASK-LIST).
// - No pasan: «{n} pedidos realizados» (D-14, siempre 0), el botón de cámara sin función, «Experiencia favorita» (nunca se llena), la bandera
//   de flagcdn.com y los `console.log`.
// - Guardar: el PATCH de hoy (`cuerpoPatch`, `perfil:160-226`), sus avisos y sus textos; candado contra el doble clic; al salir bien, el
//   nombre del marco cambia (`actualizarMe`). Cancelar vuelve a lo de antes (`perfil:228-231`).

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Casilla from '@/components/sitio-nuevo/ui/Casilla'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { aviso } from '@/components/ui/Avisos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { useCuenta } from './contexto'
import PestanaCuenta from './PestanaCuenta'
import CasillaFija from './CasillaFija'
import { enlaceDeHoy } from './pestanas'
import { RESTRICCIONES, cuerpoPatch, fechaNacimientoDe, miembroDesdeDe, perfilDe, type LlaveRestriccion, type PerfilCuenta } from './perfil'
import { TEXTO_REINTENTAR } from './textos'

const B = 'sn-mi-cuenta-datos'
const NO_ESPECIFICADO = 'No especificado'

type EstadoDirecciones = 'cargando' | 'listo' | 'error'

/** Etiqueta/valor de la maqueta (`[data-pane="datos"]`): etiqueta mono de 10 px en terra (5.68 sobre blanco) y el valor abajo (el nombre en
 * serif, lo demás en mono de 14 px). */
function Dato({ etiqueta, testId, serif = false, children }: { etiqueta: string; testId: string; serif?: boolean; children: React.ReactNode }) {
  return (
    <div data-testid={testId} className="min-w-0">
      <p className="m-0 mb-1.5 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-terra">{etiqueta}</p>
      <div
        className={
          serif
            ? 'font-sn-titulos text-sn-h6 font-normal text-sn-ink [overflow-wrap:anywhere]'
            : 'font-sn-mono text-sn-cuerpo-sm font-normal tracking-normal text-sn-ink [overflow-wrap:anywhere]'
        }
      >
        {children}
      </div>
    </div>
  )
}

export default function PaginaDatos() {
  const { status } = useSession()
  const { me, estadoMe, recargarMe, actualizarMe } = useCuenta()
  const [direcciones, setDirecciones] = useState<unknown>(null)
  const [estadoDirecciones, setEstadoDirecciones] = useState<EstadoDirecciones>('cargando')
  const [perfil, setPerfil] = useState<PerfilCuenta | null>(null)
  const [editado, setEditado] = useState<PerfilCuenta | null>(null)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const enviando = useRef(false)
  const pedidas = useRef(false)
  const primerCampo = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)
  const estuvoEditando = useRef(false)

  // Después de `/me`, como hoy (`perfil:100-110`): `GET /api/direcciones/`; si no sale bien, lista vacía.
  const pedirDirecciones = useCallback(async () => {
    setEstadoDirecciones('cargando')
    try {
      const respuesta = await fetch('/api/direcciones/', { headers: { 'Content-Type': 'application/json' } })
      setDirecciones(respuesta.ok ? await respuesta.json() : [])
      setEstadoDirecciones('listo')
    } catch {
      setEstadoDirecciones('error')
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && estadoMe === 'listo' && !pedidas.current) {
      pedidas.current = true
      void pedirDirecciones()
    }
  }, [status, estadoMe, pedirDirecciones])

  // El perfil se arma una vez con `/me` y las direcciones (`perfil:113-141`); lo guardado después vive aquí, como hoy.
  useEffect(() => {
    if (perfil || !me || estadoMe !== 'listo' || estadoDirecciones !== 'listo') return
    const armado = perfilDe(me, direcciones, new Date().toISOString().split('T')[0])
    setPerfil(armado)
    setEditado(armado)
  }, [perfil, me, estadoMe, direcciones, estadoDirecciones])

  // Foco: al entrar a editar, al primer campo; al salir (guardar o cancelar), al botón «Editar» (el que se pulsó ya no existe).
  useEffect(() => {
    if (editando) {
      estuvoEditando.current = true
      primerCampo.current?.focus()
    } else if (estuvoEditando.current) {
      estuvoEditando.current = false
      document.querySelector<HTMLElement>(`[data-testid="${B}-editar"]`)?.focus()
    }
  }, [editando])

  const reintentar = () => {
    setPerfil(null)
    setEditado(null)
    pedidas.current = false
    if (estadoMe !== 'listo') recargarMe()
    else {
      pedidas.current = true
      void pedirDirecciones()
    }
  }

  const cambiar = <K extends keyof PerfilCuenta>(llave: K, valor: PerfilCuenta[K]) =>
    setEditado((p) => (p ? { ...p, [llave]: valor } : p))
  const cambiarPreferencia = (llave: 'newsletter' | 'notifications', valor: boolean) =>
    setEditado((p) => (p ? { ...p, preferences: { ...p.preferences, [llave]: valor } } : p))
  const cambiarRestriccion = (llave: LlaveRestriccion, valor: boolean) =>
    setEditado((p) =>
      p ? { ...p, preferences: { ...p.preferences, dietaryRestrictions: { ...p.preferences.dietaryRestrictions, [llave]: valor } } } : p,
    )

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editado || enviando.current) return
    enviando.current = true
    setGuardando(true)
    const cuerpo = cuerpoPatch(editado)
    try {
      const respuesta = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      if (!respuesta.ok) {
        const errorText = await respuesta.text()
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { detail: errorText }
        }
        // K1 (R8): `detail` de FastAPI puede ser una lista (Pydantic): se vuelve texto legible (`perfil:211-212`).
        throw new Error(error?.detail ? extraerMensajeError(error, respuesta.status) : 'Error actualizando perfil')
      }
      await respuesta.json()
      setPerfil(editado)
      setEditando(false)
      actualizarMe({
        nombre: cuerpo.nombre,
        apellidos: cuerpo.apellidos,
        nombre_completo: cuerpo.nombre_completo,
        telefono: cuerpo.telefono,
        fecha_nacimiento: cuerpo.fecha_nacimiento,
        preferencias: cuerpo.preferencias,
      })
      aviso.exito('Perfil actualizado exitosamente')
    } catch (error) {
      aviso.error(`Error guardando los cambios: ${extraerMensajeError(error instanceof Error ? error.message : error)}`)
    } finally {
      enviando.current = false
      setGuardando(false)
    }
  }

  const cancelar = () => {
    setEditado(perfil)
    setEditando(false)
  }

  const titulo = enlaceDeHoy('/usuario/perfil').texto
  const fallo = !perfil && (estadoMe === 'error' || estadoDirecciones === 'error' || (estadoMe === 'listo' && !me))
  const cargando = !perfil && !fallo

  if (cargando || fallo || !perfil || !editado) {
    return (
      <PestanaCuenta idTitulo={`${B}-titulo`} titulo={titulo} testId={B}>
        <Tarjeta as="div" relleno="normal">
          {cargando ? (
            <Texto tamano="chico" peso="normal" testId={`${B}-cargando`}>
              Cargando tu perfil...
            </Texto>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <AvisoEnLinea tono="error" testId={`${B}-error`}>
                Error al cargar el perfil
              </AvisoEnLinea>
              <Boton variante="contorno" tamano="chico" onClick={reintentar} testId={`${B}-reintentar`}>
                {TEXTO_REINTENTAR}
              </Boton>
            </div>
          )}
        </Tarjeta>
      </PestanaCuenta>
    )
  }

  const visto = editando ? editado : perfil

  const tarjetas = (
    <>
      <Tarjeta as="div" relleno="normal">
        <Titulo nivel={3} tamano="h4" className="mb-[18px]">
          Información Personal
        </Titulo>
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          {editando ? (
            <Campo
              ref={primerCampo}
              etiqueta="Nombre completo"
              value={editado.name ?? ''}
              onChange={(e) => cambiar('name', e.target.value)}
              autoComplete="name"
              testId={`${B}-formulario-nombre`}
            />
          ) : (
            <Dato etiqueta="Nombre completo" testId={`${B}-nombre`} serif>
              {visto.name}
            </Dato>
          )}
          <Dato etiqueta="Email" testId={`${B}-correo`}>
            {visto.email}
            <Texto tamano="mini" peso="normal" className="mt-1">
              El email no se puede modificar
            </Texto>
          </Dato>
          <Dato etiqueta="País" testId={`${B}-pais`}>
            {visto.codigoPais}
          </Dato>
          {editando ? (
            <Campo
              etiqueta="Teléfono"
              tipo="tel"
              value={editado.phone || ''}
              onChange={(e) => cambiar('phone', e.target.value)}
              autoComplete="tel-national"
              testId={`${B}-formulario-telefono`}
            />
          ) : (
            <Dato etiqueta="Teléfono" testId={`${B}-telefono`}>
              {visto.phone || NO_ESPECIFICADO}
            </Dato>
          )}
          {editando ? (
            <Campo
              etiqueta="Fecha de nacimiento"
              tipo="date"
              value={editado.birthDate || ''}
              onChange={(e) => cambiar('birthDate', e.target.value)}
              testId={`${B}-formulario-nacimiento`}
            />
          ) : (
            <Dato etiqueta="Fecha de nacimiento" testId={`${B}-nacimiento`}>
              {visto.birthDate ? fechaNacimientoDe(visto.birthDate) : NO_ESPECIFICADO}
            </Dato>
          )}
          <Dato etiqueta="Miembro desde" testId={`${B}-miembro`}>
            {miembroDesdeDe(visto.memberSince)}
          </Dato>
        </div>
      </Tarjeta>

      <Tarjeta as="div" relleno="normal">
        <Titulo nivel={3} tamano="h4" className="mb-[18px]">
          Preferencias
        </Titulo>
        <div data-testid={`${B}-preferencias`} className="flex flex-col gap-4">
          <div data-testid={`${B}-preferencias-newsletter`}>
            {editando ? (
              <Casilla
                checked={editado.preferences.newsletter}
                onChange={(e) => cambiarPreferencia('newsletter', e.target.checked)}
                ayuda="Recibir información sobre nuevas experiencias"
              >
                Newsletter
              </Casilla>
            ) : (
              <CasillaFija id={`${B}-fija-newsletter`} marcada={visto.preferences.newsletter} ayuda="Recibir información sobre nuevas experiencias">
                Newsletter
              </CasillaFija>
            )}
          </div>
          <div data-testid={`${B}-preferencias-notificaciones`}>
            {editando ? (
              <Casilla
                checked={editado.preferences.notifications}
                onChange={(e) => cambiarPreferencia('notifications', e.target.checked)}
                ayuda="Recibir notificaciones de reservas y pedidos"
              >
                Notificaciones
              </Casilla>
            ) : (
              <CasillaFija
                id={`${B}-fija-notificaciones`}
                marcada={visto.preferences.notifications}
                ayuda="Recibir notificaciones de reservas y pedidos"
              >
                Notificaciones
              </CasillaFija>
            )}
          </div>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 p-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">Restricciones dietéticas</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {RESTRICCIONES.map((r) => (
                <div key={r.llave} data-testid={`${B}-preferencias-restriccion`} data-restriccion={r.valor}>
                  {editando ? (
                    <Casilla
                      checked={editado.preferences.dietaryRestrictions[r.llave]}
                      onChange={(e) => cambiarRestriccion(r.llave, e.target.checked)}
                    >
                      {r.nombre}
                    </Casilla>
                  ) : (
                    <CasillaFija id={`${B}-fija-${r.valor}`} marcada={visto.preferences.dietaryRestrictions[r.llave]}>
                      {r.nombre}
                    </CasillaFija>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </Tarjeta>

    </>
  )
  const acciones = (
    <div className="flex flex-wrap gap-3">
      {editando ? (
        <>
          <Boton type="submit" cargando={guardando} testId={`${B}-formulario-guardar`}>
            Guardar
          </Boton>
          <Boton variante="contorno" onClick={cancelar} deshabilitado={guardando} testId={`${B}-formulario-cancelar`}>
            Cancelar
          </Boton>
        </>
      ) : (
        <Boton variante="contorno" onClick={() => setEditando(true)} testId={`${B}-editar`}>
          Editar
        </Boton>
      )}
    </div>
  )

  return (
    <PestanaCuenta idTitulo={`${B}-titulo`} titulo={titulo} testId={B}>
      <Texto tamano="normal" peso="ligero">
        Gestiona tu información personal y preferencias
      </Texto>
      {editando ? (
        <form data-testid={`${B}-formulario`} onSubmit={guardar} className="flex flex-col gap-[22px]">
          {tarjetas}
          {acciones}
        </form>
      ) : (
        <div className="flex flex-col gap-[22px]">
          {tarjetas}
          {acciones}
        </div>
      )}
    </PestanaCuenta>
  )
}
