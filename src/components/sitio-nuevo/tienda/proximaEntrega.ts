// R15 v2 · F3 (tienda): «Próxima entrega disponible» del validador, con la regla del calendario de hoy (`isIsoAvailable` y
// `getNextAvailableDay`, src/components/ui/DeliveryDatePicker.tsx:212-239 y :272-283), que vive dentro del componente y no se exporta.
// Reescrita con su prueba contra la de hoy en las mismas entradas (D-F3-06). La hora de corte de antes de las 12 lleva su marca (C53,
// D-F3-07 b, D-F3-24 T-13): la regla de hoy no cambia aquí.
import { API_URL } from '@/lib/api'
import { hoyMexico, sumarDias } from '@/lib/dates'
import type { DiaNoHabil, RespuestaDiasNoHabiles } from '@/types/datos-cliente'
import type { ZonaEntrega } from './zonas'

const ISO_FECHA = /^\d{4}-\d{2}-\d{2}$/

function esDiaNoHabil(d: unknown): d is DiaNoHabil {
  const x = d as Partial<DiaNoHabil> | null
  return !!x && typeof x.fecha === 'string' && ISO_FECHA.test(x.fecha) && typeof x.motivo === 'string'
}

function esRespuesta(d: unknown): d is RespuestaDiasNoHabiles {
  const x = d as Partial<RespuestaDiasNoHabiles> | null
  return !!x && Array.isArray(x.dias) && typeof x.maximo_dias === 'number' && Number.isFinite(x.maximo_dias) && x.maximo_dias > 0
}

let pedidoDias: Promise<RespuestaDiasNoHabiles | null> | null = null

/** GET /api/entregas/dias-no-habiles una vez por carga (como hoy, `DeliveryDatePicker.tsx:93-110`); si falla, se vuelve a intentar. */
export function pedirDiasNoHabiles(): Promise<RespuestaDiasNoHabiles | null> {
  if (!pedidoDias) {
    pedidoDias = fetch(`${API_URL}/api/entregas/dias-no-habiles`)
      .then(async (r) => {
        if (!r.ok) return null
        const datos: unknown = await r.json()
        return esRespuesta(datos) ? { ...datos, dias: datos.dias.filter(esDiaNoHabil) } : null
      })
      .catch(() => null)
      .then((datos) => {
        if (!datos) pedidoDias = null
        return datos
      })
  }
  return pedidoDias
}

export interface ReglasCalendario {
  /** `AAAA-MM-DD` sin entrega (feriados y los del panel). */
  sinEntrega: ReadonlySet<string>
  /** Hasta cuántos días adelante se agenda; null = no llegó la lista (sin tope, como hoy). */
  maximoDias: number | null
}

export const SIN_REGLAS: ReglasCalendario = { sinEntrega: new Set(), maximoDias: null }

export function reglasDe(respuesta: RespuestaDiasNoHabiles | null): ReglasCalendario {
  if (!respuesta) return SIN_REGLAS
  return { sinEntrega: new Set(respuesta.dias.map((d) => d.fecha)), maximoDias: respuesta.maximo_dias }
}

/** El mínimo de días de hoy cuando la zona no lo trae (`zona?.tiempo_minimo_dias || 2`, DeliveryDatePicker.tsx:215). */
const MINIMO_SI_NO_VIENE = 2
/** Cuántos días adelante busca hoy el primero disponible (DeliveryDatePicker.tsx:276). */
const VENTANA_DIAS = 30

/** 0 = domingo; sin que la zona del navegador corra el día. */
function diaDeLaSemana(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay()
}

/** ¿Se entrega ese día en esa zona? (la regla de `isIsoAvailable` en modo entrega). */
export function seEntrega(iso: string, zona: ZonaEntrega, hoy: string, reglas: ReglasCalendario): boolean {
  const minimo = sumarDias(hoy, zona.tiempo_minimo_dias || MINIMO_SI_NO_VIENE)
  if (iso < minimo) return false
  const tope = reglas.maximoDias !== null ? sumarDias(hoy, reglas.maximoDias) : null
  if (tope !== null && iso > tope) return false
  if (reglas.sinEntrega.has(iso)) return false
  const porDia = [zona.domingo, zona.lunes, zona.martes, zona.miercoles, zona.jueves, zona.viernes, zona.sabado]
  return porDia[diaDeLaSemana(iso)] === true
}

/** El primer día en que se entrega en esa zona (`AAAA-MM-DD`), buscando desde hoy; null si no hay en la ventana de hoy. */
export function proximaEntrega(zona: ZonaEntrega, reglas: ReglasCalendario, hoy: string = hoyMexico()): string | null {
  for (let i = 0; i < VENTANA_DIAS; i++) {
    const iso = sumarDias(hoy, i)
    if (seEntrega(iso, zona, hoy, reglas)) return iso
  }
  return null
}
