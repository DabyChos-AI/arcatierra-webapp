'use client'

// R4 · Tarjeta de la grilla semanal (sesión 44). Una reserva privada, una fecha pública o un
// evento interno. Quien tiene `reservas` (puedeEditar) ve lápices por campo y edita EN la tarjeta;
// guías y cocina ven lo mismo sin lápices, sin notas crudas, sin huecos y sin montos.

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ExternalLink, Loader2, Pencil } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { volverAlLoginDelPanel } from '@/lib/fetchPanel'
import {
  esConflictoVersion,
  etiquetaHueco,
  type ItemCatalogo,
  type ItemGrilla,
  type SemanaGrilla,
  type TipoFilaPlaneacion,
} from '@/types/planeacion'
import { formatMXN } from '@/types/reservas'
import {
  SelectChinampa,
  SelectCocina,
  SelectorGuias,
  etiquetaIdioma,
  inputClass,
  nombreGuia,
} from '../../eventos/components/CamposPlaneacion'
import type { CatalogosEventos } from '../../eventos/components/useCatalogosEventos'
import { extraerMensajeError } from '../../reservas/components/errores'
import {
  ESTADO_PAGO_TEXTO,
  ETIQUETA_CAMPO,
  TIPO_TEXTO,
  buscarItem,
  camposEditables,
  mismoValor,
  peticionGuardar,
  valorDe,
  type CampoEditable,
  type ValorCampo,
} from './edicionGrilla'

const TIEMPO_MAXIMO = 30_000

// Clases verificadas en tailwind.config.ts
const CHIP_TIPO: Record<TipoFilaPlaneacion, string> = {
  privada: 'bg-terracota/10 text-terracota-dark border-terracota/30',
  publica: 'bg-verde/10 text-verde border-verde/30',
  interno: 'bg-azul-bg text-azul border-azul/30',
}
const BORDE_TIPO: Record<TipoFilaPlaneacion, string> = {
  privada: 'border-l-terracota',
  publica: 'border-l-verde',
  interno: 'border-l-azul',
}

// Observaciones largas se recortan a 3 renglones y se expanden
const OBS_LARGA = 90

interface Editor {
  campo: CampoEditable
  valor: ValorCampo
  // lo guardado al abrir (o al releer tras un 409): decide si hubo cambio
  base: ValorCampo
  // versión con la que se guarda: la del item al abrir o la NUEVA tras un 409
  version: string | null
  // el item con el que se abrió (lo guardado que muestran los selects aunque salga del catálogo)
  item: ItemGrilla
}

function horario(item: ItemGrilla): string {
  if (!item.hora_inicio) return 'Sin hora'
  return item.hora_fin ? `${item.hora_inicio}–${item.hora_fin}` : item.hora_inicio
}

function mensajeDeFallo(e: unknown): string {
  const nombre = e instanceof Error ? e.name : ''
  return nombre === 'TimeoutError' || nombre === 'AbortError'
    ? 'El servidor tardó más de 30 segundos en responder. Reintenta.'
    : 'Sin conexión con el servidor. Revisa tu internet y reintenta.'
}

