// R15 v2 · F2: bloque 7 de la portada, la pausa de la chinampa (maqueta `.chinampa-break`). Contrato v2 §9-F2 D-F2-05, D-F2-08 b/k,
// D-F2-13; cadena-v2/f2/abajo-F2.md §2.7. Componente de servidor, sin datos de la API.
// - Título: «Chinampas de Xochimilco», el h1 de hoy de /xochimilco (src/app/xochimilco/page.tsx:36); equivale a «Chinampa · Xochimilco».
// - La cita no existe en el sitio (pregunta C41): una marca a nombre de Lucio y Pablo, en la letra de texto (Falta pinta en negrita y DM
//   Serif solo trae 400: no se engruesa de forma sintética, C36).
// - La foto es la de hoy (public/images/home/chinampas_xochimilco.png, 12.6 MB) por Foto → next/image, con su alt de hoy
//   (src/app/components/HomePage.tsx:19).
// - «Conoce la chinampa» no se pinta: la página Chinampas llega en F5 y /xochimilco se oculta (D-F2-08 b, C20).
// Medido en la maqueta: fondo warm, relleno 72 → 96 px; dos columnas desde 861 px (texto y foto de 520 × 460, separación 72) y una sola
// en el celular (separación 36, foto 334 × 240); comillas de 96 → 140 px en terra al 22 % (decoración); cita en serif de 26 → 34 px.
import Falta from '@/components/sitio-nuevo/Falta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'

const ID_TITULO = 'sn-portada-chinampa-titulo'

export default function PausaChinampa() {
  return (
    <Seccion testId="sn-portada-chinampa" fondo="warm" borde="ambos" espacio="grande" etiquetadaPor={ID_TITULO}>
      <div className="grid grid-cols-1 items-center gap-[36px] px-sn-lateral-movil min-[861px]:grid-cols-[minmax(0,1fr)_520px] min-[861px]:gap-[72px] min-[861px]:px-sn-lateral">
        <div className="relative min-w-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 -top-[22px] select-none font-sn-titulos text-[96px] leading-[0.7] text-sn-terra/[0.22] min-[861px]:-left-3.5 min-[861px]:-top-8 min-[861px]:text-[140px]"
          >
            “
          </span>
          <h2
            id={ID_TITULO}
            data-testid={ID_TITULO}
            className="relative m-0 mb-[22px] font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-terra"
          >
            Chinampas de Xochimilco
          </h2>
          <div
            data-testid="sn-portada-chinampa-cita"
            className="relative font-sn-titulos text-[26px] font-normal leading-[1.16] tracking-[-0.4px] text-sn-ink min-[861px]:text-[34px] min-[861px]:tracking-[-0.6px]"
          >
            <span className="font-sn-texto">
              <Falta que="cita de la pausa de la chinampa" quien="Lucio y Pablo" />
            </span>
          </div>
        </div>

        <Foto
          src="/images/home/chinampas_xochimilco.png"
          alt="Chinampas de Xochimilco"
          proporcion="4/3"
          sizes="(min-width: 861px) 520px, 100vw"
          testId="sn-portada-chinampa-foto"
          className="min-[861px]:aspect-[26/23]"
        />
      </div>
    </Seccion>
  )
}
