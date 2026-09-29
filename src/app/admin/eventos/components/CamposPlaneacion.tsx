'use client'

import type { Personal } from '@/types/catalogos'
import type { GuiaEvento, ItemCatalogo } from '@/types/planeacion'

// Campos que comparten el modal de planeación de una fecha pública y el de un evento
// interno. Lo guardado se muestra aunque ya no esté en el catálogo activo: si no, el
// select lo borraría sin que nadie lo pidiera.

export const inputClass =
  'w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota'

export const IDIOMAS_EVENTO: { value: 'es' | 'en'; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
]

export function etiquetaIdioma(idioma: string | null | undefined): string {
  return IDIOMAS_EVENTO.find((i) => i.value === idioma)?.label ?? '—'
}

/** «Ana López (G.E)» para los guías externos */
export function nombreGuia(g: { nombre: string; es_externo?: boolean }): string {
  return g.es_externo ? `${g.nombre} (G.E)` : g.nombre
}

export function SelectChinampa({
  id,
  value,
  guardada,
  chinampas,
  onChange,
}: {
  id: string
  value: string
  // lo que tiene el evento hoy (texto)
  guardada: string | null
  chinampas: ItemCatalogo[]
  onChange: (v: string) => void
}) {
  const fuera = guardada && !chinampas.some((c) => c.nombre === guardada) ? guardada : null
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-verde mb-1">
        Chinampa
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Sin asignar</option>
        {fuera && <option value={fuera}>{fuera} (fuera del catálogo)</option>}
        {chinampas.map((c) => (
          <option key={c.id} value={c.nombre}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SelectCocina({
  id,
  value,
  guardada,
  cocinas,
  onChange,
}: {
  id: string
  value: string
  guardada: { id: string; nombre: string | null } | null
  cocinas: ItemCatalogo[]
  onChange: (v: string) => void
}) {
  const fuera = guardada && !cocinas.some((c) => c.id === guardada.id) ? guardada : null
  const cocinasCocina = cocinas.filter((c) => c.tipo !== 'chef_invitado')
  const chefs = cocinas.filter((c) => c.tipo === 'chef_invitado')
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-verde mb-1">
        Cocina / chef
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Sin asignar</option>
        {fuera && <option value={fuera.id}>{fuera.nombre ?? 'Cocina guardada'} (archivada)</option>}
        {cocinasCocina.length > 0 && (
          <optgroup label="Cocina">
            {cocinasCocina.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </optgroup>
        )}
        {chefs.length > 0 && (
          <optgroup label="Chef invitado">
            {chefs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  )
}

export function SelectIdioma({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-verde mb-1">
        Idioma
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Sin definir</option>
        {IDIOMAS_EVENTO.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Casillas de guías (Personal con es_guia). Los externos llevan «(G.E)». Un guía que ya
 * está asignado pero ya no está activo se muestra marcado con «(inactivo)» para poder
 * quitarlo: el backend solo acepta guías activos.
 */
export function SelectorGuias({
  id,
  guias,
  asignados,
  seleccion,
  onChange,
}: {
  id: string
  guias: Personal[]
  // los que tiene el evento hoy
  asignados: GuiaEvento[]
  seleccion: string[]
  onChange: (ids: string[]) => void
}) {
  const inactivos = asignados.filter((a) => !guias.some((g) => g.id === a.personal_id))
  const opciones = [
    ...guias.map((g) => ({
      id: g.id,
      etiqueta: nombreGuia({
        nombre: `${g.nombre}${g.apellidos ? ` ${g.apellidos}` : ''}`,
        es_externo: g.es_externo,
      }),
      inactivo: false,
    })),
    ...inactivos.map((a) => ({
      id: a.personal_id,
      etiqueta: `${nombreGuia(a)} (inactivo)`,
      inactivo: true,
    })),
  ]
  const toggle = (gid: string) =>
    onChange(seleccion.includes(gid) ? seleccion.filter((x) => x !== gid) : [...seleccion, gid])
  const inactivoMarcado = inactivos.some((a) => seleccion.includes(a.personal_id))

  return (
    <fieldset>
      <legend className="flex w-full items-center justify-between text-sm font-medium text-verde mb-1">
        <span>Guías</span>
        <span className="text-xs font-normal text-verde-suave">
          {seleccion.length} {seleccion.length === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
      </legend>
      {opciones.length === 0 ? (
        <p className="border border-neutro-borde rounded-lg p-3 bg-neutro-light text-sm text-verde-suave">
          No hay guías activos en Personal.
        </p>
      ) : (
        <div
          id={id}
          data-testid={id}
          className="border border-neutro-borde rounded-lg p-2 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-2"
        >
          {opciones.map((o) => (
            <label
              key={o.id}
              htmlFor={`${id}-${o.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutro-light cursor-pointer"
            >
              <input
                id={`${id}-${o.id}`}
                type="checkbox"
                checked={seleccion.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
              />
              <span className={`text-sm ${o.inactivo ? 'text-verde-suave italic' : 'text-verde'}`}>
                {o.etiqueta}
              </span>
            </label>
          ))}
        </div>
      )}
      {inactivoMarcado && (
        <p className="text-xs text-rojo mt-1">
          Hay un guía que ya no está activo en Personal: quítalo para poder cambiar los guías.
        </p>
      )}
    </fieldset>
  )
}
