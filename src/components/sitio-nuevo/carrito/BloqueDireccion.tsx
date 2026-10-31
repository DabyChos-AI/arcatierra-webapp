'use client'

// R15 · F3 v2 (carrito, sesión 61): la dirección de entrega del checkout nuevo. Pinta lo mismo que `src/components/checkout/DireccionEntrega.tsx`
// de hoy (:179-381) con el diseño nuevo; la lógica (cobertura por CP, guardadas, la dirección nueva, los errores) se IMPORTA de ese archivo y
// el estado vive en la página (modo EXPLÍCITO guardada/nueva, memoria s42). El formulario se queda montado (oculto) mientras se elige una
// guardada o se recoge en bodega, como hoy. Las direcciones guardadas van en `ui/GrupoOpciones` tal cual (D-F3-30): cada una es
// `sn-opcion-<direccion_id>` y lleva su motivo cuando no se puede elegir.

import { Loader2 } from 'lucide-react'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import GrupoOpciones from '@/components/sitio-nuevo/ui/GrupoOpciones'
import {
  cpDeDireccion,
  type CamposDireccionNueva,
  type CoberturaCp,
  type ModoDireccion,
} from '@/components/checkout/DireccionEntrega'
import type { ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import { textoDireccion, type DireccionGuardada } from '@/types/datos-cliente'
import SelectorColonia from './SelectorColonia'

/**
 * Los `maxLength` de hoy (`DireccionEntrega.tsx:55`, no exportados), copia del modelo `DireccionPedido` del backend
 * (`payments.py:302-309`). Técnicos: no se pintan; una prueba los compara con los del DOM de hoy (D-F3-20 P-10).
 */
const MAX = { nombre_direccion: 100, calle: 255, numero_exterior: 20, numero_interior: 20, referencias: 500 } as const

type Props = {
  conSesion: boolean
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
  error: string | null
  idCp: string
}

export default function BloqueDireccion({
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
  idCp,
}: Props) {
  const hayGuardadas = conSesion && !cargando && direcciones.length > 0
  const mostrarFormulario = modo === 'nueva' && !cargando

  return (
    <div className="flex flex-col gap-4">
      {conSesion && cargando && (
        <p data-testid="sn-checkout-direccion-cargando" role="status" className="m-0 flex items-center gap-2 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          Cargando tus direcciones…
        </p>
      )}

      {/* D-F3-30 (2): `ui/GrupoOpciones` tal cual: fieldset `sn-checkout-direccion-guardada`, `sn-opcion-<direccion_id>` y `sn-opcion-otra`.
          Deshabilitada solo si hoy no se puede elegir (`DireccionEntrega.tsx:211-213, 227`) y el motivo de hoy (:247) en el detalle.
          La opción elegida va terra con texto blanco: los colores de adentro se heredan. */}
      {hayGuardadas && (
        <GrupoOpciones
          leyenda="¿Dónde recibes tu pedido?"
          nombre="sn-checkout-direccion"
          testId="sn-checkout-direccion-guardada"
          valor={modo === 'nueva' ? 'otra' : modo === 'guardada' && direccionIdElegida ? direccionIdElegida : undefined}
          onCambio={(v) => (v === 'otra' ? onUsarOtra() : onElegirGuardada(v))}
          opciones={[
            ...direcciones.map((d) => {
              const estado = cobertura[cpDeDireccion(d)]?.estado ?? 'error'
              const habilitada = estado === 'si'
              return {
                valor: d.id,
                deshabilitada: !habilitada,
                etiqueta: (
                  <span className="flex flex-wrap items-center gap-2">
                    {d.nombre_direccion}
                    {d.es_principal && (
                      <span className="rounded-sn-pildora border border-solid border-current px-2 py-0.5 text-sn-cuerpo-xs font-normal">Principal</span>
                    )}
                  </span>
                ),
                detalle: (
                  <>
                    <span className="block break-words">{textoDireccion(d)}</span>
                    {d.referencias && <span className="block break-words">Referencias: {d.referencias}</span>}
                    {!habilitada && (
                      <span className="mt-1 block font-medium">
                        {estado === 'no' ? 'Sin entrega en este CP' : 'No pudimos revisar la cobertura de este CP'}
                      </span>
                    )}
                  </>
                ),
              }
            }),
            { valor: 'otra', etiqueta: 'Usar otra dirección' },
          ]}
        />
      )}

      {/* Montado siempre (oculto con una guardada), como hoy */}
      <div data-testid="sn-checkout-direccion-nueva" hidden={!mostrarFormulario} className="flex flex-col gap-4">
        {conSesion && (
          <p className="m-0 font-sn-texto text-sn-cuerpo-xs text-sn-ink/70">
            {hayGuardadas
              ? 'La guardamos en tus direcciones para tu próxima compra.'
              : 'Aún no tienes direcciones guardadas: la que escribas se guarda para tu próxima compra.'}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <p id={idCp} className="m-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">
            Código postal y colonia *
          </p>
          <SelectorColonia zona={zonaNueva} onZona={onZonaNueva} idEtiqueta={idCp} />
          <p data-testid="sn-checkout-direccion-colonia" className="m-0 font-sn-texto text-sn-cuerpo-xs text-sn-ink">
            {zonaNueva
              ? `Colonia ${zonaNueva.colonia}, ${zonaNueva.municipio} · CP ${zonaNueva.codigo_postal}`
              : 'Elige tu código postal y tu colonia: así sabemos si llegamos.'}
          </p>
        </div>
        <Campo
          etiqueta="Calle *"
          id="sn-checkout-calle"
          testId="sn-checkout-direccion-calle"
          value={campos.calle}
          onChange={(e) => onCampo('calle', e.target.value)}
          placeholder="Nombre de la calle"
          maxLength={MAX.calle}
          autoComplete="address-line1"
          requerido
        />
        <div className="grid grid-cols-2 gap-4">
          <Campo
            etiqueta="Número exterior *"
            id="sn-checkout-exterior"
            testId="sn-checkout-direccion-exterior"
            value={campos.numero_exterior}
            onChange={(e) => onCampo('numero_exterior', e.target.value)}
            maxLength={MAX.numero_exterior}
            autoComplete="off"
            requerido
            className="min-w-0"
          />
          <Campo
            etiqueta="Número interior"
            id="sn-checkout-interior"
            testId="sn-checkout-direccion-interior"
            value={campos.numero_interior}
            onChange={(e) => onCampo('numero_interior', e.target.value)}
            placeholder="Depto., casa (opcional)"
            maxLength={MAX.numero_interior}
            autoComplete="address-line2"
            className="min-w-0"
          />
        </div>
        <Campo
          etiqueta="Referencias para el repartidor"
          tipo="textarea"
          filas={2}
          id="sn-checkout-referencias"
          testId="sn-checkout-direccion-referencias"
          value={campos.referencias}
          onChange={(e) => onCampo('referencias', e.target.value)}
          placeholder="Entre calles, color de la fachada… (opcional)"
          maxLength={MAX.referencias}
        />
        {conSesion && (
          <Campo
            etiqueta="Nombre (Casa, Oficina)"
            id="sn-checkout-nombre-direccion"
            testId="sn-checkout-direccion-nombre"
            value={campos.nombre_direccion}
            onChange={(e) => onCampo('nombre_direccion', e.target.value)}
            placeholder="Opcional"
            maxLength={MAX.nombre_direccion}
            autoComplete="off"
          />
        )}
      </div>

      {error && (
        <AvisoEnLinea tono="error" testId="sn-checkout-direccion-error">
          {error}
        </AvisoEnLinea>
      )}
    </div>
  )
}
