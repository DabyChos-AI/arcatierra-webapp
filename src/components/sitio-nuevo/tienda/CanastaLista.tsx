'use client'

// R15 v2 · F3 (tienda): la pestaña «Canasta lista» (`#tab-semana` de la maqueta: título serif grande, tarjetas con la destacada en terra y
// el recuadro «¿Cómo funciona?»). Las tarjetas son los grupos de /suscripciones de hoy (MAPA-CONTENIDO A §2.5): las 4 canastas regulares,
// las 3 básicas (la destacada, con la marca de C23) y los planes de prueba como hoy (C47); la 3.ª tarjeta de la maqueta («Arma la tuya»)
// es «Agrega extras a tu canasta» (DR-12, C12). Cada grupo abre el alta (DR-15). Textos: suscripciones/page.tsx:365-367, :616-621.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { calcularCostoEnvio } from '@/lib/envio'
import { precioLegible } from '@/lib/precio'
import { itemcodeCompraUnica } from '@/types/tienda'
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { FOCO, FOCO_SOBRE_OSCURO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import AltaSuscripcion, { type InfoPlan } from './AltaSuscripcion'
import { desdeDe, kilosDe, PLAN_RETORNABLE, porGrupo, TITULO_GRUPO, type Grupo, type PlanApi } from './canastas'
import { deApi, type ProductoApi } from './catalogo'
import { FOTO_RESPALDO } from './TarjetaProducto'
import type { Carga, DatosTienda } from './Tienda'

/** Lo que vino de GET /api/products/{itemcode} para lo que la lista no trajo: el producto, o 'oculto' (404: no se ofrece). */
type Extra = Record<string, ProductoApi | 'oculto'>

interface Props {
  planes: Carga<PlanApi[]>
  productos: Carga<DatosTienda>
  reintentar: () => void
  alExtras: () => void
}

export default function CanastaLista({ planes, productos, reintentar, alExtras }: Props) {
  const [extra, setExtra] = useState<Extra>({})
  const [abierto, setAbierto] = useState<Grupo | null>(null)

  const grupos = useMemo(() => (planes.fase === 'listo' ? porGrupo(planes.datos) : null), [planes])
  const retornable = useMemo(
    () => (planes.fase === 'listo' ? planes.datos.find((p) => p.id === PLAN_RETORNABLE) ?? null : null),
    [planes],
  )
  const enLista = productos.fase === 'listo' ? productos.datos.porItemcode : null

  // D-F3-24 T-15: la lista de hoy solo trae lo en venta; lo que falte (base o U) se pide uno por uno, una vez.
  useEffect(() => {
    if (!grupos || !enLista) return
    const faltan = new Set<string>()
    for (const plan of [...grupos.regulares, ...grupos.basicas, ...grupos.pruebas]) {
      if (!enLista.has(plan.itemcode)) faltan.add(plan.itemcode)
      if (grupos.pruebas.includes(plan)) continue
      const u = itemcodeCompraUnica(plan.itemcode)
      if (!enLista.has(u)) faltan.add(u)
    }
    const pedir = [...faltan].filter((c) => !(c in extra))
    if (pedir.length === 0) return
    let vigente = true
    Promise.all(
      pedir.map((codigo) =>
        fetch(`${API_URL}/api/products/${encodeURIComponent(codigo)}`)
          .then(async (r) => [codigo, r.ok ? ((await r.json()) as ProductoApi) : 'oculto'] as const)
          .catch(() => [codigo, 'oculto'] as const),
      ),
    ).then((pares) => {
      if (vigente) setExtra((previo) => ({ ...previo, ...Object.fromEntries(pares) }))
    })
    return () => {
      vigente = false
    }
  }, [grupos, enLista, extra])

  const producto = useCallback(
    (codigo: string): ProductoApi | null => {
      const de = enLista?.get(codigo) ?? extra[codigo]
      return de && de !== 'oculto' ? de : null
    },
    [enLista, extra],
  )

  const info = useCallback(
    (plan: PlanApi): InfoPlan => {
      const base = producto(plan.itemcode)
      const esPrueba = grupos?.pruebas.includes(plan) ?? false
      const crudaU = esPrueba ? null : producto(itemcodeCompraUnica(plan.itemcode))
      const u = crudaU ? deApi(crudaU) : null
      return {
        nombreBase: base?.nombre ?? null,
        descripcion: base?.descripcion ?? '',
        // En una canasta se compra SIEMPRE la U, con su nombre, precio y piezas (productoParaComprar, tienda/page.tsx:890-902).
        compraUnica: u ? (u.enVenta ? u : 'agotada') : null,
      }
    },
    [producto, grupos],
  )

  if (planes.fase === 'cargando') {
    return (
      <p data-testid="sn-tienda-lista-cargando" aria-busy="true" className="m-0 py-sn-seccion text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
        Cargando suscripciones...
      </p>
    )
  }
  if (planes.fase === 'error' || !grupos) {
    return (
      <div data-testid="sn-tienda-lista-error" role="alert" className="flex flex-col items-center gap-4 py-sn-seccion text-center">
        <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">No se pudieron cargar las canastas. Por favor intenta más tarde.</p>
        <Boton variante="contorno" tamano="chico" onClick={reintentar}>
          Intentar de nuevo
        </Boton>
      </div>
    )
  }

  const orden: Grupo[] = ['regulares', 'basicas', 'pruebas']
  const conPlanes = orden.filter((g) => grupos[g].length > 0)
  const planesAbiertos = abierto ? grupos[abierto] : []

  return (
    <section data-testid="sn-tienda-lista" aria-labelledby="sn-tienda-lista-titulo" className="py-sn-seccion-movil min-[861px]:py-sn-seccion">
      <Contenedor className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Titulo nivel={2} tamano="h2" id="sn-tienda-lista-titulo" testId="sn-tienda-lista-titulo">
            Canastas Agroecológicas de Temporada
          </Titulo>
          <Texto tamano="grande" ancho="parrafo" testId="sn-tienda-lista-texto">
            Recibe alimentos frescos y deliciosos directamente de nuestra red agrícola cada semana
          </Texto>
        </div>

        {conPlanes.length === 0 ? (
          <p data-testid="sn-tienda-lista-vacio" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
            Por ahora no hay canastas de compra única disponibles.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-4 p-0 min-[861px]:grid-cols-[1.4fr_1fr_1fr]">
            {conPlanes.map((g) => (
              <TarjetaGrupo key={g} grupo={g} planes={grupos[g]} fotoDe={(p) => producto(p.itemcode)?.imagen_url || ''} kilosDe={(p) => kilosDe(producto(p.itemcode)?.nombre)} alAbrir={() => setAbierto(g)} />
            ))}
            <li data-testid="sn-tienda-lista-extras" className="flex">
              <button
                type="button"
                onClick={alExtras}
                className={unirClases('flex w-full flex-col gap-3 rounded-sn-tarjeta border border-solid border-sn-border bg-white p-6 text-left text-sn-ink', FOCO)}
              >
                <span className="font-sn-titulos text-[26px] font-normal leading-tight">Agrega extras a tu canasta</span>
                <span className="font-sn-texto text-sn-cuerpo-xs">
                  <Falta que="texto de la puerta de extras" quien="Lucio y Pablo" />
                </span>
                <ArrowRight aria-hidden="true" className="mt-auto h-5 w-5" />
              </button>
            </li>
          </ul>
        )}

        <div className="rounded-sn-tarjeta bg-white p-6 text-sn-ink">
          <Titulo nivel={3} tamano="h5">
            ¿Cómo funciona?
          </Titulo>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 font-sn-texto text-sn-cuerpo-sm font-light">
            <li>Puedes cancelar en cualquier momento</li>
            <li>Primer cargo al confirmar la suscripción</li>
            <li>Cobertura actual: Solo realizamos entregas en Ciudad de México (CDMX)</li>
          </ul>
        </div>
      </Contenedor>

      <AltaSuscripcion abierto={abierto !== null} planes={planesAbiertos} retornable={retornable} info={info} alCerrar={() => setAbierto(null)} />
    </section>
  )
}

interface PropsGrupo {
  grupo: Grupo
  planes: PlanApi[]
  fotoDe: (plan: PlanApi) => string
  kilosDe: (plan: PlanApi) => string | null
  alAbrir: () => void
}

function TarjetaGrupo({ grupo, planes, fotoDe, kilosDe: kilos, alAbrir }: PropsGrupo) {
  const destacada = grupo === 'basicas'
  const desde = grupo === 'pruebas' ? 0 : desdeDe(planes)
  const envio = desde !== null ? calcularCostoEnvio(desde) : 0
  const foto = planes.map(fotoDe).find(Boolean) || FOTO_RESPALDO
  const tamanos = planes.map((p) => [p.name, kilos(p)].filter(Boolean).join(' '))

  return (
    <li data-testid="sn-tienda-lista-grupo" data-grupo={grupo} className="flex">
      <button
        type="button"
        onClick={alAbrir}
        className={unirClases(
          'flex w-full flex-col gap-4 rounded-sn-tarjeta p-6 text-left',
          destacada ? 'bg-sn-terra text-white' : 'border border-solid border-sn-border bg-white text-sn-ink',
          destacada ? FOCO_SOBRE_OSCURO : FOCO,
        )}
      >
        <span className={unirClases('block overflow-hidden rounded-sn-tarjeta', destacada && 'bg-sn-cream p-2')}>
          <Foto src={foto} alt={TITULO_GRUPO[grupo]} proporcion="4/3" redondeo="tarjeta" sizes="(min-width: 861px) 33vw, 90vw" testId="sn-tienda-lista-grupo-foto" />
        </span>
        {destacada && (
          <span className="font-sn-texto text-sn-cuerpo-xs">
            <Falta que="canasta más popular" quien="Lucio y Pablo" />
          </span>
        )}
        <span className="font-sn-titulos text-[26px] font-normal leading-tight">{TITULO_GRUPO[grupo]}</span>
        <span data-testid="sn-tienda-lista-grupo-tamanos" className="font-sn-texto text-sn-cuerpo-xs font-normal">
          {tamanos.join(' · ')}
        </span>
        <span
          data-testid="sn-tienda-lista-grupo-precio"
          data-estado={desde === null ? 'vacio' : 'listo'}
          data-precio={desde ?? undefined}
          data-envio={desde !== null ? envio : undefined}
          className="mt-auto font-sn-titulos text-[22px] font-normal"
        >
          {desde === null
            ? ''
            : grupo === 'pruebas'
              ? precioLegible(0)
              : envio > 0
                ? `desde ${precioLegible(desde)} + ${precioLegible(envio)} de envío`
                : `desde ${precioLegible(desde)} · Envío gratis`}
        </span>
      </button>
    </li>
  )
}
