import type { Metadata } from 'next'
import { connection } from 'next/server'
import Falta from '@/components/sitio-nuevo/Falta'
import TarjetaPuerta from '@/components/sitio-nuevo/TarjetaPuerta'
import TarjetaProducto from '@/components/sitio-nuevo/TarjetaProducto'
import TarjetaExperiencia from '@/components/sitio-nuevo/TarjetaExperiencia'
import Cifra from '@/components/sitio-nuevo/Cifra'
import { precioVisible } from '@/components/sitio-nuevo/formato'
import {
  CLAVES_CIFRAS,
  leerContenidoSitio,
  leerExperienciasMuestra,
  leerPrecioMinimoCanasta,
  leerPrecioMinimoSuelto,
  leerProductosMuestra,
} from '@/lib/sitio-nuevo-contenido'

// R15 · F0 (sesión 53) + F1 (sesión 54, contrato §9 C18), 28-oct-2026: página de muestra del link de revisión, en la dirección
// `/` (RUTAS_SITIO_NUEVO). No inventa nada: dice qué es, lo que falta (marca «FALTA · qué · quién», §4) y, debajo, muestra los
// componentes nuevos con datos reales de la API (productos y experiencias de la base, cifras de contenido_sitio) para revisarlos
// junto a la maqueta. La portada nueva (WF2) la reemplaza en F2.
//
// C18: sale la marca «decisión de las fuentes» (DR62: libres); «cifras con fuente» pasa a «cuáles son los 10 estados»; la del
// cotizador pasa a «si sus 5 tipos de evento reemplazan o se suman a los de la maqueta»; se quedan Nivel 1, maqueta corregida
// y fotos.

export const metadata: Metadata = {
  title: { absolute: 'Sitio nuevo de Arca Tierra · link de revisión' },
}

const SECCION = 'mx-auto w-full max-w-[1280px] px-6 min-[861px]:px-10'
const ETIQUETA = 'font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.8px] text-sn-terra'
const SUBTITULO = 'mb-2 font-sn-mono text-xs font-medium uppercase leading-[1.55] tracking-[1.4px] text-sn-terra'
const NOTA = 'mb-6 max-w-[640px] text-sm leading-[1.6] text-sn-tinta/80'

/** Un precio de la base, o el aviso de que la API no respondió (no es un faltante de contenido: no lleva marca). */
function PrecioDesde({ precio, prefijo }: { precio: number | null; prefijo: string }) {
  if (precio === null) return <span data-sin-api="1">Sin respuesta de la API</span>
  return (
    <>
      {prefijo} {precioVisible(precio)}
    </>
  )
}

function SinApi({ que }: { que: string }) {
  return (
    <p data-testid="sn-muestra-sin-api" role="status" className="rounded-sn-boton border border-sn-borde bg-white px-4 py-3 text-sm">
      No se pudieron leer {que} de la API en este momento. Recarga la página en un minuto.
    </p>
  )
}

