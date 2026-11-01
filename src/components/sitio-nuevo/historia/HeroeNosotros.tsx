// R15 v2 · F5 (historia): héroe de /nosotros (maqueta `data-page="nosotros"` [0]: migas, título grande y un párrafo). Contrato v2 §9-F5
// D-F5-13; cadena-v2/f5/historia-F5.md §3.0. Componente de servidor, sin datos de la API.
// - `h1` «Nuestra Historia», el de hoy (src/app/nosotros/page.tsx:36; como el manifiesto de la portada, D-F2-13 P-2).
// - La frase del título y el párrafo de la maqueta no existen en el sitio (C41; la frase es de la carta): UNA marca a Lucio y Pablo, como
//   D-F4-07 P-1. «17 años» va en las cifras de la historia (marca a David).
// Medido en la maqueta: cream, 80/40, borde abajo; columna de 1100; migas a 24; título 6vw de 880 con 24 abajo; párrafo de 680.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-nosotros-heroe'

export default function HeroeNosotros() {
  return (
    <Seccion testId={H} fondo="cream" espacio="normal" borde="abajo" etiquetadaPor={`${H}-titulo`}>
      <Contenedor ancho="angosto">
        <Migas
          testId={`${H}-migas`}
          etiqueta="Ruta de navegación"
          items={[{ texto: 'Inicio', href: '/' }, { texto: 'Nosotros' }]}
          sobreCrema
          className="mb-6"
        />
        <Titulo nivel={1} tamano="hero-xl" id={`${H}-titulo`} testId={`${H}-titulo`} className="mb-6 max-w-[880px]">
          Nuestra Historia
        </Titulo>
        <Texto testId={`${H}-texto`} tamano="grande" ancho="parrafo">
          <Falta que="frase del encabezado de Nosotros" quien="Lucio y Pablo" />
        </Texto>
      </Contenedor>
    </Seccion>
  )
}
