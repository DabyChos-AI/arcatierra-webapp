// Fase 4b (sesión 40, contrato EXP-FASE4B F1/F2): el renglón del desglose del precio privado y sus
// textos. Lo usan el asistente (ModalNuevaReserva) y el detalle (ModalDetalleReserva). Sin estado ni
// fetch: la cuenta es de `calcularCotizacion` (types/reservas.ts) o de `reserva.cotizacion`.
import { formatMXN } from '@/types/reservas'

/** «1 adulto adicional × $X» / «N adultos adicionales × $X» */
export function textoAdultosAdicionales(n: number, precio: number): string {
  return `${n} ${n === 1 ? 'adulto adicional' : 'adultos adicionales'} × ${formatMXN(precio)}`
}

/** «1 niño adicional × $Y» / «K niños adicionales × $Y» (NI1: el precio de niño del lugar adicional) */
export function textoNinosAdicionales(n: number, precio: number): string {
  return `${n} ${n === 1 ? 'niño adicional' : 'niños adicionales'} × ${formatMXN(precio)}`
}

/**
 * Un renglón del desglose: etiqueta a la izquierda y monto a la derecha. El contenedor lleva
 * `data-testid={testid}` y el monto `data-testid={`${testid}-monto`}` (qa lee el monto sin parsear).
 * `negativo` pinta «−$W» (descuentos y cupón).
 */
export default function LineaCotizacion({
  testid,
  etiqueta,
  monto,
  negativo = false,
  fuerte = false,
}: {
  testid: string
  etiqueta: string
  monto: number
  negativo?: boolean
  fuerte?: boolean
}) {
  return (
    <div data-testid={testid} className="flex justify-between gap-3 text-sm">
      <span className={`min-w-0 text-verde ${fuerte ? 'font-medium' : ''}`}>{etiqueta}</span>{' '}
      <span
        data-testid={`${testid}-monto`}
        className={`shrink-0 tabular-nums text-verde ${fuerte ? 'font-medium' : ''}`}
      >
        {negativo ? `−${formatMXN(monto)}` : formatMXN(monto)}
      </span>
    </div>
  )
}
