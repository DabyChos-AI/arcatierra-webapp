'use client'

// R15 · F1 (WF1 + WF7, sesión 54): el anuncio emergente de la maqueta (`#arca-popup`): solo en la portada, una vez por sesión
// (sessionStorage), cuando la persona baja el 20 % de la página + 400 ms. Esc, el fondo, ✕ y «No, gracias» lo cierran (y el
// botón también, como en la maqueta). Lee el anuncio VIGENTE de contenido_sitio (lo elige la API); si no hay ninguno, el anuncio
// sale igual con la marca <Falta …/> en bloque (regla de David: nada de relleno; el texto de la maqueta «Sábado 11 de mayo…
// 3 lugares» no se usa). La maqueta trae la etiqueta «Esta semana»: el anuncio de la base no la tiene y no se inventa.
//
// - Cerrado no pinta nada (ni en el servidor): se abre en un efecto, así que no hay hidratación distinta.
// - «Solo en la portada»: está en el layout de src/app/nuevo y se enciende cuando useSelectedLayoutSegments() está vacío (la
//   página de src/app/nuevo/page.tsx), igual en servidor y navegador (regla de F0: nada de usePathname()).
// - Capa z-[950] (modales públicos, Z_INDEX_HIERARCHY.md): queda encima de la cabecera nueva (940), como en la maqueta.
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSelectedLayoutSegments } from 'next/navigation'
import OptimizedImage from '@/components/ui/OptimizedImage'
import type { ContenidoPublico } from '@/types/contenido-sitio'
import Falta from './Falta'

/** Llave de sessionStorage: '1' = ya se cerró en esta sesión. */
export const CLAVE_ANUNCIO_CERRADO = 'snAnuncioCerrado'
const UMBRAL = 0.2
const ESPERA_MS = 400
const ENFOCABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function yaSeCerro(): boolean {
  try {
    return window.sessionStorage.getItem(CLAVE_ANUNCIO_CERRADO) === '1'
  } catch {
    return false
  }
}

function recordarCerrado(): void {
  try {
    window.sessionStorage.setItem(CLAVE_ANUNCIO_CERRADO, '1')
  } catch {
    /* sessionStorage bloqueado: se vuelve a mostrar en la siguiente carga, nada más */
  }
}

