'use client'

/**
 * R5 · Reembolsos en Pedidos (sesión 45, 2-oct-2026): pagos del detalle con el botón «Reembolsar», avisos de dinero
 * (pago doble, contracargo, reembolso parcial), el resultado del reembolso y el chip de alerta de la lista.
 * Tipos y textos del líder en `@/types/reembolsos` (no se copian aquí). Esta página usa el proxy relativo
 * `/api/admin/...` con la cookie de NextAuth (no `API_URL` con Bearer).
 */

import { AlertTriangle, CheckCircle2, RotateCcw, X } from 'lucide-react'
import {
  ETIQUETA_ESTADO_REEMBOLSO,
  puedeReembolsarPago,
  type AlertaPedido,
  type AvisosPagoPedido,
  type CodigoReembolso,
  type ReembolsoPago,
  type ResultadoReembolso,
} from '@/types/reembolsos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'

/** Un pago del detalle (`GET /api/admin/pedidos/{id}` → `pagos[]`). Lo nuevo de R5 es opcional: una API vieja no lo manda. */
export interface PagoPedido {
  id: string
  mp_payment_id: string | null
  mp_status: string | null
  mp_status_detail?: string | null
  mp_payment_method: string | null
  monto_total: number
  fecha_pago: string | null
  reembolso?: ReembolsoPago | null
}

/** Lo que la pantalla muestra tras pulsar «Reembolsar» (de un `ResultadoReembolso` o de un error sin esa forma). */
export interface ResultadoReembolsoVista {
  pedidoId: string
  numero: string
  /** El `codigo` del backend; `http_<status>` si la respuesta no trae la forma de ResultadoReembolso; `red` sin respuesta. */
  codigo: CodigoReembolso | `http_${number}` | 'red'
  ok: boolean
  texto: string
}

const MOTIVO_REEMBOLSO_PEDIDOS = 'Reembolso desde Pedidos'

/** ¿La respuesta trae la forma de `ResultadoReembolso`? (200, 409 y 502 la traen; un 403/400/404 trae `detail`). */
function esResultadoReembolso(data: unknown): data is ResultadoReembolso {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return typeof d.codigo === 'string' && typeof d.message === 'string' && typeof d.ok === 'boolean'
}

/**
 * `POST /api/admin/reembolsos` (proxy relativo). Nunca lanza: devuelve lo que se muestra.
 * El `message` del backend va tal cual; si no viene esa forma, el `detail` con `extraerMensajeError`.
 */
export async function pedirReembolso(pagoId: string): Promise<Omit<ResultadoReembolsoVista, 'pedidoId' | 'numero'>> {
  let res: Response
  try {
    res = await fetch('/api/admin/reembolsos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago_id: pagoId, motivo: MOTIVO_REEMBOLSO_PEDIDOS, confirmar: true }),
    })
  } catch {
    return {
      codigo: 'red',
      ok: false,
      texto:
        'No hubo respuesta del servidor: no sabemos si el reembolso salió. Revisa el estado del pago antes de volver a ' +
        'intentarlo (un segundo intento no devuelve dos veces).',
    }
  }
  const data: unknown = await res.json().catch(() => null)
  if (esResultadoReembolso(data)) {
    return { codigo: data.codigo, ok: data.ok, texto: data.message }
  }
  return { codigo: `http_${res.status}`, ok: false, texto: extraerMensajeError(data, res.status) }
}

// ─── Resultado del reembolso ──────────────────────────────────────────────────────────────────────────────────────────

