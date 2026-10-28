'use client'

// «Contenido del sitio» (WF7): una sección. Lista en el orden del sitio (los archivados aparte, si se piden), agregar,
// editar, publicar/despublicar, archivar/desarchivar y subir/bajar.
// - Reordenar: POST /reordenar con TODOS los no archivados de la sección en el orden nuevo (la API responde la sección).
// - Estado: PATCH /{id} {version, estado}. Candado por elemento ANTES del `confirmar` (s48); uno a la vez por sección al
//   reordenar. 409 de versión → se relee todo y se avisa; 409 de clave o de las 8 fotos → su mensaje tal cual.

import { useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { aviso, confirmar } from '@/components/ui/Avisos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  MAX_INSTAGRAM_PUBLICADAS,
  NOMBRE_SECCION,
  type EstadoContenido,
  type ItemContenido,
  type SeccionContenido,
} from '@/types/contenido-sitio'
import ModalElemento from './ModalElemento'
import TarjetaElemento, { type AccionElemento } from './TarjetaElemento'
import {
  DESCRIPCION_SECCION,
  NOMBRE_ELEMENTO,
  TEXTO_SESION,
  TEXTO_SIN_PERMISO,
  TEXTO_VERSION_LISTA,
  clasificarError,
  normalizarItem,
  normalizarLista,
  resumen,
} from './contenido'

interface Props {
  token: string
  seccion: SeccionContenido
  /** Los de esta sección, con archivados, en orden. */
  items: ItemContenido[]
  cargando: boolean
  onItem: (item: ItemContenido) => void
  /** La sección sin archivados, ya ordenada (respuesta de /reordenar). */
  onSeccion: (seccion: SeccionContenido, activos: ItemContenido[]) => void
  releer: () => Promise<ItemContenido[] | null>
}

const PUBLICADO_SALE = 'Sale en el sitio nuevo en 1 minuto o menos.'

function textoResultado(accion: EstadoContenido, antes: EstadoContenido, titulo: string): string {
  const t = `«${titulo.length > 60 ? `${titulo.slice(0, 57)}…` : titulo}»`
  if (accion === 'publicado') return `Publicado: ${t}. ${PUBLICADO_SALE}`
  if (accion === 'archivado') return `Archivado: ${t}. Ya no sale en el sitio; lo encuentras en «Mostrar archivados».`
  if (antes === 'archivado') return `Desarchivado: ${t}. Quedó como borrador.`
  return `Despublicado: ${t}. Quedó como borrador y deja de salir en el sitio en 1 minuto o menos.`
}

