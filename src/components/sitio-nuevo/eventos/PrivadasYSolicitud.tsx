'use client'

// R15 v2 · F4 (eventos): las experiencias privadas (C39, con su marca a David) y el formulario de solicitud, juntos porque comparten la
// lista y la experiencia elegida (D-F4-07 P-7, P-8, P-9). La lista se pide UNA vez en el navegador (`pedirPrivadas`, la llamada de hoy) y
// la página sigue estática. Textos de hoy: título y texto de la lista (`src/app/experiencias/page.tsx:301, :304`), «Cargando experiencias...»
// (:254), el error (:262) y «Reintentar» (`[slug]/page.tsx:431`). Con 0 privadas no se pinta la rejilla (P-8). El formulario va en la sección
// terra del cotizador de la maqueta, con el título de hoy de ese formulario (`[slug]/page.tsx:720`) y el ancla `#solicitud`.
import { useCallback, useEffect, useState } from 'react'
import Falta from '@/components/sitio-nuevo/Falta'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import FormularioSolicitud, { idControlExperiencia } from './FormularioSolicitud'
import TarjetaPrivada from './TarjetaPrivada'
import { pedirPrivadas, type ExperienciaPrivada } from './privadas'

const P = 'sn-eventos-privadas'
const S = 'sn-eventos-solicitud'

export default function PrivadasYSolicitud() {
  // null = cargando · 'error' = la API no respondió · lista (puede venir vacía)
  const [privadas, setPrivadas] = useState<ExperienciaPrivada[] | 'error' | null>(null)
  const [intento, setIntento] = useState(0)
  const [elegidaId, setElegidaId] = useState('')

  useEffect(() => {
    let vigente = true
    setPrivadas(null)
    pedirPrivadas()
      .then((lista) => {
        if (vigente) setPrivadas(lista)
      })
      .catch(() => {
        if (vigente) setPrivadas('error')
      })
    return () => {
      vigente = false
    }
  }, [intento])

  // «Solicitar Cotización»: elige la experiencia en el formulario y lleva el foco a él (P-7).
  const solicitar = useCallback((id: string) => {
    setElegidaId(id)
    requestAnimationFrame(() => document.getElementById(idControlExperiencia(S))?.focus())
  }, [])

  const lista = Array.isArray(privadas) ? privadas : null

  return (
    <>
      <Seccion testId={P} espacio="normal" etiquetadaPor={`${P}-titulo`}>
        <Contenedor>
          <Titulo nivel={2} id={`${P}-titulo`} testId={`${P}-titulo`} className="mb-4">
            Experiencias Privadas
          </Titulo>
          <Texto testId={`${P}-texto`} tamano="grande" ancho="parrafo" className="mb-4">
            Momentos exclusivos diseñados especialmente para ti y tus seres queridos
          </Texto>
          <p className="m-0 mb-10 font-sn-texto text-sn-cuerpo-sm">
            <Falta que="dónde se listan las experiencias privadas: Eventos privados o Experiencias" quien="David" />
          </p>

          {privadas === null && (
            <p data-testid={`${P}-cargando`} role="status" className="m-0 font-sn-texto text-sn-cuerpo font-light">
              Cargando experiencias...
            </p>
          )}
          {privadas === 'error' && (
            <div data-testid={`${P}-error`} role="alert" className="flex flex-col items-start gap-4">
              <p className="m-0 font-sn-texto text-sn-cuerpo font-light">
                No pudimos cargar las experiencias. Recarga la página en un momento.
              </p>
              <Boton testId={`${P}-reintentar`} onClick={() => setIntento((n) => n + 1)}>
                Reintentar
              </Boton>
            </div>
          )}
          {lista && lista.length === 0 && <div data-testid={`${P}-vacio`} />}
          {lista && lista.length > 0 && (
            <ul
              data-testid={`${P}-lista`}
              className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 min-[861px]:grid-cols-3"
            >
              {lista.map((e) => (
                <TarjetaPrivada key={e.id} experiencia={e} onSolicitar={solicitar} />
              ))}
            </ul>
          )}
        </Contenedor>
      </Seccion>

      <Seccion testId={S} id="solicitud" fondo="terra" borde="arriba" espacio="normal" etiquetadaPor={`${S}-titulo`}>
        <Contenedor ancho="angosto">
          <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[450fr_586fr] min-[861px]:gap-16">
            <Titulo nivel={2} tono="warm" id={`${S}-titulo`} testId={`${S}-titulo`}>
              Solicitar Experiencia Privada
            </Titulo>
            <FormularioSolicitud
              testId={S}
              experiencias={privadas === null ? null : lista ?? []}
              elegidaId={elegidaId}
              onElegir={setElegidaId}
            />
          </div>
        </Contenedor>
      </Seccion>
    </>
  )
}
