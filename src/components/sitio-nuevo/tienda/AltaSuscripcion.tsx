'use client'

// R15 · F2 (WF3, sesión 55): el alta de suscripción en 5 pasos de la maqueta (`.sub-modal`): 1 tamaño · 2 frecuencia ·
// 3 datos · 4 resumen y pago · 5 salida. Va montada sobre el MISMO flujo de hoy (SubscriptionCheckoutForm + /suscripciones):
// - mismos campos y mismas validaciones (`handleSubmit`, SubscriptionCheckoutForm.tsx:223-258), mismos datos precargados
//   del perfil (`GET ${API_URL}/api/auth/me`, :138) y la misma zona (`PostalCodeSelector` y `GET /api/zonas-entrega/{cp}`, :95),
// - la misma fecha real de la primera canasta (`GET /api/subscriptions/primera-entrega`, :114),
// - el mismo `POST /api/subscriptions/crear` y la misma salida a MercadoPago (crearSuscripcion.ts).
// Pago: solo tarjeta o saldo de MercadoPago (DR7-b, TEXTO_PAGO_TIENDA): la «Transferencia SPEI» de la maqueta no existe.
// El «contenedor retornable» de la maqueta no se ofrece como interruptor: en la API es otro plan (`retornable`) y el alta de
// hoy crea una sola suscripción; va la marca. Capa z-[950]; encabezado y pie `shrink-0`, el cuerpo es el que se desplaza.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import type { PrimeraEntregaRespuesta } from '@/types/cuenta'
import { TEXTO_METODO_PAGO_CORTO, TEXTO_PAGO_TIENDA } from '@/types/tienda'
import Falta from '../Falta'
import { precioVisible } from '../formato'
import { crearSuscripcion, salirDelAlta, type DatosAlta, type ResultadoAlta } from './crearSuscripcion'
import { FRECUENCIAS, esZonaTienda, HORARIO_ENTREGA, type IdFrecuencia, type PlanCanasta, type ZonaTienda } from './tipos'

type EstadoPrimeraEntrega = { fase: 'cargando' } | { fase: 'listo'; fecha: string } | { fase: 'error' }
type Paso = 1 | 2 | 3 | 4 | 5

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/
const LARGO: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }
const DIAS_PREFERIDOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const
const VOLVER_AQUI = `/auth/signin?callbackUrl=${encodeURIComponent('/tienda?pestana=canasta')}`

const CAMPO =
  'w-full rounded-sn-boton border border-sn-borde bg-white px-3 py-2.5 text-sm text-sn-tinta outline-none focus:border-sn-terra focus:ring-2 focus:ring-sn-terra/20 disabled:bg-sn-crema/50'
const ETIQUETA = 'mb-1 block text-sm font-medium text-sn-tinta'
const BOTON =
  'rounded-sn-boton bg-sn-terra px-5 py-3 font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-calido transition-colors hover:bg-sn-tinta disabled:opacity-60'
const BOTON_FINAL =
  'rounded-sn-boton bg-sn-bosque px-5 py-3 font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-calido transition-colors hover:bg-sn-tinta disabled:opacity-60'

const VACIO: DatosAlta = {
  nombre: '',
  email: '',
  telefono: '',
  codigo_pais: '+52',
  direccion: '',
  alcaldia: '',
  codigo_postal: '',
  referencias: '',
  dia_preferido: '',
  alergias: '',
}

type Props = {
  planes: PlanCanasta[]
  planInicial: string | null
  /** La zona que la persona ya validó en «¿Llegamos a tu colonia?» (si su perfil no trae otra). */
  zonaInicial: ZonaTienda | null
  onCerrar: () => void
}

async function zonaDeCp(cp: string): Promise<ZonaTienda | null> {
  if (!cp || cp.length !== 5) return null
  try {
    const r = await fetch(`${API_URL}/api/zonas-entrega/${cp}`)
    if (!r.ok) return null
    const zona: unknown = await r.json()
    return esZonaTienda(zona) ? zona : null
  } catch {
    return null
  }
}

