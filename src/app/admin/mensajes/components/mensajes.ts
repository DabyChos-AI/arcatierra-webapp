// Bandeja «Mensajes» (WF11, R11b, DR71). Funciones puras: lectura defensiva de las respuestas (llave faltante ≠ pantalla
// rota), textos y ligas. Forma exacta en `src/types/mensajes.ts` (líder).

import { formatFechaHoraMexico } from '@/lib/dates'
import type {
  EstadoMensaje,
  EstadoSuscriptor,
  MensajeContacto,
  MensajesRespuesta,
  NewsletterRespuesta,
  SuscriptorNewsletter,
} from '@/types/mensajes'

export const POR_PAGINA_MENSAJES = 20
export const POR_PAGINA_NEWSLETTER = 50

export const ESTADOS_MENSAJE: EstadoMensaje[] = ['nuevo', 'leido', 'respondido', 'archivado']

export const CLASE_ESTADO_MENSAJE: Record<EstadoMensaje, string> = {
  nuevo: 'bg-terracota/10 text-terracota',
  leido: 'bg-azul-bg text-azul',
  respondido: 'bg-verde/10 text-verde',
  archivado: 'bg-neutro-light text-verde-suave',
}

export const ETIQUETA_ORIGEN: Record<SuscriptorNewsletter['origen'], string> = {
  pie: 'Pie de página',
  popup: 'Ventana emergente',
  prensa: 'Prensa',
  perfil: 'Perfil',
}

export function esEstadoMensaje(v: unknown): v is EstadoMensaje {
  return typeof v === 'string' && (ESTADOS_MENSAJE as string[]).includes(v)
}

function texto(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function textoONull(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null
}

export function normalizarMensaje(cuerpo: unknown): MensajeContacto | null {
  if (!cuerpo || typeof cuerpo !== 'object') return null
  const m = cuerpo as Partial<MensajeContacto>
  if (typeof m.id !== 'string') return null
  return {
    id: m.id,
    nombre: texto(m.nombre),
    email: texto(m.email),
    asunto: textoONull(m.asunto),
    mensaje: texto(m.mensaje),
    estado: esEstadoMensaje(m.estado) ? m.estado : 'nuevo',
    creado_en: texto(m.creado_en),
    atendido_en: textoONull(m.atendido_en),
    atendido_por_nombre: textoONull(m.atendido_por_nombre),
  }
}

export function normalizarMensajes(cuerpo: unknown): MensajesRespuesta {
  const c = (cuerpo && typeof cuerpo === 'object' ? cuerpo : {}) as Partial<MensajesRespuesta>
  const items = Array.isArray(c.items) ? c.items.map(normalizarMensaje).filter((m): m is MensajeContacto => m !== null) : []
  return { items, total: Number(c.total) || 0, nuevos: Number(c.nuevos) || 0 }
}

export function normalizarSuscriptor(cuerpo: unknown): SuscriptorNewsletter | null {
  if (!cuerpo || typeof cuerpo !== 'object') return null
  const s = cuerpo as Partial<SuscriptorNewsletter>
  if (typeof s.id !== 'string') return null
  const origen = s.origen && s.origen in ETIQUETA_ORIGEN ? s.origen : 'pie'
  const estado: EstadoSuscriptor = s.estado === 'baja' ? 'baja' : 'activo'
  return {
    id: s.id,
    email: texto(s.email),
    origen,
    estado,
    consentido_en: texto(s.consentido_en),
    baja_en: textoONull(s.baja_en),
  }
}

export function normalizarNewsletter(cuerpo: unknown): NewsletterRespuesta {
  const c = (cuerpo && typeof cuerpo === 'object' ? cuerpo : {}) as Partial<NewsletterRespuesta>
  const items = Array.isArray(c.items)
    ? c.items.map(normalizarSuscriptor).filter((s): s is SuscriptorNewsletter => s !== null)
    : []
  return { items, total: Number(c.total) || 0, activos: Number(c.activos) || 0 }
}

/** «22 oct 2026, 14:05» en hora de México; vacío si no hay fecha. */
export function fechaHora(iso: string | null): string {
  if (!iso) return ''
  const t = formatFechaHoraMexico(iso)
  return t === '-' ? '' : t
}

/** `mailto:` para contestar desde el correo del equipo, con el asunto del mensaje. */
export function ligaResponder(m: Pick<MensajeContacto, 'email' | 'asunto'>): string {
  const asunto = `Re: ${m.asunto ?? 'Tu mensaje a Arca Tierra'}`
  // El correo va codificado (un «?» o «&» no rompe la liga) salvo la arroba.
  return `mailto:${encodeURIComponent(m.email).replace(/%40/g, '@')}?subject=${encodeURIComponent(asunto)}`
}

export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`
}
