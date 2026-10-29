// R15 v2 · F2: bloque 9 de la portada, el manifiesto «quiénes somos» (maqueta `.qs-manifesto`). Contrato v2 §9-F2 D-F2-05, D-F2-08 a/c/l,
// D-F2-13; cadena-v2/f2/abajo-F2.md §2.9. Componente de servidor, sin datos de la API.
// - Textos de hoy de /nosotros (DR-17): «Sobre Nosotros» (la liga de hoy, TransparentHeader.tsx:484), «Nuestra Historia»
//   (src/app/nosotros/page.tsx:73) y la historia con dos oraciones letra por letra: la 1.ª de :87 y la de :156 (D-F2-13 P-3: sin números).
// - Cifras (desde, años, familias, estados, Estrella Verde): existen en `contenido_sitio`, pero ninguna ruta las lee (pregunta C40). Van
//   como marcas a nombre de David, sin el número en su texto (D-F2-08 c). «seis estados» de la maqueta sale. Además, la marca de la muestra
//   de hoy de cuáles son los 10 estados (C8), con el mismo texto (D-F2-08 l).
// - La segunda línea del título («Cada temporada nos enseña algo nuevo») es de la carta, sin equivalente: marca a Lucio y Pablo (C41).
// - «Conoce Más» → /nosotros: la etiqueta de hoy en la portada de hoy (src/app/page.tsx:238-240).
// - Las marcas dentro de letra de título o mono van en la letra de texto (Falta pinta en negrita; DM Serif y DM Mono no la traen, C36).
// Medido en la maqueta: fondo warm, 120 px arriba y abajo, todo centrado en una columna de 920 px; título serif de 40 → 72 px en terra;
// párrafo de 17 px al 80 % (aquí ink al 70 %, que pasa AA sobre warm); botón con borde terra y radio 6.
import Falta, { type QuienFalta } from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'

const ID_TITULO = 'sn-portada-manifiesto-titulo'

/** Las cifras del manifiesto que no tienen ruta, en el orden de la maqueta; la de cuáles estados va junto a la de cuántos. */
const CIFRAS: ReadonlyArray<{ que: string; quien: QuienFalta }> = [
  { que: 'años en el campo', quien: 'David' },
  { que: 'familias campesinas en la red', quien: 'David' },
  { que: 'estados de la red', quien: 'David' },
  { que: 'cuáles son los 10 estados', quien: 'Lucio y Pablo' },
  { que: 'año de la Estrella Verde Michelin', quien: 'David' },
]

export default function Manifiesto() {
  return (
    <Seccion testId="sn-portada-manifiesto" fondo="warm" borde="ambos" espacio="enfasis" etiquetadaPor={ID_TITULO} className="px-sn-lateral-movil min-[861px]:px-sn-lateral">
      <div className="mx-auto flex w-full max-w-[920px] flex-col items-center text-center">
        <Insignia tono="contorno" forma="pildora" tamano="chica" testId="sn-portada-manifiesto-sello" className="mb-7 gap-1">
          <span className="font-sn-texto">
            <Falta que="año de inicio" quien="David" />
          </span>
          <span aria-hidden="true">·</span>
          <span>Xochimilco</span>
        </Insignia>

        <Etiqueta tamano="eyebrow" testId="sn-portada-manifiesto-etiqueta" className="mb-6">
          Sobre Nosotros
        </Etiqueta>

        {/* El h2 de globals.css trae letra, peso, color, tracking y margen: aquí se pisan todos. */}
        <h2
          id={ID_TITULO}
          data-testid={ID_TITULO}
          className="m-0 mb-8 font-sn-titulos text-[clamp(40px,5vw,72px)] font-normal leading-[1.02] tracking-[-1.5px] text-sn-terra"
        >
          Nuestra Historia
          <span className="mt-3 block font-sn-texto text-sn-cuerpo-lg">
            <Falta que="frase del manifiesto" quien="Lucio y Pablo" />
          </span>
        </h2>

        <Texto tamano="grande" tono="ink-suave" testId="sn-portada-manifiesto-historia" className="mb-6 max-w-[680px]">
          Arca Tierra nació en Xochimilco con las primeras entregas de alimentos cultivados en chinampas a restaurantes de la Ciudad de
          México. Hoy, Arca Tierra participa en redes internacionales de conservación, como Cultivating Resilience de World Monuments Fund,
          y continúa su misión de restaurar la relación entre las personas, los alimentos y la tierra.
        </Texto>

        <ul data-testid="sn-portada-manifiesto-cifras" className="m-0 mb-10 flex list-none flex-wrap justify-center gap-2 p-0">
          {CIFRAS.map(({ que, quien }) => (
            <li key={que}>
              <Falta que={que} quien={quien} />
            </li>
          ))}
        </ul>

        <Boton variante="contorno" tamano="chico" forma="recta" flecha href="/nosotros" testId="sn-portada-manifiesto-boton">
          Conoce Más
        </Boton>
      </div>
    </Seccion>
  )
}
