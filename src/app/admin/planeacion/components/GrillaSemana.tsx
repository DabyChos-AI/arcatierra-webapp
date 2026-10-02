'use client'

// R4 · Grilla semanal (sesión 44). Un solo árbol para las dos vistas:
//   ≥ 1024 px (lg): 7 columnas lunes→domingo, cada una con su propio scroll horizontal de respaldo
//                   (a 1024-1279 las columnas no caben y se desplaza la grilla, nunca la página).
//   < 1024 px: lista por día (secciones apiladas) con tarjetas a todo lo ancho.
// Cada día es `planeacion-dia-{fecha}` en las dos vistas.

import { Plus } from 'lucide-react'
import { formatFechaMexico } from '@/lib/dates'
import type { DiaGrilla, ItemGrilla, SemanaGrilla } from '@/types/planeacion'
import type { CatalogosEventos } from '../../eventos/components/useCatalogosEventos'
import TarjetaGrilla from './TarjetaGrilla'

export function conHuecos(item: ItemGrilla): boolean {
  return item.tipo === 'privada' && item.huecos.length > 0
}

export default function GrillaSemana({
  dias,
  hoy,
  puedeEditar,
  soloHuecos,
  token,
  catalogos,
  recargar,
  onGuardado,
  onAgregarInterno,
}: {
  dias: DiaGrilla[]
  hoy: string
  puedeEditar: boolean
  soloHuecos: boolean
  token: string | undefined
  catalogos: CatalogosEventos
  recargar: () => Promise<SemanaGrilla | null>
  onGuardado: (texto: string) => void
  onAgregarInterno: (fecha: string) => void
}) {
  return (
    <div className="lg:overflow-x-auto">
      <div
        data-testid="planeacion-grilla"
        className="grid grid-cols-1 gap-4 lg:grid-cols-[repeat(7,minmax(8.5rem,1fr))] lg:gap-2"
      >
        {dias.map((dia) => {
          const esHoy = dia.fecha === hoy
          const items = soloHuecos ? dia.items.filter(conHuecos) : dia.items
          const tituloId = `planeacion-dia-titulo-${dia.fecha}`
          return (
            <section
              key={dia.fecha}
              data-testid={`planeacion-dia-${dia.fecha}`}
              data-cuantos={items.length}
              aria-labelledby={tituloId}
              className={`flex min-w-0 flex-col rounded-lg border ${
                esHoy ? 'border-terracota/40' : 'border-neutro-borde'
              } bg-neutro-light/50`}
            >
              <header
                className={`flex flex-wrap items-center justify-between gap-2 rounded-t-lg border-b px-3 py-2 lg:px-2 ${
                  esHoy ? 'border-terracota/30 bg-terracota/10' : 'border-neutro-borde bg-neutro-light'
                }`}
              >
                <h3
                  id={tituloId}
                  className={`m-0 font-sans text-xs font-bold uppercase leading-tight tracking-wide ${
                    esHoy ? 'text-terracota-dark' : 'text-verde'
                  }`}
                >
                  {dia.dia}
                  <span className="block font-normal normal-case text-verde-tipografia sm:inline lg:block">
                    <span className="hidden sm:inline lg:hidden"> · </span>
                    {formatFechaMexico(dia.fecha, { day: 'numeric', month: 'short', year: undefined })}
                    {esHoy && (
                      <span className="ml-1 rounded-full bg-terracota px-1.5 py-px text-[10px] font-semibold text-white">
                        Hoy
                      </span>
                    )}
                  </span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid={`planeacion-dia-cuantos-${dia.fecha}`}
                    className="rounded-full bg-white px-2 py-px text-[11px] font-semibold tabular-nums text-verde"
                    aria-label={`${items.length} ${items.length === 1 ? 'evento' : 'eventos'}`}
                  >
                    {items.length}
                  </span>
                  {puedeEditar && (
                    <button
                      type="button"
                      data-testid={`planeacion-agregar-interno-${dia.fecha}`}
                      onClick={() => onAgregarInterno(dia.fecha)}
                      aria-label={`Agregar evento interno el ${dia.dia.toLowerCase()} ${dia.fecha}`}
                      title="Agregar evento interno"
                      className="inline-flex items-center gap-0.5 rounded-md border border-neutro-borde bg-white px-1.5 py-0.5 text-[11px] font-semibold text-verde transition hover:border-terracota hover:text-terracota"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      Interno
                    </button>
                  )}
                </div>
              </header>
              <div className="flex flex-col gap-2 p-2">
                {items.length === 0 ? (
                  <p className="m-0 px-1 py-1 text-xs italic text-verde-suave">
                    {soloHuecos && dia.items.length > 0 ? 'Sin huecos' : 'Sin eventos'}
                  </p>
                ) : (
                  items.map((item) => (
                    <TarjetaGrilla
                      key={`${item.tipo}-${item.id}`}
                      item={item}
                      puedeEditar={puedeEditar}
                      token={token}
                      catalogos={catalogos}
                      recargar={recargar}
                      onGuardado={onGuardado}
                    />
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
