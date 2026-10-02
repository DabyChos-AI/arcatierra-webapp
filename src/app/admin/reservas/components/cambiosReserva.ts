'use client'

// R5 · AU1 (sesión 45, 2-oct-2026): los cambios de campos de una reserva para la pestaña Auditoría.
// GET /api/admin/reservas/{id}/cambios → { items, total } del más nuevo al más viejo (lo escribe el disparador
// trg_r5_auditoria en cualquier camino; el backend ya traduce ids a nombres y nunca manda correos de empleados).
// Aquí: la carga (API_URL + Bearer, como el resto del detalle) y el armado de UN evento por lote (mismo guardado).

import { useCallback, useState } from 'react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { formatMXN } from '@/types/reservas'
import {
  ETIQUETA_ORIGEN_CAMBIO,
  type CambioReserva,
  type CambiosReservaResponse,
} from '@/types/reembolsos'
import { extraerMensajeError } from './errores'

export interface EstadoCambios {
  /** null = todavía no carga (o falló la primera vez). */
  items: CambioReserva[] | null
  /** Todos los cambios de la reserva (el GET manda hasta 500 en `items`). */
  total: number
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
}

/** Mismo patrón que useComunicaciones: silencioso (no vacía `items` al releer). */
export function useCambiosReserva(reservaId: string, token: string | undefined): EstadoCambios {
  const [items, setItems] = useState<CambioReserva[] | null>(null)
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    if (!token) return
    setCargando(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/reservas/${reservaId}/cambios`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data = (await res.json()) as Partial<CambiosReservaResponse> | null
      const lista = Array.isArray(data?.items) ? data.items : []
      setItems(lista)
      setTotal(typeof data?.total === 'number' ? data.total : lista.length)
    } catch (err) {
      setError(
        err instanceof Error && !(err instanceof TypeError)
          ? err.message
          : 'sin conexión con el servidor',
      )
    } finally {
      setCargando(false)
    }
  }, [token, reservaId])

  return { items, total, cargando, error, recargar }
}

// ─── Un evento por lote ──────────────────────────────────────────────────────────────────────────────────────────────

export interface LineaCambio {
  campo: string
  texto: string
}

export interface LoteCambios {
  lote: number
  /** ISO del cambio más nuevo del lote (ordena el evento en la línea de tiempo). */
  creadoEn: string
  /** «Cambió: Chinampa, Total» */
  titulo: string
  /** Nombre del empleado o «Sistema» (+ « · MercadoPago» / « · Reembolso» si vino de ahí). */
  quien: string
  /** Una por campo, en el orden en que se guardaron. */
  lineas: LineaCambio[]
}

const CAMPOS_DINERO = new Set([
  'precio_base',
  'monto_addons',
  'monto_descuento',
  'monto_total',
  'monto_anticipo',
  'monto_pagado_acumulado',
  'propina_monto',
  'precio_grupo',
  'precio_adicional',
  'precio_nino_adicional',
  'monto_cupon',
])
const CAMPOS_PORCENTAJE = new Set(['propina_pct', 'comision_pct'])
const CAMPOS_HORA = new Set(['hora_inicio', 'hora_fin'])
const MAX_VALOR = 90
const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/
// §0 de R5: el panel nunca muestra correos de empleados (las notas internas los traen en «[fecha correo] …»)
const CORREO = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g

/** «(correo)» en lugar de cualquier correo (§0 de R5 / regla R3: el panel no muestra correos de empleados). */
export function taparCorreos(texto: string): string {
  return texto.replace(CORREO, '(correo)')
}

/** El «quien» de una nota fechada «[fecha correo] …» (C9): un correo solo → «Panel»; si trae más texto, se tapa. */
export function quienDeNota(quien: string): string {
  const limpio = quien.trim()
  if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(limpio)) return 'Panel'
  return taparCorreos(limpio)
}

/** Textos largos (notas): se ve el FINAL, que es donde se agrega lo nuevo. */
function recortar(texto: string): string {
  const limpio = texto.replace(/\s+/g, ' ').trim()
  return limpio.length > MAX_VALOR ? `…${limpio.slice(limpio.length - (MAX_VALOR - 1))}` : limpio
}

/** Un valor de `reservas_cambios` (texto) como se lee en el panel. null/'' = «(vacío)». */
export function valorLegible(campo: string, valor: string | null): string {
  if (valor === null || valor.trim() === '') return '(vacío)'
  const v = valor.trim()
  if (CAMPOS_DINERO.has(campo)) {
    const n = Number(v)
    return Number.isFinite(n) ? formatMXN(n) : v
  }
  if (CAMPOS_PORCENTAJE.has(campo)) {
    const n = Number(v)
    return Number.isFinite(n) ? `${n.toLocaleString('es-MX', { maximumFractionDigits: 2 })} %` : v
  }
  if (campo === 'flag_sap' || campo === 'cortesia') {
    if (v === 'true' || v === 't') return 'Sí'
    if (v === 'false' || v === 'f') return 'No'
  }
  if (campo === 'fecha_experiencia' && SOLO_FECHA.test(v)) return formatFechaMexico(v)
  if (CAMPOS_HORA.has(campo) && /^\d{2}:\d{2}/.test(v)) return v.slice(0, 5)
  return recortar(taparCorreos(v))
}

export function lineaCambio(c: CambioReserva): string {
  const etiqueta = c.etiqueta || c.campo
  if (c.solo_cambio) return `${etiqueta}: cambió`
  return `${etiqueta}: ${valorLegible(c.campo, c.valor_anterior)} → ${valorLegible(c.campo, c.valor_nuevo)}`
}

function quienDelCambio(c: CambioReserva): string {
  const nombre = c.usuario_nombre?.trim() || 'Sistema'
  const origen = c.origen ?? ''
  if (!origen || origen === 'panel' || origen === 'sistema') return nombre
  return `${nombre} · ${ETIQUETA_ORIGEN_CAMBIO[origen] ?? origen}`
}

/** ms desde la época (0 si no es fecha): ordena sin depender del formato del ISO. */
function instante(iso: string): number {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? 0 : t
}

/** Agrupa por `lote` (mismo guardado). Devuelve los lotes del más nuevo al más viejo. */
export function lotesDeCambios(items: CambioReserva[]): LoteCambios[] {
  const porLote = new Map<number, CambioReserva[]>()
  for (const c of items) {
    const lista = porLote.get(c.lote)
    if (lista) lista.push(c)
    else porLote.set(c.lote, [c])
  }
  const lotes: LoteCambios[] = []
  for (const [lote, cambios] of porLote) {
    // Dentro del lote, en el orden en que se escribieron (id ascendente)
    const enOrden = [...cambios].sort((a, b) => a.id - b.id)
    const etiquetas: string[] = []
    for (const c of enOrden) {
      const e = c.etiqueta || c.campo
      if (!etiquetas.includes(e)) etiquetas.push(e)
    }
    const masNuevo = enOrden.reduce(
      (acc, c) => (instante(c.creado_en) > instante(acc) ? c.creado_en : acc),
      enOrden[0].creado_en,
    )
    // El actor es el mismo en todo el lote (una transacción); se toma el del primer cambio
    lotes.push({
      lote,
      creadoEn: masNuevo,
      titulo: `Cambió: ${etiquetas.join(', ')}`,
      quien: quienDelCambio(enOrden[0]),
      lineas: enOrden.map((c) => ({ campo: c.campo, texto: lineaCambio(c) })),
    })
  }
  return lotes.sort((a, b) => instante(b.creadoEn) - instante(a.creadoEn) || b.lote - a.lote)
}
