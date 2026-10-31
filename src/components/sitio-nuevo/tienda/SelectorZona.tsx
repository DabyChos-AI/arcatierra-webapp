'use client'

// R15 v2 · F3 (tienda): «Zona de entrega *» del alta (hoy `PostalCodeSelector` dentro de SubscriptionCheckoutForm.tsx:393-403), con la
// regla de zonas.ts (la misma llamada y el mismo filtro de hoy; solo dígitos, D-F3-20 P-6). La zona elegida da la alcaldía (`municipio`)
// y el código postal del alta (SubscriptionCheckoutForm.tsx:399-401). Sin cobertura: el texto de hoy sin emojis y la bodega.
import { useEffect, useId, useState } from 'react'
import { BODEGA } from '@/lib/bodega'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { buscarZonas, diasDeZona, pedirZonas, sinCobertura, soloDigitosCp, type ZonaEntrega } from './zonas'

interface Props {
  zona: ZonaEntrega | null
  alElegir: (zona: ZonaEntrega | null) => void
  /** El código postal de la dirección guardada (para proponer su zona). */
  cpInicial?: string
  testId: string
}

export default function SelectorZona({ zona, alElegir, cpInicial, testId }: Props) {
  const id = useId()
  const [busqueda, setBusqueda] = useState(zona?.codigo_postal ?? cpInicial ?? '')
  const [zonas, setZonas] = useState<ZonaEntrega[] | null | 'error'>(null)

  const cargar = () => {
    setZonas(null)
    pedirZonas().then((lista) => setZonas(lista ?? 'error'))
  }
  useEffect(cargar, [])

  // Con el CP de la dirección guardada, la primera zona de ese CP (como hoy, que validaba el CP al cargar los datos).
  useEffect(() => {
    if (zona || !cpInicial || !Array.isArray(zonas)) return
    const propia = zonas.find((z) => z.codigo_postal === cpInicial)
    if (propia) {
      // El campo dice el CP de la zona elegida (antes quedaba vacío: el CP llega de /api/auth/me después de montar el campo).
      setBusqueda(propia.codigo_postal)
      alElegir(propia)
    }
  }, [zonas, cpInicial, zona, alElegir])

  const encontradas = Array.isArray(zonas) && busqueda ? buscarZonas(zonas, busqueda) : []

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`${id}-cp`} className="font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
        Zona de entrega *
      </label>
      <input
        id={`${id}-cp`}
        data-testid={testId}
        type="search"
        inputMode="numeric"
        autoComplete="postal-code"
        value={busqueda}
        onChange={(e) => {
          setBusqueda(soloDigitosCp(e.target.value))
          if (zona) alElegir(null)
        }}
        placeholder="Escribe tu código postal"
        className={unirClases(
          'w-full rounded-sn-campo border border-solid border-sn-muted bg-white px-3.5 py-3 font-sn-texto text-sn-cuerpo-sm text-sn-ink placeholder:text-sn-ink/70',
          FOCO,
        )}
      />
      {zona && (
        <p className="m-0 font-sn-texto text-sn-cuerpo-xs font-medium text-sn-green" role="status">
          {zona.codigo_postal} · {zona.colonia}, {zona.municipio}
        </p>
      )}
      {!zona && zonas === null && busqueda && <p className="m-0 font-sn-texto text-sn-cuerpo-xs text-sn-ink">Cargando zonas...</p>}
      {!zona && zonas === 'error' && (
        <div role="alert" className="flex flex-wrap items-center gap-3">
          <span className="font-sn-texto text-sn-cuerpo-xs font-medium text-sn-terra">Error al verificar cobertura</span>
          <Boton variante="texto" tamano="chico" onClick={cargar}>
            Intentar de nuevo
          </Boton>
        </div>
      )}
      {!zona && Array.isArray(zonas) && sinCobertura(busqueda, encontradas) && (
        <div className="flex flex-col gap-1 rounded-sn-campo bg-white p-3 text-sn-ink">
          <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-terra">¡Ups! Todavía no llegamos ahí</p>
          <p className="m-0 font-sn-texto text-sn-cuerpo-xs">Puedes recoger en nuestra matriz</p>
          <p className="m-0 font-sn-texto text-sn-cuerpo-xs">{BODEGA.corta}</p>
        </div>
      )}
      {!zona && encontradas.length > 0 && (
        <ul className="m-0 flex max-h-64 list-none flex-col gap-1 overflow-y-auto rounded-sn-campo border border-solid border-sn-border bg-white p-1">
          {encontradas.map((z) => (
            <li key={z.id}>
              <button
                type="button"
                data-testid={`${testId}-opcion`}
                data-cp={z.codigo_postal}
                data-colonia={z.colonia}
                onClick={() => {
                  setBusqueda(z.codigo_postal)
                  alElegir(z)
                }}
                className={unirClases('flex w-full flex-col items-start rounded-sn-boton px-3 py-2 text-left text-sn-ink hover:bg-sn-warm', FOCO)}
              >
                <span className="font-sn-mono text-sn-cuerpo-xs font-medium">
                  {z.codigo_postal} · {diasDeZona(z)}
                </span>
                <span className="font-sn-texto text-sn-cuerpo-xs">
                  {z.colonia}, {z.municipio}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
