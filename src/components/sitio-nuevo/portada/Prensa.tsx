// R15 · F2 (WF2, sesión 55) · sección 10: prensa (maqueta `.prensa-section`). Solo lo PUBLICADO en contenido_sitio › prensa
// (medio, y si lo traen: logo, nota y liga). Vacío → la marca: los logos de la maqueta (NYT, National Geographic…) no traen
// permiso (Lucio y Pablo). «Ver todos →» a la página de prensa de hoy. Componente de servidor.
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { DatosPrensa, ElementoPublico } from '@/types/contenido-sitio'
import Falta from '../Falta'
import { ENLACES_PORTADA } from '../enlaces'
import { PASTILLA, SECCION } from './estilos'

const MEDIO = 'font-sn-titulos text-[22px] leading-[1.1] tracking-[-0.4px] text-sn-tinta/80'

function Medio({ datos }: { datos: DatosPrensa }) {
  const contenido = datos.logo_url ? (
    <span className="relative block h-8 w-[140px]">
      <OptimizedImage src={datos.logo_url} alt={datos.medio} fill sizes="140px" className="object-contain" />
    </span>
  ) : (
    <span className={MEDIO}>{datos.medio}</span>
  )
  if (!datos.url) return contenido
  return (
    <a
      href={datos.url}
      target="_blank"
      rel="noopener noreferrer"
      title={datos.titulo ?? datos.medio}
      className="text-sn-tinta/80 hover:text-sn-terra"
    >
      {contenido}
    </a>
  )
}

export default function Prensa({ prensa }: { prensa: ElementoPublico<DatosPrensa>[] }) {
  const medios = prensa.filter((p) => typeof p.datos?.medio === 'string' && p.datos.medio.trim())
  return (
    <section
      data-testid="sn-portada-prensa"
      data-vacia={medios.length === 0 ? '1' : '0'}
      className="border-t border-sn-borde py-sn-6"
    >
      <div className={`${SECCION} flex flex-col gap-sn-3 min-[861px]:flex-row min-[861px]:items-center min-[861px]:justify-between`}>
        <h2 className="font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.8px] text-sn-terra">Prensa</h2>
        {medios.length === 0 ? (
          <div className="min-w-0 text-sm">
            <Falta que="medios de prensa con su logo y permiso para usarlo" quien="Lucio y Pablo" />
          </div>
        ) : (
          <ul className="flex min-w-0 flex-wrap items-center gap-x-sn-4 gap-y-3">
            {medios.map((p) => (
              <li key={p.id} data-testid="sn-portada-prensa-medio">
                <Medio datos={p.datos} />
              </li>
            ))}
          </ul>
        )}
        <Link href={ENLACES_PORTADA.prensa} data-testid="sn-portada-prensa-ver-todos" className={`${PASTILLA} self-start min-[861px]:self-auto`}>
          Ver todos <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
