'use client'

// Tarjeta de una reserva en Mi día (K4, R8, DR22). Pensada para el celular (390 px): hora grande, chips, alergias
// resaltadas, invitados plegables y el check «Llegaron». SIN teléfono, correo ni ligas tel:/mailto: (el backend no los
// manda y aquí no se pintan otros campos que los de `ReservaMiDia`).

import { useState } from 'react'
import { AlertTriangle, ChevronDown, Clock, MapPin, Languages, Users, Baby, CheckCircle2, Undo2, ScanLine } from 'lucide-react'
import { horaMexico, type ReservaMiDia } from '@/types/mi-dia'
import {
  ETIQUETA_ESTADO,
  horaCorta,
  leerPersonasLlegaron,
  plural,
  renglonesAlergias,
  textoIdioma,
} from './textos'
import { aviso } from '@/components/ui/Avisos'

interface Props {
  r: ReservaMiDia
  /** true mientras su POST/DELETE de llegada está en vuelo (candado contra doble toque). */
  enCurso: boolean
  onMarcar: (reservaId: string, personas: number | null) => void
  onDeshacer: (reservaId: string) => void
  /** R9 (DR23): la reserva que abrió el QR del portal (`?reserva=<id>`): franja «Reserva escaneada» y borde. */
  escaneada?: boolean
}

const CLASE_ESTADO: Record<ReservaMiDia['estado'], string> = {
  confirmada: 'bg-azul-bg text-azul',
  pagada: 'bg-verde/10 text-verde',
  realizada: 'bg-neutro-light text-verde-suave',
}

