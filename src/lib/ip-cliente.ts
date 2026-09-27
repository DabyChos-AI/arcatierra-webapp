/**
 * La IP del cliente para los límites de intentos del backend (A13, 2026-09-27).
 *
 * El backend cuenta cada límite por la IP del cliente. Pero el login, el alta con
 * Google y el guest-token del checkout los pide el SERVIDOR de Next, no el
 * navegador: al backend le llegaba la IP del servidor y todos los clientes
 * compartían una sola cuenta (login 10/min y guest-token 5/min para toda la
 * tienda). Estas cabeceras le pasan la IP que puso Cloudflare, firmadas con el
 * secreto interno; sin el secreto correcto el backend las ignora.
 *
 * Solo servidor: usa INTERNAL_API_SECRET.
 */

type CabecerasDeOrigen = Headers | Record<string, string | string[] | undefined> | null | undefined

function leer(origen: CabecerasDeOrigen, nombre: string): string | null {
  if (!origen) return null
  if (origen instanceof Headers) return origen.get(nombre)
  const valor = origen[nombre]
  if (Array.isArray(valor)) return valor[0] ?? null
  return valor ?? null
}

export function cabecerasDelCliente(origen: CabecerasDeOrigen): Record<string, string> {
  const secreto = process.env.INTERNAL_API_SECRET
  const ip = leer(origen, 'cf-connecting-ip')?.trim()
  if (!secreto || !ip) return {}
  return { 'X-Cliente-IP': ip, 'X-Internal-Api-Secret': secreto }
}

/** Para los callbacks de NextAuth, que no reciben la petición: la toma del contexto. */
export async function cabecerasDelClienteActual(): Promise<Record<string, string>> {
  try {
    const { headers } = await import('next/headers')
    return cabecerasDelCliente(await headers())
  } catch {
    return {}
  }
}
