// R15 · F3 v2 (carrito, sesión 61): las reglas del carrito y del checkout nuevos, sin React. Contrato v2 §9-F3 D-F3-06, D-F3-20.
//
// Lo que ya está exportado en el código de hoy se IMPORTA (lib/carrito, lib/envio, lib/bodega, lib/dates, types/*, las funciones de
// components/checkout/DireccionEntrega y RelojApartado). Lo que hoy vive SOLO dentro de un componente (CheckoutFormSingleStep.tsx,
// checkout/page.tsx, success|pending|failure) se escribe aquí con la MISMA conducta, citando la línea de hoy, y una prueba lo compara
// con lo de hoy en las mismas entradas (f3/carrito-F3.md §6–§7). Los dos cuerpos POST se arman igual que hoy, llave por llave y en el
// mismo orden: el sitio nuevo usa las MISMAS llamadas (contrato v2 §0.5, D-F3-06).

import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import { BODEGA, TEXTO_PEDIDO_RECOGER } from '@/lib/bodega'
import { calcularCostoEnvio, subtotalProductos, type TipoEntrega } from '@/lib/envio'
import { formatFechaMexico } from '@/lib/dates'
import { experienciasDelCarrito, type ItemCarrito } from '@/lib/carrito'
import {
  esItemExperiencia,
  subtotalExperiencia,
  type ExperienciaParaPagar,
  type ItemCarritoExperiencia,
} from '@/types/compra-experiencias'
import { textoDireccion, type DireccionGuardada, type DireccionNuevaPedido } from '@/types/datos-cliente'
import { cpDeDireccion } from '@/components/checkout/DireccionEntrega'

// ─── Dinero (D-F3-19 (4)) ─────────────────────────────────────────────────────────────────────────────────────────────
/** Subtotales y totales como los escribe hoy el checkout (`CheckoutFormSingleStep.tsx:1293`, `checkout/page.tsx:345`). */
export function dinero(n: number): string {
  return `$${n.toFixed(2)}`
}

// ─── El carrito ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** Lo que cuesta un renglón (`checkout/page.tsx:32-34`): una experiencia es adultos × precio + niños × precio de niño. */
export function subtotalRenglon(item: { price?: unknown; quantity?: unknown }): number {
  return esItemExperiencia(item) ? subtotalExperiencia(item) : (Number(item.price) || 0) * (Number(item.quantity) || 0)
}

/** La foto del renglón (los productos la traen como `image`), o null (`checkout/page.tsx:37-39`). */
export function imagenDe(item: ItemCarrito): string | null {
  return typeof item.image === 'string' && item.image ? item.image : null
}

/** kg de CO₂ que ahorra el renglón (`checkout/page.tsx:42-45`). */
export function co2Ahorrado(item: ItemCarrito): number {
  const metricas = item.environmental_metrics as { co2_saved?: unknown } | null | undefined
  return (Number(metricas?.co2_saved) || 0) * (Number(item.quantity) || 0)
}

/** `checkout/page.tsx:47-51` y `CartSidebar.tsx:60-64` (el mismo texto). */
export function textoExperienciasQuitadas(n: number): string {
  return n === 1
    ? 'Quitamos 1 experiencia de tu carrito: vuelve a elegir la fecha'
    : `Quitamos ${n} experiencias de tu carrito: vuelve a elegir la fecha`
}

/** «sáb 10 de oct · 07:00–10:00» (`CartSidebar.tsx:54-57`). */
export function fechaYHoraCorta(exp: ItemCarritoExperiencia): string {
  const fecha = formatFechaMexico(exp.fecha, { weekday: 'short', day: 'numeric', month: 'short', year: undefined })
  return `${fecha} · ${exp.hora}${exp.hora_fin ? `–${exp.hora_fin}` : ''}`
}

