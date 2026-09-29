// Fechas YYYY-MM-DD de la planeación semanal (la semana va de LUNES a DOMINGO).
// Las cuentas se hacen en UTC con los componentes de la fecha: ni la zona del
// navegador ni el horario de verano corren el día (`new Date('YYYY-MM-DD')`
// pinta un día antes en México).

export const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Hoy en México, como YYYY-MM-DD (en-CA imprime ese formato). */
export function hoyMexico(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function aUTC(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = aUTC(iso)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

/** El lunes de la semana de `iso` (domingo pertenece a la semana que empezó el lunes anterior). */
export function lunesDe(iso: string): string {
  const desdeLunes = (aUTC(iso).getUTCDay() + 6) % 7
  return sumarDias(iso, -desdeLunes)
}
