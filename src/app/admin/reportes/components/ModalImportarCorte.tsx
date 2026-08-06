'use client'

import { useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertTriangle, CheckCircle2, Loader2, Upload, X } from 'lucide-react'
import { API_URL } from '@/lib/api'
import type { ImportResponse } from '@/types/reportes'

interface Props {
  fechaEntrega: string
  onCerrar: () => void
  onImportado: () => void
}

/**
 * Sube el corte del sistema actual (WooCommerce) mientras se termina de migrar.
 * El backend normaliza canasta, C.P. y teléfono, y reporta fila por fila lo que
 * no pudo leer — un renglón malo no tumba el archivo completo.
 */
export default function ModalImportarCorte({ fechaEntrega, onCerrar, onImportado }: Props) {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const inputRef = useRef<HTMLInputElement>(null)
  const [fecha, setFecha] = useState(fechaEntrega)
  const [subiendo, setSubiendo] = useState(false)
  const [resultado, setResultado] = useState<ImportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [arrastrando, setArrastrando] = useState(false)

  const subir = async (archivo: File) => {
    if (!token) return
    setSubiendo(true)
    setError(null)
    setResultado(null)
    try {
      const fd = new FormData()
      fd.append('archivo', archivo)
      fd.append('fecha_entrega', fecha)

      // Sin Content-Type manual: el navegador pone el boundary del multipart
      const res = await fetch(`${API_URL}/api/admin/reportes/corte/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'No se pudo importar el archivo')
      setResultado(data)
      onImportado()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido al importar')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-verde px-5 py-4 text-white">
          <div>
            <h2 className="text-base font-bold">Subir corte del día</h2>
            <p className="text-xs text-white/80">Puente mientras se termina de migrar</p>
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar importación"
            className="ml-auto rounded-full bg-white/15 p-2 transition hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="fecha-import" className="text-xs font-semibold text-verde-suave">
              Día de entrega al que corresponde el archivo
            </label>
            <input
              id="fecha-import"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-52 rounded-lg border border-neutro-borde px-3 py-2 text-sm"
            />
          </div>

          <p className="text-xs text-verde-suave">
            Sube el export de tu sistema actual (CSV o Excel). Si ese día ya tenía un corte
            cargado, se reemplaza por el nuevo.
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setArrastrando(true)
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault()
              setArrastrando(false)
              const f = e.dataTransfer.files?.[0]
              if (f) subir(f)
            }}
            disabled={subiendo}
            className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition ${
              arrastrando
                ? 'border-terracota bg-terracota/5 text-terracota'
                : 'border-neutro-borde bg-neutro-light text-verde-suave hover:border-terracota hover:text-terracota'
            } disabled:opacity-60`}
          >
            {subiendo ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm font-semibold">Procesando el archivo…</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 opacity-60" />
                <span className="text-sm font-semibold">
                  Arrastra tu archivo aquí o haz clic para elegirlo
                </span>
                <span className="text-xs">ENTREGA DEL 29JUN26.xlsx · LUNES.csv</span>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xlsm,.csv"
            aria-label="Archivo del corte del día"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) subir(f)
              e.target.value = ''
            }}
          />

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rojo/30 bg-rojo-bg px-4 py-3 text-sm text-rojo">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resultado && (
            <div className="space-y-3 rounded-lg border border-verde/25 bg-verde/5 px-4 py-3 text-sm">
              <div className="flex items-center gap-2 font-semibold text-verde">
                <CheckCircle2 className="h-4 w-4" />
                {resultado.filas_ok} entregas cargadas para el{' '}
                {resultado.fecha_entrega}
              </div>

              <ul className="space-y-1 text-xs text-verde-tipografia">
                {resultado.filas_ignoradas > 0 && (
                  <li>
                    {resultado.filas_ignoradas} filas ignoradas (el bloque de totales que el
                    archivo trae al pie).
                  </li>
                )}
                <li>
                  {resultado.clientes_ya_registrados} de{' '}
                  {resultado.clientes_ya_registrados + resultado.clientes_nuevos} clientes ya
                  tienen cuenta en la plataforma.
                </li>
                {resultado.avisos.length > 0 && (
                  <li className="text-amarillo">
                    {resultado.avisos.length} avisos de normalización (C.P. o canasta corregidos).
                  </li>
                )}
              </ul>

              {resultado.filas_error > 0 && (
                <div className="rounded-md border border-amarillo/40 bg-amarillo-bg px-3 py-2">
                  <p className="mb-1 text-xs font-semibold text-verde-tipografia">
                    {resultado.filas_error} filas no se pudieron leer:
                  </p>
                  <ul className="max-h-28 space-y-0.5 overflow-auto text-xs text-verde-suave">
                    {resultado.errores.map((e) => (
                      <li key={e.fila}>
                        fila {e.fila}: {e.motivo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-neutro-borde bg-neutro-light px-5 py-3">
          <button
            onClick={onCerrar}
            className="rounded-lg border border-neutro-borde px-4 py-2 text-sm text-verde-suave transition hover:bg-white"
          >
            {resultado ? 'Listo' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