/** «sábado, 10 de octubre de 2026 · 07:00–10:00» (`CheckoutFormSingleStep.tsx:131-134`). */
export function fechaYHoraLarga(fecha: string, hora: string, horaFin: string | null): string {
  const dia = formatFechaMexico(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${dia} · ${hora}${horaFin ? `–${horaFin}` : ''}`
}

/** Solo productos (`CartSidebar.tsx:113-119`): en 0 o menos se quita el renglón. */
export function conCantidad(items: ItemCarrito[], id: string, cantidad: number): ItemCarrito[] {
  return items.map((item) => (item.id === id ? { ...item, quantity: cantidad } : item))
}

// ─── Envío de las dos columnas del checkout (`checkout/page.tsx:94-95`) ────────────────────────────────────────────────
export function envioDelPedido(items: ItemCarrito[], tipoEntrega: TipoEntrega, canasta: CanastaExtras | null): number {
  return canasta ? 0 : calcularCostoEnvio(subtotalProductos(items), tipoEntrega)
}

// ─── El formulario ────────────────────────────────────────────────────────────────────────────────────────────────────
/** `CheckoutFormSingleStep.tsx:106` */
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** RCG1: la «llave» del calendario de recoger (`CheckoutFormSingleStep.tsx:104`): nunca tiene 5 dígitos. */
export const CP_RECOGER = 'recoger'

export interface DatosCliente {
  nombre: string
  apellido: string
  email: string
  telefono: string
  codigo_pais: string
  rfc: string
}

/** `CheckoutFormSingleStep.tsx:158-165` */
export const DATOS_VACIOS: DatosCliente = { nombre: '', apellido: '', email: '', telefono: '', codigo_pais: '+52', rfc: '' }

/** El campo que se enfoca cuando falta algo (P-13, D-F3-20). */
export type CampoQueFalta = 'correo' | 'nombre' | 'apellido' | 'telefono' | 'direccion' | 'dia'

export interface EstadoFormulario {
  correo: string
  datos: DatosCliente
  hayProductos: boolean
  hayExperiencias: boolean
  canasta: CanastaExtras | null
  recoger: boolean
  /** null = la dirección está lista; si no, su texto (`faltaEnLaDireccion` de hoy, `CheckoutFormSingleStep.tsx:225-233`). */
  faltaEnLaDireccion: string | null
  hayZona: boolean
  hayDia: boolean
}

/**
 * `faltaEnElFormulario` de hoy (`CheckoutFormSingleStep.tsx:539-556`), con los MISMOS textos y el mismo orden, más el campo que se
 * enfoca (P-13). null = el formulario está completo.
 */
export function faltaEnElFormulario(e: EstadoFormulario): { texto: string; campo: CampoQueFalta } | null {
  if (!e.correo || !CORREO_VALIDO.test(e.correo)) return { texto: 'Escribe un correo válido.', campo: 'correo' }
  if (!e.datos.nombre.trim() || !e.datos.apellido.trim() || !e.datos.telefono) {
    const campo: CampoQueFalta = !e.datos.nombre.trim() ? 'nombre' : !e.datos.apellido.trim() ? 'apellido' : 'telefono'
    return { texto: 'Completa tu nombre, apellido y teléfono.', campo }
  }
  if (e.hayProductos && e.recoger) {
    if (!e.hayDia) return { texto: 'Elige el día en que recoges tu pedido.', campo: 'dia' }
  } else if (e.hayProductos && !e.canasta) {
    if (e.faltaEnLaDireccion) return { texto: e.faltaEnLaDireccion, campo: 'direccion' }
    if (!e.hayZona) return { texto: 'El código postal no tiene cobertura de entrega. Verifica tu código postal.', campo: 'direccion' }
    if (!e.hayDia) {
      return { texto: e.hayExperiencias ? 'Elige el día de entrega de tus productos.' : 'Elige el día de entrega.', campo: 'dia' }
    }
  }
  return null
}

/**
 * El texto de error que manda el servidor (`CheckoutFormSingleStep.tsx:112-119`): una frase, o `{mensaje}` (409 del apartado). Una
 * lista (422 de validación) no es para el cliente.
 */
export function textoDelServidor(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const mensaje = (detail as { mensaje?: unknown }).mensaje
    if (typeof mensaje === 'string' && mensaje.trim()) return mensaje
  }
  return null
}

// ─── Los tres cuerpos POST (llave por llave y en el mismo orden que hoy) ──────────────────────────────────────────────
/** Un renglón de `items` del sync (`CheckoutFormSingleStep.tsx:587-600`): la experiencia con su forma, el producto tal cual. */
function renglonSync(item: ItemCarrito): Record<string, unknown> {
  return esItemExperiencia(item)
    ? {
        tipo: 'experiencia' as const,
        id: item.evento_id,
        evento_id: item.evento_id,
        adultos: item.adultos,
        ninos: item.ninos,
        quantity: item.adultos + item.ninos,
        name: item.name,
      }
    : item
}

/** `POST /api/cart/sync-and-validate` (`CheckoutFormSingleStep.tsx:604-611`). */
export function cuerpoSync(items: ItemCarrito[], correo: string, datos: DatosCliente): Record<string, unknown> {
  return {
    email: correo,
    nombre: datos.nombre,
    apellidos: datos.apellido,
    telefono: datos.telefono,
    items: items.map(renglonSync),
  }
}

export interface Entrega {
  notas: string
  tipoEntrega: TipoEntrega
  /** El envío que la página le pasa al formulario (`checkout/page.tsx:221`). */
  costoEnvio: number
  canasta: CanastaExtras | null
  /** `AAAA-MM-DD` del día elegido (el de la zona actual) o undefined. */
  fechaIso: string | undefined
  codigoCupon: string | undefined
  direccionGuardada: DireccionGuardada | null
  direccionNueva: DireccionNuevaPedido
}

/** `camposEntrega()` de hoy (`CheckoutFormSingleStep.tsx:502-533`). */
export function camposEntrega(e: Entrega): Record<string, unknown> {
  const base = {
    delivery_notes: e.notas,
    tipo_entrega: e.canasta ? e.canasta.tipo_entrega : e.tipoEntrega,
    costo_envio: e.canasta ? 0 : e.costoEnvio,
    con_suscripcion: e.canasta?.suscripcion_id,
    fecha_entrega: e.canasta ? e.canasta.fecha_entrega : e.fechaIso,
    codigo_cupon: e.canasta ? undefined : e.codigoCupon,
  }
  if (e.canasta) return { ...base, delivery_address: '', delivery_postal_code: '' }
  if (e.tipoEntrega === 'recoger_almacen') {
    return { ...base, delivery_address: TEXTO_PEDIDO_RECOGER, delivery_postal_code: BODEGA.codigoPostal }
  }
  if (e.direccionGuardada) {
    return {
      ...base,
      direccion_id: e.direccionGuardada.id,
      delivery_address: textoDireccion(e.direccionGuardada),
      delivery_postal_code: cpDeDireccion(e.direccionGuardada),
    }
  }
  return {
    ...base,
    direccion: e.direccionNueva,
    delivery_address: textoDireccion(e.direccionNueva),
    delivery_postal_code: e.direccionNueva.codigo_postal,
  }
}

/** Alergias (`CheckoutFormSingleStep.tsx:105`): el mismo tope que el backend (`payments.py:247`). Técnico: no se pinta. */
export const MAX_ALERGIAS_PAGO = 500

export interface Pago {
  items: ItemCarrito[]
  apartadoId: string
  correo: string
  datos: DatosCliente
  alergias: Record<string, string>
  entrega: Entrega
  token: string | null
}

/** `POST /api/crear-preferencia-pago` (`CheckoutFormSingleStep.tsx:660-686`). */
export function cuerpoPreferencia(p: Pago): Record<string, unknown> {
  const productos = p.items.filter((item) => !esItemExperiencia(item))
  // `experienciasDelCarrito` como hoy (`CheckoutFormSingleStep.tsx:192`): el `filter` sobre ItemCarrito[] no estrecha el tipo
  const experiencias: ExperienciaParaPagar[] = experienciasDelCarrito(p.items).map((exp) => ({
    tipo: 'experiencia',
    evento_id: exp.evento_id,
    adultos: exp.adultos,
    ninos: exp.ninos,
    alergias: (p.alergias[exp.evento_id] ?? '').trim().slice(0, MAX_ALERGIAS_PAGO) || null,
  }))
  const rfc = p.datos.rfc.trim().toUpperCase()
  const cuerpo: Record<string, unknown> = {
    items: [
      ...productos.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      ...experiencias,
    ],
    apartado_id: p.apartadoId,
    email: p.correo,
    nombre: p.datos.nombre,
    apellido: p.datos.apellido,
    telefono: p.datos.telefono,
    codigo_pais: p.datos.codigo_pais,
    ...(rfc ? { rfc } : {}),
    ...(productos.length > 0 ? camposEntrega(p.entrega) : {}),
  }
  if (p.token) cuerpo._guest_token = p.token
  return cuerpo
}

/** `POST ${API_URL}/api/cupones/validar` (`CheckoutFormSingleStep.tsx:460-465`): solo productos. */
export function cuerpoCupon(codigo: string, tipoEntrega: TipoEntrega, items: ItemCarrito[]): Record<string, unknown> {
  return {
    codigo,
    tipo_entrega: tipoEntrega,
    items: items.filter((item) => !esItemExperiencia(item)).map((item) => ({ id: item.id, name: item.name, quantity: item.quantity })),
  }
}

// ─── Resultado del pago ────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * Cuánto tarda en confirmarse según CÓMO pagó (`checkout/pending/page.tsx:29-35`). Sus cifras están en la lista corta (D-F3-21).
 */
export function tiempoDeConfirmacion(paymentType: string | null): string {
  if (paymentType === 'ticket') return 'Pagaste en efectivo en una tienda: se confirma en hasta 24 horas.'
  if (paymentType === 'bank_transfer' || paymentType === 'atm') {
    return 'Pagaste con transferencia o en cajero: se confirma en 1 a 2 días hábiles.'
  }
  return 'Tu banco está revisando el pago con tarjeta o saldo de MercadoPago; normalmente se resuelve en minutos.'
}

/** `getStatusMessage` de hoy (`checkout/failure/page.tsx:47-76`). */
export function motivoDelPago(status: string, statusDetail: string | null): string {
  if (status === 'rejected') {
    switch (statusDetail) {
      case 'cc_rejected_insufficient_amount':
        return 'Fondos insuficientes en la tarjeta'
      case 'cc_rejected_invalid_installments':
        return 'Número de cuotas inválido'
      case 'cc_rejected_max_attempts':
        return 'Has superado el límite de intentos'
      case 'cc_rejected_duplicate_payment':
        return 'Pago duplicado'
      case 'cc_rejected_card_disabled':
        return 'Tarjeta deshabilitada'
      case 'cc_rejected_bad_filled_card_number':
        return 'Número de tarjeta incorrecto'
      case 'cc_rejected_bad_filled_date':
        return 'Fecha de vencimiento incorrecta'
      case 'cc_rejected_bad_filled_other':
        return 'Datos de la tarjeta incorrectos'
      case 'cc_rejected_bad_filled_security_code':
        return 'Código de seguridad incorrecto'
      default:
        return 'Pago rechazado'
    }
  }
  if (status === 'cancelled') return 'Pago cancelado por el usuario'
  return 'Error en el procesamiento del pago'
}
