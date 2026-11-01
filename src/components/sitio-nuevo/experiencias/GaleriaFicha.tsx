'use client'

// R15 v2 · F4 (sesión 62): la galería de la ficha de una experiencia, solo si la API trae `galeria_imagenes` (hoy ninguna de las 17: no se
// pinta y no lleva marca, el campo existe). La conducta de hoy (src/app/experiencias/[slug]/page.tsx:524-580): la foto grande con «Anterior»
// y «Siguiente», el contador «{n} / {total}» y las miniaturas; el texto alternativo de hoy («{nombre} - Foto {n}», «Miniatura {n}»).
import { useState } from 'react'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import { FOCO_BOTON, unirClases } from '@/components/sitio-nuevo/ui/clases'

export default function GaleriaFicha({ nombre, fotos }: { nombre: string; fotos: string[] }) {
  const [indice, setIndice] = useState(0)
  const actual = Math.min(indice, fotos.length - 1)
  const flecha = `absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-sn-ink/70 text-white hover:bg-sn-ink ${FOCO_BOTON}`

  return (
    <div data-testid="sn-detalle-experiencia-galeria" className="mt-4">
      <div className="relative">
        <Foto src={fotos[actual]} alt={`${nombre} - Foto ${actual + 1}`} proporcion="16/9" redondeo="tarjeta" sizes="(min-width: 861px) 568px, 100vw" />
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndice((i) => (i === 0 ? fotos.length - 1 : i - 1))}
              aria-label="Anterior"
              className={unirClases(flecha, 'left-3')}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => setIndice((i) => (i === fotos.length - 1 ? 0 : i + 1))}
              aria-label="Siguiente"
              className={unirClases(flecha, 'right-3')}
            >
              <span aria-hidden="true">›</span>
            </button>
            <p className="absolute bottom-3 left-1/2 m-0 -translate-x-1/2 rounded-sn-pildora bg-sn-ink/70 px-3 py-1 font-sn-texto text-sn-cuerpo-sm text-white">
              {actual + 1} / {fotos.length}
            </p>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <ul className="m-0 mt-2 flex list-none gap-2 overflow-x-auto p-0 pb-2">
          {fotos.map((src, i) => (
            <li key={`${i}-${src}`} className="w-20 shrink-0">
              <button
                type="button"
                onClick={() => setIndice(i)}
                aria-pressed={i === actual}
                className={unirClases(
                  'block w-full overflow-hidden rounded-sn-campo border-2 border-solid',
                  i === actual ? 'border-sn-terra' : 'border-transparent hover:border-sn-muted',
                  FOCO_BOTON,
                )}
              >
                <Foto src={src} alt={`Miniatura ${i + 1}`} proporcion="1/1" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
