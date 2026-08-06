/**
 * Tipos del catálogo de reportes (Fase I).
 * Espejan el contrato de `routers/admin_reportes.py` del backend.
 */

export type FormatoReporte = 'xlsx' | 'pdf'
export type GrupoReporte = 'canastas' | 'ejecutivo'
export type TipoFiltro = 'date' | 'select' | 'bool'

export interface FiltroSpec {
  nombre: string
  etiqueta: string
  tipo: TipoFiltro
  requerido: boolean
  opciones?: (string | number)[]
  default?: string | number | boolean
}

export interface ReporteSpec {
  key: string
  nombre: string
  descripcion: string
  formatos: FormatoReporte[]
  grupo: GrupoReporte
  filtros: FiltroSpec[]
  disponible: boolean
}

export interface CatalogoResponse {
  reportes: ReporteSpec[]
  proximo_dia_habil: string
}

export interface PreviewResponse {
  columnas: string[]
  filas: (string | number | null)[][]
  meta: Record<string, unknown>
}

export interface HistorialItem {
  id: string
  reporte_key: string
  formato: FormatoReporte
  filtros: Record<string, unknown>
  estado: 'generando' | 'completado' | 'fallido'
  archivo_nombre: string | null
  tamano_bytes: number | null
  error_mensaje: string | null
  fecha_creacion: string
  generado_por_nombre: string
}

export interface HistorialResponse {
  items: HistorialItem[]
  total_count: number
  page: number
  per_page: number
}

export interface ErrorImport {
  fila: number
  motivo: string
}

export interface AvisoImport {
  fila: number
  folio: string
  avisos: string[]
}

export interface ImportResponse {
  batch_id: string
  fecha_entrega: string
  columnas_detectadas: string[]
  filas_ok: number
  filas_error: number
  filas_ignoradas: number
  errores: ErrorImport[]
  avisos: AvisoImport[]
  clientes_ya_registrados: number
  clientes_nuevos: number
}

export interface EstadoImport {
  fecha_entrega: string
  hay_corte: boolean
  filas: number
  con_avisos: number
  ultima_carga: string | null
}

/** Origen de la entrega dentro de `v_corte_dia`. '' = todos. */
export type OrigenCorte = '' | 'unica' | 'suscripcion' | 'import'

export const ETIQUETA_ORIGEN: Record<OrigenCorte, string> = {
  '': 'Todos',
  unica: 'Compra única',
  suscripcion: 'Suscripción',
  import: 'Corte importado',
}

/** Filtros que la página mantiene en un solo lugar y reparte a cada modal. */
export interface FiltrosGlobales {
  fecha_entrega: string
  origen: OrigenCorte
  desde: string
  hasta: string
}
