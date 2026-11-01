// R15 v2 · F5 (historia): clases que repiten las piezas de Chinampas y Nosotros, con los tokens `sn` de CONTRATO-BASE-F1 (§3.3 radios).
// Clases completas siempre (Tailwind no genera clases armadas con plantillas).

/** Una tarjeta de la maqueta (las de «Cuatro caminos», medidas: radio 14, borde sutil, relleno 32/24, 14 entre piezas). El fondo lo pone
 *  quien la usa. Propia y no `ui/Tarjeta` donde el testid repetido lleva su llave en `data-*` (ui/Tarjeta no pasa `data-*`, D-F2-15). */
export const TARJETA = 'flex flex-col gap-3.5 rounded-sn-tarjeta border border-solid border-sn-border px-6 py-8'
