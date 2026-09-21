/**
 * Peticiones del panel admin, con errores que se pueden leer y accionar.
 *
 * POR QUE EXISTE
 * El 2026-09-17 la vista previa de reportes murio con "Failed to fetch" — el
 * mensaje crudo del navegador cuando la peticion no recibe NINGUNA respuesta
 * HTTP. La pantalla lo imprimia tal cual: sin codigo de estado, sin distinguir
 * red de error del servidor, sin reintento y sin limite de tiempo. Con eso no
 * se podia saber que habia pasado, y tampoco salir del paso.
 *
 * Las paginas admin llaman al backend directo desde el navegador con el token
 * de la sesion (convencion del proyecto, `context/frontend-v2.md`: NO se usa
 * `adminProxy()`, que es para Route Handlers). Este helper NO cambia eso:
 * envuelve el mismo `fetch` para que el error llegue clasificado.
 */

export type FalloPanel = {
  /** Lo que se le muestra a la persona. Nunca un mensaje de desarrollador. */
  mensaje: string
  /** Codigo HTTP, si llego a haber respuesta. */
  codigo?: number
  /** true = la peticion nunca recibio respuesta (red, DNS, el equipo dormido). */
  esDeRed: boolean
  /** true = la sesion caduco; hay que volver a entrar. */
  sesionExpirada: boolean
}

export class ErrorPanel extends Error implements FalloPanel {
  /** El mismo texto que `message`, con el nombre que usa el resto del panel. */
  mensaje: string
  codigo?: number
  esDeRed: boolean
  sesionExpirada: boolean

  constructor(fallo: FalloPanel) {
    super(fallo.mensaje)
    this.name = 'ErrorPanel'
    this.mensaje = fallo.mensaje
    this.codigo = fallo.codigo
    this.esDeRed = fallo.esDeRed
    this.sesionExpirada = fallo.sesionExpirada
  }
}

const TIEMPO_MAXIMO = 30_000

/**
 * Hace la peticion y devuelve el JSON, o lanza un `ErrorPanel` ya clasificado.
 * Quien lo llama decide como pintarlo; lo que nunca hace es dejar escapar el
 * "Failed to fetch" del navegador.
 */
export async function pedirAlPanel<T = unknown>(
  url: string,
  opciones: RequestInit = {}
): Promise<T> {
  let respuesta: Response

  try {
    respuesta = await fetch(url, {
      ...opciones,
      signal: opciones.signal ?? AbortSignal.timeout(TIEMPO_MAXIMO),
    })
  } catch (e) {
    // Aqui no hubo respuesta HTTP: o se agoto el tiempo, o la peticion no
    // llego a ningun lado. Son los dos casos que antes se veian como
    // "Failed to fetch" sin mas.
    const nombre = e instanceof Error ? e.name : ''
    const porTiempo = nombre === 'TimeoutError' || nombre === 'AbortError'
    throw new ErrorPanel({
      mensaje: porTiempo
        ? 'El servidor tardó más de 30 segundos en responder. Reintenta.'
        : 'Sin conexión con el servidor. Revisa tu internet y reintenta.',
      esDeRed: true,
      sesionExpirada: false,
    })
  }

  if (respuesta.status === 401) {
    throw new ErrorPanel({
      mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.',
      codigo: 401,
      esDeRed: false,
      sesionExpirada: true,
    })
  }

  if (!respuesta.ok) {
    // El backend suele mandar `detail`; si no, se dice el codigo, que es mas
    // util que un "Error desconocido".
    const cuerpo = await respuesta.json().catch(() => null)
    const detalle =
      cuerpo && typeof cuerpo === 'object' && 'detail' in cuerpo
        ? String((cuerpo as { detail: unknown }).detail)
        : ''
    throw new ErrorPanel({
      mensaje: detalle || `El servidor respondió con error ${respuesta.status}.`,
      codigo: respuesta.status,
      esDeRed: false,
      sesionExpirada: false,
    })
  }

  return (await respuesta.json()) as T
}

/** Igual, pero para descargas: devuelve la respuesta sin leer el cuerpo. */
export async function pedirArchivoAlPanel(
  url: string,
  opciones: RequestInit = {}
): Promise<Response> {
  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      ...opciones,
      signal: opciones.signal ?? AbortSignal.timeout(TIEMPO_MAXIMO),
    })
  } catch (e) {
    const nombre = e instanceof Error ? e.name : ''
    const porTiempo = nombre === 'TimeoutError' || nombre === 'AbortError'
    throw new ErrorPanel({
      mensaje: porTiempo
        ? 'La descarga tardó más de 30 segundos. Reintenta.'
        : 'Sin conexión con el servidor. Revisa tu internet y reintenta.',
      esDeRed: true,
      sesionExpirada: false,
    })
  }

  if (respuesta.status === 401) {
    throw new ErrorPanel({
      mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.',
      codigo: 401,
      esDeRed: false,
      sesionExpirada: true,
    })
  }

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null)
    const detalle =
      cuerpo && typeof cuerpo === 'object' && 'detail' in cuerpo
        ? String((cuerpo as { detail: unknown }).detail)
        : ''
    throw new ErrorPanel({
      mensaje: detalle || `El servidor respondió con error ${respuesta.status}.`,
      codigo: respuesta.status,
      esDeRed: false,
      sesionExpirada: false,
    })
  }

  return respuesta
}

/** La sesion caduco dentro del panel: se avisa y se vuelve al login, que
 *  regresara a esta misma pantalla. Mismo trato que el checkout (Entrega 1). */
export function volverAlLoginDelPanel(): void {
  if (typeof window === 'undefined') return
  const aqui = window.location.pathname + window.location.search
  window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(aqui)}`
}
