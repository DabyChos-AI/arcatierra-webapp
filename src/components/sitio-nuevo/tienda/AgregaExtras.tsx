'use client'

// R15 v2 · F3 (tienda): la pestaña «Agrega extras a tu canasta» (C12, DR-12): lo que ya existe (SU2): los extras son cualquier producto en
// venta, pagado en el checkout con «Entregar con mi canasta del {fecha}» (lo pinta carrito). Aquí: la próxima canasta de cada suscripción
// activa con GET /api/subscriptions/extras-disponibles y el Bearer (la llamada de hoy de checkout/page.tsx:79), los textos de hoy de
// ui/ConMiCanasta.tsx:42, :68-72, :83-84 («2 días hábiles» en la lista corta, D-F3-21) y el catálogo. D-F3-07 (a): extras con envío gratis
// como hoy y SIN el aviso que cuenta la canasta; el descuento de DR-18 espera a C51: marca a David.
import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import { HREF_INICIAR_SESION } from '@/components/sitio-nuevo/armazon/enlaces'
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Catalogo from './Catalogo'
import { useFavoritosTienda } from './useFavoritosTienda'
import type { Carga, DatosTienda } from './Tienda'

const LARGO: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }

type Entregas = { fase: 'cargando' } | { fase: 'listo'; entregas: CanastaExtras[] } | { fase: 'error'; detalle: string }

function leerEntregas(datos: unknown): CanastaExtras[] | null {
  const lista = (datos as { entregas?: unknown } | null)?.entregas
  if (!Array.isArray(lista)) return null
  return lista.filter(
    (e): e is CanastaExtras =>
      !!e && typeof e.entrega_id === 'string' && typeof e.fecha_entrega === 'string' && typeof e.abierta === 'boolean',
  )
}

interface Props {
  productos: Carga<DatosTienda>
  reintentar: () => void
  alSuscribirme: () => void
}

export default function AgregaExtras({ productos, reintentar, alSuscribirme }: Props) {
  const { data: sesion, status } = useSession()
  const token = (sesion as { accessToken?: string } | null)?.accessToken
  const [entregas, setEntregas] = useState<Entregas>({ fase: 'cargando' })
  const { favoritos, alternar } = useFavoritosTienda()

  const cargar = useCallback(() => {
    if (!token) return
    setEntregas({ fase: 'cargando' })
    fetch(`${API_URL}/api/subscriptions/extras-disponibles`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const datos: unknown = await r.json().catch(() => null)
        if (!r.ok) {
          const detalle = (datos as { detail?: unknown } | null)?.detail
          return setEntregas({ fase: 'error', detalle: typeof detalle === 'string' ? detalle : '' })
        }
        const lista = leerEntregas(datos)
        setEntregas(lista ? { fase: 'listo', entregas: lista } : { fase: 'error', detalle: '' })
      })
      .catch(() => setEntregas({ fase: 'error', detalle: '' }))
  }, [token])

  useEffect(() => {
    cargar()
  }, [cargar])

  const abiertas = entregas.fase === 'listo' ? entregas.entregas.filter((e) => e.abierta) : []
  const cerradas = entregas.fase === 'listo' ? entregas.entregas.filter((e) => !e.abierta) : []

  return (
    <section data-testid="sn-tienda-extras" aria-labelledby="sn-tienda-extras-titulo" className="py-sn-seccion-movil min-[861px]:py-sn-seccion">
      <Contenedor className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Titulo nivel={2} tamano="h3" id="sn-tienda-extras-titulo" testId="sn-tienda-extras-titulo">
            Agrega extras a tu canasta
          </Titulo>
          <Texto tamano="grande">¿Tienes suscripción y quieres agregar algo?</Texto>
        </div>

        <div className="rounded-sn-tarjeta bg-white p-6 text-sn-ink">
          {status === 'loading' ? null : !token ? (
            <div data-testid="sn-tienda-extras-sesion" className="flex flex-wrap items-center gap-4">
              <Boton href={`${HREF_INICIAR_SESION}?callbackUrl=${encodeURIComponent('/tienda?pestana=extras')}`}>Iniciar Sesión</Boton>
            </div>
          ) : entregas.fase === 'cargando' ? (
            <p data-testid="sn-tienda-extras-cargando" aria-busy="true" className="m-0 font-sn-texto text-sn-cuerpo-sm">
              Cargando...
            </p>
          ) : entregas.fase === 'error' ? (
            <div data-testid="sn-tienda-extras-error" role="alert" className="flex flex-wrap items-center gap-4">
              <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium">
                {entregas.detalle || 'No se pudo consultar tu próxima canasta. Intenta de nuevo.'}
              </p>
              <Boton variante="texto" tamano="chico" onClick={cargar}>
                Intentar de nuevo
              </Boton>
            </div>
          ) : abiertas.length === 0 && cerradas.length === 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              <Boton onClick={alSuscribirme} testId="sn-tienda-extras-suscribirme">
                Suscribirme
              </Boton>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="m-0 font-sn-mono text-sn-etiqueta font-medium uppercase">Tienes una suscripción</p>
              {abiertas.map((c) => (
                <div key={c.entrega_id} data-testid="sn-tienda-extras-canasta" data-entrega-id={c.entrega_id} data-abierta="true" className="flex flex-col gap-1">
                  <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium">
                    Entregar con mi canasta del {formatFechaMexico(c.fecha_entrega, LARGO)}
                  </p>
                  <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
                    Envío gratis · se paga hoy · puedes agregar hasta el {formatFechaMexico(c.ultimo_dia_para_pagar, LARGO)}
                  </p>
                </div>
              ))}
              {abiertas.length === 0 &&
                cerradas.map((c) => (
                  <p key={c.entrega_id} data-testid="sn-tienda-extras-cerrada" className="m-0 font-sn-texto text-sn-cuerpo-sm">
                    Ya cerró el plazo para agregar a tu canasta del {formatFechaMexico(c.fecha_entrega, LARGO)}: se paga a más tardar 2 días hábiles
                    antes. Puedes comprar con envío normal.
                  </p>
                ))}
              <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
                <Falta que="descuento del envío de la canasta al llegar a $1,000 con extras" quien="David" />
              </p>
            </div>
          )}
        </div>

        <Catalogo
          pestana="extras"
          carga={productos.fase}
          productos={productos.fase === 'listo' ? productos.datos.sueltos : []}
          favoritos={favoritos}
          alAlternarFavorito={alternar}
          reintentar={reintentar}
        />
      </Contenedor>
    </section>
  )
}
