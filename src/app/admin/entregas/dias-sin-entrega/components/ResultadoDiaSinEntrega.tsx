'use client'

import { CheckCircle2, X } from 'lucide-react'
import { textoResultadoDia, type ResultadoDiaNoHabil } from '@/types/datos-cliente'
import { diaDeLaSemana, etiquetaEstadoPedido, fechaLarga } from './dias-sin-entrega'

/**
 * R6 · M10-a — Lo que pasó al guardar: canastas corridas/regresadas (`textoResultadoDia`) y los pedidos de la tienda
 * con entrega ese día, que NO se movieron: el equipo les avisa a los clientes.
 */
export default function ResultadoDiaSinEntrega({
  resultado,
  onCerrar,
}: {
  resultado: ResultadoDiaNoHabil
  onCerrar: () => void
}) {
  const { dia, pedidos_ese_dia: pedidos } = resultado
  return (
    <section
      role="status"
      data-testid="dsn-resultado"
      data-fecha={dia.fecha}
      className="bg-verde/10 border border-verde/30 rounded-lg p-4 text-sm text-verde space-y-3"
    >
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">
            {diaDeLaSemana(dia)} {fechaLarga(dia.fecha)}:{' '}
            {dia.activo ? 'sin entrega' : 'sí se entrega'} ({dia.motivo})
          </p>
          <p data-testid="dsn-resultado-texto" className="mt-1">
            {textoResultadoDia(resultado)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="p-1 rounded hover:bg-verde/10 shrink-0"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {pedidos.length > 0 && (
        <div className="bg-white border border-amarillo/40 rounded-lg overflow-hidden">
          <p className="px-3 py-2 bg-amarillo-bg text-verde text-xs font-medium">
            Pedidos de la tienda con entrega ese día (no se movieron: avísales a los clientes)
          </p>
          <ul data-testid="dsn-pedidos" className="divide-y divide-neutro-borde">
            {pedidos.map((p) => (
              <li
                key={p.id}
                data-testid={`dsn-pedido-${p.id}`}
                className="px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1"
              >
                <span data-testid="dsn-pedido-numero" className="font-medium tabular-nums">
                  {p.numero_pedido || '—'}
                </span>
                <span data-testid="dsn-pedido-cliente" className="flex-1 min-w-0 break-words">
                  {p.cliente?.trim() || 'Cliente sin nombre'}
                </span>
                <span
                  data-testid="dsn-pedido-estado"
                  className="inline-block rounded-full text-xs px-2 py-0.5 bg-neutro-light text-verde"
                >
                  {etiquetaEstadoPedido(p.estado)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
