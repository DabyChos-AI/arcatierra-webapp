'use client'

// R15 · F3 v2 (carrito, sesión 61): el calendario del día de entrega o de recoger del checkout nuevo. La regla es la de hoy
// (`calendario.ts`, copia renglón por renglón de `DeliveryDatePicker.tsx:211-239` con su prueba de comparación); lo que cambia (D-F3-07 c,
// CAL1): abre en el mes del primer día que se puede elegir. Textos de hoy (`DeliveryDatePicker.tsx:293-482`) salvo el horario falso
// «9:00 AM - 6:00 PM» (:470, D-7), que pasa a «de 7:00 a 17:00» (regla firmada, Word P2; D-F3-20 P-4, D-F3-21). Lleva la marca de la hora
// de corte (D-F3-07 b, pregunta C53). Llamadas de hoy: `GET ${API_URL}/api/zonas-entrega/{cp}` y `GET ${API_URL}/api/entregas/dias-no-habiles`.

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { BODEGA, NOMBRES_DIAS_RECOGER } from '@/lib/bodega'
import type { ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import Falta from '@/components/sitio-nuevo/Falta'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { FOCO, FOCO_BOTON, unirClases } from '@/components/sitio-nuevo/ui/clases'
import {
  DIAS_SEMANA,
  MESES,
  celdasDelMes,
  diaDisponible,
  haySiguienteMes,
  hoyMexico,
  mesInicial,
  pedirDiasNoHabiles,
  primerDiaDisponible,
  sumarMeses,
  textoDia,
  textoSinEntrega,
  topeDeAgenda,
  type ModoCalendario,
} from './calendario'

/** El CP completo y el retraso antes de pedir la zona (`DeliveryDatePicker.tsx:175`, `:183`). Técnicos: no se pintan. */
const DIGITOS_CP = 5
const RETRASO_MS = 300

type Props = {
  modo: ModoCalendario
  /** En `recoger` va vacío. */
  codigoPostal: string
  /** `AAAA-MM-DD` elegido (el padre lo descarta si cambia el CP). */
  seleccionado: string | null
  onElegir: (iso: string) => void
  idTitulo: string
}

export default function Calendario({ modo, codigoPostal, seleccionado, onElegir, idTitulo }: Props) {
  const recoger = modo === 'recoger'
  const [zona, setZona] = useState<ZonaEntrega | null>(null)
  const [cargandoZona, setCargandoZona] = useState(() => !recoger && codigoPostal.length >= DIGITOS_CP)
  const [error, setError] = useState<string | null>(null)
  const [sinEntrega, setSinEntrega] = useState<Map<string, string>>(() => new Map())
  const [maximoDias, setMaximoDias] = useState<number | null>(null)
  const [diasListos, setDiasListos] = useState(false)
  const [mes, setMes] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true
    pedirDiasNoHabiles().then((respuesta) => {
      if (!vigente) return
      if (respuesta) {
        setSinEntrega(new Map(respuesta.dias.map((d) => [d.fecha, d.motivo])))
        setMaximoDias(respuesta.maximo_dias)
      }
      setDiasListos(true)
    })
    return () => {
      vigente = false
    }
  }, [])

  // La zona del CP (`DeliveryDatePicker.tsx:152-185`); para recoger no se pide nada.
  useEffect(() => {
    if (recoger) return
    if (!codigoPostal || codigoPostal.length < DIGITOS_CP) {
      setZona(null)
      setError(null)
      setCargandoZona(false)
      return
    }
    let vigente = true
    setCargandoZona(true)
    setError(null)
    const pedir = async () => {
      try {
        const r = await fetch(`${API_URL}/api/zonas-entrega/${codigoPostal}`)
        if (!vigente) return
        if (r.ok) {
          setZona((await r.json()) as ZonaEntrega)
          setError(null)
        } else if (r.status === 404) {
          setZona(null)
          setError('Lo sentimos, no tenemos cobertura en este código postal')
        } else {
          setError('Error al verificar cobertura')
        }
      } catch {
        if (vigente) setError('Error de conexión')
      } finally {
        if (vigente) setCargandoZona(false)
      }
    }
    const espera = setTimeout(pedir, RETRASO_MS)
    return () => {
      vigente = false
      clearTimeout(espera)
    }
  }, [codigoPostal, recoger])

  const hayCalendario = recoger || zona !== null
  const hoy = hoyMexico()
  const entradas = { modo, zona, hoy, tope: topeDeAgenda(hoy, maximoDias), sinEntrega }
  const listo = hayCalendario && diasListos && (recoger || !cargandoZona)

  // D-F3-07 c: el mes con que abre = el del primer día que se puede elegir (una vez, cuando ya están la zona y los días sin entrega).
  useEffect(() => {
    if (listo && mes === null) setMes(mesInicial(entradas))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo, mes])

  const primero = listo ? primerDiaDisponible(entradas) : null

  return (
    <div data-testid="sn-checkout-calendario" data-modo={modo} className="flex flex-col gap-4">
      {recoger ? (
        <p data-testid="sn-checkout-calendario-recoger" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          Elige el día en que pasas por tu pedido ({NOMBRES_DIAS_RECOGER}). Horario: {BODEGA.horario}
        </p>
      ) : cargandoZona ? (
        <p data-testid="sn-checkout-calendario-cargando" role="status" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          Verificando cobertura...
        </p>
      ) : error ? (
        <AvisoEnLinea tono="error" testId="sn-checkout-calendario-error">
          {error}
        </AvisoEnLinea>
      ) : zona ? (
        <AvisoEnLinea tono="exito" as="div" testId="sn-checkout-calendario-zona">
          <span className="block">
            {zona.colonia}, {zona.municipio}
          </span>
          <span className="block font-normal">¡Excelente! Tenemos cobertura en tu zona</span>
        </AvisoEnLinea>
      ) : codigoPostal.length >= DIGITOS_CP ? (
        <AvisoEnLinea tono="atencion">Ingresa tu código postal completo</AvisoEnLinea>
      ) : null}

      {listo && mes !== null && (
        <div className="overflow-hidden rounded-sn-tarjeta border border-solid border-sn-border bg-white">
          <div className="flex items-center justify-between gap-2 border-0 border-b border-solid border-sn-border bg-sn-warm px-3 py-2">
            <button
              type="button"
              aria-label="Mes anterior"
              data-testid="sn-checkout-calendario-anterior"
              onClick={() => setMes(sumarMeses(mes, -1))}
              className={unirClases('flex h-11 w-11 items-center justify-center rounded-sn-pildora bg-transparent text-sn-ink hover:bg-sn-cream', FOCO_BOTON)}
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <p
              id={`${idTitulo}-mes`}
              data-testid="sn-checkout-calendario-mes"
              data-mes={mes}
              aria-live="polite"
              className="m-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-ink"
            >
              {MESES[Number(mes.slice(5, 7)) - 1]} {mes.slice(0, 4)}
            </p>
            <button
              type="button"
              aria-label="Mes siguiente"
              data-testid="sn-checkout-calendario-siguiente"
              disabled={!haySiguienteMes(mes, entradas.tope)}
              onClick={() => setMes(sumarMeses(mes, 1))}
              className={unirClases(
                'flex h-11 w-11 items-center justify-center rounded-sn-pildora bg-transparent text-sn-ink hover:bg-sn-cream disabled:cursor-not-allowed disabled:opacity-40',
                FOCO_BOTON,
              )}
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 border-0 border-b border-solid border-sn-border" aria-hidden="true">
            {DIAS_SEMANA.map((dia) => (
              <span key={dia} className="py-2 text-center font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
                {dia}
              </span>
            ))}
          </div>
          <div role="group" aria-labelledby={`${idTitulo} ${idTitulo}-mes`} className="grid grid-cols-7 gap-1 p-2">
            {celdasDelMes(mes).map((iso, i) => {
              if (!iso) return <span key={`hueco-${i}`} className="aspect-square" />
              const disponible = diaDisponible(iso, entradas)
              const elegido = seleccionado === iso
              const motivo = sinEntrega.get(iso) ?? null
              const etiquetaSinEntrega = motivo !== null ? textoSinEntrega(motivo) : null
              return (
                <button
                  key={iso}
                  type="button"
                  data-testid="sn-checkout-calendario-dia"
                  data-fecha={iso}
                  data-disponible={disponible ? 'true' : 'false'}
                  data-sin-entrega={etiquetaSinEntrega ? '1' : undefined}
                  title={etiquetaSinEntrega ?? undefined}
                  aria-label={etiquetaSinEntrega ? `${textoDia(iso)}. ${etiquetaSinEntrega}` : `${textoDia(iso)}${disponible ? '' : ' (sin entrega)'}`}
                  aria-pressed={elegido}
                  disabled={!disponible}
                  onClick={() => disponible && onElegir(iso)}
                  className={unirClases(
                    'flex aspect-square items-center justify-center rounded-sn-campo font-sn-texto text-sn-cuerpo-sm',
                    elegido
                      ? 'bg-sn-terra font-medium text-white'
                      : disponible
                        ? 'bg-sn-warm font-medium text-sn-ink hover:bg-sn-cream'
                        : etiquetaSinEntrega
                          ? 'cursor-not-allowed text-sn-terra line-through'
                          : 'cursor-not-allowed text-sn-ink/40',
                    iso === hoy && !elegido && 'outline outline-1 outline-sn-muted',
                    FOCO,
                  )}
                >
                  {Number(iso.slice(8, 10))}
                </button>
              )
            })}
          </div>
          <div
            data-testid="sn-checkout-calendario-leyenda"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-0 border-t border-solid border-sn-border bg-sn-warm px-4 py-3 font-sn-texto text-sn-cuerpo-xs text-sn-ink"
          >
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-3 w-3 rounded-sm border border-solid border-sn-muted bg-sn-warm" />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-sn-terra" />
              Seleccionado
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-3 w-3 rounded-sm border border-solid border-sn-border bg-white" />
              No disponible
            </span>
            {sinEntrega.size > 0 && (
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-3 w-3 rounded-sm border border-solid border-sn-terra bg-white" />
                Sin entrega
              </span>
            )}
          </div>
        </div>
      )}

      {listo && seleccionado && (
        <div data-testid="sn-checkout-calendario-elegido" data-fecha={seleccionado} className="rounded-sn-campo bg-sn-warm p-4 font-sn-texto text-sn-ink">
          <p className="m-0 text-sn-cuerpo-sm">{recoger ? 'Recoges tu pedido el' : 'Tu pedido llegará el'}</p>
          <p className="m-0 font-sn-titulos text-sn-h6 font-normal">{textoDia(seleccionado)}</p>
          <p className="m-0 mt-1 text-sn-cuerpo-xs">
            {recoger ? `Horario: ${BODEGA.horario}` : 'Horario de entrega: de 7:00 a 17:00'}
          </p>
        </div>
      )}
      {listo && !seleccionado && (
        <p data-testid="sn-checkout-calendario-primero" className="m-0 text-center font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          {recoger ? 'Primer día para recoger:' : 'Próxima entrega disponible:'}{' '}
          <span className="font-medium">{primero ? textoDia(primero) : ''}</span>
        </p>
      )}

      {hayCalendario && (
        <p className="m-0 font-sn-texto text-sn-cuerpo-sm">
          <Falta que="hora de corte de los pedidos de antes de las 12" quien="David" />
        </p>
      )}
    </div>
  )
}
