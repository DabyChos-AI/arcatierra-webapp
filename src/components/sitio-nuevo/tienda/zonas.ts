// R15 v2 · F3 (tienda): las zonas de entrega con la MISMA llamada y la MISMA regla del selector de código postal de hoy
// (src/components/ui/PostalCodeSelector.tsx). Vive en un solo lugar (D-F3-24 T-28): la usan el validador de la tienda y la zona del alta,
// y carrito la importa para su selector (cada uno pinta su pieza). Reescrita con su prueba contra la de hoy (D-F3-06).
// D-F3-20 P-6 / D-F3-24 T-21: el campo acepta solo dígitos, como hoy (`:98-100`), y ningún texto promete buscar por colonia.
import { API_URL } from '@/lib/api'

/** Una zona de GET /api/zonas-entrega/todas (las llaves que usa la página; la API trae más). */
export interface ZonaEntrega {
  id: number
  codigo_postal: string
  colonia: string
  municipio: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  tiempo_minimo_dias: number
}

function esZona(z: unknown): z is ZonaEntrega {
  const x = z as Partial<ZonaEntrega> | null
  return (
    !!x &&
    typeof x.codigo_postal === 'string' &&
    typeof x.colonia === 'string' &&
    typeof x.municipio === 'string' &&
    typeof x.id === 'number'
  )
}

let pedidoZonas: Promise<ZonaEntrega[] | null> | null = null

/**
 * Todas las zonas activas, UNA vez por carga de página (hoy cada selector las pide al montarse, `PostalCodeSelector.tsx:41-57`: aquí se
 * comparte la respuesta). null = no se pudieron leer; el siguiente que pregunte vuelve a intentarlo.
 */
export function pedirZonas(): Promise<ZonaEntrega[] | null> {
  if (!pedidoZonas) {
    pedidoZonas = fetch(`${API_URL}/api/zonas-entrega/todas`)
      .then(async (r) => {
        if (!r.ok) return null
        const datos: unknown = await r.json()
        const zonas = (datos as { zonas?: unknown } | null)?.zonas
        return Array.isArray(zonas) ? zonas.filter(esZona) : null
      })
      .catch(() => null)
      .then((zonas) => {
        if (!zonas) pedidoZonas = null
        return zonas
      })
  }
  return pedidoZonas
}

/** Lo que se puede teclear: solo dígitos y hasta 5 (`PostalCodeSelector.tsx:99`). */
export function soloDigitosCp(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 5)
}

/** Sin búsqueda, las primeras 10 (las más pedidas, como vienen); con búsqueda, hasta 15 (`PostalCodeSelector.tsx:71-80`). */
export function buscarZonas(zonas: readonly ZonaEntrega[], busqueda: string): ZonaEntrega[] {
  if (!busqueda) return zonas.slice(0, 10)
  const minus = busqueda.toLowerCase()
  return zonas
    .filter(
      (z) => z.codigo_postal.includes(busqueda) || z.colonia.toLowerCase().includes(minus) || z.municipio.toLowerCase().includes(minus),
    )
    .slice(0, 15)
}

/** Un código postal completo que no trae ninguna zona = sin cobertura (`PostalCodeSelector.tsx:83-89`). */
export function sinCobertura(busqueda: string, encontradas: readonly ZonaEntrega[]): boolean {
  return busqueda.length === 5 && encontradas.length === 0
}

/** Los días de la zona como hoy: «L, M, Mi, J, V» (`PostalCodeSelector.tsx:115-125`). */
export function diasDeZona(z: ZonaEntrega): string {
  const dias: string[] = []
  if (z.lunes) dias.push('L')
  if (z.martes) dias.push('M')
  if (z.miercoles) dias.push('Mi')
  if (z.jueves) dias.push('J')
  if (z.viernes) dias.push('V')
  if (z.sabado) dias.push('S')
  if (z.domingo) dias.push('D')
  return dias.join(', ')
}
