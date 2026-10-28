// R15 · F2 (WF2, sesión 55) · sección 8: Eventos privados + Catering (la rejilla 1fr 1fr de la maqueta). Componente de servidor.
// - Eventos: 72 h de anticipación (C10, como texto). El «De 2 a 100 personas» de la maqueta no está confirmado: marca
//   (Encargadas de Experiencias). «Cotizar mi visita →» va a las privadas de hoy (cada una con su solicitud); el cotizador
//   nuevo espera C11.
// - Catering: textos y sellos de la maqueta; «Cotizar catering →» al formulario de la página de Catering de hoy.
import Link from 'next/link'
import Falta from '../Falta'
import { ENLACES_PORTADA } from '../enlaces'

const ETIQUETA_BLOQUE = 'mb-[14px] font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.8px]'
const TITULO_BLOQUE = 'font-sn-titulos text-[34px] leading-[1.02] tracking-[-0.8px] min-[861px]:text-[48px]'
const BOTON_BLOQUE =
  'mt-sn-4 inline-flex items-center gap-2 self-start rounded-sn-pildora px-[22px] py-[13px] font-sn-mono text-[11px] font-medium uppercase leading-none tracking-[1.4px] transition-colors'

export default function EventosCatering() {
  return (
    <section data-testid="sn-portada-eventos" className="grid grid-cols-1 min-[861px]:grid-cols-2">
      <div
        data-testid="sn-portada-eventos-privados"
        className="flex min-w-0 flex-col bg-sn-terra px-6 py-sn-8 text-white min-[861px]:px-sn-8 min-[861px]:py-sn-12"
      >
        <p className={`${ETIQUETA_BLOQUE} text-sn-durazno`}>Eventos privados</p>
        <h2 className={TITULO_BLOQUE}>Arma tu visita en la chinampa.</h2>
        <p className="mt-4 max-w-[460px] text-[15px] leading-[1.6] text-white/90">
          Te organizamos algo solo para tu grupo. Con tu familia, amigos, empresa o cualquier tipo de festejo. Con 72 horas de
          anticipación.
        </p>
        <p className="mt-3 text-sm">
          <Falta que="cuántas personas caben en una visita privada (la maqueta dice de 2 a 100)" quien="Encargadas de Experiencias" />
        </p>
        <Link
          href={ENLACES_PORTADA.eventos}
          data-testid="sn-portada-eventos-cotizar"
          className={`${BOTON_BLOQUE} bg-sn-oro text-sn-tinta hover:bg-sn-durazno hover:text-sn-tinta`}
        >
          Cotizar mi visita <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div
        data-testid="sn-portada-catering"
        className="flex min-w-0 flex-col bg-sn-crema px-6 py-sn-8 text-sn-tinta min-[861px]:px-sn-8 min-[861px]:py-sn-12"
      >
        <p className={`${ETIQUETA_BLOQUE} text-sn-terra`}>Catering</p>
        <h2 className={`${TITULO_BLOQUE} text-sn-tinta`}>Llevamos Arca a tu evento.</h2>
        <p className="mt-4 max-w-[460px] text-[15px] leading-[1.6] text-sn-tinta/80">
          Ingredientes frescos de nuestras chinampas y de la red agroecológica. Sin intermediarios.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {['★ Baldío cocina en tu evento', 'El dinero va directo a productores'].map((sello) => (
            <li
              key={sello}
              className="rounded-sn-pildora border border-sn-terra/40 px-3 py-[6px] font-sn-mono text-[10px] font-medium uppercase leading-none tracking-[1.2px] text-sn-terra"
            >
              {sello}
            </li>
          ))}
        </ul>
        <Link
          href={ENLACES_PORTADA.catering}
          data-testid="sn-portada-catering-cotizar"
          className={`${BOTON_BLOQUE} bg-sn-terra text-white hover:bg-sn-tinta hover:text-white`}
        >
          Cotizar catering <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
