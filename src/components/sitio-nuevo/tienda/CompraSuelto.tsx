'use client'

// R15 v2 · F3 (tienda): la pestaña «Compra suelto» (`#tab-probar` de la maqueta). Lo de la tienda de hoy que se conserva (DR-10,
// MAPA-CONTENIDO A §2.4, D-F3-24 T-1): buscador con voz y sugerencias (tienda/page.tsx:142-235, :1012-1067), categorías sacadas de la
// lista (:608-635) con `?categoria=` (T-23), orden por precio y nombre (:1209-1235), vistas de 1 · 2 · 4 columnas (4 desde 861 y 2 hasta
// 860 por omisión) y Tienda/Favoritos (:1153-1166, :1279-1292). Lo que no se copia: búsquedas «recientes/populares» escritas a mano
// (:177-178), calificaciones (D-6), «Ahorra 5%», el catálogo local de respaldo.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Mic, MicOff } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { precioLegible } from '@/lib/precio'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import Falta from '@/components/sitio-nuevo/Falta'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import Catalogo, { type Columnas } from './Catalogo'
import { categoriasDe, filtrar, TODAS, type Orden } from './catalogo'
import { useFavoritosTienda } from './useFavoritosTienda'
import type { Carga, DatosTienda } from './Tienda'

interface Sugerencia {
  texto: string
  /** null en los productos sin categoría (13 en venta el 29-oct): hoy salen igual (y pintan «• null», tienda/page.tsx:213). */
  categoria: string | null
  precio: number
  tipo: 'producto' | 'categoria'
}

function leerSugerencias(datos: unknown): Sugerencia[] {
  if (!Array.isArray(datos)) return []
  return datos.filter(
    (s): s is Sugerencia =>
      !!s &&
      typeof s.texto === 'string' &&
      (typeof s.categoria === 'string' || s.categoria === null) &&
      (s.tipo === 'producto' || s.tipo === 'categoria'),
  )
}

const ETIQUETA = 'font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink'
const PILDORA = 'rounded-sn-pildora border border-solid px-4 py-2 font-sn-mono text-sn-etiqueta-sm font-medium uppercase'

interface Props {
  productos: Carga<DatosTienda>
  categoriaInicial: string | null
  reintentar: () => void
}

