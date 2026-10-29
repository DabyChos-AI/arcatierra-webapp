'use client'

// R15 v2 · F1: cuántas piezas lleva el carrito de siempre (localStorage `arcaTierraCart` + el evento `cartUpdated`, src/lib/carrito.ts),
// igual que lo cuenta la cabecera de hoy (TransparentHeader.tsx): la suma de las cantidades.
// Una tienda externa de React: el servidor y la hidratación ven 0 (sin diferencia de hidratación) y React vuelve a pintar con el conteo
// del navegador; se vuelve a leer con `cartUpdated` y con `storage` (otra pestaña cambió el carrito).
import { useSyncExternalStore } from 'react'
import { leerCarrito } from '@/lib/carrito'

const EVENTOS = ['cartUpdated', 'storage'] as const

function suscribir(avisar: () => void): () => void {
  for (const evento of EVENTOS) window.addEventListener(evento, avisar)
  return () => {
    for (const evento of EVENTOS) window.removeEventListener(evento, avisar)
  }
}

function piezasEnElNavegador(): number {
  let piezas = 0
  for (const { quantity } of leerCarrito()) {
    if (typeof quantity === 'number' && Number.isFinite(quantity)) piezas += quantity
  }
  return piezas
}

const ningunaEnElServidor = () => 0

export function useConteoCarrito(): number {
  return useSyncExternalStore(suscribir, piezasEnElNavegador, ningunaEnElServidor)
}
