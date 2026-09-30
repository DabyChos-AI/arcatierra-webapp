// Fechas YYYY-MM-DD de /admin/eventos y del calendario del panel. Las cuentas se hacen
// en UTC con los componentes de la fecha: `new Date('YYYY-MM-DD')` se lee como
// medianoche UTC y en México pinta un día antes.

import { CAPACIDAD_SIN_TOPE } from '@/types/catalogos'

// TZ1 (Fase 3): UN solo «hoy» de México y una sola suma de días, en src/lib/dates.ts.
export { hoyMexico, sumarDias } from '@/lib/dates'

/** El día 1 del mes de `iso`. */
export function primeroDelMes(iso: string): string {
  return `${iso.slice(0, 7)}-01`
}

/** El último día del mes de `iso`. */
export function finDelMes(iso: string): string {
  const [anio, mes] = iso.split('-').map(Number)
  // Día 0 del mes siguiente = último día de este mes
  return new Date(Date.UTC(anio, mes, 0)).toISOString().slice(0, 10)
}

/** El día 1 del mes que está `meses` antes o después del de `iso`. */
export function sumarMeses(iso: string, meses: number): string {
  const [anio, mes] = iso.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1 + meses, 1)).toISOString().slice(0, 10)
}

/** «septiembre de 2026» */
export function etiquetaMes(iso: string): string {
  const [anio, mes] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(anio, mes - 1, 1)))
}

/** 'HH:MM:SS' → 'HH:MM' */
export function horaCorta(hora: string | null | undefined): string {
  return hora ? hora.slice(0, 5) : ''
}

/** «10:00–13:00», o solo el inicio si no hay fin. */
export function horario(inicio: string | null | undefined, fin: string | null | undefined): string {
  const i = horaCorta(inicio)
  const f = horaCorta(fin)
  if (!i) return '—'
  return f ? `${i}–${f}` : i
}

/** Sin tope = null o el centinela 999 del backend (nunca se pinta el 999). */
export function sinTope(capacidad: number | null | undefined): boolean {
  return capacidad == null || capacidad >= CAPACIDAD_SIN_TOPE
}
