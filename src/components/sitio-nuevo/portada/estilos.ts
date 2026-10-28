// R15 · F2 (WF2, sesión 55): clases que repiten las secciones de la portada. Solo tokens `sn-*` que existen en
// tailwind.config.ts (una clase que no existe no da error y deja el texto sin color). Sin imports.

/** Ancho y márgenes de cada sección (como la página de muestra de F1). */
export const SECCION = 'mx-auto w-full max-w-[1280px] px-6 min-[861px]:px-10'

/** La etiqueta en mono arriba de cada título («Tienda», «Eventos privados»…). */
export const ETIQUETA = 'font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.8px] text-sn-terra'

/** Título de sección (h2). */
export const TITULO =
  'font-sn-titulos text-[36px] leading-[1.02] tracking-[-1px] text-sn-terra min-[861px]:text-[56px]'

/** Párrafo bajo el título. */
export const BAJADA = 'max-w-[520px] text-[15px] leading-[1.6] text-sn-tinta/80'

/** Enlace en pastilla con borde terra («Ver todas →»). Lleva su hover: `a:hover` de globals.css le gana a `text-*`. */
export const PASTILLA =
  'inline-flex shrink-0 items-center gap-2 rounded-sn-pildora border border-sn-terra px-[18px] py-[9px] font-sn-mono text-[11px] font-medium uppercase leading-none tracking-[1.4px] text-sn-terra transition-colors hover:bg-sn-terra hover:text-white'

/** Botón lleno (fondo terra). */
export const BOTON =
  'inline-flex items-center gap-2 rounded-sn-boton bg-sn-terra px-[22px] py-[14px] font-sn-mono text-[11px] font-medium uppercase leading-none tracking-[1.4px] text-white transition-colors hover:bg-sn-tinta hover:text-white'

/** Enlace de texto subrayado en mono («Conoce la chinampa →»). */
export const ENLACE_MONO =
  'inline-flex items-center gap-2 border-b border-current pb-1 font-sn-mono text-[11px] font-medium uppercase leading-none tracking-[1.4px] text-sn-terra hover:text-sn-tinta'

/** Aviso de que la API no respondió (no es contenido que falte: no lleva la marca, como la muestra de F1). */
export const SIN_API = 'rounded-sn-boton border border-sn-borde bg-white px-4 py-3 text-sm text-sn-tinta'
