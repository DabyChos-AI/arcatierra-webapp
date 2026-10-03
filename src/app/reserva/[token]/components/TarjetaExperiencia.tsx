'use client'

import { CalendarDays, Clock, Languages, MapPin, Users, Baby, ExternalLink, ChevronDown } from 'lucide-react'
import type { PortalExperiencia } from '@/types/portal'
import { fechaLarga, horario, renglones, textoIdioma, textoNinos, textoPersonas } from './textos'

/** Una lista plegable (`<details>`: se abre con teclado y lector de pantalla sin estado propio). */
function Plegable({ titulo, items, testId }: { titulo: string; items: string[]; testId: string }) {
  if (items.length === 0) return null
  return (
    <details data-testid={testId} className="group border-t border-neutro-borde">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-2 text-base font-semibold text-verde [&::-webkit-details-marker]:hidden">
        <span>{titulo}</span>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-verde-tipografia">
        {items.map((item, i) => (
          <li key={i} className="break-words">
            {item}
          </li>
        ))}
      </ul>
    </details>
  )
}

export default function TarjetaExperiencia({ exp, indice }: { exp: PortalExperiencia; indice: number }) {
  const hora = horario(exp.hora_inicio, exp.hora_fin)
  const idioma = textoIdioma(exp.idioma)
  const personas = Number.isFinite(Number(exp.personas)) ? Number(exp.personas) : 0
  const ninos = Number.isFinite(Number(exp.ninos)) ? Number(exp.ninos) : 0

  return (
    <article
      data-testid={`portal-experiencia-${indice}`}
      className="rounded-2xl border border-neutro-borde bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 data-testid="portal-exp-nombre" className="mb-3 break-words font-heading text-xl leading-tight text-verde sm:text-2xl">
        {exp.nombre}
      </h2>

      <ul className="mb-4 space-y-2 text-base text-verde-tipografia">
        <li className="flex items-start gap-2" data-testid="portal-exp-fecha" data-fecha={exp.fecha}>
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
          <span className="min-w-0">{fechaLarga(exp.fecha)}</span>
        </li>
        {hora && (
          <li className="flex items-start gap-2" data-testid="portal-exp-horario">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span className="min-w-0">{hora}</span>
          </li>
        )}
        <li className="flex flex-wrap items-center gap-2">
          <span
            data-testid="portal-exp-personas"
            className="inline-flex items-center gap-1.5 rounded-full bg-neutro-light px-3 py-1 text-sm font-medium"
          >
            <Users className="h-4 w-4 text-verde" aria-hidden="true" />
            {textoPersonas(personas)}
          </span>
          {ninos > 0 && (
            <span
              data-testid="portal-exp-ninos"
              className="inline-flex items-center gap-1.5 rounded-full bg-neutro-light px-3 py-1 text-sm font-medium"
            >
              <Baby className="h-4 w-4 text-verde" aria-hidden="true" />
              {textoNinos(ninos)}
            </span>
          )}
          {idioma && (
            <span
              data-testid="portal-exp-idioma"
              className="inline-flex items-center gap-1.5 rounded-full bg-neutro-light px-3 py-1 text-sm font-medium"
            >
              <Languages className="h-4 w-4 text-verde" aria-hidden="true" />
              {idioma}
            </span>
          )}
        </li>
      </ul>

      {exp.punto_encuentro && (
        <div data-testid="portal-punto-encuentro" className="mb-4 rounded-xl bg-neutro-light p-3">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-verde">
            <MapPin className="h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
            Punto de encuentro
          </p>
          <p className="mb-0 whitespace-pre-line break-words text-base text-verde-tipografia">{exp.punto_encuentro}</p>
          {exp.mapa_url && (
            <a
              data-testid="portal-mapa"
              href={exp.mapa_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-terracota underline underline-offset-2 hover:text-terracota-oscuro"
            >
              Ver en el mapa
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      <Plegable titulo="¿Qué incluye?" items={renglones(exp.incluye)} testId="portal-incluye" />
      <Plegable titulo="Información importante" items={renglones(exp.informacion_importante)} testId="portal-informacion" />
      <Plegable titulo="Requisitos" items={renglones(exp.requisitos)} testId="portal-requisitos" />
    </article>
  )
}
