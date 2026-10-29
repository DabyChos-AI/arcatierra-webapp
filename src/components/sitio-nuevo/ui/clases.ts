import { clsx, type ClassValue } from 'clsx'

// R15 · F1 v2 (CONTRATO-BASE-F1 §4, §5.4): piezas compartidas de las clases del sitio nuevo.

/**
 * Une clases SIN fusionarlas. No usar `cn()` de src/lib/utils.ts aquí: `tailwind-merge` no conoce las llaves `sn` y puede tirar una
 * clase creyendo que choca con otra (`text-sn-cuerpo` con `text-sn-ink`: tamaño y color). Lo que pase quien usa la pieza va al final.
 */
export function unirClases(...clases: ClassValue[]): string {
  return clsx(...clases)
}

/**
 * Foco con teclado (C18, hand-off §10, medido en la maqueta: contorno de 2 px terra, separación de 3 px). `globals.css` pinta un
 * contorno terracota también con el ratón (`*:focus`): `focus:outline-none` lo quita y `focus-visible:` lo devuelve solo con teclado.
 */
export const FOCO =
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-sn-terra'

/** El mismo foco sobre fondo oscuro (terra, forest, green, ink): terra no se vería; `warm` da 4.78–11.45. */
export const FOCO_SOBRE_OSCURO =
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-sn-warm'

/** Botones: la maqueta les da 4 px de separación (`button:focus-visible { outline-offset: 4px }`). */
export const FOCO_BOTON =
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sn-terra'

export const FOCO_BOTON_SOBRE_OSCURO =
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sn-warm'
