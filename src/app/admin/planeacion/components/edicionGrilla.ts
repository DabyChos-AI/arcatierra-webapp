// R4 · Edición en la celda de la grilla semanal (sesión 44).
// Contrato: build-with-agent-team/projects/arcatierra/docs/decisiones/R4-CONTRATO.md §4 (front-grilla, punto 2).
//
// La grilla usa los MISMOS PATCH que el detalle (editar en la grilla = editar en el detalle) y manda
// SOLO el campo que cambió + `version` (la fecha_actualizacion leída). Nunca otro campo: un
// `numero_invitados_min` reenviado re-precia las reservas del Sheet.

import type { ItemGrilla } from '@/types/planeacion'

export type CampoEditable = 'guias' | 'chinampa' | 'cocina' | 'fuente' | 'notas'

/** Lo que se edita en el editor: ids de guías o un texto/id (vacío = sin asignar). */
export type ValorCampo = string | string[]

export const ETIQUETA_CAMPO: Record<CampoEditable, string> = {
  guias: 'guías',
  chinampa: 'chinampa',
  cocina: 'cocina',
  fuente: 'fuente',
  notas: 'notas internas',
}

/** La fuente solo existe en las privadas (las fechas públicas e internos no la tienen). */
export function camposEditables(item: ItemGrilla): CampoEditable[] {
  return item.tipo === 'privada'
    ? ['guias', 'chinampa', 'cocina', 'fuente', 'notas']
    : ['guias', 'chinampa', 'cocina', 'notas']
}

export function valorDe(item: ItemGrilla, campo: CampoEditable): ValorCampo {
  switch (campo) {
    case 'guias':
      return item.guias.map((g) => g.personal_id)
    case 'chinampa':
      return item.chinampa ?? ''
    case 'cocina':
      return item.cocina_id ?? ''
    case 'fuente':
      return item.fuente_id ?? ''
    case 'notas':
      // CRUDAS: solo llegan a quien edita
      return item.notas_internas ?? ''
  }
}

function mismosIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const enB = new Set(b)
  return a.every((x) => enB.has(x))
}

export function mismoValor(a: ValorCampo, b: ValorCampo): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && mismosIds(a, b)
  }
  return a === b
}

export interface PeticionGuardar {
  url: string // ruta relativa a API_URL
  body: Record<string, unknown>
}

/**
 * La petición de UN campo. `version` va solo si se conoce (sin `version` el backend hace lo de
 * siempre; con `version: null` lo tomaría como versión ilegible → 409).
 */
export function peticionGuardar(
  item: ItemGrilla,
  campo: CampoEditable,
  valor: ValorCampo,
  version: string | null,
): PeticionGuardar {
  const texto = Array.isArray(valor) ? '' : valor
  const ids = Array.isArray(valor) ? valor : []
  const conVersion = (body: Record<string, unknown>) =>
    version ? { ...body, version } : body
  const id = encodeURIComponent(item.id)

  if (item.tipo === 'privada') {
    const url = `/api/admin/reservas/${id}`
    switch (campo) {
      case 'guias':
        return { url: `${url}/guias`, body: conVersion({ guias_ids: ids }) }
      case 'chinampa':
        // null limpia (el back lee model_fields_set)
        return { url, body: conVersion({ chinampa_asignada: texto || null }) }
      case 'cocina':
        return { url, body: conVersion({ cocina_id: texto || null }) }
      case 'fuente':
        return { url, body: conVersion({ fuente_id: texto || null }) }
      case 'notas':
        // En reservas `null` NO limpia las notas (el back lo salta): para vaciar se manda ""
        return { url, body: conVersion({ notas_internas: texto.trim() ? texto : '' }) }
    }
  }

  // Fecha pública o evento interno: PATCH /admin/eventos/{id} (null limpia los anulables)
  const url = `/api/admin/eventos/${id}`
  switch (campo) {
    case 'guias':
      return { url, body: conVersion({ guias_ids: ids }) }
    case 'chinampa':
      return { url, body: conVersion({ chinampa: texto || null }) }
    case 'cocina':
      return { url, body: conVersion({ cocina_id: texto || null }) }
    case 'notas':
      return { url, body: conVersion({ notas_internas: texto.trim() ? texto : null }) }
    case 'fuente':
      // No existe en eventos: la UI nunca ofrece el lápiz (camposEditables)
      throw new Error('La fuente solo se edita en reservas privadas')
  }
}

/** Busca el item fresco (después de recargar) por tipo e id. */
export function buscarItem(
  dias: ReadonlyArray<{ items: ItemGrilla[] }> | null | undefined,
  tipo: ItemGrilla['tipo'],
  id: string,
): ItemGrilla | null {
  if (!dias) return null
  for (const d of dias) {
    const hallado = d.items.find((i) => i.tipo === tipo && i.id === id)
    if (hallado) return hallado
  }
  return null
}

export const ESTADO_PAGO_TEXTO: Record<string, string> = {
  sin_pagar: 'Sin pagar',
  anticipo: 'Anticipo',
  pagado: 'Pagado',
  cortesia: 'Cortesía',
  reembolsado: 'Reembolsado',
}

export const TIPO_TEXTO: Record<ItemGrilla['tipo'], string> = {
  privada: 'Privada',
  publica: 'Pública',
  interno: 'Interno',
}
