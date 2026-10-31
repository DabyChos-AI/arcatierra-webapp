'use client'

// R15 v2 · F3 (sesión 61): la ficha de producto del sitio nuevo (maqueta `showPage('producto')`). Contrato v2 §9-F3 D-F3-06, D-F3-09,
// D-F3-12, D-F3-13, D-F3-14 (P2), D-F3-22; cadena-v2/f3/ficha-F3.md §4. Los originales son los de la ficha de hoy
// (src/app/producto/[id]/client-page.tsx) y los de `GET /api/products/{itemcode}`:
// - Mientras carga, «Cargando producto...» (:211). Si el producto no existe, está oculto, la API falla o no hay red, a la tienda como hoy
//   (:124-131); la página responde 200 igual que hoy.
// - Migas «Inicio · Tienda · nombre» (D-F3-22 P-12): «Inicio» como liga de navegación (C24; components/catering/Header.tsx:25) y «Tienda» el
//   nombre del menú (armazon/enlaces.ts). La liga «Volver» de hoy no pasa: las migas la reemplazan.
// - La foto: la de la canasta por su nombre o la de la API (:41-48). La API no trae galería ni origen ni productor (F-4, F-1): marcas.
// - Nombre y descripción de la API (:79-94, :298-325); compra, favoritos y datos en sus piezas.
// Diseño medido en la maqueta (ficha-F3.md §1.2): 2 columnas de 568 con 64 de separación desde 861 px, la foto pegada arriba al bajar; una
// columna hasta 860 (la maqueta se sale a 390). Texto chico solo en los pares AA del contrato base (§2.2).
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import Falta from '@/components/sitio-nuevo/Falta'
import { ligasDe } from '@/components/sitio-nuevo/armazon/enlaces'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import CompraFicha from './CompraFicha'
import DatosFicha from './DatosFicha'
import OtrosDeLaTienda from './OtrosDeLaTienda'
import { fotoDeCanasta, idDeLaDireccion, partirDescripcion, pedirFicha, type ProductoFicha } from './ficha'

const TIENDA = ligasDe('cabecera').find((liga) => liga.href === '/tienda')

export default function FichaProducto({ id }: { id: string }) {
  const router = useRouter()
  const [producto, setProducto] = useState<ProductoFicha | null>(null)

  useEffect(() => {
    let vigente = true
    setProducto(null)
    pedirFicha(idDeLaDireccion(id)).then((encontrado) => {
      if (!vigente) return
      if (encontrado) setProducto(encontrado)
      else router.push('/tienda')
    })
    return () => {
      vigente = false
    }
  }, [id, router])

  if (!producto) {
    return (
      <main data-testid="sn-ficha">
        <Contenedor className="py-[60px]">
          <p data-testid="sn-ficha-cargando" role="status" className="m-0 font-sn-texto text-sn-cuerpo font-normal text-sn-ink">
            Cargando producto...
          </p>
        </Contenedor>
      </main>
    )
  }

  const { parrafo, caracteristicas } = partirDescripcion(producto.descripcion)
  const migas = [{ texto: 'Inicio', href: '/' }, ...(TIENDA ? [{ texto: TIENDA.texto, href: TIENDA.href }] : []), { texto: producto.nombre }]

  return (
    <main data-testid="sn-ficha">
      <Contenedor className="pb-[100px] pt-[60px]">
        <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-2 min-[861px]:gap-16">
          <div className="min-w-0 min-[861px]:sticky min-[861px]:top-[100px] min-[861px]:self-start">
            <div className="relative mb-4">
              <Foto
                src={fotoDeCanasta(producto.nombre, producto.imagen)}
                alt={producto.nombre}
                proporcion="1/1"
                redondeo="tarjeta"
                prioridad
                sizes="(min-width: 861px) 568px, 100vw"
                testId="sn-ficha-foto"
                className="bg-sn-cream"
              />
              {producto.categoria && (
                <div className="absolute left-[18px] top-[18px]">
                  <Insignia tono="warm" tamano="chica" testId="sn-ficha-categoria">
                    {producto.categoria}
                  </Insignia>
                </div>
              )}
            </div>
            <div data-testid="sn-ficha-galeria" className="font-sn-texto text-sn-cuerpo-xs">
              <Falta que="fotos de la galería del producto" quien="Lucio y Pablo" como="bloque" />
            </div>
          </div>

          <div className="min-w-0 min-[861px]:py-2">
            <Migas etiqueta="Ruta de navegación" items={migas} testId="sn-ficha-migas" className="mb-[18px]" />
            <p data-testid="sn-ficha-origen" className="m-0 mb-3.5 font-sn-texto text-sn-cuerpo-xs">
              <Falta que="origen y productor de cada producto" quien="Lucio y Pablo" />
            </p>
            <h1
              data-testid="sn-ficha-nombre"
              className="m-0 mb-[18px] break-words font-sn-titulos text-[clamp(40px,4.5vw,60px)] font-normal leading-[1.05] tracking-[-1px] text-sn-ink"
            >
              {producto.nombre}
            </h1>
            <div data-testid="sn-ficha-descripcion" className="mb-8 max-w-[480px]">
              {parrafo && (
                <Texto tamano="grande" tono="ink-suave">
                  {parrafo}
                </Texto>
              )}
              {caracteristicas.length > 0 && (
                <ul className="m-0 mt-3 list-none space-y-2 p-0">
                  {caracteristicas.map((caracteristica, i) => (
                    <li key={`${i}-${caracteristica}`} className="flex items-start gap-3">
                      <Check aria-hidden="true" focusable="false" className="mt-1 h-4 w-4 shrink-0 text-sn-green" />
                      <Texto as="span" tamano="chico" tono="ink-suave">
                        {caracteristica}
                      </Texto>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <CompraFicha producto={producto} />
            <DatosFicha />
          </div>
        </div>
      </Contenedor>
      <OtrosDeLaTienda />
    </main>
  )
}
