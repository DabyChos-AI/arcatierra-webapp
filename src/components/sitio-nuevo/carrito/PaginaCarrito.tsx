'use client'

// R15 · F3 v2 (carrito, sesión 61): `/carrito` del sitio nuevo (la página de la maqueta; hoy no existe: el carrito es el lateral
// `CartSidebar.tsx`). Contrato v2 §8-F3, D-F3-04, D-F3-13, D-F3-20; originales y medidas en f3/carrito-F3.md §1–§2.1.
// - Los datos son los del carrito de siempre (`arcaTierraCart`, src/lib/carrito.ts), con las funciones de hoy: quitar, cambiar la
//   cantidad, vaciar, limpiar las experiencias viejas. Ninguna llamada a la API: el precio y el apartado los corrige el checkout.
// - Los textos son los del carrito lateral de hoy; el envío sale de lib/envio.ts (nunca un número escrito, D-F3-12).
// - El carrito lateral de hoy no se abre desde aquí (D-F3-13): «Proceder al Pago» es una liga a /checkout.

import { useEffect, useState } from 'react'
import { CalendarDays, Minus, Plus, ShoppingCart } from 'lucide-react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import { FOCO_BOTON, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Encabezado from './Encabezado'
import { useCarritoLocal } from './useCarritoLocal'
import { conCantidad, dinero, fechaYHoraCorta, imagenDe, textoExperienciasQuitadas } from './reglas'
import {
  experienciasDelCarrito,
  guardarCarrito,
  leerCarrito,
  limpiarExperienciasViejas,
  quitarDelCarrito,
  vaciarCarrito,
  type ItemCarrito,
} from '@/lib/carrito'
import { calcularCostoEnvio, subtotalProductos as subtotalDeProductos, UMBRAL_ENVIO_GRATIS } from '@/lib/envio'
import { precioLegible } from '@/lib/precio'
import { esItemExperiencia, subtotalExperiencia, textoPersonas, TEXTO_SOLO_TARJETA } from '@/types/compra-experiencias'
import { TEXTO_PAGO_TIENDA } from '@/types/tienda'

const META = 'm-0 font-sn-mono text-[10.5px] leading-[1.55] tracking-[1.2px] uppercase text-sn-ink/70'
const NOMBRE = 'm-0 font-sn-titulos text-sn-h5 font-normal text-sn-ink'
const PRECIO = 'font-sn-titulos text-sn-h5 font-normal text-sn-ink'
const BOTON_CANTIDAD = unirClases(
  'flex h-8 w-8 items-center justify-center rounded-sn-pildora bg-transparent text-sn-ink hover:bg-sn-cream',
  FOCO_BOTON,
)
const QUITAR = unirClases(
  'bg-transparent p-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink/70 underline hover:text-sn-terra',
  FOCO_BOTON,
)

function Miniatura({ item, experiencia }: { item: ItemCarrito; experiencia: boolean }) {
  const imagen = imagenDe(item)
  const Icono = experiencia ? CalendarDays : ShoppingCart
  return (
    <div
      data-testid="sn-carrito-renglon-foto"
      className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-sn-cream p-2.5"
    >
      {imagen ? (
        <Foto src={imagen} alt={String(item.name ?? '')} proporcion="1/1" sizes="76px" redondeo="ninguno" />
      ) : (
        <Icono aria-hidden="true" className="h-8 w-8 text-sn-ink/70" strokeWidth={1.5} />
      )}
    </div>
  )
}

