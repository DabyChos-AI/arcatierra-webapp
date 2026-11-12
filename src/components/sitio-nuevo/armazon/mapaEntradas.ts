// R15 v2 · F8 (pulido; contrato v2 D-F8-16, D-F8-20, D-F8-23 · P-9, «propuesta nueva»: NO está en la maqueta): qué bloques entran al
// acercarse a la pantalla, por página. La llave es la dirección del sitio nuevo en segmentos (la portada = sin segmentos). Solo páginas
// editoriales: nunca tienda, ficha, carrito, checkout, Mi cuenta ni entrar (D-F8-16). Hoy, solo la portada (D-F8-23).
// Cada renglón es el selector de lo que entra, con testids que YA existen (ninguna sección cambia): siempre el contenido de adentro, nunca
// una franja con color de fondo (al moverse dejaría ver el fondo de la página), ni una pieza dentro de una fila que se desliza de lado.
// Los bloques que comparten padre y llegan a la vez entran uno tras otro (las tres puertas a 1440); apilados, cada uno al llegar.

const t = (testid: string) => `[data-testid="${testid}"]`

export const MAPA_ENTRADAS: Readonly<Record<string, readonly string[]>> = {
  // La portada (src/app/nuevo/page.tsx). El lema, el héroe y la cinta son la primera pantalla y no entran al mapa.
  '': [
    // Tres puertas: la cabeza (título y texto) y cada puerta.
    `${t('sn-portada-puertas')} ${t('sn-contenedor')} > div:first-child`,
    t('sn-portada-puertas-puerta'),
    // Experiencias: la cabeza y la fila de tarjetas entera (la fila se desliza de lado: sus tarjetas no se mueven una por una).
    `${t('sn-portada-experiencias')} ${t('sn-contenedor')} > div:first-child`,
    t('sn-portada-experiencias-lista'),
    // El súper: la cabeza, los productos y la liga.
    `${t('sn-portada-super')} ${t('sn-contenedor')} > *`,
    // Restaurantes: el contenido de la franja.
    `${t('sn-portada-restaurantes')} > ${t('sn-contenedor')}`,
    // La pausa de la chinampa: el texto y la foto.
    `${t('sn-portada-chinampa')} > div > *`,
    // Eventos privados y catering: lo de adentro de cada mitad (las mitades llevan color de fondo).
    `${t('sn-portada-eventos')} > *`,
    `${t('sn-portada-catering')} > *`,
    // El manifiesto: su columna.
    `${t('sn-portada-manifiesto')} > div`,
    // Prensa: el contenido de la franja.
    `${t('sn-portada-prensa')} > ${t('sn-contenedor')}`,
  ],
}
