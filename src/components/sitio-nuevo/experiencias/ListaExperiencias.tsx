'use client'

// R15 v2 · F4 (sesión 62): la lista de experiencias del sitio nuevo, `/experiencias` (maqueta `data-page="experiencias"`). Contrato v2 §9-F4
// D-F4-04, D-F4-12, D-F4-13; cadena-v2/f4/experiencias-F4.md §2. Los datos se piden en el navegador (D-F2-03), con las llamadas de hoy:
// - las públicas: GET /api/experiencias?tipo=publica, todas las páginas (src/app/experiencias/page.tsx:94-107; ExperienciasGrid.tsx:75);
// - las fechas: UNA llamada al feed público completo (D-F4-12 P-3; como src/app/calendario/page.tsx:189-219), que sirve a las tarjetas, al
//   filtro por mes y al resumen.
// Textos de hoy: «Nuestras Experiencias» y su texto (experiencias/page.tsx:211-216), «{n} experiencias disponibles» (calendario/page.tsx:317),
// el error (experiencias/page.tsx:262) y el vacío (ExperienciasGrid.tsx:204). Sin filtros por tipo (C39: la API no trae categoría) ni por
// personas; el mes solo con los meses que tienen fechas (D-F4-12 P-4). Las 14 privadas se listan en la página de eventos (D-F4-07 P-7):
// aquí, la venta cruzada. El `?tipo=` de las ligas viejas no se lee (D-F4-12 P-12): la página sigue estática.
import { useEffect, useMemo, useState } from 'react'
import { etiquetaMes } from '@/app/admin/eventos/components/fechas'
import type { FechaPublica } from '@/types/compra-experiencias'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import ComoFunciona from './ComoFunciona'
import TarjetaLista, { type FechasDeTarjeta } from './TarjetaLista'
import VentaCruzada from './VentaCruzada'
import { mesDe, mesesConFechas, pedirExperienciasPublicas, pedirFechasPublicas, type ExperienciaApi } from './experiencias'

type Experiencias = ExperienciaApi[] | 'cargando' | 'error'
type Fechas = FechaPublica[] | 'cargando' | 'error'

const TODOS = 'todos'

export default function ListaExperiencias() {
  const [experiencias, setExperiencias] = useState<Experiencias>('cargando')
  const [fechas, setFechas] = useState<Fechas>('cargando')
  const [mes, setMes] = useState<string>(TODOS)

  useEffect(() => {
    let vigente = true
    pedirExperienciasPublicas().then((lista) => {
      if (vigente) setExperiencias(lista ?? 'error')
    })
    pedirFechasPublicas().then((lista) => {
      if (vigente) setFechas(lista ?? 'error')
    })
    return () => {
      vigente = false
    }
  }, [])

  const meses = useMemo(() => (Array.isArray(fechas) ? mesesConFechas(fechas) : []), [fechas])
  const mesElegido = mes !== TODOS && meses.includes(mes) ? mes : TODOS

  /** Las fechas de una experiencia con el mes elegido (o el estado del feed). */
  const fechasDe = (experienciaId: string): FechasDeTarjeta => {
    if (!Array.isArray(fechas)) return fechas
    return fechas.filter((f) => f.experiencia_id === experienciaId && (mesElegido === TODOS || mesDe(f.fecha_evento) === mesElegido))
  }

  const visibles = Array.isArray(experiencias)
    ? mesElegido === TODOS
      ? experiencias
      : experiencias.filter((e) => {
          const suyas = fechasDe(e.id)
          return Array.isArray(suyas) && suyas.length > 0
        })
    : []
  const estadoResumen = experiencias === 'cargando' ? 'cargando' : experiencias === 'error' ? 'error' : 'listo'

  return (
    <main data-testid="sn-experiencias">
      <Seccion
        fondo="warm"
        borde="abajo"
        espacio="ninguno"
        testId="sn-experiencias-encabezado"
        className="pb-10 pt-sn-seccion-movil min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion"
      >
        <Contenedor className="grid grid-cols-1 gap-8 min-[861px]:grid-cols-[2fr_1fr] min-[861px]:items-end min-[861px]:gap-12">
          <div className="min-w-0">
            <Migas
              etiqueta="Ruta de navegación"
              items={[{ texto: 'Inicio', href: '/' }, { texto: 'Experiencias' }]}
              testId="sn-experiencias-migas"
              className="mb-6"
            />
            <Titulo nivel={1} tamano="hero-xl" tono="terra" testId="sn-experiencias-titulo" className="mb-[18px] break-words">
              Nuestras Experiencias
            </Titulo>
            <Texto tamano="grande" tono="ink-suave" testId="sn-experiencias-texto" className="max-w-[560px]">
              Sumérgete en la auténtica cultura mexicana a través de experiencias gastronómicas únicas en las chinampas de Xochimilco
            </Texto>
          </div>
          <div data-testid="sn-experiencias-resumen" data-estado={estadoResumen} className="min-w-0">
            {estadoResumen === 'listo' && (
              <Etiqueta>{`${visibles.length} ${visibles.length === 1 ? 'experiencia disponible' : 'experiencias disponibles'}`}</Etiqueta>
            )}
          </div>
        </Contenedor>
      </Seccion>

      {meses.length > 0 && (
        <div
          data-testid="sn-experiencias-filtros"
          className="sticky top-14 z-[90] border-0 border-b border-solid border-sn-border bg-sn-warm py-[22px] min-[861px]:top-16"
        >
          <Contenedor>
            <div className="w-full max-w-[260px]">
              <Campo
                tipo="select"
                etiqueta="Mes"
                etiquetaOculta
                value={mesElegido}
                onChange={(e) => setMes(e.target.value)}
                opciones={[{ valor: TODOS, etiqueta: 'Todos los meses' }, ...meses.map((m) => ({ valor: m, etiqueta: etiquetaMes(`${m}-01`) }))]}
                testId="sn-experiencias-filtros-mes"
              />
            </div>
          </Contenedor>
        </div>
      )}

      <Contenedor className="pb-sn-seccion pt-14">
        <ComoFunciona />

        <div className="mt-10 min-[861px]:mt-20">
          {experiencias === 'cargando' && (
            <div data-testid="sn-experiencias-cargando" aria-busy="true" className="flex flex-col gap-10">
              {[0, 1].map((i) => (
                <div key={i} className="h-[420px] animate-pulse rounded-[18px] bg-sn-cream motion-reduce:animate-none" />
              ))}
            </div>
          )}
          {experiencias === 'error' && (
            <div data-testid="sn-experiencias-error" role="alert">
              <Texto peso="normal">No pudimos cargar las experiencias. Recarga la página en un momento.</Texto>
            </div>
          )}
          {Array.isArray(experiencias) && visibles.length === 0 && (
            <div data-testid="sn-experiencias-vacio">
              <Texto peso="normal">No hay experiencias disponibles en este momento.</Texto>
            </div>
          )}
          {visibles.length > 0 && (
            <ul data-testid="sn-experiencias-lista" className="m-0 flex list-none flex-col gap-10 p-0">
              {visibles.map((experiencia, i) => (
                <TarjetaLista key={experiencia.id} experiencia={experiencia} fechas={fechasDe(experiencia.id)} indice={i} />
              ))}
            </ul>
          )}
        </div>

        <div className="mt-sn-seccion">
          <VentaCruzada />
        </div>
      </Contenedor>
    </main>
  )
}
