// R15 v2 · F5 (historia): «Cuatro caminos» de /nosotros (maqueta [2]: cuatro tarjetas con número, título, texto y una liga). Contrato v2
// §9-F5 D-F5-13 P-2, P-7, P-9, P-10, P-11; cadena-v2/f5/historia-F5.md §3.2. Componente de servidor, sin datos de la API.
// - Números «01»–«04»: lista corta (D-F2-09 P-6; «04» por D-F5-13 P-11). Títulos: los nombres del menú (armazon/enlaces.ts; «Baldío»,
//   src/components/layout/TransparentHeader.tsx:481; «Eventos y catering» = los dos nombres, P-9).
// - Textos de hoy, letra por letra: tienda (src/app/tienda/page.tsx:980-981; «100%» en la lista corta, D-F3-21), experiencias
//   (src/app/experiencias/page.tsx:215), eventos (:304) y catering (src/components/catering/About.tsx:28-29, sin la oración de «100 por ciento
//   orgánicos», D-F2-13 P-6), Baldío (src/components/baldio/BaldioHero.tsx:70).
// - Ligas con las etiquetas de hoy para cada destino (D-F2-08 b): «Comprar Productos» (src/app/nosotros/page.tsx:291), «Reservar Experiencia»
//   (src/app/xochimilco/page.tsx:293), «Experiencias Privadas» y «Conocer Catering» (las de la portada, portada/abajo/EventosCatering.tsx:8,
//   :13), «Hacer reservación» a la reserva real de El Baldío (src/components/baldio/BaldioCallToAction.tsx:123, :129; C13/C34; P-2), externa.
//   No pasan el correo de reservas (:84, fuera de lib/contacto.ts), la dirección de relleno (:93) ni el horario (:103-104, sin fuente).
// - Estrella Verde: «Estrella Verde Michelin» de hoy sin el año (BaldioHero.tsx:54) y la marca del año a David (C40, P-10).
// - El título de la maqueta no tiene equivalente: `h2` oculto con etiqueta neutra (C24, P-7). El eyebrow no se pinta.
// Medido en la maqueta: cream con borde arriba y abajo, 80/40, columna de 1280; 4 tarjetas warm de radio 14, borde, 32/24, 14 entre piezas y
// 18 entre tarjetas; número serif terra, título de 22 px, texto de 14 px ligera, liga mono terra.
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-nosotros-caminos'
const C = `${H}-camino`

type Liga = { texto: string; href: string; externo?: boolean }
type Camino = { camino: string; numero: string; titulo: string; textos: readonly string[]; ligas: readonly Liga[]; michelin?: boolean }

const CAMINOS: readonly Camino[] = [
  {
    camino: 'tienda',
    numero: '01',
    titulo: 'Tienda',
    textos: ['Alimentos agroecológicos 100% mexicanos — compra directa o por suscripción'],
    ligas: [{ texto: 'Comprar Productos', href: '/tienda' }],
  },
  {
    camino: 'experiencias',
    numero: '02',
    titulo: 'Experiencias',
    textos: ['Sumérgete en la auténtica cultura mexicana a través de experiencias gastronómicas únicas en las chinampas de Xochimilco'],
    ligas: [{ texto: 'Reservar Experiencia', href: '/experiencias' }],
  },
  {
    camino: 'eventos',
    numero: '03',
    titulo: 'Eventos y catering',
    textos: [
      'Momentos exclusivos diseñados especialmente para ti y tus seres queridos',
      'Queremos estar más cerca de ustedes y sus momentos más especiales. Llevamos hasta ustedes los mejores ingredientes.',
    ],
    ligas: [
      { texto: 'Experiencias Privadas', href: '/eventos' },
      { texto: 'Conocer Catering', href: '/catering' },
    ],
  },
  {
    camino: 'baldio',
    numero: '04',
    titulo: 'Baldío',
    textos: [
      'Una experiencia gastronómica única que celebra la sostenibilidad y la riqueza de nuestras chinampas con ingredientes de temporada y cero desperdicio.',
    ],
    ligas: [{ texto: 'Hacer reservación', href: 'https://www.baldio.mx/reservaciones/', externo: true }],
    michelin: true,
  },
]

export default function CuatroCaminos() {
  return (
    <Seccion testId={H} fondo="cream" espacio="normal" borde="arriba" etiquetadaPor={`${H}-titulo`}>
      <Contenedor>
        <h2 id={`${H}-titulo`} data-testid={`${H}-titulo`} className="sr-only font-sn-titulos font-normal">
          Lo que hace Arca Tierra
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-[18px] p-0 sm:grid-cols-2 min-[861px]:grid-cols-4">
          {CAMINOS.map(({ camino, numero, titulo, textos, ligas, michelin }) => (
            <li key={camino} data-testid={C} data-camino={camino} className="flex flex-col gap-3.5 rounded-sn-tarjeta border border-solid border-sn-border bg-sn-warm px-6 py-8">
              <span data-testid={`${C}-numero`} className="font-sn-titulos text-sn-h4 font-normal text-sn-terra">
                {numero}
              </span>
              <Titulo nivel={3} tamano="h5" testId={`${C}-titulo`}>
                {titulo}
              </Titulo>
              {michelin ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Insignia testId={`${C}-insignia`} tono="contorno" forma="pildora" tamano="chica">
                    Estrella Verde Michelin
                  </Insignia>
                  <span className="font-sn-texto text-sn-cuerpo-xs">
                    <Falta que="año de la Estrella Verde Michelin" quien="David" />
                  </span>
                </div>
              ) : null}
              <div data-testid={`${C}-texto`} className="flex flex-col gap-2">
                {textos.map((t) => (
                  <Texto key={t} tamano="chico">
                    {t}
                  </Texto>
                ))}
              </div>
              <div className="mt-auto flex flex-col items-start gap-1 pt-2">
                {ligas.map(({ texto, href, externo }) =>
                  externo ? (
                    <Boton key={href} variante="texto" tamano="chico" flecha href={href} externo testId={`${C}-boton`}>
                      {texto}
                    </Boton>
                  ) : (
                    <Boton key={href} variante="texto" tamano="chico" flecha href={href} testId={`${C}-boton`}>
                      {texto}
                    </Boton>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
