// R15 v2 · F4 (catering): bloque 1 de /catering, «tres cosas» de la maqueta con la propuesta de hoy. Contrato v2 §9-F4 D-F4-09 (P-7, P-8),
// D-F4-10; cadena-v2/f4/catering-F4.md §2.1. Componente de servidor, sin datos de la API.
// - Eyebrow y título de hoy: «Nuestra propuesta» y «Catering consciente para eventos únicos» (`components/catering/About.tsx:22`, `:24-25`).
// - Tarjeta 01: «Menús de temporada» con su texto (`components/catering/Services.tsx:60-61`).
// - Tarjetas 02 y 03: los sellos de la carta no los dice ninguna página de hoy (C41, MAPA B §11 #14): marca a Lucio y Pablo, con el mismo
//   texto que la portada.
// - Cifras (familias de la red, año de la Estrella Verde, familias de catering): existen en `contenido_sitio`, pero ninguna ruta las lee
//   (C40): marca a David, sin el número (D-F2-08 c). Los ordinales 01/02/03 son de la maqueta (lista corta, D-F4-09 P-7).
// - Las marcas dentro de letra de título van en la letra de texto (Falta pinta en negrita; DM Serif no la trae, C36), y un título que es
//   solo una marca va con el tamaño del texto, como el del súper de la portada (`portada/arriba/Super.tsx:20-24`).
// Medido en la maqueta: eyebrow terra; tarjetas de 384 con hueco de 24, borde ink de 1 px, radio 14, relleno 32/28; número serif de
// 32 px en terra; título serif de 22 px; texto de 14 px ligero. Hasta 860 una sola columna.
import Falta, { type QuienFalta } from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

const ID_TITULO = 'sn-catering-razones-titulo'

type Marca = { que: string; quien: QuienFalta }
type Razon = { numero: '01' | '02' | '03'; titulo: string | Marca; texto?: string; cifra: Marca }

const RAZONES: readonly Razon[] = [
  {
    numero: '01',
    titulo: 'Menús de temporada',
    texto:
      'Diseñamos menús de temporada con ingredientes frescos y locales, garantizando sabores deliciosos y responsables. Trabajamos de la mano de nuestros chefs para ofrecer platillos inspirados en la temporada.',
    cifra: { que: 'familias campesinas en la red', quien: 'David' },
  },
  {
    numero: '02',
    titulo: { que: 'sello de que Baldío cocina en tu evento', quien: 'Lucio y Pablo' },
    cifra: { que: 'año de la Estrella Verde Michelin', quien: 'David' },
  },
  {
    numero: '03',
    titulo: { que: 'sello de que el dinero va directo a los productores', quien: 'Lucio y Pablo' },
    cifra: { que: 'familias campesinas de catering', quien: 'David' },
  },
]

export default function RazonesCatering() {
  return (
    <Seccion testId="sn-catering-razones" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <Etiqueta tamano="eyebrow" tono="terra" testId="sn-catering-razones-etiqueta" className="mb-3.5">
          Nuestra propuesta
        </Etiqueta>
        <Titulo nivel={2} id={ID_TITULO} testId={ID_TITULO} className="mb-12 max-w-[600px]">
          Catering consciente para eventos únicos
        </Titulo>
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 min-[861px]:grid-cols-3">
          {RAZONES.map((r) => (
            <li
              key={r.numero}
              data-testid="sn-catering-razones-tarjeta"
              data-razon={r.numero}
              className="flex flex-col rounded-sn-tarjeta border border-solid border-sn-ink px-7 py-8"
            >
              <p data-testid="sn-catering-razones-tarjeta-numero" className="m-0 mb-[18px] font-sn-titulos text-[32px] font-normal leading-[1.55] text-sn-terra">
                {r.numero}
              </p>
              {typeof r.titulo === 'string' ? (
                <Titulo nivel={3} tamano="h5" testId="sn-catering-razones-tarjeta-titulo" className="mb-3.5">
                  {r.titulo}
                </Titulo>
              ) : (
                <h3 data-testid="sn-catering-razones-tarjeta-titulo" className="m-0 mb-3.5 font-sn-titulos text-sn-cuerpo font-normal text-sn-ink">
                  <span className="font-sn-texto">
                    <Falta que={r.titulo.que} quien={r.titulo.quien} />
                  </span>
                </h3>
              )}
              {r.texto && (
                <Texto tamano="chico" peso="ligero" testId="sn-catering-razones-tarjeta-texto" className="mb-4">
                  {r.texto}
                </Texto>
              )}
              <p data-testid="sn-catering-razones-tarjeta-cifra" className="m-0 font-sn-texto text-sn-cuerpo-sm">
                <Falta que={r.cifra.que} quien={r.cifra.quien} />
              </p>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
