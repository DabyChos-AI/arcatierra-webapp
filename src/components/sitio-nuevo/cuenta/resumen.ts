// R15 v2 · F6 (cuenta, sesión 64): lo que el Resumen de Mi cuenta lee de `GET /api/dashboard/resumen` y `/impacto` (las interfaces de hoy,
// `src/app/usuario/dashboard/page.tsx:31-69`). Las cifras se pintan en `PaginaResumen.tsx` con las expresiones de hoy letra por letra (D-F6-17).
import type { MiSuscripcion } from '@/types/cuenta'

export interface PedidoAbandonado {
  id: string
  numero_pedido: string
  fecha: string
  total: number
}

export interface ResumenCuenta {
  usuario?: { id: string; nombre: string; email: string }
  estadisticas_personales?: {
    total_pedidos: number
    dinero_invertido: number
    productos_unicos: number
    tiempo_cliente_dias?: number
    ultimo_pedido?: string
  }
  suscripciones?: { total: number; activas: number; pausadas: number }
  pedidos_abandonados?: { total: number; recientes: PedidoAbandonado[] }
  timestamp_consulta?: string
}

export interface ImpactoCuenta {
  co2_ahorrado_kg: number
  agua_conservada_litros: number
  plastico_evitado_kg: number
  categorias_compradas: number
  timestamp_calculo: string
}

/** Las activas, la de la próxima canasta más cercana primero (las que no traen fecha, al final; empate = el orden de la API). */
export function activasPorProxima(items: readonly MiSuscripcion[]): MiSuscripcion[] {
  return items
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.estado === 'activa')
    .sort((a, b) => {
      const fa = a.s.proxima_entrega
      const fb = b.s.proxima_entrega
      if (fa && fb && fa !== fb) return fa < fb ? -1 : 1
      if (fa && !fb) return -1
      if (!fa && fb) return 1
      return a.i - b.i
    })
    .map(({ s }) => s)
}
