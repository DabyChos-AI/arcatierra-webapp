// R15 · F2 (WF2, sesión 55) · sección 9: el manifiesto (maqueta `.qs-manifesto`). Cada cifra sale de contenido_sitio › cifras
// con <CifraEnLinea> (C9): desde (2009), años (17), familias (60+), estados (10; NUNCA «seis estados» de la maqueta) y la
// Estrella Verde. «Cuáles son los 10 estados» lleva la marca (Lucio y Pablo). Componente de servidor.
import Link from 'next/link'
import type { DatosCifra } from '@/types/contenido-sitio'
import Falta from '../Falta'
import { ENLACES_PORTADA } from '../enlaces'
import CifraEnLinea from './CifraEnLinea'
import { ETIQUETA, PASTILLA } from './estilos'

export default function Manifiesto({ cifras }: { cifras: Record<string, DatosCifra> }) {
  const c = (clave: string) => <CifraEnLinea clave={clave} cifras={cifras} />
  return (
    <section data-testid="sn-portada-manifiesto" className="px-6 py-sn-12 text-center min-[861px]:py-sn-15">
      <div className="mx-auto max-w-[860px]">
        <p className="mx-auto mb-sn-3 inline-block rounded-sn-pildora border border-sn-borde px-4 py-[7px] font-sn-mono text-[10px] font-medium uppercase leading-none tracking-[1.6px] text-sn-tinta/80">
          Est. {c('desde')} · Xochimilco
        </p>
        <p className={`${ETIQUETA} mb-[14px]`}>Quiénes somos</p>
        <h2 className="font-sn-titulos text-[38px] leading-[1.05] tracking-[-1px] text-sn-terra min-[861px]:text-[64px]">
          {c('anios')} años en el campo mexicano.{' '}
          <em className="block text-sn-tinta">Cada temporada nos enseña algo nuevo.</em>
        </h2>
        <p className="mx-auto mt-sn-4 max-w-[640px] text-[15px] leading-[1.7] text-sn-tinta/85 min-[861px]:text-base">
          Alimentos, experiencias y un restaurante que nacieron del mismo lugar. Llegamos a Xochimilco en {c('desde')} con una
          sola pregunta: ¿se puede producir comida honesta en esta ciudad? Hoy somos una red de {c('familias')} familias
          campesinas en {c('estados')} estados, una chinampa que sigue produciendo como hace siglos, y un restaurante con Estrella
          Verde Michelin ({c('estrella_verde')}) que cocina lo que la red cosecha.
        </p>
        <p className="mt-3 text-sm">
          <Falta que="cuáles son los 10 estados" quien="Lucio y Pablo" />
        </p>
        <Link href={ENLACES_PORTADA.nosotros} data-testid="sn-portada-manifiesto-enlace" className={`${PASTILLA} mt-sn-5`}>
          Conoce Arca Tierra <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
