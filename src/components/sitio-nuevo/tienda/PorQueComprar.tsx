// R15 v2 · F3 (tienda): «¿Por qué comprar en Arca Tierra?» de la tienda de hoy, con su texto (src/app/tienda/page.tsx:1638-1643; sus
// tarjetas están comentadas hoy). D-F3-24 T-14: pasa; «Destacados» e «Información de entrega» no van en F3.
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'

export default function PorQueComprar() {
  return (
    <section data-testid="sn-tienda-porque" aria-labelledby="sn-tienda-porque-titulo" className="border-t border-solid border-sn-border bg-white py-sn-seccion-movil min-[861px]:py-sn-seccion">
      <Contenedor ancho="angosto" className="flex flex-col items-center gap-4 text-center">
        <Titulo nivel={2} tamano="h3" id="sn-tienda-porque-titulo" testId="sn-tienda-porque-titulo">
          ¿Por qué comprar en Arca Tierra?
        </Titulo>
        <Texto tamano="grande" ancho="parrafo" testId="sn-tienda-porque-texto">
          Cada compra alimenta tu salud, apoya al campo y ayuda a regenerar la tierra. Comer bien también puede cambiar el futuro.
        </Texto>
      </Contenedor>
    </section>
  )
}
