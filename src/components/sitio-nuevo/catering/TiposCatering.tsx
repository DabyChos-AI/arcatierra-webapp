// R15 v2 · F4 (catering): bloque 2 de /catering, los tipos de evento (maqueta «¿Qué vas a celebrar?»). Contrato v2 §9-F4 D-F4-09 (P-8),
// D-F4-10; cadena-v2/f4/catering-F4.md §2.2. Componente de servidor, sin datos de la API.
// - Los 5 tipos de hoy, en su orden: `components/catering/About.tsx:78`. Sin subtítulo: hoy no existe ninguno para esos tipos (los de la
//   maqueta son genéricos, DR-17).
// - Eyebrow: «Tipo de evento», la etiqueta del formulario de hoy (`components/catering/QuoteRequestModal.tsx:250`, sin el asterisco), en ink
//   (sobre cream terra chico no pasa AA, C17).
// - El titular de la maqueta no tiene equivalente hoy: marca a Lucio y Pablo (C41, D-F2-08 a), en la letra de texto (C36) y con el tamaño
//   del texto, como el título del súper de la portada (`portada/arriba/Super.tsx:20-24`).
// Medido en la maqueta: fondo cream con borde arriba; 5 tarjetas de 242 con hueco de 18, fondo warm, borde 1 px, radio 14, relleno 24/18,
// centradas; título serif de 20 px. Hasta 860 en dos columnas.
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const ID_TITULO = 'sn-catering-tipos-titulo'
const TIPOS = ['Bodas', 'Corporativos', 'Cumpleaños', 'Activaciones', 'Conferencias'] as const

export default function TiposCatering() {
  return (
    <Seccion testId="sn-catering-tipos" fondo="cream" borde="ambos" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <Etiqueta tamano="eyebrow" tono="ink" testId="sn-catering-tipos-etiqueta" className="mb-3.5">
          Tipo de evento
        </Etiqueta>
        <h2 id={ID_TITULO} data-testid={ID_TITULO} className="m-0 mb-12 font-sn-titulos text-sn-cuerpo font-normal text-sn-ink">
          <span className="font-sn-texto">
            <Falta que="titular de los tipos de evento de catering" quien="Lucio y Pablo" />
          </span>
        </h2>
        <ul data-testid="sn-catering-tipos-lista" className="m-0 grid list-none grid-cols-2 gap-[18px] p-0 min-[861px]:grid-cols-5">
          {TIPOS.map((tipo) => (
            <li
              key={tipo}
              data-testid="sn-catering-tipos-tipo"
              data-tipo={tipo}
              className="rounded-sn-tarjeta border border-solid border-sn-border bg-sn-warm px-[18px] py-6 text-center"
            >
              <p className="m-0 font-sn-titulos text-sn-h6 font-normal text-sn-ink">{tipo}</p>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  )
}
