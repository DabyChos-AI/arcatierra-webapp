import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

// R15 v2 · F4 (sesión 62): la venta cruzada a eventos privados de la lista (maqueta `.cross-sell`: panel crema, radio 18, relleno 48, dos
// columnas 2fr/1fr). La MISMA composición que la portada de F2 (portada/abajo/EventosCatering.tsx:31-49, D-F2-13), sin inventar nada:
// - «Eventos privados» = el nombre de la página nueva (armazon/enlaces.ts); «Experiencias Privadas» y su texto, los de hoy
//   (src/app/experiencias/page.tsx:301, :304).
// - 72 horas de anticipación: regla firmada (Word P2, REGLAS-DEL-NEGOCIO §6, lista corta); el rango de personas espera la pregunta C25
//   (marca letra por letra la de la portada). La frase de la carta («Cada visita…») no se pinta (D-F4-12 P-6).
// - El botón lleva al formulario de solicitud de la página de eventos (`id="solicitud"`, D-F4-12 P-1b) con la etiqueta de hoy para ese
//   destino (src/components/HeroCarousel.tsx:169-173).
// Sobre crema nada en terra chico (C17): eyebrow y textos en ink.
const ID_TITULO = 'sn-experiencias-privadas-titulo'

export default function VentaCruzada() {
  return (
    <section
      data-testid="sn-experiencias-privadas"
      aria-labelledby={ID_TITULO}
      className="grid grid-cols-1 items-center gap-8 rounded-sn-panel bg-sn-cream p-8 text-sn-ink min-[861px]:grid-cols-[2fr_1fr] min-[861px]:p-12"
    >
      <div className="min-w-0">
        <Etiqueta tamano="eyebrow" tono="ink" testId="sn-experiencias-privadas-etiqueta" className="mb-4">
          Eventos privados
        </Etiqueta>
        <Titulo nivel={2} tamano="h3" id={ID_TITULO} testId={ID_TITULO} className="mb-4">
          Experiencias Privadas
        </Titulo>
        <Texto testId="sn-experiencias-privadas-texto" className="mb-3 max-w-[460px]">
          Momentos exclusivos diseñados especialmente para ti y tus seres queridos
        </Texto>
        <Texto testId="sn-experiencias-privadas-anticipacion" className="max-w-[460px]">
          De <Falta que="rango de personas de las visitas privadas" quien="Encargadas de Experiencias" /> personas, con 72 horas de
          anticipación.
        </Texto>
      </div>
      <div className="min-[861px]:justify-self-end">
        <Boton href="/eventos#solicitud" forma="recta" flecha testId="sn-experiencias-privadas-boton">
          Experiencias Privadas
        </Boton>
      </div>
    </section>
  )
}
