// Lectura defensiva de las respuestas de Mi día (K4 R8; DR23 R9). Llave faltante ≠ pantalla rota: arreglos vacíos y
// números en 0 si la API no los manda. Funciones puras (sin fetch ni fechas del navegador).

import type { DiaMiDia, MiDiaBusqueda, MiDiaResponse, ReservaMiDia } from '@/types/mi-dia'

/** Una reserva de la lista (y el `item` de la búsqueda por QR: misma forma y mismas reglas). */
export function normalizarItem(it: ReservaMiDia): ReservaMiDia {
  return {
    ...it,
    personas: Number(it.personas) || 0,
    ninos: Number(it.ninos) || 0,
    invitados: Array.isArray(it.invitados) ? it.invitados : [],
    guias: Array.isArray(it.guias) ? it.guias : [],
    llegada: it.llegada ?? null,
    puede_marcar_llegada: it.puede_marcar_llegada === true,
  }
}

/** GET /api/admin/mi-dia?dia= → `MiDiaResponse` (null si no trae ni la fecha). */
export function normalizarMiDia(cuerpo: unknown, dia: DiaMiDia): MiDiaResponse | null {
  if (!cuerpo || typeof cuerpo !== 'object') return null
  const c = cuerpo as Partial<MiDiaResponse>
  if (typeof c.fecha !== 'string') return null
  const items = Array.isArray(c.items) ? c.items : []
  return {
    dia: c.dia === 'manana' || c.dia === 'hoy' ? c.dia : dia,
    fecha: c.fecha,
    modo: c.modo === 'guia' || c.modo === 'sin_ficha' ? c.modo : 'todas',
    guia_nombre: typeof c.guia_nombre === 'string' ? c.guia_nombre : null,
    items: items.map(normalizarItem),
    total_personas: Number(c.total_personas) || 0,
    total_ninos: Number(c.total_ninos) || 0,
  }
}

/**
 * GET /api/admin/mi-dia/reserva/{id} (R9, DR23) → `MiDiaBusqueda`; null si no trae folio ni fecha (no se pudo leer).
 * `item` solo cuenta con `reserva_id`; `dia` desconocido = 'otro' (no se abre ninguna pestaña).
 */
export function normalizarBusqueda(cuerpo: unknown): MiDiaBusqueda | null {
  if (!cuerpo || typeof cuerpo !== 'object') return null
  const c = cuerpo as Partial<MiDiaBusqueda>
  if (typeof c.booking_id !== 'string' || typeof c.fecha !== 'string') return null
  const item =
    c.item && typeof c.item === 'object' && typeof c.item.reserva_id === 'string' ? normalizarItem(c.item) : null
  return {
    reserva_id: typeof c.reserva_id === 'string' ? c.reserva_id : '',
    booking_id: c.booking_id,
    experiencia_nombre: typeof c.experiencia_nombre === 'string' ? c.experiencia_nombre : '',
    fecha: c.fecha,
    hora_inicio: typeof c.hora_inicio === 'string' ? c.hora_inicio : null,
    estado: typeof c.estado === 'string' ? c.estado : '',
    dia: c.dia === 'hoy' || c.dia === 'manana' ? c.dia : 'otro',
    es_tuya: c.es_tuya === true,
    item,
    motivo: typeof c.motivo === 'string' && c.motivo.trim() ? c.motivo : null,
  }
}

/** Dónde se abre la reserva escaneada: solo con `item` y en una de las dos pestañas; si no, null (tarjeta con motivo). */
export function dondeAbrir(b: MiDiaBusqueda): { reservaId: string; dia: DiaMiDia } | null {
  if (!b.item || (b.dia !== 'hoy' && b.dia !== 'manana')) return null
  return { reservaId: b.item.reserva_id, dia: b.dia }
}
