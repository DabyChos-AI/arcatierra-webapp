// R15 v2 · F5 (historia): «Por qué Arca está ahí» de /chinampas (maqueta [3]: título y texto en una columna angosta). Contrato v2 §9-F5
// D-F5-13; cadena-v2/f5/historia-F5.md §2.3. Componente de servidor, sin datos de la API.
// - Lo de hoy para lo mismo, letra por letra: «Nuestro Trabajo en las Chinampas», su frase y los tres trabajos (src/app/xochimilco/page.tsx:156,
//   :158, :165-168, :173-176, :181-184) y la cita (:213-214, con sus comillas rectas de hoy). El «2009» de la maqueta no se pinta (no es
//   texto de hoy). NO pasa «Impacto de Nuestro Trabajo» (:190-208: cifras sin fuente). El eyebrow no se pinta.
// Medido en la maqueta: warm, 80/40, columna de 1100 con el texto en 680; título con 32 abajo; 18 entre párrafos.
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-chinampas-trabajo'

const TRABAJOS = [
  {
    item: 'regenerativa',
    titulo: 'Agricultura Regenerativa',
    texto:
      'Implementamos técnicas que mejoran la salud del suelo, aumentan la biodiversidad y capturan carbono, respetando los métodos tradicionales.',
  },
  {
    item: 'chinamperos',
    titulo: 'Apoyo a Chinamperos',
    texto:
      'Trabajamos directamente con familias chinamperas, garantizando precios justos y apoyo técnico para mantener viva esta tradición ancestral.',
  },
  {
    item: 'ecosistema',
    titulo: 'Conservación del Ecosistema',
    texto:
      'Protegemos la flora y fauna endémica, incluyendo especies en peligro de extinción como el ajolote de Xochimilco.',
  },
] as const

const CITA =
  '"Cada producto que compras de nuestras chinampas contribuye directamente a la conservación de este patrimonio de la humanidad."'

export default function TrabajoEnLaChinampa() {
  return (
    <Seccion testId={H} fondo="warm" espacio="normal" borde="arriba" etiquetadaPor={`${H}-titulo`}>
      <Contenedor ancho="angosto">
        <div className="max-w-[680px]">
          <Titulo nivel={2} tamano="h2" id={`${H}-titulo`} testId={`${H}-titulo`} className="mb-8">
            Nuestro Trabajo en las Chinampas
          </Titulo>
          <Texto testId={`${H}-texto`} tamano="grande" tono="ink-suave" className="mb-10">
            Cómo conservamos y regeneramos este patrimonio de la humanidad
          </Texto>
          <ul data-testid={`${H}-lista`} className="m-0 mb-10 flex list-none flex-col gap-6 p-0">
            {TRABAJOS.map(({ item, titulo, texto }) => (
              <li key={item} data-testid={`${H}-item`} data-item={item} className="flex flex-col gap-2">
                <Titulo nivel={3} tamano="h5">
                  {titulo}
                </Titulo>
                <Texto>{texto}</Texto>
              </li>
            ))}
          </ul>
          <blockquote
            data-testid={`${H}-cita`}
            className="m-0 border-l-[3px] border-solid border-sn-terra pl-5 font-sn-titulos text-sn-h5 font-normal text-sn-ink"
          >
            {CITA}
          </blockquote>
        </div>
      </Contenedor>
    </Seccion>
  )
}
