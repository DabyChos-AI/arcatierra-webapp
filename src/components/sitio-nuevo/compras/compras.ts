// R15 v2 · F6 (compras, sesión 64): lógica pura de Pedidos y Suscripciones de Mi cuenta (sin React, sin I/O). Contrato v2 §8-F6, D-F6-04,
// D-F6-08. Lo que hoy ya se exporta se IMPORTA de los normalizar.ts de hoy (usuario/pedidos y usuario/suscripciones); aquí solo va lo que vive
// dentro de una página de hoy o que no se puede importar sin arrastrar un estado que ya no existe. Cada función se prueba contra la de hoy en
// la copia de compras (pruebas/compras-contra-hoy.mjs).
import { calcularCostoEnvio, type TipoEntrega } from '@/lib/envio'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import type { MiSuscripcion } from '@/types/cuenta'
import { HREF_INICIAR_SESION, HREF_TIENDA } from '@/components/sitio-nuevo/armazon/enlaces'
import { direccionDePestana } from '@/components/sitio-nuevo/tienda/pestanas'

/** Tono de `ui/Insignia` para un estado. */
export type TonoEstado = 'green' | 'warm' | 'contorno'

/** Pedido: los mismos tres grupos que `claseEstado` de hoy (`usuario/pedidos/normalizar.ts:92-96`): pagado o entregado · cancelado o
 *  reembolsado · lo demás. */
export function tonoEstadoPedido(estado: string): TonoEstado {
  if (estado === 'pagado' || estado === 'pagado_sin_stock' || estado === 'entregado') return 'green'
  if (estado === 'cancelado' || estado === 'reembolsado') return 'warm'
  return 'contorno'
}

/** Suscripción: los mismos grupos que `claseEstado` de hoy (`usuario/suscripciones/normalizar.ts:63-67`). */
export function tonoEstadoSuscripcion(estado: string): TonoEstado {
  if (estado === 'activa') return 'green'
  if (estado === 'cancelada') return 'warm'
  return 'contorno'
}

// D-F6-08 P-3: lista CERRADA con los cuatro estados que escribe la API hoy (`routers/subscriptions.py:164, :196, :226`;
// `services/suscripcion_estado.py:87`), con el texto que les da la etiqueta de hoy (`usuario/suscripciones/normalizar.ts:48-61`: «Activa»,
// «Pendiente», «Cancelada» y la mayúscula inicial de «error»). Cualquier otro estado va sin pastilla.
const ETIQUETAS_SUSCRIPCION: Readonly<Record<string, string>> = Object.freeze({
  activa: 'Activa',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  error: 'Error',
})

/** El texto de la pastilla de una suscripción, o null si ese estado no lleva pastilla. */
export function etiquetaEstadoSuscripcion(estado: string): string | null {
  return Object.prototype.hasOwnProperty.call(ETIQUETAS_SUSCRIPCION, estado) ? ETIQUETAS_SUSCRIPCION[estado] : null
}

/** El id del pedido tal como lo da `use(params)` (Next 15 lo entrega codificado): se decodifica; si no se puede, tal cual. Es la regla de
 *  `usuario/pedidos/[id]/page.tsx:35-41`. */
export function decodificarId(valor: string): string {
  try {
    return decodeURIComponent(valor)
  } catch {
    return valor
  }
}

/** Junta una página nueva de pedidos sin repetir los que ya estaban (`usuario/pedidos/page.tsx:141-148`). */
export function juntarPaginas<T extends { id: string }>(antes: readonly T[], nuevos: readonly T[]): T[] {
  const vistos = new Set(antes.map((p) => p.id))
  return [...antes, ...nuevos.filter((p) => !vistos.has(p.id))]
}

/** La lista de `GET /api/subscriptions/extras-disponibles` (`{entregas: CanastaExtras[]}`, `routers/subscriptions.py:311-322`) o null si la
 *  respuesta no trae esa forma. Se quedan solo los renglones con lo que pinta DR-18. */
export function leerEntregas(datos: unknown): CanastaExtras[] | null {
  const lista = (datos as { entregas?: unknown } | null)?.entregas
  if (!Array.isArray(lista)) return null
  return lista.filter(
    (e): e is CanastaExtras =>
      !!e &&
      typeof e === 'object' &&
      typeof (e as CanastaExtras).suscripcion_id === 'string' &&
      typeof (e as CanastaExtras).entrega_id === 'string' &&
      typeof (e as CanastaExtras).fecha_entrega === 'string' &&
      typeof (e as CanastaExtras).ultimo_dia_para_pagar === 'string' &&
      typeof (e as CanastaExtras).abierta === 'boolean',
  )
}

