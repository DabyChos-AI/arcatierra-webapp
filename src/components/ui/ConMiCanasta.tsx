'use client'

import { Package, Check } from 'lucide-react'
import { formatFechaMexico } from '@/lib/dates'

/**
 * Extras de una suscripción que viajan con la canasta (SU2, opción A — decisión de David, 2026-09-29).
 *
 * El cliente paga los extras en el checkout de siempre y llegan el día de su próxima canasta:
 * envío gratis, sin cupones, y se puede hasta 2 días hábiles antes de la entrega. El backend
 * (`services/extras_suscripcion.py`) decide todo eso; aquí solo se ofrece la opción.
 * Reemplaza al botón «¿Tienes suscripción activa?», que metía los extras sin cobrarlos.
 */
export interface CanastaExtras {
  suscripcion_id: string
  nombre_suscripcion: string
  tipo_entrega: 'envio_domicilio' | 'recoger_almacen'
  entrega_id: string
  folio: string
  fecha_entrega: string
  ultimo_dia_para_pagar: string
  abierta: boolean
}

interface Props {
  canastas: CanastaExtras[]
  seleccion: CanastaExtras | null
  onChange: (canasta: CanastaExtras | null) => void
}

const largo: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }

export default function ConMiCanasta({ canastas, seleccion, onChange }: Props) {
  const abiertas = canastas.filter((c) => c.abierta)
  const cerradas = canastas.filter((c) => !c.abierta)
  if (abiertas.length === 0 && cerradas.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6" data-testid="con-canasta">
      <div className="flex items-center gap-2 text-amber-800 mb-2">
        <Package className="w-5 h-5" />
        <span className="font-semibold">Tienes una suscripción</span>
      </div>

      {abiertas.map((c) => {
        const elegida = seleccion?.entrega_id === c.entrega_id
        return (
          <button
            key={c.entrega_id}
            type="button"
            onClick={() => onChange(elegida ? null : c)}
            aria-pressed={elegida}
            data-testid="con-canasta-opcion"
            className={`w-full text-left rounded-lg border p-3 mb-2 transition-colors ${
              elegida ? 'border-[#33503E] bg-white' : 'border-amber-200 bg-amber-50 hover:bg-white'
            }`}
          >
            <span className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  elegida ? 'border-[#33503E] bg-[#33503E] text-white' : 'border-gray-400 bg-white'
                }`}
              >
                {elegida && <Check className="w-4 h-4" />}
              </span>
              <span>
                <span className="block font-medium text-gray-900">
                  Entregar con mi canasta del {formatFechaMexico(c.fecha_entrega, largo)}
                </span>
                <span className="block text-sm text-gray-600">
                  Envío gratis · se paga hoy · puedes agregar hasta el{' '}
                  {formatFechaMexico(c.ultimo_dia_para_pagar, largo)}
                </span>
              </span>
            </span>
          </button>
        )
      })}

      {abiertas.length === 0 &&
        cerradas.map((c) => (
          <p key={c.entrega_id} className="text-sm text-amber-800" data-testid="con-canasta-cerrada">
            Ya cerró el plazo para agregar a tu canasta del {formatFechaMexico(c.fecha_entrega, largo)}:
            se paga a más tardar 2 días hábiles antes. Puedes comprar con envío normal.
          </p>
        ))}
    </div>
  )
}
