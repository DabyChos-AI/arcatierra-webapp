'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Loader2, Tags, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { Personal } from '@/types/catalogos'
import type {
  ItemCatalogo,
  ItemCatalogoPatch,
  ItemCatalogoPayload,
  TipoCatalogo,
  TipoCocina,
  TipoFuente,
} from '@/types/planeacion'
import { NOMBRE_SINGULAR, TIPOS_POR_CATALOGO } from './catalogo-config'

// Lo que admite la base (varchar) por catálogo; más largo, el backend responde 400
const LARGO_NOMBRE: Record<TipoCatalogo, number> = { fuentes: 100, chinampas: 100, cocinas: 120 }

interface FormItem {
  nombre: string
  // '' en chinampas (no tiene tipo)
  tipo: TipoFuente | TipoCocina | ''
  personalId: string
  orden: string
  activo: boolean
}

/**
 * Crear / editar un item de un catálogo de reservas (fuentes, chinampas, cocinas).
 * - `tipo` es obligatorio en fuentes (canal|persona) y cocinas (cocina|chef_invitado).
 * - `personal_id` solo en fuentes de tipo persona (liga a alguien de Personal).
 * - PATCH con todos los campos del catálogo; `personal_id: null` limpia la liga.
 */
export default function ModalItemCatalogo({
  tipoCatalogo,
  item,
  ordenSugerido,
  onClose,
  onSaved,
}: {
  tipoCatalogo: TipoCatalogo
  // null = crear
  item: ItemCatalogo | null
  ordenSugerido: number
  onClose: () => void
  onSaved: (guardado: ItemCatalogo, creado: boolean) => void
}) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const tipos = TIPOS_POR_CATALOGO[tipoCatalogo]
  const [form, setForm] = useState<FormItem>(() => ({
    nombre: item?.nombre ?? '',
    tipo: item?.tipo ?? (tipos.length > 0 ? tipos[0].value : ''),
    personalId: item?.personal_id ?? '',
    orden: String(item?.orden ?? ordenSugerido),
    activo: item?.activo ?? true,
  }))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Personal para ligar una fuente de tipo persona
  const [personal, setPersonal] = useState<Personal[]>([])
  const [personalLoading, setPersonalLoading] = useState(false)
  const [personalError, setPersonalError] = useState<string | null>(null)
  const esFuentePersona = tipoCatalogo === 'fuentes' && form.tipo === 'persona'

  useEffect(() => {
    if (!token || tipoCatalogo !== 'fuentes') return
    let cancelado = false
    async function cargarPersonal(authToken: string) {
      setPersonalLoading(true)
      setPersonalError(null)
      try {
        const res = await fetch(`${API_URL}/api/admin/personal?per_page=100`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(extraerMensajeError(payload, res.status))
        }
        const data = (await res.json()) as { items?: Personal[] }
        if (!cancelado) setPersonal((data.items ?? []).filter((p) => p.activo !== false))
      } catch (err) {
        if (!cancelado) {
          setPersonalError(err instanceof Error ? err.message : 'Error al cargar Personal')
        }
      } finally {
        if (!cancelado) setPersonalLoading(false)
      }
    }
    cargarPersonal(token)
    return () => {
      cancelado = true
    }
  }, [token, tipoCatalogo])

  // Si la persona ligada ya no está activa en Personal, se sigue mostrando
  const personaLigadaFuera =
    item?.personal_id && !personal.some((p) => p.id === item.personal_id)
      ? { id: item.personal_id, nombre: item.personal_nombre ?? 'Persona ligada' }
      : null

  const nombreCompleto = (p: Personal) => `${p.nombre}${p.apellidos ? ` ${p.apellidos}` : ''}`

  const cerrar = () => {
    if (saving) return
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setFormError(null)
    const nombre = form.nombre.trim()
    if (!nombre) {
      setFormError('El nombre es obligatorio')
      return
    }
    if (tipos.length > 0 && !form.tipo) {
      setFormError('Elige el tipo')
      return
    }
    const orden = form.orden.trim() === '' ? 0 : Math.floor(Number(form.orden))
    if (!Number.isFinite(orden)) {
      setFormError('El orden debe ser un número')
      return
    }
    const tipo = form.tipo || undefined
    const personalId = esFuentePersona ? form.personalId || null : null

    setSaving(true)
    try {
      let res: Response
      if (item) {
        const patch: ItemCatalogoPatch = { nombre, orden, activo: form.activo }
        if (tipo) patch.tipo = tipo
        if (tipoCatalogo === 'fuentes') patch.personal_id = personalId
        res = await fetch(`${API_URL}/api/admin/catalogos/${tipoCatalogo}/${item.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
      } else {
        const payload: ItemCatalogoPayload = { nombre, orden }
        if (tipo) payload.tipo = tipo
        if (tipoCatalogo === 'fuentes' && personalId) payload.personal_id = personalId
        res = await fetch(`${API_URL}/api/admin/catalogos/${tipoCatalogo}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const guardado = (await res.json()) as ItemCatalogo
      onSaved(guardado, !item)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const singular = NOMBRE_SINGULAR[tipoCatalogo]

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center px-4 pt-20 pb-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogo-modal-titulo"
        data-testid="catalogos-modal"
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-4"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutro-borde sticky top-0 bg-white rounded-t-xl">
          <h2
            id="catalogo-modal-titulo"
            className="font-display text-xl text-verde flex items-center gap-2"
          >
            <Tags className="h-5 w-5 text-terracota" aria-hidden="true" />
            {item ? `Editar ${singular}` : `Nueva ${singular}`}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar modal"
            className="p-2 hover:bg-neutro-light rounded-lg"
            disabled={saving}
          >
            <X className="h-5 w-5 text-verde-suave" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {formError && (
            <div
              role="alert"
              data-testid="catalogos-modal-error"
              className="flex items-start gap-2 p-3 bg-rojo-bg border border-rojo/30 rounded-lg text-sm text-rojo"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          {tipos.length > 0 && (
            <div>
              <label htmlFor="cat-tipo" className="block text-sm font-medium text-verde mb-1">
                Tipo <span className="text-rojo">*</span>
              </label>
              <select
                id="cat-tipo"
                value={form.tipo}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as TipoFuente | TipoCocina })
                }
                className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
              >
                {tipos.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {esFuentePersona && (
            <div>
              <label htmlFor="cat-personal" className="block text-sm font-medium text-verde mb-1">
                Persona de Personal
              </label>
              <select
                id="cat-personal"
                value={form.personalId}
                onChange={(e) => {
                  const id = e.target.value
                  const p = personal.find((x) => x.id === id)
                  // Sin nombre todavía: se propone el de la persona
                  setForm({
                    ...form,
                    personalId: id,
                    nombre: (form.nombre.trim() || !p) ? form.nombre : nombreCompleto(p),
                  })
                }}
                disabled={personalLoading}
                className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota disabled:opacity-60"
              >
                <option value="">— Sin ligar (persona de fuera) —</option>
                {personaLigadaFuera && (
                  <option value={personaLigadaFuera.id}>{personaLigadaFuera.nombre}</option>
                )}
                {personal.map((p) => (
                  <option key={p.id} value={p.id}>
                    {nombreCompleto(p)}
                  </option>
                ))}
              </select>
              {personalLoading && (
                <p className="text-xs text-verde-suave mt-1">Cargando Personal…</p>
              )}
              {personalError && (
                <p className="text-xs text-rojo mt-1">
                  No se pudo cargar Personal: {personalError}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="cat-nombre" className="block text-sm font-medium text-verde mb-1">
              Nombre <span className="text-rojo">*</span>
            </label>
            <input
              id="cat-nombre"
              type="text"
              required
              maxLength={LARGO_NOMBRE[tipoCatalogo]}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              data-testid="catalogos-modal-nombre"
              className="w-full px-3 py-2 border border-neutro-borde rounded-lg text-sm focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
          </div>

          <div>
            <label htmlFor="cat-orden" className="block text-sm font-medium text-verde mb-1">
              Orden
            </label>
            <input
              id="cat-orden"
              type="number"
              step={1}
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: e.target.value })}
              aria-describedby="cat-orden-ayuda"
              className="w-32 px-3 py-2 border border-neutro-borde rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-terracota/30 focus:border-terracota"
            />
            <p id="cat-orden-ayuda" className="text-xs text-verde-suave mt-1">
              Menor sale primero en las listas.
            </p>
          </div>

          {item && (
            <label htmlFor="cat-activo" className="flex items-center gap-2 text-sm text-verde cursor-pointer">
              <input
                id="cat-activo"
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="w-4 h-4 text-terracota border-neutro-borde rounded focus:ring-terracota"
              />
              Activo (se ofrece al capturar reservas)
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutro-borde sticky bottom-0 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={cerrar}
            disabled={saving}
            className="px-4 py-2 text-verde border border-neutro-borde rounded-lg text-sm hover:bg-neutro-light disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            data-testid="catalogos-modal-guardar"
            className="inline-flex items-center gap-2 bg-terracota hover:bg-terracota-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {item ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}
