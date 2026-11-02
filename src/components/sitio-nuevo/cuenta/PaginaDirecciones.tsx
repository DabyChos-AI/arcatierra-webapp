'use client'

// R15 v2 · F6 (cuenta, sesión 64): la pestaña «Mis Direcciones» de Mi cuenta, `/usuario/direcciones` (D-F6-11 P-8; f6/cuenta-F6.md §4).
// Hoy las direcciones viven dentro de `/usuario/dashboard` y solo se ven 3 (`usuario/dashboard/page.tsx:572`; «Ver todas…» no hace nada,
// `:623-629`): aquí se ven TODAS, en el orden de la API (la principal primero, `direcciones_usuario.py:83`). Llamadas de hoy:
// `GET /api/direcciones` (`:156`; al releer, con `cache: 'no-store'`, `:188`), `POST /api/direcciones`, `PUT` y `DELETE /api/direcciones/{id}`
// (proxies de hoy). Como hoy, si el GET no sale bien la lista queda vacía (`:170-176`); solo una excepción pinta el error con «Reintentar».
// Eliminar: solo las que no son principal, con la confirmación de hoy (`:297-304`) y el candado ANTES del `await`; si falla, el texto del
// proxy en un aviso (hoy no se veía nada, `:314-316`). Sin texto propio.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import { aviso, confirmar } from '@/components/ui/Avisos'
import PestanaCuenta from './PestanaCuenta'
import DialogoDireccion from './DialogoDireccion'
import { listaDeDirecciones, type DireccionCuenta } from './direcciones'
import { TEXTO_ERROR_CARGANDO, TEXTO_ERROR_ELIMINAR_DIRECCION, TEXTO_MIS_DIRECCIONES, TEXTO_REINTENTAR } from './textos'

const B = 'sn-mi-cuenta-direcciones'

type Estado = 'cargando' | 'listo' | 'error'

/** El `error` que responde el proxy al no poder borrar (`api/direcciones/[id]/route.ts:117-120`); si no trae texto, el mismo de hoy. */
async function textoErrorEliminar(respuesta: Response): Promise<string> {
  try {
    const cuerpo: unknown = await respuesta.json()
    const texto = (cuerpo as { error?: unknown } | null)?.error
    if (typeof texto === 'string' && texto.trim()) return texto
  } catch {
    // cuerpo vacío o no JSON
  }
  return TEXTO_ERROR_ELIMINAR_DIRECCION
}

