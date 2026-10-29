'use client'

// R15 v2 · F2 (sesión 59): una tarjeta de «Experiencias destacadas» de la portada (maqueta `.exp-float-card`). Contrato v2 §9-F2 D-F2-08 (g).
// Todo sale de la API y de los textos de hoy (DR-17):
// - Nombre, descripción, foto, duración y precio: la experiencia de GET /api/experiencias (como ExperienciasGrid de hoy: el nombre tal cual,
//   «{duracion_horas} horas», `$${formatPrice(precio)}` por persona).
// - Fechas: GET /api/calendario/eventos?experiencia_id=…&limit=10, la misma llamada de ExperienceCard.tsx:57-58, con sus textos («Próximas:
//   …», «Sin fechas próximas», «Consulta fechas», «Cargando...»); sin marca con 0 fechas (D-F2-08 g). Lugares solo con fechas (la regla de
//   ExperienceCard.tsx:34-41 con `esVendible` de hoy): nunca un número inventado.
// - «Más Detalles» → la ficha con `rutaExperiencia` (ExperienceCard.tsx:213-216); nunca /calendario (se oculta).
import { useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { formatPrice } from '@/utils/formatters'
import { rutaExperiencia } from '@/app/experiencias/[slug]/slug'
import { esVendible } from '@/components/experiencias/SelectorFecha'
import type { FechaPublica } from '@/types/compra-experiencias'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Precio from '@/components/sitio-nuevo/ui/Precio'
import Tarjeta from '@/components/sitio-nuevo/ui/Tarjeta'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'

/** Lo que la portada lee de un item de GET /api/experiencias. */
export interface ExperienciaPortada {
  id: string
  nombre: string
  slug: string
  tipo: string
  descripcion: string | null
  duracion_horas: number | null
  precio: number
  imagen_principal: string | null
}

/** Las de hoy: 10 fechas pedidas por tarjeta y 2 nombradas (ExperienceCard.tsx:22-23). */
const FECHAS_POR_TARJETA = 10
const FECHAS_VISIBLES = 2
/** Foto de respaldo de hoy (ExperienceCard.tsx:96). */
const FOTO_RESPALDO = '/images/experiencias-placeholder.jpg'

type EstadoFechas = { fase: 'cargando' } | { fase: 'listo'; fechas: FechaPublica[] } | { fase: 'error' }

/** Lugares de las fechas que se venden en línea; null = no hay número que decir (la regla de ExperienceCard.tsx:34-41). */
function textoLugares(fechas: FechaPublica[]): string | null {
  if (fechas.length === 0) return null
  const vendibles = fechas.filter(esVendible)
  if (vendibles.length === 0) return 'Reserva por WhatsApp'
  if (vendibles.some((f) => f.disponibles == null)) return 'Compra en línea'
  return `${vendibles.reduce((suma, f) => suma + (f.disponibles ?? 0), 0)} disponibles`
}

function textoFechas(estado: EstadoFechas): string {
  if (estado.fase === 'cargando') return 'Cargando...'
  if (estado.fase === 'error') return 'Consulta fechas'
  if (estado.fechas.length === 0) return 'Sin fechas próximas'
  const proximas = estado.fechas
    .slice(0, FECHAS_VISIBLES)
    .map((f) => formatFechaMexico(f.fecha_evento, { year: undefined, day: 'numeric', month: 'short' }))
  return `Próximas: ${proximas.join(', ')}`
}

function faseDeFechas(estado: EstadoFechas): 'cargando' | 'con-fechas' | 'sin-fechas' | 'error' {
  if (estado.fase !== 'listo') return estado.fase
  return estado.fechas.length > 0 ? 'con-fechas' : 'sin-fechas'
}

export default function TarjetaExperiencia({ experiencia }: { experiencia: ExperienciaPortada }) {
  const [estado, setEstado] = useState<EstadoFechas>({ fase: 'cargando' })

  useEffect(() => {
    let vigente = true
    setEstado({ fase: 'cargando' })
    fetch(`${API_URL}/api/calendario/eventos?experiencia_id=${encodeURIComponent(experiencia.id)}&limit=${FECHAS_POR_TARJETA}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((datos: { items?: FechaPublica[] }) => {
        const items = Array.isArray(datos?.items) ? datos.items : []
        // Resguardo de hoy: solo fechas de ESTA experiencia.
        if (vigente) setEstado({ fase: 'listo', fechas: items.filter((f) => f.experiencia_id === experiencia.id) })
      })
      .catch(() => {
        if (vigente) setEstado({ fase: 'error' })
      })
    return () => {
      vigente = false
    }
  }, [experiencia.id])

  const lugares = estado.fase === 'listo' ? textoLugares(estado.fechas) : null
  const duracion = experiencia.duracion_horas ? `${experiencia.duracion_horas} horas` : null

  return (
    <li
      data-testid="sn-portada-experiencias-tarjeta"
      data-experiencia-id={experiencia.id}
      data-slug={experiencia.slug}
      className="w-[340px] max-w-full shrink-0 snap-start"
    >
      <Tarjeta as="article" fondo="warm" className="h-full">
        <div className="flex h-full flex-col">
          <div className="relative h-[280px] bg-sn-green">
            <Foto
              src={experiencia.imagen_principal || FOTO_RESPALDO}
              alt={experiencia.nombre}
              sizes="340px"
              testId="sn-portada-experiencias-tarjeta-foto"
              className="h-full"
            />
            {lugares && (
              <span data-testid="sn-portada-experiencias-tarjeta-lugares" className="absolute bottom-[18px] left-[18px]">
                <Insignia tono="terra">{lugares}</Insignia>
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
            <Etiqueta tamano="etiqueta" tono="terra">
              <span data-testid="sn-portada-experiencias-tarjeta-fechas" data-estado={faseDeFechas(estado)}>
                {textoFechas(estado)}
              </span>
              {duracion && ` · ${duracion}`}
            </Etiqueta>
            <Titulo nivel={3} tamano="h4" className="mt-2.5">
              {experiencia.nombre}
            </Titulo>
            {experiencia.descripcion && (
              <Texto tamano="chico" tono="ink-suave" className="mt-2.5 line-clamp-2">
                {experiencia.descripcion}
              </Texto>
            )}
            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between gap-3 border-t border-solid border-sn-border pt-4">
                <Precio letra="mono" valor={`$${formatPrice(experiencia.precio)}`} unidad="persona" testId="sn-portada-experiencias-tarjeta-precio" />
                <Boton
                  href={rutaExperiencia(experiencia.slug)}
                  variante="contorno"
                  tamano="chico"
                  flecha
                  testId="sn-portada-experiencias-tarjeta-detalles"
                >
                  Más Detalles
                </Boton>
              </div>
            </div>
          </div>
        </div>
      </Tarjeta>
    </li>
  )
}
