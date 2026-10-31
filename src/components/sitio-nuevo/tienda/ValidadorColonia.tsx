'use client'

// R15 v2 · F3 (tienda): «¿Llegamos a tu colonia?» de la maqueta (`.colonia-validator`: franja cream, caja blanca con el campo y el
// resultado en DM Mono). Lo de adentro es el selector de código postal de hoy (src/components/ui/PostalCodeSelector.tsx) sobre la misma
// llamada (GET /api/zonas-entrega/todas: un CP puede tener colonias con días distintos, `/{cp}` devuelve solo una) y la «Próxima entrega
// disponible» del calendario de hoy (DeliveryDatePicker.tsx:482), con la marca de la hora de corte (C53, D-F3-07 b, D-F3-24 T-13).
// D-F3-20 P-6 / T-21: solo dígitos, sin prometer la colonia. Sin cobertura: el texto de hoy sin emojis y la bodega de lib/bodega.ts.
import { useCallback, useEffect, useId, useState } from 'react'
import { BODEGA } from '@/lib/bodega'
import { formatFechaMexico } from '@/lib/dates'
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { buscarZonas, diasDeZona, pedirZonas, sinCobertura, soloDigitosCp, type ZonaEntrega } from './zonas'
import { pedirDiasNoHabiles, proximaEntrega, reglasDe, SIN_REGLAS, type ReglasCalendario } from './proximaEntrega'

type EstadoZonas = { fase: 'sin-pedir' } | { fase: 'cargando' } | { fase: 'listo'; zonas: ZonaEntrega[] } | { fase: 'error' }

const LARGO: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }

export default function ValidadorColonia() {
  const id = useId()
  const [busqueda, setBusqueda] = useState('')
  const [zonas, setZonas] = useState<EstadoZonas>({ fase: 'sin-pedir' })
  const [reglas, setReglas] = useState<ReglasCalendario>(SIN_REGLAS)

  const cargar = useCallback(() => {
    setZonas({ fase: 'cargando' })
    pedirZonas().then((lista) => setZonas(lista ? { fase: 'listo', zonas: lista } : { fase: 'error' }))
    pedirDiasNoHabiles().then((r) => setReglas(reglasDe(r)))
  }, [])

  // Las zonas se piden al empezar a escribir (no al cargar la página: la mayoría no usa el validador).
  useEffect(() => {
    if (busqueda && zonas.fase === 'sin-pedir') cargar()
  }, [busqueda, zonas.fase, cargar])

  const encontradas = zonas.fase === 'listo' && busqueda ? buscarZonas(zonas.zonas, busqueda) : []
  const fase = !busqueda
    ? 'vacio'
    : zonas.fase === 'error'
      ? 'error'
      : zonas.fase !== 'listo'
        ? 'cargando'
        : sinCobertura(busqueda, encontradas)
          ? 'sin-cobertura'
          : 'zonas'

  return (
    <section data-testid="sn-tienda-colonia" className="border-b border-solid border-sn-border bg-sn-cream py-[18px]">
      <Contenedor ancho="angosto" className="flex flex-col gap-4 min-[861px]:flex-row min-[861px]:items-start min-[861px]:gap-[22px]">
        <label htmlFor={`${id}-cp`} className="shrink-0 pt-2 font-sn-titulos text-sn-h6 font-normal text-sn-ink">
          Selecciona tu código postal
        </label>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <input
            id={`${id}-cp`}
            data-testid="sn-tienda-colonia-campo"
            type="search"
            inputMode="numeric"
            autoComplete="postal-code"
            value={busqueda}
            onChange={(e) => setBusqueda(soloDigitosCp(e.target.value))}
            placeholder="Escribe tu código postal"
            aria-describedby={`${id}-resultado`}
            className={unirClases(
              'w-full rounded-sn-pildora border border-solid border-sn-muted bg-white px-5 py-3 font-sn-mono text-[13px] text-sn-ink placeholder:text-sn-ink/70',
              FOCO,
            )}
          />
          <div id={`${id}-resultado`} data-testid="sn-tienda-colonia-resultados" data-estado={fase} aria-live="polite">
            {fase === 'cargando' && (
              <p data-testid="sn-tienda-colonia-cargando" className="m-0 rounded-sn-tarjeta bg-white px-4 py-3 font-sn-mono text-[12px] font-medium text-sn-ink">
                Cargando zonas...
              </p>
            )}
            {fase === 'error' && (
              <div data-testid="sn-tienda-colonia-error" role="alert" className="flex flex-wrap items-center gap-3 rounded-sn-tarjeta bg-white px-4 py-3">
                <span className="font-sn-mono text-[12px] font-medium text-sn-terra">Error al verificar cobertura</span>
                <Boton variante="texto" tamano="chico" onClick={cargar} testId="sn-tienda-colonia-reintentar">
                  Intentar de nuevo
                </Boton>
              </div>
            )}
            {fase === 'sin-cobertura' && (
              <div data-testid="sn-tienda-colonia-sin-cobertura" className="flex flex-col gap-1 rounded-sn-tarjeta bg-white px-4 py-3 text-sn-ink">
                <p className="m-0 font-sn-mono text-[12px] font-medium text-sn-terra">¡Ups! Todavía no llegamos ahí</p>
                <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium">Puedes recoger en nuestra matriz</p>
                <p className="m-0 font-sn-texto text-sn-cuerpo-xs font-normal">{BODEGA.corta}</p>
                <p className="m-0 font-sn-texto text-sn-cuerpo-xs font-normal">{BODEGA.horario}</p>
              </div>
            )}
            {fase === 'zonas' && (
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {encontradas.map((z) => {
                  const proxima = proximaEntrega(z, reglas)
                  return (
                    <li
                      key={z.id}
                      data-testid="sn-tienda-colonia-zona"
                      data-cp={z.codigo_postal}
                      data-colonia={z.colonia}
                      className="flex flex-col gap-1 rounded-sn-tarjeta bg-white px-4 py-3 text-sn-ink"
                    >
                      <p className="m-0 font-sn-mono text-[12px] font-medium text-sn-green">
                        {z.codigo_postal} · {z.colonia}, {z.municipio}
                      </p>
                      <p className="m-0 font-sn-texto text-sn-cuerpo-xs font-normal">{diasDeZona(z)}</p>
                      {proxima && (
                        <p data-testid="sn-tienda-colonia-proxima" data-fecha={proxima} className="m-0 font-sn-texto text-sn-cuerpo-xs font-normal">
                          Próxima entrega disponible:{' '}
                          <span className="font-medium">{formatFechaMexico(proxima, LARGO)}</span>{' '}
                          <Falta que="hora de corte de los pedidos de antes de las 12" quien="David" />
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </Contenedor>
    </section>
  )
}
