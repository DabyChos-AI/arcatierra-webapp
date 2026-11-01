// R15 v2 · F5 (recetas, sesión 63): el cierre de /recetas de hoy (`src/app/recetas/client-page.tsx:738-791`; la maqueta no lo trae y se
// conserva, D-F5-12 P-6 A). Textos de hoy letra por letra. «Ver Productos Disponibles» a la tienda; «Suscribirse a la Canasta» a la
// pestaña «Canasta lista» de la tienda nueva (D-F3-04: en el sitio nuevo el alta vive ahí; D-F3-22 (1) con `direccionDePestana`), en
// lugar de la página de suscripciones de hoy. Fondo cream con los botones medidos para él (CONTRATO-BASE-F1 §2.2, `sobreCrema`).
import { direccionDePestana } from '@/components/sitio-nuevo/tienda/pestanas'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const C = 'sn-recetas-cierre'

export default function CierreRecetas() {
  return (
    <Seccion testId={C} fondo="cream" etiquetadaPor={`${C}-h2`}>
      <Contenedor ancho="angosto">
        <Titulo nivel={2} tamano="h2" id={`${C}-h2`} testId={`${C}-titulo`} className="max-w-sn-titulo">
          ¿Listo para cocinar con ingredientes de temporada?
        </Titulo>
        <Texto tamano="grande" tono="ink" ancho="parrafo" testId={`${C}-texto`} className="mt-4">
          Descubre todos los ingredientes frescos y orgánicos disponibles en nuestra tienda. Cada producto viene directo de nuestros
          productores agroecológicos.
        </Texto>
        <div className="mt-8 flex flex-wrap gap-4">
          <Boton href="/tienda" sobreCrema testId={`${C}-tienda`}>
            Ver Productos Disponibles
          </Boton>
          <Boton href={`/tienda${direccionDePestana('canasta-lista', '')}`} variante="contorno" sobreCrema testId={`${C}-canasta`}>
            Suscribirse a la Canasta
          </Boton>
        </div>
      </Contenedor>
    </Seccion>
  )
}
