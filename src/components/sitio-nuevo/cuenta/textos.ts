// R15 v2 · F6 (cuenta, sesión 64): textos de HOY de Mi cuenta que su archivo no exporta (DR-17), cada uno con su original de `604154b`.
// Los nombres de las pestañas que ya existen en el armazón salen de `armazon/enlaces.ts` (ENLACES_CUENTA), no de aquí (D-F6-11 P-3).
// Sin imports: lo usan componentes de cliente y de servidor.

/** El saludo de hoy, letra por letra (`src/app/usuario/dashboard/page.tsx:364`, D-F6-11 P-5): «Bienvenido, {nombre}». */
export const TEXTO_BIENVENIDO = 'Bienvenido,'
/** El respaldo de hoy cuando no hay nombre (`usuario/dashboard/page.tsx:364`). */
export const TEXTO_USUARIO_SIN_NOMBRE = 'Usuario'

/** El nombre de la pestaña de direcciones (`usuario/dashboard/page.tsx:560`, D-F6-11 P-3). */
export const TEXTO_MIS_DIRECCIONES = 'Mis Direcciones'

/** El botón de salir del menú de la cuenta de hoy (`components/layout/TransparentHeader.tsx:932`; `armazon/MenuCuenta.tsx:148`). */
export const TEXTO_CERRAR_SESION = 'Cerrar Sesión'

/** «Reintentar» de hoy (`usuario/dashboard/page.tsx:345`). */
export const TEXTO_REINTENTAR = 'Reintentar'

/** Si guardar una dirección falla y el proxy no trae un `detail` de texto (`usuario/dashboard/page.tsx:90`, C12 de R7). */
export const TEXTO_ERROR_DIRECCION = 'No pudimos guardar la dirección. Intenta de nuevo.'
/** Lo que responde el proxy cuando no se pudo borrar (`src/app/api/direcciones/[id]/route.ts:111`, `:118`). */
export const TEXTO_ERROR_ELIMINAR_DIRECCION = 'Error eliminando dirección'

/** Si una llamada de la pantalla de hoy falla con una excepción (`usuario/dashboard/page.tsx:180`). */
export const TEXTO_ERROR_CARGANDO = 'Error cargando datos del dashboard'

/** Errores de hoy de las otras pantallas de Mi cuenta, para las mismas llamadas (`usuario/suscripciones/page.tsx:35-36`, `usuario/pedidos/page.tsx:33`). */
export const TEXTO_ERROR_SUSCRIPCIONES = 'No pudimos cargar tus suscripciones. Intenta de nuevo en un momento.'
export const TEXTO_ERROR_PEDIDOS = 'No pudimos cargar tus pedidos. Intenta de nuevo en un momento.'
export const TEXTO_SESION_EXPIRADA = 'Tu sesión expiró. Vuelve a iniciar sesión.'
