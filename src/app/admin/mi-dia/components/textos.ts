// Textos y formatos de Mi día (K4, R8, sesión 48). Funciones puras: sin fechas del navegador como «hoy»
// (la fecha la manda el backend en `MiDiaResponse.fecha`).

import { formatFechaMexico } from '@/lib/dates'
import type { DiaMiDia, ModoMiDia, ReservaMiDia } from '@/types/mi-dia'

export const TEXTO_SIN_FICHA =
  'Tu cuenta aún no está ligada a tu ficha de guía. Pide a una encargada que la ligue en Personal.'

/** «Hoy no tienes experiencias asignadas.» / «Mañana no hay experiencias.» */
export function textoVacio(dia: DiaMiDia, modo: ModoMiDia): string {
  const cuando = dia === 'hoy' ? 'Hoy' : 'Mañana'
  return modo === 'guia' ? `${cuando} no tienes experiencias asignadas.` : `${cuando} no hay experiencias.`
}

/** «Viernes, 2 de octubre de 2026» desde el YYYY-MM-DD del backend. */
export function fechaLarga(fecha: string): string {
  const texto = formatFechaMexico(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  if (texto === '-') return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** «10:00» de «10:00:00». */
export function horaCorta(hora: string | null | undefined): string {
  if (!hora) return ''
  const m = /^(\d{1,2}):(\d{2})/.exec(hora)
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : hora
}

export function textoIdioma(idioma: string | null | undefined): string {
  const i = (idioma ?? '').trim().toLowerCase()
  if (!i) return ''
  if (i === 'es') return 'Español'
  if (i === 'en') return 'Inglés'
  return i.toUpperCase()
}

export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`
}

export const ETIQUETA_ESTADO: Record<ReservaMiDia['estado'], string> = {
  confirmada: 'Confirmada',
  pagada: 'Pagada',
  realizada: 'Realizada',
}

/** Alergias de la reserva y de cada invitado, en renglones («Ana: nuez»). Vacío = sin alergias registradas. */
export function renglonesAlergias(r: ReservaMiDia): string[] {
  const renglones: string[] = []
  const notas = (r.notas_alergias ?? '').trim()
  if (notas) renglones.push(notas)
  r.invitados.forEach((inv, i) => {
    const alergia = (inv.alergias ?? '').trim()
    if (!alergia) return
    const quien = (inv.nombre ?? '').trim() || `Invitado ${i + 1}`
    renglones.push(`${quien}: ${alergia}`)
  })
  return renglones
}

/** Número de personas que llegaron: vacío = null (no se dice); entero 0..999; otra cosa = undefined (inválido). */
export function leerPersonasLlegaron(valor: string): number | null | undefined {
  const limpio = valor.trim()
  if (!limpio) return null
  if (!/^\d{1,3}$/.test(limpio)) return undefined
  const n = Number(limpio)
  return n >= 0 && n <= 999 ? n : undefined
}
