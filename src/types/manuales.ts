// R11b · MANP1 (sesión 51, 22-oct-2026; DR74). Dueño: el líder. Contrato: docs/decisiones/R11B-CONTRATO.md §4.4.
// Sección «Manuales» del panel. Los archivos NUNCA están en public/: la API los sirve con sesión desde /app/manuales
// (montado solo lectura). Quién ve qué:
//  - guia-panel y manual-experiencias: permiso `experiencias_publicas` o `experiencias_privadas` (super_admin siempre).
//  - mi-dia (la parte de Mi día del manual): además, permiso `mi_dia` (guías y cocina).

export type IdManual = 'guia-panel' | 'manual-experiencias' | 'mi-dia'

export interface Manual {
  id: IdManual
  titulo: string
  descripcion: string
  /** «H» */
  revision: string
  /** YYYY-MM-DD (México) de la revisión */
  fecha: string
  paginas: number | null
  /** Tamaño del PDF en bytes */
  tamano_pdf: number
  /** Hay versión web (HTML con sus capturas) */
  tiene_web: boolean
}

/** GET /api/admin/manuales → solo los que tu rol activo puede ver (lista vacía si ninguno). */
export interface ManualesRespuesta {
  items: Manual[]
}

/**
 * Se ABREN en otra pestaña por el proxy de Next con la cookie de sesión (no con Bearer):
 *  - PDF:  /api/admin/manuales/<id>/pdf          (inline; ?descargar=1 → attachment)
 *  - Web:  /api/admin/manuales/<id>/web/index.html (las capturas por rutas relativas del mismo prefijo)
 * 403 sin permiso para ESE manual · 404 si no existe.
 */
export function urlManual(id: IdManual, formato: 'pdf' | 'web', descargar = false): string {
  if (formato === 'web') return `/api/admin/manuales/${id}/web/index.html`
  return `/api/admin/manuales/${id}/pdf${descargar ? '?descargar=1' : ''}`
}