/** DR-18: la próxima canasta de una suscripción ACTIVA, de `extras-disponibles` (que solo trae las activas con una canasta programada,
 *  `services/extras_suscripcion.py:64-74`), o null. */
export function entregaDe(s: Pick<MiSuscripcion, 'id' | 'estado'>, entregas: readonly CanastaExtras[]): CanastaExtras | null {
  if (s.estado !== 'activa') return null
  return entregas.find((e) => e.suscripcion_id === s.id) ?? null
}

/** D-F6-08 P-2: el envío que cobra MercadoPago en cada entrega (`routers/subscriptions.py:137-141`: `calcular_costo_envio(precio, tipo)`),
 *  con la MISMA regla del front (`lib/envio.ts`). El tipo sale de la canasta en `extras-disponibles` si viene; si no, a domicilio (como las 19
 *  suscripciones de la base). */
export function envioDeSuscripcion(precio: number, entrega: Pick<CanastaExtras, 'tipo_entrega'> | null): number {
  const tipo: TipoEntrega = entrega?.tipo_entrega === 'recoger_almacen' ? 'recoger_almacen' : 'envio_domicilio'
  return calcularCostoEnvio(precio, tipo)
}

/** DR-18 (D-F3-22 P-5, D-F6-06): la pestaña de extras de la tienda nueva, `/tienda?pestana=extras`. */
export const HREF_AGREGAR_EXTRAS = `${HREF_TIENDA}${direccionDePestana('extras', '')}`

/** D-F6-08 P-7: el alta de suscripción del sitio nuevo vive en la pestaña «Canasta lista» de la tienda, `/tienda?pestana=canasta-lista`. */
export const HREF_SUSCRIBIRSE = `${HREF_TIENDA}${direccionDePestana('canasta-lista', '')}`

/** Lo que manda «Iniciar sesión» de vuelta a la pantalla (`usuario/pedidos/page.tsx:92`, `[id]/page.tsx:168`, `suscripciones/page.tsx:142`). */
export function hrefIniciarSesion(destino: string): string {
  return `${HREF_INICIAR_SESION}?callbackUrl=${encodeURIComponent(destino)}`
}

// ─── CHKX1 (R15 v2 · F7, arreglos; contrato v2 D-F7-05, D-F7-14; D-F6-08 P-12) ────────────────────────────────────────────
// «Agregar productos a esta entrega» (DR-18) deja en `sessionStorage` la entrega de ESA canasta y el checkout nuevo la preselecciona UNA vez
// («Entregar con mi canasta del {fecha}»), solo si la API todavía la da como abierta y el carrito no trae experiencias. Sin la llave, el checkout
// empieza como hoy en «Comprar con envío normal» (D-F3-32). Precedentes de `sessionStorage` en el sitio: el apartado (`arcaTierraApartado`,
// `lib/carrito.ts`) y el popup (`armazon/Anuncio.tsx`). Si el navegador bloquea el almacenamiento, no pasa nada (como `lib/carrito.ts:96-98`).

/** Llave de `sessionStorage` con el `entrega_id` de la canasta a la que el cliente quiso agregar productos. */
export const CLAVE_CANASTA_DE_EXTRAS = 'arcaTierraCanastaDeExtras'

/** La guarda el botón «Agregar productos a esta entrega» en su clic (en el mismo bloque síncrono, antes de navegar). */
export function recordarCanastaDeExtras(entregaId: string): void {
  try {
    window.sessionStorage.setItem(CLAVE_CANASTA_DE_EXTRAS, entregaId)
  } catch {
    /* sessionStorage bloqueado: el checkout empezará como hoy */
  }
}

/** La lee el checkout UNA vez y la borra (se consume): null si no hay o si el almacenamiento está bloqueado. */
export function tomarCanastaDeExtras(): string | null {
  try {
    const entregaId = window.sessionStorage.getItem(CLAVE_CANASTA_DE_EXTRAS)
    window.sessionStorage.removeItem(CLAVE_CANASTA_DE_EXTRAS)
    return entregaId || null
  } catch {
    return null
  }
}

/** La canasta a preseleccionar: la de ese `entrega_id` solo si la API la trae ABIERTA; si no (cerrada, otra, sin llave), null. */
export function canastaParaPreseleccionar(canastas: readonly CanastaExtras[], entregaId: string | null): CanastaExtras | null {
  if (!entregaId) return null
  return canastas.find((c) => c.abierta && c.entrega_id === entregaId) ?? null
}
