'use client'

// R15 v2 · F4 (sesión 62): las próximas fechas de una experiencia pública en su ficha del sitio nuevo y el selector de la elegida. Contrato
// v2 §9-F4 D-F4-12 P-8 (en la página, sin el modal ni «Reservar Ahora»: la compra se conserva), D-F4-13; experiencias-F4.md §3.2.
// Textos de hoy de la ficha (src/app/experiencias/[slug]/page.tsx:385-390, :885, :895-943): «Buscando fechas...», «Elige una fecha:»,
// «← Otras fechas», «No hay fechas a la venta en línea.» (o el error del feed) y «Reservar por WhatsApp». Cada fecha: la fecha larga, el
// horario, el precio que se cobra y su disponibilidad con los textos de hoy.
import { useState } from 'react'
import { formatFechaMexico } from '@/lib/dates'
import { linkWhatsApp } from '@/lib/whatsapp'
import { horario } from '@/app/admin/eventos/components/fechas'
import { formatMXN } from '@/types/reservas'
import type { FechaPublica } from '@/types/compra-experiencias'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import { FOCO } from '@/components/sitio-nuevo/ui/clases'
import ElegirFecha from './ElegirFecha'
import { textoDisponibilidad } from './experiencias'

const FECHA_LARGA: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
/** El texto de hoy cuando el feed no responde ([slug]/page.tsx:389). */
export const TEXTO_ERROR_FECHAS = 'No pudimos cargar las fechas. Intenta de nuevo en un momento o escríbenos por WhatsApp.'

type Props = {
  /** null = buscando; 'error' = el feed no respondió; o las fechas de esta experiencia. */
  fechas: FechaPublica[] | 'error' | null
  nombreExperiencia: string
  imagen?: string
}

export default function FechasFicha({ fechas, nombreExperiencia, imagen }: Props) {
  const [elegida, setElegida] = useState<FechaPublica | null>(null)
  const estado = fechas === null ? 'cargando' : fechas === 'error' ? 'error' : fechas.length > 0 ? 'con-fechas' : 'sin-fechas'

  return (
    <div data-testid="sn-detalle-experiencia-fechas" data-estado={estado} className="space-y-3">
      {elegida ? (
        <>
          <button
            type="button"
            data-testid="sn-detalle-experiencia-otras-fechas"
            onClick={() => setElegida(null)}
            className={`min-h-6 bg-transparent p-0 font-sn-mono text-sn-boton-sm font-medium uppercase text-sn-terra hover:text-sn-ink ${FOCO}`}
          >
            ← Otras fechas
          </button>
          <ElegirFecha key={elegida.id} fecha={elegida} imagen={imagen} />
        </>
      ) : fechas === null ? (
        <Texto tamano="chico" peso="normal">
          Buscando fechas...
        </Texto>
      ) : fechas === 'error' || fechas.length === 0 ? (
        <div data-testid="sn-detalle-experiencia-sin-fechas" className="space-y-3">
          <Texto tamano="chico" peso="normal">
            {fechas === 'error' ? TEXTO_ERROR_FECHAS : 'No hay fechas a la venta en línea.'}
          </Texto>
          <Boton
            href={linkWhatsApp(`Hola, quiero reservar ${nombreExperiencia}`)}
            externo
            forma="recta"
            anchoCompleto
            testId="sn-detalle-experiencia-whatsapp"
          >
            Reservar por WhatsApp
          </Boton>
        </div>
      ) : (
        <>
          <Texto tamano="chico" peso="normal">
            Elige una fecha:
          </Texto>
          <ul className="m-0 list-none space-y-2 p-0">
            {fechas.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  data-testid="sn-detalle-experiencia-dia"
                  data-evento-id={f.id}
                  onClick={() => setElegida(f)}
                  className={`w-full rounded-sn-campo border border-solid border-sn-muted bg-white p-3 text-left font-sn-texto text-sn-ink transition-colors hover:border-sn-terra ${FOCO}`}
                >
                  <span className="block text-sn-cuerpo-sm font-medium">{formatFechaMexico(f.fecha_evento, FECHA_LARGA)}</span>
                  <span className="mt-0.5 flex items-baseline justify-between gap-3 text-sn-cuerpo-sm font-normal">
                    <span>{horario(f.hora_inicio, f.hora_fin)}</span>
                    <span className="shrink-0 font-medium">{f.precio_efectivo != null ? formatMXN(f.precio_efectivo) : ''}</span>
                  </span>
                  <span className="mt-0.5 block text-sn-cuerpo-xs font-normal">{textoDisponibilidad(f)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
