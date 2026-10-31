'use client'

// R15 v2 · F3 (tienda): una tarjeta del catálogo (`.t-product-card` de la maqueta: warm, foto en caja cream, categoría, «+» redondo,
// nombre serif, pie con el precio en DM Mono y «Vista»). Datos y textos de la tarjeta de hoy (src/app/tienda/page.tsx:1310-1563):
// nombre (liga a la ficha nueva `/producto/{id}`), `precioLegible` + « / unidad» (D-F3-24 T-20), «Vista rápida», `TEXTO_AGOTADO`,
// «¡Solo quedan {n} disponibles!» y el corazón con «Agregar a favoritos»/«Quitar de favoritos». Al agregar: el aviso
// «{nombre} agregado al carrito» con role="status" (D-F3-22 P-13) y nunca el carrito lateral (D-F3-13).
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Plus } from 'lucide-react'
import { esGratuito, precioLegible } from '@/lib/precio'
import { TEXTO_AGOTADO } from '@/types/tienda'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { SIN_CATEGORIA, quedanPocos, type ProductoTienda } from './catalogo'
import { agregarProducto, textoAgregado } from './carritoTienda'

/** La foto de respaldo de hoy (tienda/page.tsx:102, :1323). */
export const FOTO_RESPALDO = '/images/placeholder-producto.webp'

interface Props {
  producto: ProductoTienda
  favorito: boolean
  alAlternarFavorito: () => void
  alVer: () => void
}

export default function TarjetaProducto({ producto: p, favorito, alAlternarFavorito, alVer }: Props) {
  const [agregado, setAgregado] = useState(false)
  const quedan = quedanPocos(p)

  return (
    <li
      data-testid="sn-tienda-catalogo-producto"
      data-itemcode={p.id}
      data-en-venta={p.enVenta ? 'true' : 'false'}
      className="flex flex-col gap-3 rounded-sn-tarjeta bg-white p-[22px] pb-[26px] text-sn-ink"
    >
      <div className="relative">
        <Foto
          src={p.imagen || FOTO_RESPALDO}
          alt={p.nombre}
          proporcion="1/1"
          redondeo="tarjeta"
          sizes="(min-width: 861px) 25vw, 50vw"
          testId="sn-tienda-catalogo-producto-foto"
          className="bg-sn-cream"
        />
        <button
          type="button"
          data-testid="sn-tienda-catalogo-producto-favorito"
          aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={favorito}
          onClick={alAlternarFavorito}
          className={unirClases(
            'absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-sn-pildora',
            favorito ? 'bg-sn-terra text-white' : 'bg-white text-sn-ink',
            FOCO,
          )}
        >
          <Heart aria-hidden="true" className={unirClases('h-4 w-4', favorito && 'fill-current')} />
        </button>
        {p.enVenta && (
          <button
            type="button"
            data-testid="sn-tienda-catalogo-producto-agregar"
            aria-label="Agregar"
            onClick={() => setAgregado(agregarProducto(p, 1))}
            className={unirClases('absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-sn-pildora bg-sn-terra text-white hover:bg-sn-ink', FOCO)}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
      {p.categoria !== SIN_CATEGORIA && (
        <p className="m-0 font-sn-mono text-sn-micro font-medium uppercase text-sn-ink">{p.categoria}</p>
      )}
      <h3 className="m-0 font-sn-titulos text-[18px] font-normal leading-tight">
        <Link
          href={`/producto/${encodeURIComponent(p.id)}`}
          data-testid="sn-tienda-catalogo-producto-nombre"
          className={unirClases('text-sn-ink no-underline hover:text-sn-terra', FOCO)}
        >
          {p.nombre}
        </Link>
      </h3>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-0 border-t border-solid border-sn-border pt-3">
        {p.enVenta ? (
          <p data-testid="sn-tienda-catalogo-producto-precio" className="m-0 font-sn-mono text-[12px] font-medium text-sn-green">
            {precioLegible(p.precio)}
            {!esGratuito(p.precio) && p.unidad ? ` / ${p.unidad}` : ''}
          </p>
        ) : (
          <p data-testid="sn-tienda-catalogo-producto-agotado" className="m-0 font-sn-mono text-[12px] font-medium text-sn-terra">
            {TEXTO_AGOTADO}
          </p>
        )}
        <button
          type="button"
          data-testid="sn-tienda-catalogo-producto-vista"
          onClick={alVer}
          className={unirClases('font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink hover:text-sn-terra', FOCO)}
        >
          Vista rápida
        </button>
      </div>
      {quedan !== null && (
        <p data-testid="sn-tienda-catalogo-producto-quedan" className="m-0 font-sn-texto text-sn-cuerpo-xs font-medium text-sn-terra">
          ¡Solo quedan {quedan} disponibles!
        </p>
      )}
      <p data-testid="sn-tienda-catalogo-producto-agregado" role="status" className="m-0 min-h-0 font-sn-texto text-sn-cuerpo-xs font-medium text-sn-green">
        {agregado ? textoAgregado(p.nombre) : ''}
      </p>
    </li>
  )
}
