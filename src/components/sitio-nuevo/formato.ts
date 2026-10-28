// R15 · F1 (WF1, sesión 54): formatos del sitio nuevo. Sin Intl ni zona del navegador: el servidor y el navegador escriben
// exactamente lo mismo (sin hidratación distinta). Sin imports.

/** 1100 → «$1,100» · 45.5 → «$45.50» (el precio tal cual viene de la base; aquí solo se escribe). */
export function precioVisible(precio: number): string {
  const centavos = Math.round(precio * 100)
  const entero = Math.trunc(centavos / 100)
  const resto = Math.abs(centavos % 100)
  const miles = String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${precio < 0 ? '-' : ''}$${miles}${resto ? `.${String(resto).padStart(2, '0')}` : ''}`
}

/** 4 → «4 h» · 3.5 → «3 h 30 min» · 0.75 → «45 min» (duración de una experiencia en horas). */
export function duracionVisible(horas: number): string {
  const minutos = Math.round(horas * 60)
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** «2026-11-01» → «Dom 1 nov» (una fecha AAAA-MM-DD tal cual, sin desplazarla por zona). '' si no es una fecha. */
export function fechaCorta(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return ''
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()
  return `${DIAS[diaSemana]} ${dia} ${MESES[mes - 1]}`
}

/** «05:45:00» → «5:45 am» · «13:30» → «1:30 pm». '' si no es una hora. */
export function horaCorta(hora: string | null): string {
  const m = hora ? /^(\d{1,2}):(\d{2})/.exec(hora) : null
  if (!m) return ''
  const h = Number(m[1])
  const sufijo = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m[2]} ${sufijo}`
}
