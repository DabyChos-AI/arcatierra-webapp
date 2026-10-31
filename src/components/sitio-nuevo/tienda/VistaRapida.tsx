'use client'

// R15 v2 · F3 (tienda): la vista rápida de hoy (src/components/ProductQuickView.tsx) en el `Dialogo` de ui/ (foco atrapado, Escape, fondo).
// Lo que va: foto, nombre de lo que se compra (`:127-130`), descripción, `precioLegible` + « / unidad», cantidad −/+ («Quitar uno» /
// «Agregar uno», mínimo 1, `:226-248`), «Agregar al carrito» (`:278`), «Más detalles» → la ficha (`:281-287`) y `TEXTO_AGOTADO`.
// No va (D-F3-24 T-17): estrellas y reseñas (`:132-137`), el «storytelling» y el productor (`:145-150`) ni las «Características» fijas
// (`:171-191`). Al agregar: «{nombre} agregado al carrito» (D-F3-22 P-13) y el diálogo se queda abierto con el aviso.
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { esGratuito, precioLegible } from '@/lib/precio'
import { TEXTO_AGOTADO } from '@/types/tienda'
import Dialogo from '@/components/sitio-nuevo/ui/Dialogo'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { FOTO_RESPALDO } from './TarjetaProducto'
import { agregarProducto, textoAgregado } from './carritoTienda'
import type { ProductoTienda } from './catalogo'

interface Props {
  producto: ProductoTienda | null
  favorito: boolean
  alAlternarFavorito: (id: string, nombre: string) => void
  alCerrar: () => void
}

const REDONDO = 'flex h-9 w-9 items-center justify-center rounded-sn-pildora border border-solid border-sn-muted bg-white text-sn-ink'

export default function VistaRapida({ producto: p, favorito, alAlternarFavorito, alCerrar }: Props) {
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    setCantidad(1)
    setAgregado(false)
  }, [p?.id])

  return (
    <Dialogo abierto={p !== null} onCerrar={alCerrar} etiquetaCerrar="Cerrar" titulo={p?.nombre ?? ''} testId="sn-tienda-vista">
      {p && (
        <div className="flex flex-col gap-5 min-[861px]:flex-row">
          <div className="relative min-[861px]:w-2/5">
            <Foto src={p.imagen || FOTO_RESPALDO} alt={p.nombre} proporcion="1/1" redondeo="tarjeta" sizes="(min-width: 861px) 300px, 90vw" className="bg-sn-cream" />
            <button
              type="button"
              aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              aria-pressed={favorito}
              onClick={() => alAlternarFavorito(p.id, p.nombre)}
              className={unirClases('absolute right-2 top-2', REDONDO, favorito && 'border-sn-terra bg-sn-terra text-white', FOCO)}
            >
              <Heart aria-hidden="true" className={unirClases('h-4 w-4', favorito && 'fill-current')} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            {p.descripcion && <Texto tamano="chico">{p.descripcion}</Texto>}
            {p.enVenta ? (
              <>
                <p data-testid="sn-tienda-vista-precio" className="m-0 font-sn-titulos text-[24px] font-normal text-sn-ink">
                  {precioLegible(p.precio)}
                  {!esGratuito(p.precio) && p.unidad ? <span className="font-sn-mono text-sn-cuerpo-xs"> / {p.unidad}</span> : null}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-testid="sn-tienda-vista-menos"
                    aria-label="Quitar uno"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    className={unirClases(REDONDO, FOCO)}
                  >
                    <span aria-hidden="true">−</span>
                  </button>
                  <span data-testid="sn-tienda-vista-cantidad" aria-live="polite" className="w-8 text-center font-sn-mono text-sn-cuerpo-sm font-medium">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    data-testid="sn-tienda-vista-mas"
                    aria-label="Agregar uno"
                    onClick={() => setCantidad((c) => c + 1)}
                    className={unirClases(REDONDO, FOCO)}
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
              </>
            ) : (
              <p data-testid="sn-tienda-vista-agotado" className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-terra">
                {TEXTO_AGOTADO}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {p.enVenta && (
                <Boton onClick={() => setAgregado(agregarProducto(p, cantidad))} testId="sn-tienda-vista-agregar">
                  Agregar al carrito
                </Boton>
              )}
              <Boton href={`/producto/${encodeURIComponent(p.id)}`} variante="contorno" testId="sn-tienda-vista-detalles">
                Más detalles
              </Boton>
            </div>
            {agregado && <AvisoEnLinea tono="exito">{textoAgregado(p.nombre)}</AvisoEnLinea>}
          </div>
        </div>
      )}
    </Dialogo>
  )
}
