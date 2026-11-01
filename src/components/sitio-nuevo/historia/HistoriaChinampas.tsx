// R15 v2 · F5 (historia): «Historia y Tradición» de /xochimilco en /chinampas (lo de hoy que la maqueta no trae y sí pasa: D-F5-13 P-5).
// cadena-v2/f5/historia-F5.md §2.5. Componente de servidor, sin datos de la API.
// - Título, frase y las tres épocas, letra por letra (src/app/xochimilco/page.tsx:111, :113, :122-126, :133-137, :144-148). «Más de mil
//   años» va en letra, como hoy: es el mismo dato que «1,000» de la lista corta (D-F5-13 P-1 a) y no choca con «siglo IX» firmado.
// - Con el lenguaje de la maqueta (las tarjetas de «Cuatro caminos» de Nosotros), sin los íconos de hoy. Tarjetas propias y no `ui/Tarjeta`:
//   el testid repetido lleva su llave en `data-epoca` y `ui/Tarjeta` no pasa atributos `data-*` (D-F2-15).
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import { TARJETA } from './clases'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-chinampas-historia'
const ID_TITULO = `${H}-encabezado`

const EPOCAS = [
  {
    epoca: 'prehispanica',
    titulo: 'Época Prehispánica',
    texto:
      'Los pueblos originarios desarrollan este sistema para cultivar en los lagos del Valle de México, creando una de las agriculturas más productivas del mundo.',
  },
  {
    epoca: 'colonial',
    titulo: 'Época Colonial',
    texto:
      'A pesar de los cambios, las chinampas continúan siendo fundamentales para alimentar a la Ciudad de México, adaptándose a nuevas condiciones.',
  },
  {
    epoca: 'actualidad',
    titulo: 'Actualidad',
    texto:
      'Arca Tierra y las familias chinamperas trabajan para conservar y regenerar este patrimonio, combinando tradición con técnicas modernas sustentables.',
  },
] as const

export default function HistoriaChinampas() {
  return (
    <Seccion testId={H} fondo="warm" espacio="normal" borde="arriba" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <Titulo nivel={2} tamano="h2" id={ID_TITULO} className="mb-4">
          Historia y Tradición
        </Titulo>
        <Texto tamano="grande" tono="ink-suave" className="mb-10">
          Más de mil años de sabiduría agrícola ancestral
        </Texto>
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 min-[861px]:grid-cols-3 min-[861px]:gap-6">
          {EPOCAS.map(({ epoca, titulo, texto }) => (
            <li key={epoca} data-testid={`${H}-epoca`} data-epoca={epoca} className={`${TARJETA} bg-white`}>
              <Titulo nivel={3} tamano="h5">
                {titulo}
              </Titulo>
              <Texto tamano="chico">{texto}</Texto>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
