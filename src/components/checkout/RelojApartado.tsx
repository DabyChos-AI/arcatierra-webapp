'use client'

/**
 * Reloj del apartado de lugares (D13-8, F4 de EXP-FASE4-CONTRATO, sesión 39).
 *
 * Cuenta hacia atrás desde `venceLocalMs` = el momento en que llegó el apartado + `segundos_restantes` que mandó el
 * servidor (`ApartadoGuardado.vence_local_ms`). No compara `vence_en` con el reloj de la computadora del cliente:
 * si ese reloj está adelantado o atrasado, el reloj de la pantalla seguiría diciendo lo que dijo el servidor.
 *
 * `onVencido` se llama UNA vez cuando llega a 00:00.
 *
 * R2 (sesión 42): el apartado también es de los productos (DR7). La firma es la del carrito COMPLETO
 * (`firmaCarrito` de lib/carrito: productos con su cantidad + experiencias) y las alergias viajan con él (AP2).
 */
import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { formatFechaHoraMexico } from '@/lib/dates'
import { firmaCarrito } from '@/lib/carrito'
import {
  CLAVE_APARTADO,
  TEXTO_APARTADO,
  esItemExperiencia,
  relojApartado,
  type Apartado,
  type ApartadoGuardado,
} from '@/types/compra-experiencias'

// ─── El apartado guardado (sessionStorage CLAVE_APARTADO) ─────────────────────────────────────────────────────
// Lo leen el checkout y /checkout/failure|pending. `olvidarApartado()` vive en lib/carrito (lo llama al cambiar
// el carrito).

/** Alergias por `evento_id` (AP2): se guardan con el apartado para que vuelvan al regresar de MercadoPago con «atrás». */
export type AlergiasPorFecha = Record<string, string>

/** Lo que de verdad vive en sessionStorage: el apartado + las alergias que el cliente ya escribió. */
export type ApartadoConAlergias = ApartadoGuardado & { alergias?: AlergiasPorFecha }

function soloTextos(valor: unknown): AlergiasPorFecha {
  const limpio: AlergiasPorFecha = {}
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
    for (const [llave, texto] of Object.entries(valor as Record<string, unknown>)) {
      if (typeof texto === 'string') limpio[llave] = texto
    }
  }
  return limpio
}

function escribir(guardado: ApartadoConAlergias): void {
  try {
    window.sessionStorage.setItem(CLAVE_APARTADO, JSON.stringify(guardado))
  } catch {
    /* sin sessionStorage el apartado vive solo en la pantalla */
  }
}

export function leerApartadoGuardado(): ApartadoConAlergias | null {
  if (typeof window === 'undefined') return null
  try {
    const a = JSON.parse(window.sessionStorage.getItem(CLAVE_APARTADO) || 'null')
    if (a && typeof a.id === 'string' && typeof a.firma === 'string' && typeof a.vence_local_ms === 'number') {
      return { ...(a as ApartadoGuardado), alergias: soloTextos(a.alergias) }
    }
  } catch {
    /* sessionStorage bloqueado o JSON roto: como si no hubiera apartado */
  }
  return null
}

/** Guarda el apartado que acaba de dar el servidor, atado al carrito (productos y experiencias) que se apartó. */
export function guardarApartado(apartado: Apartado, items: unknown[], alergias: AlergiasPorFecha = {}): ApartadoConAlergias {
  const guardado: ApartadoConAlergias = {
    id: apartado.id,
    vence_en: apartado.vence_en,
    segundos_restantes: apartado.segundos_restantes,
    firma: firmaCarrito(items),
    // Desde `segundos_restantes`, no desde `vence_en`: el reloj del cliente puede estar mal.
    vence_local_ms: Date.now() + Math.max(0, apartado.segundos_restantes) * 1000,
    alergias: soloTextos(alergias),
  }
  escribir(guardado)
  return guardado
}

/** AP2: actualiza las alergias del apartado guardado (antes de ir a MercadoPago). Sin apartado no hace nada. */
export function guardarAlergiasDelApartado(alergias: AlergiasPorFecha): void {
  const a = leerApartadoGuardado()
  if (a) escribir({ ...a, alergias: soloTextos(alergias) })
}

/** El apartado guardado si sigue vigente y es de ESTE carrito (misma firma); si no, null. */
export function apartadoVigente(items: unknown[]): ApartadoConAlergias | null {
  const a = leerApartadoGuardado()
  if (!a || a.firma !== firmaCarrito(items) || a.vence_local_ms <= Date.now()) return null
  return a
}

/** Qué trae el carrito, para elegir los textos del apartado (`textoApartado*` de types/tienda). */
export function contenidoDelCarrito(items: unknown[]): { hayExperiencias: boolean; hayProductos: boolean } {
  return { hayExperiencias: items.some(esItemExperiencia), hayProductos: items.some((i) => !esItemExperiencia(i)) }
}

/** «19:45»: hasta cuándo siguen apartados los lugares, en hora de México. */
export function horaVenceApartado(a: Pick<Apartado, 'vence_en'>): string {
  return formatFechaHoraMexico(a.vence_en, { year: undefined, month: undefined, day: undefined, hour12: false })
}

interface RelojApartadoProps {
  /** `ApartadoGuardado.vence_local_ms` */
  venceLocalMs: number
  onVencido: () => void
  /** Texto con `{reloj}` (mm:ss): `textoApartado()` de types/tienda. Por omisión el de experiencias («Tus lugares…»). */
  texto?: string
}

function segundosQueQuedan(venceLocalMs: number): number {
  return Math.max(0, Math.ceil((venceLocalMs - Date.now()) / 1000))
}

export default function RelojApartado({ venceLocalMs, onVencido, texto = TEXTO_APARTADO }: RelojApartadoProps) {
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

  const [antes, despues] = texto.split('{reloj}')

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
