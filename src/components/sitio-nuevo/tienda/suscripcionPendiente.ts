// R15 v2 · F3 (tienda): lo que el alta deja en `localStorage.pendingSubscription` para la confirmación. Las llaves de hoy
// (src/app/suscripciones/page.tsx:676-695: subscription_id, mp_preapproval_id, plan_name, frequency, email, sin_costo) más las del
// sitio nuevo: `mensaje` (el de la API en una suscripción sin costo), `dias` (frequencies[].days de GET /api/subscriptions/planes) y
// `primera_entrega` (la fecha de GET /api/subscriptions/primera-entrega que ya vio el cliente). La confirmación de hoy lee solo sus llaves.

export const CLAVE_SUSCRIPCION_PENDIENTE = 'pendingSubscription'

const ISO_FECHA = /^\d{4}-\d{2}-\d{2}$/

export interface SuscripcionPendiente {
  subscription_id?: string
  mp_preapproval_id?: string | null
  plan_name?: string
  frequency?: string
  email?: string
  sin_costo?: boolean
  mensaje?: string
  dias?: number
  primera_entrega?: string
}

export function guardarSuscripcionPendiente(datos: SuscripcionPendiente): void {
  try {
    window.localStorage.setItem(CLAVE_SUSCRIPCION_PENDIENTE, JSON.stringify(datos))
  } catch {
    /* almacenamiento bloqueado: la confirmación usa sus textos de siempre */
  }
}

export function leerSuscripcionPendiente(): SuscripcionPendiente | null {
  try {
    const crudo: unknown = JSON.parse(window.localStorage.getItem(CLAVE_SUSCRIPCION_PENDIENTE) || 'null')
    if (!crudo || typeof crudo !== 'object') return null
    const d = crudo as Record<string, unknown>
    return {
      subscription_id: typeof d.subscription_id === 'string' ? d.subscription_id : undefined,
      plan_name: typeof d.plan_name === 'string' ? d.plan_name : undefined,
      frequency: typeof d.frequency === 'string' ? d.frequency : undefined,
      email: typeof d.email === 'string' ? d.email : undefined,
      sin_costo: d.sin_costo === true,
      mensaje: typeof d.mensaje === 'string' ? d.mensaje : undefined,
      dias: typeof d.dias === 'number' && Number.isFinite(d.dias) ? d.dias : undefined,
      primera_entrega: typeof d.primera_entrega === 'string' && ISO_FECHA.test(d.primera_entrega) ? d.primera_entrega : undefined,
    }
  } catch {
    return null
  }
}

/** Como hoy al llegar el éxito (`confirmacion/page.tsx:38`). */
export function olvidarSuscripcionPendiente(): void {
  try {
    window.localStorage.removeItem(CLAVE_SUSCRIPCION_PENDIENTE)
  } catch {
    /* nada que olvidar */
  }
}
