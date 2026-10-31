'use client'

// R15 v2 · F3 (tienda): la rejilla de productos (`.products-grid` de la maqueta: tarjetas warm, 4 columnas a 1440 y 2 a 390; D-F3-24 T-1:
// vistas de 1 · 2 · 4 columnas, por omisión 4 desde 861 y 2 hasta 860). La usan «Compra suelto» y «Agrega extras a tu canasta»
// (`data-pestana`). Estados de la carga con sus textos (D-F3-24 T-12: el de `CanastasGrid.tsx:163` con «los productos»).
import { useState } from 'react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { unirClases } from '@/components/sitio-nuevo/ui/clases'
import TarjetaProducto from './TarjetaProducto'
import VistaRapida from './VistaRapida'
import type { ProductoTienda } from './catalogo'

export type Columnas = 1 | 2 | 4

const REJILLA: Record<Columnas, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  4: 'grid-cols-2 min-[861px]:grid-cols-4',
}

interface Props {
  pestana: 'compra-suelto' | 'extras'
  carga: 'cargando' | 'listo' | 'error'
  productos: ProductoTienda[]
  columnas?: Columnas
  favoritos: readonly string[]
  alAlternarFavorito: (id: string, nombre: string) => void
  reintentar: () => void
}

export default function Catalogo({ pestana, carga, productos, columnas = 4, favoritos, alAlternarFavorito, reintentar }: Props) {
  const [vista, setVista] = useState<ProductoTienda | null>(null)

  if (carga === 'cargando') {
    return (
      <p data-testid="sn-tienda-catalogo-cargando" data-pestana={pestana} aria-busy="true" className="m-0 py-10 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
        Cargando productos frescos...
      </p>
    )
  }
  if (carga === 'error') {
    return (
      <div data-testid="sn-tienda-catalogo-error" data-pestana={pestana} role="alert" className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">No se pudieron cargar los productos. Por favor intenta más tarde.</p>
        <Boton variante="contorno" tamano="chico" onClick={reintentar} testId="sn-tienda-catalogo-reintentar">
          Intentar de nuevo
        </Boton>
      </div>
    )
  }
  if (productos.length === 0) {
    return (
      <p data-testid="sn-tienda-catalogo-vacio" data-pestana={pestana} className="m-0 py-10 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
        No se encontraron productos
      </p>
    )
  }
  return (
    <>
      <ul
        data-testid="sn-tienda-catalogo"
        data-pestana={pestana}
        data-columnas={columnas}
        className={unirClases('m-0 grid list-none gap-4 p-0', REJILLA[columnas])}
      >
        {productos.map((p) => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            favorito={favoritos.includes(p.id)}
            alAlternarFavorito={() => alAlternarFavorito(p.id, p.nombre)}
            alVer={() => setVista(p)}
          />
        ))}
      </ul>
      <VistaRapida producto={vista} favorito={vista ? favoritos.includes(vista.id) : false} alAlternarFavorito={alAlternarFavorito} alCerrar={() => setVista(null)} />
    </>
  )
}
