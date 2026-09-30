'use client'

/**
 * Reloj del apartado de lugares (D13-8, F4 de EXP-FASE4-CONTRATO, sesión 39).
 *
 * Cuenta hacia atrás desde `venceLocalMs` = el momento en que llegó el apartado + `segundos_restantes` que mandó el
 * servidor (`ApartadoGuardado.vence_local_ms`). No compara `vence_en` con el reloj de la computadora del cliente:
 * si ese reloj está adelantado o atrasado, el reloj de la pantalla seguiría diciendo lo que dijo el servidor.
 *
 * `onVencido` se llama UNA vez cuando llega a 00:00.
 */
import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'
import {
  CLAVE_APARTADO,
  TEXTO_APARTADO,
  firmaCarritoExperiencias,
  relojApartado,
  type Apartado,
  type ApartadoGuardado,
} from '@/types/compra-experiencias'

// ─── El apartado guardado (sessionStorage CLAVE_APARTADO) ─────────────────────────────────────────────────────
// Lo leen el checkout y /checkout/failure|pending. `olvidarApartado()` vive en lib/carrito (lo llama al cambiar
// el carrito).

export function leerApartadoGuardado(): ApartadoGuardado | null {
  if (typeof window === 'undefined') return null
  try {
    const a = JSON.parse(window.sessionStorage.getItem(CLAVE_APARTADO) || 'null')
    if (a && typeof a.id === 'string' && typeof a.firma === 'string' && typeof a.vence_local_ms === 'number') {
      return a as ApartadoGuardado
    }
  } catch {
    /* sessionStorage bloqueado o JSON roto: como si no hubiera apartado */
  }
  return null
}

/** Guarda el apartado que acaba de dar el servidor, atado a las experiencias del carrito que se apartaron. */
export function guardarApartado(apartado: Apartado, items: unknown[]): ApartadoGuardado {
  const guardado: ApartadoGuardado = {
    ...apartado,
    firma: firmaCarritoExperiencias(items),
    // Desde `segundos_restantes`, no desde `vence_en`: el reloj del cliente puede estar mal.
    vence_local_ms: Date.now() + Math.max(0, apartado.segundos_restantes) * 1000,
  }
  try {
    window.sessionStorage.setItem(CLAVE_APARTADO, JSON.stringify(guardado))
  } catch {
    /* sin sessionStorage el apartado vive solo en la pantalla */
  }
  return guardado
}

/** El apartado guardado si sigue vigente y es de ESTE carrito (misma firma); si no, null. */
export function apartadoVigente(items: unknown[]): ApartadoGuardado | null {
  const a = leerApartadoGuardado()
  if (!a || a.firma !== firmaCarritoExperiencias(items) || a.vence_local_ms <= Date.now()) return null
  return a
}

/** «19:45»: hasta cuándo siguen apartados los lugares, en hora de México. */
export function horaVenceApartado(a: Pick<Apartado, 'vence_en'>): string {
  return formatFechaHoraMexico(a.vence_en, { year: undefined, month: undefined, day: undefined, hour12: false })
}

interface RelojApartadoProps {
  /** `ApartadoGuardado.vence_local_ms` */
  venceLocalMs: number
  onVencido: () => void
}

function segundosQueQuedan(venceLocalMs: number): number {
  return Math.max(0, Math.ceil((venceLocalMs - Date.now()) / 1000))
}

export default function RelojApartado({ venceLocalMs, onVencido }: RelojApartadoProps) {
  const [segundos, setSegundos] = useState(() => segundosQueQuedan(venceLocalMs))
  // El padre puede pasar una función nueva en cada render: el intervalo no se reinicia por eso.
  const onVencidoRef = useRef(onVencido)
  useEffect(() => {
    onVencidoRef.current = onVencido
  }, [onVencido])

  useEffect(() => {
    let avisado = false
    const tic = () => {
      const s = segundosQueQuedan(venceLocalMs)
      setSegundos(s)
      if (s <= 0 && !avisado) {
        avisado = true
        onVencidoRef.current()
      }
    }
    tic()
    const id = window.setInterval(tic, 1000)
    return () => window.clearInterval(id)
  }, [venceLocalMs])

  const [antes, despues] = TEXTO_APARTADO.split('{reloj}')

  return (
    <div
      data-testid="apartado-reloj"
      role="timer"
      aria-live="polite"
      className="flex items-start gap-3 rounded-lg border border-amarillo bg-amarillo-bg p-4 text-sm text-verde-tipografia"
    >
      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
      <p className="min-w-0">
        {antes}
        <strong className="font-bold tabular-nums text-terracota" data-testid="apartado-reloj-tiempo">
          {relojApartado(segundos)}
        </strong>
        {despues}
      </p>
    </div>
  )
}
