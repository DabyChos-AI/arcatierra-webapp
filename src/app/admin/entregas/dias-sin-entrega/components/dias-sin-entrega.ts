/**
 * R6 · M10 — Días sin entrega (sesión 46, 2-oct-2026): lectura defensiva de las respuestas y formatos de la pantalla.
 * Los tipos y textos son del líder (`src/types/datos-cliente.ts`); aquí solo se normaliza lo que llega del backend
 * (`routers/dias_no_habiles.py`) para que una llave faltante no tumbe la página.
 */
import { formatFechaHoraMexico, formatFechaMexico } from '@/lib/dates'
import { ESTADO_PAGADO_SIN_STOCK, ETIQUETA_PAGADO_SIN_STOCK } from '@/types/tienda'
import type {
  DiaNoHabilAdmin,
  ListaDiasNoHabilesAdmin,
  OrigenDiaNoHabil,
  PedidoEnDiaSinEntrega,
  ResultadoDiaNoHabil,
} from '@/types/datos-cliente'

/** Igual que `MAX_MOTIVO` del backend (columna varchar(120)). */
export const MAX_MOTIVO = 120

export const ETIQUETA_ORIGEN: Record<OrigenDiaNoHabil, string> = {
  lft: 'Ley (LFT)',
  panel: 'Panel',
}

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

type Objeto = Record<string, unknown>

function esObjeto(v: unknown): v is Objeto {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function texto(v: unknown): string | null {
  return typeof v === 'string' ? v : null
}

function normalizarDia(v: unknown): DiaNoHabilAdmin | null {
  if (!esObjeto(v)) return null
  const fecha = texto(v.fecha)
  if (!fecha || !SOLO_FECHA.test(fecha)) return null
  return {
    fecha,
    motivo: texto(v.motivo) ?? '',
    origen: v.origen === 'lft' ? 'lft' : 'panel',
    activo: v.activo !== false,
    dia_semana: texto(v.dia_semana) ?? '',
    actualizado_por: texto(v.actualizado_por),
    actualizado_en: texto(v.actualizado_en),
  }
}

/** `GET /api/admin/dias-no-habiles` → lista ordenada por fecha; null si la forma no es la del contrato. */
export function normalizarLista(data: unknown): ListaDiasNoHabilesAdmin | null {
  if (!esObjeto(data) || !Array.isArray(data.dias)) return null
  const dias = data.dias.map(normalizarDia).filter((d): d is DiaNoHabilAdmin => d !== null)
  return { dias: ordenarPorFecha(dias), puede_editar: data.puede_editar === true }
}

function normalizarPedido(v: unknown): PedidoEnDiaSinEntrega | null {
  if (!esObjeto(v)) return null
  const id = texto(v.id)
  if (!id) return null
  return {
    id,
    numero_pedido: texto(v.numero_pedido) ?? '',
    estado: texto(v.estado) ?? '',
    tipo_entrega: texto(v.tipo_entrega) ?? '',
    cliente: texto(v.cliente),
  }
}

/** Respuesta de POST (201) y PATCH (200); null si no trae el día guardado. */
export function normalizarResultado(data: unknown): ResultadoDiaNoHabil | null {
  if (!esObjeto(data)) return null
  const dia = normalizarDia(data.dia)
  if (!dia) return null
  const entero = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
  return {
    dia,
    entregas_corridas: entero(data.entregas_corridas),
    entregas_regresadas: entero(data.entregas_regresadas),
    pedidos_ese_dia: Array.isArray(data.pedidos_ese_dia)
      ? data.pedidos_ese_dia.map(normalizarPedido).filter((p): p is PedidoEnDiaSinEntrega => p !== null)
      : [],
  }
}

export function ordenarPorFecha(dias: DiaNoHabilAdmin[]): DiaNoHabilAdmin[] {
  return [...dias].sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/** Pone (o reemplaza) el día guardado en la lista, en su lugar por fecha. */
export function conDiaGuardado(dias: DiaNoHabilAdmin[], dia: DiaNoHabilAdmin): DiaNoHabilAdmin[] {
  return ordenarPorFecha([...dias.filter((d) => d.fecha !== dia.fecha), dia])
}

/** «16 de noviembre de 2026» (una fecha sin hora: no se corre de día). */
export function fechaLarga(fecha: string): string {
  return formatFechaMexico(fecha, { day: 'numeric', month: 'long', year: 'numeric' })
}

/** «Lunes»: el que manda el backend; si no viniera, el de la fecha. */
export function diaDeLaSemana(dia: Pick<DiaNoHabilAdmin, 'fecha' | 'dia_semana'>): string {
  const nombre =
    dia.dia_semana.trim() ||
    formatFechaMexico(dia.fecha, { weekday: 'long', day: undefined, month: undefined, year: undefined })
  return nombre.charAt(0).toUpperCase() + nombre.slice(1)
}

/** Quién y cuándo lo cambió por última vez (nunca un correo: el backend manda el nombre). */
export function textoUltimoCambio(dia: DiaNoHabilAdmin): string {
  const quien = dia.actualizado_por?.trim() || 'Sistema'
  return dia.actualizado_en ? `${quien} · ${formatFechaHoraMexico(dia.actualizado_en)}` : quien
}

/** 0 = domingo … 6 = sábado, sin depender de la zona del navegador. */
function diaSemanaNumero(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()
}

/** Aviso (no bloquea) para una fecha de fin de semana: esos días ya no se entrega. */
export function avisoFinDeSemana(fecha: string): string | null {
  if (!SOLO_FECHA.test(fecha)) return null
  const n = diaSemanaNumero(fecha)
  if (n !== 0 && n !== 6) return null
  return `Es ${n === 6 ? 'sábado' : 'domingo'}: esos días ya no hay entregas. Puedes guardarlo de todos modos.`
}

const ESTADO_PEDIDO: Record<string, string> = {
  esperando_pago: 'Esperando pago',
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  [ESTADO_PAGADO_SIN_STOCK]: ETIQUETA_PAGADO_SIN_STOCK,
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  empacado: 'Empacado',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
}

export function etiquetaEstadoPedido(estado: string): string {
  if (ESTADO_PEDIDO[estado]) return ESTADO_PEDIDO[estado]
  const t = estado.replace(/_/g, ' ').trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '—'
}
