// R15 v2 · F3 (tienda): «Canasta lista» (DR-15, D-F3-08). Los precios de suscripción salen de GET /api/subscriptions/planes y la compra
// única «Solo esta vez» de la canasta U (1885U–1891U) de GET /api/products (o de GET /api/products/{itemcode} si no vino en la lista,
// D-F3-24 T-15). Los kilos salen del NOMBRE de la base; las personas y la carne son los textos de hoy de src/app/suscripciones/page.tsx,
// que no se exportan (D-F3-21: entran en la lista corta con su línea; la Completa NO: va la marca de C35). La retornable no se ofrece
// aquí (DR-14, DR-19): solo como renglón con su marca en el alta.
import { aNumero, esCanasta } from '@/types/tienda'

export interface FrecuenciaApi {
  id: string
  name: string
  days: number
}

export interface PlanApi {
  id: string
  itemcode: string
  name: string
  price: number
  frequencies: FrecuenciaApi[]
}

function esFrecuencia(f: unknown): f is FrecuenciaApi {
  const x = f as Partial<FrecuenciaApi> | null
  return !!x && typeof x.id === 'string' && typeof x.name === 'string' && Number.isFinite(aNumero(x.days))
}

/** Lee `{planes}` de GET /api/subscriptions/planes; undefined si la respuesta no se puede leer. */
export function leerPlanes(respuesta: unknown): PlanApi[] | undefined {
  const planes = (respuesta as { planes?: unknown } | null)?.planes
  if (!Array.isArray(planes)) return undefined
  return planes
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .filter((p) => typeof p.id === 'string' && typeof p.itemcode === 'string' && typeof p.name === 'string')
    .map((p) => ({
      id: p.id as string,
      itemcode: p.itemcode as string,
      name: p.name as string,
      price: aNumero(p.price),
      frequencies: Array.isArray(p.frequencies)
        ? (p.frequencies as unknown[]).filter(esFrecuencia).map((f) => ({ ...f, days: aNumero(f.days) }))
        : [],
    }))
}

/** La llave del plan de la canasta retornable (services/subscriptions.py:39). */
export const PLAN_RETORNABLE = 'retornable'

export type Grupo = 'regulares' | 'basicas' | 'pruebas'

/**
 * El grupo de cada plan, como las categorías de `/suscripciones` de hoy (`categoria`: «Canastas Regulares», «Canastas Básicas», «Pruebas»,
 * suscripciones/page.tsx:23, :87, :231): las básicas son `basica-*`; el resto de las canastas, regulares; los planes de prueba (Test 01/02)
 * como hoy (C47). La retornable no tiene grupo.
 */
export function grupoDe(plan: Pick<PlanApi, 'id' | 'itemcode'>): Grupo | null {
  if (plan.id === PLAN_RETORNABLE) return null
  if (esCanasta(plan.itemcode)) return plan.id.startsWith('basica-') ? 'basicas' : 'regulares'
  return 'pruebas'
}

export const TITULO_GRUPO: Record<Grupo, string> = {
  regulares: 'Canastas Regulares',
  basicas: 'Canastas Básicas',
  pruebas: 'Pruebas',
}

/** «3.5 kg» del nombre de la base («Canasta Individual Suscripción 3.5kg »); null si el nombre no trae kilos. */
export function kilosDe(nombre: string | undefined): string | null {
  const m = (nombre ?? '').match(/(\d+(?:[.,]\d+)?)\s*kg/i)
  return m ? `${m[1].replace(',', '.')} kg` : null
}

/**
 * Personas de cada canasta, los textos de hoy (D-F3-21, `suscripciones/page.tsx`): individual L21, media L42, familiar L185, básicas
 * L85, L114, L144; los planes de prueba L229/L249. **completa: null** → marca «personas de la Canasta Completa» · David (C35, D-F3-08).
 */
export const PERSONAS: Readonly<Record<string, string | null>> = {
  individual: '1-2 personas',
  media: '2-3 personas',
  completa: null,
  familiar: '4-6 personas',
  'basica-individual': '1-2 personas (productos básicos)',
  'basica-media': '2-4 personas (productos básicos)',
  'basica-familiar': '4-6 personas (productos básicos)',
  'test-01': 'Pruebas internas',
  'test-02': 'Pruebas internas',
}

/** La Básica Familiar exige elegir la carne (DR-15; `suscripciones/page.tsx:164-171`, validado en `SubscriptionCheckoutForm.tsx:239-244`). */
export const PLAN_CON_CARNE = 'basica-familiar'

/** Las dos opciones de hoy, letra por letra (`suscripciones/page.tsx:168-169`; «500 g» en la lista corta, D-F3-21). */
export const OPCIONES_CARNE = [
  { valor: 'molida', texto: '500 g de carne molida de res de origen regenerativo' },
  { valor: 'deshebrada', texto: '500 g de carne deshebrada de res de origen regenerativo' },
] as const

/** Los planes que se ofrecen en «Canasta lista», por grupo y en el orden de la API. */
export function porGrupo(planes: readonly PlanApi[]): Record<Grupo, PlanApi[]> {
  const grupos: Record<Grupo, PlanApi[]> = { regulares: [], basicas: [], pruebas: [] }
  for (const plan of planes) {
    const g = grupoDe(plan)
    if (g) grupos[g].push(plan)
  }
  return grupos
}

/** El precio de suscripción más bajo de un grupo (para el «desde»); null si ninguno tiene precio. */
export function desdeDe(planes: readonly PlanApi[]): number | null {
  const precios = planes.map((p) => p.price).filter((n) => n > 0)
  return precios.length > 0 ? Math.min(...precios) : null
}
