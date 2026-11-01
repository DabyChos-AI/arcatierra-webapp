// R15 v2 · F4 (catering): bloque 0 de /catering, el héroe (maqueta `[data-page="catering"]`, 1.ª sección). Contrato v2 §9-F4 D-F4-09
// (P-4, P-8), D-F4-10; cadena-v2/f4/catering-F4.md §1 y §2.0. Componente de servidor, sin datos de la API.
// Originales de hoy (DR-17): el título y el párrafo de `components/catering/Hero.tsx:44` y `:50-51`; la foto de `Hero.tsx:26` (hoy es un
// fondo sin texto alternativo: aquí decorativa), 4:5 como el marco de la maqueta; «Cotizar mi evento» (`Hero.tsx:90`) lleva al formulario de
// esta página (D-F4-09 P-4; el WhatsApp de catering sigue en «Planifica tu evento»). Migas: «Inicio» y el nombre del menú (`armazon/enlaces.ts:33`).
// Medido en la maqueta: fondo sand; rejilla 714/510 con hueco de 56 alineada abajo; título hero en green (3.91 sobre sand: solo título
// grande); el párrafo va en ink (green chico no pasa AA sobre sand) y las migas con ligas en ink. El botón es el primario de `ui/Boton`
// en recto (la maqueta lo pinta green, que `ui/Boton` no trae: información para la Diseñadora, D-F4-09 P-9). Hasta 860 una sola columna.
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const ID_TITULO = 'sn-catering-heroe-titulo'

export default function HeroeCatering() {
  return (
    <Seccion testId="sn-catering-heroe" fondo="sand" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <Migas
          etiqueta="Ruta de navegación"
          items={[{ texto: 'Inicio', href: '/' }, { texto: 'Catering' }]}
          sobreCrema
          testId="sn-catering-heroe-migas"
          className="mb-6"
        />
        <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] min-[861px]:items-end min-[861px]:gap-14">
          <div>
            <Titulo nivel={1} tamano="hero-xl" tono="green" id={ID_TITULO} testId={ID_TITULO} className="mb-[18px]">
              Catering consciente CDMX
            </Titulo>
            <Texto tamano="grande" peso="ligero" testId="sn-catering-heroe-texto" className="mb-8 max-w-[560px]">
              Menús agroecológicos con alimentos frescos, locales y de agricultura regenerativa. Experiencia en eventos únicos.
            </Texto>
            <Boton href="#cotizar" forma="recta" flecha testId="sn-catering-heroe-cotizar">
              Cotizar mi evento
            </Boton>
          </div>
          <Foto
            src="/images/catering/hero-background.jpg"
            decorativa
            proporcion="4/5"
            redondeo="panel"
            sizes="(min-width: 861px) 36vw, 100vw"
            prioridad
            testId="sn-catering-heroe-foto"
          />
        </div>
      </Contenedor>
    </Seccion>
  )
}
