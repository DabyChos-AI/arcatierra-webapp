'use client'

// Fase 4b de PLAN-EXP-SIN-FALLAS (sesión 40, 1-oct-2026) · CP1: crear / editar un cupón (F3).
// Contrato: EXP-FASE4B-CONTRATO.md §C6/§F3. Las reglas las valida el backend y su `detail` se muestra TAL CUAL en
// `cupon-error` (409 de código repetido incluido). Un cupón usado no cambia de código, tipo ni valor: el PATCH los omite
// (contrato §10) y en pantalla van de solo lectura.

import { useEffect, useRef, useState } from 'react'
import { Loader2, TicketPercent, X, AlertTriangle, Info } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { hoyMexico } from '@/lib/dates'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import {
  TIPO_CUPON_LABEL,
  textoUsos,
  type Cupon,
  type CuponPayload,
  type TipoCupon,
} from '@/types/cupones'

/** Mismo texto que el 400 del backend (C6) para un cupón usado. */
const NOTA_USADO = 'Este cupón ya se usó: su código, tipo y valor no cambian (desactívalo y crea otro)'
/** Mismo texto que el 400 del backend (C6) para usos máximos fuera de rango. */
const MSG_USOS_MAX = 'Los usos máximos van de 1 en adelante (vacío = sin límite)'
const NOTA_WEB =
  'En la página web los cupones no aplican a experiencias: "Reservas privadas" es para el asistente del panel.'

const TIPOS: TipoCupon[] = ['porcentaje', 'fijo', 'envio_gratis']

interface FormCupon {
  codigo: string
  descripcion: string
  tipo: TipoCupon
  valor: string
  minimo: string
  usosMax: string
  aplicaProductos: boolean
  aplicaExperiencias: boolean
  fechaInicio: string
  fechaFin: string
  activo: boolean
}

const FORM_NUEVO: FormCupon = {
  codigo: '',
  descripcion: '',
  tipo: 'porcentaje',
  valor: '',
  minimo: '',
  usosMax: '',
  aplicaProductos: true,
  aplicaExperiencias: false,
  fechaInicio: '',
  fechaFin: '',
  activo: true,
}

function formDe(c: Cupon): FormCupon {
  return {
    codigo: c.codigo,
    descripcion: c.descripcion ?? '',
    tipo: c.tipo,
    valor: String(Number(c.valor)),
    minimo: Number(c.minimo_compra) > 0 ? String(Number(c.minimo_compra)) : '',
    usosMax: c.usos_maximos != null ? String(c.usos_maximos) : '',
    aplicaProductos: c.aplica_productos,
    aplicaExperiencias: c.tipo === 'envio_gratis' ? false : c.aplica_experiencias,
    fechaInicio: c.fecha_inicio ?? '',
    fechaFin: c.fecha_fin ?? '',
    activo: c.activo,
  }
}

const inputClase =
  'w-full min-w-0 px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota disabled:bg-neutro-light disabled:text-verde-suave'

interface Props {
  token: string | undefined
  /** null = cupón nuevo. */
  cupon: Cupon | null
  onClose: () => void
  onSaved: (c: Cupon) => void
}

