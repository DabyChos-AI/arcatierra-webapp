// Fechas YYYY-MM-DD de la planeación semanal (la semana va de LUNES a DOMINGO).
// Las cuentas se hacen en UTC con los componentes de la fecha: ni la zona del
// navegador ni el horario de verano corren el día (`new Date('YYYY-MM-DD')`
// pinta un día antes en México).

export const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

// TZ1 (Fase 3): UN solo «hoy» de México y una sola suma de días, en src/lib/dates.ts.
import { sumarDias } from '@/lib/dates'
export { hoyMexico, sumarDias } from '@/lib/dates'

function aUTC(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

/** El lunes de la semana de `iso` (domingo pertenece a la semana que empezó el lunes anterior). */
export function lunesDe(iso: string): string {
  const desdeLunes = (aUTC(iso).getUTCDay() + 6) % 7
  return sumarDias(iso, -desdeLunes)
}
