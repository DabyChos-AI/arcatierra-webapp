// R15 v2 · F2: bloque 10 de la portada, la franja de prensa (maqueta `.prensa-section`). Contrato v2 §9-F2 D-F2-05, D-F2-08 b/i, D-F2-13;
// cadena-v2/f2/abajo-F2.md §2.10. Componente de servidor, sin datos de la API.
// - «Prensa»: el nombre de hoy de la página (menú de hoy, TransparentHeader.tsx:485; src/components/prensa/Hero.js:5).
// - Los medios esperan el permiso (pregunta C45-1): el sitio ya publica 32 notas (src/data/prensa/pressData.js), pero la portada lleva una
//   marca a nombre de David en su lugar.
// - «Ver todos» no se pinta: /prensa no tiene decisión todavía (pregunta C44; D-F2-08 b). El armazón tampoco liga a /prensa.
// Medido en la maqueta: fondo warm, borde arriba, 60 px arriba y abajo y 40 a los lados; una fila (que se envuelve) en 1280 px de
// contenido. La etiqueta al 55 % de la maqueta no pasa AA: va en ink.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const ID_TITULO = 'sn-portada-prensa-titulo'

export default function Prensa() {
  return (
    <Seccion
      testId="sn-portada-prensa"
      fondo="warm"
      borde="arriba"
      espacio="ninguno"
      etiquetadaPor={ID_TITULO}
      className="px-sn-lateral-movil py-[60px] min-[861px]:px-sn-lateral"
    >
      <Contenedor relleno={false} className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {/* El h2 de globals.css trae letra, tamaño, color y margen: aquí se pisan todos. */}
        <h2 id={ID_TITULO} data-testid={ID_TITULO} className="m-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
          Prensa
        </h2>
        <div data-testid="sn-portada-prensa-medios">
          <Falta que="medios de prensa que se muestran en la portada" quien="David" />
        </div>
      </Contenedor>
    </Seccion>
  )
}
