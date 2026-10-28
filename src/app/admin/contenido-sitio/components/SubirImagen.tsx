'use client'

// «Contenido del sitio» (WF7): campo de imagen con su propio uploader (el de src/components/admin/ImageUploader.tsx es de
// otra pantalla y sube a /api/upload/imagen, que pide el permiso de experiencias). Sube DIRECTO a la API con el Bearer,
// como todo el panel: POST ${API_URL}/api/admin/contenido-sitio/imagen (multipart, campo `file`) → 201 {url}.
// También se puede pegar una dirección (https://… o /…). El 400 de tipo o tamaño sale tal cual (role=alert).

import { useId, useRef, useState } from 'react'
import { AlertTriangle, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { ImagenSubida } from '@/types/contenido-sitio'
import { IMAGEN_MAX_BYTES, IMAGEN_TIPOS, urlValida } from './contenido'

interface Props {
  token: string
  id: string
  etiqueta: string
  requerido: boolean
  valor: string
  onCambio: (url: string) => void
  ayuda?: string
  error?: string
  /** Prefijo de los data-testid (p. ej. `cs-campo-imagen_url`). */
  testid: string
  deshabilitado?: boolean
  onSubiendo?: (subiendo: boolean) => void
}

export default function SubirImagen({
  token,
  id,
  etiqueta,
  requerido,
  valor,
  onCambio,
  ayuda,
  error,
  testid,
  deshabilitado = false,
  onSubiendo,
}: Props) {
  const archivoRef = useRef<HTMLInputElement>(null)
  const subiendoRef = useRef(false)
  const [subiendo, setSubiendo] = useState(false)
  const [errorSubida, setErrorSubida] = useState<string | null>(null)
  const idAyuda = useId()
  const vista = valor.trim() && urlValida(valor.trim()) ? valor.trim() : null

  async function subir(archivo: File) {
    if (subiendoRef.current) return
    setErrorSubida(null)
    if (!(IMAGEN_TIPOS as readonly string[]).includes(archivo.type)) {
      setErrorSubida('Ese archivo no es JPEG, PNG ni WebP.')
      return
    }
    if (archivo.size > IMAGEN_MAX_BYTES) {
      setErrorSubida('La imagen pesa más de 10 MB.')
      return
    }
    subiendoRef.current = true
    setSubiendo(true)
    onSubiendo?.(true)
    try {
      const datos = new FormData()
      datos.append('file', archivo)
      const res = await fetch(`${API_URL}/api/admin/contenido-sitio/imagen`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: datos,
        signal: AbortSignal.timeout(60_000),
      })
      const cuerpo: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        setErrorSubida(
          res.status === 401
            ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
            : `No se pudo subir la imagen: ${extraerMensajeError(cuerpo, res.status)}`,
        )
        return
      }
      const url = (cuerpo as Partial<ImagenSubida> | null)?.url
      if (typeof url !== 'string' || !url) {
        setErrorSubida('La imagen se subió, pero la respuesta no trae su dirección. Intenta de nuevo.')
        return
      }
      onCambio(url)
    } catch (e) {
      const porTiempo = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
      setErrorSubida(porTiempo ? 'La subida tardó más de 60 segundos. Intenta de nuevo.' : 'Sin conexión con el servidor. Intenta de nuevo.')
    } finally {
      subiendoRef.current = false
      setSubiendo(false)
      onSubiendo?.(false)
      if (archivoRef.current) archivoRef.current.value = ''
    }
  }

  const describe = [ayuda ? idAyuda : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

  return (
    <div data-testid={testid}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-verde">
        {etiqueta}
        {requerido ? ' *' : ''}
      </label>
      <div className="flex flex-wrap items-start gap-3">
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutro-borde bg-neutro-light"
          data-testid={`${testid}-vista`}
          data-hay={vista ? '1' : '0'}
        >
          {vista ? (
            <OptimizedImage src={vista} alt={`Vista previa: ${etiqueta}`} fill sizes="80px" />
          ) : (
            <ImageIcon className="h-6 w-6 text-verde-medio" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            data-testid={`${testid}-url`}
            type="text"
            inputMode="url"
            autoComplete="off"
            value={valor}
            disabled={deshabilitado || subiendo}
            onChange={(e) => {
              // Escribir la dirección a mano reemplaza el error de la subida anterior (si no, taparía el de validación).
              setErrorSubida(null)
              onCambio(e.target.value)
            }}
            placeholder="https://… o /uploads/…"
            aria-describedby={describe}
            aria-invalid={error ? true : undefined}
            className="min-h-[44px] w-full rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde-tipografia focus:border-terracota focus:ring-2 focus:ring-terracota/30 disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={archivoRef}
              type="file"
              accept={IMAGEN_TIPOS.join(',')}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              data-testid={`${testid}-archivo`}
              onChange={(e) => {
                const archivo = e.target.files?.[0]
                if (archivo) void subir(archivo)
              }}
            />
            <button
              type="button"
              data-testid={`${testid}-subir`}
              disabled={deshabilitado || subiendo}
              onClick={() => archivoRef.current?.click()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
            >
              {subiendo ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
              {subiendo ? 'Subiendo…' : vista ? 'Cambiar imagen' : 'Subir imagen'}
            </button>
            {valor && (
              <button
                type="button"
                data-testid={`${testid}-quitar`}
                disabled={deshabilitado || subiendo}
                onClick={() => {
                  setErrorSubida(null)
                  onCambio('')
                }}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-neutro-borde bg-white px-3 text-sm text-verde hover:bg-neutro-light disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Quitar
              </button>
            )}
          </div>
        </div>
      </div>
      {ayuda && (
        <p id={idAyuda} className="mt-1 text-xs text-verde-medio">
          {ayuda}
        </p>
      )}
      {(errorSubida || error) && (
        <p
          id={`${id}-error`}
          role="alert"
          data-testid={`${testid}-error`}
          className="mt-1 flex items-start gap-1.5 text-xs text-rojo"
        >
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{errorSubida ?? error}</span>
        </p>
      )}
    </div>
  )
}