function RenglonProducto({ item }: { item: ItemCarrito }) {
  const nombre = String(item.name ?? '')
  const precio = Number(item.price) || 0
  const cantidad = Number(item.quantity) || 0
  const unidad = typeof item.unit === 'string' ? item.unit : null
  // `CartSidebar.tsx:113-119`: en 0 se quita el renglón (y el apartado, que ya no corresponde).
  const cambiar = (nueva: number) => {
    if (nueva <= 0) {
      quitarDelCarrito(item.id)
      return
    }
    guardarCarrito(conCantidad(leerCarrito(), item.id, nueva))
  }
  return (
    <li
      data-testid="sn-carrito-renglon"
      data-tipo="producto"
      data-id={item.id}
      className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-[18px] rounded-[12px] border border-solid border-sn-border bg-white p-[18px]"
    >
      <Miniatura item={item} experiencia={false} />
      <div className="min-w-0">
        <h2 data-testid="sn-carrito-renglon-nombre" className={unirClases(NOMBRE, 'mb-1 break-words')}>
          {nombre}
        </h2>
        <p data-testid="sn-carrito-renglon-meta" className={unirClases(META, 'mb-3')}>
          {precioLegible(precio, unidad)}
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-sn-pildora border border-solid border-sn-muted px-1 py-0.5">
          <button
            type="button"
            data-testid="sn-carrito-renglon-menos"
            aria-label={`Quitar uno de ${nombre}`}
            onClick={() => cambiar(cantidad - 1)}
            className={BOTON_CANTIDAD}
          >
            <Minus aria-hidden="true" className="h-4 w-4" />
          </button>
          <span data-testid="sn-carrito-renglon-cantidad" className="min-w-6 text-center font-sn-mono text-[13px] font-medium text-sn-ink">
            {cantidad}
          </span>
          <button
            type="button"
            data-testid="sn-carrito-renglon-mas"
            aria-label={`Agregar uno de ${nombre}`}
            onClick={() => cambiar(cantidad + 1)}
            className={BOTON_CANTIDAD}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-3">
        <span data-testid="sn-carrito-renglon-subtotal" className={PRECIO}>
          {dinero(precio * cantidad)}
        </span>
        <button
          type="button"
          data-testid="sn-carrito-renglon-quitar"
          aria-label={`Quitar ${nombre} del carrito`}
          onClick={() => quitarDelCarrito(item.id)}
          className={QUITAR}
        >
          Quitar
        </button>
      </div>
    </li>
  )
}

function RenglonExperiencia({ item }: { item: ItemCarrito }) {
  if (!esItemExperiencia(item)) return null
  return (
    <li
      data-testid="sn-carrito-renglon"
      data-tipo="experiencia"
      data-id={item.evento_id}
      className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-[18px] rounded-[12px] border border-solid border-sn-border bg-white p-[18px]"
    >
      <Miniatura item={item} experiencia />
      <div className="min-w-0">
        <h2 data-testid="sn-carrito-renglon-nombre" className={unirClases(NOMBRE, 'mb-1 break-words')}>
          {item.name}
        </h2>
        <p data-testid="sn-carrito-renglon-fecha" className={unirClases(META, 'mb-1')}>
          {fechaYHoraCorta(item)}
        </p>
        <p data-testid="sn-carrito-renglon-personas" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
          {textoPersonas(item.adultos, item.ninos)}
        </p>
        <p className="m-0 mt-1 font-sn-texto text-sn-cuerpo-xs text-sn-ink/70">Para cambiar personas, vuelve a elegir la fecha.</p>
      </div>
      <div className="flex flex-col items-end justify-between gap-3">
        <span data-testid="sn-carrito-renglon-subtotal" className={PRECIO}>
          {dinero(subtotalExperiencia(item))}
        </span>
        <button
          type="button"
          data-testid="sn-carrito-renglon-quitar"
          aria-label={`Quitar ${item.name} del carrito`}
          onClick={() => quitarDelCarrito(item.id)}
          className={QUITAR}
        >
          Quitar
        </button>
      </div>
    </li>
  )
}

