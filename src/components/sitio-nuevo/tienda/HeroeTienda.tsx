// R15 v2 · F3 (tienda): el héroe de la tienda (`.t-hero-v5` de la maqueta: fondo cream con filete abajo, texto a la izquierda y la foto
// a la derecha desde 861 px, una columna en el celular). Textos de la tienda de hoy (src/app/tienda/page.tsx:979-981; «100%» en la lista
// corta, D-F3-21), botones a las pestañas (D-F3-22 (1)), la promesa de hoy (src/app/page.tsx:140) y la foto del slide 3 de hoy
// (`heroSlides[2]`, D-F3-24 T-8). El sello «Esta semana» de la maqueta no tiene dato: marca a Lucio y Pablo (MAPA-CONTENIDO A §2.1, F-2).
import { Check } from 'lucide-react'
import { heroSlides } from '@/data/heroSlides'
import { ligasDe } from '@/components/sitio-nuevo/armazon/enlaces'
import Falta from '@/components/sitio-nuevo/Falta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'

const SLIDE_SUSCRIPCION = heroSlides[2]
/** «Tienda», el nombre del menú (armazon/enlaces.ts:29), como en la portada. */
const EYEBROW = ligasDe('cabecera').find((l) => l.href === '/tienda')?.texto ?? ''

export default function HeroeTienda() {
  return (
    <section
      data-testid="sn-tienda-heroe"
      aria-labelledby="sn-tienda-heroe-h1"
      className="grid border-b border-solid border-sn-border bg-sn-cream text-sn-ink min-[861px]:grid-cols-[1.1fr_1fr]"
    >
      <div className="flex flex-col justify-center gap-6 px-7 py-14 min-[861px]:px-14 min-[861px]:pb-16 min-[861px]:pt-20">
        {EYEBROW && (
          <Etiqueta tamano="eyebrow" tono="forest">
            {EYEBROW}
          </Etiqueta>
        )}
        <Titulo nivel={1} tamano="hero" tono="terra" id="sn-tienda-heroe-h1" testId="sn-tienda-heroe-titulo">
          Tienda de alimentos
        </Titulo>
        <Texto tamano="grande" ancho="parrafo" testId="sn-tienda-heroe-texto">
          Alimentos agroecológicos 100% mexicanos — compra directa o por suscripción
        </Texto>
        <div className="flex flex-col gap-3 min-[861px]:flex-row">
          <Boton href="/tienda?pestana=canasta-lista" sobreCrema testId="sn-tienda-heroe-canastas">
            Canastas Agroecológicas
          </Boton>
          <Boton href="/tienda?pestana=compra-suelto" variante="contorno" sobreCrema testId="sn-tienda-heroe-suelto">
            Compra suelto
          </Boton>
        </div>
        <p className="m-0 flex items-center gap-2 font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-ink">
          <Check aria-hidden="true" focusable="false" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Cancela cuando quieras</span>
        </p>
      </div>
      <div className="relative min-h-[320px]">
        <Foto
          src={SLIDE_SUSCRIPCION.image}
          alt={SLIDE_SUSCRIPCION.title}
          proporcion="4/3"
          sizes="(min-width: 861px) 48vw, 100vw"
          prioridad
          testId="sn-tienda-heroe-foto"
          className="h-full min-[861px]:aspect-auto"
        />
        <div
          data-testid="sn-tienda-heroe-sello"
          className="absolute bottom-6 left-6 max-w-[280px] rounded-sn-tarjeta bg-sn-warm p-4 text-sn-ink"
        >
          <Falta que="lo que trae la canasta esta semana" quien="Lucio y Pablo" />
        </div>
      </div>
    </section>
  )
}