function SelectFuente({
  id,
  value,
  guardada,
  fuentes,
  onChange,
}: {
  id: string
  value: string
  guardada: { id: string; nombre: string | null } | null
  fuentes: ItemCatalogo[]
  onChange: (v: string) => void
}) {
  // Lo guardado se muestra aunque ya no esté en el catálogo activo: si no, el select lo borraría
  const fuera = guardada && !fuentes.some((f) => f.id === guardada.id) ? guardada : null
  const canales = fuentes.filter((f) => f.tipo !== 'persona')
  const personas = fuentes.filter((f) => f.tipo === 'persona')
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-verde mb-1">
        Fuente
      </label>
      <select id={id} data-testid={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Sin fuente</option>
        {fuera && <option value={fuera.id}>{fuera.nombre ?? 'Fuente guardada'} (archivada)</option>}
        {canales.length > 0 && (
          <optgroup label="Canal">
            {canales.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </optgroup>
        )}
        {personas.length > 0 && (
          <optgroup label="Persona">
            {personas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  )
}

/** Renglón «Etiqueta: valor ✎». El lápiz solo existe si `onEditar`. */
function Campo({
  etiqueta,
  valor,
  testid,
  onEditar,
  lapizTestid,
  lapizDeshabilitado,
}: {
  etiqueta: string
  valor: string | null
  testid: string
  onEditar?: () => void
  lapizTestid?: string
  lapizDeshabilitado?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-1">
      <p className="m-0 min-w-0 break-words text-xs text-verde-tipografia">
        <span className="text-verde-suave">{etiqueta}: </span>
        <span data-testid={testid} className={valor ? '' : 'text-verde-suave'}>
          {valor || '—'}
        </span>
      </p>
      {onEditar && (
        <button
          type="button"
          data-testid={lapizTestid}
          onClick={onEditar}
          disabled={lapizDeshabilitado}
          aria-label={`Editar ${etiqueta.toLowerCase()}`}
          title={`Editar ${etiqueta.toLowerCase()}`}
          className="shrink-0 rounded p-1 text-verde-suave transition hover:bg-neutro-light hover:text-terracota disabled:opacity-30"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default function TarjetaGrilla({
  item,
  puedeEditar,
  token,
  catalogos,
  recargar,
  onGuardado,
}: {
  item: ItemGrilla
  puedeEditar: boolean
  token: string | undefined
  catalogos: CatalogosEventos
  // relee la semana en silencio (sin desmontar) y devuelve lo nuevo (null si falló)
  recargar: () => Promise<SemanaGrilla | null>
  onGuardado: (texto: string) => void
}) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conflicto, setConflicto] = useState<string | null>(null)
  const [obsAbiertas, setObsAbiertas] = useState(false)

  const id = item.id
  const editables = puedeEditar ? camposEditables(item) : []
  const puede = (c: CampoEditable) => editables.includes(c)

  const abrir = (campo: CampoEditable) => {
    const valor = valorDe(item, campo)
    setEditor({ campo, valor, base: valor, version: item.version, item })
    setError(null)
    setConflicto(null)
  }

  const cerrar = () => {
    if (guardando) return
    setEditor(null)
    setError(null)
    setConflicto(null)
  }

  const guardar = async () => {
    if (!editor || !token || guardando) return
    if (mismoValor(editor.valor, editor.base)) {
      cerrar()
      return
    }
    const { campo } = editor
    setGuardando(true)
    setError(null)
    setConflicto(null)
    try {
      const { url, body } = peticionGuardar(item, campo, editor.valor, editor.version)
      const res = await fetch(`${API_URL}${url}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIEMPO_MAXIMO),
      })
      if (res.ok) {
        // El aviso se manda en el momento: si el filtro «solo huecos» saca esta tarjeta, no se pierde
        onGuardado(`Guardado: ${ETIQUETA_CAMPO[campo]} de «${item.titulo}».`)
        setEditor(null)
        void recargar()
        return
      }
      if (res.status === 401) {
        volverAlLoginDelPanel()
        setError('Tu sesión expiró. Vuelve a iniciar sesión para continuar.')
        return
      }
      const cuerpo: unknown = await res.json().catch(() => null)
      if (esConflictoVersion(res.status, cuerpo)) {
        // Alguien lo cambió: se relee, el editor queda abierto con el valor NUEVO y la versión
        // nueva; guardar otra vez es decisión de quien edita (nunca se reintenta solo).
        const nueva = await recargar()
        const fresco = buscarItem(nueva?.dias, item.tipo, item.id)
        if (fresco) {
          const v = valorDe(fresco, campo)
          setEditor({ campo, valor: v, base: v, version: fresco.version, item: fresco })
          // C8: el `detail` es neutro; la grilla ya releyó, así que dice qué hacer
          setConflicto(`${cuerpo.detail} Ya se cargó lo nuevo: revísalo y vuelve a guardar.`)
        } else {
          setConflicto(
            nueva
              ? `${cuerpo.detail} Ya no está en esta semana.`
              : `${cuerpo.detail} No se pudo releer la semana: reintenta.`,
          )
        }
        return
      }
      setError(extraerMensajeError(cuerpo, res.status))
    } catch (e) {
      setError(mensajeDeFallo(e))
    } finally {
      setGuardando(false)
    }
  }

  const guias = item.guias.length > 0 ? item.guias.map(nombreGuia).join(', ') : null
  const personas = [
    `${item.pax} ${item.pax === 1 ? 'persona' : 'personas'}`,
    item.ninos > 0 ? `${item.ninos} ${item.ninos === 1 ? 'niño' : 'niños'}` : null,
    item.staff > 0 ? `${item.staff} staff` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const obs = item.observaciones?.trim() ?? ''
  const obsLarga = obs.length > OBS_LARGA || obs.split('\n').length > 3
  const editorDe = editor?.campo
  const lapiz = (campo: CampoEditable) =>
    puede(campo)
      ? {
          onEditar: () => abrir(campo),
          lapizTestid: `planeacion-editar-${campo}-${id}`,
          lapizDeshabilitado: editor !== null,
        }
      : {}

  return (
    <article
      data-testid={`planeacion-fila-${id}`}
      data-tipo={item.tipo}
      data-tentativa={item.tentativa ? 'true' : 'false'}
      data-huecos={item.huecos.join(',')}
      className={`min-w-0 space-y-1.5 rounded-lg border border-l-4 border-neutro-borde bg-white p-2 shadow-sm ${
        BORDE_TIPO[item.tipo]
      } ${item.tentativa ? 'border-dashed' : ''}`}
    >
      {/* Horario y chips */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs font-semibold tabular-nums text-verde">{horario(item)}</span>
        <span
          className={`rounded-full border px-1.5 py-px text-[10px] font-semibold ${CHIP_TIPO[item.tipo]}`}
        >
          {TIPO_TEXTO[item.tipo]}
        </span>
        {item.tentativa && (
          <span
            data-testid={`planeacion-tentativa-${id}`}
            className="rounded-full border border-amarillo/40 bg-amarillo-bg px-1.5 py-px text-[10px] font-semibold italic text-verde-tipografia"
          >
            Tentativa
          </span>
        )}
      </div>

      <p className={`m-0 break-words text-sm font-semibold leading-snug text-verde ${item.tentativa ? 'italic' : ''}`}>
        {item.titulo}
      </p>

      {(item.folio || item.invitado) && (
        <div className="space-y-0.5 text-xs text-verde-tipografia">
          {item.folio && <p className="m-0 break-all font-mono text-[11px] text-verde-suave">{item.folio}</p>}
          {item.invitado && <p className="m-0 break-words">{item.invitado}</p>}
        </div>
      )}

      <p className="m-0 text-xs text-verde-tipografia">
        {personas}
        {item.idioma && <span className="text-verde-suave"> · {etiquetaIdioma(item.idioma)}</span>}
      </p>

      <div className="space-y-0.5">
        <Campo etiqueta="Guías" valor={guias} testid={`planeacion-guias-${id}`} {...lapiz('guias')} />
        <Campo etiqueta="Chinampa" valor={item.chinampa} testid={`planeacion-chinampa-${id}`} {...lapiz('chinampa')} />
        <Campo
          etiqueta="Cocina"
          valor={item.cocina_nombre ?? (item.cocina_id ? 'Cocina guardada' : null)}
          testid={`planeacion-cocina-${id}`}
          {...lapiz('cocina')}
        />
        {puede('fuente') && (
          <Campo etiqueta="Fuente" valor={item.fuente_nombre} testid={`planeacion-fuente-${id}`} {...lapiz('fuente')} />
        )}
      </div>

      {/* Observaciones (texto de la Junta) y lápiz de notas internas */}
      {(obs || puede('notas')) && (
        <div className="rounded bg-neutro-light px-1.5 py-1">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-verde-suave">Observaciones</span>
            {puede('notas') && (
              <button
                type="button"
                data-testid={`planeacion-editar-notas-${id}`}
                onClick={() => abrir('notas')}
                disabled={editor !== null}
                aria-label="Editar notas internas"
                title="Editar notas internas"
                className="shrink-0 rounded p-0.5 text-verde-suave transition hover:bg-white hover:text-terracota disabled:opacity-30"
              >
                <Pencil className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
          <p
            data-testid={`planeacion-observaciones-${id}`}
            className={`m-0 whitespace-pre-line break-words text-xs text-verde-tipografia ${
              obsLarga && !obsAbiertas ? 'line-clamp-3' : ''
            } ${obs ? '' : 'italic text-verde-suave'}`}
          >
            {obs || 'Sin observaciones'}
          </p>
          {obsLarga && (
            <button
              type="button"
              data-testid={`planeacion-ver-mas-${id}`}
              onClick={() => setObsAbiertas((v) => !v)}
              aria-expanded={obsAbiertas}
              className="text-[11px] font-semibold text-terracota hover:underline"
            >
              {obsAbiertas ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      )}

      {/* Huecos (solo privadas y solo a quien edita) */}
      {item.huecos.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="Datos que faltan">
          {item.huecos.map((h) => (
            <span
              key={h}
              data-testid={`planeacion-hueco-${h}-${id}`}
              className="rounded-full border border-amarillo/40 bg-amarillo-bg px-1.5 py-px text-[10px] font-semibold text-verde-tipografia"
            >
              {etiquetaHueco(h)}
            </span>
          ))}
        </div>
      )}

      {/* Montos (solo privadas y solo con `reportes`): se VEN aquí, se capturan en el detalle */}
      {item.montos && (
        <div
          data-testid={`planeacion-montos-${id}`}
          data-estado-pago={item.montos.estado_pago}
          className="space-y-0.5 rounded border border-neutro-borde px-1.5 py-1 text-xs tabular-nums text-verde-tipografia"
        >
          <p className="m-0 flex justify-between gap-1">
            <span className="text-verde-suave">Total</span>
            <span>{formatMXN(item.montos.total)}</span>
          </p>
          <p className="m-0 flex justify-between gap-1">
            <span className="text-verde-suave">Pagado</span>
            <span>{formatMXN(item.montos.pagado)}</span>
          </p>
          <p className="m-0 text-[11px] font-semibold text-verde">
            {ESTADO_PAGO_TEXTO[item.montos.estado_pago] ?? item.montos.estado_pago}
          </p>
        </div>
      )}

      {puedeEditar && item.tipo === 'privada' && !editor && (
        <Link
          href={`/admin/reservas?reserva_id=${encodeURIComponent(id)}`}
          data-testid={`planeacion-abrir-${id}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-terracota hover:underline"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Abrir reserva
        </Link>
      )}

      {/* Editor en la tarjeta */}
      {editor && (
        <div
          data-testid={`planeacion-editor-${id}`}
          data-campo={editorDe}
          className="space-y-2 rounded-lg border border-terracota/30 bg-terracota/5 p-2 [&_.grid]:grid-cols-1 [&_select]:bg-white [&_textarea]:bg-white"
        >
          {conflicto && (
            <div
              role="alert"
              data-testid={`planeacion-conflicto-${id}`}
              className="flex items-start gap-1 rounded border border-amarillo/40 bg-amarillo-bg p-1.5 text-[11px] leading-snug text-verde-tipografia"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amarillo" aria-hidden="true" />
              <span>{conflicto}</span>
            </div>
          )}
          {catalogos.error && editor.campo !== 'notas' && (
            <p className="m-0 rounded border border-amarillo/40 bg-amarillo-bg p-1.5 text-xs text-verde">
              {catalogos.error} Se muestra lo guardado.
            </p>
          )}
          {catalogos.cargando && editor.campo !== 'notas' ? (
            <p className="m-0 inline-flex items-center gap-1 text-xs text-verde-suave">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Cargando catálogos…
            </p>
          ) : editor.campo === 'chinampa' ? (
            <SelectChinampa
              id={`planeacion-input-chinampa-${id}`}
              value={typeof editor.valor === 'string' ? editor.valor : ''}
              guardada={editor.item.chinampa}
              chinampas={catalogos.chinampas}
              onChange={(v) => setEditor((e) => (e ? { ...e, valor: v } : e))}
            />
          ) : editor.campo === 'cocina' ? (
            <SelectCocina
              id={`planeacion-input-cocina-${id}`}
              value={typeof editor.valor === 'string' ? editor.valor : ''}
              guardada={
                editor.item.cocina_id
                  ? { id: editor.item.cocina_id, nombre: editor.item.cocina_nombre }
                  : null
              }
              cocinas={catalogos.cocinas}
              onChange={(v) => setEditor((e) => (e ? { ...e, valor: v } : e))}
            />
          ) : editor.campo === 'fuente' ? (
            <SelectFuente
              id={`planeacion-input-fuente-${id}`}
              value={typeof editor.valor === 'string' ? editor.valor : ''}
              guardada={
                editor.item.fuente_id
                  ? { id: editor.item.fuente_id, nombre: editor.item.fuente_nombre }
                  : null
              }
              fuentes={catalogos.fuentes}
              onChange={(v) => setEditor((e) => (e ? { ...e, valor: v } : e))}
            />
          ) : editor.campo === 'guias' ? (
            <SelectorGuias
              id={`planeacion-input-guias-${id}`}
              guias={catalogos.guias}
              asignados={editor.item.guias}
              seleccion={Array.isArray(editor.valor) ? editor.valor : []}
              onChange={(ids) => setEditor((e) => (e ? { ...e, valor: ids } : e))}
            />
          ) : (
            <div>
              <label htmlFor={`planeacion-input-notas-${id}`} className="mb-1 block text-sm font-medium text-verde">
                Notas internas
              </label>
              <textarea
                id={`planeacion-input-notas-${id}`}
                data-testid={`planeacion-input-notas-${id}`}
                rows={4}
                maxLength={4000}
                value={typeof editor.valor === 'string' ? editor.valor : ''}
                onChange={(ev) => {
                  const v = ev.target.value
                  setEditor((e) => (e ? { ...e, valor: v } : e))
                }}
                className={inputClass}
              />
            </div>
          )}

          {error && (
            <p
              role="alert"
              data-testid={`planeacion-aviso-error-${id}`}
              className="m-0 rounded border border-rojo/30 bg-rojo-bg p-1.5 text-xs text-rojo"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              data-testid={`planeacion-guardar-${id}`}
              onClick={guardar}
              disabled={guardando || mismoValor(editor.valor, editor.base)}
              title={mismoValor(editor.valor, editor.base) ? 'Sin cambios' : undefined}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-terracota px-2 py-1 text-xs font-semibold text-white transition hover:bg-terracota-dark disabled:opacity-50"
            >
              {guardando && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
              Guardar
            </button>
            <button
              type="button"
              data-testid={`planeacion-cancelar-${id}`}
              onClick={cerrar}
              disabled={guardando}
              className="flex-1 rounded-md border border-neutro-borde bg-white px-2 py-1 text-xs text-verde transition hover:bg-neutro-light disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
