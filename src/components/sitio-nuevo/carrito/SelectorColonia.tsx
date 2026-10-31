'use client'

// R15 · F3 v2 (carrito, sesión 61): el código postal y la colonia de la dirección nueva del checkout (D-F3-20 P-6).
// La regla (UNA petición `GET ${API_URL}/api/zonas-entrega/todas`, solo dígitos hasta 5, 10 sin búsqueda y 15 con búsqueda, «sin cobertura»
// con 5 dígitos y 0 resultados, los días «L, M, Mi, J, V») vive en UN solo lugar, `sitio-nuevo/tienda/zonas.ts`, con su prueba contra
// `src/components/ui/PostalCodeSelector.tsx` de hoy (D-F3-24 T-28): aquí se importa y solo se pinta. Textos de hoy (`PostalCodeSelector.tsx`)
// sin emojis y sin nada que prometa buscar por colonia (el campo no deja escribir letras, D-F3-20 P-6). La zona elegida vive en el padre.

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { BODEGA } from '@/lib/bodega'
import type { ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import { buscarZonas, diasDeZona, pedirZonas, sinCobertura as esSinCobertura, soloDigitosCp } from '@/components/sitio-nuevo/tienda/zonas'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'

type Props = {
  zona: ZonaEntrega | null
  onZona: (zona: ZonaEntrega | null) => void
  idEtiqueta: string
}

export default function SelectorColonia({ zona, onZona, idEtiqueta }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [zonas, setZonas] = useState<ZonaEntrega[]>([])
  const [cargando, setCargando] = useState(true)
  const caja = useRef<HTMLDivElement>(null)
  const buscador = useRef<HTMLInputElement>(null)
  const idLista = useId()

  useEffect(() => {
    let vigente = true
    pedirZonas().then((lista) => {
      if (!vigente) return
      setZonas(lista ?? [])
      setCargando(false)
    })
    return () => {
      vigente = false
    }
  }, [])

  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  useEffect(() => {
    if (abierto) buscador.current?.focus()
  }, [abierto])

  const opciones = useMemo(() => buscarZonas(zonas, busqueda), [zonas, busqueda])
  const sinCobertura = esSinCobertura(busqueda, opciones)

  const elegir = (z: ZonaEntrega) => {
    setBusqueda('')
    setAbierto(false)
    onZona(z)
  }

  const teclear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = soloDigitosCp(e.target.value)
    setBusqueda(valor)
    if (!valor) onZona(null)
  }

  return (
    <div ref={caja} className="relative" onKeyDown={(e) => e.key === 'Escape' && setAbierto(false)}>
      <button
        type="button"
        id={`${idEtiqueta}-boton`}
        aria-labelledby={`${idEtiqueta} ${idEtiqueta}-boton`}
        aria-expanded={abierto}
        aria-controls={idLista}
        data-testid="sn-checkout-direccion-cp"
        data-cp={zona?.codigo_postal ?? ''}
        onClick={() => setAbierto((v) => !v)}
        className={unirClases(
          'flex w-full items-center justify-between gap-3 rounded-sn-campo border border-solid border-sn-muted bg-white px-3.5 py-3 text-left font-sn-texto text-sn-cuerpo-sm text-sn-ink',
          FOCO,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-sn-terra" />
          {zona ? (
            <span className="min-w-0">
              <span className="block font-medium">{zona.codigo_postal}</span>
              <span className="block truncate text-sn-ink/70">
                {zona.colonia}, {zona.municipio}
              </span>
            </span>
          ) : (
            <span className="text-sn-ink/70">Selecciona tu código postal</span>
          )}
        </span>
        <ChevronDown aria-hidden="true" className={unirClases('h-5 w-5 shrink-0 text-sn-ink/70', abierto && 'rotate-180')} />
      </button>

      {abierto && (
        <div
          id={idLista}
          className="absolute left-0 right-0 z-[40] mt-2 overflow-hidden rounded-sn-tarjeta border border-solid border-sn-border bg-white [box-shadow:0_12px_32px_rgba(0,0,0,0.18)]"
        >
          <div className="border-0 border-b border-solid border-sn-border p-3">
            <label className="relative block">
              <span className="sr-only">Buscar por CP</span>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sn-ink/70" />
              <input
                ref={buscador}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={busqueda}
                onChange={teclear}
                data-testid="sn-checkout-direccion-cp-buscar"
                className={unirClases(
                  'block w-full rounded-sn-campo border border-solid border-sn-muted bg-white py-2.5 pl-9 pr-3 font-sn-texto text-sn-cuerpo-sm text-sn-ink placeholder:text-sn-ink/70',
                  FOCO,
                )}
              />
            </label>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {cargando ? (
              <p data-testid="sn-checkout-direccion-cp-cargando" className="m-0 p-4 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
                Cargando zonas...
              </p>
            ) : sinCobertura ? (
              <div data-testid="sn-checkout-direccion-cp-sin-cobertura" className="p-6 text-center font-sn-texto text-sn-ink">
                <p className="m-0 mb-2 font-sn-titulos text-sn-h6 font-normal">¡Ups! Todavía no llegamos ahí</p>
                <p className="m-0 mb-4 text-sn-cuerpo-sm">
                  Nuestros repartidores están pedaleando fuerte para expandirse, pero aún no alcanzan tu zona.{' '}
                  <span className="font-medium">¡No te desanimes!</span>
                </p>
                <div className="mb-4 rounded-sn-campo bg-sn-warm p-4 text-left">
                  <p className="m-0 text-sn-cuerpo-sm font-medium">Puedes recoger en nuestra matriz</p>
                  <p className="m-0 mt-1 text-sn-cuerpo-xs">
                    De paso conoces a la familia Arca Tierra y te llevas tus productos súper frescos
                  </p>
                  <p className="m-0 mt-2 text-sn-cuerpo-xs text-sn-ink/70">{BODEGA.corta}</p>
                </div>
                <p className="m-0 text-sn-cuerpo-xs">Entre más nos recomiendes, más rápido llegamos a tu colonia</p>
                <p className="m-0 mt-3 text-sn-cuerpo-xs text-sn-ink/70">Tu compra sigue ayudando al campo, a la naturaleza y a tu salud</p>
              </div>
            ) : opciones.length > 0 ? (
              <>
                {!busqueda && (
                  <p className="m-0 border-0 border-b border-solid border-sn-border bg-sn-warm px-4 py-2 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
                    Zonas populares
                  </p>
                )}
                <ul className="m-0 list-none p-0">
                  {opciones.map((z) => (
                    <li key={z.id}>
                      <button
                        type="button"
                        data-testid="sn-checkout-direccion-cp-opcion"
                        data-cp={z.codigo_postal}
                        data-zona-id={z.id}
                        onClick={() => elegir(z)}
                        className={unirClases(
                          'flex w-full items-center gap-3 bg-white px-4 py-3 text-left font-sn-texto text-sn-ink hover:bg-sn-warm',
                          zona?.id === z.id && 'bg-sn-warm',
                          FOCO,
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sn-cuerpo-sm font-medium">{z.codigo_postal}</span>
                            <span className="rounded-sn-pildora bg-sn-cream px-2 py-0.5 text-sn-cuerpo-xs text-sn-ink">{diasDeZona(z)}</span>
                          </span>
                          <span className="block truncate text-sn-cuerpo-sm text-sn-ink">{z.colonia}</span>
                          <span className="block text-sn-cuerpo-xs text-sn-ink/70">{z.municipio}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="m-0 p-4 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">Escribe tu código postal</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
