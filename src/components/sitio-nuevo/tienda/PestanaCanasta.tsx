'use client'

// R15 · F2 (WF3, sesión 55): «Canasta lista» (la pestaña «Cada semana» de la maqueta). Las 4 canastas fijas de la base
// (C8) con su precio de `GET /api/subscriptions/planes`; «Elegir» abre el alta (AltaSuscripcion) en el paso 1 con esa
// canasta marcada. La tarjeta «Arma la tuya» de la maqueta no va (C8). El «¿Cómo funciona?» dice solo lo que es verdad hoy
// (textos de /suscripciones y el horario de C7), no el «cosecha sábado, llega lunes… 10am y 6pm» de la maqueta.
import Falta from '../Falta'
import { precioVisible } from '../formato'
import { HORARIO_ENTREGA, type PlanCanasta } from './tipos'

const FONDOS = ['bg-sn-azul', 'bg-sn-oro', 'bg-sn-durazno', 'bg-sn-arena'] as const

export default function PestanaCanasta({ planes, onElegir }: { planes: PlanCanasta[]; onElegir: (planId: string | null) => void }) {
  return (
    <div data-testid="sn-tienda-canasta">
      <h2 className="font-sn-titulos text-[36px] leading-none tracking-[-1px] min-[861px]:text-[48px]">Tu canasta, cada semana.</h2>
      <p className="mt-3 max-w-[600px] text-sm leading-[1.6] text-sn-tinta/80">
        Elige el tamaño y la frecuencia (semanal o quincenal). Sin contratos: puedes cancelar en cualquier momento.
      </p>

      {planes.length === 0 ? (
        <p data-testid="sn-tienda-canasta-vacio" role="status" className="mt-8 text-sm text-sn-tinta/80">
          No pudimos leer las canastas en este momento. Recarga la página en un minuto.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-4">
          {planes.map((p, i) => (
            <article
              key={p.id}
              data-testid="sn-tienda-canasta-plan"
              data-plan={p.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-sn-tarjeta border border-sn-borde bg-white"
            >
              <div className={`flex aspect-video items-center p-[18px] ${FONDOS[i % FONDOS.length]}`}>
                <Falta como="bloque" que={`foto de la ${p.nombre}`} quien="Diseñadora" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra">
                  0{i + 1} · Canasta
                </p>
                <h3 className="font-sn-titulos text-[28px] leading-[1.05] tracking-[-0.5px] text-sn-tinta">{p.nombre}</h3>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-sn-borde pt-4">
                  <p data-testid="sn-tienda-canasta-precio" className="font-sn-titulos text-2xl leading-none">
                    {precioVisible(p.precio)} <span className="font-sn-texto text-xs text-sn-tinta/70">por entrega</span>
                  </p>
                  <button
                    type="button"
                    data-testid="sn-tienda-canasta-elegir"
                    onClick={() => onElegir(p.id)}
                    aria-label={`Elegir ${p.nombre}`}
                    className="shrink-0 rounded-sn-boton bg-sn-terra px-4 py-2 font-sn-mono text-[11px] font-medium uppercase tracking-[1.2px] text-sn-calido transition-colors hover:bg-sn-tinta"
                  >
                    Elegir →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Falta que="qué trae cada canasta, personas y kilos" quien="Lucio y Pablo" />
      </div>

      <div className="mt-sn-6 grid grid-cols-1 gap-6 rounded-sn-tarjeta bg-sn-crema/60 p-6 min-[861px]:grid-cols-3 min-[861px]:p-10">
        <div>
          <p className="font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra">¿Cómo funciona?</p>
          <h3 className="mt-2 font-sn-titulos text-2xl leading-tight">Eliges una vez.</h3>
          <p className="mt-2 text-sm leading-[1.6] text-sn-tinta/80">
            Te suscribes al tamaño de canasta y a la frecuencia. El primer cargo es al confirmar la suscripción.
          </p>
        </div>
        <div>
          <h3 className="font-sn-titulos text-2xl leading-tight min-[861px]:mt-6">Cancelas cuando quieras.</h3>
          <p className="mt-2 text-sm leading-[1.6] text-sn-tinta/80">Sin contratos: puedes cancelar en cualquier momento.</p>
        </div>
        <div>
          <h3 className="font-sn-titulos text-2xl leading-tight min-[861px]:mt-6">Llega a tu puerta.</h3>
          <p className="mt-2 text-sm leading-[1.6] text-sn-tinta/80">
            Entregamos {HORARIO_ENTREGA}, los días de tu zona. Revisa tu código postal en «¿Llegamos a tu colonia?».
          </p>
        </div>
      </div>
    </div>
  )
}