export default function CompraSuelto({ productos, categoriaInicial, reintentar }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<string>(categoriaInicial ?? TODAS)
  const [orden, setOrden] = useState<Orden>('mas-recientes')
  const [columnas, setColumnas] = useState<Columnas>(4)
  const [soloFavoritos, setSoloFavoritos] = useState(false)
  const [sugerencias, setSugerencias] = useState<Sugerencia[] | null>(null)
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false)
  const [verSugerencias, setVerSugerencias] = useState(false)
  const pedidoSugerencias = useRef(0)
  const { favoritos, alternar } = useFavoritosTienda()

  useEffect(() => {
    if (categoriaInicial) setCategoria(categoriaInicial)
  }, [categoriaInicial])

  // Búsqueda por voz de hoy (importada): al terminar, busca lo dicho.
  const voz = useVoiceSearch((texto: string) => {
    setBusqueda(texto)
    setVerSugerencias(true)
  })

  // Sugerencias de hoy: GET /api/products/search/suggestions?q= con 300 ms y desde 2 letras (tienda/page.tsx:147-169).
  useEffect(() => {
    if (busqueda.length < 2) {
      setSugerencias(null)
      return
    }
    const pedido = ++pedidoSugerencias.current
    const espera = setTimeout(() => {
      setBuscandoSugerencias(true)
      fetch(`${API_URL}/api/products/search/suggestions?q=${encodeURIComponent(busqueda)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((datos: unknown) => {
          if (pedido === pedidoSugerencias.current) setSugerencias(leerSugerencias(datos))
        })
        .catch(() => {
          if (pedido === pedidoSugerencias.current) setSugerencias([])
        })
        .finally(() => {
          if (pedido === pedidoSugerencias.current) setBuscandoSugerencias(false)
        })
    }, 300)
    return () => clearTimeout(espera)
  }, [busqueda])

  const lista = productos.fase === 'listo' ? productos.datos.sueltos : []
  const categorias = useMemo(() => categoriasDe(lista), [lista])
  const visibles = useMemo(
    () => filtrar(lista, { busqueda, categoria, soloFavoritos, favoritos, orden }),
    [lista, busqueda, categoria, soloFavoritos, favoritos, orden],
  )

  const elegirSugerencia = (s: Sugerencia) => {
    setVerSugerencias(false)
    if (s.tipo === 'categoria' && s.categoria) {
      // T-22: «Ver todos en {categoría}» elige la categoría (hoy buscaba ese texto y daba 0).
      setBusqueda('')
      setCategoria(s.categoria)
    } else {
      setBusqueda(s.texto)
    }
  }

  return (
    <section data-testid="sn-tienda-suelto" aria-labelledby="sn-tienda-suelto-titulo" className="py-sn-seccion-movil min-[861px]:py-sn-seccion">
      <Contenedor className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Titulo nivel={2} tamano="h3" id="sn-tienda-suelto-titulo" testId="sn-tienda-suelto-titulo">
            Compra suelto
          </Titulo>
          <p data-testid="sn-tienda-suelto-conteo" aria-live="polite" className="m-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-ink/70">
            {productos.fase === 'listo' ? `${visibles.length} alimentos encontrados` : ''}
          </p>
        </div>

        <div className="relative">
          <label htmlFor="sn-tienda-buscar" className="sr-only">
            Busca alimentos frescos
          </label>
          <input
            id="sn-tienda-buscar"
            data-testid="sn-tienda-suelto-buscar"
            type="search"
            value={voz.isListening ? voz.transcript : busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setVerSugerencias(true)
            }}
            onFocus={() => setVerSugerencias(true)}
            onBlur={() => setTimeout(() => setVerSugerencias(false), 200)}
            placeholder={voz.isListening ? 'Escuchando...' : 'Busca alimentos frescos'}
            className={unirClases(
              'w-full rounded-sn-pildora border border-solid border-sn-muted bg-white py-3 pl-5 pr-14 font-sn-texto text-sn-cuerpo-sm text-sn-ink placeholder:text-sn-ink/70',
              FOCO,
            )}
          />
          {voz.isSupported && (
            <button
              type="button"
              data-testid="sn-tienda-suelto-voz"
              onClick={voz.isListening ? voz.stopListening : voz.startListening}
              aria-label={voz.isListening ? 'Detener grabación' : 'Búsqueda por voz'}
              aria-pressed={voz.isListening}
              className={unirClases(
                'absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sn-pildora',
                voz.isListening ? 'bg-sn-terra text-white' : 'bg-sn-warm text-sn-ink',
                FOCO,
              )}
            >
              {voz.isListening ? (
                <MicOff aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Mic aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          )}
          {verSugerencias && busqueda.length >= 2 && (
            <div
              data-testid="sn-tienda-suelto-sugerencias"
              className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-96 overflow-y-auto rounded-sn-tarjeta border border-solid border-sn-border bg-white p-3 text-sn-ink"
            >
              <p className={unirClases(ETIQUETA, 'm-0 mb-2')}>{buscandoSugerencias ? 'Buscando...' : 'Sugerencias inteligentes'}</p>
              {!buscandoSugerencias && sugerencias && sugerencias.length === 0 && (
                <p className="m-0 font-sn-texto text-sn-cuerpo-sm">No se encontraron sugerencias para &quot;{busqueda}&quot;</p>
              )}
              {!buscandoSugerencias && sugerencias && sugerencias.length > 0 && (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {sugerencias.map((s, i) => (
                    <li key={`${s.tipo}-${s.texto}-${i}`}>
                      <button
                        type="button"
                        data-testid="sn-tienda-suelto-sugerencias-item"
                        data-tipo={s.tipo}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => elegirSugerencia(s)}
                        className={unirClases('flex w-full flex-col items-start rounded-sn-boton px-2 py-2 text-left hover:bg-sn-warm', FOCO)}
                      >
                        <span className="font-sn-texto text-sn-cuerpo-sm font-medium">{s.texto}</span>
                        {/* El renglón de hoy (tienda/page.tsx:211-221): precio • categoría, o la categoría y la etiqueta «Categoría»; sin «null». */}
                        <span className="font-sn-texto text-sn-cuerpo-xs font-normal">
                          {s.tipo === 'producto' ? [precioLegible(s.precio), s.categoria].filter(Boolean).join(' • ') : s.categoria}
                        </span>
                        {s.tipo === 'categoria' && <span className={ETIQUETA}>Categoría</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Categorías">
          {[TODAS, ...categorias].map((c) => {
            const elegida = categoria === c
            return (
              <button
                key={c}
                type="button"
                data-testid="sn-tienda-suelto-categoria"
                data-categoria={c}
                aria-pressed={elegida}
                onClick={() => {
                  setCategoria(c)
                  setSoloFavoritos(false)
                }}
                className={unirClases(PILDORA, elegida ? 'border-sn-ink bg-sn-ink text-sn-cream' : 'border-sn-muted bg-white text-sn-ink', FOCO)}
              >
                {c === TODAS ? 'Todas las categorías' : c}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Precio</span>
            <select
              data-testid="sn-tienda-suelto-orden-precio"
              value={orden.startsWith('precio') ? orden : ''}
              onChange={(e) => e.target.value && setOrden(e.target.value as Orden)}
              className={unirClases('rounded-sn-pildora border border-solid border-sn-muted bg-white px-4 py-2 font-sn-texto text-sn-cuerpo-sm text-sn-ink', FOCO)}
            >
              <option value="">Precio</option>
              <option value="precio-menor">Menor a mayor</option>
              <option value="precio-mayor">Mayor a menor</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={ETIQUETA}>Nombre</span>
            <select
              data-testid="sn-tienda-suelto-orden-nombre"
              value={orden.startsWith('nombre') ? orden : ''}
              onChange={(e) => e.target.value && setOrden(e.target.value as Orden)}
              className={unirClases('rounded-sn-pildora border border-solid border-sn-muted bg-white px-4 py-2 font-sn-texto text-sn-cuerpo-sm text-sn-ink', FOCO)}
            >
              <option value="">Nombre</option>
              <option value="nombre-az">A-Z</option>
              <option value="nombre-za">Z-A</option>
            </select>
          </label>
          <div className="flex gap-2" role="group" aria-label="Vista">
            <button
              type="button"
              data-testid="sn-tienda-suelto-vista-tienda"
              aria-pressed={!soloFavoritos}
              onClick={() => setSoloFavoritos(false)}
              className={unirClases(PILDORA, !soloFavoritos ? 'border-sn-ink bg-sn-ink text-sn-cream' : 'border-sn-muted bg-white text-sn-ink', FOCO)}
            >
              Tienda
            </button>
            <button
              type="button"
              data-testid="sn-tienda-suelto-vista-favoritos"
              aria-pressed={soloFavoritos}
              onClick={() => setSoloFavoritos(true)}
              className={unirClases(
                PILDORA,
                'inline-flex items-center gap-2',
                soloFavoritos ? 'border-sn-ink bg-sn-ink text-sn-cream' : 'border-sn-muted bg-white text-sn-ink',
                FOCO,
              )}
            >
              <Heart aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Favoritos{favoritos.length > 0 ? ` (${favoritos.length})` : ''}</span>
            </button>
          </div>
          <div className="ml-auto flex gap-2" role="group" aria-label="Columnas">
            {([1, 2, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                data-testid="sn-tienda-suelto-columnas"
                data-columnas={n}
                aria-pressed={columnas === n}
                // Hoy son solo íconos sin nombre (tienda/page.tsx:1242-1265); aquí el nombre se lee completo (no se pinta).
                aria-label={n === 1 ? '1 columna' : `${n} columnas`}
                onClick={() => setColumnas(n)}
                className={unirClases(
                  'flex h-10 w-10 items-center justify-center rounded-sn-boton border border-solid',
                  columnas === n ? 'border-sn-terra bg-sn-terra text-white' : 'border-sn-muted bg-white text-sn-ink',
                  FOCO,
                )}
              >
                <IconoColumnas n={n} />
              </button>
            ))}
          </div>
        </div>

        <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
          <Falta que="origen y productor de cada producto" quien="Lucio y Pablo" />
        </p>

        {soloFavoritos && productos.fase === 'listo' && visibles.length === 0 ? (
          <div data-testid="sn-tienda-suelto-sin-favoritos" className="flex flex-col items-center gap-4 rounded-sn-tarjeta bg-white p-8 text-center">
            <Titulo nivel={3} tamano="h5">
              No tienes productos favoritos
            </Titulo>
            <p className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
              Explora nuestra tienda y marca productos como favoritos para verlos aquí
            </p>
            <button
              type="button"
              onClick={() => setSoloFavoritos(false)}
              className={unirClases(PILDORA, 'border-sn-terra bg-sn-terra text-white', FOCO)}
            >
              Explorar tienda
            </button>
          </div>
        ) : (
          <Catalogo
            pestana="compra-suelto"
            carga={productos.fase}
            productos={visibles}
            columnas={columnas}
            favoritos={favoritos}
            alAlternarFavorito={alternar}
            reintentar={reintentar}
          />
        )}
      </Contenedor>
    </section>
  )
}

/** Dibujo de las columnas para el botón (decorativo; el botón dice su número). */
function IconoColumnas({ n }: { n: 1 | 2 | 4 }) {
  return (
    <span aria-hidden="true" className="flex gap-0.5">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="h-4 w-1.5 rounded-sm bg-current" />
      ))}
    </span>
  )
}
