'use client'

// R15 v2 · F3 (tienda, sesión 61): la tienda del sitio nuevo (`/tienda`). Diseño de la maqueta (página «tienda», medida por file:// en
// f3-tienda/s61/maqueta); textos, fotos, datos y llamadas de la tienda y de /suscripciones de hoy (DR-17, D-F3-06, f3/tienda-F3.md).
// Orden: héroe · «¿Llegamos a tu colonia?» · pestañas (D-F3-11) · el panel de la pestaña · «¿Por qué comprar…?» (D-F3-24 T-14).
// Datos desde el navegador con las llamadas de hoy: GET /api/products?limit=200 (tienda/page.tsx:514) y GET /api/subscriptions/planes
// (la misma de la portada, C46). La pestaña y la categoría se leen en un hijo dentro de <Suspense> (D-F3-24 T-19): la página es estática.
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { API_URL } from '@/lib/api'
import HeroeTienda from './HeroeTienda'
import ValidadorColonia from './ValidadorColonia'
import BarraPestanas from './BarraPestanas'
import CompraSuelto from './CompraSuelto'
import CanastaLista from './CanastaLista'
import AgregaExtras from './AgregaExtras'
import PorQueComprar from './PorQueComprar'
import { PESTANAS, direccionDePestana, pestanaDe, type IdPestana } from './pestanas'
import { deApi, leerProductos, sueltos, type ProductoApi, type ProductoTienda } from './catalogo'
import { leerPlanes, porGrupo, type PlanApi } from './canastas'

export type Carga<T> = { fase: 'cargando' } | { fase: 'listo'; datos: T } | { fase: 'error' }

interface Lectura {
  pestana: IdPestana
  /** ¿La dirección trae `?pestana=`? (al entrar con ella, la página baja a la barra, como `goTab` de la maqueta). */
  conPestana: boolean
  categoria: string | null
}

/** El único que llama `useSearchParams` (patrón R9, frontend-v11 L1063-1065). */
function Lector({ alLeer }: { alLeer: (l: Lectura) => void }) {
  const parametros = useSearchParams()
  const crudo = parametros.get('pestana')
  const categoria = parametros.get('categoria')
  useEffect(() => {
    alLeer({ pestana: pestanaDe(crudo), conPestana: crudo !== null, categoria })
  }, [crudo, categoria, alLeer])
  return null
}

export interface DatosTienda {
  /** Todo lo que trajo la lista (base de las canastas incluida), por itemcode. */
  porItemcode: Map<string, ProductoApi>
  /** Lo de «Compra suelto» (sin canastas). */
  sueltos: ProductoTienda[]
}

export default function Tienda() {
  const [pestana, setPestana] = useState<IdPestana | null>(null)
  const [categoria, setCategoria] = useState<string | null>(null)
  const [productos, setProductos] = useState<Carga<DatosTienda>>({ fase: 'cargando' })
  const [planes, setPlanes] = useState<Carga<PlanApi[]>>({ fase: 'cargando' })
  const barraRef = useRef<HTMLDivElement>(null)

  const alLeer = useCallback((l: Lectura) => {
    setPestana(l.pestana)
    setCategoria(l.categoria)
    if (l.conPestana) {
      // Después de pintar el panel, para que la barra no se mueva.
      requestAnimationFrame(() => barraRef.current?.scrollIntoView({ block: 'start' }))
    }
  }, [])

  const cargarProductos = useCallback(() => {
    setProductos({ fase: 'cargando' })
    fetch(`${API_URL}/api/products?limit=200`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((datos: unknown) => {
        const items = leerProductos(datos)
        if (!items) return setProductos({ fase: 'error' })
        setProductos({
          fase: 'listo',
          datos: { porItemcode: new Map(items.map((i) => [i.itemcode, i])), sueltos: sueltos(items.map(deApi)) },
        })
      })
      .catch(() => setProductos({ fase: 'error' }))
  }, [])

  const cargarPlanes = useCallback(() => {
    setPlanes({ fase: 'cargando' })
    fetch(`${API_URL}/api/subscriptions/planes`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((datos: unknown) => {
        const lista = leerPlanes(datos)
        setPlanes(lista ? { fase: 'listo', datos: lista } : { fase: 'error' })
      })
      .catch(() => setPlanes({ fase: 'error' }))
  }, [])

  useEffect(() => {
    cargarProductos()
    cargarPlanes()
  }, [cargarProductos, cargarPlanes])

  const elegir = useCallback((id: IdPestana) => {
    setPestana(id)
    // Sin navegar ni sumar historial: la dirección dice la pestaña (D-F3-22 (1)).
    window.history.replaceState(window.history.state, '', direccionDePestana(id, window.location.search))
  }, [])

  const conteos: Partial<Record<IdPestana, number>> = {}
  if (productos.fase === 'listo') conteos['compra-suelto'] = productos.datos.sueltos.length
  if (planes.fase === 'listo') {
    const g = porGrupo(planes.datos)
    conteos['canasta-lista'] = g.regulares.length + g.basicas.length
  }

  return (
    <main data-testid="sn-tienda">
      <Suspense fallback={null}>
        <Lector alLeer={alLeer} />
      </Suspense>
      <HeroeTienda />
      <ValidadorColonia />
      <div ref={barraRef} className="sticky top-14 z-[90] scroll-mt-14 min-[861px]:top-16 min-[861px]:scroll-mt-16">
        <BarraPestanas pestanas={PESTANAS} activa={pestana} conteos={conteos} alElegir={elegir} />
      </div>
      <div
        role="tabpanel"
        id="sn-tienda-panel"
        aria-labelledby={pestana ? `sn-tienda-pestana-${pestana}` : undefined}
        className="min-h-[50vh] bg-sn-warm"
      >
        {pestana === 'compra-suelto' && (
          <CompraSuelto productos={productos} categoriaInicial={categoria} reintentar={cargarProductos} />
        )}
        {pestana === 'canasta-lista' && (
          <CanastaLista planes={planes} productos={productos} reintentar={cargarPlanes} alExtras={() => elegir('extras')} />
        )}
        {pestana === 'extras' && (
          <AgregaExtras productos={productos} reintentar={cargarProductos} alSuscribirme={() => elegir('canasta-lista')} />
        )}
      </div>
      <PorQueComprar />
    </main>
  )
}
