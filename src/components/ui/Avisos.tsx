'use client'

// K1 (R8, sesión 48, 2-oct-2026): avisos y diálogo de confirmación PROPIOS, en lugar de alert() y confirm() del navegador.
// Dueño: el líder. Se monta UNA vez para todo el sitio (panel y web) en src/app/client-layout.tsx (<AvisosHost />).
//
// API imperativa (sirve en componentes, en funciones fuera de componentes y en callbacks):
//   aviso.exito('Guardado')                 → role="status", se va solo a los 5 s
//   aviso.error('No se pudo guardar: …')    → role="alert",  se va solo a los 8 s
//   aviso.info(texto, { persistente: true }) → se queda hasta que la persona lo cierra (avisos del backend que no se
//                                              deben perder, p. ej. «vence a mano el link…»)
//   if (!(await confirmar({ mensaje, titulo, textoAceptar, peligro }))) return
//   avisarTrasNavegar(texto)                 → el aviso sale en la página siguiente (antes de un window.location)
//
// Reglas (contrato R8 §0):
//   - `confirmar` devuelve una PROMESA: el manejador que la usa es async. Un candado contra doble clic (p. ej.
//     `reembolsoEnCursoRef`) se pone ANTES del await y se suelta si la persona cancela.
//   - Los textos conservan los saltos de línea (\n) y no llevan emojis (✅ ❌ 🎉).
//   - Si no hay <AvisosHost /> montado, `confirmar` responde false (la acción NO se hace) y deja un error en consola.
//
// Para qa (data-testid): contenedor `avisos`; cada aviso `aviso` con data-tipo="exito|error|info" y su botón
// `aviso-cerrar`; diálogo `confirmar-dialogo` (role="alertdialog") con `confirmar-titulo`, `confirmar-mensaje`,
// `confirmar-aceptar` y `confirmar-cancelar`. Escape y clic fuera = Cancelar.

import { useEffect, useRef, useState } from 'react'

export type TipoAviso = 'exito' | 'error' | 'info'

export interface OpcionesAviso {
  titulo?: string
  /** true = no se va solo; la persona lo cierra. */
  persistente?: boolean
  duracionMs?: number
}

export interface OpcionesConfirmar {
  mensaje: string
  /** Por omisión «¿Confirmas?». */
  titulo?: string
  /** Por omisión «Aceptar». Mejor un verbo: «Cancelar reserva», «Eliminar», «Reembolsar». */
  textoAceptar?: string
  /** Por omisión «Cancelar» (o «Volver» si textoAceptar ya dice «Cancelar…»). */
  textoCancelar?: string
  /** true = acción destructiva o con dinero: botón terracota y el foco empieza en Cancelar. */
  peligro?: boolean
}

interface AvisoVivo {
  id: number
  tipo: TipoAviso
  mensaje: string
  titulo?: string
  persistente: boolean
  duracionMs: number
}

interface Confirmacion {
  id: number
  mensaje: string
  titulo: string
  textoAceptar: string
  textoCancelar: string
  peligro: boolean
  resolver: (ok: boolean) => void
}

const MAX_AVISOS = 4
const CLAVE_PENDIENTE = 'at-aviso-pendiente'

let siguienteId = 1
let avisos: AvisoVivo[] = []
let cola: Confirmacion[] = []
let hostsMontados = 0
const oyentes = new Set<() => void>()

function emitir() {
  oyentes.forEach((f) => f())
}

export function avisar(mensaje: string, tipo: TipoAviso = 'info', opciones: OpcionesAviso = {}): void {
  if (typeof window === 'undefined') return
  const texto = String(mensaje ?? '').trim()
  if (!texto) return
  if (hostsMontados === 0) {
    console.error('[avisos] No hay <AvisosHost /> montado; este aviso no se ve:', texto)
  }
  const nuevo: AvisoVivo = {
    id: siguienteId++,
    tipo,
    mensaje: texto,
    titulo: opciones.titulo,
    persistente: !!opciones.persistente,
    duracionMs: opciones.duracionMs ?? (tipo === 'error' ? 8000 : 5000),
  }
  avisos = [...avisos, nuevo].slice(-MAX_AVISOS)
  emitir()
}

export const aviso = {
  exito: (mensaje: string, opciones?: OpcionesAviso) => avisar(mensaje, 'exito', opciones),
  error: (mensaje: string, opciones?: OpcionesAviso) => avisar(mensaje, 'error', opciones),
  info: (mensaje: string, opciones?: OpcionesAviso) => avisar(mensaje, 'info', opciones),
}

export function cerrarAviso(id: number): void {
  avisos = avisos.filter((a) => a.id !== id)
  emitir()
}

export function confirmar(opciones: OpcionesConfirmar | string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  const o: OpcionesConfirmar = typeof opciones === 'string' ? { mensaje: opciones } : opciones
  if (hostsMontados === 0) {
    console.error('[avisos] No hay <AvisosHost /> montado; la confirmación se toma como «Cancelar».')
    return Promise.resolve(false)
  }
  const textoAceptar = o.textoAceptar?.trim() || 'Aceptar'
  const textoCancelar = o.textoCancelar?.trim() || (/^cancelar\b/i.test(textoAceptar) ? 'Volver' : 'Cancelar')
  return new Promise<boolean>((resolver) => {
    cola = [
      ...cola,
      {
        id: siguienteId++,
        mensaje: String(o.mensaje ?? '').trim(),
        titulo: o.titulo?.trim() || '¿Confirmas?',
        textoAceptar,
        textoCancelar,
        peligro: !!o.peligro,
        resolver,
      },
    ]
    emitir()
  })
}

