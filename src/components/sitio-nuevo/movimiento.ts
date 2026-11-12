// R15 v2 · F8 (pulido; contrato v2 D-F8-11, D-F8-16): el movimiento del sitio nuevo, en un solo lugar. Tres gestos con los tiempos y las
// curvas que declara la maqueta (cadena-v2/f8/pulido-F8.md §1–§2): lo que se puede abrir sube 4 px y su flecha avanza; el color cambia en
// 200 ms; lo que aparece entra con un fundido corto. Solo se mueven la posición y la opacidad: nada cambia de tamaño ni empuja a lo de al lado.
// - Las clases de abajo ya están en el CSS que comparte el sitio de hoy (medido en la build de f918496), salvo las CUATRO que mueven o
//   agrandan al pasar el ratón: esas van solo donde hay ratón (D-F8-19), para que en un teléfono nada se quede levantado después de un
//   toque. Son cuatro reglas nuevas, dentro de su propia consulta de medios: no tocan ninguna regla de hoy (C16; se mide con comparar-css).
// - Grupos con nombre (D-F8-23): cada flecha y cada foto responde SOLO al ratón sobre su propio control o su propia pieza, nunca a un
//   contenedor ajeno. Quien lleva el grupo pone la marca de abajo (GRUPO_…) y lo de adentro, su clase.
//   Tailwind lee también los comentarios de este archivo: aquí no va ningún nombre de clase fuera de las constantes.
// - Lo que aparece va con la Web Animations API, como el salto del contador y la entrada del cajón (armazon/Cabecera.tsx y
//   armazon/MenuCelular.tsx): sin reglas de CSS y sin animación con «reducir movimiento» (hand-off §10).
// Sin hooks: sus constantes las importan también componentes de servidor.

/** Lo que se puede abrir sube 4 px al pasar el ratón (maqueta `.banner-3p-v7-card:hover`, `.product-card:hover`: 4 px en .3 s). */
export const LEVANTA = 'transition-transform duration-300 ease-out [@media(hover:hover)]:hover:-translate-y-1 motion-reduce:[transition:none]'

/** El botón o la liga que lleva una flecha: la marca de su grupo. */
export const GRUPO_BOTON = 'group/boton'
/** La flecha avanza 4 px cuando el ratón está sobre SU botón o SU liga (maqueta `.f-v7-news-form button:hover`, `.t-route-v5-arrow`). */
export const FLECHA_AVANZA =
  'transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover/boton:translate-x-1 motion-reduce:[transition:none]'

/** La tarjeta que es toda una liga: la marca de su grupo. */
export const GRUPO_TARJETA = 'group/tarjeta'
/** La flecha de una tarjeta-liga avanza 4 px cuando el ratón está sobre esa tarjeta (maqueta `.banner-3p-v7-arrow`). */
export const FLECHA_DE_TARJETA =
  'transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover/tarjeta:translate-x-1 motion-reduce:[transition:none]'

/** La pieza cuya foto crece: la marca de su grupo. */
export const GRUPO_FOTO = 'group/foto'

/** La foto crece a 1.05 dentro de un marco que la recorta, con el ratón sobre su pieza (maqueta `.hero-photo`, `.banner-3p-v7-img img`); la duración la pone quien la usa. */
export const FOTO_CRECE = 'transition-transform ease-out [@media(hover:hover)]:group-hover/foto:scale-105 motion-reduce:[transition:none]'

/** La curva de la maqueta para lo que entra (cajón, popup, tarjetas). */
export const CURVA_SUAVE = 'cubic-bezier(.16,1,.3,1)'

/**
 * De dónde arranca un fundido: casi 0, nunca 0. A la vista es lo mismo, y así nada tiene opacidad 0 en ningún instante: lo que se acaba de
 * abrir (una respuesta, un panel, una ventana) cuenta como visible desde el primer cuadro (contrato v2 D-F8-20; la cuenta de marcas de qa).
 */
export const OPACIDAD_DE_ENTRADA = 0.01

/** El `fadeIn` de la maqueta (los paneles de Mi cuenta, `.cuenta-pane.is-active`): fundido subiendo 4 px en .25 s. */
export const CUADROS_PANEL: Keyframe[] = [
  { opacity: OPACIDAD_DE_ENTRADA, transform: 'translateY(4px)' },
  { opacity: 1, transform: 'none' },
]
export const TIEMPO_PANEL: KeyframeAnimationOptions = { duration: 250, easing: 'ease' }

/** ¿Se anima? No en el servidor y no con «reducir movimiento». */
export function hayMovimiento(): boolean {
  return typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Anima `el` una vez. Sin elemento, sin la API o con «reducir movimiento» no hace nada y devuelve null. */
export function animar(el: Element | null | undefined, cuadros: Keyframe[], opciones: KeyframeAnimationOptions): Animation | null {
  if (!el || typeof el.animate !== 'function' || !hayMovimiento()) return null
  return el.animate(cuadros, opciones)
}
