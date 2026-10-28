import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import Cifra from '@/components/sitio-nuevo/Cifra'
import Falta from '@/components/sitio-nuevo/Falta'
import TiendaCliente from '@/components/sitio-nuevo/tienda/TiendaCliente'
import { leerCanastas, leerCatalogo } from '@/components/sitio-nuevo/tienda/datos'
import { ID_PESTANAS } from '@/components/sitio-nuevo/tienda/tipos'
import { leerContenidoSitio } from '@/lib/sitio-nuevo-contenido'

// R15 · F2 (WF3, sesión 55, 28-oct-2026): la tienda nueva (`data-page="tienda"` de la maqueta), en la dirección pública
// `/tienda` del link de revisión (RUTAS_SITIO_NUEVO). La tienda de hoy (src/app/tienda) y /suscripciones no cambian.
// Orden de la maqueta: hero · «¿Llegamos a tu colonia?» · pestañas (Compra suelto · Canasta lista · Agrega extras) ·
// «Arca Tierra en números». Correcciones a la maqueta: sin «Arma la tuya» (C8), sin SPEI (DR7-b), sin «Ajustas cada
// semana» ni «Saltar» (DR-9), sin el sello «Esta semana» inventado, sin «entrega lunes 10am–6pm» (C7) y sin cifras
// escritas a mano (C9: salen de contenido_sitio). Todo dato de la base; lo que falta lleva la marca.
//
// Las llamadas a la API son las de hoy: catálogo y canastas en el servidor (datos.ts), y en el navegador las zonas
// (`/api/zonas-entrega/{cp}`), la primera entrega, el perfil, el alta (`POST /api/subscriptions/crear`) y los extras
// (`/api/subscriptions/extras-disponibles`) con los mismos caminos que hoy usan /suscripciones y /checkout.

export const metadata: Metadata = {
  title: { absolute: 'Tienda · Arca Tierra' },
  description: 'Compra suelto, elige tu canasta semanal o agrega extras a tu canasta. Entregas en tu colonia.',
}

const SECCION = 'mx-auto w-full max-w-[1280px] px-6 min-[861px]:px-10'
const BOTON =
  'inline-flex items-center justify-center rounded-sn-pildora px-6 py-3.5 font-sn-mono text-xs font-medium uppercase tracking-[1.3px] transition-colors'

/** Las 4 cifras del `.stats-rail` de la maqueta (60+ · ★ · 200 · 17), por clave de contenido_sitio. */
const CIFRAS_TIENDA = [
  { clave: 'familias', etiqueta: 'Red' },
  { clave: 'estrella_verde', etiqueta: 'Cocina' },
  { clave: 'colonias', etiqueta: 'Alcance' },
  { clave: 'anios', etiqueta: 'Trayectoria' },
] as const

export default async function TiendaNueva() {
  await connection()
  const [{ contenido }, catalogo, planes] = await Promise.all([leerContenidoSitio(), leerCatalogo(), leerCanastas()])

  return (
    <main data-testid="sn-tienda" className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────────────────────────────────────────── */}
      <section data-testid="sn-tienda-hero" className="bg-sn-crema/70">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 min-[861px]:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-sn-8 min-[861px]:px-14 min-[861px]:py-sn-12">
            <p className="mb-5 font-sn-mono text-[11px] font-medium uppercase tracking-[1.8px] text-sn-terra">Tienda</p>
            <h1 className="font-sn-titulos text-[48px] leading-[0.98] tracking-[-1.4px] text-sn-terra min-[861px]:text-[76px]">
              Comida real, directo a tu puerta.
            </h1>
            <p className="mt-6 max-w-[460px] text-base font-light leading-[1.65] text-sn-tinta/85">
              De la chinampa, sin súper. Pídelo suelto o recíbelo cada semana en tu canasta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/tienda?pestana=canasta#${ID_PESTANAS}`}
                data-testid="sn-tienda-hero-canasta"
                className={`${BOTON} bg-sn-terra text-sn-calido hover:bg-sn-tinta hover:text-sn-calido`}
              >
                Quiero mi canasta →
              </Link>
              <Link
                href={`/tienda?pestana=suelto#${ID_PESTANAS}`}
                data-testid="sn-tienda-hero-suelto"
                className={`${BOTON} border border-sn-tinta text-sn-tinta hover:bg-sn-tinta hover:text-sn-calido`}
              >
                Comprar suelto
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-sn-mono text-[11px] uppercase tracking-[1.2px] text-sn-tinta/75">
              <li>✓ Sin contratos</li>
              <li>✓ Cancelas cuando quieras</li>
            </ul>
          </div>
          <div className="relative flex min-h-[280px] items-stretch bg-sn-tinta/10 p-6 min-[861px]:min-h-[520px]">
            <Falta como="bloque" que="foto del hero de la tienda" quien="Diseñadora" />
            <div className="absolute bottom-10 right-10 max-w-[260px] rounded-sn-boton bg-sn-calido p-4 shadow-sn-anuncio">
              <p className="font-sn-mono text-[10px] font-medium uppercase tracking-[1.3px] text-sn-terra">Esta semana</p>
              <p className="mt-1 text-sm">
                <Falta que="qué viene esta semana (sello del hero)" quien="Lucio y Pablo" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Colonia + pestañas + alta (cliente) ──────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <TiendaCliente
          productos={catalogo ? catalogo.productos : null}
          categorias={catalogo ? catalogo.categorias : []}
          planes={planes}
        />
      </Suspense>

      {/* ── Arca Tierra en números (C9: contenido_sitio) ─────────────────────────────────────── */}
      <section data-testid="sn-tienda-numeros" className="border-t border-sn-borde py-sn-10 min-[861px]:py-sn-12">
        <div className={SECCION}>
          <p className="text-center font-sn-mono text-[11px] font-medium uppercase tracking-[1.8px] text-sn-terra">
            Arca Tierra en números
          </p>
          <h2 className="mx-auto mt-4 max-w-[820px] text-center font-sn-titulos text-[34px] leading-[1.08] tracking-[-0.8px] text-sn-terra min-[861px]:text-[48px]">
            Una red agroecológica.
          </h2>
          <div className="mt-sn-6 grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 min-[1100px]:grid-cols-4">
            {CIFRAS_TIENDA.map(({ clave, etiqueta }) => (
              <div key={clave} className="text-center">
                <p className="mb-2 font-sn-mono text-[10px] font-medium uppercase tracking-[1.4px] text-sn-terra">{etiqueta}</p>
                <Cifra clave={clave} cifra={contenido.cifras[clave]} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
