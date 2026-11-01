// R15 v2 · F5 (historia): «Nuestra Misión» y «Nuestra Visión» de hoy en /nosotros (lo de hoy que la maqueta no trae y sí pasa: D-F5-13 P-5).
// cadena-v2/f5/historia-F5.md §3.6. Componente de servidor, sin datos de la API. Letra por letra (src/app/nosotros/page.tsx:48, :51-53, :60,
// :63-65), sin los íconos de hoy, con el lenguaje de la maqueta (dos tarjetas).
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { TARJETA } from './clases'

const H = 'sn-nosotros-mision'

export default function MisionVision() {
  return (
    <Seccion testId={H} fondo="warm" espacio="normal" borde="arriba">
      <Contenedor>
        <div className="grid grid-cols-1 gap-4 min-[861px]:grid-cols-2 min-[861px]:gap-6">
          <article data-testid={`${H}-mision`} className={`${TARJETA} bg-white`}>
            <Titulo nivel={2} tamano="h4">
              Nuestra Misión
            </Titulo>
            <Texto>
              Regenerar los suelos, conservar las chinampas de Xochimilco y producir alimentos agroecológicos de la más alta calidad,
              trabajando de la mano con familias campesinas para crear un sistema alimentario justo y sustentable.
            </Texto>
          </article>
          <article data-testid={`${H}-vision`} className={`${TARJETA} bg-white`}>
            <Titulo nivel={2} tamano="h4">
              Nuestra Visión
            </Titulo>
            <Texto>
              Ser la red líder en México de agricultura regenerativa y comercio justo, conectando productores locales con consumidores
              conscientes para crear un futuro más sustentable y equitativo.
            </Texto>
          </article>
        </div>
      </Contenedor>
    </Seccion>
  )
}
