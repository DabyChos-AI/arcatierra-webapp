'use client'

// R15 · F1 (WF1, sesión 54): el «+» de la tarjeta de producto de la maqueta (`.product-add-btn`). Agrega UNA pieza al MISMO
// carrito de hoy con el MISMO renglón que arma la tienda (`addToCart` de src/app/tienda/page.tsx: id = itemcode de la base,
// itemcode, name, price = precio_unitario, quantity, image, unit, tipo 'producto'); si ya está, suma. Guarda con
// `guardarCarrito()` (dispara `cartUpdated`: la cabecera y el carrito lateral se enteran). Solo productos sueltos en venta:
// las canastas tienen su propia compra y no pasan por aquí.
import { useState } from 'react'
import { guardarCarrito, leerCarrito, type ItemCarrito } from '@/lib/carrito'

type Props = {
  itemcode: string
  nombre: string
  precio: number
  imagen: string | null
  unidad: string | null
}

export default function AgregarAlCarrito({ itemcode, nombre, precio, imagen, unidad }: Props) {
  const [aviso, setAviso] = useState('')

  const agregar = () => {
    const carrito = leerCarrito()
    const i = carrito.findIndex((item) => item.id === itemcode)
    if (i >= 0) {
      const actual = Number(carrito[i].quantity) || 0
      carrito[i] = { ...carrito[i], quantity: actual + 1 }
    } else {
      const renglon: ItemCarrito = {
        id: itemcode,
        itemcode,
        name: nombre,
        price: precio,
        quantity: 1,
        image: imagen ?? '',
        unit: unidad ?? '',
        tipo: 'producto',
      }
      carrito.push(renglon)
    }
    guardarCarrito(carrito)
    setAviso(`Se agregó ${nombre} a tu canasta.`)
  }

  return (
    <>
      <button
        type="button"
        data-testid="sn-tarjeta-producto-agregar"
        aria-label={`Agregar ${nombre} a tu canasta`}
        onClick={agregar}
        className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sn-terra pb-[3px] font-sn-texto text-lg font-medium leading-none text-sn-calido shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-sn-tinta"
      >
        <span aria-hidden="true">+</span>
      </button>
      <span role="status" className="sr-only">
        {aviso}
      </span>
    </>
  )
}