/** Aviso del resultado: verde si salió, ámbar si ya estaba hecho o en curso, rojo si no salió. */
export function ResultadoReembolsoAviso({
  resultado,
  onCerrar,
}: {
  resultado: ResultadoReembolsoVista
  onCerrar: () => void
}) {
  const informativo = resultado.codigo === 'ya_reembolsado' || resultado.codigo === 'en_proceso'
  const estilo = resultado.ok
    ? 'bg-green-50 border-green-200 text-green-900'
    : informativo
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-red-50 border-red-200 text-red-900'
  const Icono = resultado.ok ? CheckCircle2 : AlertTriangle
  return (
    <div
      data-testid="pedido-reembolso-resultado"
      data-codigo={resultado.codigo}
      data-ok={resultado.ok ? 'si' : 'no'}
      role={resultado.ok ? 'status' : 'alert'}
      className={`border rounded-lg p-3 flex items-start gap-2 text-sm ${estilo}`}
    >
      <Icono className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 min-w-0">
        <span className="font-semibold">Pedido {resultado.numero}: </span>
        {resultado.texto}
      </p>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar resultado del reembolso"
        className="p-1 rounded hover:bg-black/5 shrink-0"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

// ─── Avisos de dinero del detalle (DR15 / DR16) ───────────────────────────────────────────────────────────────────────

type BanderaAviso = 'pago_doble' | 'contracargo' | 'reembolso_parcial'

const BANDERAS_AVISO: { clave: BanderaAviso; testid: string; patron: RegExp; respaldo: (a: AvisosPagoPedido) => string }[] = [
  {
    clave: 'pago_doble',
    testid: 'pedido-aviso-pago-doble',
    patron: /pagos aprobados|más de una vez/i,
    respaldo: (a) => `Pago doble: ${Number(a.pagos_aprobados) || 2} pagos aprobados en este pedido.`,
  },
  {
    clave: 'contracargo',
    testid: 'pedido-aviso-contracargo',
    patron: /contracargo|disputa/i,
    respaldo: () => 'Contracargo o disputa en MercadoPago.',
  },
  {
    clave: 'reembolso_parcial',
    testid: 'pedido-aviso-reembolso-parcial',
    patron: /parcial|parte de un pago/i,
    respaldo: () => 'Reembolso parcial en MercadoPago.',
  },
]

/**
 * Un renglón por bandera en true, con la frase del backend (`textos`). Primero por palabra clave (no depende del orden),
 * luego por orden (pago doble → contracargo → parcial) y, si no hay frase, una etiqueta corta. Una frase que no es de
 * ninguna bandera se muestra aparte (`pedido-aviso-pago-otro`).
 */
function renglonesDeAvisos(avisos: AvisosPagoPedido): { testid: string; texto: string; clave: string }[] {
  const textos = Array.isArray(avisos.textos)
    ? avisos.textos.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : []
  const usados = new Set<number>()
  const activas = BANDERAS_AVISO.filter((b) => avisos[b.clave] === true)
  const elegido = new Map<BanderaAviso, number>()
  for (const b of activas) {
    const i = textos.findIndex((t, j) => !usados.has(j) && b.patron.test(t))
    if (i >= 0) {
      usados.add(i)
      elegido.set(b.clave, i)
    }
  }
  for (const b of activas) {
    if (elegido.has(b.clave)) continue
    const i = textos.findIndex((_, j) => !usados.has(j))
    if (i >= 0) {
      usados.add(i)
      elegido.set(b.clave, i)
    }
  }
  const renglones: { testid: string; texto: string; clave: string }[] = activas.map((b) => {
    const i = elegido.get(b.clave)
    return { testid: b.testid, clave: b.clave, texto: i !== undefined ? textos[i] : b.respaldo(avisos) }
  })
  textos.forEach((t, j) => {
    if (!usados.has(j)) renglones.push({ testid: 'pedido-aviso-pago-otro', clave: 'otro', texto: t })
  })
  return renglones
}

export function AvisosPagoDetalle({ avisos }: { avisos: AvisosPagoPedido | null | undefined }) {
  if (!avisos || typeof avisos !== 'object') return null
  const renglones = renglonesDeAvisos(avisos)
  if (renglones.length === 0) return null
  return (
    <div
      data-testid="pedido-avisos-pago"
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2"
    >
      {renglones.map((r, i) => (
        <p
          key={`${r.clave}-${i}`}
          data-testid={r.testid}
          className="flex items-start gap-2 text-sm text-red-900"
        >
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{r.texto}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Pagos del detalle con «Reembolsar» ───────────────────────────────────────────────────────────────────────────────

const ESTILO_MP_STATUS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
  refunded: 'bg-purple-100 text-purple-700',
  charged_back: 'bg-red-100 text-red-700',
  in_mediation: 'bg-orange-100 text-orange-700',
}

const ESTILO_REEMBOLSO: Record<ReembolsoPago['estado'], string> = {
  solicitado: 'text-amber-800',
  aprobado: 'text-purple-800',
  rechazado: 'text-red-800',
  error: 'text-red-800',
}

export function PagosPedido({
  pagos,
  puedeReembolsar,
  reembolsando,
  onReembolsar,
  formatMoney,
}: {
  pagos: PagoPedido[]
  /** `detalle.puede_reembolsar`: false = sin el permiso `reembolsos` (no se pinta el botón); undefined = API vieja. */
  puedeReembolsar: boolean | undefined
  /** id del pago que se está reembolsando (todos los botones quedan deshabilitados mientras tanto). */
  reembolsando: string | null
  onReembolsar: (pago: PagoPedido) => void
  formatMoney: (n: number) => string
}) {
  return (
    <div className="space-y-2">
      {pagos.map((pago) => {
        const reembolso = pago.reembolso ?? null
        const conBoton = puedeReembolsar !== false && puedeReembolsarPago(pago)
        const reintento = !!reembolso && (reembolso.estado === 'error' || reembolso.estado === 'rechazado')
        const enCurso = reembolsando === pago.id
        const estado = pago.mp_status || '-'
        return (
          <div
            key={pago.id}
            data-testid={`pedido-pago-${pago.id}`}
            data-mp-status={pago.mp_status ?? ''}
            className="border border-gray-200 rounded-lg p-3 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs text-gray-500">ID MP:</span>
                <span className="ml-1 font-mono text-xs break-all">{pago.mp_payment_id || '-'}</span>
                <span className="ml-3 text-xs text-gray-500">{pago.mp_payment_method || ''}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {pago.mp_status_detail === 'partially_refunded' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    Devuelto en parte
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    ESTILO_MP_STATUS[estado] || 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {estado}
                </span>
                <span className="font-semibold">{formatMoney(Number(pago.monto_total) || 0)}</span>
              </div>
            </div>

            {reembolso && (
              <p
                data-testid={`pedido-pago-reembolso-${pago.id}`}
                data-estado={reembolso.estado}
                className={`text-xs ${ESTILO_REEMBOLSO[reembolso.estado] || 'text-gray-700'}`}
              >
                <span className="font-semibold">{ETIQUETA_ESTADO_REEMBOLSO[reembolso.estado] || reembolso.estado}</span>
                {reembolso.solicitado_por_nombre ? ` · pidió ${reembolso.solicitado_por_nombre}` : ''}
                {reembolso.error ? ` · ${reembolso.error}` : ''}
              </p>
            )}

            {conBoton && (
              <button
                type="button"
                data-testid={`pedido-reembolsar-${pago.id}`}
                data-accion={reintento ? 'reintentar' : 'reembolsar'}
                onClick={() => onReembolsar(pago)}
                disabled={reembolsando !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`h-4 w-4 ${enCurso ? 'animate-spin' : ''}`} aria-hidden="true" />
                {enCurso ? 'Reembolsando…' : reintento ? 'Reintentar reembolso' : 'Reembolsar'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Chip de alerta en la lista ───────────────────────────────────────────────────────────────────────────────────────

const ETIQUETA_ALERTA: Record<Exclude<AlertaPedido, null>, string> = {
  pago_doble: 'Pago doble',
  contracargo: 'Contracargo',
}

export function AlertaPedidoChip({ pedidoId, alerta }: { pedidoId: string; alerta: AlertaPedido | undefined }) {
  if (alerta !== 'pago_doble' && alerta !== 'contracargo') return null
  return (
    <span
      data-testid={`pedido-alerta-${pedidoId}`}
      data-alerta={alerta}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700"
    >
      <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {ETIQUETA_ALERTA[alerta]}
    </span>
  )
}
