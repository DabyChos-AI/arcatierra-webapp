// R15 · F2 (WF2, sesión 55) · sección 3: «Comida real, directo a tu puerta.» con las 3 puertas (maqueta `.banner-3p-v7`) hacia
// las pestañas de la tienda nueva (C24). Componente de servidor.
// - 01 «Compra suelto»: desde = el producto suelto más barato en venta (GET /api/products), nunca el «$45» de la maqueta.
// - 02 «Canasta lista»: desde = el plan más barato de GET /api/subscriptions/planes. Sin la pastilla «Más popular» (P2): no hay
//   un dato que diga cuál se vende más; si Arca Tierra la quiere, es una línea (`etiquetaDestacada`).
// - 03 «Agrega extras a tu canasta» (C8/C12, David): NO «Canasta a tu medida». Su texto falta (marca, Diseñadora).
// - La API sin respuesta → «Sin respuesta de la API» en el precio (no es contenido que falte), como la muestra de F1.
import Link from 'next/link'
import Falta from '../Falta'
import TarjetaPuerta from '../TarjetaPuerta'
import { ENLACES_TIENDA } from '../enlaces'
import { precioVisible } from '../formato'
import { BAJADA, ETIQUETA, SECCION, TITULO } from './estilos'

function Precio({ prefijo, precio, sufijo = '' }: { prefijo: string; precio: number | null; sufijo?: string }) {
  if (precio === null) return <span data-sin-api="1">Sin respuesta de la API</span>
  return <>{`${prefijo} ${precioVisible(precio)}${sufijo}`}</>
}

export default function Puertas({ desdeSuelto, desdeCanasta }: { desdeSuelto: number | null; desdeCanasta: number | null }) {
  return (
    <section data-testid="sn-portada-puertas" className="py-sn-10 min-[861px]:py-sn-15">
      <div className={SECCION}>
        <div className="mb-sn-5 flex flex-col gap-sn-3 min-[861px]:mb-sn-8 min-[861px]:flex-row min-[861px]:items-end min-[861px]:justify-between">
          <div>
            <p className={`${ETIQUETA} mb-[14px]`}>Tienda</p>
            <h2 className={`${TITULO} max-w-[620px]`}>Comida real, directo a tu puerta.</h2>
          </div>
          <div className="flex flex-col gap-3">
            <p className={BAJADA}>
              Aunque se te olvide, recibes cada semana lo que necesitas. Como ir al súper, sin ir al súper, pero con mejores
              productos.
            </p>
            <Link
              href={ENLACES_TIENDA.colonia}
              data-testid="sn-portada-puertas-colonia"
              className="self-start font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra underline underline-offset-4 hover:text-sn-tinta"
            >
              ¿Llegamos a tu colonia? →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[861px]:grid-cols-3 min-[861px]:gap-[18px]">
          <TarjetaPuerta
            testid="sn-portada-puerta"
            numero="01"
            etiqueta="Probar primero"
            nombre="Compra suelto"
            descripcion="Sin compromiso. Pides lo que quieras esta semana, sin suscripción."
            precio={<Precio prefijo="desde" precio={desdeSuelto} />}
            href={ENLACES_TIENDA.suelto}
            fondo="azul"
          />
          <TarjetaPuerta
            testid="sn-portada-puerta"
            numero="02"
            etiqueta="Recibo cada semana"
            nombre="Canasta lista"
            // La maqueta agrega «Pausas o cancelas cuando quieras»: la pausa está apagada (SUB6, DR-9), así que no va.
            descripcion="Te llega curada por nosotros."
            precio={<Precio prefijo="desde" precio={desdeCanasta} />}
            href={ENLACES_TIENDA.canasta}
            fondo="terra"
          />
          <TarjetaPuerta
            testid="sn-portada-puerta"
            numero="03"
            etiqueta="Extras"
            nombre="Agrega extras a tu canasta"
            descripcion={
              <Falta
                que="texto de «Agrega extras a tu canasta» (la canasta no se arma: se le suman extras, C8)"
                quien="Diseñadora"
              />
            }
            precio={<Precio prefijo="canasta desde" precio={desdeCanasta} sufijo=" + extras" />}
            href={ENLACES_TIENDA.extras}
            fondo="durazno"
          />
        </div>
      </div>
    </section>
  )
}
