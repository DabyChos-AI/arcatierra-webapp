'use client'

// R15 v2 · F3 (tienda): la barra de pestañas de la maqueta (`.tabs-bar`, medida: fondo warm, pegada debajo de la cabecera, filete abajo;
// pestaña DM Mono 11 en mayúsculas, la activa con fondo terra al 8 % y raya de 2 px; contador en píldora terra). El contrato
// base la dejó para la fase que la use (CONTRATO-BASE-F1 §4). Pestañas de WAI-ARIA: flechas, Inicio y Fin; solo se monta el panel activo.
import { useRef } from 'react'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import type { IdPestana } from './pestanas'

interface Props {
  pestanas: readonly { id: IdPestana; texto: string }[]
  /** null mientras el navegador no ha leído la dirección (ninguna marcada). */
  activa: IdPestana | null
  conteos: Partial<Record<IdPestana, number>>
  alElegir: (id: IdPestana) => void
}

export default function BarraPestanas({ pestanas, activa, conteos, alElegir }: Props) {
  const botones = useRef<(HTMLButtonElement | null)[]>([])

  const mover = (desde: number, paso: number | 'inicio' | 'fin') => {
    const n = pestanas.length
    const destino = paso === 'inicio' ? 0 : paso === 'fin' ? n - 1 : (desde + paso + n) % n
    alElegir(pestanas[destino].id)
    botones.current[destino]?.focus()
  }

  return (
    <div className="border-b border-solid border-sn-border bg-sn-warm px-sn-lateral-movil min-[861px]:px-[60px]">
      <div
        role="tablist"
        aria-label="Tienda"
        data-testid="sn-tienda-pestanas"
        className="mx-auto flex max-w-sn-contenido flex-wrap gap-1"
      >
        {pestanas.map((p, i) => {
          const elegida = activa === p.id
          const cuenta = conteos[p.id]
          return (
            <button
              key={p.id}
              ref={(el) => {
                botones.current[i] = el
              }}
              type="button"
              role="tab"
              id={`sn-tienda-pestana-${p.id}`}
              aria-selected={elegida}
              aria-controls="sn-tienda-panel"
              tabIndex={elegida || (activa === null && i === 0) ? 0 : -1}
              data-testid="sn-tienda-pestanas-boton"
              data-pestana={p.id}
              onClick={() => alElegir(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') mover(i, 1)
                else if (e.key === 'ArrowLeft') mover(i, -1)
                else if (e.key === 'Home') mover(i, 'inicio')
                else if (e.key === 'End') mover(i, 'fin')
                else return
                e.preventDefault()
              }}
              className={unirClases(
                'relative inline-flex items-center gap-2 border-0 border-b-2 border-solid px-6 pb-4 pt-[18px] font-sn-mono text-sn-eyebrow font-medium uppercase tracking-[1.4px]',
                // La maqueta pinta la activa con texto terra; sobre terra al 8 % da 4.32:1 (< 4.5:1 a 11 px), así que el texto va en ink
                // (10.35:1) y la activa se marca con la raya terra de 2 px y el fondo terra al 8 % (s61, medido con la fórmula de WCAG).
                elegida ? 'border-sn-terra bg-sn-terra/[0.08] text-sn-ink' : 'border-transparent bg-transparent text-sn-ink hover:text-sn-terra',
                FOCO,
              )}
            >
              <span>{p.texto}</span>
              {cuenta !== undefined && (
                <span
                  data-testid="sn-tienda-pestanas-conteo"
                  data-pestana={p.id}
                  className="rounded-sn-pildora bg-sn-terra px-2 py-0.5 font-sn-mono text-sn-micro font-medium text-white"
                >
                  {cuenta}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
