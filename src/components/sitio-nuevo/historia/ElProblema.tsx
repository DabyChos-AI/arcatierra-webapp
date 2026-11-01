// R15 v2 · F5 (historia): «El problema» de /chinampas (maqueta [2]: tres tarjetas de cifra y un párrafo). Contrato v2 §9-F5 D-F5-13 P-7, P-8;
// cadena-v2/f5/historia-F5.md §2.2. Componente de servidor, sin datos de la API.
// - Las tres cifras están en `contenido_sitio` (chinampas_abandonadas, hectareas_urbanas, area_agroecologica: las del Word para esta
//   página), pero ninguna ruta las lee (pregunta C40): `ui/Cifra` lleva la marca a nombre de David en `valor`, sin el número, y la leyenda
//   vacía (la de la maqueta es genérica y la marca ya dice qué es: P-8). Las cifras de hoy de /xochimilco (src/app/xochimilco/page.tsx:190-208)
//   NO pasan (sin fuente; chocan con las firmadas).
// - El título no tiene equivalente: `h2` oculto con etiqueta neutra (C24; D-F4-07 P-3, D-F4-20). El párrafo de la maqueta es prosa sin
//   equivalente (C41 b): marca a Lucio y Pablo. El eyebrow no se pinta.
// - testids (D-F5-13): `-cifra` es el de `ui/Cifra` (con sus `-valor` y `-leyenda`); su llave `data-cifra` va en el `li` que la envuelve,
//   porque `ui/Cifra` no pasa atributos `data-*` (como `ui/Boton` y `ui/Tarjeta`, D-F2-15): qa la lee con `closest('[data-cifra]')` (D-F5-14).
// Medido en la maqueta: cream con borde arriba y abajo, 80/40, columna de 1100; 3 tarjetas warm de radio 14, borde, 36/24, centradas, 18 entre
// ellas y 32 abajo; el número de 72 px en terra (`Cifra grande`); el párrafo de 680.
import Falta from '@/components/sitio-nuevo/Falta'
import Cifra from '@/components/sitio-nuevo/ui/Cifra'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const H = 'sn-chinampas-problema'

const CIFRAS = [
  { cifra: 'abandonadas', que: 'porcentaje de las chinampas que está abandonado' },
  { cifra: 'urbanizadas', que: 'hectáreas de chinampa ya convertidas en zona urbana' },
  { cifra: 'agroecologicas', que: 'porcentaje del área productiva con prácticas agroecológicas' },
] as const

export default function ElProblema() {
  return (
    <Seccion testId={H} fondo="cream" espacio="normal" borde="ambos" etiquetadaPor={`${H}-titulo`}>
      <Contenedor ancho="angosto">
        <h2 id={`${H}-titulo`} data-testid={`${H}-titulo`} className="sr-only font-sn-titulos font-normal">
          Cifras de las chinampas
        </h2>
        <ul data-testid={`${H}-cifras`} className="m-0 mb-8 grid list-none grid-cols-1 gap-[18px] p-0 min-[861px]:grid-cols-3">
          {CIFRAS.map(({ cifra, que }) => (
            <li key={cifra} data-cifra={cifra} className="flex flex-col items-center rounded-sn-tarjeta border border-solid border-sn-border bg-sn-warm px-6 py-9 text-center">
              <Cifra
                testId={`${H}-cifra`}
                tamano="grande"
                tono="terra"
                leyenda=""
                valor={
                  <span className="block font-sn-texto text-sn-cuerpo-sm leading-normal">
                    <Falta que={que} quien="David" />
                  </span>
                }
              />
            </li>
          ))}
        </ul>
        <p data-testid={`${H}-texto`} className="m-0 max-w-[680px] font-sn-texto text-sn-cuerpo-sm">
          <Falta que="texto sobre el abandono de las chinampas" quien="Lucio y Pablo" />
        </p>
      </Contenedor>
    </Seccion>
  )
}
