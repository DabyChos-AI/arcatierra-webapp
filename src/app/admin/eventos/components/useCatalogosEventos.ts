'use client'

import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { Personal } from '@/types/catalogos'
import type { ItemCatalogo, ListaCatalogo, TipoCatalogo } from '@/types/planeacion'

export interface CatalogosEventos {
  chinampas: ItemCatalogo[]
  cocinas: ItemCatalogo[]
  fuentes: ItemCatalogo[]
  guias: Personal[]
  // null = todo cargó; si algo falla, los selects muestran lo guardado y se avisa
  error: string | null
  cargando: boolean
}

const VACIO: CatalogosEventos = {
  chinampas: [],
  cocinas: [],
  fuentes: [],
  guias: [],
  error: null,
  cargando: true,
}

async function leer<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(extraerMensajeError(payload, res.status))
  }
  return (await res.json()) as T
}

/**
 * Catálogos activos (chinampas, cocinas, fuentes) y guías activos de Personal, para los
 * modales de planeación, eventos internos y tickets. Se cargan una vez por página.
 */
export function useCatalogosEventos(token: string | undefined): CatalogosEventos & {
  recargar: () => void
} {
  const [estado, setEstado] = useState<CatalogosEventos>(VACIO)

  const cargar = useCallback(async () => {
    if (!token) return
    setEstado((prev) => ({ ...prev, cargando: true }))
    const catalogo = (tipo: TipoCatalogo) =>
      leer<ListaCatalogo>(`${API_URL}/api/admin/catalogos/${tipo}?incluir_inactivos=false`, token)
    const [chinampas, cocinas, fuentes, guias] = await Promise.allSettled([
      catalogo('chinampas'),
      catalogo('cocinas'),
      catalogo('fuentes'),
      leer<{ items?: Personal[] }>(`${API_URL}/api/admin/personal?es_guia=true&per_page=100`, token),
    ])
    const fallidos: string[] = []
    const items = <T,>(r: PromiseSettledResult<{ items?: T[] }>, nombre: string): T[] => {
      if (r.status === 'fulfilled') return r.value.items ?? []
      fallidos.push(`${nombre} (${r.reason instanceof Error ? r.reason.message : 'sin conexión'})`)
      return []
    }
    setEstado({
      chinampas: items(chinampas, 'chinampas'),
      cocinas: items(cocinas, 'cocinas'),
      fuentes: items(fuentes, 'fuentes'),
      guias: items(guias, 'guías').filter((g) => g.activo !== false && g.es_guia),
      error: fallidos.length > 0 ? `No se pudo cargar: ${fallidos.join(', ')}.` : null,
      cargando: false,
    })
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { ...estado, recargar: cargar }
}
