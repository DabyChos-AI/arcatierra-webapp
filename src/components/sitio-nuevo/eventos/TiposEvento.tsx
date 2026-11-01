// R15 v2 · F4 (eventos): los tipos de evento (maqueta `.tipos-section`: tarjetas warm con borde, nombre en serif 22 px). Contrato v2
// D-F4-07 P-3, P-4. Componente de servidor, sin datos de la API.
// - Los 5 tipos de Arca Tierra (DR-23, `tipos.ts`) por nombre, sin pulsar (la API no recibe el tipo). Sin las píldoras de rango ni las
//   descripciones de la maqueta (no existen): UNA marca para la tanda, a las Encargadas de Experiencias. Sin la marca «reemplazan o se
//   suman» (DR-23: «en lugar de»).
// - Encabezado sin original: `<h2>` solo para lectores de pantalla con una etiqueta neutra (C24).
// Medido: relleno 80/40; tarjetas de 285 con 20 de separación, relleno 28, radio 14. Aquí 5 columnas desde 861 y una hasta 860.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import { TIPOS_EVENTO, claveTipo } from './tipos'

const T = 'sn-eventos-tipos'

export default function TiposEvento() {
  return (
    <Seccion testId={T} espacio="normal" etiquetadaPor={`${T}-encabezado`}>
      <Contenedor>
        <h2 id={`${T}-encabezado`} className="sr-only">
          Tipos de evento
        </h2>
        <ul data-testid={`${T}-lista`} className="m-0 grid list-none grid-cols-1 gap-4 p-0 min-[861px]:grid-cols-5 min-[861px]:gap-5">
          {TIPOS_EVENTO.map((nombre) => (
            <li
              key={nombre}
              data-testid={`${T}-tipo`}
              data-tipo={claveTipo(nombre)}
              className="rounded-sn-tarjeta border border-solid border-sn-border bg-sn-warm p-7"
            >
              <h3 className="m-0 font-sn-titulos text-sn-h5 font-normal text-sn-ink">{nombre}</h3>
            </li>
          ))}
        </ul>
        <p data-testid={`${T}-descripcion`} className="m-0 mt-6 font-sn-texto text-sn-cuerpo-sm">
          <Falta que="descripción y rango de personas de cada tipo de evento" quien="Encargadas de Experiencias" />
        </p>
      </Contenedor>
    </Seccion>
  )
}
