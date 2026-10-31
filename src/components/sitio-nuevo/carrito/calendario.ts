// R15 · F3 v2 (carrito, sesión 61): la regla del día de entrega y de recoger del checkout nuevo, sin React.
//
// Hoy vive DENTRO de `src/components/ui/DeliveryDatePicker.tsx` y no se exporta (`isIsoAvailable` :212-239, `getNextAvailableDay`
// :272-283, la caché de días sin entrega :93-110, el tope :149). Aquí se escribe la MISMA regla, renglón por renglón, y una prueba
// compara el conjunto de días que se pueden elegir con el del calendario de hoy en las mismas entradas (f3/carrito-F3.md §7 C5).
// Lo único distinto (D-F3-07 c, CAL1, pregunta C6): el calendario abre en el mes del primer día que se puede elegir, no en el de hoy.
// El «hoy» es el de México (`lib/dates.ts`); el backend vuelve a validar la fecha al pagar.

import { API_URL } from '@/lib/api'
import { hoyMexico, sumarDias } from '@/lib/dates'
import { DIAS_MINIMOS_RECOGER, esDiaDeRecoger } from '@/lib/bodega'
import type { ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import type { DiaNoHabil, RespuestaDiasNoHabiles } from '@/types/datos-cliente'

export type ModoCalendario = 'entrega' | 'recoger'

/** Días de la semana (0 = domingo) y meses, los textos del calendario de hoy (`DeliveryDatePicker.tsx:51-52`, `:267`). */
export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const
export const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

/** Lunes a viernes (`DeliveryDatePicker.tsx:37`): solo se usa si no hay zona (nunca con la regla de abajo, como hoy). */
const DIAS_HABILES: readonly boolean[] = [false, true, true, true, true, true, false]

/** Hasta cuántos días busca hoy el «próximo día disponible» (`DeliveryDatePicker.tsx:276`). Técnico: no se pinta. */
const DIAS_DE_BUSQUEDA = 30

/** El mínimo de días de una zona sin `tiempo_minimo_dias` (`DeliveryDatePicker.tsx:215`, `|| 2`). Técnico: no se pinta. */
const MINIMO_SIN_DATO = 2

// ─── Fechas `AAAA-MM-DD` sin zona del navegador (`DeliveryDatePicker.tsx:59-74`) ──────────────────────────────────────────
/** Día de la semana (0 = domingo) de una fecha `AAAA-MM-DD`. */
export function diaDeLaSemana(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay()
}

/** «Lunes 2 de Noviembre» (`DeliveryDatePicker.tsx:266-269`). */
export function textoDia(iso: string): string {
  const [, mes, dia] = iso.split('-').map(Number)
  return `${DIAS_LARGOS[diaDeLaSemana(iso)]} ${dia} de ${MESES[mes - 1]}`
}

/** `AAAA-MM` del mes de una fecha. */
export function mesDe(iso: string): string {
  return iso.slice(0, 7)
}

/** `AAAA-MM` ± n meses. */
export function sumarMeses(mes: string, n: number): string {
  const [anio, m] = mes.split('-').map(Number)
  const total = anio * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

/** Las celdas de un mes `AAAA-MM`: huecos (null) antes del día 1 y luego cada día como `AAAA-MM-DD` (`DeliveryDatePicker.tsx:191-209`). */
export function celdasDelMes(mes: string): (string | null)[] {
  const primero = `${mes}-01`
  const celdas: (string | null)[] = []
  for (let i = 0; i < diaDeLaSemana(primero); i++) celdas.push(null)
  for (let iso = primero; mesDe(iso) === mes; iso = sumarDias(iso, 1)) celdas.push(iso)
  return celdas
}

// ─── La regla (`DeliveryDatePicker.tsx:211-239`) ──────────────────────────────────────────────────────────────────────────
export interface EntradasDelDia {
  modo: ModoCalendario
  /** La zona de `GET /api/zonas-entrega/{cp}` (null en recoger, o mientras no llega). */
  zona: ZonaEntrega | null
  /** `hoyMexico()` (se pasa para poder probar con otro «hoy»). */
  hoy: string
  /** Último día que se puede agendar (`hoy + maximo_dias`), o null si no llegó la lista. */
  tope: string | null
  /** `AAAA-MM-DD` → motivo de los días sin entrega. */
  sinEntrega: ReadonlyMap<string, string>
}

export function diaDisponible(iso: string, e: EntradasDelDia): boolean {
  const recoger = e.modo === 'recoger'
  if (!recoger && !e.zona) return false
  const minimo = sumarDias(e.hoy, recoger ? DIAS_MINIMOS_RECOGER : e.zona?.tiempo_minimo_dias || MINIMO_SIN_DATO)
  if (iso < minimo) return false
  if (e.tope !== null && iso > e.tope) return false
  if (e.sinEntrega.has(iso)) return false
  if (recoger) return esDiaDeRecoger(iso)
  const dia = diaDeLaSemana(iso)
  if (!e.zona) return DIAS_HABILES[dia]
  const porDia = [e.zona.domingo, e.zona.lunes, e.zona.martes, e.zona.miercoles, e.zona.jueves, e.zona.viernes, e.zona.sabado]
  return porDia[dia]
}

/** El primer día que se puede elegir en los próximos 30 días, o null (`getNextAvailableDay`, `DeliveryDatePicker.tsx:272-283`). */
export function primerDiaDisponible(e: EntradasDelDia): string | null {
  for (let i = 0; i < DIAS_DE_BUSQUEDA; i++) {
    const iso = sumarDias(e.hoy, i)
    if (diaDisponible(iso, e)) return iso
  }
  return null
}

/** D-F3-07 c (CAL1): el mes con que abre el calendario = el del primer día que se puede elegir; sin ninguno, el de hoy. */
export function mesInicial(e: EntradasDelDia): string {
  return mesDe(primerDiaDisponible(e) ?? e.hoy)
}

/** El tope (`DeliveryDatePicker.tsx:149`): `hoy + maximo_dias`, o null. */
export function topeDeAgenda(hoy: string, maximoDias: number | null): string | null {
  return maximoDias !== null ? sumarDias(hoy, maximoDias) : null
}

/** El mes siguiente se ofrece solo si empieza antes del tope (`DeliveryDatePicker.tsx:262-263`). */
export function haySiguienteMes(mes: string, tope: string | null): boolean {
  return tope === null || `${sumarMeses(mes, 1)}-01` <= tope
}

/** «Sin entrega: {motivo}» (`DeliveryDatePicker.tsx:113-115`). */
export function textoSinEntrega(motivo: string): string {
  return `Sin entrega: ${motivo}`
}

export { hoyMexico }

// ─── Días sin entrega: UNA petición por carga de página (`DeliveryDatePicker.tsx:81-110`) ─────────────────────────────────
const ISO_FECHA = /^\d{4}-\d{2}-\d{2}$/

function esDiaNoHabil(d: unknown): d is DiaNoHabil {
  const x = d as Partial<DiaNoHabil> | null
  return !!x && typeof x.fecha === 'string' && ISO_FECHA.test(x.fecha) && typeof x.motivo === 'string'
}

function esRespuestaDiasNoHabiles(d: unknown): d is RespuestaDiasNoHabiles {
  const x = d as Partial<RespuestaDiasNoHabiles> | null
  return !!x && Array.isArray(x.dias) && typeof x.maximo_dias === 'number' && Number.isFinite(x.maximo_dias) && x.maximo_dias > 0
}

let pedidoDiasNoHabiles: Promise<RespuestaDiasNoHabiles | null> | null = null

/** `GET ${API_URL}/api/entregas/dias-no-habiles` (pública). Si falla, el siguiente calendario que se monte lo vuelve a intentar. */
export function pedirDiasNoHabiles(): Promise<RespuestaDiasNoHabiles | null> {
  if (!pedidoDiasNoHabiles) {
    pedidoDiasNoHabiles = fetch(`${API_URL}/api/entregas/dias-no-habiles`)
      .then(async (r) => {
        if (!r.ok) return null
        const datos: unknown = await r.json()
        return esRespuestaDiasNoHabiles(datos) ? { ...datos, dias: datos.dias.filter(esDiaNoHabil) } : null
      })
      .catch(() => null)
      .then((datos) => {
        if (!datos) pedidoDiasNoHabiles = null
        return datos
      })
  }
  return pedidoDiasNoHabiles
}
