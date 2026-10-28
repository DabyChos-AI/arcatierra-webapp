'use client'

// «Contenido del sitio» (WF7): un elemento de la lista con su estado, quién y cuándo lo cambió, y sus acciones
// (subir/bajar, editar, publicar/despublicar, archivar/desarchivar). Nunca «borrar»: se archiva.

import { Archive, ArchiveRestore, ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { EstadoContenido, ItemContenido } from '@/types/contenido-sitio'
import {
  CLASE_ESTADO,
  ETIQUETA_ESTADO,
  ETIQUETA_VIGENCIA,
  estadoVigencia,
  imagenDe,
  resumen,
  textoUltimoCambio,
  textoVigencia,
  usaVigencia,
} from './contenido'

export type AccionElemento = 'subir' | 'bajar' | 'editar' | EstadoContenido

interface Props {
  item: ItemContenido
  /** Posición entre los NO archivados (0..total-1); null si está archivado. */
  posicion: number | null
  total: number
  ocupado: boolean
  onAccion: (item: ItemContenido, accion: AccionElemento) => void
}

const CLASE_VIGENCIA = {
  vigente: 'bg-verde/10 text-verde',
  programado: 'bg-azul-bg text-azul',
  vencido: 'bg-neutro-light text-verde-medio',
} as const

const CLASE_BOTON =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde hover:bg-neutro-light disabled:cursor-not-allowed disabled:opacity-50'

export default function TarjetaElemento({ item, posicion, total, ocupado, onAccion }: Props) {
  const { titulo, detalle } = resumen(item)
  const imagen = imagenDe(item)
  const archivado = item.estado === 'archivado'
  const vigencia = usaVigencia(item.seccion) ? estadoVigencia(item) : null
  const nombreCorto = titulo.length > 60 ? `${titulo.slice(0, 57)}…` : titulo

  return (
    <li
      data-testid={`cs-item-${item.id}`}
      data-estado={item.estado}
      data-orden={item.orden}
      data-clave={item.clave ?? ''}
      data-version={item.version}
      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start ${archivado ? 'bg-neutro-light' : 'bg-white'}`}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        {imagen && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutro-borde bg-neutro-light">
            <OptimizedImage src={imagen} alt="" fill sizes="56px" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span data-testid="cs-item-estado" className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CLASE_ESTADO[item.estado]}`}>
              {ETIQUETA_ESTADO[item.estado]}
            </span>
            {vigencia && item.estado === 'publicado' && (
              <span
                data-testid="cs-item-vigencia-estado"
                data-vigencia={vigencia}
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CLASE_VIGENCIA[vigencia]}`}
              >
                {ETIQUETA_VIGENCIA[vigencia]}
              </span>
            )}
            {item.clave && (
              <code data-testid="cs-item-clave" className="break-all rounded bg-neutro-light px-1.5 py-0.5 text-xs text-verde-tipografia">
                {item.clave}
              </code>
            )}
          </div>
          <p data-testid="cs-item-titulo" className="mb-0 whitespace-pre-line break-words text-sm font-medium text-verde">
            {titulo}
          </p>
          {detalle && (
            <p data-testid="cs-item-detalle" className="mb-0 line-clamp-2 break-words text-sm text-verde-tipografia">
              {detalle}
            </p>
          )}
          {vigencia && (
            <p data-testid="cs-item-vigencia" className="mb-0 text-xs text-verde-tipografia">
              {textoVigencia(item)}
            </p>
          )}
          {item.seccion === 'cifras' && (
            <p data-testid="cs-item-fuente" className="mb-0 break-words text-xs text-verde-tipografia">
              <span className="font-semibold">Fuente:</span> {item.fuente ?? 'sin fuente'}
            </p>
          )}
          <p data-testid="cs-item-cambio" className="mb-0 text-xs text-verde-medio">
            Último cambio: {textoUltimoCambio(item)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:max-w-[23rem] sm:justify-end xl:max-w-none xl:flex-nowrap">
        {posicion !== null && (
          <>
            <button
              type="button"
              data-testid={`cs-subir-${item.id}`}
              aria-label={`Subir «${nombreCorto}»`}
              title="Subir"
              disabled={ocupado || posicion === 0}
              onClick={() => onAccion(item, 'subir')}
              className={CLASE_BOTON}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-testid={`cs-bajar-${item.id}`}
              aria-label={`Bajar «${nombreCorto}»`}
              title="Bajar"
              disabled={ocupado || posicion >= total - 1}
              onClick={() => onAccion(item, 'bajar')}
              className={CLASE_BOTON}
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          data-testid={`cs-editar-${item.id}`}
          disabled={ocupado}
          onClick={() => onAccion(item, 'editar')}
          className={CLASE_BOTON}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Editar
        </button>
        {!archivado && (
          <button
            type="button"
            data-testid={`cs-publicar-${item.id}`}
            data-accion={item.estado === 'publicado' ? 'despublicar' : 'publicar'}
            disabled={ocupado}
            onClick={() => onAccion(item, item.estado === 'publicado' ? 'borrador' : 'publicado')}
            className={CLASE_BOTON}
          >
            {item.estado === 'publicado' ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {item.estado === 'publicado' ? 'Despublicar' : 'Publicar'}
          </button>
        )}
        <button
          type="button"
          data-testid={`cs-archivar-${item.id}`}
          data-accion={archivado ? 'desarchivar' : 'archivar'}
          disabled={ocupado}
          onClick={() => onAccion(item, archivado ? 'borrador' : 'archivado')}
          className={CLASE_BOTON}
        >
          {archivado ? <ArchiveRestore className="h-4 w-4" aria-hidden="true" /> : <Archive className="h-4 w-4" aria-hidden="true" />}
          {archivado ? 'Desarchivar' : 'Archivar'}
        </button>
      </div>
    </li>
  )
}
