// R11b · ACC1 (sesión 51): lecturas y textos puros de «Mis pedidos» (sin React, sin I/O).
// La forma de los datos es `src/types/cuenta.ts` (del líder). Llave faltante ≠ pantalla rota: lo que no venga se rellena
// aquí y en pantalla se omite. Un numeric de Postgres puede llegar como texto («123.00»): siempre por `aNumero`.

import { formatFechaMexico } from '@/lib/dates'
import { aNumero } from '@/types/tienda'
import {
  ETIQUETA_ESTADO_PEDIDO,
  type MiPedidoDetalle,
  type MiPedidoRenglon,
  type MiPedidoResumen,
  type MisPedidosRespuesta,
} from '@/types/cuenta'

export const PEDIDOS_POR_PAGINA = 20

function texto(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

function numeroONull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

export function normalizarResumen(v: unknown): MiPedidoResumen | null {
  const p = v as Partial<Record<keyof MiPedidoResumen, unknown>> | null
  if (!p || typeof p !== 'object' || typeof p.id !== 'string' || !p.id) return null
  return {
    id: p.id,
    numero_pedido: texto(p.numero_pedido) ?? p.id.slice(0, 8),
    fecha: texto(p.fecha) ?? '',
    estado: texto(p.estado) ?? '',
    total: aNumero(p.total),
    tipo_entrega: texto(p.tipo_entrega),
    fecha_entrega: texto(p.fecha_entrega),
    num_productos: aNumero(p.num_productos),
  }
}

/** `MisPedidosRespuesta` limpia, o null si la respuesta no tiene forma de lista. */
export function normalizarLista(cuerpo: unknown): MisPedidosRespuesta | null {
  const c = cuerpo as Partial<Record<keyof MisPedidosRespuesta, unknown>> | null
  if (!c || typeof c !== 'object' || !Array.isArray(c.items)) return null
  const items = c.items.map(normalizarResumen).filter((p): p is MiPedidoResumen => p !== null)
  return { items, total: Math.max(aNumero(c.total), items.length) }
}

function normalizarRenglon(v: unknown): MiPedidoRenglon | null {
  const r = v as Partial<Record<keyof MiPedidoRenglon, unknown>> | null
  if (!r || typeof r !== 'object') return null
  return {
    nombre: texto(r.nombre) ?? 'Producto',
    cantidad: aNumero(r.cantidad),
    precio_unitario: aNumero(r.precio_unitario),
    subtotal: aNumero(r.subtotal),
  }
}

export function normalizarDetalle(cuerpo: unknown): MiPedidoDetalle | null {
  const resumen = normalizarResumen(cuerpo)
  if (!resumen) return null
  const d = cuerpo as Partial<Record<keyof MiPedidoDetalle, unknown>>
  const renglones = Array.isArray(d.renglones)
    ? d.renglones.map(normalizarRenglon).filter((r): r is MiPedidoRenglon => r !== null)
    : []
  return {
    ...resumen,
    renglones,
    sub_total: numeroONull(d.sub_total),
    costo_envio: numeroONull(d.costo_envio),
    descuento: numeroONull(d.descuento),
    direccion_entrega: texto(d.direccion_entrega),
    notas_entrega: texto(d.notas_entrega),
    pago_texto: texto(d.pago_texto),
  }
}

const MONEDA = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })

export function dinero(monto: number): string {
  return MONEDA.format(monto)
}

/** El texto del estado para el cliente (los del líder; un estado que no conoce se muestra tal cual). */
export function etiquetaEstado(estado: string): string {
  return ETIQUETA_ESTADO_PEDIDO[estado] ?? estado
}

/** Tono de la pastilla del estado (clases completas de Tailwind, verificadas en tailwind.config.ts). */
export function claseEstado(estado: string): string {
  if (estado === 'pagado' || estado === 'pagado_sin_stock' || estado === 'entregado') return 'bg-verde/10 text-verde'
  if (estado === 'cancelado' || estado === 'reembolsado') return 'bg-neutro-light text-verde-suave'
  return 'bg-amarillo-bg text-verde-tipografia'
}

export function textoEntrega(tipo: string | null): string | null {
  if (tipo === 'envio_domicilio') return 'Envío a domicilio'
  if (tipo === 'recoger_almacen') return 'Recoger en almacén'
  if (tipo === 'experiencia') return 'Experiencia (sin envío)'
  return null
}

/** «22 oct 2026» desde el ISO con zona del pedido (en hora de México). */
export function fechaPedido(iso: string): string {
  if (!iso) return ''
  const t = formatFechaMexico(iso)
  return t === '-' ? '' : t
}

/** «jueves, 29 de octubre» desde `YYYY-MM-DD` (sin correrla de día). */
export function fechaEntregaLarga(fecha: string | null): string {
  if (!fecha) return ''
  const t = formatFechaMexico(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: undefined })
  return t === '-' ? '' : t
}

export function textoProductos(n: number): string {
  return n === 1 ? '1 producto' : `${n} productos`
}
