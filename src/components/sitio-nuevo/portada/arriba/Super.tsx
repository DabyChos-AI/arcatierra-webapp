// R15 v2 · F2 (sesión 59): bloque 5 de la portada, «el súper» (maqueta `.super-section`). Contrato v2 §9-F2 D-F2-08 (h), D-F2-09.
// - Su titular no tiene equivalente en el sitio de hoy (pregunta C41) y los 4 productos no tienen criterio (pregunta C45-2): dos marcas, nada
//   elegido a mano y ningún «+» sin producto. El párrafo de la maqueta tampoco existe y no se pinta (D-F2-09, P-12).
// - Las ligas a la tienda llevan la etiqueta de hoy para /tienda: «Explorar Tienda» (src/app/page.tsx:235).
// - El titular va en la letra de títulos (D-F2-16) y solo la marca va en la letra de texto, en un span: es negrita y DM Serif no la trae
//   (C36; hallazgo H1 de revision, como Manifiesto de abajo).
// Diseño medido en la maqueta: 96 px, cabeza con filete (título y liga en píldora), la rejilla de productos y la liga centrada. Servidor.
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const HREF_TIENDA = '/tienda'
const ETIQUETA_TIENDA = 'Explorar Tienda'

export default function Super() {
  return (
    <Seccion testId="sn-portada-super" espacio="grande">
      <Contenedor>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-solid border-sn-border pb-[18px]">
          <h2 className="m-0 font-sn-titulos text-sn-cuerpo font-normal text-sn-ink">
            <span className="font-sn-texto">
              <Falta que="título de la sección del súper" quien="Lucio y Pablo" />
            </span>
          </h2>
          <Boton href={HREF_TIENDA} variante="contorno" tamano="chico" flecha testId="sn-portada-super-tienda">
            {ETIQUETA_TIENDA}
          </Boton>
        </div>
        <div data-testid="sn-portada-super-productos" className="mt-10 flex min-[861px]:mt-14">
          <Falta como="bloque" que="productos de la sección del súper" quien="David" />
        </div>
        <div className="mt-12 flex justify-center">
          <Boton href={HREF_TIENDA} variante="contorno" tamano="chico" flecha testId="sn-portada-super-tienda-fin">
            {ETIQUETA_TIENDA}
          </Boton>
        </div>
      </Contenedor>
    </Seccion>
  )
}
