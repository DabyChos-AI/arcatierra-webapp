'use client'

// R15 v2 · F5 (recetas, sesión 63): búsqueda, filtros y rejilla de /recetas, con un solo estado (contrato v2 D-F5-12 P-2, P-3 A, P-4 A;
// cadena-v2/f5/recetas-F5.md §2.6–2.10). La maqueta no trae búsqueda ni filtros: se conservan los de hoy (DR-10) arriba de la rejilla.
// - Búsqueda con el texto de ayuda de hoy (`src/app/recetas/client-page.tsx:299`) y una etiqueta para lectores de pantalla (C24).
// - «Filtros» pliega los grupos de hoy (:367-376): Dificultad, Temporada, Tiempo máximo y Etiquetas, con sus títulos de hoy (:372-469),
//   cerrados al cargar; «Limpiar filtros» a la vista. Selección múltiple con botones de alternar (`aria-pressed`): `ui/GrupoOpciones` es
//   de radios. La regla de filtrado vive en `filtros.ts` (igual a la de hoy, con su prueba).
// - Título de la rejilla = el de hoy, «{n} recetas encontradas» (:476-478), tal cual también con una sola (OBS-R1 de revision: sin
//   singular, que hoy no existe; `n` sale de los datos importados, D-F3-12 c).
// - Porciones: no existen en los datos: UNA marca para todas (M2, C43).
// - Favoritos del navegador con la llave de hoy (`favoritos.ts`) y los avisos de hoy con `ui/Avisos` (:75-83, D-F3-34). Se leen después
//   de montar: el primer pintado es el mismo en el servidor y en el navegador.
// La página sigue estática: nada se lee de la dirección ni de la fecha.
import { useEffect, useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { recipesData, type Recipe } from '@/data/recetas'
import { aviso } from '@/components/ui/Avisos'
import Falta from '@/components/sitio-nuevo/Falta'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import { alternarFavoritoReceta, leerFavoritosRecetas } from './favoritos'
import {
  DIFICULTADES,
  FILTROS_INICIALES,
  TEMPORADAS,
  TIEMPO_MAXIMO,
  TIEMPO_MINIMO,
  alternar,
  etiquetasDe,
  filtrarRecetas,
  type Filtros,
  type GrupoFiltro,
} from './filtros'
import TarjetaReceta from './TarjetaReceta'

const F = 'sn-recetas-filtros'
const L = 'sn-recetas-lista'

// Las mismas piezas de texto que la tienda nueva (`tienda/CompraSuelto.tsx:41-42`).
const ETIQUETA = 'font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink'
const PILDORA = 'rounded-sn-pildora border border-solid px-4 py-2 font-sn-mono text-sn-etiqueta-sm font-medium uppercase'
const PILDORA_ELEGIDA = 'border-sn-ink bg-sn-ink text-sn-cream'
const PILDORA_LIBRE = 'border-sn-muted bg-white text-sn-ink'

const ETIQUETAS = etiquetasDe(recipesData)

function textoCuantas(n: number): string {
  return `${n} recetas encontradas`
}

type GrupoProps = {
  grupo: GrupoFiltro
  titulo: string
  valores: readonly string[]
  elegidos: readonly string[]
  onAlternar: (valor: string) => void
  desplazable?: boolean
}

function Grupo({ grupo, titulo, valores, elegidos, onAlternar, desplazable = false }: GrupoProps) {
  const idTitulo = useId()
  return (
    <div data-testid={`${F}-grupo`} data-grupo={grupo} role="group" aria-labelledby={idTitulo} className="min-w-0">
      <p id={idTitulo} className={unirClases(ETIQUETA, 'm-0 mb-3')}>
        {titulo}
      </p>
      <div className={unirClases('flex flex-wrap gap-2', desplazable && 'max-h-32 overflow-y-auto')}>
        {valores.map((valor) => {
          const elegido = elegidos.includes(valor)
          return (
            <button
              key={valor}
              type="button"
              data-testid={`${F}-opcion`}
              data-grupo={grupo}
              data-valor={valor}
              aria-pressed={elegido}
              onClick={() => onAlternar(valor)}
              className={unirClases(PILDORA, elegido ? PILDORA_ELEGIDA : PILDORA_LIBRE, FOCO)}
            >
              {valor}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ListaRecetas() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
  const [abiertos, setAbiertos] = useState(false)
  const [favoritas, setFavoritas] = useState<string[]>([])
  const idPanel = useId()
  const idTiempo = useId()

  useEffect(() => {
    setFavoritas(leerFavoritosRecetas())
  }, [])

  const recetas = filtrarRecetas(recipesData, filtros)

  function alFavorito(receta: Recipe) {
    const marcada = alternarFavoritoReceta(receta.id)
    if (marcada === null) return
    setFavoritas(leerFavoritosRecetas())
    if (marcada) {
      aviso.exito(`${receta.title} añadida a favoritos`, { titulo: 'Receta añadida a favoritos' })
    } else {
      aviso.info(`${receta.title} eliminada de favoritos`, { titulo: 'Receta eliminada de favoritos' })
    }
  }

  return (
    <>
      <Seccion testId={F} fondo="warm" espacio="ninguno" className="pt-10 min-[861px]:pt-12">
        <Contenedor ancho="medio">
          <div className="flex flex-col gap-4 min-[861px]:flex-row min-[861px]:items-end">
            <div className="min-w-0 flex-1">
              <Campo
                tipo="search"
                etiqueta="Buscar recetas"
                etiquetaOculta
                placeholder="Busca recetas, ingredientes, técnicas..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
                testId={`${F}-buscar`}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-testid={`${F}-abrir`}
                aria-expanded={abiertos}
                aria-controls={idPanel}
                onClick={() => setAbiertos((a) => !a)}
                className={unirClases(PILDORA, 'inline-flex items-center gap-2', abiertos ? PILDORA_ELEGIDA : PILDORA_LIBRE, FOCO)}
              >
                <span>Filtros</span>
                <ChevronDown aria-hidden="true" className={unirClases('h-4 w-4', abiertos && 'rotate-180')} />
              </button>
              <button
                type="button"
                data-testid={`${F}-limpiar`}
                onClick={() => setFiltros(FILTROS_INICIALES)}
                className={unirClases(PILDORA, PILDORA_LIBRE, FOCO)}
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div
            id={idPanel}
            hidden={!abiertos}
            className="mt-6 rounded-sn-tarjeta border border-solid border-sn-border bg-white p-6 text-sn-ink"
          >
            <div className="grid grid-cols-1 gap-6 min-[861px]:grid-cols-2">
              <Grupo
                grupo="dificultad"
                titulo="Dificultad"
                valores={DIFICULTADES}
                elegidos={filtros.dificultades}
                onAlternar={(v) => setFiltros((f) => ({ ...f, dificultades: alternar(f.dificultades, v) }))}
              />
              <Grupo
                grupo="temporada"
                titulo="Temporada"
                valores={TEMPORADAS}
                elegidos={filtros.temporadas}
                onAlternar={(v) => setFiltros((f) => ({ ...f, temporadas: alternar(f.temporadas, v) }))}
              />
              <div className="min-w-0">
                <label htmlFor={idTiempo} className={unirClases(ETIQUETA, 'mb-3 block')}>
                  Tiempo máximo: <span data-testid={`${F}-tiempo-valor`}>{filtros.tiempoMaximo}</span> min
                </label>
                <input
                  id={idTiempo}
                  data-testid={`${F}-tiempo`}
                  type="range"
                  min={TIEMPO_MINIMO}
                  max={TIEMPO_MAXIMO}
                  value={filtros.tiempoMaximo}
                  onChange={(e) => setFiltros((f) => ({ ...f, tiempoMaximo: Number(e.target.value) }))}
                  className={unirClases('w-full accent-sn-terra', FOCO)}
                />
              </div>
              <Grupo
                grupo="etiquetas"
                titulo="Etiquetas"
                valores={ETIQUETAS}
                elegidos={filtros.etiquetas}
                onAlternar={(v) => setFiltros((f) => ({ ...f, etiquetas: alternar(f.etiquetas, v) }))}
                desplazable
              />
            </div>
          </div>
        </Contenedor>
      </Seccion>

      <Seccion testId={L} fondo="warm" espacio="ninguno" className="pb-sn-seccion-movil pt-8 min-[861px]:pb-sn-seccion">
        <Contenedor ancho="medio">
          <div data-testid={`${L}-titulo`} data-cuantas={recetas.length}>
            <Titulo nivel={2} tamano="h4">
              {textoCuantas(recetas.length)}
            </Titulo>
          </div>
          <Texto tamano="chico" peso="normal" className="mt-2">
            <Falta que="porciones de cada receta" quien="David" />
          </Texto>
          <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-6 p-0 min-[861px]:grid-cols-3">
            {recetas.map((receta) => (
              <TarjetaReceta key={receta.id} receta={receta} favorita={favoritas.includes(receta.id)} onFavorito={alFavorito} />
            ))}
          </ul>
        </Contenedor>
      </Seccion>
    </>
  )
}
