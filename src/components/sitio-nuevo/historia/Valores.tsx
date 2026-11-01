// R15 v2 · F5 (historia): «Nuestros Valores» de hoy en /nosotros (lo de hoy que la maqueta no trae y sí pasa: D-F5-13 P-5).
// cadena-v2/f5/historia-F5.md §3.6. Componente de servidor, sin datos de la API. Letra por letra (src/app/nosotros/page.tsx:166, :168,
// :177-180, :187-190, :197-200, :207-210), sin los íconos de hoy, con el lenguaje de la maqueta (tarjetas de «Cuatro caminos»).
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { TARJETA } from './clases'

const H = 'sn-nosotros-valores'
const ID_TITULO = `${H}-encabezado`

const VALORES = [
  { valor: 'sustentabilidad', titulo: 'Sustentabilidad', texto: 'Cuidamos el medio ambiente en cada decisión que tomamos' },
  { valor: 'comercio-justo', titulo: 'Comercio Justo', texto: 'Pagamos precios justos y apoyamos el desarrollo de las comunidades' },
  { valor: 'calidad', titulo: 'Calidad', texto: 'Ofrecemos productos de la más alta calidad, frescos y nutritivos' },
  { valor: 'transparencia', titulo: 'Transparencia', texto: 'Conoces el origen de cada producto y el impacto de tu compra' },
] as const

export default function Valores() {
  return (
    <Seccion testId={H} fondo="cream" espacio="normal" borde="arriba" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <Titulo nivel={2} tamano="h2" id={ID_TITULO} className="mb-4">
          Nuestros Valores
        </Titulo>
        <Texto tamano="grande" className="mb-10">
          Los principios que guían nuestro trabajo diario
        </Texto>
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 min-[861px]:grid-cols-4 min-[861px]:gap-5">
          {VALORES.map(({ valor, titulo, texto }) => (
            <li key={valor} data-testid={`${H}-valor`} data-valor={valor} className={`${TARJETA} bg-sn-warm`}>
              <Titulo nivel={3} tamano="h5">
                {titulo}
              </Titulo>
              <Texto tamano="chico">{texto}</Texto>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
