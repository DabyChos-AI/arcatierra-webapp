// R15 · F1 (WF1, sesión 54): la tarjeta de experiencia de la maqueta (`.exp-float-card` de «Experiencias destacadas»).
// Componente de servidor con datos de la base (GET /api/experiencias y, en las públicas, la próxima fecha que se vende en línea
// del feed GET /api/calendario/eventos): nombre, descripción, foto, duración, lugares y PRECIO de la base, nunca los de la maqueta.
// - Pública: «$X / persona»; privada: el precio por grupo con el texto de siempre (`textoGrupoPrivada`, precio-privada.ts).
// - El enlace va a la ficha de hoy (`rutaExperiencia(slug)`); toda la tarjeta es clicable.
// - Sin foto → la marca en el lugar de la foto (la suben las encargadas de Experiencias en el panel).
import Link from 'next/link'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { rutaExperiencia } from '@/app/experiencias/[slug]/slug'
import { textoAdicionalPrivada, textoGrupoPrivada } from '@/app/experiencias/[slug]/precio-privada'
import Falta from './Falta'
import { duracionVisible, fechaCorta, horaCorta, precioVisible } from './formato'

/** Fondos de la foto de la maqueta (verde, óxido, oro…) por posición, para cuando la foto tarda o es transparente. */
const FONDOS = ['bg-sn-verde', 'bg-sn-oxido', 'bg-sn-oro', 'bg-sn-gris'] as const

type Props = {
  slug: string
  nombre: string
  tipo: 'publica' | 'privada'
  precio: number
  personasIncluidas: number | null
  /** Privadas: lo que paga cada persona de más (null = no cobra adicional). */
  precioPersonaAdicional?: number | null
  duracionHoras: number | null
  descripcion: string
  imagenUrl: string | null
  proximaFecha: { fecha: string; horaInicio: string | null; disponibles: number | null } | null
  indice?: number
}

export default function TarjetaExperiencia({
  slug,
  nombre,
  tipo,
  precio,
  personasIncluidas,
  precioPersonaAdicional = null,
  duracionHoras,
  descripcion,
  imagenUrl,
  proximaFecha,
  indice = 0,
}: Props) {
  const publica = tipo === 'publica'
  const duracion = duracionHoras ? duracionVisible(duracionHoras) : null
  const meta = publica
    ? proximaFecha
      ? [fechaCorta(proximaFecha.fecha), horaCorta(proximaFecha.horaInicio), duracion]
      : ['Pública', duracion]
    : ['Privada', duracion]
  const lugares =
    publica && proximaFecha && typeof proximaFecha.disponibles === 'number' && proximaFecha.disponibles > 0
      ? `${proximaFecha.disponibles} ${proximaFecha.disponibles === 1 ? 'lugar' : 'lugares'}`
      : null

  return (
    <article
      data-testid="sn-tarjeta-experiencia"
      data-slug={slug}
      data-tipo={tipo}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-sn-tarjeta border border-sn-borde bg-sn-calido font-sn-texto text-sn-tinta transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className={`relative flex h-[280px] items-end p-[18px] ${FONDOS[indice % FONDOS.length]}`}>
        {imagenUrl ? (
          <OptimizedImage
            src={imagenUrl}
            alt={nombre}
            fill
            sizes="(min-width: 640px) 340px, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center p-[18px]">
            <Falta como="bloque" que={`foto de ${nombre}`} quien="Encargadas de Experiencias" />
          </div>
        )}
        {lugares && (
          <span
            data-testid="sn-tarjeta-experiencia-lugares"
            className="relative z-[1] rounded-sn-boton bg-sn-terra px-3 py-[5px] font-sn-mono text-[9px] font-medium uppercase leading-[1.55] tracking-[1.2px] text-white"
          >
            {lugares}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
        <p
          data-testid="sn-tarjeta-experiencia-meta"
          className="mb-3 font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1px] text-sn-terra"
        >
          {meta.filter(Boolean).join(' · ')}
        </p>
        <h3 className="mb-[10px] font-sn-titulos text-[28px] leading-[1.1] tracking-[-0.3px] text-sn-tinta">
          {/* Enlace estirado (`static`: globals.css pone position: relative a todo <a>). */}
          <Link
            href={rutaExperiencia(slug)}
            data-testid="sn-tarjeta-experiencia-enlace"
            className="static text-sn-tinta after:absolute after:inset-0 after:content-[''] hover:text-sn-terra"
          >
            {nombre}
          </Link>
        </h3>
        {descripcion && (
          <p className="mb-6 line-clamp-3 text-sm font-light leading-[1.55] text-sn-tinta/75">{descripcion}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-sn-borde pt-4">
          <div data-testid="sn-tarjeta-experiencia-precio" className="font-sn-mono text-[13px] font-medium leading-[1.4] text-sn-tinta">
            {publica ? (
              <>{precioVisible(precio)} / persona</>
            ) : (
              <>
                {precioVisible(precio)}
                <span className="block text-[11px] font-normal text-sn-tinta/75">{textoGrupoPrivada(personasIncluidas)}</span>
                {textoAdicionalPrivada(precioPersonaAdicional) && (
                  <span className="block text-[11px] font-normal text-sn-tinta/75">{textoAdicionalPrivada(precioPersonaAdicional)}</span>
                )}
              </>
            )}
          </div>
          <span
            aria-hidden="true"
            className="shrink-0 rounded-sn-boton border-[1.5px] border-sn-terra px-[14px] py-2 font-sn-mono text-[11px] font-medium uppercase leading-none tracking-[1px] text-sn-terra transition-colors group-hover:bg-sn-terra group-hover:text-white"
          >
            {publica ? 'Reservar →' : 'Organiza →'}
          </span>
        </div>
      </div>
    </article>
  )
}
