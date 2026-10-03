'use client'

// Portal del cliente (G1, R9, sesión 49, 3-oct-2026). Contrato: R9-CONTRATO.md §4.3. Pensada para 390×844 primero.
// El link (`/reserva/<token>`) le llega al cliente en sus correos y en /usuario/reservas; el token ES la credencial.
// GET público `${API_URL}/api/portal/{token}` (forma exacta: `PortalResponse` de src/types/portal.ts, del líder).
// La API no manda contacto, notas, guía ni nada interno: esta pantalla no pinta datos de contacto del cliente.

import { use, useEffect, useRef, useState } from 'react'
import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { PORTAL_HTTP, type PortalExperiencia, type PortalResponse } from '@/types/portal'
import TarjetaExperiencia from './components/TarjetaExperiencia'
import QrReserva from './components/QrReserva'
import PagoReserva from './components/PagoReserva'
import SolicitudForm from './components/SolicitudForm'
import ContactoPie from './components/ContactoPie'
import { renglones, tituloPortal } from './components/textos'

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; datos: PortalResponse }
  | { fase: 'invalido'; detalle: string }
  | { fase: 'vencido'; detalle: string }
  | { fase: 'error'; detalle: string }

// Respaldo si la API no trae `detail` (los textos buenos los manda el backend: portal_reglas.py).
const TEXTO_INVALIDO = 'No encontramos esta reserva. Revisa que el link esté completo.'
const TEXTO_VENCIDO = 'Este link ya no está disponible. Si necesitas algo de tu reserva, escríbenos.'
const TEXTO_ERROR = 'No pudimos cargar tu reserva. Intenta de nuevo en un momento.'
const TEXTO_DEMASIADOS = 'Hiciste muchos intentos seguidos. Espera un minuto e intenta de nuevo.'

/** El token tal como se escribió (Next 15 entrega los params codificados). */
function decodificarToken(valor: string): string {
  try {
    return decodeURIComponent(valor)
  } catch {
    return valor
  }
}

function detalleDe(cuerpo: unknown): string | null {
  if (typeof cuerpo === 'object' && cuerpo !== null && 'detail' in cuerpo) {
    const d = (cuerpo as { detail: unknown }).detail
    if (typeof d === 'string' && d.trim()) return d
  }
  return null
}

