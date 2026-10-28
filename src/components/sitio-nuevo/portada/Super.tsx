// R15 · F2 (WF2, sesión 55) · sección 5: «El súper sin ir al súper.» con productos reales de GET /api/products (los marcados
// como destacados en el panel o, si no hay, los primeros en venta por nombre: leerProductosMuestra de F1) en la tarjeta de F1,
// cuyo «+» es AgregarAlCarrito (el mismo store y CartSidebar de hoy). Componente de servidor.
import Link from 'next/link'
import type { MuestraProductos } from '@/lib/sitio-nuevo-contenido'
import TarjetaProducto from '../TarjetaProducto'
import { ENLACES_TIENDA } from '../enlaces'
import { BAJADA, PASTILLA, SECCION, SIN_API, TITULO } from './estilos'

export default function Super({ productos }: { productos: MuestraProductos | null }) {
  return (
    <section
      data-testid="sn-portada-super"
      data-estado={productos === null ? 'sin-api' : productos.productos.length === 0 ? 'vacio' : 'ok'}
      data-origen={productos?.origen}
      className="py-sn-10 min-[861px]:py-sn-15"
    >
      <div className={SECCION}>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className={TITULO}>El súper sin ir al súper.</h2>
          <Link href={ENLACES_TIENDA.toda} data-testid="sn-portada-super-ver-todo" className={PASTILLA}>
            Ver todo <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className={`${BAJADA} mb-sn-5`}>Mejor calidad que el súper, a un precio comparable. Directo de quien lo produce.</p>
        {productos === null ? (
          <p role="status" data-sin-api="1" className={SIN_API}>
            No se pudieron leer los productos de la API en este momento. Recarga la página en un minuto.
          </p>
        ) : productos.productos.length === 0 ? (
          <p role="status" className={SIN_API}>
            No hay productos en venta por ahora.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-sn-4 min-[1100px]:grid-cols-4 min-[1100px]:gap-5">
            {productos.productos.map((p, i) => (
              <TarjetaProducto key={p.itemcode} {...p} indice={i} />
            ))}
          </div>
        )}
        <div className="mt-sn-6 flex justify-center">
          <Link href={ENLACES_TIENDA.toda} data-testid="sn-portada-super-tienda" className={PASTILLA}>
            Ver toda la tienda <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
