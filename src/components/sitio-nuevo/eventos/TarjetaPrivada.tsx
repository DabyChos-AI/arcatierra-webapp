// R15 v2 · F4 (eventos): una experiencia privada en /eventos (D-F4-07 P-7). Es la tarjeta de hoy de las privadas (`ExperienceCard.tsx:148-176,
// :219-232`: foto, nombre, descripción, duración, «Precio por grupo…», «+ $X por persona adicional», «Solicitar Cotización», «Más Detalles»)
// más el precio de la ficha de hoy (`[slug]/page.tsx:617-618`, `$${formatPrice}`). Nombre con la regla de hoy de la lista (`enOracion`,
// importada de la tienda: una sola regla). Sin la insignia «Privada» (todas lo son). «Solicitar Cotización» elige esta experiencia en el
// formulario de la misma página; «Más Detalles» va a su ficha (`rutaExperiencia`). Sin datos de la API, nada se inventa.
import { formatPrice } from '@/utils/formatters'
import { rutaExperiencia } from '@/app/experiencias/[slug]/slug'
import { textoAdicionalPrivada, textoGrupoPrivada } from '@/app/experiencias/[slug]/precio-privada'
import { enOracion } from '@/components/sitio-nuevo/tienda/oracion'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import type { ExperienciaPrivada } from './privadas'

type Props = {
  experiencia: ExperienciaPrivada
  onSolicitar: (id: string) => void
}

const T = 'sn-eventos-privadas-tarjeta'

export default function TarjetaPrivada({ experiencia: e, onSolicitar }: Props) {
  const nombre = enOracion(e.nombre)
  const adicional = textoAdicionalPrivada(e.precio_persona_adicional)
  return (
    <li
      data-testid={T}
      data-experiencia-id={e.id}
      data-slug={e.slug}
      className="flex flex-col overflow-hidden rounded-sn-tarjeta border border-solid border-sn-border bg-white text-sn-ink"
    >
      {e.imagen_principal && (
        <Foto testId={`${T}-foto`} src={e.imagen_principal} alt={nombre} proporcion="4/3" sizes="(min-width: 861px) 400px, 100vw" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 data-testid={`${T}-nombre`} className="m-0 font-sn-titulos text-sn-h5 font-normal text-sn-ink">
          {nombre}
        </h3>
        {e.descripcion && (
          <p data-testid={`${T}-descripcion`} className="m-0 line-clamp-2 font-sn-texto text-sn-cuerpo-sm font-light text-sn-ink">
            {e.descripcion}
          </p>
        )}
        <div className="flex flex-col gap-1 font-sn-texto text-sn-cuerpo-sm font-light text-sn-ink">
          {e.duracion_horas !== undefined && <p data-testid={`${T}-duracion`} className="m-0">{`${e.duracion_horas} horas`}</p>}
          {e.precio !== null && (
            <p data-testid={`${T}-precio`} className="m-0 font-sn-titulos text-sn-h5 font-normal text-sn-terra">
              ${formatPrice(e.precio)}
            </p>
          )}
          <p data-testid={`${T}-grupo`} className="m-0">
            {textoGrupoPrivada(e.personas_incluidas)}
          </p>
          {adicional && (
            <p data-testid={`${T}-adicional`} className="m-0">
              {adicional}
            </p>
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <Boton testId={`${T}-solicitar`} tamano="chico" onClick={() => onSolicitar(e.id)}>
            Solicitar Cotización
          </Boton>
          <Boton testId={`${T}-detalles`} tamano="chico" variante="contorno" href={rutaExperiencia(e.slug)}>
            Más Detalles
          </Boton>
        </div>
      </div>
    </li>
  )
}
