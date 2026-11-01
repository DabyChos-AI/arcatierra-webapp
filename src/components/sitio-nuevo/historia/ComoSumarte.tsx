// R15 v2 · F5 (historia): el cierre terra de Chinampas («Cómo puedes ayudar») y de Nosotros («Cómo te puedes sumar»). Contrato v2 §9-F5
// D-F5-13; cadena-v2/f5/historia-F5.md §2.4 y §3.5. Componente de servidor, sin datos de la API.
// - Título, texto y botones: los de cada página de hoy, que pasa quien la usa (con su archivo:línea en su comentario).
// - La organización hermana (Iniciativa Agroecológica Xochimilco) se nombra hoy sin liga (src/app/nosotros/page.tsx:111, :135) e
//   iax.org.mx no está en ningún archivo (D-F5-06): sin destino válido no se pinta (D-F2-08 b); va UNA marca a Lucio y Pablo.
// Maqueta: fondo terra, todo centrado; el eyebrow no se pinta (sin equivalente, D-F4-07 P-10). Sobre terra solo blanco y warm en texto
// chico (CONTRATO-BASE-F1 §2.2): título warm, texto blanco; botones `suave` (relleno warm, texto ink) y `contorno` sobre oscuro.
// Medido en la maqueta: 96/40, columna de 780 centrada; título 56 px con 20 abajo; párrafo de 16 px con 32 abajo; botones de radio 6 (`recta`),
// 14 entre ellos y 32 abajo.
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

type Liga = { texto: string; href: string; testId: string }

type Props = {
  /** Testid de la sección: `sn-chinampas-ayudar` o `sn-nosotros-sumarte`; los de adentro son `${base}-titulo`, `-texto`, `-iax`. */
  base: string
  titulo: string
  texto: string
  /** Dos ligas, en el orden de la maqueta: la primera con relleno y la segunda con contorno. */
  ligas: readonly [Liga, Liga]
}

export default function ComoSumarte({ base, titulo, texto, ligas }: Props) {
  const [primera, segunda] = ligas
  return (
    <Seccion testId={base} fondo="terra" espacio="grande" etiquetadaPor={`${base}-titulo`}>
      <Contenedor ancho="titulo">
        <div className="mx-auto flex max-w-[780px] flex-col items-center text-center">
        <Titulo nivel={2} tamano="h2" tono="warm" id={`${base}-titulo`} testId={`${base}-titulo`} className="mb-5">
          {titulo}
        </Titulo>
        <Texto testId={`${base}-texto`} tono="white" className="mb-8">
          {texto}
        </Texto>
        <div className="mb-8 flex flex-col items-center gap-3.5 min-[861px]:flex-row">
          <Boton variante="suave" forma="recta" sobreOscuro href={primera.href} testId={primera.testId}>
            {primera.texto}
          </Boton>
          <Boton variante="contorno" forma="recta" sobreOscuro href={segunda.href} testId={segunda.testId}>
            {segunda.texto}
          </Boton>
        </div>
        <p data-testid={`${base}-iax`} className="m-0 font-sn-texto text-sn-cuerpo-xs">
          <Falta que="texto y liga de la organización hermana (Iniciativa Agroecológica Xochimilco)" quien="Lucio y Pablo" />
        </p>
        </div>
      </Contenedor>
    </Seccion>
  )
}
