/**
 * El carrito de la web: localStorage `arcaTierraCart` + el evento `cartUpdated` (lo escuchan el header y el
 * CartSidebar). Antes cada página escribía su propio objeto `any`; las experiencias usaban la experiencia como
 * llave y dos fechas chocaban. Fase 4 de PLAN-EXP-SIN-FALLAS (sesión 39). Lo escribe el líder.
 *
 * Solo navegador (usa window/localStorage). Los productos NO cambian de forma: estos helpers solo tocan las
 * experiencias y dejan los productos tal cual.
 */
import {
  CLAVE_APARTADO,
  CLAVE_CARRITO,
  MAX_LUGARES_POR_COMPRA,
  esExperienciaVieja,
  esItemExperiencia,
  type ItemCarritoExperiencia,
} from '@/types/compra-experiencias'

type ItemCarrito = Record<string, unknown> & { id: string; quantity: number }

export function leerCarrito(): ItemCarrito[] {
  if (typeof window === 'undefined') return []
  try {
    const crudo = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO) || '[]')
    return Array.isArray(crudo) ? crudo : []
  } catch {
    return []
  }
}

export function guardarCarrito(items: ItemCarrito[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items))
  window.dispatchEvent(new Event('cartUpdated'))
}

export function experienciasDelCarrito(items: unknown[] = leerCarrito()): ItemCarritoExperiencia[] {
  return items.filter(esItemExperiencia)
}

/**
 * Agrega (o reemplaza) una fecha. Misma fecha = mismo renglón: se REEMPLAZAN adultos y niños (el cliente eligió
 * el total en el selector; no se suman compras repetidas). Tope: MAX_LUGARES_POR_COMPRA. Devuelve el item guardado.
 */
export function agregarExperiencia(item: Omit<ItemCarritoExperiencia, 'id' | 'quantity' | 'tipo' | 'unit'>): ItemCarritoExperiencia {
  const adultos = Math.max(0, Math.floor(item.adultos))
  const ninos = Math.max(0, Math.floor(item.ninos))
  if (adultos + ninos < 1) throw new Error('Elige al menos una persona')
  if (adultos + ninos > MAX_LUGARES_POR_COMPRA) {
    throw new Error(`Máximo ${MAX_LUGARES_POR_COMPRA} lugares por compra`)
  }
  const nuevo: ItemCarritoExperiencia = {
    ...item,
    id: item.evento_id,
    tipo: 'experiencia',
    unit: 'personas',
    adultos,
    ninos,
    quantity: adultos + ninos,
  }
  const items = leerCarrito().filter((i) => i.id !== nuevo.id)
  guardarCarrito([...items, nuevo as unknown as ItemCarrito])
  olvidarApartado() // el carrito cambió: el apartado anterior ya no corresponde
  return nuevo
}

export function quitarDelCarrito(id: string): void {
  guardarCarrito(leerCarrito().filter((i) => i.id !== id))
  olvidarApartado()
}

/**
 * Quita los renglones de experiencia de antes de la Fase 4 (sin `evento_id`: el servidor ya no los acepta).
 * Devuelve cuántos quitó, para avisarle al cliente que vuelva a elegir la fecha.
 */
export function limpiarExperienciasViejas(): number {
  const items = leerCarrito()
  const buenos = items.filter((i) => !esExperienciaVieja(i))
  if (buenos.length !== items.length) guardarCarrito(buenos)
  return items.length - buenos.length
}

export function vaciarCarrito(): void {
  guardarCarrito([])
  olvidarApartado()
}

export function abrirCarrito(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('toggleCartSidebar'))
}

export function olvidarApartado(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(CLAVE_APARTADO)
  } catch {
    /* sessionStorage bloqueado: no hay nada que olvidar */
  }
}
