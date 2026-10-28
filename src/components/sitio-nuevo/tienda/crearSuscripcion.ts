// R15 · F2 (WF3, sesión 55): el alta de suscripción de la tienda nueva usa EXACTAMENTE el envío de hoy
// (`onSubscribe` de src/app/suscripciones/page.tsx:632-709 + `handleSubmit` de SubscriptionCheckoutForm.tsx:223-258):
// - el mismo cuerpo (mismos campos y mismo armado: teléfono = código de país + número, alcaldía = municipio de la zona o
//   la alcaldía guardada, `opcion_carne` null porque ninguna de las 4 canastas la pide),
// - el mismo `POST /api/subscriptions/crear` al proxy de Next (src/app/api/subscriptions/crear/route.ts: pide sesión y pone
//   el correo de la sesión),
// - y la misma salida: `localStorage.pendingSubscription` y `window.location.href = init_point` (MercadoPago) o
//   `/suscripciones/confirmacion?sin_costo=1` si el backend no cobró. Aquí no se habla con MercadoPago.
// Lo único distinto: el resultado vuelve al modal (paso 5) antes de salir, y el error se muestra en el modal (no en aviso).

export interface DatosAlta {
  nombre: string
  email: string
  telefono: string
  codigo_pais: string
  direccion: string
  /** `deliveryData.alcaldia` de hoy (la del perfil o la de la zona elegida). */
  alcaldia: string
  codigo_postal: string
  referencias: string
  dia_preferido: string
  alergias: string
}

export type ResultadoAlta =
  | { tipo: 'mercadopago'; url: string; guardar: Record<string, unknown> }
  | { tipo: 'sin_costo'; guardar: Record<string, unknown> }
  | { tipo: 'error'; mensaje: string; status: number | null }

export async function crearSuscripcion(
  planId: string,
  planNombre: string,
  frecuencia: string,
  datos: DatosAlta,
  municipioZona: string | null,
): Promise<ResultadoAlta> {
  const subscriptionData = {
    plan_id: planId,
    frequency: frecuencia,
    email: datos.email,
    nombre: datos.nombre,
    telefono: `${datos.codigo_pais}${datos.telefono}`,
    direccion: datos.direccion,
    alcaldia: municipioZona || datos.alcaldia,
    codigo_postal: datos.codigo_postal,
    referencias: datos.referencias || null,
    dia_preferido: datos.dia_preferido || null,
    alergias: datos.alergias || null,
    opcion_carne: null,
  }

  let status: number | null = null
  try {
    const response = await fetch('/api/subscriptions/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
    })
    status = response.status
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.detail || 'Error creando suscripción')
    }

    // Suscripción sin costo: el backend no llamó a MercadoPago (igual que hoy).
    if (!result.init_point && result.subscription_id) {
      return {
        tipo: 'sin_costo',
        guardar: {
          subscription_id: result.subscription_id,
          plan_name: planNombre,
          frequency: frecuencia,
          email: datos.email,
          sin_costo: true,
        },
      }
    }

    if (result.init_point) {
      return {
        tipo: 'mercadopago',
        url: result.init_point,
        guardar: {
          subscription_id: result.subscription_id,
          mp_preapproval_id: result.mp_preapproval_id,
          plan_name: planNombre,
          frequency: frecuencia,
          email: datos.email,
        },
      }
    }

    return { tipo: 'error', mensaje: 'Error: No se recibió URL de pago', status }
  } catch (error) {
    return {
      tipo: 'error',
      mensaje: `Error creando la suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      status,
    }
  }
}

/** La salida de hoy: guarda `pendingSubscription` y se va a MercadoPago (o a la confirmación sin costo). */
export function salirDelAlta(resultado: Exclude<ResultadoAlta, { tipo: 'error' }>): void {
  localStorage.setItem('pendingSubscription', JSON.stringify(resultado.guardar))
  window.location.href = resultado.tipo === 'mercadopago' ? resultado.url : '/suscripciones/confirmacion?sin_costo=1'
}
