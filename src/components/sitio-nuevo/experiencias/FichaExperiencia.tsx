'use client'

// R15 v2 · F4 (sesión 62): la ficha de una experiencia del sitio nuevo, `/experiencias/<slug>`. Contrato v2 §9-F4 D-F4-04, D-F4-11 P-2,
// D-F4-12, D-F4-13; cadena-v2/f4/experiencias-F4.md §3. La maqueta no tiene esta página: se arma con su vocabulario medido (la ficha de
// producto `.prod-detail`, f3/ficha-F3.md §1.2: dos columnas de 568 con 64 de separación desde 861 px y la foto pegada arriba; una columna
// hasta 860). Los originales son los de la ficha de hoy (src/app/experiencias/[slug]/page.tsx) y GET /api/experiencias?slug=:
// - Carga como hoy: «Cargando experiencia...» (:413); no existe → notFound() (:347-349, :438-440; la página responde 200 a cualquier
//   segmento, como hoy); otro error → «No pudimos cargar la experiencia» + «Reintentar» (:419-435).
// - Migas «Inicio · Experiencias · nombre» (:450-464); el nombre tal cual (:504, D-F4-12 P-10); «Pública»/«Privada» (:328-330).
// - Precio (:617-622, :649-655 con precio-privada.ts), niños (:624-647), «Duración: …» (:661), «¿Qué incluye?» sin el emoji (:582-592) e
//   «Información importante:» (:594-609; hoy sale dos veces, aquí una). Sin `requisitos` (D-F4-12 P-11) ni política de reembolso (C38).
// - Pública: sus próximas fechas (:366-397) y el selector en la página (D-F4-12 P-8). Privada: la solicitud (SolicitudPrivada, D-F4-07 P-15).
// - Sin «Ver Calendario» (el calendario de hoy se oculta, DR-7).
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/utils/formatters'
import { formatMXN } from '@/types/reservas'
import type { FechaPublica } from '@/types/compra-experiencias'
import { textoAdicionalPrivada, textoGrupoPrivada } from '@/app/experiencias/[slug]/precio-privada'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Foto from '@/components/sitio-nuevo/ui/Foto'
import Insignia from '@/components/sitio-nuevo/ui/Insignia'
import Migas from '@/components/sitio-nuevo/ui/Migas'
import Precio from '@/components/sitio-nuevo/ui/Precio'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import FechasFicha from './FechasFicha'
import GaleriaFicha from './GaleriaFicha'
import SolicitudPrivada from './SolicitudPrivada'
import {
  fotoDeExperiencia,
  pedirExperienciaPorSlug,
  pedirFechasDeExperiencia,
  sinEmojiInicial,
  type ExperienciaApi,
  type ResultadoFicha,
} from './experiencias'

const RAIZ = 'sn-detalle-experiencia'

export default function FichaExperiencia({ slug }: { slug: string }) {
  const [resultado, setResultado] = useState<ResultadoFicha | null>(null)
  const [intento, setIntento] = useState(0)
  const [fechas, setFechas] = useState<FechaPublica[] | 'error' | null>(null)

  useEffect(() => {
    let vigente = true
    setResultado(null)
    pedirExperienciaPorSlug(slug).then((r) => {
      if (vigente) setResultado(r)
    })
    return () => {
      vigente = false
    }
  }, [slug, intento])

  const experiencia = resultado?.estado === 'ok' ? resultado.experiencia : null
  const idPublica = experiencia && experiencia.tipo !== 'privada' ? experiencia.id : null

  useEffect(() => {
    if (!idPublica) return
    let vigente = true
    setFechas(null)
    pedirFechasDeExperiencia(idPublica).then((lista) => {
      if (vigente) setFechas(lista ?? 'error')
    })
    return () => {
      vigente = false
    }
  }, [idPublica])

  if (resultado === null) {
    return (
      <main data-testid={RAIZ}>
        <Contenedor className="py-[60px]">
          <p data-testid={`${RAIZ}-cargando`} role="status" className="m-0 font-sn-texto text-sn-cuerpo font-normal text-sn-ink">
            Cargando experiencia...
          </p>
        </Contenedor>
      </main>
    )
  }

  if (resultado.estado === 'error') {
    return (
      <main data-testid={RAIZ}>
        <Contenedor className="py-[60px]">
          <div data-testid={`${RAIZ}-error`} role="alert" className="max-w-md">
            <Titulo nivel={1} tamano="h4" className="mb-3">
              No pudimos cargar la experiencia
            </Titulo>
            <Texto peso="normal" className="mb-6">
              Intenta de nuevo en un momento.
            </Texto>
            <Boton onClick={() => setIntento((n) => n + 1)} testId={`${RAIZ}-reintentar`}>
              Reintentar
            </Boton>
          </div>
        </Contenedor>
      </main>
    )
  }

  if (resultado.estado === 'no-existe' || !experiencia) {
    notFound()
  }

  return <Detalle experiencia={experiencia} fechas={fechas} />
}

