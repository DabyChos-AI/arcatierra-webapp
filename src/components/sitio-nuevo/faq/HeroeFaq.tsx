// R15 v2 · F5 (recetas, sesión 63): héroe de /faq = `.simple-hero` de la maqueta (las medidas del encabezado de F3,
// `carrito/Encabezado.tsx`, que no trae testids por pieza). Textos de hoy (`src/app/experiencias/faq/page.tsx:39`, `:48`) en lugar de los
// de la maqueta (D-F2-08 a; D-F5-12 P-9 A); sin eyebrow: el de la maqueta dice lo mismo que el título.
// F8 (pulido, D-F8-25, hallazgo H-9): el relleno lateral va en la sección y el contenedor va sin el suyo, como en
// contacto/EncabezadoContacto.tsx: el contenido mide los 1100 px de la maqueta y a 1440 arranca a 170 px (antes 1020 y 210).
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-faq-heroe'

export default function HeroeFaq() {
  return (
    <Seccion
      testId={H}
      fondo="cream"
      borde="abajo"
      espacio="ninguno"
      etiquetadaPor={`${H}-h1`}
      className="px-sn-lateral-movil pb-10 pt-sn-seccion-movil min-[861px]:px-sn-lateral min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion"
    >
      <Contenedor ancho="angosto" relleno={false}>
        <Titulo nivel={1} tamano="hero" tono="terra" id={`${H}-h1`} testId={`${H}-titulo`} className="max-w-sn-titulo">
          Preguntas Frecuentes
        </Titulo>
        <Texto tamano="grande" tono="ink" ancho="parrafo" testId={`${H}-texto`} className="mt-4">
          Encuentra respuestas a las preguntas más comunes sobre nuestras experiencias
        </Texto>
      </Contenedor>
    </Seccion>
  )
}
