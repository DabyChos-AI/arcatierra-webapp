/**
 * Extrae un mensaje de error legible desde el payload de una respuesta de error.
 *
 * FastAPI, al fallar validacion Pydantic (extra='forbid' o type-check), devuelve
 * `detail` como un ARRAY de objetos `[{loc, msg, type}]`, no como string. Pasar
 * ese array a `new Error(...)` renderiza literalmente "[object Object]" en la UI.
 * Este helper normaliza todos los casos a un string legible.
 *
 * Funcion pura, sin imports. TS strict, sin `any`.
 */
export function extraerMensajeError(payload: unknown, status?: number): string {
  // 1. payload string -> devolver tal cual
  if (typeof payload === 'string') {
    return payload
  }

  if (typeof payload === 'object' && payload !== null) {
    // 2. payload es objeto con .detail
    if ('detail' in payload) {
      const detail = (payload as { detail: unknown }).detail

      // detail string -> devolver ese string
      if (typeof detail === 'string') {
        return detail
      }

      // detail array -> mapear cada item (tipico Pydantic {loc, msg, type})
      if (Array.isArray(detail)) {
        const partes = detail.map((d) => extraerItemDetalle(d))
        if (partes.length > 0) {
          return partes.join('; ')
        }
      }

      // detail objeto -> d.msg ?? JSON.stringify(d)
      if (typeof detail === 'object' && detail !== null) {
        return extraerItemDetalle(detail)
      }
    }

    // 3. payload objeto con .message string -> ese message
    if ('message' in payload) {
      const message = (payload as { message: unknown }).message
      if (typeof message === 'string') {
        return message
      }
    }
  }

  // 4. fallback
  return status ? `Error ${status}` : 'Ocurrió un error inesperado'
}

/**
 * Normaliza un item de `detail` a string. Un item Pydantic tipico es
 * `{loc, msg, type}` — se prioriza `.msg`. Si no hay `.msg` string,
 * se serializa el objeto completo.
 */
function extraerItemDetalle(item: unknown): string {
  if (typeof item === 'string') {
    return item
  }
  if (typeof item === 'object' && item !== null && 'msg' in item) {
    const msg = (item as { msg: unknown }).msg
    if (typeof msg === 'string') {
      return msg
    }
  }
  if (typeof item === 'object' && item !== null) {
    return JSON.stringify(item)
  }
  return String(item)
}
