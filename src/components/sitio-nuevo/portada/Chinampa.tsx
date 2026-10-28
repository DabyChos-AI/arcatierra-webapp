// R15 · F2 (WF2, sesión 55) · sección 7: el corte de la chinampa (maqueta `.chinampa-break`). La cita es la de la maqueta, salvo
// «desde hace más de mil años»: va la cifra publicada `chinampas_desde` («siglo IX», C9). Foto: falta → marca (Diseñadora).
// «Conoce la chinampa →» a la página de hoy. Componente de servidor.
import Link from 'next/link'
import type { DatosCifra } from '@/types/contenido-sitio'
import Falta from '../Falta'
import { ENLACES_PORTADA } from '../enlaces'
import CifraEnLinea from './CifraEnLinea'
import { ENLACE_MONO, ETIQUETA, SECCION } from './estilos'

export default function Chinampa({ cifras }: { cifras: Record<string, DatosCifra> }) {
  return (
    <section data-testid="sn-portada-chinampa" className="py-sn-10 min-[861px]:py-sn-15">
      <div className={`${SECCION} grid grid-cols-1 items-center gap-sn-5 min-[861px]:grid-cols-2 min-[861px]:gap-sn-10`}>
        <div className="min-w-0">
          <p aria-hidden="true" className="font-sn-titulos text-[72px] leading-[0.6] text-sn-terra/40">
            “
          </p>
          <p className={`${ETIQUETA} mb-4 mt-3`}>Chinampa · Xochimilco</p>
          <blockquote className="font-sn-titulos text-[26px] leading-[1.2] tracking-[-0.5px] text-sn-tinta min-[861px]:text-[34px]">
            Las chinampas producen oxígeno, regulan la temperatura de la ciudad, conservan especies que no existen en ningún otro
            lugar y alimentan a familias desde el{' '}
            <em className="text-sn-terra">
              <CifraEnLinea clave="chinampas_desde" cifras={cifras} />
            </em>
            . Todo al mismo tiempo.
          </blockquote>
          <Link href={ENLACES_PORTADA.chinampas} data-testid="sn-portada-chinampa-enlace" className={`${ENLACE_MONO} mt-sn-4`}>
            Conoce la chinampa <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="min-w-0">
          <Falta como="bloque" que="foto de la chinampa (sección «Conoce la chinampa»)" quien="Diseñadora" />
        </div>
      </div>
    </section>
  )
}
