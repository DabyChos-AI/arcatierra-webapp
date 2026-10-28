'use client'

// «Contenido del sitio» (WF7): agregar o editar un elemento de una sección.
// - Alta: POST /api/admin/contenido-sitio (al final de la lista; borrador o publicado). Edición: PATCH /{id} con `version`
//   y SOLO lo que cambió (`datos` completo si cambió algún campo: la API lo reemplaza entero).
// - 409 de versión: NO se pierde lo escrito. Se relee, se muestra lo que guardó la otra persona y el siguiente «Guardar»
//   va con la versión nueva (reemplaza la suya). 409 de clave o de las 8 fotos: su mensaje tal cual. El modal no se cierra
//   en ningún error (role=alert).
// - Validación igual a la de la API; el botón se puede pulsar y dice qué falta (no se deshabilita sin explicar).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { confirmar } from '@/components/ui/Avisos'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { NOMBRE_SECCION, type ItemContenido, type SeccionContenido } from '@/types/contenido-sitio'
import SubirImagen from './SubirImagen'
import {
  CAMPOS,
  CAMPO_CLAVE,
  CAMPO_DESDE,
  CAMPO_FUENTE,
  CAMPO_HASTA,
  CLAVES_SUGERIDAS,
  CLAVE_MAX,
  FUENTE_MAX,
  NOMBRE_ELEMENTO,
  TEXTO_SESION,
  TEXTO_SIN_PERMISO,
  TEXTO_VERSION,
  clasificarError,
  cuerpoCrear,
  cuerpoEditar,
  dato,
  formularioDe,
  formularioVacio,
  normalizarItem,
  textoUltimoCambio,
  textoVigencia,
  usaClave,
  usaFuente,
  usaVigencia,
  validar,
  type Formulario,
} from './contenido'

interface Props {
  token: string
  seccion: SeccionContenido
  /** null = agregar uno nuevo. */
  item: ItemContenido | null
  /** `orden` del alta: después del último de la sección. */
  ordenNuevo: number
  onClose: () => void
  onGuardado: (item: ItemContenido, creado: boolean) => void
  /** Relee TODO (con archivados) y regresa la lista fresca: la usa el 409 de versión. */
  releer: () => Promise<ItemContenido[] | null>
}

const CLASE_INPUT =
  'min-h-[44px] w-full rounded-lg border border-neutro-borde bg-white px-3 py-2 text-sm text-verde-tipografia focus:border-terracota focus:ring-2 focus:ring-terracota/30 disabled:opacity-50'

