'use client'

// R15 v2 · F3 (sesión 61): precio, existencias, cantidad, «Añadir al carrito», su aviso y favoritos de la ficha del sitio nuevo. Contrato v2
// §9-F3 D-F3-12, D-F3-13, D-F3-19 (4), D-F3-22 (P-9, P-13); cadena-v2/f3/ficha-F3.md §4.2. Originales (src/app/producto/[id]/client-page.tsx):
// - Precio con `precioLegible` (lib/precio.ts, el formateador de la tienda de hoy) y la unidad de la API; sin compra única, sin precio
//   (:279-284). Existencias «En stock (N disponibles)» o `TEXTO_AGOTADO` (:285-294).
// - Cantidad de 1 a las existencias, «Quitar uno» / «Agregar uno» (:368-395); «Añadir al carrito» (:416); agotado: el aviso y sin botón
//   (:396-404).
// - Al agregar, el aviso propio del sitio nuevo «{nombre} agregado al carrito» (el mismo de la tienda, T-6) y el contador de la cabecera
//   sube; nunca el carrito lateral de hoy (D-F3-13).
// - Favoritos con `useFavoritos` (la llave de hoy y `/api/favoritos` con sesión, como la tienda) y los avisos de hoy de la ficha
//   (:166-171); si no se pudo guardar, el aviso de la tienda de hoy (tienda/page.tsx:874).
import { useState } from 'react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Precio from '@/components/sitio-nuevo/ui/Precio'
import { FOCO_BOTON, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { aviso } from '@/components/ui/Avisos'
import { useFavoritos } from '@/hooks/useFavoritos'
import { esGratuito, precioLegible } from '@/lib/precio'
import { TEXTO_AGOTADO } from '@/types/tienda'
import { agregarAlCarrito, itemDeLaFicha, type ProductoFicha } from './ficha'

const BOTON_CANTIDAD = unirClases(
  'inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent font-sn-mono text-[16px] text-sn-ink',
  'hover:bg-sn-cream disabled:cursor-not-allowed disabled:opacity-40',
  FOCO_BOTON,
)

export default function CompraFicha({ producto }: { producto: ProductoFicha }) {
  const { venta } = producto
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(0)
  const { esFavorito, toggleFavorito } = useFavoritos()
  const favorito = esFavorito(producto.itemcode)

  const agregar = () => {
    if (!venta.enVenta) return
    if (agregarAlCarrito(itemDeLaFicha(producto), cantidad)) setAgregado((n) => n + 1)
    else aviso.error('No pudimos agregarlo al carrito. Intenta de nuevo.', { titulo: 'Carrito' })
  }

  const alternarFavorito = async () => {
    const { agregado: quedo, exito } = await toggleFavorito(producto.itemcode)
    if (!exito) aviso.error('No se pudo actualizar favoritos. Inténtalo de nuevo.', { titulo: 'Error' })
    else if (quedo) aviso.exito(producto.nombre, { titulo: 'Añadido a favoritos' })
    else aviso.info(producto.nombre, { titulo: 'Eliminado de favoritos' })
  }

  return (
    <div>
      <div className="mb-7 border-b border-t border-solid border-sn-border py-6">
        {producto.conPrecio && (
          <Precio
            valor={precioLegible(venta.precio)}
            unidad={!esGratuito(venta.precio) && producto.unidad ? producto.unidad : undefined}
            tamano="grande"
            testId="sn-ficha-precio"
          />
        )}
        <p
          data-testid="sn-ficha-estado"
          data-en-venta={venta.enVenta ? 'true' : 'false'}
          className={unirClases(
            'm-0 mt-2 font-sn-mono text-sn-etiqueta font-medium uppercase',
            venta.enVenta ? 'text-sn-green' : 'text-sn-terra',
          )}
        >
          {venta.enVenta ? `En stock (${venta.stock} disponibles)` : TEXTO_AGOTADO}
        </p>
      </div>

      {venta.enVenta ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div
            data-testid="sn-ficha-cantidad"
            role="group"
            aria-label="Cantidad"
            className="inline-flex items-center gap-1 rounded-sn-pildora border border-solid border-sn-muted p-1"
          >
            <button
              type="button"
              aria-label="Quitar uno"
              data-testid="sn-ficha-cantidad-menos"
              className={BOTON_CANTIDAD}
              disabled={cantidad <= 1}
              onClick={() => setCantidad((n) => Math.max(1, n - 1))}
            >
              −
            </button>
            <span data-testid="sn-ficha-cantidad-valor" className="min-w-8 text-center font-sn-mono text-[16px] font-medium text-sn-ink">
              {cantidad}
            </span>
            <button
              type="button"
              aria-label="Agregar uno"
              data-testid="sn-ficha-cantidad-mas"
              className={BOTON_CANTIDAD}
              disabled={cantidad >= venta.stock}
              onClick={() => setCantidad((n) => Math.min(venta.stock, n + 1))}
            >
              +
            </button>
          </div>
          <Boton forma="recta" flecha onClick={agregar} testId="sn-ficha-agregar" className="min-w-[220px] flex-1">
            Añadir al carrito
          </Boton>
        </div>
      ) : (
        <p
          data-testid="sn-ficha-agotado"
          role="status"
          className="m-0 mb-4 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-terra"
        >
          {TEXTO_AGOTADO}
        </p>
      )}

      <div aria-live="polite">
        {agregado > 0 && (
          <AvisoEnLinea key={agregado} tono="exito" testId="sn-ficha-agregado" className="mb-4">
            {`${producto.nombre} agregado al carrito`}
          </AvisoEnLinea>
        )}
      </div>

      <div className="mb-9">
        <Boton variante="contorno" forma="recta" tamano="chico" onClick={alternarFavorito} testId="sn-ficha-favorito">
          {favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        </Boton>
      </div>
    </div>
  )
}
