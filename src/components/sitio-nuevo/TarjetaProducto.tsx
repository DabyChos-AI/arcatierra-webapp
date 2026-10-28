// R15 · F1 (WF1, sesión 54): la tarjeta de producto de la maqueta (`.product-card` de «El súper sin ir al súper»).
// Componente de servidor con datos de la base (GET /api/products): nombre, descripción, categoría, foto y PRECIO de la base
// (`precio_unitario`), nunca los de la maqueta. El «+» (cliente) agrega al carrito de hoy; toda la tarjeta lleva a la ficha de
// hoy (/producto/{itemcode}). La maqueta trae una línea de origen («Hilado a mano · Reyes Etla, Oax.»): la base no la tiene y
// no se inventa. Sin foto → la marca en el lugar de la foto.
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { TEXTO_AGOTADO } from '@/types/tienda'
import AgregarAlCarrito from './AgregarAlCarrito'
import Falta from './Falta'
import { precioVisible } from './formato'

/** Los fondos de la maqueta para la foto, en orden (crema, azul, oro, arena). */
export const FONDOS_PRODUCTO = ['bg-sn-crema', 'bg-sn-azul', 'bg-sn-oro', 'bg-sn-arena'] as const

type Props = {
  itemcode: string
  nombre: string
  precio: number
  unidad: string | null
  descripcion: string | null
  categoria: string | null
  imagenUrl: string | null
  enVenta: boolean
  /** Posición en la fila: elige el fondo de la foto como la maqueta. */
  indice?: number
}

export default function TarjetaProducto({
  itemcode,
  nombre,
  precio,
  unidad,
  descripcion,
  categoria,
  imagenUrl,
  enVenta,
  indice = 0,
}: Props) {
  const fondo = FONDOS_PRODUCTO[indice % FONDOS_PRODUCTO.length]
  const href = `/producto/${encodeURIComponent(itemcode)}`
  return (
    <article
      data-testid="sn-tarjeta-producto"
      data-itemcode={itemcode}
      className="group relative flex min-w-0 flex-col rounded-sn-tarjeta font-sn-texto text-sn-tinta transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className={`relative aspect-square overflow-hidden rounded-sn-tarjeta p-[18px] ${fondo}`}>
        {imagenUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-[3px]">
            <OptimizedImage
              src={imagenUrl}
              alt={nombre}
              fill
              sizes="(min-width: 1100px) 300px, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full items-center">
            <Falta como="bloque" que={`foto de ${nombre}`} quien="Lucio y Pablo" />
          </div>
        )}
        {categoria && (
          <span className="absolute left-6 top-6 z-[2] max-w-[calc(100%-3rem)] truncate rounded bg-sn-calido/80 px-[10px] py-[5px] font-sn-mono text-[9px] font-medium uppercase leading-[1.55] tracking-[1.1px] text-sn-tinta backdrop-blur-[4px]">
            {categoria}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[6px] border-t border-sn-borde px-2 pt-[22px]">
        <h3 className="mb-1 font-sn-titulos text-[17px] leading-[1.15] tracking-[-0.2px] text-sn-tinta">
          {/* Enlace estirado: toda la tarjeta lleva a la ficha; el «+» queda encima. `static`: globals.css pone
              `position: relative` a todo <a> y el ::after se quedaría del tamaño del nombre. */}
          <Link
            href={href}
            data-testid="sn-tarjeta-producto-enlace"
            className="static text-sn-tinta after:absolute after:inset-0 after:content-[''] hover:text-sn-terra"
          >
            {nombre}
          </Link>
        </h3>
        {descripcion && (
          <p className="mb-2 line-clamp-2 text-[13px] font-light leading-[1.5] text-sn-tinta/75">{descripcion}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-sn-borde pt-3">
          <p data-testid="sn-tarjeta-producto-precio" className="font-sn-titulos text-lg leading-[1.55] tracking-[-0.2px]">
            {precioVisible(precio)}
            {unidad ? <span className="text-sn-tinta/75"> / {unidad}</span> : null}
          </p>
          {enVenta ? (
            <AgregarAlCarrito itemcode={itemcode} nombre={nombre} precio={precio} imagen={imagenUrl} unidad={unidad} />
          ) : (
            <span data-testid="sn-tarjeta-producto-agotado" className="font-sn-mono text-[10px] uppercase tracking-[1.1px] text-sn-tinta/75">
              {TEXTO_AGOTADO}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