function Resumen({ items }: { items: ItemCarrito[] }) {
  const experiencias = experienciasDelCarrito(items)
  const hayProductos = items.some((item) => !esItemExperiencia(item))
  const subtotalProductos = subtotalDeProductos(items)
  const subtotalExperiencias = experiencias.reduce((suma, exp) => suma + subtotalExperiencia(exp), 0)
  const envio = calcularCostoEnvio(subtotalProductos, 'envio_domicilio')
  // `CartSidebar.tsx:130-133`: el mismo texto que «Tu pedido» del checkout.
  const textoEnvio = !hayProductos ? 'Sin envío' : envio === 0 ? 'Gratis' : dinero(envio)
  const renglon = 'flex justify-between gap-3 py-2.5 font-sn-texto text-sn-cuerpo-sm text-sn-ink'

  return (
    <aside
      data-testid="sn-carrito-resumen"
      aria-labelledby="sn-carrito-resumen-titulo"
      className="rounded-sn-tarjeta border border-solid border-sn-border bg-white p-7 min-[861px]:sticky min-[861px]:top-[88px] min-[861px]:self-start"
    >
      <h2 id="sn-carrito-resumen-titulo" className="m-0 mb-[18px] font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-terra">
        Tu pedido
      </h2>
      <div data-testid="sn-carrito-resumen-subtotal" className={renglon}>
        <span>Subtotal</span>
        <span>{dinero(subtotalProductos + subtotalExperiencias)}</span>
      </div>
      <div data-testid="sn-carrito-resumen-envio" data-gratis={hayProductos && envio === 0 ? 'si' : 'no'} className={renglon}>
        <span>Envío</span>
        <span>{textoEnvio}</span>
      </div>
      {/* `CartSidebar.tsx:291-308`; el umbral sale de lib/envio.ts (D-F3-12). */}
      {subtotalProductos > 0 && subtotalProductos < UMBRAL_ENVIO_GRATIS && (
        <AvisoEnLinea tono="atencion" testId="sn-carrito-resumen-aviso" className="my-2">
          <span data-tipo="falta">Te faltan {dinero(UMBRAL_ENVIO_GRATIS - subtotalProductos)} en productos para envío GRATIS</span>
        </AvisoEnLinea>
      )}
      {subtotalProductos >= UMBRAL_ENVIO_GRATIS && (
        <AvisoEnLinea tono="exito" testId="sn-carrito-resumen-aviso" className="my-2">
          <span data-tipo="gratis">¡Felicidades! Tu envío es GRATIS</span>
        </AvisoEnLinea>
      )}
      {subtotalProductos === 0 && subtotalExperiencias > 0 && (
        <AvisoEnLinea tono="exito" testId="sn-carrito-resumen-aviso" className="my-2">
          <span data-tipo="experiencias">Las experiencias no tienen costo de envío</span>
        </AvisoEnLinea>
      )}
      <div
        data-testid="sn-carrito-resumen-total"
        className="mt-2.5 flex justify-between gap-3 border-0 border-t border-solid border-sn-border pb-2.5 pt-[18px] font-sn-titulos text-[26px] font-normal leading-[1.55] text-sn-ink"
      >
        <span>Total</span>
        <span>{dinero(subtotalProductos + subtotalExperiencias + envio)}</span>
      </div>
      <Boton href="/checkout" anchoCompleto flecha testId="sn-carrito-resumen-pagar" className="mt-[18px]">
        Proceder al Pago
      </Boton>
      <p data-testid="sn-carrito-resumen-pago" className="m-0 mt-3.5 text-center font-sn-mono text-[10.5px] leading-[1.55] tracking-[1.1px] uppercase text-sn-ink/70">
        {hayProductos ? TEXTO_PAGO_TIENDA : TEXTO_SOLO_TARJETA}
      </p>
      <div className="mt-3 flex justify-center">
        <Boton variante="texto" tamano="chico" testId="sn-carrito-resumen-vaciar" onClick={() => vaciarCarrito()}>
          Vaciar Carrito
        </Boton>
      </div>
    </aside>
  )
}

export default function PaginaCarrito() {
  const items = useCarritoLocal()
  const [quitadas, setQuitadas] = useState(0)

  // Renglones de experiencia de antes de la Fase 4 (sin evento_id): fuera, con aviso (`CartSidebar.tsx:96-101`).
  useEffect(() => {
    setQuitadas(limpiarExperienciasViejas())
  }, [])

  const aviso = quitadas > 0 && (
    <AvisoEnLinea tono="atencion" testId="sn-carrito-aviso-viejas" className="mb-6">
      {textoExperienciasQuitadas(quitadas)}
    </AvisoEnLinea>
  )

  if (items === null) {
    return (
      <main data-testid="sn-carrito" className="min-h-[60vh]">
        <div data-testid="sn-carrito-cargando" aria-busy="true" className="min-h-[60vh] bg-sn-warm" />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main data-testid="sn-carrito">
        <Encabezado titulo="Tu carrito está vacío" texto="Agrega productos para comenzar" testId="sn-carrito-vacio" />
        <div className="mx-auto max-w-[680px] px-10 pb-24 pt-12 text-center">
          {aviso}
          <ShoppingCart aria-hidden="true" className="mx-auto mb-7 h-16 w-16 text-sn-ink opacity-35" strokeWidth={1.25} />
          <div className="flex flex-wrap justify-center gap-3">
            <Boton href="/tienda" forma="recta" flecha testId="sn-carrito-vacio-tienda">
              Ir a la tienda
            </Boton>
            <Boton href="/experiencias" variante="contorno" sobreCrema testId="sn-carrito-vacio-experiencias">
              Ver todas las experiencias
            </Boton>
          </div>
        </div>
      </main>
    )
  }

  const experiencias = items.filter(esItemExperiencia)
  const productos = items.filter((item) => !esItemExperiencia(item))
  return (
    <main data-testid="sn-carrito">
      <Encabezado titulo="Carrito" />
      <Contenedor className="py-8 min-[861px]:py-12">
        {aviso}
        <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[1.5fr_1fr]">
          <ul data-testid="sn-carrito-lista" className="m-0 flex list-none flex-col gap-3 p-0">
            {experiencias.map((item) => (
              <RenglonExperiencia key={item.id} item={item} />
            ))}
            {productos.map((item) => (
              <RenglonProducto key={item.id} item={item} />
            ))}
          </ul>
          <Resumen items={items} />
        </div>
      </Contenedor>
    </main>
  )
}