export default function PaginaDirecciones() {
  const { status } = useSession()
  const [direcciones, setDirecciones] = useState<DireccionCuenta[]>([])
  const [estado, setEstado] = useState<Estado>('cargando')
  const [dialogo, setDialogo] = useState<{ abierto: boolean; editando: DireccionCuenta | null }>({ abierto: false, editando: null })
  const pedida = useRef(false)
  const borrando = useRef(false)

  const cargar = useCallback(async () => {
    setEstado('cargando')
    try {
      const respuesta = await fetch('/api/direcciones')
      const lista = respuesta.ok ? listaDeDirecciones(await respuesta.json()) : null
      setDirecciones(lista ?? [])
      setEstado('listo')
    } catch {
      setEstado('error')
    }
  }, [])

  // Releer después de guardar o borrar (`recargarDirecciones`, `:186-194`): si falla, se queda la lista que había.
  const releer = useCallback(async () => {
    try {
      const respuesta = await fetch('/api/direcciones', { cache: 'no-store' })
      const datos: unknown = respuesta.ok ? await respuesta.json() : []
      setDirecciones(listaDeDirecciones(datos) ?? [])
    } catch {
      // se queda la lista que había
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && !pedida.current) {
      pedida.current = true
      void cargar()
    }
  }, [status, cargar])

  const eliminar = async (direccion: DireccionCuenta) => {
    if (borrando.current) return
    borrando.current = true
    try {
      const ok = await confirmar({
        titulo: 'Eliminar dirección',
        mensaje: '¿Estás seguro de eliminar esta dirección?',
        textoAceptar: 'Eliminar',
        peligro: true,
      })
      if (!ok) return
      const respuesta = await fetch(`/api/direcciones/${direccion.id}`, { method: 'DELETE' })
      if (respuesta.ok) await releer()
      else aviso.error(await textoErrorEliminar(respuesta))
    } catch {
      aviso.error(TEXTO_ERROR_ELIMINAR_DIRECCION)
    } finally {
      borrando.current = false
    }
  }

  const abrir = (editando: DireccionCuenta | null) => setDialogo({ abierto: true, editando })
  const cerrar = useCallback(() => setDialogo((d) => ({ ...d, abierto: false })), [])

  return (
    <PestanaCuenta idTitulo={`${B}-titulo`} titulo={TEXTO_MIS_DIRECCIONES} comoTarjeta testId={B}>
      {estado === 'cargando' ? (
        <div data-testid={`${B}-cargando`} aria-hidden="true" className="flex flex-col gap-3.5">
          {[0, 1].map((n) => (
            <span key={n} className="block h-[92px] rounded-[10px] border border-solid border-sn-border bg-sn-ink/[0.04]" />
          ))}
        </div>
      ) : estado === 'error' ? (
        <div className="flex flex-col items-start gap-3">
          <AvisoEnLinea tono="error" testId={`${B}-error`}>
            {TEXTO_ERROR_CARGANDO}
          </AvisoEnLinea>
          <Boton variante="contorno" tamano="chico" onClick={() => void cargar()} testId={`${B}-reintentar`}>
            {TEXTO_REINTENTAR}
          </Boton>
        </div>
      ) : direcciones.length === 0 ? (
        <div data-testid={`${B}-vacio`} className="flex flex-col items-start gap-3">
          <Texto tamano="chico" peso="normal">
            No tienes direcciones guardadas
          </Texto>
          <Boton variante="contorno" tamano="chico" onClick={() => abrir(null)} testId={`${B}-agregar`}>
            Agregar primera dirección
          </Boton>
        </div>
      ) : (
        <>
          <ul data-testid={`${B}-lista`} className="m-0 flex list-none flex-col gap-3.5 p-0">
            {direcciones.map((d) => (
              <li
                key={d.id}
                data-testid={`${B}-tarjeta`}
                data-direccion-id={d.id}
                data-principal={d.es_principal ? '1' : '0'}
                className="flex flex-col gap-3 rounded-[10px] border border-solid border-sn-border p-[18px] sm:flex-row sm:items-start sm:justify-between sm:gap-[18px]"
              >
                <div className="min-w-0">
                  <p className="m-0 flex flex-wrap items-center gap-2">
                    <span data-testid={`${B}-tarjeta-nombre`} className="font-sn-titulos text-sn-h6 font-normal text-sn-ink [overflow-wrap:anywhere]">
                      {d.nombre_direccion}
                    </span>
                    {d.es_principal && (
                      <Insignia tono="green" forma="pildora" testId={`${B}-tarjeta-principal`}>
                        Principal
                      </Insignia>
                    )}
                  </p>
                  <Texto tamano="chico" peso="normal" testId={`${B}-tarjeta-linea`} className="mt-1 [overflow-wrap:anywhere]">
                    {d.calle} {d.numero_exterior}, {d.colonia}
                  </Texto>
                  <Texto tamano="chico" peso="normal" tono="ink-suave" testId={`${B}-tarjeta-linea`} className="[overflow-wrap:anywhere]">
                    {d.ciudad}, {d.estado} {d.codigo_postal}
                  </Texto>
                </div>
                <div className="flex shrink-0 gap-4">
                  <Boton variante="texto" tamano="chico" onClick={() => abrir(d)} testId={`${B}-tarjeta-editar`}>
                    Editar
                  </Boton>
                  {!d.es_principal && (
                    <Boton variante="texto" tamano="chico" onClick={() => void eliminar(d)} testId={`${B}-tarjeta-eliminar`}>
                      Eliminar
                    </Boton>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div>
            <Boton variante="contorno" tamano="chico" onClick={() => abrir(null)} testId={`${B}-agregar`}>
              Agregar Nueva Dirección
            </Boton>
          </div>
        </>
      )}
      <DialogoDireccion abierto={dialogo.abierto} editando={dialogo.editando} onCerrar={cerrar} onGuardada={releer} />
    </PestanaCuenta>
  )
}
