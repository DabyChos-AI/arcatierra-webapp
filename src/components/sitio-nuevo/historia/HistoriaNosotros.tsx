// R15 v2 · F5 (historia): «La historia» de /nosotros (maqueta [1]: título, texto a la izquierda y la foto «2009 vs hoy» a la derecha).
// Contrato v2 §9-F5 D-F5-13 P-1, P-7; cadena-v2/f5/historia-F5.md §3.1. Componente de servidor, sin datos de la API.
// - El texto es la historia de hoy por etapas (src/app/nosotros/page.tsx:79-160), letra por letra y en su orden, con las reglas de
//   D-F5-13 P-1: los años de las etapas, «2022» y «2024» están en la lista corta (a); «2010» va como marca «año de inicio» · David (b, C42);
//   NO pasan las oraciones con métricas sin fuente o que chocan con lo firmado (c): la 3.ª de :99 («…más de 20 restaurantes…»), la 1.ª de :123
//   («…más de 30 familias campesinas.») y la de :147 («Con más de 18 chinampas restauradas…»); «diez familias» (:87) y «tres generaciones»
//   (:150) pasan (d). Ninguna oración se corta.
// - Las cifras de la maqueta (años, familias, estados, Estrella Verde) están en `contenido_sitio` sin ruta (C40): marcas a David sin el
//   número, con el mismo `que` del manifiesto de la portada (portada/abajo/Manifiesto.tsx:24-28), y la de cuáles son los 10 estados (C8).
//   «seis estados» de la maqueta sale.
// - La foto «2009 vs hoy» no existe (MAPA-CONTENIDO B §11 #3): marca a Lucio y Pablo. El título no tiene equivalente (el de hoy ya es el
//   `h1`): `h2` oculto con etiqueta neutra (C24). El eyebrow no se pinta.
// Medido en la maqueta: warm, 80/40, columna de 900; dos columnas iguales con 48 entre ellas (texto · foto 4:5 de radio 16); 18 entre párrafos.
import Falta, { type QuienFalta } from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'

const H = 'sn-nosotros-historia'

/** Una etapa: su año (o la marca, si el año de hoy choca con lo firmado) y sus párrafos de hoy. */
type Etapa = { anio: string | null; parrafos: readonly string[] }

const ETAPAS: readonly Etapa[] = [
  {
    anio: null, // :85 «2010» → marca «año de inicio» (C42)
    parrafos: [
      'Arca Tierra nació en Xochimilco con las primeras entregas de alimentos cultivados en chinampas a restaurantes de la Ciudad de México. A partir de una pequeña red de diez familias productoras, comenzó un movimiento para recuperar la agricultura local y revalorar los ingredientes del territorio.',
    ],
  },
  {
    anio: '2011–2013',
    parrafos: [
      'Se implementó la primera chinampa modelo, integrando nuevas técnicas agroecológicas y diversificando los cultivos. El trabajo con las familias chinamperas se consolidó en el Grupo Chapín, una organización campesina que marcó el inicio de una red colaborativa.',
    ],
  },
  {
    anio: '2014–2016',
    parrafos: [
      'Nace Iniciativa Agroecológica Xochimilco, A.C. como aliado clave en la misión de promover saberes y prácticas agroecológicas para dignificar la vida campesina. La red creció con fuerza: más chinampas en producción, un servicio de canastas agroecológicas a domicilio y los primeros talleres de capacitación para familias campesinas dentro y fuera de Xochimilco. En esta etapa, Arca Tierra comenzó a colaborar con comunidades de Hidalgo y otras regiones, ampliando su impacto más allá del Valle de México.',
    ],
  },
  {
    anio: '2017–2019',
    parrafos: [
      'Además de aumentar la producción de alimentos, se recuperaron chinampas abandonadas y se fortaleció la conexión entre productores y consumidores a través de experiencias educativas y cenas comunitarias.',
    ],
  },
  {
    anio: '2020–2022',
    parrafos: [
      'Durante los años más desafiantes, Arca Tierra en conjunto con Iniciativa Agroecológica Xochimilco, A.C. impulsó el programa de Comidas Solidarias, apoyando a hospitales, albergues y familias campesinas. En 2022 se puso en marcha la Escuela Campesina, un espacio de formación para jóvenes del campo que buscan regenerar sus territorios. La red siguió creciendo y sumó nuevas chinampas recuperadas.',
    ],
  },
  {
    anio: '2023–2025',
    parrafos: [
      'La Escuela Campesina ha formado ya tres generaciones de estudiantes, y nuevos proyectos como las chinampas agroforestales medicinales y la colaboración con la UNAM fortalecen su compromiso con la ciencia, la educación y la sostenibilidad.',
      'En 2024, Arca Tierra abrió Baldío, su restaurante en Xochimilco, concebido como un espacio vivo para conectar la cocina con el campo. Baldío celebra el trabajo campesino, los ingredientes locales y la creatividad culinaria que surge cuando se cocina en diálogo con la tierra.',
      'Hoy, Arca Tierra participa en redes internacionales de conservación, como Cultivating Resilience de World Monuments Fund, y continúa su misión de restaurar la relación entre las personas, los alimentos y la tierra.',
    ],
  },
]

/** Las cifras de la maqueta que no tienen ruta, con el `que` del manifiesto de la portada. */
const CIFRAS: ReadonlyArray<{ que: string; quien: QuienFalta }> = [
  { que: 'años en el campo', quien: 'David' },
  { que: 'familias campesinas en la red', quien: 'David' },
  { que: 'estados de la red', quien: 'David' },
  { que: 'cuáles son los 10 estados', quien: 'Lucio y Pablo' },
  { que: 'año de la Estrella Verde Michelin', quien: 'David' },
]

export default function HistoriaNosotros() {
  return (
    <Seccion testId={H} fondo="warm" espacio="normal" borde="arriba" etiquetadaPor={`${H}-titulo`}>
      <Contenedor ancho="angosto">
        <div className="mx-auto max-w-[900px]">
        <h2 id={`${H}-titulo`} data-testid={`${H}-titulo`} className="sr-only font-sn-titulos font-normal">
          Etapas de la historia
        </h2>
        <div className="grid grid-cols-1 items-start gap-12 min-[861px]:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-8">
            <ol data-testid={`${H}-etapas`} className="m-0 flex list-none flex-col gap-8 p-0">
              {ETAPAS.map(({ anio, parrafos }, i) => (
                <li key={anio ?? 'inicio'} data-testid={`${H}-etapa`} data-etapa={i + 1} className="flex flex-col gap-3">
                  <h3 data-testid={`${H}-etapa-anio`} className="m-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-terra">
                    {anio ?? (
                      <span className="font-sn-texto normal-case">
                        <Falta que="año de inicio" quien="David" />
                      </span>
                    )}
                  </h3>
                  <div data-testid={`${H}-etapa-texto`} className="flex flex-col gap-3">
                    {parrafos.map((p) => (
                      <Texto key={p}>{p}</Texto>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <ul data-testid={`${H}-cifras`} className="m-0 flex list-none flex-wrap gap-2 p-0">
              {CIFRAS.map(({ que, quien }) => (
                <li key={que}>
                  <Falta que={que} quien={quien} />
                </li>
              ))}
            </ul>
          </div>
          <Foto
            testId={`${H}-foto`}
            falta={{ que: 'foto de la chinampa de Arca Tierra al empezar y hoy', quien: 'Lucio y Pablo' }}
            redondeo="panel"
          />
        </div>
        </div>
      </Contenedor>
    </Seccion>
  )
}
