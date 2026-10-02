'use client'

// GUI1 (R8, sesión 48): «Cuenta del panel» de una ficha de Personal.
// Pide GET /api/admin/personal/cuentas-panel?para=<personal_id> (forma en src/types/catalogos.ts) y muestra
// «nombre · roles» SIN correos. Las que coinciden por nombre van arriba («Sugerida»); las ligadas a OTRA ficha van al
// final y deshabilitadas («ligada a <nombre>»); «Sin cuenta» = null. Nadie se liga solo: la persona elige y guarda.

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import { etiquetaRol } from '@/app/admin/components/MisRolesContext'
import type { CuentaLigada, CuentaPanel, CuentasPanelResponse } from '@/types/catalogos'

const TEXTO_AYUDA = 'Con su cuenta ligada, el guía ve sus experiencias en Mi día.'

/** Defensa: un nombre de cuenta nunca se pinta con un correo (regla R8 §0). */
export function nombreSinCorreo(nombre: string | null | undefined): string {
  const limpio = (nombre ?? '').replace(/[^\s@]+@[^\s@]+/g, '').replace(/\s+/g, ' ').trim()
  return limpio || 'Cuenta sin nombre'
}

function rolesLegibles(roles: unknown): string {
  if (!Array.isArray(roles)) return ''
  return roles
    .map((r) => (typeof r === 'string' ? etiquetaRol(r) : null))
    .filter((r): r is string => !!r)
    .join(', ')
}

function textoCuenta(c: CuentaPanel): string {
  const roles = rolesLegibles(c.roles)
  return `${nombreSinCorreo(c.nombre)} · ${roles || 'Sin rol'}`
}

function cuentasValidas(data: unknown): CuentaPanel[] {
  const items = (data as Partial<CuentasPanelResponse> | null)?.items
  if (!Array.isArray(items)) return []
  return items.filter(
    (c): c is CuentaPanel => !!c && typeof c === 'object' && typeof (c as CuentaPanel).usuario_id === 'string',
  )
}

interface Props {
  token: string | undefined
  /** Ficha que se edita; null = alta (sin sugerencias: el backend sugiere contra una ficha guardada). */
  personalId: string | null
  /** usuario_id elegido (null = «Sin cuenta»). */
  valor: string | null
  /** La cuenta que ya trae la ficha: se pinta aunque la lista no cargue, para no desligarla por accidente. */
  cuentaActual: CuentaLigada | null
  onChange: (usuarioId: string | null) => void
  disabled?: boolean
}

export default function SelectorCuentaPanel({ token, personalId, valor, cuentaActual, onChange, disabled }: Props) {
  const [cuentas, setCuentas] = useState<CuentaPanel[] | null>(null)
  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!token) return
    let vigente = true
    setCargando(true)
    setErrorCarga(null)
    const qs = personalId ? `?para=${encodeURIComponent(personalId)}` : ''
    fetch(`${API_URL}/api/admin/personal/cuentas-panel${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const payload: unknown = await res.json().catch(() => null)
        if (!res.ok) throw new Error(extraerMensajeError(payload, res.status))
        if (vigente) setCuentas(cuentasValidas(payload))
      })
      .catch((err: unknown) => {
        if (!vigente) return
        setCuentas(null)
        setErrorCarga(err instanceof Error && err.message ? err.message : 'No se pudieron cargar las cuentas del panel.')
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [token, personalId, intento])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  const ligadaAOtra = (c: CuentaPanel) => !!c.ligada_a && c.ligada_a.personal_id !== personalId
  const lista = cuentas ?? []
  const sugeridas = lista.filter((c) => c.coincide && !ligadaAOtra(c))
  const libres = lista.filter((c) => !c.coincide && !ligadaAOtra(c))
  const ligadas = lista.filter(ligadaAOtra)
  // La cuenta elegida que no viene en la lista (la lista no cargó o la API no la mandó): se pinta igual.
  const elegidaFuera = !!valor && !lista.some((c) => c.usuario_id === valor)
  const nombreElegidaFuera =
    cuentaActual && cuentaActual.usuario_id === valor ? nombreSinCorreo(cuentaActual.nombre) : 'Cuenta ligada'

  const bloqueado = disabled || cargando || cuentas === null

  return (
    <div>
      <label htmlFor="per-cuenta" className="block text-sm font-medium text-verde mb-1">
        Cuenta del panel
      </label>
      <div className="flex items-center gap-2">
        <select
          id="per-cuenta"
          data-testid="personal-cuenta-select"
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value ? e.target.value : null)}
          disabled={bloqueado}
          aria-describedby="per-cuenta-ayuda"
          className="w-full min-w-0 px-3 py-2 border border-neutro-borde rounded-lg text-sm bg-white focus:ring-2 focus:ring-terracota/30 focus:border-terracota disabled:bg-neutro-light disabled:cursor-not-allowed"
        >
          <option value="">Sin cuenta</option>
          {elegidaFuera && valor && (
            <option value={valor} data-testid="personal-cuenta-opcion" data-usuario-id={valor}>
              {nombreElegidaFuera}
            </option>
          )}
          {sugeridas.length > 0 && (
            <optgroup label="Sugeridas">
              {sugeridas.map((c) => (
                <option
                  key={c.usuario_id}
                  value={c.usuario_id}
                  data-testid="personal-cuenta-sugerida"
                  data-usuario-id={c.usuario_id}
                >
                  {`${textoCuenta(c)} — Sugerida`}
                </option>
              ))}
            </optgroup>
          )}
          {libres.length > 0 && (
            <optgroup label={sugeridas.length > 0 ? 'Otras cuentas' : 'Cuentas'}>
              {libres.map((c) => (
                <option
                  key={c.usuario_id}
                  value={c.usuario_id}
                  data-testid="personal-cuenta-opcion"
                  data-usuario-id={c.usuario_id}
                >
                  {textoCuenta(c)}
                </option>
              ))}
            </optgroup>
          )}
          {ligadas.length > 0 && (
            <optgroup label="Ligadas a otra ficha">
              {ligadas.map((c) => (
                <option
                  key={c.usuario_id}
                  value={c.usuario_id}
                  disabled
                  data-testid="personal-cuenta-opcion"
                  data-usuario-id={c.usuario_id}
                  data-ligada-a={c.ligada_a?.personal_id ?? ''}
                >
                  {`${textoCuenta(c)} — ligada a ${nombreSinCorreo(c.ligada_a?.nombre)}`}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {cargando && (
          <span data-testid="personal-cuenta-cargando" className="inline-flex items-center gap-1 text-xs text-verde-suave shrink-0">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Cargando…
          </span>
        )}
      </div>
      {errorCarga && (
        <div
          role="alert"
          data-testid="personal-cuenta-error-carga"
          className="mt-1 flex flex-wrap items-center gap-2 text-xs text-rojo"
        >
          <span>No se pudieron cargar las cuentas del panel: {errorCarga}</span>
          <button
            type="button"
            onClick={reintentar}
            className="inline-flex items-center gap-1 rounded bg-rojo/10 px-2 py-0.5 hover:bg-rojo/20"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}
      <p id="per-cuenta-ayuda" className="text-xs text-verde-suave mt-1">
        {TEXTO_AYUDA}
      </p>
    </div>
  )
}
