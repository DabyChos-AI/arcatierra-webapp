// R15 v2 · F5 (recetas, sesión 63): una tarjeta de la rejilla de recetas (maqueta `.receta-card`). Contrato v2 D-F5-12 (P-4 A, P-7 A);
// cadena-v2/f5/recetas-F5.md §2.8 y §2.10. Todo sale de `src/data/recetas.ts` importado (D-F3-12 c) y de los textos de hoy
// (`src/app/recetas/client-page.tsx:481-598`):
// - foto con el título como texto alternativo (:492-499); arriba «{temporada} · {minutos} min» (la maqueta pone una categoría que la
//   receta no tiene; hoy la temporada va sobre la foto, :529-531); nombre; autor y su línea (:539-547); descripción a 3 renglones
//   (:548-550); las 3 primeras etiquetas (:565); abajo la dificultad (:527) y «Ver Receta» a la página de hoy (:577-581, C44);
// - el corazón de favoritos con su nombre accesible y su estado (hoy no tiene nombre, H-3);
// - NO van: calificación y reseñas (C43), el velo de ingredientes que solo se ve con el ratón ni el botón del carrito (P-7 A: la función
//   sigue en la página de cada receta).
// Sobre blanco: terra 5.68 e ink al 70 % 5.24 pasan como texto chico (CONTRATO-BASE-F1 §2.2).
import { Heart } from 'lucide-react'
import type { Recipe } from '@/data/recetas'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { FOCO_BOTON, unirClases } from '@/components/sitio-nuevo/ui/clases'

const T = 'sn-recetas-lista-tarjeta'

type Props = {
  receta: Recipe
  favorita: boolean
  onFavorito: (receta: Recipe) => void
}

export default function TarjetaReceta({ receta, favorita, onFavorito }: Props) {
  return (
    <li data-testid={T} data-receta-id={receta.id} className="list-none">
      <article className="flex h-full flex-col overflow-hidden rounded-sn-tarjeta border border-solid border-sn-border bg-white text-sn-ink">
        <div className="relative">
          <Foto
            src={receta.image}
            alt={receta.title}
            proporcion="4/3"
            sizes="(min-width: 861px) 400px, 100vw"
            testId={`${T}-foto`}
          />
          <button
            type="button"
            data-testid={`${T}-favorito`}
            aria-pressed={favorita}
            aria-label={favorita ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            onClick={() => onFavorito(receta)}
            className={unirClases(
              'absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-sn-pildora border border-solid',
              favorita ? 'border-sn-terra bg-sn-terra text-white' : 'border-sn-border bg-white text-sn-terra',
              FOCO_BOTON,
            )}
          >
            <Heart aria-hidden="true" className={unirClases('h-5 w-5', favorita && 'fill-current')} />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
          <Etiqueta tamano="etiqueta" tono="terra" testId={`${T}-meta`}>
            {`${receta.season} · ${receta.cookTime} min`}
          </Etiqueta>
          <Titulo nivel={3} tamano="h5" testId={`${T}-nombre`} className="mt-2 break-words">
            {receta.title}
          </Titulo>
          {receta.author && (
            <Texto tamano="mini" peso="normal" tono="ink-suave" testId={`${T}-autor`} className="mt-2">
              {receta.author.bio ? `${receta.author.name} • ${receta.author.bio}` : receta.author.name}
            </Texto>
          )}
          <Texto tamano="mini" peso="normal" tono="ink-suave" testId={`${T}-descripcion`} className="mt-3 line-clamp-3">
            {receta.description}
          </Texto>
          {receta.tags.length > 0 && (
            <ul data-testid={`${T}-etiquetas`} className="m-0 mt-4 flex list-none flex-wrap gap-1.5 p-0">
              {receta.tags.slice(0, 3).map((etiqueta) => (
                <li key={etiqueta} className="max-w-full">
                  <Insignia tono="warm" forma="pildora" className="max-w-full break-words">
                    {etiqueta}
                  </Insignia>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-0 border-t border-solid border-sn-border pt-4">
              <Etiqueta tamano="chica" tono="ink" testId={`${T}-dificultad`}>
                {receta.difficulty}
              </Etiqueta>
              <Boton href={`/receta/${receta.id}`} variante="texto" tamano="chico" flecha testId={`${T}-ver`}>
                Ver Receta
              </Boton>
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}
