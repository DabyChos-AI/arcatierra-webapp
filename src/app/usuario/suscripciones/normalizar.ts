// R11b · ACC1 (sesión 51): lecturas y textos puros de «Mis suscripciones» (sin React, sin I/O).
// La forma de los datos es `src/types/cuenta.ts` (del líder). Las acciones las decide el servidor (`acciones`); SUB6 (David,
// 22-oct, opción B): ya no hay pausa, la única acción es 'cancelar'. SUB7: `cobro_fallido_desde` (null = al corriente).

import { formatFechaMexico } from '@/lib/dates'
import type { AccionSuscripcion, MiSuscripcion, MisSuscripcionesRespuesta } from '@/types/cuenta'

const ACCIONES: readonly AccionSuscripcion[] = ['cancelar']

function texto(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

function numeroONull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizarSuscripcion(v: unknown): MiSuscripcion | null {
  const s = v as Partial<Record<keyof MiSuscripcion, unknown>> | null
  if (!s || typeof s !== 'object' || typeof s.id !== 'string' || !s.id) return null
  const acciones = Array.isArray(s.acciones)
    ? s.acciones.filter((a): a is AccionSuscripcion => ACCIONES.some((x) => x === a))
    : []
  return {
    id: s.id,
    nombre: texto(s.nombre) ?? 'Suscripción',
    tipo_canasta: texto(s.tipo_canasta),
    frecuencia: texto(s.frecuencia),
    estado: texto(s.estado) ?? '',
    precio: numeroONull(s.precio),
    fecha_inicio: texto(s.fecha_inicio),
    fecha_fin: texto(s.fecha_fin),
    dia_entrega: texto(s.dia_entrega),
    proxima_entrega: texto(s.proxima_entrega),
    cobro_fallido_desde: texto(s.cobro_fallido_desde),
    acciones,
  }
}

export function normalizarSuscripciones(cuerpo: unknown): MisSuscripcionesRespuesta | null {
  const c = cuerpo as Partial<Record<keyof MisSuscripcionesRespuesta, unknown>> | null
  if (!c || typeof c !== 'object' || !Array.isArray(c.items)) return null
  return { items: c.items.map(normalizarSuscripcion).filter((s): s is MiSuscripcion => s !== null) }
}

const ETIQUETA_ESTADO: Record<string, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
}

function mayusculaInicial(t: string): string {
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}

export function etiquetaEstado(estado: string): string {
  return ETIQUETA_ESTADO[estado] ?? mayusculaInicial(estado.replace(/_/g, ' '))
}

export function claseEstado(estado: string): string {
  if (estado === 'activa') return 'bg-verde/10 text-verde'
  if (estado === 'cancelada') return 'bg-neutro-light text-verde-suave'
  return 'bg-amarillo-bg text-verde-tipografia'
}

export function textoFrecuencia(frecuencia: string | null): string | null {
  return frecuencia ? mayusculaInicial(frecuencia.replace(/_/g, ' ')) : null
}

const MONEDA = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })

export function dinero(monto: number): string {
  return MONEDA.format(monto)
}

/** «jueves, 29 de octubre» desde `YYYY-MM-DD` (sin correrla de día). */
export function fechaLarga(fecha: string | null): string {
  if (!fecha) return ''
  const t = formatFechaMexico(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: undefined })
  return t === '-' ? '' : t
}

export function fechaCorta(fecha: string | null): string {
  if (!fecha) return ''
  const t = formatFechaMexico(fecha)
  return t === '-' ? '' : t
}

export const TEXTO_CONFIRMAR_CANCELAR = (nombre: string) =>
  `Se detiene el cobro y ya no se arman tus canastas futuras de «${nombre}». ¿Quieres cancelar tu suscripción?`