function texto(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

function numero(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Llave faltante ≠ pantalla rota: arreglos y textos con su vacío; lo demás tal cual de la API. */
function normalizar(cuerpo: unknown): PortalResponse | null {
  if (typeof cuerpo !== 'object' || cuerpo === null) return null
  const c = cuerpo as Partial<PortalResponse>
  if (typeof c.folio !== 'string') return null
  const experiencias: PortalExperiencia[] = (Array.isArray(c.experiencias) ? c.experiencias : []).map((e) => ({
    nombre: texto(e?.nombre) ?? 'Experiencia',
    fecha: typeof e?.fecha === 'string' ? e.fecha : '',
    hora_inicio: texto(e?.hora_inicio),
    hora_fin: texto(e?.hora_fin),
    personas: numero(e?.personas),
    ninos: numero(e?.ninos),
    idioma: texto(e?.idioma),
    punto_encuentro: texto(e?.punto_encuentro),
    mapa_url: texto(e?.mapa_url),
    incluye: renglones(e?.incluye),
    informacion_importante: renglones(e?.informacion_importante),
    requisitos: renglones(e?.requisitos),
  }))
  return {
    tipo: c.tipo === 'compra' ? 'compra' : 'reserva',
    folio: c.folio,
    nombre: texto(c.nombre),
    estado: typeof c.estado === 'string' ? c.estado : '',
    estado_texto: typeof c.estado_texto === 'string' ? c.estado_texto : '',
    experiencias,
    pago: c.pago && typeof c.pago === 'object' ? c.pago : null,
    qr: c.qr && typeof c.qr === 'object' && texto(c.qr.url) ? { url: c.qr.url } : null,
    puede_solicitar: c.puede_solicitar === true,
    politica: texto(c.politica),
  }
}

/** Contenedor común: deja el hueco del encabezado fijo (banner 28 px + barra) y centra a lo ancho de un celular. */
function Marco({ children, testId, extra }: { children: React.ReactNode; testId: string; extra?: Record<string, string> }) {
  return (
    <main data-testid={testId} {...extra} className="min-h-screen bg-neutro-crema px-4 pb-16 pt-32 sm:pt-36">
      <div className="mx-auto w-full max-w-xl space-y-4">{children}</div>
    </main>
  )
}

export default function PortalReservaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: tokenRuta } = use(params)
  const token = decodificarToken(tokenRuta)
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' })
  const [intento, setIntento] = useState(0)
  const pedidoRef = useRef(0)

  useEffect(() => {
    const pedido = ++pedidoRef.current
    setEstado({ fase: 'cargando' })
    ;(async () => {
      let res: Response
      try {
        res = await fetch(`${API_URL}/api/portal/${encodeURIComponent(token)}`, { cache: 'no-store' })
      } catch {
        if (pedido === pedidoRef.current) setEstado({ fase: 'error', detalle: TEXTO_ERROR })
        return
      }
      let cuerpo: unknown = null
      try {
        cuerpo = await res.json()
      } catch {
        cuerpo = null
      }
      if (pedido !== pedidoRef.current) return
      if (res.ok) {
        const datos = normalizar(cuerpo)
        setEstado(datos ? { fase: 'listo', datos } : { fase: 'error', detalle: TEXTO_ERROR })
        return
      }
      const detalle = detalleDe(cuerpo)
      if (res.status === PORTAL_HTTP.invalido || res.status === 400 || res.status === 422) {
        setEstado({ fase: 'invalido', detalle: detalle ?? TEXTO_INVALIDO })
      } else if (res.status === PORTAL_HTTP.vencido) {
        setEstado({ fase: 'vencido', detalle: detalle ?? TEXTO_VENCIDO })
      } else if (res.status === PORTAL_HTTP.demasiados) {
        setEstado({ fase: 'error', detalle: detalle ?? TEXTO_DEMASIADOS })
      } else {
        // 503 (sin secreto) trae su texto; un 5xx genérico no muestra detalles internos.
        setEstado({ fase: 'error', detalle: res.status === PORTAL_HTTP.sinServicio && detalle ? detalle : TEXTO_ERROR })
      }
    })()
  }, [token, intento])

  if (estado.fase === 'cargando') {
    return (
      <Marco testId="portal-cargando" extra={{ 'aria-busy': 'true' }}>
        <h1 className="mb-0 font-heading text-3xl text-verde">Tu reserva</h1>
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-white p-6 text-base text-verde-tipografia shadow-sm">
          <LoaderCircle className="h-6 w-6 shrink-0 animate-spin text-terracota" aria-hidden="true" />
          Cargando tu reserva…
        </div>
      </Marco>
    )
  }

  if (estado.fase !== 'listo') {
    const titulo =
      estado.fase === 'invalido'
        ? 'No encontramos tu reserva'
        : estado.fase === 'vencido'
          ? 'Este link ya venció'
          : 'No pudimos cargar tu reserva'
    return (
      <Marco testId={`portal-${estado.fase}`}>
        <h1 className="mb-0 font-heading text-3xl text-verde">{titulo}</h1>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p data-testid="portal-detalle" className="mb-0 flex items-start gap-3 text-base text-verde-tipografia">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-terracota" aria-hidden="true" />
            <span>{estado.detalle}</span>
          </p>
          {estado.fase === 'error' && (
            <button
              type="button"
              data-testid="portal-reintentar"
              onClick={() => setIntento((n) => n + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-terracota px-5 py-2 font-semibold text-white hover:bg-terracota-oscuro"
            >
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
              Intentar de nuevo
            </button>
          )}
        </div>
        <ContactoPie folio={null} />
      </Marco>
    )
  }

  const d = estado.datos
  const conSolicitud = d.puede_solicitar
  return (
    <Marco testId="portal" extra={{ 'data-tipo': d.tipo, 'data-estado': d.estado }}>
      <header className="space-y-2">
        <h1 className="mb-0 font-heading text-3xl leading-tight text-verde sm:text-4xl">{tituloPortal(d.tipo)}</h1>
        {d.nombre && (
          <p data-testid="portal-saludo" className="mb-0 text-lg text-verde-tipografia">
            Hola, {d.nombre}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="mb-0 min-w-0 text-base text-verde-tipografia">
            Folio{' '}
            <strong data-testid="portal-folio" className="break-all font-semibold tabular-nums text-verde">
              {d.folio}
            </strong>
          </p>
          {d.estado_texto && (
            <span
              data-testid="portal-estado"
              data-estado={d.estado}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                d.estado === 'cancelada' || d.estado === 'cancelado' || d.estado === 'reembolsado'
                  ? 'bg-rojo-bg text-rojo'
                  : d.estado === 'tentativo'
                    ? 'bg-amarillo-bg text-verde-tipografia'
                    : 'bg-verde/10 text-verde'
              }`}
            >
              {d.estado_texto}
            </span>
          )}
        </div>
      </header>

      {d.experiencias.map((exp, i) => (
        <TarjetaExperiencia key={`${exp.fecha}-${exp.hora_inicio ?? ''}-${i}`} exp={exp} indice={i} />
      ))}

      {d.qr && <QrReserva url={d.qr.url} folio={d.folio} />}

      {d.pago && <PagoReserva pago={d.pago} />}

      {(conSolicitud || d.politica) && (
        <section
          data-testid="portal-solicitud"
          aria-labelledby="portal-solicitud-titulo"
          className="rounded-2xl border border-neutro-borde bg-white p-4 shadow-sm sm:p-6"
        >
          <h2 id="portal-solicitud-titulo" className="mb-2 font-heading text-xl text-verde">
            {conSolicitud ? 'Pedir cambio o cancelación' : 'Cambios y cancelaciones'}
          </h2>
          {d.politica && (
            <p data-testid="portal-politica" className="mb-4 rounded-xl bg-neutro-light p-3 text-base text-verde-tipografia">
              {d.politica}
            </p>
          )}
          {conSolicitud && <SolicitudForm token={token} folio={d.folio} />}
        </section>
      )}

      <ContactoPie folio={d.folio} />
    </Marco>
  )
}
