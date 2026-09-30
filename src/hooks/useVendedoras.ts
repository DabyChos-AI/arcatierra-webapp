'use client'

import { useCallback, useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'
import { extraerMensajeError } from '@/app/admin/reservas/components/errores'
import type { Personal } from '@/types/reservas'

/** Una vendedora activa, con el nombre completo listo para pintar. */
export interface Vendedora {
  id: string
  nombre: string
}

export interface EstadoVendedoras {
  vendedoras: Vendedora[]
  cargando: boolean
  // null = la lista cargó; si falla, los selects muestran lo guardado y se avisa
  error: string | null
}

const INICIAL: EstadoVendedoras = { vendedoras: [], cargando: true, error: null }

function nombreCompleto(p: Pick<Personal, 'nombre' | 'apellidos'>): string {
  return `${p.nombre}${p.apellidos ? ` ${p.apellidos}` : ''}`.trim()
}

/**
 * Vendedoras activas de Personal (`GET /api/admin/personal?es_vendedor=true`; el back ya
 * filtra `activo=true` por omisión). Una sola fuente para Leads, el asistente, el detalle y la
 * tabla de Reservas (LD2-a, 30-sep): la lista de Leads estaba fija en el código y se quedó con
 * quien ya no vende. Patrón de `useCatalogosEventos`.
 */
export function useVendedoras(token: string | undefined): EstadoVendedoras & {
  recargar: () => void
} {
  const [estado, setEstado] = useState<EstadoVendedoras>(INICIAL)

  const cargar = useCallback(async () => {
    if (!token) return
    setEstado((prev) => ({ ...prev, cargando: true }))
    try {
      const res = await fetch(`${API_URL}/api/admin/personal?es_vendedor=true&per_page=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extraerMensajeError(payload, res.status))
      }
      const data = (await res.json()) as { items?: Personal[] }
      const vendedoras = (data.items ?? [])
        .filter((p) => p.activo !== false && p.es_vendedor)
        .map((p) => ({ id: p.id, nombre: nombreCompleto(p) }))
      setEstado({ vendedoras, cargando: false, error: null })
    } catch (err) {
      // Un fallo al recargar no borra la lista que ya se tenía
      setEstado((prev) => ({
        vendedoras: prev.vendedoras,
        cargando: false,
        error:
          err instanceof Error && !(err instanceof TypeError)
            ? err.message
            : 'sin conexión con el servidor',
      }))
    }
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { ...estado, recargar: cargar }
}

/**
 * La vendedora ya asignada (a un lead o a una reserva) que NO está en la lista de activas:
 * dejó de ser vendedora o se desactivó. Se ofrece como opción aparte para que el select la
 * muestre con su nombre en vez de «Sin asignar»; va `disabled` (el back la rechaza si se vuelve
 * a elegir). `null` si no hay asignada o si sí está en la lista.
 */
export function vendedoraFueraDeLista(
  estado: EstadoVendedoras,
  id: string | null | undefined,
  nombre: string | null | undefined,
): Vendedora | null {
  if (!id || estado.vendedoras.some((v) => v.id === id)) return null
  const base = nombre?.trim() || 'Vendedora anterior'
  // Si la lista no cargó no se puede afirmar que ya no sea vendedora
  const listaCargada = !estado.cargando && !estado.error
  return { id, nombre: listaCargada ? `${base} (ya no es vendedora)` : base }
}
