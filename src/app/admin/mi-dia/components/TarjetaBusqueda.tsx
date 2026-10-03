'use client'

// R9 (DR23, sesión 49): tarjeta de la reserva escaneada cuando NO está en tu Mi día (otro día, no asignada, cancelada,
// sin confirmar, cuenta sin ficha) o no existe. Solo folio, experiencia, fecha y hora: SIN nombre del cliente ni contacto
// (el backend no los manda cuando no es tuya). «Ver mi día» quita el parámetro `?reserva=` y la cierra.
// §9 C1-4: también sale, sin motivo, si la reserva SÍ es de tu día pero la lista cargada no la trae (`fuera_de_lista`).

import { Info, Loader2, ScanLine, AlertTriangle } from 'lucide-react'
import type { MiDiaBusqueda } from '@/types/mi-dia'
import { fechaLarga, horaCorta } from './textos'

export const TEXTO_NO_ENCONTRADA = 'No encontramos esa reserva.'

export type EstadoBusqueda =
  | { estado: 'cargando'; id: string }
  | { estado: 'listo'; id: string; datos: MiDiaBusqueda }
  | { estado: 'no_encontrada'; id: string }
  | { estado: 'error'; id: string; mensaje: string }

interface Props {
  busqueda: EstadoBusqueda
  /** Con `item`, pero la lista de ese día ya cargó sin la tarjeta: datos de arriba, sin motivo. */
  fueraDeLista?: boolean
  onCerrar: () => void
  onReintentar: () => void
}

export default function TarjetaBusqueda({ busqueda, fueraDeLista = false, onCerrar, onReintentar }: Props) {
  const datos = busqueda.estado === 'listo' ? busqueda.datos : null
  const resultado = busqueda.estado === 'listo' ? (fueraDeLista ? 'fuera_de_lista' : 'motivo') : busqueda.estado
  const motivo =
    busqueda.estado === 'listo'
      ? fueraDeLista
        ? null
        : datos?.motivo ?? null
      : busqueda.estado === 'no_encontrada'
        ? TEXTO_NO_ENCONTRADA
        : busqueda.estado === 'error'
          ? busqueda.mensaje
          : null
  const fecha = datos ? fechaLarga(datos.fecha) : ''
  const hora = datos ? horaCorta(datos.hora_inicio) : ''

  return (
    <section
      data-testid="midia-busqueda"
      data-resultado={resultado}
      aria-live="polite"
      className="rounded-xl border-2 border-terracota/40 bg-white p-4 shadow-soft"
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold text-terracota">
        <ScanLine className="h-4 w-4 shrink-0" aria-hidden="true" />
        Reserva escaneada
      </p>

      {busqueda.estado === 'cargando' ? (
        <p className="mt-3 flex items-center gap-2 text-base text-verde-tipografia" aria-busy="true">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-verde-suave" aria-hidden="true" />
          Buscando la reserva escaneada…
        </p>
      ) : (
        <>
          {datos && (
            <div className="mt-2 space-y-0.5">
              {datos.experiencia_nombre && (
                <h2
                  data-testid="midia-busqueda-experiencia"
                  className="mb-0 font-display text-xl leading-snug text-verde"
                >
                  {datos.experiencia_nombre}
                </h2>
              )}
              <p data-testid="midia-busqueda-folio" className="text-sm text-verde-suave">
                Folio {datos.booking_id}
              </p>
              {fecha && (
                <p
                  data-testid="midia-busqueda-fecha"
                  data-fecha={datos.fecha}
                  className="text-base text-verde-tipografia"
                >
                  {fecha}
                </p>
              )}
              {hora && (
                <p data-testid="midia-busqueda-hora" className="text-base font-semibold text-verde-tipografia">
                  {hora}
                </p>
              )}
            </div>
          )}

          {motivo && (
            <p
              data-testid="midia-busqueda-motivo"
              role={busqueda.estado === 'error' ? 'alert' : undefined}
              className={`mt-3 flex items-start gap-2 rounded-lg p-3 text-base ${
                busqueda.estado === 'error'
                  ? 'border border-rojo/30 bg-rojo-bg text-rojo'
                  : 'border border-amarillo/40 bg-amarillo-bg text-verde-tipografia'
              }`}
            >
              {busqueda.estado === 'error' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              ) : (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amarillo" aria-hidden="true" />
              )}
              <span>{motivo}</span>
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {busqueda.estado === 'error' && (
              <button
                type="button"
                data-testid="midia-busqueda-reintentar"
                onClick={onReintentar}
                className="min-h-[44px] rounded-lg bg-terracota px-4 text-base font-semibold text-white hover:bg-terracota-dark"
              >
                Reintentar
              </button>
            )}
            <button
              type="button"
              data-testid="midia-busqueda-cerrar"
              onClick={onCerrar}
              className="min-h-[44px] rounded-lg border border-neutro-borde bg-white px-4 text-base font-semibold text-verde hover:bg-neutro-light"
            >
              Ver mi día
            </button>
          </div>
        </>
      )}
    </section>
  )
}
