const TIMEZONE = 'America/Mexico_City'

/** `2026-09-02` — una fecha sin hora, como las que devuelve una columna DATE. */
const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/**
 * Formatea una fecha para México.
 *
 * ⚠️ El caso que hay que tratar aparte son las fechas SIN HORA. JavaScript
 * interpreta `new Date('2026-09-02')` como **medianoche UTC**, y al pintarla en
 * horario de México (UTC-6) retrocede seis horas y cae en el día anterior:
 *
 *     new Date('2026-09-02') -> "1 sep 2026"     ← un día antes
 *
 * `fecha_entrega` es una columna DATE, así que TODAS las fechas de entrega del
 * panel se mostraban un día antes de lo que decía la base: la pantalla de
 * entregas decía "1 sep" para pedidos agendados el 2, y al pedir el reporte de
 * ese 1 de septiembre salía vacío. En un negocio de reparto eso es surtir el
 * día equivocado.
 *
 * Una fecha sin hora no tiene zona horaria que convertir: se arma como fecha
 * local con sus propios componentes y se imprime tal cual. Los timestamps
 * completos sí se siguen convirtiendo a horario de México, que es lo correcto.
 */
export function formatFechaMexico(
  fecha: string | Date | null,
  opciones?: Intl.DateTimeFormatOptions
): string {
  if (!fecha) return '-'

  if (typeof fecha === 'string' && SOLO_FECHA.test(fecha)) {
    const [anio, mes, dia] = fecha.split('-').map(Number)
    const local = new Date(anio, mes - 1, dia)
    if (isNaN(local.getTime())) return '-'
    // Sin `timeZone`: se imprime la fecha tal como vino, sin desplazarla.
    return local.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...opciones,
    })
  }

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
  // Una fecha sin hora no tiene hora que mostrar, y convertirla la correría al
  // día anterior. Se delega para que salga el día correcto y sin hora inventada.
  if (typeof fecha === 'string' && SOLO_FECHA.test(fecha)) {
    return formatFechaMexico(fecha, opciones)
  }
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
