const TIMEZONE = 'America/Mexico_City'

export function formatFechaMexico(
  fecha: string | Date | null,
  opciones?: Intl.DateTimeFormatOptions
): string {
  if (!fecha) return '-'
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-MX', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opciones,
  })
}

export function formatFechaHoraMexico(
  fecha: string | Date | null,
  opciones?: Intl.DateTimeFormatOptions
): string {
  if (!fecha) return '-'
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('es-MX', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opciones,
  })
}
