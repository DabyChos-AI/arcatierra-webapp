'use client'

// R15 · F2 (WF3, sesión 55): «Compra suelto» (la pestaña «Probar» de la maqueta). El catálogo real (`GET /api/products`,
// sin canastas) con la tarjeta de F1 (TarjetaProducto + AgregarAlCarrito: mismo carrito y mismo CartSidebar de hoy).
// Los filtros son las categorías reales de `/api/products/categories` y SÍ filtran (en la maqueta eran inertes): mismo
// criterio que la tienda de hoy (`product.categoria === selectedCategory`, src/app/tienda/page.tsx:799).
import { useMemo, useState } from 'react'
import TarjetaProducto from '../TarjetaProducto'
import type { ProductoMuestra } from '@/lib/sitio-nuevo-contenido'
import type { CategoriaTienda } from './tipos'

const POR_TANDA = 12
const TODO = ''

export default function PestanaSuelto({ productos, categorias }: { productos: ProductoMuestra[]; categorias: CategoriaTienda[] }) {
  const [categoria, setCategoria] = useState(TODO)
  const [mostrar, setMostrar] = useState(POR_TANDA)

  const filtrados = useMemo(
    () => (categoria === TODO ? productos : productos.filter((p) => p.categoria === categoria)),
    [productos, categoria],
  )
  const visibles = filtrados.slice(0, mostrar)
  const faltan = filtrados.length - visibles.length

  const elegir = (c: string) => {
    setCategoria(c)
    setMostrar(POR_TANDA)
  }

  return (
    <div data-testid="sn-tienda-suelto" data-total={filtrados.length}>
      <div className="flex flex-col gap-2 min-[861px]:flex-row min-[861px]:items-end min-[861px]:justify-between">
        <div>
          <h2 className="font-sn-titulos text-[36px] leading-none tracking-[-1px] min-[861px]:text-[48px]">Compra suelto.</h2>
          <p className="mt-3 max-w-[560px] text-sm leading-[1.6] text-sn-tinta/80">
            La forma más fácil de empezar: elige uno o varios productos, sin suscripción. Si te gusta, pasas a una canasta.
          </p>
        </div>
        <p className="font-sn-mono text-[11px] uppercase tracking-[1.4px] text-sn-gris">Sin suscripción</p>
      </div>

      {categorias.length > 0 && (
        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="mt-6 flex flex-wrap gap-2 border-b border-sn-borde pb-5"
        >
          {[{ nombre: TODO, total: productos.length }, ...categorias].map((c) => {
            const activa = c.nombre === categoria
            return (
              <button
                key={c.nombre || 'todo'}
                type="button"
                aria-pressed={activa}
                data-testid="sn-tienda-filtro"
                data-categoria={c.nombre}
                onClick={() => elegir(c.nombre)}
                className={`rounded-sn-pildora border px-3 py-1.5 font-sn-mono text-[11px] font-medium uppercase tracking-[1.1px] transition-colors ${
                  activa
                    ? 'border-sn-tinta bg-sn-tinta text-sn-calido'
                    : 'border-sn-borde bg-white text-sn-tinta hover:border-sn-tinta'
                }`}
              >
                {c.nombre || 'Todo'}
              </button>
            )
          })}
        </div>
      )}

      {visibles.length === 0 ? (
        <p data-testid="sn-tienda-suelto-vacio" role="status" className="mt-8 text-sm text-sn-tinta/80">
          No hay productos a la venta en este momento.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 min-[861px]:grid-cols-3 min-[1100px]:grid-cols-4">
          {visibles.map((p, i) => (
            <TarjetaProducto
              key={p.itemcode}
              itemcode={p.itemcode}
              nombre={p.nombre}
              precio={p.precio}
              unidad={p.unidad}
              descripcion={p.descripcion}
              categoria={p.categoria}
              imagenUrl={p.imagenUrl}
              enVenta={p.enVenta}
              indice={i}
            />
          ))}
        </div>
      )}

      {faltan > 0 && (
        <div className="mt-10 text-center">
          <button
            type="button"
            data-testid="sn-tienda-ver-mas"
            onClick={() => setMostrar((n) => n + POR_TANDA)}
            className="rounded-sn-boton bg-sn-oro px-5 py-3 font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-tinta transition-colors hover:bg-sn-arena"
          >
            Ver más productos · {faltan} más
          </button>
        </div>
      )}
    </div>
  )
}
