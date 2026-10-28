// R15 · F1 (WF1 + WF7, sesión 54): la cinta de la maqueta (`.ticker`, versión T2: fondo cálido, texto tinta, viñetas terra, 50 s)
// con los textos PUBLICADOS de la sección `cinta` de contenido_sitio, en su orden. Componente de servidor.
//
// - Vacía (nada publicado o la API no respondió) → la marca <Falta que="textos de la cinta" quien="Lucio y Pablo"/>. Los textos
//   de la maqueta («6 estados», «isla flotante»…) son de relleno y no se cargan (contrato C15).
// - La animación mueve dos copias iguales (-50 %); para que no quede hueco con pocos textos, cada copia repite la lista hasta
//   tener al menos MIN_POR_COPIA renglones. Los lectores de pantalla leen la lista una sola vez (el resto va aria-hidden).
// - Se detiene al pasar el ratón y no se mueve con «reducir movimiento».
import type { DatosCinta, ElementoPublico } from '@/types/contenido-sitio'
import Falta from './Falta'

const MIN_POR_COPIA = 8

export default function Cinta({ elementos }: { elementos: ElementoPublico<DatosCinta>[] }) {
  if (elementos.length === 0) {
    return (
      <div
        data-testid="sn-cinta"
        data-vacia="1"
        className="flex min-h-11 items-center justify-center border-y border-sn-borde bg-sn-calido px-5 py-2 text-center"
      >
        <Falta que="textos de la cinta" quien="Lucio y Pablo" />
      </div>
    )
  }

  const vueltas = Math.max(1, Math.ceil(MIN_POR_COPIA / elementos.length))
  const copia = Array.from({ length: vueltas }, () => elementos).flat()
  const renglones = [...copia, ...copia]

  return (
    <section
      data-testid="sn-cinta"
      data-vacia="0"
      aria-label="Avisos de Arca Tierra"
      className="group relative flex h-11 items-center overflow-hidden border-y border-sn-borde bg-sn-calido"
    >
      <ul className="flex shrink-0 animate-sn-cinta whitespace-nowrap group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {renglones.map((el, i) => {
          const original = i < elementos.length
          return (
            <li
              key={`${el.id}-${i}`}
              aria-hidden={original ? undefined : true}
              data-testid={original ? 'sn-cinta-texto' : undefined}
              className="flex h-10 shrink-0 items-center border-r border-sn-terra/20 px-7 font-sn-mono text-[11.5px] font-medium uppercase leading-[1.55] tracking-[1.4px] text-sn-tinta"
            >
              <span aria-hidden="true" className="mr-2 text-sn-terra">
                ·
              </span>
              {el.datos.texto}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
