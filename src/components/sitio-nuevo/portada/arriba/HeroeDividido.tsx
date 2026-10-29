// R15 v2 · F2 (sesión 59): bloque 1 de la portada, el héroe dividido (maqueta `.hero-split`; contrato base F1 §4: «queda para la fase que lo
// use»). Contrato v2 §9-F2 D-F2-08 (e), D-F2-09.
// Originales (DR-17): los slides 1 y 2 del héroe de hoy, IMPORTADOS de src/data/heroSlides.ts (foto, título, texto, botón y destino); el
// eyebrow es el nombre del menú para ese destino (armazon/enlaces.ts). Sin «Vive Arca / Come Arca»: tienen equivalente.
// Diseño medido en la maqueta: dos lados 1.5fr / 1fr desde 861 px y 84 vh; foto que cubre con el degradado de abajo; contenido abajo a
// 56 px (40/28 en el celular, una columna); título DM Serif blanco; botón recto. Sin la animación de columnas al pasar el ratón.
// Los títulos son h2: el h1 de la portada es el de page.tsx (D-F2-09, P-1). Componente de servidor.
import { heroSlides, type HeroSlide } from '@/data/heroSlides'
import { ligasDe } from '@/components/sitio-nuevo/armazon/enlaces'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

/** Qué slide de hoy va en cada lado, con su testid (D-F2-09) y el ancho que ocupa su foto. */
const LADOS = [
  { idSlide: 1, clave: 'experiencias', boton: 'primario', sizes: '(min-width: 861px) 60vw, 100vw' },
  { idSlide: 2, clave: 'tienda', boton: 'suave', sizes: '(min-width: 861px) 40vw, 100vw' },
] as const

/**
 * El degradado negro de la maqueta (`.hero-side::after`), más fuerte para que los textos sobre las fotos de hoy pasen AA (C17): con el de
 * la maqueta (0 → 0.65) el eyebrow y el título dan 1.2–1.9 (medido en pantalla, 95.º percentil del fondo). Este es el más claro de los que
 * medí que pasa en los seis textos a 1440 y 390 (el peor, el eyebrow de la tienda a 390: 5.52; 4.98 con el píxel más claro). Mismo negro,
 * ningún color nuevo; propiedad arbitraria (no hay utilidad de hoy que lo dé).
 */
const DEGRADADO =
  '[background-image:linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_30%,rgba(0,0,0,0.72)_50%,rgba(0,0,0,0.8)_100%)]'

/** El nombre del menú para una dirección (TransparentHeader de hoy, en armazon/enlaces.ts). */
function nombreDelMenu(href: string): string | undefined {
  return ligasDe('cabecera').find((liga) => liga.href === href)?.texto
}

export default function HeroeDividido() {
  return (
    <Seccion
      testId="sn-portada-heroe"
      espacio="ninguno"
      className="grid grid-cols-1 min-[861px]:min-h-[84vh] min-[861px]:grid-cols-[1.5fr_1fr]"
    >
      {LADOS.map((lado) => {
        const slide = heroSlides.find((s) => s.id === lado.idSlide)
        return slide ? <Lado key={lado.clave} slide={slide} {...lado} /> : null
      })}
    </Seccion>
  )
}

function Lado({
  slide,
  clave,
  boton,
  sizes,
}: {
  slide: HeroSlide
  clave: (typeof LADOS)[number]['clave']
  boton: (typeof LADOS)[number]['boton']
  sizes: string
}) {
  const eyebrow = nombreDelMenu(slide.ctaLink)
  return (
    <div
      data-testid={`sn-portada-heroe-${clave}`}
      className="relative flex min-h-[56vh] items-end overflow-hidden bg-sn-ink px-7 py-10 min-[861px]:min-h-0 min-[861px]:p-14"
    >
      <div className="absolute inset-0">
        <Foto src={slide.image} alt={slide.title} sizes={sizes} prioridad testId={`sn-portada-heroe-${clave}-foto`} className="h-full" />
      </div>
      <div aria-hidden="true" className={`absolute inset-0 ${DEGRADADO}`} />
      {/* Sobre la foto el contorno de foco va en warm (C18: terra no llega a 3:1 sobre el degradado); el selector gana al del botón. */}
      <div className="relative max-w-[520px] [&_a:focus-visible]:outline-sn-warm">
        {eyebrow && (
          <Etiqueta tamano="eyebrow" tono="white" className="mb-3">
            {eyebrow}
          </Etiqueta>
        )}
        <Titulo nivel={2} tamano="hero" tono="white" className="mb-4 min-[861px]:text-sn-hero-xl">
          {slide.title}
        </Titulo>
        <Texto tono="white" className="mb-9 max-w-[360px]">
          {slide.subtitle}
        </Texto>
        <Boton href={slide.ctaLink} variante={boton} forma="recta" flecha testId={`sn-portada-heroe-${clave}-cta`}>
          {slide.ctaText}
        </Boton>
      </div>
    </div>
  )
}