function Detalle({ experiencia, fechas }: { experiencia: ExperienciaApi; fechas: FechaPublica[] | 'error' | null }) {
  const privada = experiencia.tipo === 'privada'
  const foto = fotoDeExperiencia(experiencia.nombre, experiencia.imagen_principal)
  const incluye = (Array.isArray(experiencia.incluye) ? experiencia.incluye : []).map(sinEmojiInicial)
  const informacion = Array.isArray(experiencia.informacion_importante) ? experiencia.informacion_importante : []
  const galeria = Array.isArray(experiencia.galeria_imagenes) ? experiencia.galeria_imagenes : []
  const adicional = privada ? textoAdicionalPrivada(experiencia.precio_persona_adicional) : null
  // Niños: en la privada, la regla de la experiencia (:624-635); en la pública, la de la primera fecha que la traiga (:636-647).
  const fechaConRegla = !privada && Array.isArray(fechas) ? fechas.find((f) => f.precio_nino != null) ?? null : null
  const nino = privada
    ? experiencia.precio_nino != null
      ? { edad: experiencia.edad_maxima_nino ?? null, texto: experiencia.precio_nino === 0 ? 'Gratis' : formatMXN(experiencia.precio_nino) }
      : null
    : fechaConRegla && fechaConRegla.precio_nino != null
      ? { edad: fechaConRegla.edad_maxima_nino ?? null, texto: formatMXN(fechaConRegla.precio_nino) }
      : null

  return (
    <main data-testid={RAIZ} data-tipo={privada ? 'privada' : 'publica'} data-experiencia-id={experiencia.id}>
      <Contenedor className="pb-[100px] pt-[60px]">
        <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-2 min-[861px]:gap-16">
          <div className="min-w-0 min-[861px]:sticky min-[861px]:top-[100px] min-[861px]:self-start">
            <Foto
              src={foto}
              alt={experiencia.nombre}
              proporcion="4/5"
              redondeo="tarjeta"
              prioridad
              sizes="(min-width: 861px) 568px, 100vw"
              testId={`${RAIZ}-foto`}
              className="bg-sn-sand"
            />
            {galeria.length > 0 && <GaleriaFicha nombre={experiencia.nombre} fotos={galeria} />}
          </div>

          <div className="min-w-0 min-[861px]:py-2">
            <Migas
              etiqueta="Ruta de navegación"
              items={[{ texto: 'Inicio', href: '/' }, { texto: 'Experiencias', href: '/experiencias' }, { texto: experiencia.nombre }]}
              testId={`${RAIZ}-migas`}
              className="mb-[18px]"
            />
            <Insignia tono={privada ? 'terra' : 'green'} tamano="chica" testId={`${RAIZ}-tipo`} className="mb-3.5">
              {privada ? 'Privada' : 'Pública'}
            </Insignia>
            <h1
              data-testid={`${RAIZ}-nombre`}
              className="m-0 mb-[18px] break-words font-sn-titulos text-[clamp(40px,4.5vw,60px)] font-normal leading-[1.05] tracking-[-1px] text-sn-ink"
            >
              {experiencia.nombre}
            </h1>
            {experiencia.descripcion ? (
              <Texto tamano="grande" tono="ink-suave" testId={`${RAIZ}-descripcion`} className="mb-8 max-w-[480px]">
                {experiencia.descripcion}
              </Texto>
            ) : null}

            <div className="mb-7 space-y-2 border-0 border-b border-t border-solid border-sn-border py-6">
              <Precio
                valor={`$${formatPrice(experiencia.precio)}`}
                unidad={privada ? undefined : 'persona'}
                tamano="grande"
                testId={`${RAIZ}-precio`}
              />
              {privada && (
                <Texto tamano="chico" peso="normal" testId={`${RAIZ}-grupo`}>
                  {textoGrupoPrivada(experiencia.personas_incluidas)}
                </Texto>
              )}
              {adicional && (
                <Texto tamano="chico" peso="normal" testId={`${RAIZ}-adicional`}>
                  {adicional}
                </Texto>
              )}
              {nino && (
                <div data-testid={`${RAIZ}-nino`} data-rama={privada ? 'privada' : 'publica'}>
                  <Texto tamano="chico" peso="normal">
                    {nino.edad != null ? `Niños de hasta ${nino.edad} años:` : 'Niños:'}
                  </Texto>
                  <Texto tamano="chico" peso="medio">
                    {nino.texto}
                  </Texto>
                </div>
              )}
              {experiencia.duracion_horas ? (
                <Texto tamano="chico" peso="normal" testId={`${RAIZ}-duracion`}>
                  {`Duración: ${experiencia.duracion_horas} horas`}
                </Texto>
              ) : null}
            </div>

            <div className="mb-10">
              {privada ? (
                <SolicitudPrivada experiencia={experiencia} />
              ) : (
                <FechasFicha fechas={fechas} nombreExperiencia={experiencia.nombre} imagen={foto} />
              )}
            </div>

            {incluye.length > 0 && (
              <section data-testid={`${RAIZ}-incluye`} className="mb-8">
                <Titulo nivel={2} tamano="h5" className="mb-4">
                  ¿Qué incluye?
                </Titulo>
                <ul className="m-0 list-none space-y-3 p-0">
                  {incluye.map((renglon, i) => (
                    <li key={`${i}-${renglon}`} className="flex items-start gap-2">
                      <span aria-hidden="true" className="text-sn-terra">
                        -
                      </span>
                      <Texto as="span" tamano="chico" peso="normal">
                        {renglon}
                      </Texto>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {informacion.length > 0 && (
              <section data-testid={`${RAIZ}-informacion`}>
                <Titulo nivel={2} tamano="h5" className="mb-4">
                  Información importante:
                </Titulo>
                <ul className="m-0 list-none space-y-3 p-0">
                  {informacion.map((renglon, i) => (
                    <li key={`${i}-${renglon}`} className="flex items-start gap-2">
                      <span aria-hidden="true" className="text-sn-terra">
                        •
                      </span>
                      <Texto as="span" tamano="chico" peso="normal">
                        {renglon}
                      </Texto>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </Contenedor>
    </main>
  )
}