export default function ModalCupon({ token, cupon, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormCupon>(() => (cupon ? formDe(cupon) : FORM_NUEVO))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoy] = useState(hoyMexico)
  const codigoRef = useRef<HTMLInputElement>(null)

  const usado = cupon != null && cupon.usos > 0
  const envioGratis = form.tipo === 'envio_gratis'

  useEffect(() => {
    if (!usado) codigoRef.current?.focus()
  }, [usado])

  useEffect(() => {
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) onClose()
    }
    window.addEventListener('keydown', alEscape)
    return () => window.removeEventListener('keydown', alEscape)
  }, [guardando, onClose])

  const cambiar = (cambios: Partial<FormCupon>) => {
    setForm((prev) => ({ ...prev, ...cambios }))
    setError(null)
  }

  const cambiarTipo = (tipo: TipoCupon) => {
    if (tipo === 'envio_gratis') {
      // El envío gratis solo aplica a la tienda (C6): valor 0 y sin reservas privadas
      cambiar({ tipo, valor: '0', aplicaExperiencias: false })
    } else {
      cambiar({ tipo, valor: form.tipo === 'envio_gratis' ? '' : form.valor })
    }
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || guardando) return
    setError(null)

    const usosTexto = form.usosMax.trim()
    const usosMaximos = usosTexto === '' ? null : Number(usosTexto)
    if (usosMaximos != null && (!Number.isInteger(usosMaximos) || usosMaximos < 1)) {
      setError(MSG_USOS_MAX)
      return
    }

    const payload: CuponPayload = {
      codigo: form.codigo.trim().toUpperCase(),
      descripcion: form.descripcion.trim() || null,
      tipo: form.tipo,
      valor: envioGratis ? 0 : Number(form.valor.trim() || '0'),
      minimo_compra: Number(form.minimo.trim() || '0'),
      usos_maximos: usosMaximos,
      aplica_productos: form.aplicaProductos,
      aplica_experiencias: envioGratis ? false : form.aplicaExperiencias,
      fecha_inicio: form.fechaInicio || null,
      fecha_fin: form.fechaFin || null,
      activo: form.activo,
    }

    // PATCH con todos los campos (null explícito limpia); en un cupón usado se omiten código, tipo y valor (§10)
    const cuerpo: Partial<CuponPayload> = { ...payload }
    if (usado) {
      delete cuerpo.codigo
      delete cuerpo.tipo
      delete cuerpo.valor
    }

    setGuardando(true)
    try {
      const res = await fetch(
        cupon ? `${API_URL}/api/admin/cupones/${encodeURIComponent(cupon.id)}` : `${API_URL}/api/admin/cupones`,
        {
          method: cupon ? 'PATCH' : 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(cuerpo),
        },
      )
      if (!res.ok) {
        const datos = await res.json().catch(() => null)
        setError(extraerMensajeError(datos, res.status))
        return
      }
      onSaved((await res.json()) as Cupon)
    } catch {
      setError('Sin conexión con el servidor. Revisa tu internet y reintenta.')
    } finally {
      setGuardando(false)
    }
  }

  const tituloId = 'cupon-modal-titulo'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-10 sm:pt-16 pb-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !guardando) onClose()
      }}
    >
      <form
        noValidate
        onSubmit={guardar}
        data-testid="cupon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-5rem)]"
      >
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-neutro-borde">
          <h2 id={tituloId} className="font-display text-xl text-verde flex items-center gap-2 m-0 min-w-0">
            <TicketPercent className="h-5 w-5 text-terracota shrink-0" aria-hidden="true" />
            <span className="truncate">{cupon ? `Editar cupón ${cupon.codigo}` : 'Nuevo cupón'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar"
            className="p-2 hover:bg-neutro-light rounded-lg shrink-0"
          >
            <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {usado && (
            <p
              data-testid="cupon-usado-nota"
              className="flex items-start gap-2 rounded-lg border border-amarillo/40 bg-amarillo-bg p-3 text-sm text-verde"
            >
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-terracota" aria-hidden="true" />
              <span>
                {NOTA_USADO}. Usos: {textoUsos(cupon)}.
              </span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cupon-codigo" className="block text-sm font-medium text-verde mb-1">
                Código <span className="text-rojo">*</span>
              </label>
              <input
                ref={codigoRef}
                id="cupon-codigo"
                data-testid="cupon-codigo"
                type="text"
                autoComplete="off"
                spellCheck={false}
                maxLength={30}
                value={form.codigo}
                disabled={usado}
                onChange={(e) => cambiar({ codigo: e.target.value.toUpperCase() })}
                placeholder="Ej: BIENVENIDA10"
                aria-describedby="cupon-codigo-ayuda"
                className={`${inputClase} font-mono uppercase`}
              />
              <p id="cupon-codigo-ayuda" className="text-xs text-verde-suave mt-1">
                De 3 a 30 letras, números, guion o guion bajo.
              </p>
            </div>
            <div>
              <label htmlFor="cupon-tipo" className="block text-sm font-medium text-verde mb-1">
                Tipo
              </label>
              <select
                id="cupon-tipo"
                data-testid="cupon-tipo"
                value={form.tipo}
                disabled={usado}
                onChange={(e) => cambiarTipo(e.target.value as TipoCupon)}
                className={inputClase}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_CUPON_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="cupon-descripcion" className="block text-sm font-medium text-verde mb-1">
              Descripción
            </label>
            <input
              id="cupon-descripcion"
              data-testid="cupon-descripcion"
              type="text"
              maxLength={500}
              value={form.descripcion}
              onChange={(e) => cambiar({ descripcion: e.target.value })}
              placeholder="Para qué es (solo se ve en el panel)"
              className={inputClase}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cupon-valor" className="block text-sm font-medium text-verde mb-1">
                {form.tipo === 'porcentaje' ? 'Porcentaje (%)' : form.tipo === 'fijo' ? 'Monto (MXN)' : 'Valor'}
              </label>
              <input
                id="cupon-valor"
                data-testid="cupon-valor"
                type="number"
                inputMode="decimal"
                min={form.tipo === 'porcentaje' ? 1 : 0.01}
                max={form.tipo === 'porcentaje' ? 100 : undefined}
                step="0.01"
                value={form.valor}
                disabled={usado || envioGratis}
                onChange={(e) => cambiar({ valor: e.target.value })}
                placeholder={form.tipo === 'porcentaje' ? 'Ej: 10' : 'Ej: 500'}
                className={`${inputClase} tabular-nums`}
              />
            </div>
            <div>
              <label htmlFor="cupon-minimo" className="block text-sm font-medium text-verde mb-1">
                Compra mínima (MXN)
              </label>
              <input
                id="cupon-minimo"
                data-testid="cupon-minimo"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={form.minimo}
                onChange={(e) => cambiar({ minimo: e.target.value })}
                placeholder="0 = sin mínimo"
                className={`${inputClase} tabular-nums`}
              />
            </div>
            <div>
              <label htmlFor="cupon-usos-max" className="block text-sm font-medium text-verde mb-1">
                Usos máximos
              </label>
              <input
                id="cupon-usos-max"
                data-testid="cupon-usos-max"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={form.usosMax}
                onChange={(e) => cambiar({ usosMax: e.target.value })}
                placeholder="Vacío = sin límite"
                className={`${inputClase} tabular-nums`}
              />
            </div>
          </div>

          <fieldset className="border border-neutro-borde rounded-lg p-4 min-w-0">
            <legend className="text-sm font-semibold text-verde px-2">Aplica a</legend>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="cupon-aplica-productos"
                  checked={form.aplicaProductos}
                  onChange={(e) => cambiar({ aplicaProductos: e.target.checked })}
                  className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
                />
                Tienda (productos)
              </label>
              <label
                className={`flex items-center gap-2 text-sm ${
                  envioGratis ? 'text-verde-suave cursor-not-allowed' : 'text-verde cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  data-testid="cupon-aplica-experiencias"
                  checked={!envioGratis && form.aplicaExperiencias}
                  disabled={envioGratis}
                  onChange={(e) => cambiar({ aplicaExperiencias: e.target.checked })}
                  className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota disabled:opacity-50"
                />
                Reservas privadas
              </label>
            </div>
            {envioGratis && (
              <p className="text-xs text-verde-suave mt-2">El envío gratis solo aplica a la tienda.</p>
            )}
            <p data-testid="cupon-nota-web" className="text-xs text-verde-suave mt-2">
              {NOTA_WEB}
            </p>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cupon-fecha-inicio" className="block text-sm font-medium text-verde mb-1">
                Desde
              </label>
              <input
                id="cupon-fecha-inicio"
                data-testid="cupon-fecha-inicio"
                type="date"
                min={hoy}
                value={form.fechaInicio}
                onChange={(e) => cambiar({ fechaInicio: e.target.value })}
                className={inputClase}
              />
            </div>
            <div>
              <label htmlFor="cupon-fecha-fin" className="block text-sm font-medium text-verde mb-1">
                Hasta
              </label>
              <input
                id="cupon-fecha-fin"
                data-testid="cupon-fecha-fin"
                type="date"
                min={form.fechaInicio && form.fechaInicio > hoy ? form.fechaInicio : hoy}
                value={form.fechaFin}
                onChange={(e) => cambiar({ fechaFin: e.target.value })}
                className={inputClase}
              />
            </div>
            <p data-testid="cupon-fechas-ayuda" className="text-xs text-verde-suave sm:col-span-2 -mt-2">
              {/* En el alta, «Desde» vacío lo guarda el backend como hoy (C11); al editar, null lo limpia */}
              {cupon
                ? 'Vacías = sin fecha de inicio o de fin. Las fechas cuentan en hora de México.'
                : '"Desde" vacío = desde hoy; "Hasta" vacío = sin fecha de fin. Las fechas cuentan en hora de México.'}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-verde cursor-pointer">
            <input
              type="checkbox"
              data-testid="cupon-activo"
              checked={form.activo}
              onChange={(e) => cambiar({ activo: e.target.checked })}
              className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
            />
            Cupón activo
          </label>

          {error && (
            <p
              data-testid="cupon-error"
              role="alert"
              className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-neutro-borde">
          <button
            type="button"
            data-testid="cupon-cancelar"
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            data-testid="cupon-guardar"
            disabled={guardando || !token}
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {cupon ? 'Guardar cambios' : 'Crear cupón'}
          </button>
        </div>
      </form>
    </div>
  )
}
