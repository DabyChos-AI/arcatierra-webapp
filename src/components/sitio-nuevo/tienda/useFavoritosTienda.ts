'use client'

// R15 v2 · F3 (tienda): favoritos de la tienda de hoy (`useFavoritos` importado: misma llave local y las mismas llamadas a /api/favoritos
// con sesión) con los mismos avisos de hoy (src/app/tienda/page.tsx:857-877, `Avisos.tsx`).
import { useCallback } from 'react'
import { useFavoritos } from '@/hooks/useFavoritos'
import { aviso } from '@/components/ui/Avisos'

export function useFavoritosTienda() {
  const { favoritos, toggleFavorito } = useFavoritos()
  const alternar = useCallback(
    async (id: string, nombre: string) => {
      const { agregado, exito } = await toggleFavorito(id)
      if (!exito) aviso.error('No se pudo actualizar favoritos. Inténtalo de nuevo.', { titulo: 'Error' })
      else if (agregado) aviso.exito(`${nombre} agregado a favoritos`, { titulo: '¡Agregado!' })
      else aviso.info(`${nombre} eliminado de favoritos`, { titulo: 'Favorito eliminado' })
    },
    [toggleFavorito],
  )
  return { favoritos, alternar }
}
