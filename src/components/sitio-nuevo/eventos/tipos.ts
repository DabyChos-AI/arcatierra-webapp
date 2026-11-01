// R15 v2 · F4 (eventos): los tipos de evento de Arca Tierra. Son los 5 que escribieron en la respuesta 3 del cuestionario del 28-oct
// («en lugar de los 10 de la maqueta»): DECISIONES.md DR-23 (L239-240) y juntas/2026-10-26-decisiones/RESPUESTAS-2026-10-28.md fila 3.
// Ningún archivo de hoy los tiene: viven aquí con su fuente. Se muestran por nombre y no se pueden elegir (la API no recibe el tipo, DR-23).
export const TIPOS_EVENTO = [
  'Turismo',
  'Celebración de cumpleaños',
  'Evento corporativo',
  'Evento de marca',
  'Visita de prensa',
] as const

/** La llave de `data-tipo`: minúsculas, sin acentos y con guiones («Celebración de cumpleaños» → «celebracion-de-cumpleanos»). */
export function claveTipo(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
}
