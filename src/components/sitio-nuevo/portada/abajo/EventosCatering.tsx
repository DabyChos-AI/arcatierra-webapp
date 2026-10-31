// R15 v2 · F2: bloque 8 de la portada, eventos privados y catering lado a lado (maqueta: rejilla de 2 mitades sin clase). Contrato v2
// §9-F2 D-F2-05, D-F2-06 (dos testids), D-F2-08 b/l/m, D-F2-13; cadena-v2/f2/abajo-F2.md §2.8. Componente de servidor, sin datos de la API.
// Eventos (terra):
// - «Eventos privados» = el nombre de la página nueva que ya usa el armazón (armazon/enlaces.ts:32, C20); título y texto, los de hoy de las
//   privadas (src/app/experiencias/page.tsx:301, :304).
// - 72 horas de anticipación: regla firmada (Word P2, REGLAS-DEL-NEGOCIO §6); el rango de personas espera la pregunta C25 (marca).
// - La marca de los 5 tipos de evento salió con DR-23 (C11 contestada, D-F3-03).
// - Botón a /experiencias?tipo=privada (C20) con la etiqueta que hoy lleva a ese destino (src/components/HeroCarousel.tsx:169-173).
// Catering (cream):
// - «Catering» = el menú de hoy (armazon/enlaces.ts:33); título y texto de hoy (src/components/catering/About.tsx:24-25, :28-29; sin la
//   oración de «100 por ciento orgánicos», cifra sin fuente: D-F2-13 P-6).
// - Los dos sellos de la carta no existen en el sitio (pregunta C41): una marca por sello.
// - Botón a /catering con la etiqueta de hoy (src/app/experiencias/page.tsx:603-604).
// Medido en la maqueta: borde arriba; mitades de 720 px con relleno 72/60 y el contenido centrado en vertical; en el celular la maqueta
// sigue en dos columnas y se sale: aquí se apilan hasta 860 px. Colores AA (C17): sobre terra el eyebrow en warm (el gold de la maqueta no
// pasa) y el texto en blanco; sobre cream nada en terra chico (eyebrow en ink).
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const ID_EVENTOS = 'sn-portada-eventos-titulo'
const ID_CATERING = 'sn-portada-catering-titulo'
const MITAD = 'flex flex-col justify-center py-sn-seccion-lg-movil px-sn-lateral-movil min-[861px]:px-[60px]'

export default function EventosCatering() {
  return (
    <div className="grid grid-cols-1 border-t border-solid border-sn-border min-[861px]:grid-cols-2">
      <Seccion testId="sn-portada-eventos" fondo="terra" espacio="ninguno" etiquetadaPor={ID_EVENTOS} className={MITAD}>
        <Etiqueta tono="warm" testId="sn-portada-eventos-etiqueta" className="mb-6">
          Eventos privados
        </Etiqueta>
        <Titulo nivel={2} tono="warm" id={ID_EVENTOS} testId={ID_EVENTOS} className="mb-[18px]">
          Experiencias Privadas
        </Titulo>
        <Texto tono="white" testId="sn-portada-eventos-texto" className="mb-3 max-w-[420px]">
          Momentos exclusivos diseñados especialmente para ti y tus seres queridos
        </Texto>
        <Texto tono="white" testId="sn-portada-eventos-anticipacion" className="mb-6 max-w-[420px]">
          De <Falta que="rango de personas de las visitas privadas" quien="Encargadas de Experiencias" /> personas, con 72 horas de
          anticipación.
        </Texto>
        <div>
          <Boton sobreOscuro flecha href="/experiencias?tipo=privada" testId="sn-portada-eventos-boton">
            Experiencias Privadas
          </Boton>
        </div>
      </Seccion>

      <Seccion testId="sn-portada-catering" fondo="cream" espacio="ninguno" etiquetadaPor={ID_CATERING} className={MITAD}>
        <Etiqueta tono="ink" testId="sn-portada-catering-etiqueta" className="mb-6">
          Catering
        </Etiqueta>
        <Titulo nivel={2} id={ID_CATERING} testId={ID_CATERING} className="mb-[18px]">
          Catering consciente para eventos únicos
        </Titulo>
        <Texto testId="sn-portada-catering-texto" className="mb-[18px] max-w-[420px]">
          Queremos estar más cerca de ustedes y sus momentos más especiales. Llevamos hasta ustedes los mejores ingredientes.
        </Texto>
        <div data-testid="sn-portada-catering-sellos" className="mb-8 flex flex-wrap gap-2">
          <Falta que="sello de que Baldío cocina en tu evento" quien="Lucio y Pablo" />
          <Falta que="sello de que el dinero va directo a los productores" quien="Lucio y Pablo" />
        </div>
        <div>
          <Boton sobreCrema flecha href="/catering" testId="sn-portada-catering-boton">
            Conocer Catering
          </Boton>
        </div>
      </Seccion>
    </div>
  )
}
