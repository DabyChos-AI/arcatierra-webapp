// R15 v2 · F4 (sesión 62): una tarjeta de la lista de experiencias (maqueta `article.exp-card`). Contrato v2 §9-F4 D-F4-04, D-F4-12, D-F4-13;
// cadena-v2/f4/experiencias-F4.md §2.4. Todo sale de la API y de los textos de hoy (DR-17):
// - Foto, duración, nombre, descripción y precio: la experiencia de GET /api/experiencias como la pinta la lista de hoy
//   (src/app/experiencias/page.tsx:118-144): «{duracion_horas} horas», el nombre con la regla de hoy (`enOracion`, la misma de la tienda),
//   la descripción a 150 caracteres, `$${formatPrice(precio)}` por persona (ExperienceCard.tsx:129).
// - Lo que incluye: los renglones de la API sin el emoji del principio (la limpieza de la ficha de hoy), como pastillas (D-F4-12 P-7).
// - Fechas: las del feed público de esta experiencia; título «Próximas:» y los textos de hoy («Sin fechas próximas», «Consulta fechas»,
//   «Cargando...», ExperienceCard.tsx:76-83); la disponibilidad con los textos de la ficha de hoy. Nunca un «Lleno» inventado.
// - «Más Detalles» a la ficha con `rutaExperiencia` (ExperienceCard.tsx:213-216); nunca al calendario de hoy (se oculta).
// Diseño medido en la maqueta: dos columnas desde 861 px (la ancha a la izquierda, 1.2 a 1) con la foto alternando de lado; una columna
// hasta 860 con la foto arriba (la maqueta se sale a 390). Sobre warm: texto chico ink, ink al 70 % o terra (4.78); 700 → 500 (C36).
import { formatFechaMexico } from '@/lib/dates'
import { formatPrice } from '@/utils/formatters'
import { rutaExperiencia } from '@/app/experiencias/[slug]/slug'
import { horaCorta } from '@/app/admin/eventos/components/fechas'
import { enOracion } from '@/components/sitio-nuevo/tienda/oracion'
import type { FechaPublica } from '@/types/compra-experiencias'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Precio from '@/components/sitio-nuevo/ui/Precio'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { unirClases } from '@/components/sitio-nuevo/ui/clases'
import {
  FECHAS_POR_TARJETA,
  descripcionCorta,
  fotoDeExperiencia,
  sinEmojiInicial,
  textoDisponibilidad,
  type ExperienciaApi,
} from './experiencias'

/** Las fechas de esta experiencia: cargando, el feed no respondió, o las fechas (ya filtradas al mes elegido). */
export type FechasDeTarjeta = 'cargando' | 'error' | FechaPublica[]

function faseDeFechas(fechas: FechasDeTarjeta): 'cargando' | 'error' | 'con-fechas' | 'sin-fechas' {
  if (fechas === 'cargando' || fechas === 'error') return fechas
  return fechas.length > 0 ? 'con-fechas' : 'sin-fechas'
}

type Props = {
  experiencia: ExperienciaApi
  fechas: FechasDeTarjeta
  /** La posición en la lista: la foto va a la derecha en las pares (0, 2…) y a la izquierda en las nones, como la maqueta. */
  indice: number
}