/** Guarda un aviso para mostrarlo en la página siguiente (úsalo justo antes de `window.location.href = …`). */
export function avisarTrasNavegar(mensaje: string, tipo: TipoAviso = 'info'): void {
  try {
    sessionStorage.setItem(CLAVE_PENDIENTE, JSON.stringify({ mensaje, tipo }))
  } catch {
    /* sin sessionStorage: el aviso se pierde, la navegación sigue */
  }
}

function responder(id: number, ok: boolean) {
  const actual = cola[0]
  if (!actual || actual.id !== id) return
  cola = cola.slice(1)
  emitir()
  actual.resolver(ok)
}

/** Atajo para componentes; las funciones también se pueden importar directo. */
export function useAvisos() {
  return { aviso, avisar, confirmar, avisarTrasNavegar }
}

const ESTILO: Record<TipoAviso, { borde: string; titulo: string }> = {
  exito: { borde: 'border-l-verde', titulo: 'text-verde' },
  error: { borde: 'border-l-rojo', titulo: 'text-rojo' },
  info: { borde: 'border-l-azul', titulo: 'text-verde-tipografia' },
}

function TarjetaAviso({ a }: { a: AvisoVivo }) {
  useEffect(() => {
    if (a.persistente) return
    const t = window.setTimeout(() => cerrarAviso(a.id), a.duracionMs)
    return () => window.clearTimeout(t)
  }, [a.id, a.persistente, a.duracionMs])

  const estilo = ESTILO[a.tipo]
  return (
    <div
      role={a.tipo === 'error' ? 'alert' : 'status'}
      data-testid="aviso"
      data-tipo={a.tipo}
      className={`pointer-events-auto w-full max-w-sm rounded-lg border border-neutro-borde border-l-4 ${estilo.borde} bg-white px-4 py-3 shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {a.titulo && <p className={`text-sm font-semibold ${estilo.titulo}`}>{a.titulo}</p>}
          <p className="whitespace-pre-line break-words text-sm text-verde-tipografia">{a.mensaje}</p>
        </div>
        <button
          type="button"
          data-testid="aviso-cerrar"
          aria-label="Cerrar aviso"
          onClick={() => cerrarAviso(a.id)}
          className="-mr-1 shrink-0 rounded p-1 text-verde-suave hover:bg-neutro-light hover:text-verde"
        >
          <span aria-hidden="true" className="block text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  )
}

function DialogoConfirmar({ c }: { c: Confirmacion }) {
  const aceptarRef = useRef<HTMLButtonElement>(null)
  const cancelarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    ;(c.peligro ? cancelarRef : aceptarRef).current?.focus()
    return () => {
      if (previo && typeof previo.focus === 'function' && document.contains(previo)) previo.focus()
    }
  }, [c.id, c.peligro])

  function alTeclear(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      responder(c.id, false)
      return
    }
    if (e.key === 'Tab') {
      // El foco no sale del diálogo: solo hay dos botones.
      e.preventDefault()
      const enAceptar = document.activeElement === aceptarRef.current
      ;(enAceptar ? cancelarRef : aceptarRef).current?.focus()
    }
  }

  const idTitulo = `confirmar-titulo-${c.id}`
  const idMensaje = `confirmar-mensaje-${c.id}`
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center bg-black/50 px-4 pt-24 sm:pt-32"
      onMouseDown={(e) => {
        // C4 (R8): el 2.º mousedown de un doble clic (detail 2) cae en el fondo recién abierto; no cuenta como «clic
        // fuera» (si no, un doble clic en «Reembolsar» abría y cerraba el diálogo sin hacer nada).
        if (e.target === e.currentTarget && e.detail <= 1) responder(c.id, false)
      }}
      onKeyDown={alTeclear}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={idMensaje}
        data-testid="confirmar-dialogo"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
      >
        <h2 id={idTitulo} data-testid="confirmar-titulo" className="font-display text-xl text-verde">
          {c.titulo}
        </h2>
        <p
          id={idMensaje}
          data-testid="confirmar-mensaje"
          className="mt-2 max-h-[50vh] overflow-y-auto whitespace-pre-line break-words text-sm text-verde-tipografia"
        >
          {c.mensaje}
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelarRef}
            type="button"
            data-testid="confirmar-cancelar"
            onClick={() => responder(c.id, false)}
            className="rounded-lg border border-neutro-borde px-4 py-2 text-sm text-verde hover:bg-neutro-light"
          >
            {c.textoCancelar}
          </button>
          <button
            ref={aceptarRef}
            type="button"
            data-testid="confirmar-aceptar"
            onClick={() => responder(c.id, true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              c.peligro ? 'bg-terracota hover:bg-terracota-oscuro' : 'bg-verde hover:bg-verde-claro'
            }`}
          >
            {c.textoAceptar}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Se monta UNA sola vez (src/app/client-layout.tsx). */
export default function AvisosHost() {
  const [, setVersion] = useState(0)

  useEffect(() => {
    hostsMontados += 1
    const oyente = () => setVersion((v) => v + 1)
    oyentes.add(oyente)
    try {
      const crudo = sessionStorage.getItem(CLAVE_PENDIENTE)
      if (crudo) {
        sessionStorage.removeItem(CLAVE_PENDIENTE)
        const p = JSON.parse(crudo) as { mensaje?: string; tipo?: TipoAviso }
        if (p?.mensaje) avisar(p.mensaje, p.tipo ?? 'info')
      }
    } catch {
      /* nada pendiente */
    }
    oyente()
    return () => {
      hostsMontados -= 1
      oyentes.delete(oyente)
    }
  }, [])

  const actual = cola[0]
  return (
    <>
      <div
        data-testid="avisos"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[9500] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {avisos.map((a) => (
          <TarjetaAviso key={a.id} a={a} />
        ))}
      </div>
      {actual && <DialogoConfirmar key={actual.id} c={actual} />}
    </>
  )
}
