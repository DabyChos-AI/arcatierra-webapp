'use client'

// R15 v2 · F2 (sesión 59): el precio de la puerta «Canasta lista» de la portada. Contrato v2 §9-F2 D-F2-03, D-F2-08 (d), D-F2-09 (P-4).
// - Precio: el mínimo de GET /api/subscriptions/planes (pública; llamada nueva a una ruta que ya existe, C46), contando solo las canastas
//   (`esCanasta`: 1885–1891, el helper de hoy) con precio mayor que 0: así quedan fuera la retornable y los planes de prueba sin una lista
//   escrita aquí. Medido contra la respuesta real (29-oct 18:52 UTC): entran los 7 planes de 1885–1891; mínimo 290.
// - Envío: `calcularCostoEnvio` de src/lib/envio.ts (DR-13: una suscripción de menos de $1,000 lleva $100). Nunca «desde $290» solo
//   (HEREDADO #3, revisión #7).
// - Formato de precio de hoy (`formatPrice`, como ExperienceCard). Estados (D-F2-10): cargando, listo, vacio (respondió y ningún plan pasa el
//   filtro) y error (API caída o respuesta ilegible); fuera de «listo» no se pinta ningún número.
import { useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'
import { calcularCostoEnvio } from '@/lib/envio'
import { aNumero, esCanasta } from '@/types/tienda'
import { formatPrice } from '@/utils/formatters'
import Precio from '@/components/sitio-nuevo/ui/Precio'

type Estado = { fase: 'cargando' } | { fase: 'listo'; precio: number; envio: number } | { fase: 'vacio' } | { fase: 'error' }

/** El precio más bajo de las canastas de suscripción; null si no viene ninguna; undefined si la respuesta no se puede leer. */
function minimoDeCanastas(respuesta: unknown): number | null | undefined {
  const planes = (respuesta as { planes?: unknown } | null)?.planes
  if (!Array.isArray(planes)) return undefined
  const precios = planes
    .filter((plan): plan is { itemcode: string; price?: unknown } => typeof plan?.itemcode === 'string' && esCanasta(plan.itemcode))
    .map((plan) => aNumero(plan.price))
    .filter((precio) => precio > 0)
  return precios.length > 0 ? Math.min(...precios) : null
}

const pesos = (n: number) => `$${formatPrice(n)}`

export default function PrecioCanastaLista() {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })

  useEffect(() => {
    let vigente = true
    fetch(`${API_URL}/api/subscriptions/planes`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((datos: unknown) => {
        if (!vigente) return
        const precio = minimoDeCanastas(datos)
        if (precio === undefined) setEstado({ fase: 'error' })
        else if (precio === null) setEstado({ fase: 'vacio' })
        else setEstado({ fase: 'listo', precio, envio: calcularCostoEnvio(precio) })
      })
      .catch(() => {
        if (vigente) setEstado({ fase: 'error' })
      })
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div
      data-testid="sn-portada-puertas-precio"
      data-estado={estado.fase}
      data-precio={estado.fase === 'listo' ? estado.precio : undefined}
      data-envio={estado.fase === 'listo' ? estado.envio : undefined}
      aria-busy={estado.fase === 'cargando' || undefined}
      className="min-h-[20px]"
    >
      {estado.fase === 'listo' && (
        <Precio
          letra="mono"
          valor={
            estado.envio > 0
              ? `desde ${pesos(estado.precio)} + ${pesos(estado.envio)} de envío`
              : `desde ${pesos(estado.precio)} · Envío gratis`
          }
        />
      )}
    </div>
  )
}
