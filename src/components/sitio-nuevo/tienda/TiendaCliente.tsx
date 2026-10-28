'use client'

// R15 · F2 (WF3, sesión 55): la parte con estado de la tienda nueva: «¿Llegamos a tu colonia?», las pestañas pegajosas
// (`.tabs-bar` de la maqueta) y el alta de suscripción.
// - La pestaña sale de `?pestana=suelto|canasta|extras` (contrato con la portada; cualquier otro valor = suelto). Se lee con
//   useSearchParams (la página la envuelve en <Suspense>): el servidor y el navegador ven la misma consulta, así que el primer
//   render es igual en los dos (sin error de hidratación). Al cambiar de pestaña se reescribe la consulta con
//   history.replaceState (sin recargar ni brincar).
// - Las pestañas van debajo de la cabecera nueva (sticky top-14 / top-16 a 1100 px) y por debajo de su capa (940).
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ProductoMuestra } from '@/lib/sitio-nuevo-contenido'
import AltaSuscripcion from './AltaSuscripcion'
import Colonia from './Colonia'
import PestanaCanasta from './PestanaCanasta'
import PestanaExtras from './PestanaExtras'
import PestanaSuelto from './PestanaSuelto'
import { ID_PESTANAS, PESTANAS, pestanaDeParametro, type CategoriaTienda, type IdPestana, type PlanCanasta, type ZonaTienda } from './tipos'

type Props = {
  /** null = la API no respondió al armar la página. */
  productos: ProductoMuestra[] | null
  categorias: CategoriaTienda[]
  planes: PlanCanasta[] | null
}

export default function TiendaCliente({ productos, categorias, planes }: Props) {
  const params = useSearchParams()
  const desdeUrl = pestanaDeParametro(params.get('pestana'))
  const [pestana, setPestana] = useState<IdPestana>(desdeUrl)
  const [zona, setZona] = useState<ZonaTienda | null>(null)
  const [alta, setAlta] = useState<{ planInicial: string | null } | null>(null)

  // Un enlace a otra pestaña desde esta misma página (cabecera, hero) cambia la consulta sin volver a montar.
  useEffect(() => {
    setPestana(desdeUrl)
  }, [desdeUrl])

  const elegir = useCallback((p: IdPestana, desplazar = false) => {
    setPestana(p)
    const url = new URL(window.location.href)
    url.searchParams.set('pestana', p)
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    if (desplazar) document.getElementById(ID_PESTANAS)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const alTeclear = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const siguiente = PESTANAS[(i + (e.key === 'ArrowRight' ? 1 : PESTANAS.length - 1)) % PESTANAS.length].id
    elegir(siguiente)
    document.getElementById(`sn-tienda-pestana-${siguiente}`)?.focus()
  }

  const conteo: Record<IdPestana, number | null> = {
    suelto: productos ? productos.length : null,
    canasta: planes ? planes.length : null,
    extras: null,
  }

  const cerrarAlta = useCallback(() => setAlta(null), [])

  return (
    <>
      <Colonia onZona={setZona} />

      <div
        id={ID_PESTANAS}
        className="sticky top-14 z-[920] scroll-mt-14 border-b border-sn-borde bg-sn-calido min-[1100px]:top-16 min-[1100px]:scroll-mt-16"
      >
        <div
          role="tablist"
          aria-label="Formas de comprar"
          className="mx-auto flex w-full max-w-[1280px] overflow-x-auto px-3 min-[861px]:px-8"
        >
          {PESTANAS.map((p, i) => {
            const activa = p.id === pestana
            return (
              <button
                key={p.id}
                id={`sn-tienda-pestana-${p.id}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`sn-tienda-panel-${p.id}`}
                tabIndex={activa ? 0 : -1}
                data-testid={`sn-tienda-pestana-${p.id}`}
                onClick={() => elegir(p.id)}
                onKeyDown={(e) => alTeclear(e, i)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 font-sn-mono text-[11px] font-medium uppercase tracking-[1.3px] transition-colors min-[480px]:px-5 ${
                  activa ? 'border-sn-terra text-sn-terra' : 'border-transparent text-sn-tinta/75 hover:text-sn-terra'
                }`}
              >
                {p.nombre}
                {conteo[p.id] !== null && (
                  <span
                    className={`rounded-sn-pildora px-1.5 py-px text-[10px] ${activa ? 'bg-sn-terra text-sn-calido' : 'bg-sn-crema text-sn-tinta'}`}
                  >
                    {conteo[p.id]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-6 py-sn-8 min-[861px]:px-10 min-[861px]:py-sn-10">
        {PESTANAS.map((p) => (
          <div
            key={p.id}
            id={`sn-tienda-panel-${p.id}`}
            role="tabpanel"
            aria-labelledby={`sn-tienda-pestana-${p.id}`}
            hidden={p.id !== pestana}
            data-testid={`sn-tienda-panel-${p.id}`}
          >
            {p.id === pestana && p.id === 'suelto' &&
              (productos ? (
                <PestanaSuelto productos={productos} categorias={categorias} />
              ) : (
                <SinApi que="los productos" />
              ))}
            {p.id === pestana && p.id === 'canasta' &&
              (planes ? (
                <PestanaCanasta planes={planes} onElegir={(planInicial) => setAlta({ planInicial })} />
              ) : (
                <SinApi que="las canastas" />
              ))}
            {p.id === pestana && p.id === 'extras' && <PestanaExtras onIr={(destino) => elegir(destino, true)} />}
          </div>
        ))}
      </div>

      {alta && planes && planes.length > 0 && (
        <AltaSuscripcion planes={planes} planInicial={alta.planInicial} zonaInicial={zona} onCerrar={cerrarAlta} />
      )}
    </>
  )
}

function SinApi({ que }: { que: string }) {
  return (
    <p data-testid="sn-tienda-sin-api" role="status" className="rounded-sn-boton border border-sn-borde bg-white px-4 py-3 text-sm">
      No se pudieron leer {que} de la API en este momento. Recarga la página en un minuto.
    </p>
  )
}