export default function TarjetaLista({ experiencia, fechas, indice }: Props) {
  const fotoALaIzquierda = indice % 2 === 1
  const fase = faseDeFechas(fechas)
  const incluye = (Array.isArray(experiencia.incluye) ? experiencia.incluye : []).map(sinEmojiInicial).filter((r) => r.trim() !== '')

  return (
    <li
      id={experiencia.slug}
      data-testid="sn-experiencias-tarjeta"
      data-experiencia-id={experiencia.id}
      data-slug={experiencia.slug}
      className="list-none"
    >
      <article className="grid grid-cols-1 overflow-hidden rounded-[18px] border border-solid border-sn-border bg-sn-warm text-sn-ink min-[861px]:grid-cols-[1.2fr_1fr]">
        <div className={unirClases('relative min-w-0 bg-sn-sand', fotoALaIzquierda ? 'min-[861px]:order-1' : 'min-[861px]:order-2')}>
          <Foto
            src={fotoDeExperiencia(experiencia.nombre, experiencia.imagen_principal)}
            alt={experiencia.nombre}
            proporcion="4/3"
            sizes="(min-width: 861px) 600px, 100vw"
            testId="sn-experiencias-tarjeta-foto"
            className="min-[861px]:h-full"
          />
        </div>

        <div
          className={unirClases(
            'flex min-w-0 flex-col justify-between gap-6 px-6 py-8 min-[861px]:px-10 min-[861px]:py-12',
            fotoALaIzquierda ? 'min-[861px]:order-2' : 'min-[861px]:order-1',
          )}
        >
          <div className="min-w-0">
            {experiencia.duracion_horas ? (
              <Etiqueta tamano="eyebrow" testId="sn-experiencias-tarjeta-duracion" className="mb-3">
                {`${experiencia.duracion_horas} horas`}
              </Etiqueta>
            ) : null}
            <Titulo nivel={2} tamano="h3" testId="sn-experiencias-tarjeta-nombre" className="mb-4 mt-3.5 break-words">
              {enOracion(experiencia.nombre)}
            </Titulo>
            {experiencia.descripcion ? (
              <Texto tono="ink-suave" testId="sn-experiencias-tarjeta-descripcion" className="mb-5">
                {descripcionCorta(experiencia.descripcion)}
              </Texto>
            ) : null}
            {incluye.length > 0 && (
              <ul data-testid="sn-experiencias-tarjeta-incluye" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {incluye.map((renglon, i) => (
                  <li key={`${i}-${renglon}`} className="max-w-full">
                    <Insignia tono="contorno" forma="pildora" className="max-w-full break-words">
                      {renglon}
                    </Insignia>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            data-testid="sn-experiencias-tarjeta-fechas"
            data-estado={fase}
            className="border-0 border-t border-solid border-sn-border pt-6"
          >
            {fase === 'cargando' && <Texto tamano="chico" peso="normal">Cargando...</Texto>}
            {fase === 'error' && <Texto tamano="chico" peso="normal">Consulta fechas</Texto>}
            {fase === 'sin-fechas' && <Texto tamano="chico" peso="normal">Sin fechas próximas</Texto>}
            {Array.isArray(fechas) && fechas.length > 0 && (
              <>
                <Etiqueta tamano="chica" tono="ink" className="mb-3.5">
                  Próximas:
                </Etiqueta>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {fechas.slice(0, FECHAS_POR_TARJETA).map((f) => (
                    <li
                      key={f.id}
                      data-testid="sn-experiencias-tarjeta-dia"
                      data-evento-id={f.id}
                      data-fecha={f.fecha_evento}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
                    >
                      <span className="flex min-w-0 flex-wrap items-baseline gap-x-3.5">
                        <span className="font-sn-titulos text-[22px] font-normal leading-none text-sn-ink">
                          {formatFechaMexico(f.fecha_evento, { year: undefined, weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-ink">{horaCorta(f.hora_inicio)}</span>
                      </span>
                      <Insignia tono="green" forma="pildora">
                        {textoDisponibilidad(f)}
                      </Insignia>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-0 border-t border-solid border-sn-border pt-5">
            <Precio valor={`$${formatPrice(experiencia.precio)}`} unidad="persona" tamano="normal" testId="sn-experiencias-tarjeta-precio" />
            <Boton href={rutaExperiencia(experiencia.slug)} tamano="chico" flecha testId="sn-experiencias-tarjeta-detalles">
              Más Detalles
            </Boton>
          </div>
        </div>
      </article>
    </li>
  )
}
