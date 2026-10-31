'use client'

// R15 · F3 v2 (carrito, sesión 61): el carrito de siempre (localStorage `arcaTierraCart` + el evento `cartUpdated`, src/lib/carrito.ts)
// como tienda externa de React, igual que `armazon/useConteoCarrito.ts`: el servidor y la hidratación ven `null` («cargando», sin
// diferencia de hidratación) y el navegador pinta el carrito real; se vuelve a leer con `cartUpdated` y con `storage` (otra pestaña).
// La foto que se compara es el TEXTO guardado (estable entre lecturas); los renglones salen de `leerCarrito()`.

import { useMemo, useSyncExternalStore } from 'react'
import { leerCarrito, type ItemCarrito } from '@/lib/carrito'
import { CLAVE_CARRITO } from '@/types/compra-experiencias'

const EVENTOS = ['cartUpdated', 'storage'] as const

function suscribir(avisar: () => void): () => void {
  for (const evento of EVENTOS) window.addEventListener(evento, avisar)
  return () => {
    for (const evento of EVENTOS) window.removeEventListener(evento, avisar)
  }
}

function textoGuardado(): string {
  try {
    return window.localStorage.getItem(CLAVE_CARRITO) ?? ''
  } catch {
    return ''
  }
}

const enElServidor = (): null => null

/** null = todavía no se lee el navegador (servidor e hidratación); si no, los renglones del carrito. */
export function useCarritoLocal(): ItemCarrito[] | null {
  const guardado = useSyncExternalStore(suscribir, textoGuardado, enElServidor)
  // `guardado` cambia solo cuando cambia el texto: los renglones se vuelven a leer entonces.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (guardado === null ? null : leerCarrito()), [guardado])
}