export default function PanelSeccion({ token, seccion, items, cargando, onItem, onSeccion, releer }: Props) {
  const [mostrarArchivados, setMostrarArchivados] = useState(false)
  const [modal, setModal] = useState<{ item: ItemContenido | null; llave: number } | null>(null)
  const [enCurso, setEnCurso] = useState<ReadonlySet<string>>(new Set())
  const enCursoRef = useRef<Set<string>>(new Set())
  const reordenandoRef = useRef(false)
  const [reordenando, setReordenando] = useState(false)

  const activos = useMemo(() => items.filter((i) => i.estado !== 'archivado'), [items])
  const archivados = useMemo(() => items.filter((i) => i.estado === 'archivado'), [items])
  const publicados = activos.filter((i) => i.estado === 'publicado').length
  const borradores = activos.length - publicados
  const ordenNuevo = activos.reduce((m, i) => Math.max(m, i.orden), 0) + 1

  function marcar(id: string, si: boolean) {
    if (si) enCursoRef.current.add(id)
    else enCursoRef.current.delete(id)
    setEnCurso(new Set(enCursoRef.current))
  }

  async function avisarError(status: number, cuerpo: unknown) {
    const r = clasificarError(status, cuerpo, extraerMensajeError(cuerpo, status))
    if (r.tipo === 'version') {
      await releer()
      aviso.error(TEXTO_VERSION_LISTA)
    } else if (r.tipo === 'conflicto') {
      aviso.error(r.texto)
      if ((cuerpo as { codigo?: unknown } | null)?.codigo === 'lista_no_cuadra') await releer()
    } else if (r.tipo === 'sesion') aviso.error(TEXTO_SESION)
    else if (r.tipo === 'permiso') aviso.error(TEXTO_SIN_PERMISO)
    else aviso.error(r.texto)
  }

  async function mover(item: ItemContenido, direccion: 'subir' | 'bajar') {
    if (reordenandoRef.current) return
    const ids = activos.map((i) => i.id)
    const desde = ids.indexOf(item.id)
    const hacia = direccion === 'subir' ? desde - 1 : desde + 1
    if (desde < 0 || hacia < 0 || hacia >= ids.length) return
    ;[ids[desde], ids[hacia]] = [ids[hacia], ids[desde]]
    reordenandoRef.current = true
    setReordenando(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/contenido-sitio/reordenar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ seccion, ids }),
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000),
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        await avisarError(res.status, cuerpo)
        return
      }
      onSeccion(seccion, normalizarLista(cuerpo, seccion).filter((i) => i.estado !== 'archivado'))
    } catch {
      aviso.error('Sin conexión con el servidor: el orden no cambió. Intenta de nuevo.')
    } finally {
      reordenandoRef.current = false
      setReordenando(false)
    }
  }

  async function cambiarEstado(item: ItemContenido, nuevo: EstadoContenido) {
    // Candado ANTES del confirmar: un doble clic no manda dos PATCH (s48).
    if (enCursoRef.current.has(item.id)) return
    marcar(item.id, true)
    try {
      const { titulo } = resumen(item)
      if (nuevo === 'archivado') {
        const ok = await confirmar({
          titulo: `Archivar ${NOMBRE_ELEMENTO[seccion]}`,
          mensaje: `«${titulo}» deja de salir en el sitio. No se borra: lo encuentras en «Mostrar archivados» y lo puedes desarchivar.`,
          textoAceptar: 'Archivar',
        })
        if (!ok) return
      }
      const res = await fetch(`${API_URL}/api/admin/contenido-sitio/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: item.version, estado: nuevo }),
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000),
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        await avisarError(res.status, cuerpo)
        return
      }
      const guardado = normalizarItem(cuerpo)
      if (guardado) onItem(guardado)
      else await releer()
      aviso.exito(textoResultado(nuevo, item.estado, titulo))
    } catch {
      aviso.error('Sin conexión con el servidor: no cambió nada. Intenta de nuevo.')
    } finally {
      marcar(item.id, false)
    }
  }

  function onAccion(item: ItemContenido, accion: AccionElemento) {
    if (accion === 'editar') setModal({ item, llave: Date.now() })
    else if (accion === 'subir' || accion === 'bajar') void mover(item, accion)
    else void cambiarEstado(item, accion)
  }

  return (
    <section
      id={`cs-panel-${seccion}`}
      role="tabpanel"
      aria-labelledby={`cs-tab-${seccion}`}
      data-testid={`cs-panel-${seccion}`}
      className="space-y-4"
    >
      <p data-testid="cs-descripcion-seccion" className="text-sm text-verde-tipografia">
        {DESCRIPCION_SECCION[seccion]}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-testid="cs-agregar"
          onClick={() => setModal({ item: null, llave: Date.now() })}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-terracota px-4 text-sm font-semibold text-white hover:bg-terracota-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar {NOMBRE_ELEMENTO[seccion]}
        </button>
        <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-verde-tipografia">
          <input
            type="checkbox"
            data-testid="cs-mostrar-archivados"
            checked={mostrarArchivados}
            onChange={(e) => setMostrarArchivados(e.target.checked)}
            className="h-4 w-4 rounded border-neutro-borde text-terracota focus:ring-terracota"
          />
          Mostrar archivados ({archivados.length})
        </label>
        <p data-testid="cs-conteo" className="mb-0 text-sm text-verde-medio">
          {publicados} {publicados === 1 ? 'publicado' : 'publicados'} · {borradores} {borradores === 1 ? 'borrador' : 'borradores'}
        </p>
        {seccion === 'instagram' && (
          <p
            data-testid="cs-instagram-tope"
            data-publicadas={publicados}
            className={`mb-0 rounded-full px-3 py-1 text-xs font-semibold ${publicados >= MAX_INSTAGRAM_PUBLICADAS ? 'bg-amarillo-bg text-verde-tipografia' : 'bg-neutro-light text-verde-tipografia'}`}
          >
            {publicados} de {MAX_INSTAGRAM_PUBLICADAS} fotos publicadas
          </p>
        )}
      </div>

      {activos.length === 0 ? (
        <div
          data-testid="cs-vacio"
          className="rounded-xl border border-dashed border-neutro-borde bg-white p-6 text-center text-sm text-verde-tipografia"
        >
          <p className="mb-1 font-medium text-verde">Todavía no hay nada en «{NOMBRE_SECCION[seccion]}».</p>
          <p className="mb-0 text-verde-medio">
            Mientras no publiques nada aquí, el sitio nuevo marca esta parte con «FALTA».
          </p>
        </div>
      ) : (
        <ul
          data-testid="cs-lista"
          aria-busy={cargando || reordenando}
          className={`divide-y divide-neutro-borde overflow-hidden rounded-xl border border-neutro-borde ${cargando || reordenando ? 'opacity-60' : ''}`}
        >
          {activos.map((item, i) => (
            <TarjetaElemento
              key={item.id}
              item={item}
              posicion={i}
              total={activos.length}
              ocupado={reordenando || enCurso.has(item.id)}
              onAccion={onAccion}
            />
          ))}
        </ul>
      )}

      {mostrarArchivados && (
        <div data-testid="cs-archivados" className="space-y-2">
          <h2 className="mb-0 text-base font-semibold text-verde">Archivados ({archivados.length})</h2>
          {archivados.length === 0 ? (
            <p className="text-sm text-verde-medio">No hay elementos archivados en esta sección.</p>
          ) : (
            <ul className="divide-y divide-neutro-borde overflow-hidden rounded-xl border border-neutro-borde">
              {archivados.map((item) => (
                <TarjetaElemento
                  key={item.id}
                  item={item}
                  posicion={null}
                  total={0}
                  ocupado={enCurso.has(item.id)}
                  onAccion={onAccion}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {modal && (
        <ModalElemento
          key={modal.llave}
          token={token}
          seccion={seccion}
          item={modal.item}
          ordenNuevo={ordenNuevo}
          releer={releer}
          onClose={() => setModal(null)}
          onGuardado={(guardado, creado) => {
            onItem(guardado)
            setModal(null)
            const { titulo } = resumen(guardado)
            const t = `«${titulo.length > 60 ? `${titulo.slice(0, 57)}…` : titulo}»`
            aviso.exito(
              creado
                ? guardado.estado === 'publicado'
                  ? `Publicado: ${t}. ${PUBLICADO_SALE}`
                  : `Guardado como borrador: ${t}. No sale en el sitio hasta que lo publiques.`
                : guardado.estado === 'publicado'
                  ? `Cambios guardados en ${t}. ${PUBLICADO_SALE}`
                  : `Cambios guardados en ${t}.`,
            )
          }}
        />
      )}
    </section>
  )
}
