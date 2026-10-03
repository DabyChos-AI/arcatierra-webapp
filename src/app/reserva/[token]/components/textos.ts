// Portal del cliente (G1, R9, sesión 49): textos y formatos puros de /reserva/[token] (sin React, sin I/O).
// La forma de los datos es `src/types/portal.ts` (del líder); aquí solo se decide cómo se dice.

import { formatFechaMexico, formatFechaHoraMexico } from '@/lib/dates'
import type { PortalExperiencia, TipoPortal } from '@/types/portal'

/** Buzón del equipo de Experiencias (el mismo de `checkout/success` y de `/usuario/reservas`, que lo importa de aquí). */
export const CORREO_EXPERIENCIAS = 'info@arcatierra.com'

const FECHA_LARGA: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }

/** «Sábado, 3 de octubre de 2026» (la fecha `YYYY-MM-DD` tal cual, sin correrla de día). */
export function fechaLarga(fecha: string | null): string {
  if (!fecha) return ''
  const texto = formatFechaMexico(fecha, FECHA_LARGA)
  return texto === '-' ? fecha : texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** «10:00 a 13:00», «10:00» o '' (sin hora). */
export function horario(inicio: string | null, fin: string | null): string {
  const a = horaCorta(inicio)
  const b = horaCorta(fin)
  if (a && b) return `${a} a ${b}`
  return a
}

/** «10:00:00» o «10:00» → «10:00»; lo que no parezca hora → ''. */
export function horaCorta(hora: string | null): string {
  if (!hora) return ''
  const m = /^(\d{1,2}):(\d{2})/.exec(hora)
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : ''
}

export function textoPersonas(n: number): string {
  return n === 1 ? '1 persona' : `${n} personas`
}

export function textoNinos(n: number): string {
  return n === 1 ? '1 niño' : `${n} niños`
}

export function textoIdioma(idioma: string | null): string {
  if (!idioma) return ''
  const i = idioma.toLowerCase()
  if (i === 'es') return 'Español'
  if (i === 'en') return 'Inglés'
  return idioma
}

/** Montos de la API (pueden llegar como texto si el back serializa un numeric): `$1,234.00`. */
export function dinero(monto: number | string, moneda: string): string {
  const n = typeof monto === 'number' ? monto : Number(monto)
  if (!Number.isFinite(n)) return '—'
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda || 'MXN', minimumFractionDigits: 2 }).format(n)
  } catch {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n)
  }
}

/** «Vence el 5 oct 2026, 18:00» (hora de México) o '' si no vence. */
export function textoVence(venceEn: string | null): string {
  if (!venceEn) return ''
  const t = formatFechaHoraMexico(venceEn)
  return t === '-' ? '' : `Vence el ${t}`
}

export function tituloPortal(tipo: TipoPortal): string {
  return tipo === 'compra' ? 'Tu compra' : 'Tu reserva'
}

/** Nombre del PNG del QR: `reserva-<folio>.png`, con el folio limpio para un nombre de archivo. */
export function nombreArchivoQr(folio: string): string {
  const limpio = folio.replace(/[^A-Za-z0-9_-]/g, '')
  return `reserva-${limpio || 'qr'}.png`
}

/** Renglones con texto (la API ya los manda limpios; esto es resguardo para una llave faltante o null). */
export function renglones(lista: string[] | null | undefined): string[] {
  return Array.isArray(lista) ? lista.filter((r) => typeof r === 'string' && r.trim() !== '') : []
}

/** Asunto del correo al equipo y texto del WhatsApp, con el folio si ya se conoce. */
export function asuntoContacto(folio: string | null): string {
  return folio ? `Mi reserva ${folio}` : 'Mi reserva'
}

export function textoWhatsApp(folio: string | null): string {
  return folio ? `Hola, tengo una duda sobre mi reserva ${folio}` : 'Hola, tengo una duda sobre mi reserva'
}

/** Una experiencia con algún dato de «plegables» (para no pintar secciones vacías). */
export function tieneDetalles(exp: PortalExperiencia): boolean {
  return renglones(exp.incluye).length + renglones(exp.informacion_importante).length + renglones(exp.requisitos).length > 0
}
