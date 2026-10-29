// R15 v2 · F2: bloque 6 de la portada, la franja de restaurantes (maqueta `.restaurantes-strip`). Contrato v2 §9-F2 D-F2-05, D-F2-08 i,
// D-F2-13; cadena-v2/f2/abajo-F2.md §2.6. Componente de servidor, sin datos de la API.
// - Textos de hoy de /restaurantes (DR-17): su h1 «Servicio a Restaurantes» (src/app/restaurantes/page.tsx:296) y su h2 (:302), que
//   equivalen a las dos frases de la etiqueta de la maqueta.
// - Los nombres de los restaurantes esperan el permiso (pregunta C45-1): una marca a nombre de David en su lugar.
// - «Contacto» lleva a /restaurantes (C13): ahí sigue viva la solicitud de restaurantes.
// Medido en la maqueta: franja cream con borde arriba y abajo, 30 px de relleno, tres columnas dentro de 1280 px. A 390 la maqueta se sale
// (1363 px de ancho): aquí las columnas se apilan hasta 860 px. El relleno de 40 px va en la sección y los 1280 px quedan para el
// contenido, como en la maqueta. Sobre cream el texto chico va en ink (terra no llega a 4.5, C17).
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const ID_TITULO = 'sn-portada-restaurantes-titulo'
const HREF_RESTAURANTES = '/restaurantes'

export default function Restaurantes() {
  return (
    <Seccion
      testId="sn-portada-restaurantes"
      fondo="cream"
      borde="ambos"
      espacio="ninguno"
      etiquetadaPor={ID_TITULO}
      className="px-sn-lateral-movil py-[30px] min-[861px]:px-sn-lateral"
    >
      <Contenedor relleno={false} className="grid grid-cols-1 items-center gap-4 min-[861px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[861px]:gap-8">
        <div className="flex flex-col gap-1">
          {/* El h2 de globals.css trae letra, tamaño, color y margen: aquí se pisan todos. */}
          <h2 id={ID_TITULO} data-testid={ID_TITULO} className="m-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-ink">
            Servicio a Restaurantes
          </h2>
          <Etiqueta tono="ink" testId="sn-portada-restaurantes-texto">
            Del campo regenerativo a las mejores cocinas de la ciudad
          </Etiqueta>
        </div>

        <div data-testid="sn-portada-restaurantes-nombres" className="flex justify-start min-[861px]:justify-center">
          <Falta que="restaurantes que se muestran en la portada" quien="David" />
        </div>

        <div>
          <Boton
            variante="texto"
            tamano="chico"
            sobreCrema
            flecha
            href={HREF_RESTAURANTES}
            testId="sn-portada-restaurantes-contacto"
          >
            Contacto
          </Boton>
        </div>
      </Contenedor>
    </Seccion>
  )
}
