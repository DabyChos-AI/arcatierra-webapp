'use client'

// R15 v2 · F3 (tienda): el alta de suscripción (el modal `sub1`–`sub4` de la maqueta) sobre el `Dialogo` de ui/. Reemplaza en el sitio
// nuevo a /suscripciones de hoy (src/app/suscripciones/page.tsx + src/components/SubscriptionCheckoutForm.tsx), que sigue igual (D-F3-04).
// - UNA canasta por alta (hoy se podían marcar varias y solo se suscribía la primera: defecto §9.2) y el POST de hoy campo por campo a
//   `/api/subscriptions/crear` por su proxy (exige sesión y pisa el correo; f3/tienda-F3.md §6). Nada de rutas nuevas.
// - Total por entrega = precio + `calcularCostoEnvio(precio)` con su renglón de envío (DR-13; hoy dice «Envío: Incluido»: defecto §9.1),
//   todo con `precioLegible` (D-F3-24 T-20/T-27: nunca un monto distinto del que cobra MercadoPago).
// - «Solo esta vez» = la canasta U al carrito, como hoy (DR-15); «Cada 15 días» con la marca de C54; la Básica Familiar exige la carne.
// - La retornable solo como renglón con su marca y sin poderse elegir (DR-14, DR-19, C31). Sin pausa, sin saltar, sin cambiar tamaño.
// - Sin sesión pide entrar antes de los datos (MAPA-RUTAS A §6 nota a) con el texto del proxy de hoy (D-F3-24 T-5).
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import { API_URL } from '@/lib/api'
import { calcularCostoEnvio } from '@/lib/envio'
import { formatFechaMexico } from '@/lib/dates'
import { precioLegible } from '@/lib/precio'
import { TEXTO_AGOTADO, TEXTO_METODO_PAGO_CORTO } from '@/types/tienda'
import type { PrimeraEntregaRespuesta } from '@/types/cuenta'
import { HREF_INICIAR_SESION } from '@/components/sitio-nuevo/armazon/enlaces'
import Falta from '@/components/sitio-nuevo/Falta'
import Dialogo from '@/components/sitio-nuevo/ui/Dialogo'
import GrupoOpciones from '@/components/sitio-nuevo/ui/GrupoOpciones'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Texto from '@/components/sitio-nuevo/ui/Texto'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import { unirClases } from '@/components/sitio-nuevo/ui/clases'
import SelectorZona from './SelectorZona'
import { kilosDe, OPCIONES_CARNE, PERSONAS, PLAN_CON_CARNE, type PlanApi } from './canastas'
import { agregarProducto, textoAgregado } from './carritoTienda'
import { guardarSuscripcionPendiente } from './suscripcionPendiente'
import type { ProductoTienda } from './catalogo'
import type { ZonaEntrega } from './zonas'

/** Lo que la canasta lista sabe de cada plan: su base (nombre con kilos, descripción, foto) y su compra única. */
export interface InfoPlan {
  nombreBase: string | null
  descripcion: string
  /** La canasta U lista para el carrito; 'agotada' = existe y no está en venta; null = no se ofrece. */
  compraUnica: ProductoTienda | 'agotada' | null
}

type Paso = 'tamano' | 'frecuencia' | 'datos' | 'resumen'
const PASOS: Paso[] = ['tamano', 'frecuencia', 'datos', 'resumen']
type Frecuencia = 'solo' | 'weekly' | 'biweekly'

const TITULOS: Record<Paso, string> = {
  tamano: 'Elige tu Canasta Ideal', // suscripciones/page.tsx:422
  frecuencia: 'Frecuencia de Entrega', // :557
  datos: '¡Completa tu Suscripción!', // SubscriptionCheckoutForm.tsx:277
  resumen: 'Resumen de Suscripción', // :554
}

/** Los días de hoy del formulario (SubscriptionCheckoutForm.tsx:464-470). */
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const
const LARGO: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: undefined }
const ISO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Lo que la API manda en `detail` puede ser texto o la lista de un 422: solo se muestra si es texto (como hoy, suscripciones/page.tsx:669). */
function textoError(datos: unknown): string {
  const d = datos as { error?: unknown; detail?: unknown } | null
  if (typeof d?.error === 'string' && d.error) return d.error
  if (typeof d?.detail === 'string' && d.detail) return d.detail
  return 'Error creando suscripción'
}

