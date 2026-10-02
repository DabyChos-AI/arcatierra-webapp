'use client'

/**
 * R6 · A12 (sesión 46, 2-oct-2026): la dirección de entrega del checkout, ESTRUCTURADA.
 *
 * Con sesión: las direcciones guardadas del cliente (`GET /api/direcciones`, proxy Next) como tarjetas de radio; las de un
 * C.P. sin cobertura (`/api/zonas-entrega/{cp}` → 404) se ven deshabilitadas. «Usar otra dirección», un cliente sin
 * direcciones y el invitado llenan el formulario: C.P. + colonia con el PostalCodeSelector (colonia = `zona.colonia`,
 * alcaldía = `zona.municipio`), calle, número exterior e interior, referencias y, con sesión, un nombre opcional.
 *
 * Este componente solo pinta: el estado (qué se eligió, qué se escribió) vive en CheckoutFormSingleStep y es EXPLÍCITO
 * (`modo`), nunca «el campo tiene texto» (memoria s42: la primera tecla colapsaba el editor). El formulario se queda montado
 * (oculto) mientras se elige una guardada, para que el PostalCodeSelector no pierda la zona que ya se eligió.
 */

import { Loader2, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'
import type { ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import { API_URL } from '@/lib/api'
import {
  TEXTO_DIRECCION_INCOMPLETA,
  TEXTO_DIRECCION_NO_ES_TUYA,
  textoCpSinCobertura,
  textoDireccion,
  type DireccionGuardada,
  type DireccionNuevaPedido,
} from '@/types/datos-cliente'

// ─── Datos ───────────────────────────────────────────────────────────────────────────────────────────────────────────

/** La cobertura de un C.P.: 200 = sí (con su zona), 404 = no, otra cosa = no se pudo revisar. */
export type CoberturaCp = { estado: 'si'; zona: ZonaEntrega } | { estado: 'no' } | { estado: 'error' }

export type ModoDireccion = 'guardada' | 'nueva'

/** Lo que el cliente teclea en el formulario (colonia, alcaldía y C.P. salen de la zona elegida). */
export interface CamposDireccionNueva {
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior: string
  referencias: string
}

export const CAMPOS_DIRECCION_VACIOS: CamposDireccionNueva = {
  nombre_direccion: '',
  calle: '',
  numero_exterior: '',
  numero_interior: '',
  referencias: '',
}

/** Los `maxLength` copian el modelo `DireccionPedido` del backend (R6 §4 backend-entregas 15). */
const MAX = { nombre_direccion: 100, calle: 255, numero_exterior: 20, numero_interior: 20, referencias: 500 } as const

/** «No entregamos en el código postal » — el principio de `textoCpSinCobertura(cp)`, sin repetir el texto. */
const PREFIJO_CP_SIN_COBERTURA = textoCpSinCobertura('\u0000').split('\u0000')[0]

/** La llave de cobertura de una dirección guardada: su C.P. tal cual (sin espacios). */
export function cpDeDireccion(d: DireccionGuardada): string {
  return d.codigo_postal.trim()
}

function esDireccionGuardada(d: unknown): d is DireccionGuardada {
  const x = d as Partial<DireccionGuardada> | null
  return (
    !!x &&
    typeof x.id === 'string' &&
    typeof x.calle === 'string' &&
    typeof x.numero_exterior === 'string' &&
    typeof x.colonia === 'string' &&
    typeof x.codigo_postal === 'string' &&
    x.activa !== false
  )
}

function esZona(z: unknown): z is ZonaEntrega {
  const x = z as Partial<ZonaEntrega> | null
  return !!x && typeof x.codigo_postal === 'string' && typeof x.colonia === 'string' && typeof x.municipio === 'string'
}

/** `GET /api/zonas-entrega/{cp}` (directo a la API, como el calendario). */
export async function coberturaDeCp(cp: string): Promise<CoberturaCp> {
  const digitos = cp.replace(/\D/g, '')
  if (!digitos || digitos.length > 5) return { estado: 'no' }
  try {
    const r = await fetch(`${API_URL}/api/zonas-entrega/${digitos.padStart(5, '0')}`)
    if (r.status === 404) return { estado: 'no' }
    if (!r.ok) return { estado: 'error' }
    const zona: unknown = await r.json()
    return esZona(zona) ? { estado: 'si', zona } : { estado: 'error' }
  } catch {
    return { estado: 'error' }
  }
}

/** Las direcciones guardadas (el proxy devuelve `[]` sin token o con error) y la cobertura de cada C.P., una vez por C.P. */
export async function cargarDireccionesGuardadas(): Promise<{
  lista: DireccionGuardada[]
  cobertura: Record<string, CoberturaCp>
}> {
  let lista: DireccionGuardada[] = []
  try {
    const r = await fetch('/api/direcciones', { cache: 'no-store' })
    const datos: unknown = r.ok ? await r.json() : []
    lista = Array.isArray(datos) ? datos.filter(esDireccionGuardada) : []
  } catch {
    lista = []
  }
  const cps = Array.from(new Set(lista.map(cpDeDireccion)))
  const pares = await Promise.all(cps.map(async (cp) => [cp, await coberturaDeCp(cp)] as const))
  return { lista, cobertura: Object.fromEntries(pares) }
}

/** Por omisión: la principal con cobertura; si no, la primera con cobertura; si no, ninguna (formulario nuevo). */
export function direccionPorOmision(
  lista: DireccionGuardada[],
  cobertura: Record<string, CoberturaCp>
): DireccionGuardada | null {
  const conCobertura = lista.filter((d) => cobertura[cpDeDireccion(d)]?.estado === 'si')
  return conCobertura.find((d) => d.es_principal) ?? conCobertura[0] ?? null
}

/** La `direccion` del payload: todas las llaves, `null` en las opcionales vacías (el invitado no nombra direcciones). */
export function direccionNuevaPedido(
  campos: CamposDireccionNueva,
  zona: ZonaEntrega | null,
  conSesion: boolean
): DireccionNuevaPedido {
  const opcional = (v: string) => v.trim() || null
  return {
    nombre_direccion: conSesion ? opcional(campos.nombre_direccion) : null,
    calle: campos.calle.trim(),
    numero_exterior: campos.numero_exterior.trim(),
    numero_interior: opcional(campos.numero_interior),
    colonia: zona?.colonia ?? '',
    alcaldia: zona?.municipio ?? null,
    codigo_postal: zona?.codigo_postal ?? '',
    referencias: opcional(campos.referencias),
  }
}

/** Los 400 de crear-preferencia que son de la dirección (se pintan en este bloque). */
export function esErrorDeDireccion(texto: string): boolean {
  return texto === TEXTO_DIRECCION_INCOMPLETA || esDireccionAjena(texto) || esCpSinCobertura(texto)
}

export function esCpSinCobertura(texto: string): boolean {
  return texto.startsWith(PREFIJO_CP_SIN_COBERTURA)
}

export function esDireccionAjena(texto: string): boolean {
  return texto === TEXTO_DIRECCION_NO_ES_TUYA
}

// ─── Pantalla ────────────────────────────────────────────────────────────────────────────────────────────────────────

interface DireccionEntregaProps {
  conSesion: boolean
  /** Con sesión, mientras llegan las direcciones y su cobertura. */
  cargando: boolean
  direcciones: DireccionGuardada[]
  cobertura: Record<string, CoberturaCp>
  modo: ModoDireccion
  direccionIdElegida: string | null
  onElegirGuardada: (id: string) => void
  onUsarOtra: () => void
  campos: CamposDireccionNueva
  onCampo: (campo: keyof CamposDireccionNueva, valor: string) => void
  zonaNueva: ZonaEntrega | null
  onZonaNueva: (zona: ZonaEntrega | null) => void
  /** Un 400 del backend sobre la dirección (C.P. sin cobertura, incompleta, ajena). */
  error: string | null
}

const CLASE_TARJETA = 'flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors'

export default function DireccionEntrega({
  conSesion,
  cargando,
  direcciones,
  cobertura,
  modo,
  direccionIdElegida,
  onElegirGuardada,
  onUsarOtra,
  campos,
  onCampo,
  zonaNueva,
  onZonaNueva,
  error,
}: DireccionEntregaProps) {
  const hayGuardadas = conSesion && !cargando && direcciones.length > 0
  const mostrarFormulario = modo === 'nueva' && !cargando

  return (
    <div className="space-y-4">
      {conSesion && cargando && (
        <p className="flex items-center gap-2 text-sm text-gray-600" role="status" data-testid="checkout-direcciones-cargando">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando tus direcciones…
        </p>
      )}

      {hayGuardadas && (
        <fieldset data-testid="checkout-direcciones" className="min-w-0">
          <legend className="mb-2 text-sm font-medium text-gray-700">¿Dónde recibes tu pedido?</legend>
          <div className="space-y-2">
            {direcciones.map((d) => {
              const cob = cobertura[cpDeDireccion(d)]
              const estado = cob?.estado ?? 'error'
              const habilitada = estado === 'si'
              const elegida = modo === 'guardada' && direccionIdElegida === d.id
              return (
                <label
                  key={d.id}
                  className={`${CLASE_TARJETA} ${
                    elegida ? 'border-verde bg-green-50' : 'border-gray-200'
                  } ${habilitada ? 'cursor-pointer hover:border-verde-suave' : 'cursor-not-allowed bg-gray-50 opacity-70'}`}
                >
                  <input
                    type="radio"
                    name="checkout-direccion"
                    value={d.id}
                    checked={elegida}
                    disabled={!habilitada}
                    onChange={() => onElegirGuardada(d.id)}
                    data-testid={`checkout-direccion-guardada-${d.id}`}
                    data-cobertura={estado}
                    className="mt-1 h-4 w-4 shrink-0 accent-verde"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-medium text-gray-900">
                      {d.nombre_direccion}
                      {d.es_principal && (
                        <span className="rounded-full bg-neutro-light px-2 py-0.5 text-xs font-normal text-verde">Principal</span>
                      )}
                    </span>
                    <span className="block break-words text-gray-600">{textoDireccion(d)}</span>
                    {d.referencias && <span className="block break-words text-xs text-gray-500">Referencias: {d.referencias}</span>}
                    {!habilitada && (
                      <span
                        className="mt-1 block text-xs font-medium text-terracota"
                        data-testid={`checkout-direccion-sin-cobertura-${d.id}`}
                      >
                        {estado === 'no' ? 'Sin entrega en este CP' : 'No pudimos revisar la cobertura de este CP'}
                      </span>
                    )}
                  </span>
                </label>
              )
            })}
            <label
              className={`${CLASE_TARJETA} cursor-pointer hover:border-verde-suave ${
                modo === 'nueva' ? 'border-verde bg-green-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="checkout-direccion"
                value="otra"
                checked={modo === 'nueva'}
                onChange={onUsarOtra}
                data-testid="checkout-direccion-otra"
                className="mt-1 h-4 w-4 shrink-0 accent-verde"
              />
              <span className="font-medium text-gray-900">Usar otra dirección</span>
            </label>
          </div>
        </fieldset>
      )}

      {/* Formulario estructurado: montado siempre (oculto con una guardada) para no perder la zona elegida */}
      <div data-testid="checkout-direccion-nueva" hidden={!mostrarFormulario} className="space-y-4">
        {conSesion && (
          <p className="text-xs text-gray-500">
            {hayGuardadas ? 'La guardamos en tus direcciones para tu próxima compra.' : 'Aún no tienes direcciones guardadas: la que escribas se guarda para tu próxima compra.'}
          </p>
        )}
        <div>
          <p className="mb-2 block text-sm font-medium text-gray-700">Código postal y colonia *</p>
          <PostalCodeSelector value={zonaNueva?.codigo_postal ?? ''} onChange={(_cp, zona) => onZonaNueva(zona)} />
          <p className="mt-1 flex items-start gap-1 text-xs text-gray-600" data-testid="checkout-colonia">
            <MapPin className="mt-px h-3.5 w-3.5 shrink-0 text-terracota" aria-hidden="true" />
            {zonaNueva
              ? `Colonia ${zonaNueva.colonia}, ${zonaNueva.municipio} · CP ${zonaNueva.codigo_postal}`
              : 'Elige tu código postal y tu colonia: así sabemos si llegamos.'}
          </p>
        </div>

        <div>
          <label htmlFor="checkout-calle" className="mb-1 block text-sm font-medium text-gray-700">
            Calle *
          </label>
          <Input
            id="checkout-calle"
            data-testid="checkout-calle"
            value={campos.calle}
            onChange={(e) => onCampo('calle', e.target.value)}
            placeholder="Nombre de la calle"
            maxLength={MAX.calle}
            autoComplete="address-line1"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <label htmlFor="checkout-numero-exterior" className="mb-1 block text-sm font-medium text-gray-700">
              Número exterior *
            </label>
            <Input
              id="checkout-numero-exterior"
              data-testid="checkout-numero-exterior"
              value={campos.numero_exterior}
              onChange={(e) => onCampo('numero_exterior', e.target.value)}
              placeholder="Ej. 123"
              maxLength={MAX.numero_exterior}
              autoComplete="off"
              required
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="checkout-numero-interior" className="mb-1 block text-sm font-medium text-gray-700">
              Número interior
            </label>
            <Input
              id="checkout-numero-interior"
              data-testid="checkout-numero-interior"
              value={campos.numero_interior}
              onChange={(e) => onCampo('numero_interior', e.target.value)}
              placeholder="Depto., casa (opcional)"
              maxLength={MAX.numero_interior}
              autoComplete="address-line2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="checkout-referencias" className="mb-1 block text-sm font-medium text-gray-700">
            Referencias para el repartidor
          </label>
          <textarea
            id="checkout-referencias"
            data-testid="checkout-referencias"
            value={campos.referencias}
            onChange={(e) => onCampo('referencias', e.target.value)}
            placeholder="Entre calles, color de la fachada… (opcional)"
            maxLength={MAX.referencias}
            className="w-full resize-none rounded-lg border border-gray-300 p-2 text-sm"
            rows={2}
          />
        </div>

        {conSesion && (
          <div>
            <label htmlFor="checkout-nombre-direccion" className="mb-1 block text-sm font-medium text-gray-700">
              Nombre (Casa, Oficina)
            </label>
            <Input
              id="checkout-nombre-direccion"
              data-testid="checkout-nombre-direccion"
              value={campos.nombre_direccion}
              onChange={(e) => onCampo('nombre_direccion', e.target.value)}
              placeholder="Opcional"
              maxLength={MAX.nombre_direccion}
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rojo-bg p-3 text-sm text-rojo" role="alert" data-testid="checkout-direccion-error">
          {error}
        </p>
      )}
    </div>
  )
}