export default async function SitioNuevoMuestra() {
  await connection()
  const [{ contenido }, productos, experiencias, desdeSuelto, desdeCanasta] = await Promise.all([
    leerContenidoSitio(),
    leerProductosMuestra(4),
    leerExperienciasMuestra(6),
    leerPrecioMinimoSuelto(),
    leerPrecioMinimoCanasta(),
  ])
  const clavesCifras = [
    ...CLAVES_CIFRAS,
    ...Object.keys(contenido.cifras).filter((c) => !(CLAVES_CIFRAS as readonly string[]).includes(c)),
  ]

  return (
    <main data-testid="sitio-nuevo-muestra" className="pb-sn-12">
      {/* ── Qué es esto y lo que falta ─────────────────────────────────────────────────────────────── */}
      <section className={`${SECCION} pb-sn-8 pt-sn-8 min-[861px]:pt-sn-12`}>
        <div className="max-w-3xl">
          <p className={`${ETIQUETA} mb-[18px]`}>Link de revisión</p>
          <h1 className="font-sn-titulos text-[40px] leading-none tracking-[-1.2px] text-sn-terra min-[861px]:text-[64px]">
            Sitio nuevo de Arca Tierra · link de revisión
          </h1>
          <p className="mt-6 text-base font-light leading-[1.65] text-sn-tinta/80">
            Aquí se va armando el sitio nuevo según la maqueta de la diseñadora. La portada nueva llega en la fase F2.
          </p>

          <h2 className="mt-sn-6 font-sn-titulos text-[28px] leading-[1.1] tracking-[-0.6px] text-sn-tinta min-[861px]:text-4xl">
            Lo que todavía falta para construirlo
          </h2>
          <ul data-testid="sitio-nuevo-faltantes" className="mt-4 list-disc space-y-3 pl-5 leading-relaxed marker:text-sn-terra">
            <li>
              <Falta
                que="visto bueno del Nivel 1 de la maqueta (cómo se compra, se reserva y se navega)"
                quien="Lucio y Pablo"
              />
            </li>
            <li>
              <Falta que="cuáles son los 10 estados" quien="Lucio y Pablo" />
            </li>
            <li>
              <Falta
                que="si sus 5 tipos de evento reemplazan o se suman a los de la maqueta"
                quien="Encargadas de Experiencias"
              />
            </li>
            <li>
              <Falta que="maqueta corregida: precios, fechas y textos" quien="Diseñadora" />
            </li>
          </ul>

          <div className="mt-sn-5">
            <Falta como="bloque" que="fotos de la portada" quien="Diseñadora" />
          </div>
        </div>
      </section>

      {/* ── Componentes del sitio nuevo, con datos reales ───────────────────────────────────────────── */}
      <section data-testid="sn-componentes" className="border-t border-sn-borde bg-sn-crema/40 pt-sn-10">
        <div className={SECCION}>
          <p className={`${ETIQUETA} mb-[14px]`}>Muestra</p>
          <h2 className="font-sn-titulos text-[36px] leading-none tracking-[-1px] text-sn-tinta min-[861px]:text-[56px]">
            Componentes del sitio nuevo
          </h2>
          <p className={`${NOTA} mt-4`}>
            Con datos reales de la base (productos, experiencias y precios) y del contenido publicado en el panel (cifras), para
            revisarlos junto a la maqueta. La cabecera, la cinta y el pie están arriba y abajo de esta página; el anuncio emergente
            sale al bajar una quinta parte de la página, una vez por sesión. En F2 se acomodan en la portada.
          </p>
        </div>

        {/* Tarjetas de 3 puertas */}
        <div data-testid="sn-muestra-puertas" className={`${SECCION} mt-sn-8`}>
          <h3 className={SUBTITULO}>Tarjetas de 3 puertas</h3>
          <p className={NOTA}>
            Precios «desde» de la base: el producto suelto más barato en venta y el plan de canasta más barato. La tercera puerta
            de la maqueta («Canasta a tu medida») no se construye (C8): su lugar es «Agrega extras a tu canasta» (C12, en F2).
          </p>
          <div className="grid grid-cols-1 gap-3 min-[861px]:grid-cols-3 min-[861px]:gap-[18px]">
            <TarjetaPuerta
              numero="01"
              etiqueta="Probar primero"
              nombre="Compra suelto"
              descripcion="Sin compromiso. Pides lo que quieras esta semana, sin suscripción."
              precio={<PrecioDesde prefijo="desde" precio={desdeSuelto} />}
              href="/tienda"
              fondo="azul"
            />
            <TarjetaPuerta
              numero="02"
              etiqueta="Recibo cada semana"
              nombre="Canasta lista"
              // La maqueta agrega «Pausas o cancelas cuando quieras»: la pausa está apagada (SUB6, DR-9), así que no va.
              descripcion="Te llega curada por nosotros."
              precio={<PrecioDesde prefijo="desde" precio={desdeCanasta} />}
              href="/suscripciones"
              fondo="terra"
            />
            <TarjetaPuerta
              numero="03"
              etiqueta="Extras"
              nombre="Agrega extras a tu canasta"
              descripcion={
                <Falta
                  que="texto de «Agrega extras a tu canasta» (la canasta no se arma: se le suman extras, C8)"
                  quien="Diseñadora"
                />
              }
              precio={<PrecioDesde prefijo="base" precio={desdeCanasta} />}
              href="/suscripciones"
              fondo="durazno"
            />
          </div>
        </div>

        {/* Tarjetas de producto */}
        <div data-testid="sn-muestra-productos" className={`${SECCION} mt-sn-10`}>
          <h3 className={SUBTITULO}>Tarjetas de producto</h3>
          {productos === null ? (
            <SinApi que="los productos" />
          ) : (
            <>
              <p className={NOTA} data-origen={productos.origen}>
                {productos.origen === 'destacados'
                  ? 'Los productos marcados como destacados en el panel, con su precio de la base.'
                  : 'No hay productos marcados como destacados: estos son los primeros en venta por nombre, con su precio de la base.'}{' '}
                El «+» agrega una pieza al carrito de siempre.
              </p>
              <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-4">
                {productos.productos.map((p, i) => (
                  <TarjetaProducto key={p.itemcode} {...p} indice={i} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tarjetas de experiencia */}
        <div data-testid="sn-muestra-experiencias" className={`${SECCION} mt-sn-10`}>
          <h3 className={SUBTITULO}>Tarjetas de experiencia</h3>
          {experiencias === null ? (
            <SinApi que="las experiencias" />
          ) : experiencias.length === 0 ? (
            <p className={NOTA}>No hay experiencias disponibles en la base.</p>
          ) : (
            <>
              <p className={NOTA}>
                Las experiencias disponibles de la base. En las públicas, la fecha y los lugares son de la próxima fecha que se vende
                en línea; las privadas dicen su precio por grupo.
              </p>
              <ul className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 min-[861px]:mx-0 min-[861px]:px-0">
                {experiencias.map((e, i) => (
                  <li key={e.id} className="w-[340px] max-w-[85vw] shrink-0 snap-start">
                    <TarjetaExperiencia {...e} indice={i} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Cifras publicadas */}
        <div data-testid="sn-muestra-cifras" className={`${SECCION} mt-sn-10 pb-sn-10`}>
          <h3 className={SUBTITULO}>Cifras publicadas</h3>
          <p className={NOTA}>
            Las cifras del panel (Contenido del sitio › Cifras) con su descripción. Las que no estén publicadas salen con la marca.
          </p>
          <div className="grid grid-cols-1 gap-x-sn-5 gap-y-sn-4 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-4">
            {clavesCifras.map((clave) => (
              <Cifra key={clave} clave={clave} cifra={contenido.cifras[clave]} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
