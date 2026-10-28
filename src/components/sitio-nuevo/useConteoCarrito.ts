'use client'

// R15 · F1 (WF1, sesión 54): cuántas piezas hay en el carrito, del MISMO carrito de hoy (src/lib/carrito.ts: localStorage
// `arcaTierraCart` + el evento `cartUpdated`). Suma `quantity` igual que el encabezado de hoy (TransparentHeader).
// Arranca en 0 en el servidor y en el primer render del navegador (sin hidratación distinta) y se lee en un efecto.
import { useEffect, useRef, useState } from 'react'
import { leerCarrito } from '@/lib/carrito'
import { CLAVE_CARRITO } from '@/types/compra-experiencias'

function contar(): number {
  // La misma cuenta que TransparentHeader: solo `quantity` numérica.
  return leerCarrito().reduce((suma, item) => {
    const n = item.quantity
    return suma + (typeof n === 'number' && !Number.isNaN(n) ? n : 0)
  }, 0)
}

/** `{ conteo, salto }`: `salto` es true ~300 ms cuando el número sube (el «bump» de la maqueta). */
export function useConteoCarrito(): { conteo: number; salto: boolean } {
  const [conteo, setConteo] = useState(0)
  const [salto, setSalto] = useState(false)
  const anterior = useRef<number | null>(null)

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined
    const leer = () => {
      const n = contar()
      // El primer conteo (al montar) no salta: solo cuando la persona agrega algo.
      if (anterior.current !== null && n > anterior.current) {
        setSalto(true)
        clearTimeout(temporizador)
        temporizador = setTimeout(() => setSalto(false), 300)
      }
      anterior.current = n
      setConteo(n)
    }
    leer()
    const enOtraPestana = (e: StorageEvent) => {
      if (e.key === null || e.key === CLAVE_CARRITO) leer()
    }
    window.addEventListener('cartUpdated', leer)
    window.addEventListener('storage', enOtraPestana)
    return () => {
      clearTimeout(temporizador)
      window.removeEventListener('cartUpdated', leer)
      window.removeEventListener('storage', enOtraPestana)
    }
  }, [])

  return { conteo, salto }
}