export default function AnuncioEmergente({ anuncio }: { anuncio: ContenidoPublico['anuncio'] }) {
  const esPortada = useSelectedLayoutSegments().length === 0
  const [abierto, setAbierto] = useState(false)
  const dialogoRef = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const focoAntes = useRef<HTMLElement | null>(null)

  // Disparador: 20 % de la página + 400 ms, una vez por sesión, solo en la portada.
  useEffect(() => {
    if (!esPortada || yaSeCerro()) return
    let disparado = false
    let temporizador: ReturnType<typeof setTimeout> | undefined
    const revisar = () => {
      if (disparado) return
      const alto = document.documentElement.scrollHeight - window.innerHeight
      if (alto > 0 && window.scrollY / alto >= UMBRAL) {
        disparado = true
        window.removeEventListener('scroll', revisar)
        temporizador = setTimeout(() => {
          if (!yaSeCerro()) setAbierto(true)
        }, ESPERA_MS)
      }
    }
    window.addEventListener('scroll', revisar, { passive: true })
    revisar()
    return () => {
      window.removeEventListener('scroll', revisar)
      clearTimeout(temporizador)
    }
  }, [esPortada])

  const cerrar = useCallback(() => {
    recordarCerrado()
    setAbierto(false)
  }, [])

  // Abierto: sin scroll detrás, foco en ✕, Esc cierra, Tab no sale. Al cerrar, el foco regresa a donde estaba.
  useEffect(() => {
    if (!abierto) return
    focoAntes.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrar()
        return
      }
      if (e.key !== 'Tab' || !dialogoRef.current) return
      const enfocables = Array.from(dialogoRef.current.querySelectorAll<HTMLElement>(ENFOCABLES))
      if (enfocables.length === 0) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      const activo = document.activeElement
      if (e.shiftKey && (activo === primero || !dialogoRef.current.contains(activo))) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && (activo === ultimo || !dialogoRef.current.contains(activo))) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = overflowAntes
      focoAntes.current?.focus?.()
    }
  }, [abierto, cerrar])

  if (!abierto || !esPortada) return null

  const datos = anuncio?.datos ?? null
  const conImagen = !!datos?.imagen_url
  const conBoton = !!(datos?.boton_texto && datos?.boton_url)
  const botonInterno = conBoton && datos!.boton_url!.startsWith('/')
  const claseBoton =
    'inline-block rounded-sn-boton bg-sn-terra px-[22px] py-[11px] font-sn-mono text-[11px] font-medium uppercase leading-[1.55] tracking-[1.6px] text-white transition-colors hover:bg-sn-tinta hover:text-white'

  return (
    <div
      data-testid="sn-anuncio"
      data-vacio={datos ? '0' : '1'}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
      className="fixed inset-0 z-[950] flex items-center justify-center bg-[rgba(61,42,26,0.3)] p-6 motion-safe:animate-fade-in"
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={datos ? 'sn-anuncio-titulo' : undefined}
        aria-label={datos ? undefined : 'Anuncio'}
        data-testid="sn-anuncio-dialogo"
        className={`relative grid max-h-[calc(100dvh-3rem)] w-full overflow-y-auto rounded-sn-tarjeta bg-sn-calido font-sn-texto text-sn-tinta shadow-sn-anuncio ${
          conImagen ? 'max-w-[360px] grid-cols-1 min-[861px]:max-w-[760px] min-[861px]:grid-cols-2' : 'max-w-[440px] grid-cols-1'
        }`}
      >
        <button
          ref={cerrarRef}
          type="button"
          data-testid="sn-anuncio-cerrar"
          aria-label="Cerrar anuncio"
          onClick={cerrar}
          className="absolute right-[14px] top-[14px] z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-sn-tinta/15 text-sm leading-none text-sn-tinta transition-colors hover:bg-sn-tinta/25"
        >
          <span aria-hidden="true">✕</span>
        </button>

        {conImagen && (
          <div className="relative min-h-[200px] min-[861px]:min-h-[300px]">
            <OptimizedImage
              src={datos!.imagen_url!}
              alt=""
              fill
              sizes="(min-width: 861px) 380px, 360px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col justify-center px-6 py-7 min-[861px]:px-8 min-[861px]:py-9">
          {datos ? (
            <>
              <h2
                id="sn-anuncio-titulo"
                data-testid="sn-anuncio-titulo"
                className="mb-3 pr-8 font-sn-titulos text-[28px] leading-[1.05] tracking-[-0.5px] text-sn-tinta"
              >
                {datos.titulo}
              </h2>
              <p data-testid="sn-anuncio-texto" className="mb-[22px] whitespace-pre-line text-sm font-light leading-[1.6] text-sn-tinta/80">
                {datos.texto}
              </p>
              {conBoton &&
                (botonInterno ? (
                  <Link href={datos.boton_url!} data-testid="sn-anuncio-boton" onClick={cerrar} className={`${claseBoton} self-start`}>
                    {datos.boton_texto}
                  </Link>
                ) : (
                  <a
                    href={datos.boton_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="sn-anuncio-boton"
                    onClick={cerrar}
                    className={`${claseBoton} self-start`}
                  >
                    {datos.boton_texto}
                  </a>
                ))}
            </>
          ) : (
            <div className="pr-8">
              <Falta como="bloque" que="anuncio emergente: título, texto, foto y botón" quien="Lucio y Pablo" />
            </div>
          )}
          <button
            type="button"
            data-testid="sn-anuncio-no-gracias"
            onClick={cerrar}
            className="mt-3 self-start font-sn-mono text-[10px] uppercase leading-[1.55] tracking-[1.1px] text-sn-tinta/75 hover:text-sn-terra"
          >
            No, gracias
          </button>
        </div>
      </div>
    </div>
  )
}
