// R15 v2 · F5 (recetas, sesión 63): ArcaTips, después de la rejilla (hoy es una pestaña, `src/app/recetas/client-page.tsx:605-657`; la
// maqueta no los trae y se conservan, D-F5-12 P-5 A). Título y texto de hoy (:616-621); las 4 de `tipsData` importadas
// (`src/data/recetas.ts:1898-1927`: título, descripción y categoría; el «10 días» de la primera es dato importado, D-F3-12 c) sin el
// emoji de `icon` (los textos del sitio nuevo van sin emojis; información para la Diseñadora).
import { tipsData } from '@/data/recetas'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const C = 'sn-recetas-consejos'

export default function ConsejosRecetas() {
  return (
    <Seccion testId={C} fondo="white" borde="arriba" etiquetadaPor={`${C}-h2`}>
      <Contenedor ancho="medio">
        <Titulo nivel={2} tamano="h2" id={`${C}-h2`} testId={`${C}-titulo`}>
          ArcaTips de Cocina Sustentable
        </Titulo>
        <Texto tamano="grande" tono="ink-suave" ancho="parrafo" testId={`${C}-texto`} className="mt-4">
          Aprende técnicas ancestrales y modernas para aprovechar al máximo cada ingrediente
        </Texto>
        <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-6 p-0 min-[861px]:grid-cols-2">
          {tipsData.map((tip) => (
            <li
              key={tip.id}
              data-testid={`${C}-tarjeta`}
              data-consejo-id={tip.id}
              className="rounded-sn-tarjeta border border-solid border-sn-border bg-sn-warm p-7 text-sn-ink"
            >
              <Etiqueta tamano="etiqueta" tono="terra" testId={`${C}-tarjeta-categoria`}>
                {tip.category}
              </Etiqueta>
              <Titulo nivel={3} tamano="h5" testId={`${C}-tarjeta-titulo`} className="mt-3">
                {tip.title}
              </Titulo>
              <Texto tamano="chico" tono="ink-suave" testId={`${C}-tarjeta-texto`} className="mt-3">
                {tip.description}
              </Texto>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