interface Props {
  abierto: boolean
  planes: PlanApi[]
  retornable: PlanApi | null
  info: (plan: PlanApi) => InfoPlan
  alCerrar: () => void
}

type Primera = { fase: 'cargando' } | { fase: 'listo'; fecha: string } | { fase: 'error' }

export default function AltaSuscripcion({ abierto, planes, retornable, info, alCerrar }: Props) {
  const { data: sesion, status: estadoSesion } = useSession()
  const token = (sesion as { accessToken?: string } | null)?.accessToken
  const [paso, setPaso] = useState<Paso>('tamano')
  const [planId, setPlanId] = useState<string>('')
  const [carne, setCarne] = useState<string>('')
  const [frecuencia, setFrecuencia] = useState<Frecuencia | ''>('')
  const [agregado, setAgregado] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const candado = useRef(false)

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [lada, setLada] = useState('+52')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [cpGuardado, setCpGuardado] = useState<string | undefined>(undefined)
  const [zona, setZona] = useState<ZonaEntrega | null>(null)
  const [referencias, setReferencias] = useState('')
  const [dia, setDia] = useState('')
  const [alergias, setAlergias] = useState('')
  const [primera, setPrimera] = useState<Primera>({ fase: 'cargando' })
  const pedidoPrimera = useRef(0)
  const datosCargados = useRef(false)

  // Cada vez que se abre, desde el principio con la primera canasta del grupo.
  useEffect(() => {
    if (!abierto) return
    setPaso('tamano')
    setPlanId(planes[0]?.id ?? '')
    setCarne('')
    setFrecuencia('')
    setAgregado(null)
    setError(null)
  }, [abierto, planes])

  const plan = planes.find((p) => p.id === planId) ?? null
  const datosPlan = plan ? info(plan) : null
  const envio = plan ? calcularCostoEnvio(plan.price) : 0
  const total = plan ? plan.price + envio : 0
  const dias = plan?.frequencies.find((f) => f.id === frecuencia)?.days

  // Datos de la cuenta, como hoy (GET /api/auth/me con el Bearer, SubscriptionCheckoutForm.tsx:132-221), una vez por apertura con sesión.
  useEffect(() => {
    if (!abierto || paso !== 'datos' || !token || datosCargados.current) return
    datosCargados.current = true
    setCorreo(sesion?.user?.email ?? '')
    setNombre(sesion?.user?.name ?? '')
    fetch(`${API_URL}/api/auth/me`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((u: Record<string, unknown> | null) => {
        if (!u) return
        if (typeof u.nombre === 'string' && u.nombre) setNombre(u.nombre)
        if (typeof u.email === 'string' && u.email) setCorreo(u.email)
        if (typeof u.telefono === 'string') setTelefono(u.telefono.replace(/\D/g, '').slice(0, 10))
        if (typeof u.codigo_pais === 'string' && u.codigo_pais) setLada(u.codigo_pais)
        const d = u.direccion_estructurada as Record<string, unknown> | null | undefined
        if (d && typeof d.calle === 'string') {
          const interior = typeof d.numero_interior === 'string' && d.numero_interior ? ` ${d.numero_interior}` : ''
          setDireccion(`${d.calle} ${d.numero_exterior ?? ''}${interior}, ${d.colonia ?? ''}`)
          if (typeof d.codigo_postal === 'string') setCpGuardado(d.codigo_postal)
          if (typeof d.referencias === 'string') setReferencias(d.referencias)
          if (typeof d.dia_preferido_entrega === 'string') setDia(d.dia_preferido_entrega)
          if (typeof d.alergias_restricciones === 'string') setAlergias(d.alergias_restricciones)
        } else if (typeof u.direccion_principal === 'string') {
          setDireccion(u.direccion_principal)
          const cp = u.direccion_principal.match(/\b(\d{5})\b/)
          if (cp) setCpGuardado(cp[1])
        }
      })
      .catch(() => {
        /* sin datos: la persona los escribe (como hoy) */
      })
  }, [abierto, paso, token, sesion])

  // La fecha REAL de la primera canasta (SUBF1, SubscriptionCheckoutForm.tsx:108-130): se relee al cambiar el día; la vieja no pisa.
  const cargarPrimera = useCallback((diaPreferido: string) => {
    const pedido = ++pedidoPrimera.current
    setPrimera({ fase: 'cargando' })
    fetch(`${API_URL}/api/subscriptions/primera-entrega?dia_preferido=${encodeURIComponent(diaPreferido)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json().catch(() => null) : null))
      .then((datos: unknown) => {
        if (pedido !== pedidoPrimera.current) return
        const fecha = (datos as Partial<PrimeraEntregaRespuesta> | null)?.fecha
        setPrimera(typeof fecha === 'string' && ISO_FECHA.test(fecha) ? { fase: 'listo', fecha } : { fase: 'error' })
      })
      .catch(() => {
        if (pedido === pedidoPrimera.current) setPrimera({ fase: 'error' })
      })
  }, [])

  useEffect(() => {
    if (abierto && (paso === 'datos' || paso === 'resumen')) cargarPrimera(dia)
  }, [abierto, paso, dia, cargarPrimera])

  const continuar = () => {
    setError(null)
    if (paso === 'tamano') {
      if (!plan) return
      if (plan.id === PLAN_CON_CARNE && !carne) return setError('Debes seleccionar una opción de carne para la Canasta Básica Familiar')
      return setPaso('frecuencia')
    }
    if (paso === 'frecuencia') {
      if (frecuencia !== 'weekly' && frecuencia !== 'biweekly') return
      return setPaso('datos')
    }
    if (paso === 'datos') {
      if (!nombre || !correo || !telefono) return setError('Por favor completa todos los campos de información personal')
      if (!direccion || !zona) return setError('Por favor selecciona una dirección con código postal válido')
      return setPaso('resumen')
    }
  }

  const atras = () => {
    setError(null)
    const i = PASOS.indexOf(paso)
    if (i > 0) setPaso(PASOS[i - 1])
  }

  const agregarSoloEstaVez = () => {
    if (!datosPlan || !datosPlan.compraUnica || datosPlan.compraUnica === 'agotada') return
    const cu = datosPlan.compraUnica
    if (agregarProducto(cu, 1)) setAgregado(textoAgregado(cu.nombre))
    else setError('No pudimos agregarlo al carrito. Intenta de nuevo.')
  }

  const confirmar = async () => {
    if (candado.current || !plan || (frecuencia !== 'weekly' && frecuencia !== 'biweekly') || !zona) return
    candado.current = true
    setEnviando(true)
    setError(null)
    const opcionCarne = plan.id === PLAN_CON_CARNE ? OPCIONES_CARNE.find((o) => o.valor === carne)?.texto ?? null : null
    // El cuerpo de hoy, campo por campo (suscripciones/page.tsx:643-656 + SubscriptionCheckoutForm.tsx:246-256).
    const cuerpo = {
      plan_id: plan.id,
      frequency: frecuencia,
      email: correo,
      nombre,
      telefono: `${lada}${telefono}`,
      direccion,
      alcaldia: zona.municipio,
      codigo_postal: zona.codigo_postal,
      referencias: referencias || null,
      dia_preferido: dia || null,
      alergias: alergias || null,
      opcion_carne: opcionCarne,
    }
    try {
      const r = await fetch('/api/subscriptions/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const datos: unknown = await r.json().catch(() => null)
      const d = datos as { success?: unknown; subscription_id?: unknown; mp_preapproval_id?: unknown; init_point?: unknown; message?: unknown } | null
      if (!r.ok || !d || d.success !== true) throw new Error(textoError(datos))
      const pendiente = {
        subscription_id: typeof d.subscription_id === 'string' ? d.subscription_id : undefined,
        plan_name: plan.name,
        frequency: frecuencia,
        email: correo,
        dias,
        primera_entrega: primera.fase === 'listo' ? primera.fecha : undefined,
      }
      // Sin costo (planes de prueba): la API no llamó a MercadoPago y ya quedó activa (suscripciones/page.tsx:672-685).
      if (!d.init_point && typeof d.subscription_id === 'string') {
        guardarSuscripcionPendiente({ ...pendiente, sin_costo: true, mensaje: typeof d.message === 'string' ? d.message : undefined })
        window.location.href = '/suscripciones/confirmacion?sin_costo=1'
        return
      }
      if (typeof d.init_point === 'string' && d.init_point) {
        guardarSuscripcionPendiente({ ...pendiente, mp_preapproval_id: typeof d.mp_preapproval_id === 'string' ? d.mp_preapproval_id : null })
        window.location.href = d.init_point
        return
      }
      throw new Error('Error: No se recibió URL de pago')
    } catch (e) {
      setError(`Error creando la suscripción: ${e instanceof Error ? e.message : 'Error desconocido'}`)
      candado.current = false
      setEnviando(false)
    }
  }

  const sinSesion = estadoSesion !== 'loading' && !token
  const callback = encodeURIComponent('/tienda?pestana=canasta-lista')

  return (
    <Dialogo abierto={abierto} onCerrar={alCerrar} etiquetaCerrar="Cerrar" titulo={TITULOS[paso]} testId="sn-suscripcion-alta">
      <div data-testid="sn-suscripcion-alta-paso" data-paso={paso} className="flex flex-col gap-5">
        <div aria-hidden="true" className="flex gap-1.5">
          {PASOS.map((p, i) => (
            <span key={p} className={unirClases('h-[3px] flex-1 rounded-sn-pildora', i <= PASOS.indexOf(paso) ? 'bg-sn-terra' : 'bg-sn-border')} />
          ))}
        </div>

        {paso === 'tamano' && (
          <>
            <GrupoOpciones
              leyenda={TITULOS.tamano}
              leyendaOculta
              nombre="sn-alta-tamano"
              testId="sn-suscripcion-alta-tamano"
              columnas={2}
              valor={planId}
              onCambio={(v) => {
                setPlanId(v)
                setCarne('')
                setError(null)
              }}
              opciones={planes.map((p) => {
                const kilos = kilosDe(info(p).nombreBase ?? undefined)
                const personas = PERSONAS[p.id]
                return {
                  valor: p.id,
                  etiqueta: p.name,
                  detalle: (
                    <>
                      {kilos && <span className="block">{kilos}</span>}
                      <span className="block">
                        {personas === null ? <Falta que="personas de la Canasta Completa" quien="David" /> : personas}
                      </span>
                      <span className="block font-medium">{`${precioLegible(p.price)} por entrega`}</span>
                    </>
                  ),
                }
              })}
            />
            {datosPlan?.descripcion && (
              <Texto tamano="chico" testId="sn-suscripcion-alta-contenido">
                {datosPlan.descripcion}
              </Texto>
            )}
            {plan?.id === PLAN_CON_CARNE && (
              <GrupoOpciones
                leyenda="Elige tu opción de carne:"
                nombre="sn-alta-carne"
                testId="sn-suscripcion-alta-carne"
                valor={carne}
                onCambio={(v) => {
                  setCarne(v)
                  setError(null)
                }}
                opciones={OPCIONES_CARNE.map((o) => ({ valor: o.valor, etiqueta: o.texto }))}
              />
            )}
          </>
        )}

        {paso === 'frecuencia' && plan && datosPlan && (
          <>
            <GrupoOpciones
              leyenda={TITULOS.frecuencia}
              leyendaOculta
              nombre="sn-alta-frecuencia"
              testId="sn-suscripcion-alta-frecuencia"
              valor={frecuencia}
              onCambio={(v) => {
                setFrecuencia(v as Frecuencia)
                setAgregado(null)
                setError(null)
              }}
              opciones={[
                ...(datosPlan.compraUnica !== null
                  ? [
                      {
                        valor: 'solo',
                        etiqueta: (
                          <>
                            Solo esta vez
                            {plan.id === PLAN_CON_CARNE && (
                              <>
                                {' '}
                                <Falta que="elección de la carne en la compra única de la Canasta Básica Familiar" quien="David" />
                              </>
                            )}
                          </>
                        ),
                        detalle: datosPlan.compraUnica === 'agotada' ? TEXTO_AGOTADO : precioLegible(datosPlan.compraUnica.precio),
                        deshabilitada: datosPlan.compraUnica === 'agotada',
                      },
                    ]
                  : []),
                ...plan.frequencies
                  .filter((f) => f.id === 'weekly' || f.id === 'biweekly')
                  .map((f) => ({
                    valor: f.id,
                    etiqueta:
                      f.id === 'weekly' ? (
                        'Cada semana'
                      ) : (
                        <>
                          Cada 15 días{' '}
                          <Falta que="si la opción se llama «Cada 15 días» o «Cada 2 semanas» (se cobra cada 14 días)" quien="David" />
                        </>
                      ),
                    detalle: `${precioLegible(plan.price)} por entrega · ${envio > 0 ? `+ ${precioLegible(envio)} de envío` : 'Envío gratis'}`,
                  })),
              ]}
            />
            {frecuencia === 'solo' && (
              <div className="flex flex-col gap-3">
                <Boton onClick={agregarSoloEstaVez} testId="sn-suscripcion-alta-agregar">
                  Agregar al Carrito
                </Boton>
                {agregado && <AvisoEnLinea tono="exito">{agregado}</AvisoEnLinea>}
              </div>
            )}
          </>
        )}

        {paso === 'datos' && sinSesion && (
          <div data-testid="sn-suscripcion-alta-sesion" className="flex flex-col gap-4">
            <Texto>Debes iniciar sesión para crear una suscripción</Texto>
            <Boton href={`${HREF_INICIAR_SESION}?callbackUrl=${callback}`} testId="sn-suscripcion-alta-sesion-entrar">
              Iniciar Sesión
            </Boton>
          </div>
        )}

        {paso === 'datos' && !sinSesion && (
          <div data-testid="sn-suscripcion-alta-datos" className="flex flex-col gap-4">
            <Texto tamano="chico">Abajo ves la fecha de tu primera canasta.</Texto>
            <Campo etiqueta="Nombre completo *" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" requerido autoComplete="name" testId="sn-suscripcion-alta-nombre" />
            <div className="flex flex-col gap-1.5">
              <span className="font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">Teléfono *</span>
              <div className="flex gap-2">
                <div className="w-28 shrink-0" data-testid="sn-suscripcion-alta-lada">
                  <CountryCodeSelector value={lada} onChange={setLada} />
                </div>
                <Campo
                  etiqueta="Teléfono *"
                  etiquetaOculta
                  tipo="tel"
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  requerido
                  autoComplete="tel-national"
                  testId="sn-suscripcion-alta-telefono"
                  className="flex-1"
                />
              </div>
            </div>
            <Campo etiqueta="Correo electrónico *" tipo="email" value={correo} deshabilitado ayuda="Email de tu cuenta iniciada" testId="sn-suscripcion-alta-correo" />
            <Texto tamano="chico">Cobertura actual: Solo realizamos entregas en Ciudad de México (CDMX)</Texto>
            <Campo etiqueta="Dirección completa *" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia" requerido autoComplete="street-address" testId="sn-suscripcion-alta-direccion" />
            <SelectorZona zona={zona} alElegir={setZona} cpInicial={cpGuardado} testId="sn-suscripcion-alta-zona" />
            <Campo etiqueta="Referencias de entrega" tipo="textarea" filas={2} value={referencias} onChange={(e) => setReferencias(e.target.value)} placeholder="Ej: Casa azul, portón negro, entre calles..." testId="sn-suscripcion-alta-referencias" />
            <Campo
              etiqueta="Día preferido de entrega"
              tipo="select"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
              opciones={[{ valor: '', etiqueta: 'Sin preferencia' }, ...DIAS.map((d) => ({ valor: d, etiqueta: d }))]}
              ayuda="Se respetará según disponibilidad de tu zona"
              testId="sn-suscripcion-alta-dia"
            />
            <PrimeraEntrega primera={primera} reintentar={() => cargarPrimera(dia)} />
            <Campo etiqueta="Alergias o restricciones alimentarias" tipo="textarea" filas={2} value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Ej: alérgico a frutos secos, vegetariano, etc." testId="sn-suscripcion-alta-alergias" />
          </div>
        )}

        {paso === 'resumen' && plan && (
          <div data-testid="sn-suscripcion-alta-resumen" className="flex flex-col gap-4">
            <dl className="m-0 flex flex-col gap-2 rounded-sn-tarjeta bg-white p-5 font-sn-mono text-[11px] font-medium uppercase text-sn-ink">
              {/* Los renglones del resumen de hoy (SubscriptionCheckoutForm.tsx:556-577), con el envío real (DR-13). */}
              <Renglon nombre={plan.name} valor={precioLegible(plan.price)} testId="sn-suscripcion-alta-precio" dato={plan.price} />
              <Renglon nombre="Frecuencia" valor={frecuencia === 'weekly' ? 'Cada semana' : 'Cada 15 días'} />
              <Renglon nombre="Envío" valor={envio > 0 ? precioLegible(envio) : 'Envío gratis'} testId="sn-suscripcion-alta-envio" dato={envio} />
              <div className="mt-2 flex items-baseline justify-between gap-4 border-0 border-t border-solid border-sn-border pt-3">
                <dt>Total por entrega</dt>
                <dd data-testid="sn-suscripcion-alta-total" data-total={total} className="m-0 font-sn-titulos text-[28px] font-normal normal-case text-sn-green">
                  {precioLegible(total)}
                </dd>
              </div>
            </dl>
            <PrimeraEntrega primera={primera} reintentar={() => cargarPrimera(dia)} />
            {retornable && (
              <div data-testid="sn-suscripcion-alta-retornable" className="flex flex-col gap-1 rounded-sn-tarjeta bg-sn-cream p-4 text-sn-ink">
                <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium">{retornable.name}</p>
                <p className="m-0 font-sn-texto text-sn-cuerpo-xs">
                  <Falta que="precio y descripción de la canasta retornable" quien="David" />
                </p>
              </div>
            )}
            <div data-testid="sn-suscripcion-alta-pago" className="flex flex-col gap-1 rounded-sn-tarjeta bg-white p-4 text-sn-ink">
              <p className="m-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase">Método de Pago</p>
              <p className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium">Mercado Pago</p>
              <p className="m-0 font-sn-texto text-sn-cuerpo-xs">{TEXTO_METODO_PAGO_CORTO}</p>
            </div>
            <div className="rounded-sn-tarjeta bg-sn-terra/[0.05] p-4">
              <Texto tamano="mini">Al suscribirte aceptas nuestros términos y condiciones. Puedes cancelar en cualquier momento.</Texto>
              <Texto tamano="mini">Tus datos están protegidos y no se compartirán con terceros.</Texto>
            </div>
            <Boton onClick={confirmar} cargando={enviando} textoCargando="Procesando..." anchoCompleto testId="sn-suscripcion-alta-confirmar">
              {`Confirmar Suscripción - ${precioLegible(total)}`}
            </Boton>
          </div>
        )}

        {error && (
          <p data-testid="sn-suscripcion-alta-error" role="alert" className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-terra">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          {paso !== 'tamano' ? (
            <Boton variante="texto" onClick={atras} testId="sn-suscripcion-alta-atras">
              Atrás
            </Boton>
          ) : (
            <span />
          )}
          {(paso === 'tamano' || (paso === 'frecuencia' && frecuencia !== 'solo') || (paso === 'datos' && !sinSesion)) && (
            <Boton onClick={continuar} flecha testId="sn-suscripcion-alta-siguiente">
              Continuar
            </Boton>
          )}
        </div>
      </div>
    </Dialogo>
  )
}

function Renglon({ nombre, valor, testId, dato }: { nombre: string; valor: React.ReactNode; testId?: string; dato?: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>{nombre}</dt>
      <dd
        data-testid={testId}
        data-precio={testId === 'sn-suscripcion-alta-precio' ? dato : undefined}
        data-envio={testId === 'sn-suscripcion-alta-envio' ? dato : undefined}
        className="m-0 text-right normal-case"
      >
        {valor}
      </dd>
    </div>
  )
}

function PrimeraEntrega({ primera, reintentar }: { primera: Primera; reintentar: () => void }) {
  return (
    <div
      data-testid="sn-suscripcion-alta-primera"
      data-estado={primera.fase}
      data-fecha={primera.fase === 'listo' ? primera.fecha : undefined}
      aria-live="polite"
      className="rounded-sn-campo bg-white p-3 font-sn-texto text-sn-cuerpo-sm text-sn-ink"
    >
      {primera.fase === 'cargando' && <p className="m-0">Calculando la fecha de tu primera canasta…</p>}
      {primera.fase === 'listo' && (
        <p className="m-0">
          Tu primera canasta llega el <span className="font-medium">{formatFechaMexico(primera.fecha, LARGO)}</span>.
        </p>
      )}
      {primera.fase === 'error' && (
        <p className="m-0">
          No pudimos calcular la fecha de tu primera canasta en este momento.{' '}
          <Boton variante="texto" tamano="chico" onClick={reintentar} testId="sn-suscripcion-alta-primera-reintentar">
            Intentar de nuevo
          </Boton>
        </p>
      )}
    </div>
  )
}
