'use client'

// R15 v2 · F2 (sesión 59): bloque 4 de la portada, experiencias destacadas (maqueta: el bloque sin clase con `.exp-float-card`). Contrato v2
// §9-F2 D-F2-03, D-F2-08 (g), D-F2-09.
// - Datos (D-F2-12): la MISMA llamada de la portada de hoy, GET /api/experiencias?tipo=publica&limit=3, filtrada a `tipo === 'publica'` y
//   hasta 3 (ExperienciasGrid.tsx:31, :75, :79-81); solo lo que devuelve la API, en su orden (las que la maqueta inventa no salen, RN §6).
//   Cada tarjeta pide sus fechas (TarjetaExperiencia).
// - Textos de hoy: título «Experiencias» y «Ver todas las experiencias» → /experiencias (src/app/page.tsx:162, :173-177); vacío y error, los
//   de ExperienciasGrid.tsx:120-123. Sin eyebrow: «Reserva por persona» no existe (D-F2-09, P-11).
// - Diseño medido en la maqueta: fondo cream, filete arriba, 80 px; fila horizontal con scroll y snap (gap 20) de tarjetas de 340 px y, al
//   final, la liga a todas. La fila hace scroll DENTRO del contenedor: a 390 la página no se ensancha (la maqueta sí, INVENTARIO §C).
// - Sobre cream, la liga en contorno va en ink (terra da 4.13, CONTRATO-BASE §2.2) y el error en ink con role="alert".
import { useEffect, useState } from 'react'
import { API_URL } from '@/lib/api'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import TarjetaExperiencia, { type ExperienciaPortada } from './TarjetaExperiencia'

const ID_TITULO = 'sn-portada-experiencias-encabezado'
/** Las de hoy: cuántas experiencias muestra la portada (ExperienciasGrid.tsx:31). */
const EXPERIENCIAS_PORTADA = 3
const HREF_TODAS = '/experiencias'

type Estado = { fase: 'cargando' } | { fase: 'listo'; experiencias: ExperienciaPortada[] } | { fase: 'error' }

/** Como ExperienciasGrid de hoy: una respuesta que no es 2xx o que falla = error; si responde, la lista (puede venir vacía). */
async function pedirPublicas(): Promise<Estado> {
  const respuesta = await fetch(`${API_URL}/api/experiencias?tipo=publica&limit=${EXPERIENCIAS_PORTADA}`)
  if (!respuesta.ok) return { fase: 'error' }
  const datos: { items?: ExperienciaPortada[] } = await respuesta.json()
  const items = Array.isArray(datos.items) ? datos.items : []
  return { fase: 'listo', experiencias: items.filter((e) => e.tipo === 'publica').slice(0, EXPERIENCIAS_PORTADA) }
}

export default function ExperienciasDestacadas() {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })

  useEffect(() => {
    let vigente = true
    pedirPublicas()
      .then((nuevo) => {
        if (vigente) setEstado(nuevo)
      })
      .catch(() => {
        if (vigente) setEstado({ fase: 'error' })
      })
    return () => {
      vigente = false
    }
  }, [])

  return (
    <Seccion testId="sn-portada-experiencias" fondo="cream" borde="arriba" etiquetadaPor={ID_TITULO}>
      <Contenedor>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 min-[861px]:mb-12">
          <Titulo nivel={2} tamano="h2" id={ID_TITULO}>
            Experiencias
          </Titulo>
          <Boton href={HREF_TODAS} variante="contorno" tamano="chico" sobreCrema flecha testId="sn-portada-experiencias-todas">
            Ver todas las experiencias
          </Boton>
        </div>

        {estado.fase === 'cargando' && (
          <div data-testid="sn-portada-experiencias-cargando" aria-busy="true" className="flex gap-5 overflow-hidden pb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[480px] w-[340px] max-w-full shrink-0 animate-pulse rounded-sn-tarjeta bg-sn-warm" />
            ))}
          </div>
        )}

        {estado.fase === 'error' && (
          <div data-testid="sn-portada-experiencias-error" role="alert">
            <Texto peso="normal">No pudimos cargar las experiencias. Recarga la página en un momento.</Texto>
          </div>
        )}

        {estado.fase === 'listo' && estado.experiencias.length === 0 && (
          <div data-testid="sn-portada-experiencias-vacio">
            <Texto peso="normal">No hay experiencias disponibles en este momento.</Texto>
          </div>
        )}

        {estado.fase === 'listo' && estado.experiencias.length > 0 && (
          <ul
            data-testid="sn-portada-experiencias-lista"
            className="m-0 flex list-none snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain p-0 pb-4"
          >
            {estado.experiencias.map((experiencia) => (
              <TarjetaExperiencia key={experiencia.id} experiencia={experiencia} />
            ))}
            <li className="flex w-[300px] max-w-full shrink-0 snap-start items-center justify-center px-8 py-10">
              <Boton href={HREF_TODAS} variante="contorno" sobreCrema flecha testId="sn-portada-experiencias-todas-fin">
                Ver todas las experiencias
              </Boton>
            </li>
          </ul>
        )}
      </Contenedor>
    </Seccion>
  )
}
