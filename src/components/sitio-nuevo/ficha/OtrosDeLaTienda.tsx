// R15 v2 · F3 (sesión 61): «Otros de la tienda» de la ficha (maqueta `section.prod-related`). Contrato v2 §9-F3 D-F3-22 (P-10);
// cadena-v2/f3/ficha-F3.md §4.3. El sitio de hoy no tiene esta sección ni su título (busqué «relacionad», «te puede» y «otros productos»
// en el código de hoy: 0) y qué productos van espera a David (pregunta C45-3): dos marcas, sin llamada a la API y nada elegido a mano,
// como el súper de la portada (D-F2-08 h). Fondo cream con filete arriba, 56 → 80 px; el título en DM Serif 400 y su marca en Inter.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const ID_TITULO = 'sn-ficha-otros-titulo'

export default function OtrosDeLaTienda() {
  return (
    <Seccion testId="sn-ficha-otros" fondo="cream" borde="arriba" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <h2
          id={ID_TITULO}
          data-testid={ID_TITULO}
          className="m-0 mb-8 font-sn-titulos text-[36px] font-normal leading-[1.05] tracking-[-0.5px] text-sn-ink"
        >
          <span className="font-sn-texto text-sn-cuerpo">
            <Falta que="título de la sección de otros productos de la tienda" quien="Lucio y Pablo" />
          </span>
        </h2>
        <div data-testid="sn-ficha-otros-productos" className="font-sn-texto text-sn-cuerpo-xs">
          <Falta que="productos que se muestran en «Otros de la tienda»" quien="David" como="bloque" />
        </div>
      </Contenedor>
    </Seccion>
  )
}
