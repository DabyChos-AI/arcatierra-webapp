// R15 v2 · F4 (eventos): héroe de /eventos (maqueta `.eventos-hero`: terra, migas, título, frase, foto a la derecha). Contrato v2 D-F4-07
// P-1, P-2. Componente de servidor, sin datos de la API.
// - `<h1>` «Eventos privados» = el nombre de la página (`armazon/enlaces.ts:32`, C20/C49); las dos frases de la maqueta no existen en el
//   sitio (C41): UNA marca a Lucio y Pablo.
// - «De [marca C25] personas, con 72 horas de anticipación.»: la redacción y el `que` de la portada letra por letra (`EventosCatering.tsx:42-43`);
//   72 h = regla firmada (Word P2, REGLAS §6, C9).
// - Foto: la de hoy de una privada con su alt de hoy (`components/HeroCarousel.tsx:17-18`; P-2, información para la Diseñadora).
// Medido en la maqueta a 1440: 2 columnas 714 · 510 con 56 de separación; título 6vw; foto 510 × 638. Sobre terra solo blanco y warm
// pasan AA en texto chico (CONTRATO-BASE-F1 §2.2): el gold de las migas y el ink de la 2.ª frase de la maqueta no se copian.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const H = 'sn-eventos-heroe'

export default function HeroeEventos() {
  return (
    <Seccion testId={H} fondo="terra" espacio="normal" etiquetadaPor={`${H}-titulo`}>
      <Contenedor>
        <div className="grid grid-cols-1 items-center gap-10 min-[861px]:grid-cols-[714fr_510fr] min-[861px]:gap-14">
          <div className="flex min-w-0 flex-col">
            <Migas
              testId={`${H}-migas`}
              etiqueta="Ruta de navegación"
              items={[{ texto: 'Inicio', href: '/' }, { texto: 'Eventos privados' }]}
              sobreOscuro
              className="mb-6"
            />
            <Titulo nivel={1} tamano="hero-xl" tono="warm" id={`${H}-titulo`} testId={`${H}-titulo`}>
              Eventos privados
            </Titulo>
            <div aria-hidden="true" className="my-8 h-px w-full bg-sn-warm/30" />
            <Texto testId={`${H}-texto`} tamano="grande" tono="white" ancho="parrafo" className="mb-5">
              <Falta que="frase del héroe de eventos privados" quien="Lucio y Pablo" />
            </Texto>
            <Texto testId={`${H}-anticipacion`} tamano="grande" tono="white" ancho="parrafo">
              De <Falta que="rango de personas de las visitas privadas" quien="Encargadas de Experiencias" /> personas, con 72 horas de
              anticipación.
            </Texto>
          </div>
          <Foto
            testId={`${H}-foto`}
            src="/images/experiencias/DELCOMALALAHUERTA.jpg"
            alt="Del Comal a la Huerta - Experiencia gastronómica"
            proporcion="4/5"
            redondeo="panel"
            sizes="(min-width: 861px) 510px, 100vw"
            prioridad
          />
        </div>
      </Contenedor>
    </Seccion>
  )
}
