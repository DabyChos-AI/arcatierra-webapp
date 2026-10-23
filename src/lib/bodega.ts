/**
 * BOD1 (sesión K2, 23-oct-2026; respuesta de David): «Recoger en bodega» — UNA sola fuente de la dirección, el horario y
 * los días en que se recoge. El backend tiene su gemela en `services/bodega.py` (mismos valores; si cambia uno, cambia el
 * otro). La dirección se escribe UNA vez, en las partes de `BODEGA`.
 *
 * Se recoge solo lunes, miércoles o viernes que no sean día sin entrega, a partir de hoy + 2 (hoy de México,
 * `hoyMexico()` de `lib/dates.ts`). El backend vuelve a validar la fecha al pagar.
 */

const CALLE = 'Calle Gobernador Antonio Díez de Bonilla #37'
const COLONIA = 'San Miguel Chapultepec'
const ALCALDIA = 'Miguel Hidalgo'
const CODIGO_POSTAL = '11850'
const CIUDAD = 'CDMX'
const PAIS = 'México'

export const BODEGA = {
  calle: CALLE,
  colonia: COLONIA,
  alcaldia: ALCALDIA,
  codigoPostal: CODIGO_POSTAL,
  ciudad: CIUDAD,
  pais: PAIS,
  /** «Calle …, Col. …, Alcaldía …, C.P. 11850, CDMX, México» */
  completa: `${CALLE}, Col. ${COLONIA}, Alcaldía ${ALCALDIA}, C.P. ${CODIGO_POSTAL}, ${CIUDAD}, ${PAIS}`,
  /** «Calle …, Col. San Miguel Chapultepec» (para una línea corta) */
  corta: `${CALLE}, Col. ${COLONIA}`,
  horario: 'Lunes, miércoles y viernes de 9:00 a.m. a 5:00 p.m.',
  /** «Cómo llegar» (David, 23-oct): Google Maps de la bodega. Se abre con target="_blank" rel="noopener noreferrer". */
  mapsUrl: 'https://maps.app.goo.gl/uwiZRyAYXADCfZSk7',
} as const

/** El texto que se manda como `delivery_address` al pagar (el backend guarda el suyo, que es el mismo: TEXTO_PEDIDO). */
export const TEXTO_PEDIDO_RECOGER = `Recoger en bodega: ${BODEGA.completa} · Cómo llegar: ${BODEGA.mapsUrl}`

/** Días de la semana en que se recoge, ISO (1 = lunes … 7 = domingo). */
export const DIAS_RECOGER_ISO: readonly number[] = [1, 3, 5]

/** «lunes, miércoles o viernes» */
export const NOMBRES_DIAS_RECOGER = 'lunes, miércoles o viernes'

/** El mínimo para recoger: hoy + 2 días de calendario (el mismo `DIAS_MINIMOS_RECOGER` de services/bodega.py). */
export const DIAS_MINIMOS_RECOGER = 2

/** ¿Una fecha `AAAA-MM-DD` cae en lunes, miércoles o viernes? (no mira los días sin entrega; sin zona del navegador) */
export function esDiaDeRecoger(iso: string): boolean {
  const dia = new Date(`${iso}T12:00:00Z`).getUTCDay() // 0 = domingo
  return DIAS_RECOGER_ISO.includes(dia === 0 ? 7 : dia)
}