export default function ModalElemento({ token, seccion, item, ordenNuevo, onClose, onGuardado, releer }: Props) {
  const editando = item !== null
  const [base, setBase] = useState<ItemContenido | null>(item)
  const [form, setForm] = useState<Formulario>(() => (item ? formularioDe(item) : formularioVacio(seccion)))
  const [publicar, setPublicar] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [sinCambios, setSinCambios] = useState(false)
  const [conflicto, setConflicto] = useState<ItemContenido | null>(null)
  const guardandoRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const errores = useMemo(() => validar(seccion, form), [seccion, form])
  const visibles = intentado ? errores : {}
  const original = useMemo(() => (item ? formularioDe(item) : formularioVacio(seccion)), [item, seccion])
  const sucio = useMemo(() => Object.keys(form).some((k) => (form[k] ?? '') !== (original[k] ?? '')) || publicar, [form, original, publicar])

  const cambiar = (campo: string, valor: string) => {
    setSinCambios(false)
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  const cerrar = useCallback(async () => {
    if (guardandoRef.current || subiendo > 0) return
    if (sucio) {
      const ok = await confirmar({
        titulo: 'Descartar cambios',
        mensaje: 'Lo que escribiste en este formulario no se ha guardado.',
        textoAceptar: 'Descartar',
        textoCancelar: 'Seguir editando',
      })
      if (!ok) return
    }
    onClose()
  }, [onClose, subiendo, sucio])

  // Escape cierra (salvo a media petición), con la misma pregunta si hay cambios
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void cerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [cerrar])

  function enfocarPrimerError(errs: Record<string, string>) {
    const primero = Object.keys(errs)[0]
    if (!primero) return
    // Los campos de imagen no llevan data-campo: su input de dirección tiene el id cs-campo-<nombre>.
    const el =
      formRef.current?.querySelector<HTMLElement>(`[data-campo="${primero}"]`) ??
      formRef.current?.querySelector<HTMLElement>(`#cs-campo-${primero}`)
    el?.focus()
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (guardandoRef.current) return
    setIntentado(true)
    setError(null)
    if (subiendo > 0) {
      setError('Espera a que termine de subir la imagen.')
      return
    }
    if (Object.keys(errores).length > 0) {
      setError('Revisa los campos marcados.')
      enfocarPrimerError(errores)
      return
    }
    const cuerpo = base ? cuerpoEditar(base, form) : cuerpoCrear(seccion, form, ordenNuevo, publicar)
    if (!cuerpo) {
      setSinCambios(true)
      return
    }
    guardandoRef.current = true
    setGuardando(true)
    try {
      const res = await fetch(
        base ? `${API_URL}/api/admin/contenido-sitio/${encodeURIComponent(base.id)}` : `${API_URL}/api/admin/contenido-sitio`,
        {
          method: base ? 'PATCH' : 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(cuerpo),
          cache: 'no-store',
          signal: AbortSignal.timeout(30_000),
        },
      )
      const payload: unknown = await res.json().catch(() => null)
      if (res.ok) {
        const guardado = normalizarItem(payload)
        if (!guardado) {
          setError('Se guardó, pero la respuesta no trae el elemento. Cierra y pulsa «Actualizar».')
          return
        }
        setConflicto(null)
        onGuardado(guardado, !base)
        return
      }
      const r = clasificarError(res.status, payload, extraerMensajeError(payload, res.status))
      if (r.tipo === 'version' && base) {
        const lista = await releer()
        const fresco = lista?.find((i) => i.id === base.id) ?? null
        if (fresco && fresco.version !== base.version) {
          // Lo escrito se queda; el siguiente «Guardar» va contra la versión nueva.
          setBase(fresco)
          setConflicto(fresco)
          setError(null)
        } else {
          // El 409 no era de versión (forma vieja sin código): su texto tal cual.
          setError(extraerMensajeError(payload, res.status))
        }
      } else if (r.tipo === 'conflicto' || r.tipo === 'version') {
        setError(r.tipo === 'conflicto' ? r.texto : extraerMensajeError(payload, res.status))
      } else if (r.tipo === 'sesion') {
        setError(TEXTO_SESION)
      } else if (r.tipo === 'permiso') {
        setError(TEXTO_SIN_PERMISO)
      } else {
        setError(r.texto)
      }
    } catch (err) {
      const porTiempo = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
      setError(porTiempo ? 'El servidor tardó más de 30 segundos. Intenta de nuevo.' : 'Sin conexión con el servidor. Intenta de nuevo.')
    } finally {
      guardandoRef.current = false
      setGuardando(false)
    }
  }

  const titulo = `${editando ? 'Editar' : 'Agregar'} ${NOMBRE_ELEMENTO[seccion]}`
  const ocupado = guardando || subiendo > 0
  const describir = (campo: string, ayuda: boolean) =>
    [ayuda ? `cs-ayuda-${campo}` : null, visibles[campo] ? `cs-error-${campo}` : null].filter(Boolean).join(' ') || undefined

  const errorDe = (campo: string) =>
    visibles[campo] ? (
      <p id={`cs-error-${campo}`} data-testid={`cs-error-${campo}`} role="alert" className="mt-1 text-xs text-rojo">
        {visibles[campo]}
      </p>
    ) : null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-4 pt-10 sm:pt-16"
      onClick={(e) => {
        // El 2.º clic de un doble clic no cuenta como «clic fuera» (s48).
        if (e.target === e.currentTarget && e.detail <= 1) void cerrar()
      }}
    >
      <form
        ref={formRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-modal-titulo"
        data-testid="cs-modal"
        data-modo={editando ? 'editar' : 'crear'}
        data-seccion={seccion}
        noValidate
        onSubmit={guardar}
        className="flex max-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl sm:max-h-[calc(100dvh-5rem)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-neutro-borde px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id="cs-modal-titulo" data-testid="cs-modal-titulo" className="m-0 font-display text-xl text-verde">
              {titulo}
            </h2>
            <p className="text-xs text-verde-medio">{NOMBRE_SECCION[seccion]}</p>
          </div>
          <button
            type="button"
            onClick={() => void cerrar()}
            disabled={ocupado}
            aria-label="Cerrar"
            data-testid="cs-cerrar"
            className="rounded-lg p-2 hover:bg-neutro-light disabled:opacity-50"
          >
            <X className="h-5 w-5 text-verde-medio" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 py-4 sm:px-6">
          {conflicto && (
            <div data-testid="cs-conflicto" role="alert" className="space-y-2 rounded-lg border border-amarillo/40 bg-amarillo-bg p-3 text-sm text-verde-tipografia">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-terracota-dark" aria-hidden="true" />
                <span>{TEXTO_VERSION}</span>
              </p>
              <div data-testid="cs-conflicto-guardado" className="rounded-lg border border-neutro-borde bg-white p-3">
                <p className="mb-1 text-xs font-semibold text-verde">Lo que hay guardado ahora · {textoUltimoCambio(conflicto)}</p>
                <dl className="space-y-1 text-xs">
                  {usaClave(seccion) && (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-medium text-verde">Clave:</dt>
                      <dd className="min-w-0 break-words font-mono text-verde-tipografia">{conflicto.clave ?? '—'}</dd>
                    </div>
                  )}
                  {CAMPOS[seccion].map((c) => (
                    <div key={c.nombre} className="flex flex-wrap gap-x-2">
                      <dt className="font-medium text-verde">{c.etiqueta}:</dt>
                      <dd className="min-w-0 whitespace-pre-line break-words text-verde-tipografia">{dato(conflicto, c.nombre) || '—'}</dd>
                    </div>
                  ))}
                  {usaFuente(seccion) && (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-medium text-verde">Fuente:</dt>
                      <dd className="min-w-0 break-words text-verde-tipografia">{conflicto.fuente ?? '—'}</dd>
                    </div>
                  )}
                  {usaVigencia(seccion) && (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-medium text-verde">Vigencia:</dt>
                      <dd className="min-w-0 break-words text-verde-tipografia">{textoVigencia(conflicto)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <button
                type="button"
                data-testid="cs-conflicto-usar"
                onClick={() => {
                  setForm(formularioDe(conflicto))
                  setConflicto(null)
                  setIntentado(false)
                }}
                className="min-h-[44px] rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde hover:bg-neutro-light"
              >
                Usar lo guardado (descarta lo que escribiste)
              </button>
            </div>
          )}

          {usaClave(seccion) && (
            <div>
              <label htmlFor="cs-campo-clave" className="mb-1 block text-sm font-medium text-verde">
                Clave *
              </label>
              <input
                id="cs-campo-clave"
                data-testid="cs-campo-clave"
                data-campo={CAMPO_CLAVE}
                type="text"
                autoComplete="off"
                spellCheck={false}
                list="cs-claves-sugeridas"
                maxLength={CLAVE_MAX}
                value={form[CAMPO_CLAVE]}
                disabled={ocupado}
                onChange={(e) => cambiar(CAMPO_CLAVE, e.target.value)}
                aria-describedby={describir(CAMPO_CLAVE, true)}
                aria-invalid={visibles[CAMPO_CLAVE] ? true : undefined}
                className={`${CLASE_INPUT} font-mono`}
              />
              {CLAVES_SUGERIDAS[seccion] && (
                <datalist id="cs-claves-sugeridas">
                  {CLAVES_SUGERIDAS[seccion]?.map((c) => <option key={c} value={c} />)}
                </datalist>
              )}
              <p id={`cs-ayuda-${CAMPO_CLAVE}`} className="mt-1 text-xs text-verde-medio">
                Minúsculas sin acentos, números y «_». El sitio nuevo busca el elemento por esta clave
                {editando ? ': si la cambias, deja de salir donde estaba.' : '.'}
              </p>
              {errorDe(CAMPO_CLAVE)}
            </div>
          )}

          {CAMPOS[seccion].map((c) => {
            const id = `cs-campo-${c.nombre}`
            const valor = form[c.nombre] ?? ''
            if (c.tipo === 'imagen') {
              return (
                <SubirImagen
                  key={c.nombre}
                  token={token}
                  id={id}
                  testid={id}
                  etiqueta={c.etiqueta}
                  requerido={c.requerido}
                  valor={valor}
                  onCambio={(url) => cambiar(c.nombre, url)}
                  ayuda={c.ayuda}
                  error={visibles[c.nombre]}
                  deshabilitado={guardando}
                  onSubiendo={(s) => setSubiendo((n) => Math.max(0, n + (s ? 1 : -1)))}
                />
              )
            }
            const comun = {
              id,
              'data-testid': id,
              'data-campo': c.nombre,
              value: valor,
              disabled: ocupado,
              'aria-describedby': describir(c.nombre, true),
              'aria-invalid': visibles[c.nombre] ? true : undefined,
            }
            return (
              <div key={c.nombre}>
                <label htmlFor={id} className="mb-1 block text-sm font-medium text-verde">
                  {c.etiqueta}
                  {c.requerido ? ' *' : ''}
                </label>
                {c.tipo === 'area' ? (
                  <textarea
                    {...comun}
                    rows={c.max > 1000 ? 6 : 3}
                    maxLength={c.max}
                    onChange={(e) => cambiar(c.nombre, e.target.value)}
                    className={`${CLASE_INPUT} resize-y`}
                  />
                ) : (
                  <input
                    {...comun}
                    type={c.tipo === 'fecha' ? 'date' : 'text'}
                    inputMode={c.tipo === 'url' ? 'url' : undefined}
                    autoComplete="off"
                    maxLength={c.tipo === 'fecha' ? undefined : c.max}
                    onChange={(e) => cambiar(c.nombre, e.target.value)}
                    className={CLASE_INPUT}
                  />
                )}
                <p id={`cs-ayuda-${c.nombre}`} className="mt-1 flex flex-wrap justify-between gap-x-3 text-xs text-verde-medio">
                  <span>{c.ayuda ?? (c.requerido ? 'Obligatorio.' : 'Opcional.')}</span>
                  {(c.tipo === 'texto' || c.tipo === 'area') && (
                    <span data-testid={`cs-contador-${c.nombre}`}>
                      {valor.length}/{c.max}
                    </span>
                  )}
                </p>
                {errorDe(c.nombre)}
              </div>
            )
          })}

          {usaFuente(seccion) && (
            <div>
              <label htmlFor="cs-campo-fuente" className="mb-1 block text-sm font-medium text-verde">
                Fuente *
              </label>
              <textarea
                id="cs-campo-fuente"
                data-testid="cs-campo-fuente"
                data-campo={CAMPO_FUENTE}
                rows={2}
                maxLength={FUENTE_MAX}
                value={form[CAMPO_FUENTE]}
                disabled={ocupado}
                onChange={(e) => cambiar(CAMPO_FUENTE, e.target.value)}
                aria-describedby={describir(CAMPO_FUENTE, true)}
                aria-invalid={visibles[CAMPO_FUENTE] ? true : undefined}
                className={`${CLASE_INPUT} resize-y`}
              />
              <p id={`cs-ayuda-${CAMPO_FUENTE}`} className="mt-1 flex flex-wrap justify-between gap-x-3 text-xs text-verde-medio">
                <span>De dónde sale el dato: quién lo dio y cuándo. No sale en el sitio.</span>
                <span>
                  {form[CAMPO_FUENTE].length}/{FUENTE_MAX}
                </span>
              </p>
              {errorDe(CAMPO_FUENTE)}
            </div>
          )}

          {usaVigencia(seccion) && (
            <fieldset className="space-y-3 rounded-lg border border-neutro-borde p-3">
              <legend className="px-1 text-sm font-medium text-verde">Vigencia (hora de México)</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(
                  [
                    [CAMPO_DESDE, 'cs-campo-desde', 'Desde'],
                    [CAMPO_HASTA, 'cs-campo-hasta', 'Hasta'],
                  ] as const
                ).map(([campo, id, etiqueta]) => (
                  <div key={campo} className="min-w-0">
                    <label htmlFor={id} className="mb-1 block text-sm text-verde">
                      {etiqueta}
                    </label>
                    <input
                      id={id}
                      data-testid={id}
                      data-campo={campo}
                      type="datetime-local"
                      value={form[campo]}
                      disabled={ocupado}
                      onChange={(e) => cambiar(campo, e.target.value)}
                      aria-describedby={describir(campo, false) ?? 'cs-ayuda-vigencia'}
                      aria-invalid={visibles[campo] ? true : undefined}
                      className={CLASE_INPUT}
                    />
                    {errorDe(campo)}
                  </div>
                ))}
              </div>
              <p id="cs-ayuda-vigencia" className="text-xs text-verde-medio">
                Vacío = sin límite. El anuncio sale solo si está publicado y la hora de México está entre estas dos.
              </p>
            </fieldset>
          )}

          {!editando && (
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-neutro-borde p-3 text-sm text-verde-tipografia">
              <input
                type="checkbox"
                data-testid="cs-publicar"
                checked={publicar}
                disabled={ocupado}
                onChange={(e) => setPublicar(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutro-borde text-terracota focus:ring-terracota"
              />
              <span>
                <span className="font-medium text-verde">Publicar al guardar</span>
                <span className="block text-xs text-verde-medio">
                  Si no, queda como borrador y no sale en el sitio hasta que lo publiques.
                </span>
              </span>
            </label>
          )}

          {sinCambios && (
            <p data-testid="cs-sin-cambios" role="status" className="text-sm text-verde-medio">
              No hay cambios que guardar.
            </p>
          )}

          {error && (
            <div
              role="alert"
              data-testid="cs-modal-error"
              className="flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg p-3 text-sm text-red-700"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-neutro-borde px-4 py-4 sm:px-6">
          <button
            type="button"
            data-testid="cs-cancelar"
            onClick={() => void cerrar()}
            disabled={ocupado}
            className="min-h-[44px] rounded-lg border border-neutro-borde px-4 text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="cs-guardar"
            disabled={ocupado}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-terracota px-4 text-sm font-medium text-white hover:bg-terracota-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {editando ? 'Guardar cambios' : publicar ? 'Guardar y publicar' : 'Guardar borrador'}
          </button>
        </footer>
      </form>
    </div>
  )
}
