// R15 · F2 (WF2, sesión 55) · sección 4: «Experiencias destacadas» = SOLO las experiencias disponibles de GET /api/experiencias
// (C7: fuera Siembra, Recorrido, Mesa al atardecer, Mesa entre chinampas y el niño a $700 de la maqueta), con la tarjeta de F1.
// Las públicas traen su próxima fecha vendible y sus lugares (leerExperienciasMuestra de F1); las privadas, su precio por grupo.
// Scroll horizontal con snap, como la maqueta. Componente de servidor.
import Link from 'next/link'
import type { ExperienciaMuestra } from '@/lib/sitio-nuevo-contenido'
import TarjetaExperiencia from '../TarjetaExperiencia'
import { ENLACES_PORTADA } from '../enlaces'
import { ETIQUETA, PASTILLA, SECCION, SIN_API, TITULO } from './estilos'

export default function Experiencias({ experiencias }: { experiencias: ExperienciaMuestra[] | null }) {
  return (
    <section
      data-testid="sn-portada-experiencias"
      data-estado={experiencias === null ? 'sin-api' : experiencias.length === 0 ? 'vacio' : 'ok'}
      className="bg-sn-crema py-sn-10 min-[861px]:py-sn-15"
    >
      <div className={SECCION}>
        <div className="mb-sn-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            {/* La maqueta dice «Reserva por persona»: las privadas se cotizan por grupo, así que va la etiqueta del hero. */}
            <p className={`${ETIQUETA} mb-[14px]`}>Vive Arca</p>
            <h2 className={TITULO}>Experiencias destacadas</h2>
          </div>
          <Link href={ENLACES_PORTADA.experiencias} data-testid="sn-portada-experiencias-ver-todas" className={PASTILLA}>
            Ver todas <span aria-hidden="true">→</span>
          </Link>
        </div>
        {experiencias === null ? (
          <p role="status" data-sin-api="1" className={SIN_API}>
            No se pudieron leer las experiencias de la API en este momento. Recarga la página en un minuto.
          </p>
        ) : experiencias.length === 0 ? (
          <p role="status" className={SIN_API}>
            No hay experiencias disponibles por ahora.
          </p>
        ) : (
          <ul className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 min-[861px]:-mx-10 min-[861px]:px-10">
            {experiencias.map((e, i) => (
              <li key={e.id} className="w-[320px] max-w-[82vw] shrink-0 snap-start">
                <TarjetaExperiencia {...e} indice={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