export default function TarjetaMiDia({ r, enCurso, onMarcar, onDeshacer, escaneada = false }: Props) {
  const [invitadosAbiertos, setInvitadosAbiertos] = useState(false)
  const [personasTexto, setPersonasTexto] = useState(String(r.personas))

  const alergias = renglonesAlergias(r)
  const idioma = textoIdioma(r.idioma)
  const inicio = horaCorta(r.hora_inicio)
  const fin = horaCorta(r.hora_fin)
  const idLista = `midia-invitados-lista-${r.reserva_id}`
  const idPersonas = `midia-personas-${r.reserva_id}`

  function marcar() {
    const n = leerPersonasLlegaron(personasTexto)
    if (n === undefined) {
      aviso.error('Escribe cuántas personas llegaron (de 0 a 999) o deja el campo vacío.')
      return
    }
    onMarcar(r.reserva_id, n)
  }

  return (
    <article
      data-testid={`midia-reserva-${r.reserva_id}`}
      data-estado={r.estado}
      data-llegada={r.llegada ? '1' : '0'}
      data-escaneada={escaneada ? '1' : undefined}
      className={
        escaneada
          ? 'scroll-mt-4 rounded-xl border-2 border-terracota bg-white p-4 shadow-soft ring-2 ring-terracota/30'
          : 'rounded-xl border border-neutro-borde bg-white p-4 shadow-soft'
      }
    >
      {escaneada && (
        <p
          data-testid="midia-escaneada"
          className="-mx-4 -mt-4 mb-3 flex items-center gap-1.5 rounded-t-[10px] bg-terracota px-4 py-2 text-sm font-semibold text-white"
        >
          <ScanLine className="h-4 w-4 shrink-0" aria-hidden="true" />
          Reserva escaneada
        </p>
      )}
      {/* Hora + estado */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-baseline gap-2 text-verde" data-testid={`midia-hora-${r.reserva_id}`}>
          <Clock className="h-5 w-5 shrink-0 self-center text-terracota" aria-hidden="true" />
          <span className="text-3xl font-bold leading-none">{inicio}</span>
          {fin && <span className="text-sm text-verde-suave">a {fin}</span>}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CLASE_ESTADO[r.estado]}`}>
          {ETIQUETA_ESTADO[r.estado] ?? r.estado}
        </span>
      </div>

      {/* Experiencia y grupo */}
      <h2 className="mb-0 mt-2 font-display text-xl leading-snug text-verde">{r.experiencia_nombre}</h2>
      {r.grupo_nombre && <p className="mt-0.5 text-sm text-verde-tipografia">Grupo: {r.grupo_nombre}</p>}
      <p className="mt-0.5 text-xs text-verde-suave">Folio {r.booking_id}</p>

      {/* Chinampa e idioma */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-verde-tipografia">
        {r.chinampa && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4 text-verde-suave" aria-hidden="true" />
            {r.chinampa}
          </span>
        )}
        {idioma && (
          <span className="inline-flex items-center gap-1">
            <Languages className="h-4 w-4 text-verde-suave" aria-hidden="true" />
            {idioma}
          </span>
        )}
      </div>

      {/* Chips de personas y niños */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          data-testid={`midia-personas-chip-${r.reserva_id}`}
          className="inline-flex items-center gap-1 rounded-full bg-verde/10 px-3 py-1 text-sm font-semibold text-verde"
        >
          <Users className="h-4 w-4" aria-hidden="true" />
          {plural(r.personas, 'persona', 'personas')}
        </span>
        <span
          data-testid={`midia-ninos-chip-${r.reserva_id}`}
          className="inline-flex items-center gap-1 rounded-full bg-amarillo-bg px-3 py-1 text-sm font-semibold text-verde-tipografia"
        >
          <Baby className="h-4 w-4" aria-hidden="true" />
          {plural(r.ninos, 'niño', 'niños')}
        </span>
      </div>

      {/* Alergias resaltadas */}
      {alergias.length > 0 ? (
        <div
          data-testid={`midia-alergias-${r.reserva_id}`}
          className="mt-3 rounded-lg border border-rojo/30 bg-rojo-bg p-3"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-rojo">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Alergias
          </p>
          <ul className="mt-1 space-y-0.5 text-sm text-verde-tipografia">
            {alergias.map((a, i) => (
              <li key={i} className="whitespace-pre-line break-words">
                {a}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-xs text-verde-suave">Sin alergias registradas.</p>
      )}

      {/* Invitados plegables */}
      {r.invitados.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            data-testid={`midia-invitados-${r.reserva_id}`}
            aria-expanded={invitadosAbiertos}
            aria-controls={idLista}
            onClick={() => setInvitadosAbiertos((v) => !v)}
            className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-neutro-borde px-3 text-sm font-medium text-verde hover:bg-neutro-light"
          >
            <span>Invitados ({r.invitados.length})</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${invitadosAbiertos ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {invitadosAbiertos && (
            <ul id={idLista} data-testid={idLista} className="mt-2 divide-y divide-neutro-borde rounded-lg border border-neutro-borde">
              {r.invitados.map((inv, i) => {
                const datos = [
                  inv.edad !== null && inv.edad !== undefined ? `${inv.edad} años` : '',
                  textoIdioma(inv.idioma),
                ].filter(Boolean)
                return (
                  <li key={i} className="px-3 py-2 text-sm">
                    <p className="font-medium text-verde-tipografia">{(inv.nombre ?? '').trim() || `Invitado ${i + 1}`}</p>
                    {datos.length > 0 && <p className="text-xs text-verde-suave">{datos.join(' · ')}</p>}
                    {inv.alergias && inv.alergias.trim() && (
                      <p className="mt-0.5 rounded bg-rojo-bg px-1.5 py-0.5 text-xs text-rojo">Alergias: {inv.alergias}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* Guías */}
      <p className="mt-3 text-sm text-verde-tipografia" data-testid={`midia-guias-${r.reserva_id}`}>
        <span className="text-verde-suave">Guías: </span>
        {r.guias.length > 0 ? r.guias.map((g) => g.nombre).join(', ') : 'Sin guía asignado'}
      </p>

      {/* Llegada */}
      {r.llegada ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-verde/10 p-3">
          <p data-testid={`midia-llegada-${r.reserva_id}`} className="flex items-center gap-1.5 text-sm font-semibold text-verde">
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              Llegaron {horaMexico(r.llegada.llegada_en)}
              {r.llegada.registrada_por_nombre ? ` · ${r.llegada.registrada_por_nombre}` : ''}
              {r.llegada.personas_llegaron !== null && r.llegada.personas_llegaron !== undefined
                ? ` · ${plural(r.llegada.personas_llegaron, 'persona', 'personas')}`
                : ''}
            </span>
          </p>
          {r.puede_marcar_llegada && (
            <button
              type="button"
              data-testid={`midia-deshacer-${r.reserva_id}`}
              disabled={enCurso}
              onClick={() => onDeshacer(r.reserva_id)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-neutro-borde bg-white px-4 text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Deshacer
            </button>
          )}
        </div>
      ) : (
        r.puede_marcar_llegada && (
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutro-borde pt-3">
            <div className="w-28">
              <label htmlFor={idPersonas} className="block text-xs text-verde-suave">
                ¿Cuántas llegaron?
              </label>
              <input
                id={idPersonas}
                data-testid={idPersonas}
                type="number"
                inputMode="numeric"
                min={0}
                max={999}
                value={personasTexto}
                onChange={(e) => setPersonasTexto(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-lg border border-neutro-borde px-3 text-base text-verde-tipografia"
              />
            </div>
            <button
              type="button"
              data-testid={`midia-llegaron-${r.reserva_id}`}
              disabled={enCurso}
              onClick={marcar}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-verde px-4 text-base font-semibold text-white hover:bg-verde-claro disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              {enCurso ? 'Guardando…' : 'Llegaron'}
            </button>
          </div>
        )
      )}
    </article>
  )
}