export default function AltaSuscripcion({ planes, planInicial, zonaInicial, onCerrar }: Props) {
  const { data: session, status } = useSession()
  const [paso, setPaso] = useState<Paso>(1)
  const [planId, setPlanId] = useState<string | null>(planInicial)
  const [frecuencia, setFrecuencia] = useState<IdFrecuencia>('weekly')
  const [datos, setDatos] = useState<DatosAlta>(() =>
    zonaInicial ? { ...VACIO, codigo_postal: zonaInicial.codigo_postal, alcaldia: zonaInicial.municipio } : VACIO,
  )
  const [zona, setZona] = useState<ZonaTienda | null>(zonaInicial)
  const [perfil, setPerfil] = useState<'cargando' | 'listo'>('cargando')
  const [primeraEntrega, setPrimeraEntrega] = useState<EstadoPrimeraEntrega>({ fase: 'cargando' })
  const [error, setError] = useState<{ texto: string; entrar: boolean } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [salida, setSalida] = useState<Exclude<ResultadoAlta, { tipo: 'error' }> | null>(null)
  const candadoRef = useRef(false)
  const pedidoPrimeraRef = useRef(0)
  const dialogoRef = useRef<HTMLDivElement>(null)
  const cuerpoRef = useRef<HTMLDivElement>(null)

  const plan = planes.find((p) => p.id === planId) ?? null
  const nombreFrecuencia = FRECUENCIAS.find((f) => f.id === frecuencia)?.nombre ?? ''
  const conSesion = !!session?.user?.email
  const set = <K extends keyof DatosAlta>(campo: K, valor: DatosAlta[K]) => setDatos((d) => ({ ...d, [campo]: valor }))

  // Datos del perfil, como hoy (SubscriptionCheckoutForm.tsx:133-218). Mientras se cargan, el paso 3 espera (no pisa lo
  // que la persona teclee).
  const perfilPedidoRef = useRef(false)
  const montadoRef = useRef(true)
  useEffect(() => {
    // Una sola vez: next-auth relee la sesión al volver a la pestaña y no debe pisar lo que ya se tecleó.
    if (status === 'loading' || perfilPedidoRef.current) return
    perfilPedidoRef.current = true
    const cargar = async () => {
      if (!session?.user?.email) {
        setPerfil('listo')
        return
      }
      const deSesion = { nombre: session.user.name || '', email: session.user.email || '' }
      try {
        const r = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        })
        if (!montadoRef.current) return
        if (!r.ok) {
          setDatos((d) => ({ ...d, ...deSesion }))
          return
        }
        const u = await r.json()
        if (!montadoRef.current) return
        const dir = u.direccion_estructurada
        const cpTexto = typeof u.direccion_principal === 'string' ? u.direccion_principal.match(/\b(\d{5})\b/) : null
        const cp: string = dir?.codigo_postal || (cpTexto ? cpTexto[1] : '')
        setDatos((d) => ({
          ...d,
          nombre: u.nombre || session.user?.name || '',
          email: u.email || session.user?.email || '',
          telefono: u.telefono || '',
          codigo_pais: u.codigo_pais || '+52',
          ...(u.direccion_principal || dir
            ? {
                direccion: dir
                  ? `${dir.calle} ${dir.numero_exterior}${dir.numero_interior ? ` ${dir.numero_interior}` : ''}, ${dir.colonia}`
                  : u.direccion_principal || '',
                codigo_postal: cp,
                alcaldia: dir?.alcaldia || '',
                referencias: dir?.referencias || '',
                dia_preferido: dir?.dia_preferido_entrega || '',
                alergias: dir?.alergias_restricciones || '',
              }
            : {}),
        }))
        if (u.direccion_principal || dir) {
          const z = cp ? await zonaDeCp(cp) : null
          if (montadoRef.current) setZona(z)
        }
      } catch {
        if (montadoRef.current) setDatos((d) => ({ ...d, ...deSesion }))
      } finally {
        if (montadoRef.current) setPerfil('listo')
      }
    }
    void cargar()
  }, [session, status])

  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
    }
  }, [])

  // La fecha real de la primera canasta; se relee al cambiar el día preferido (una respuesta vieja no pisa a la nueva).
  const cargarPrimeraEntrega = useCallback(async (dia: string) => {
    const pedido = ++pedidoPrimeraRef.current
    setPrimeraEntrega({ fase: 'cargando' })
    try {
      const res = await fetch(`${API_URL}/api/subscriptions/primera-entrega?dia_preferido=${encodeURIComponent(dia)}`, {
        cache: 'no-store',
      })
      const d: unknown = res.ok ? await res.json().catch(() => null) : null
      if (pedido !== pedidoPrimeraRef.current) return
      const fecha = (d as Partial<PrimeraEntregaRespuesta> | null)?.fecha
      setPrimeraEntrega(typeof fecha === 'string' && FECHA_ISO.test(fecha) ? { fase: 'listo', fecha } : { fase: 'error' })
    } catch {
      if (pedido === pedidoPrimeraRef.current) setPrimeraEntrega({ fase: 'error' })
    }
  }, [])

  useEffect(() => {
    void cargarPrimeraEntrega(datos.dia_preferido)
  }, [datos.dia_preferido, cargarPrimeraEntrega])

  // Capa: sin desplazar la página de atrás, Esc cierra (salvo mientras se envía o ya se está saliendo).
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogoRef.current?.focus()
    return () => {
      document.body.style.overflow = previo
    }
  }, [])

  const cerrable = !enviando && paso !== 5
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cerrable) onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [cerrable, onCerrar])

  useEffect(() => {
    cuerpoRef.current?.scrollTo({ top: 0 })
  }, [paso])

  // Paso 5: se pinta la salida y se va a MercadoPago (o a la confirmación) como hoy.
  useEffect(() => {
    if (salida) salirDelAlta(salida)
  }, [salida])

  const mostrarError = (texto: string, campo?: string) => {
    setError({ texto, entrar: false })
    if (campo) document.getElementById(campo)?.focus()
  }

  const avanzar = () => {
    setError(null)
    if (paso === 1) {
      if (!plan) return mostrarError('Selecciona una canasta para continuar')
      setPaso(2)
    } else if (paso === 2) {
      setPaso(3)
    } else if (paso === 3) {
      // Las mismas validaciones que hoy (SubscriptionCheckoutForm.tsx:228-237), con el motivo a la vista.
      if (!datos.nombre || !datos.email || !datos.telefono) {
        const campo = !datos.nombre ? 'sn-alta-nombre' : !datos.telefono ? 'sn-alta-telefono' : 'sn-alta-correo'
        return mostrarError('Por favor completa todos los campos de información personal', campo)
      }
      if (!datos.direccion || !zona) {
        return mostrarError(
          'Por favor selecciona una dirección con código postal válido',
          !datos.direccion ? 'sn-alta-direccion' : undefined,
        )
      }
      setPaso(4)
    }
  }

  const regresar = () => {
    setError(null)
    if (paso > 1 && paso < 5) setPaso((paso - 1) as Paso)
  }

  const confirmar = async () => {
    if (candadoRef.current || !plan || !zona) return
    candadoRef.current = true
    setEnviando(true)
    setError(null)
    const r = await crearSuscripcion(plan.id, plan.nombre, frecuencia, datos, zona.municipio || null)
    if (r.tipo === 'error') {
      setError({ texto: r.mensaje, entrar: r.status === 401 })
      setEnviando(false)
      candadoRef.current = false
      return
    }
    setPaso(5)
    setSalida(r)
  }

  const avisoEntrar = conSesion ? null : (
      <p data-testid="sn-tienda-alta-entrar" className="rounded-sn-boton bg-sn-crema/70 px-4 py-3 text-sm leading-[1.55]">
        Para confirmar tu suscripción necesitas entrar con tu cuenta.{' '}
        <Link href={VOLVER_AQUI} className="font-medium text-sn-terra underline">
          Entrar o crear cuenta
        </Link>
      </p>
  )

  return (
    <div
      data-testid="sn-tienda-alta"
      className="fixed inset-0 z-[950] flex items-center justify-center bg-[rgba(61,42,26,0.45)] p-3 min-[640px]:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && cerrable) onCerrar()
      }}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sn-alta-titulo"
        tabIndex={-1}
        data-testid={`sn-tienda-alta-paso-${paso}`}
        data-paso={paso}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[580px] flex-col overflow-hidden rounded-sn-tarjeta bg-sn-calido font-sn-texto text-sn-tinta shadow-sn-anuncio outline-none min-[640px]:max-h-[calc(100dvh-3rem)]"
      >
        {/* Encabezado: avance y cerrar */}
        <div className="shrink-0 px-5 pt-5 min-[640px]:px-10 min-[640px]:pt-8">
          <div className="flex items-center gap-3">
            <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={`h-[3px] rounded-full ${n <= paso ? 'bg-sn-terra' : 'bg-sn-borde'}`} />
              ))}
            </div>
            {cerrable && (
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                data-testid="sn-tienda-alta-cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-sn-tinta/70 hover:bg-sn-tinta/10"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          {paso < 5 && (
            <p className="mt-5 font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra">Paso {paso} de 4</p>
          )}
          <h2 id="sn-alta-titulo" className="mt-1 font-sn-titulos text-[28px] leading-[1.1] tracking-[-0.5px] min-[640px]:text-[32px]">
            {paso === 1 && 'Elige el tamaño de tu canasta'}
            {paso === 2 && '¿Cada cuánto la quieres?'}
            {paso === 3 && 'Tus datos de entrega'}
            {paso === 4 && 'Confirma tu suscripción'}
            {paso === 5 && 'Ya casi: falta autorizar el pago'}
          </h2>
        </div>

        {/* Cuerpo: lo único que se desplaza */}
        <div ref={cuerpoRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4 min-[640px]:px-10">
          {paso === 1 && (
            <fieldset>
              <legend className="mb-4 text-sm leading-[1.55] text-sn-tinta/80">
                Precio de la canasta por entrega. Llega a tu puerta {HORARIO_ENTREGA}.
              </legend>
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                {planes.map((p) => {
                  const elegido = p.id === planId
                  return (
                    <label
                      key={p.id}
                      data-testid="sn-tienda-alta-plan"
                      data-plan={p.id}
                      className={`cursor-pointer rounded-sn-tarjeta border-2 bg-white p-4 transition-colors ${
                        elegido ? 'border-sn-terra' : 'border-sn-borde hover:border-sn-arena'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sn-alta-plan"
                        value={p.id}
                        checked={elegido}
                        onChange={() => {
                          setPlanId(p.id)
                          setError(null)
                        }}
                        className="sr-only"
                      />
                      <span className="block font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra">
                        {p.nombre}
                      </span>
                      <span className="mt-3 block font-sn-titulos text-[28px] leading-none">{precioVisible(p.precio)}</span>
                      <span className="mt-1 block text-xs text-sn-tinta/70">por entrega</span>
                    </label>
                  )
                })}
              </div>
              <div className="mt-4">
                <Falta que="personas y kilos de cada canasta (el sitio de hoy y la maqueta no coinciden)" quien="Lucio y Pablo" />
              </div>
            </fieldset>
          )}

          {paso === 2 && (
            <fieldset>
              <legend className="mb-4 text-sm leading-[1.55] text-sn-tinta/80">
                {plan?.nombre}: {plan ? precioVisible(plan.precio) : ''} por entrega.
              </legend>
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                {FRECUENCIAS.map((f) => {
                  const elegida = f.id === frecuencia
                  return (
                    <label
                      key={f.id}
                      data-testid="sn-tienda-alta-frecuencia"
                      data-frecuencia={f.id}
                      className={`cursor-pointer rounded-sn-tarjeta border-2 bg-white p-4 transition-colors ${
                        elegida ? 'border-sn-terra' : 'border-sn-borde hover:border-sn-arena'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sn-alta-frecuencia"
                        value={f.id}
                        checked={elegida}
                        onChange={() => setFrecuencia(f.id)}
                        className="sr-only"
                      />
                      <span className="block font-sn-titulos text-2xl leading-none">{f.nombre}</span>
                      <span className="mt-2 block text-sm text-sn-tinta/70">{f.descripcion}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}

          {paso === 3 &&
            (perfil === 'cargando' ? (
              <p role="status" className="py-10 text-center text-sm text-sn-tinta/80">
                Cargando tus datos…
              </p>
            ) : (
              <div className="space-y-4">
                {avisoEntrar}
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                  <div>
                    <label htmlFor="sn-alta-nombre" className={ETIQUETA}>
                      Nombre completo *
                    </label>
                    <input
                      id="sn-alta-nombre"
                      data-testid="sn-tienda-alta-nombre"
                      autoComplete="name"
                      value={datos.nombre}
                      onChange={(e) => set('nombre', e.target.value)}
                      placeholder="Tu nombre completo"
                      className={CAMPO}
                    />
                  </div>
                  <div>
                    <label htmlFor="sn-alta-correo" className={ETIQUETA}>
                      Correo electrónico *
                    </label>
                    <input
                      id="sn-alta-correo"
                      data-testid="sn-tienda-alta-correo"
                      type="email"
                      autoComplete="email"
                      value={datos.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="tu@correo.com"
                      disabled={conSesion}
                      className={CAMPO}
                    />
                    {conSesion && <p className="mt-1 text-xs text-sn-tinta/70">Correo de tu cuenta iniciada</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="sn-alta-telefono" className={ETIQUETA}>
                    Teléfono *
                  </label>
                  <div className="flex gap-2">
                    <div className="w-28 shrink-0">
                      <CountryCodeSelector value={datos.codigo_pais} onChange={(c) => set('codigo_pais', c)} />
                    </div>
                    <input
                      id="sn-alta-telefono"
                      data-testid="sn-tienda-alta-telefono"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={datos.telefono}
                      onChange={(e) => set('telefono', e.target.value.replace(/\D/g, ''))}
                      placeholder="10 dígitos"
                      className={`${CAMPO} min-w-0 flex-1`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="sn-alta-direccion" className={ETIQUETA}>
                    Dirección completa *
                  </label>
                  <input
                    id="sn-alta-direccion"
                    data-testid="sn-tienda-alta-direccion"
                    autoComplete="street-address"
                    value={datos.direccion}
                    onChange={(e) => set('direccion', e.target.value)}
                    placeholder="Calle, número, colonia"
                    className={CAMPO}
                  />
                </div>
                <div data-testid="sn-tienda-alta-zona" data-zona={zona ? zona.codigo_postal : ''}>
                  <p className={ETIQUETA}>Código postal de entrega *</p>
                  <PostalCodeSelector
                    value={datos.codigo_postal}
                    onChange={(cp, z) => {
                      setDatos((d) => ({ ...d, codigo_postal: cp, alcaldia: z?.municipio || '' }))
                      setZona(z && esZonaTienda(z) ? z : null)
                    }}
                  />
                  {zona && (
                    <p data-testid="sn-tienda-alta-zona-elegida" className="mt-2 text-sm text-sn-bosque">
                      Entregamos en {zona.codigo_postal} · {zona.colonia}, {zona.municipio}.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="sn-alta-referencias" className={ETIQUETA}>
                    Referencias de entrega
                  </label>
                  <textarea
                    id="sn-alta-referencias"
                    data-testid="sn-tienda-alta-referencias"
                    rows={2}
                    value={datos.referencias}
                    onChange={(e) => set('referencias', e.target.value)}
                    placeholder="Ej: casa azul, portón negro, entre calles…"
                    className={`${CAMPO} resize-none`}
                  />
                </div>
                <div>
                  <label htmlFor="sn-alta-dia" className={ETIQUETA}>
                    Día preferido de entrega
                  </label>
                  <select
                    id="sn-alta-dia"
                    data-testid="sn-tienda-alta-dia"
                    value={datos.dia_preferido}
                    onChange={(e) => set('dia_preferido', e.target.value)}
                    className={CAMPO}
                  >
                    <option value="">Sin preferencia</option>
                    {DIAS_PREFERIDOS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-sn-tinta/70">Se respetará según disponibilidad de tu zona</p>
                </div>
                <PrimeraEntrega estado={primeraEntrega} reintentar={() => void cargarPrimeraEntrega(datos.dia_preferido)} />
                <div>
                  <label htmlFor="sn-alta-alergias" className={ETIQUETA}>
                    Alergias o restricciones alimentarias
                  </label>
                  <textarea
                    id="sn-alta-alergias"
                    data-testid="sn-tienda-alta-alergias"
                    rows={2}
                    value={datos.alergias}
                    onChange={(e) => set('alergias', e.target.value)}
                    placeholder="Ej: alergia a frutos secos, vegetariano…"
                    className={`${CAMPO} resize-none`}
                  />
                </div>
              </div>
            ))}

          {paso === 4 && plan && (
            <div className="space-y-4">
              <dl data-testid="sn-tienda-alta-resumen" className="rounded-sn-tarjeta border border-sn-borde bg-white p-5 text-sm">
                <Renglon nombre="Canasta" valor={plan.nombre} />
                <Renglon nombre="Frecuencia" valor={nombreFrecuencia} />
                <Renglon
                  nombre="Primera canasta"
                  valor={
                    primeraEntrega.fase === 'listo'
                      ? formatFechaMexico(primeraEntrega.fecha, LARGO)
                      : primeraEntrega.fase === 'cargando'
                        ? 'Calculando…'
                        : 'No se pudo calcular ahora'
                  }
                />
                <Renglon nombre="Entrega" valor={`${datos.direccion} · CP ${zona?.codigo_postal ?? ''} · ${HORARIO_ENTREGA}`} />
                <div className="flex items-start justify-between gap-4 py-2">
                  <dt className="text-sn-tinta/70">Envío</dt>
                  <dd className="text-right" data-testid="sn-tienda-alta-envio">
                    <Falta
                      que="cuánto se cobra de envío en la suscripción (hoy /suscripciones dice «Incluido» y la API suma el envío bajo $1,000)"
                      quien="David"
                    />
                  </dd>
                </div>
                <div className="mt-2 flex items-end justify-between gap-4 border-t border-sn-borde pt-4">
                  <dt className="font-medium">Canasta por entrega</dt>
                  <dd data-testid="sn-tienda-alta-total" className="font-sn-titulos text-[32px] leading-none text-sn-bosque">
                    {precioVisible(plan.precio)}
                  </dd>
                </div>
              </dl>

              <div data-testid="sn-tienda-alta-retornable" className="rounded-sn-tarjeta bg-sn-crema/70 p-4 text-sm">
                <p className="mb-2 font-medium">Contenedor retornable</p>
                <Falta
                  que="cómo se ofrece el contenedor retornable junto con la canasta (en la API es un plan aparte y el alta crea una sola suscripción)"
                  quien="David"
                />
              </div>

              <fieldset>
                <legend className="mb-2 font-sn-mono text-[11px] font-medium uppercase tracking-[1.4px] text-sn-terra">
                  Método de pago
                </legend>
                <label
                  data-testid="sn-tienda-alta-pago"
                  className="flex items-start gap-3 rounded-sn-tarjeta border-2 border-sn-terra bg-white p-4"
                >
                  <input type="radio" name="sn-alta-pago" value="mercado_pago" checked readOnly className="mt-1 accent-sn-terra" />
                  <span>
                    <span className="block font-medium">{TEXTO_METODO_PAGO_CORTO}</span>
                    <span className="block text-xs leading-[1.5] text-sn-tinta/70">{TEXTO_PAGO_TIENDA}</span>
                  </span>
                </label>
              </fieldset>

              <p className="rounded-sn-boton bg-sn-crema/50 px-4 py-3 text-xs leading-[1.6] text-sn-tinta/80">
                Al confirmar te llevamos a MercadoPago para autorizar el cobro {nombreFrecuencia.toLowerCase()} de tu canasta.
                Puedes cancelar en cualquier momento. Al suscribirte aceptas nuestros{' '}
                <Link href="/terminos" className="underline">
                  términos y condiciones
                </Link>
                .
              </p>
              {avisoEntrar}
            </div>
          )}

          {paso === 5 && salida && (
            <div data-testid="sn-tienda-alta-salida" data-salida={salida.tipo} role="status" className="space-y-4 py-4 text-sm leading-[1.6]">
              {salida.tipo === 'mercadopago' ? (
                <>
                  <p>
                    Registramos tu {plan?.nombre ?? 'canasta'} {nombreFrecuencia.toLowerCase()}. Te estamos llevando a MercadoPago
                    para que autorices el cobro; cuando lo autorices, programamos tu primera canasta.
                  </p>
                  <p>
                    Si no pasa nada en unos segundos,{' '}
                    <a href={salida.url} className="font-medium text-sn-terra underline">
                      ve a MercadoPago
                    </a>
                    .
                  </p>
                </>
              ) : (
                <p>Tu suscripción no tiene costo y ya quedó activa. Te llevamos a la confirmación…</p>
              )}
            </div>
          )}

          {error && (
            <div role="alert" data-testid="sn-tienda-alta-error" className="mt-4 rounded-sn-boton border border-sn-terra/40 bg-white px-4 py-3 text-sm text-sn-terra">
              {error.texto}
              {error.entrar && (
                <>
                  {' '}
                  <Link href={VOLVER_AQUI} className="font-medium underline">
                    Entrar o crear cuenta
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pie: atrás y continuar */}
        {paso < 5 && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-sn-borde px-5 py-4 min-[640px]:px-10">
            {paso > 1 ? (
              <button
                type="button"
                onClick={regresar}
                disabled={enviando}
                data-testid="sn-tienda-alta-atras"
                className="font-sn-mono text-xs font-medium uppercase tracking-[1.2px] text-sn-tinta/80 hover:text-sn-terra disabled:opacity-60"
              >
                ← Atrás
              </button>
            ) : (
              <span />
            )}
            {paso < 4 ? (
              <button type="button" onClick={avanzar} data-testid="sn-tienda-alta-continuar" className={BOTON}>
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void confirmar()}
                disabled={enviando}
                data-testid="sn-tienda-alta-confirmar"
                className={BOTON_FINAL}
              >
                {enviando ? 'Procesando…' : 'Confirmar y pagar →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Renglon({ nombre, valor }: { nombre: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="shrink-0 text-sn-tinta/70">{nombre}</dt>
      <dd className="min-w-0 text-right font-medium [overflow-wrap:anywhere]">{valor}</dd>
    </div>
  )
}

function PrimeraEntrega({ estado, reintentar }: { estado: EstadoPrimeraEntrega; reintentar: () => void }) {
  return (
    <div
      data-testid="sn-tienda-alta-primera-entrega"
      data-estado={estado.fase}
      data-fecha={estado.fase === 'listo' ? estado.fecha : undefined}
      aria-live="polite"
      className="rounded-sn-boton border border-sn-borde bg-white px-4 py-3 text-sm"
    >
      {estado.fase === 'cargando' && 'Calculando la fecha de tu primera canasta…'}
      {estado.fase === 'listo' && (
        <>
          Tu primera canasta llega el <span className="font-semibold">{formatFechaMexico(estado.fecha, LARGO)}</span>.
        </>
      )}
      {estado.fase === 'error' && (
        <>
          No pudimos calcular la fecha de tu primera canasta en este momento.{' '}
          <button type="button" onClick={reintentar} className="font-medium text-sn-terra underline">
            Intentar de nuevo
          </button>
        </>
      )}
    </div>
  )
}
