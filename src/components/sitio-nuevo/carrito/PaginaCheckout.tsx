'use client'

// R15 · F3 v2 (carrito, sesión 61): `/checkout` del sitio nuevo. La MISMA conducta que `src/app/checkout/page.tsx` + `CheckoutFormSingleStep.tsx`
// de hoy, pieza por pieza, con el diseño nuevo (f3/carrito-F3.md §2.2). Las MISMAS llamadas y los MISMOS cuerpos (D-F3-06; `reglas.ts`):
// - `GET ${API_URL}/api/auth/me` y `GET ${API_URL}/api/subscriptions/extras-disponibles` (con sesión, Bearer), `GET /api/direcciones` (proxy),
//   `GET ${API_URL}/api/zonas-entrega/{cp}` y `/todas`, `GET ${API_URL}/api/entregas/dias-no-habiles`, `POST ${API_URL}/api/cupones/validar`;
// - `POST /api/cart/sync-and-validate` (apartar 10 minutos) y `POST /api/crear-preferencia-pago` por sus proxies de hoy.
// Lo que cambia (decisiones del líder): el botón de pagar se puede pulsar con el formulario incompleto y dice qué falta sin mandar nada
// (D-F3-20 P-13); hay un candado contra el doble clic antes del primer `await` (memoria s48); el calendario abre en el mes del primer día que
// se puede elegir (D-F3-07 c); sin la política de reembolso de hoy (marca C38) ni el horario falso (D-F3-20 P-3, P-4).

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingCart } from 'lucide-react'
import Boton from '@/components/sitio-nuevo/ui/Boton'
import Campo from '@/components/sitio-nuevo/ui/Campo'
import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import AvisoEnLinea from '@/components/sitio-nuevo/ui/AvisoEnLinea'
import Falta from '@/components/sitio-nuevo/Falta'
import { FOCO, unirClases } from '@/components/sitio-nuevo/ui/clases'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import type { ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import { avisarTrasNavegar } from '@/components/ui/Avisos'
import {
  apartadoVigente,
  guardarAlergiasDelApartado,
  guardarApartado,
  leerApartadoGuardado,
  type AlergiasPorFecha,
  type ApartadoConAlergias,
} from '@/components/checkout/RelojApartado'
import {
  CAMPOS_DIRECCION_VACIOS,
  cargarDireccionesGuardadas,
  cpDeDireccion,
  direccionNuevaPedido,
  direccionPorOmision,
  esCpSinCobertura,
  esDireccionAjena,
  esErrorDeDireccion,
  type CamposDireccionNueva,
  type CoberturaCp,
  type ModoDireccion,
} from '@/components/checkout/DireccionEntrega'
import { API_URL } from '@/lib/api'
import { formatFechaMexico } from '@/lib/dates'
import { calcularCostoEnvio, subtotalProductos as subtotalDeProductos, type TipoEntrega } from '@/lib/envio'
import {
  aplicarCambiosDelServidor,
  experienciasDelCarrito,
  firmaCarrito,
  guardarCarrito,
  leerCarrito,
  limpiarExperienciasViejas,
  olvidarApartado,
  vaciarCarrito,
  type ItemCarrito,
} from '@/lib/carrito'
import {
  MAX_LUGARES_POR_COMPRA,
  MINUTOS_APARTADO,
  TEXTO_SIN_CUPONES_EXPERIENCIAS,
  TEXTO_SOLO_TARJETA,
  esApartadoVencido,
  esItemExperiencia,
  subtotalExperiencia,
  textoPersonas,
  type LineaExperienciaValidada,
} from '@/types/compra-experiencias'
import {
  TEXTO_CARRITO_CAMBIO,
  TEXTO_METODO_PAGO_CORTO,
  TEXTO_PAGO_TIENDA,
  carritoCambio,
  textoApartado,
  textoApartadoVencido,
  textoCambiosCarrito,
  type SyncCarritoRespuesta,
} from '@/types/tienda'
import { faltaEnDireccion, textoCpSinCobertura, type DireccionGuardada } from '@/types/datos-cliente'
import Encabezado from './Encabezado'
import Calendario from './Calendario'
import BloqueDireccion from './BloqueDireccion'
import { Bloque, BloqueCanasta, BloqueEntrega, Reloj, TuPedido } from './PiezasCheckout'
import { useCarritoLocal } from './useCarritoLocal'
import {
  CP_RECOGER,
  DATOS_VACIOS,
  MAX_ALERGIAS_PAGO,
  cuerpoCupon,
  cuerpoPreferencia,
  cuerpoSync,
  dinero,
  envioDelPedido,
  faltaEnElFormulario,
  fechaYHoraLarga,
  textoDelServidor,
  textoExperienciasQuitadas,
  type CampoQueFalta,
  type DatosCliente,
} from './reglas'

/** Resultado de apartar (`CheckoutFormSingleStep.tsx:89-92`). */
type ResultadoSync = { tipo: 'apartado'; apartado: ApartadoConAlergias; token: string | null } | { tipo: 'cambio' } | { tipo: 'error' }
type ResultadoPago = 'redirigido' | 'vencido' | 'error'

/** El teléfono y el RFC de hoy (`CheckoutFormSingleStep.tsx:937`, `:977`). Técnicos: no se pintan. */
const MAX_TELEFONO = 10
const MAX_RFC = 13

/** El día elegido, atado al CP del calendario con que se eligió (`CheckoutFormSingleStep.tsx:122-128`): otro CP, otro calendario. */
interface DiaElegido {
  cp: string
  iso: string
}

/** Una línea de experiencia de `validated_items` con precios del servidor (`CheckoutFormSingleStep.tsx:98-101`). */
function esLineaExperiencia(linea: unknown): linea is LineaExperienciaValidada {
  const l = linea as Partial<LineaExperienciaValidada> | null
  return !!l && l.tipo === 'experiencia' && typeof l.evento_id === 'string'
}

function Cargando({ texto }: { texto: string }) {
  return (
    <main data-testid="sn-checkout">
      <div data-testid="sn-checkout-cargando" role="status" className="flex min-h-[60vh] items-center justify-center bg-sn-warm">
        <p className="m-0 font-sn-texto text-sn-cuerpo text-sn-ink">{texto}</p>
      </div>
    </main>
  )
}

function AvisoCambios({ lineas }: { lineas: string[] }) {
  return (
    <AvisoEnLinea tono="atencion" as="div" testId="sn-checkout-acciones-cambio" className="font-normal">
      <p className="m-0 font-medium">{TEXTO_CARRITO_CAMBIO}</p>
      <ul className="m-0 mt-2 list-disc pl-5">
        {lineas.map((linea) => (
          <li key={linea} data-testid="sn-checkout-acciones-cambio-linea">
            {linea}
          </li>
        ))}
      </ul>
    </AvisoEnLinea>
  )
}

export default function PaginaCheckout() {
  const resultadoSesion = useSession()
  const { data: session, status } = resultadoSesion || { data: null, status: 'loading' as const }
  const items = useCarritoLocal()
  const idCp = useId()
  const correoSesion = session?.user?.email ?? null
  const conSesion = !!correoSesion
  const accessToken = session?.accessToken

  // ─── checkout/page.tsx ──────────────────────────────────────────────────────────────────────────────────────────────
  const [quitadas, setQuitadas] = useState(0)
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('envio_domicilio')
  const [canastas, setCanastas] = useState<CanastaExtras[]>([])
  const [conCanasta, setConCanasta] = useState<CanastaExtras | null>(null)

  // ─── CheckoutFormSingleStep.tsx ─────────────────────────────────────────────────────────────────────────────────────
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [datos, setDatos] = useState<DatosCliente>(DATOS_VACIOS)
  const [direcciones, setDirecciones] = useState<DireccionGuardada[]>([])
  const [cobertura, setCobertura] = useState<Record<string, CoberturaCp>>({})
  const [cargandoDirecciones, setCargandoDirecciones] = useState(conSesion)
  const [recargaDirecciones, setRecargaDirecciones] = useState(0)
  const [modoDireccion, setModoDireccion] = useState<ModoDireccion>(conSesion ? 'guardada' : 'nueva')
  const [direccionIdElegida, setDireccionIdElegida] = useState<string | null>(null)
  const [camposNueva, setCamposNueva] = useState<CamposDireccionNueva>(CAMPOS_DIRECCION_VACIOS)
  const [zonaNueva, setZonaNueva] = useState<ZonaEntrega | null>(null)
  const [errorDireccion, setErrorDireccion] = useState<string | null>(null)
  const [diaElegido, setDiaElegido] = useState<DiaElegido | null>(null)
  const [notas, setNotas] = useState('')
  const [codigoCupon, setCodigoCupon] = useState('')
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number; descripcion: string } | null>(null)
  const [cuponError, setCuponError] = useState<string | null>(null)
  const [aplicandoCupon, setAplicandoCupon] = useState(false)
  const [apartado, setApartado] = useState<ApartadoConAlergias | null>(null)
  const [apartadoVencido, setApartadoVencido] = useState(false)
  const [apartando, setApartando] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorPideSesion, setErrorPideSesion] = useState(false)
  const [precioActualizado, setPrecioActualizado] = useState(false)
  const [cambios, setCambios] = useState<string[] | null>(null)
  const [alergias, setAlergias] = useState<AlergiasPorFecha>({})
  const [guestToken, setGuestToken] = useState<string | null>(null)
  // Candado contra el doble clic ANTES del primer await (memoria s48): un segundo clic no manda otro sync ni otro pago.
  const enCurso = useRef(false)

  const lista = items ?? []
  const experiencias = experienciasDelCarrito(lista)
  const productos = lista.filter((item) => !esItemExperiencia(item))
  const hayExperiencias = experiencias.length > 0
  const hayProductos = productos.length > 0
  const soloExperiencias = hayExperiencias && !hayProductos
  const canasta = hayExperiencias ? null : conCanasta
  const firma = firmaCarrito(lista)
  const textos = {
    reloj: textoApartado({ hayExperiencias, hayProductos }),
    vencido: textoApartadoVencido({ hayExperiencias, hayProductos }),
  }
  const recoger = tipoEntrega === 'recoger_almacen' && !canasta

  // Lo que se deriva de la dirección elegida (`CheckoutFormSingleStep.tsx:211-222`): una sola fuente.
  const direccionElegida = modoDireccion === 'guardada' ? direcciones.find((d) => d.id === direccionIdElegida) ?? null : null
  const coberturaElegida = direccionElegida ? cobertura[cpDeDireccion(direccionElegida)] : undefined
  const zonaEntrega: ZonaEntrega | null =
    modoDireccion === 'guardada' ? (coberturaElegida?.estado === 'si' ? coberturaElegida.zona : null) : zonaNueva
  const cpEntrega = recoger ? CP_RECOGER : zonaEntrega?.codigo_postal ?? ''
  const direccionNueva = direccionNuevaPedido(camposNueva, zonaNueva, conSesion)
  const diaEntrega = diaElegido && diaElegido.cp === cpEntrega ? diaElegido : null

  const faltaEnLaDireccion = (): string | null => {
    if (modoDireccion === 'guardada') {
      if (cargandoDirecciones) return 'Espera un momento: estamos cargando tus direcciones.'
      if (!direccionElegida) return 'Elige una dirección de entrega.'
      if (!zonaEntrega) return textoCpSinCobertura(cpDeDireccion(direccionElegida))
      return null
    }
    return faltaEnDireccion(direccionNueva)
  }

  // Totales (`CheckoutFormSingleStep.tsx:363-371`) y el envío de las dos columnas (`checkout/page.tsx:94-95`).
  const subtotalProductos = subtotalDeProductos(productos)
  const unidadesProductos = productos.reduce((n, item) => n + (Number(item.quantity) || 0), 0)
  const subtotalExperiencias = experiencias.reduce((suma, exp) => suma + subtotalExperiencia(exp), 0)
  const subtotal = subtotalProductos + subtotalExperiencias
  const envio = canasta ? 0 : calcularCostoEnvio(subtotalProductos, tipoEntrega)
  const descuento = cupon?.descuento ?? 0
  const total = subtotal + envio - descuento
  const costoEnvioPagina = envioDelPedido(lista, tipoEntrega, conCanasta)

  // ─── Efectos de hoy ─────────────────────────────────────────────────────────────────────────────────────────────────
  // Extras con la canasta (`checkout/page.tsx:76-86`).
  useEffect(() => {
    if (!accessToken) {
      setCanastas([])
      setConCanasta(null)
      return
    }
    let vigente = true
    fetch(`${API_URL}/api/subscriptions/extras-disponibles`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => (r.ok ? r.json() : { entregas: [] }))
      .then((d) => {
        if (vigente) setCanastas(Array.isArray(d?.entregas) ? d.entregas : [])
      })
      .catch(() => {
        if (vigente) setCanastas([])
      })
    return () => {
      vigente = false
    }
  }, [accessToken])

  // Con experiencias no hay canasta (`checkout/page.tsx:89-91`).
  useEffect(() => {
    if (hayExperiencias) setConCanasta(null)
  }, [hayExperiencias])

  // Experiencias de antes de la Fase 4: fuera, con aviso (`checkout/page.tsx:97-106`).
  useEffect(() => {
    setQuitadas(limpiarExperienciasViejas())
  }, [])

  // Direcciones guardadas y su cobertura (`CheckoutFormSingleStep.tsx:238-261`).
  useEffect(() => {
    if (!correoSesion) {
      setDirecciones([])
      setCobertura({})
      setCargandoDirecciones(false)
      setModoDireccion('nueva')
      setDireccionIdElegida(null)
      return
    }
    let vigente = true
    setCargandoDirecciones(true)
    cargarDireccionesGuardadas().then(({ lista: guardadas, cobertura: porCp }) => {
      if (!vigente) return
      const elegida = direccionPorOmision(guardadas, porCp)
      setDirecciones(guardadas)
      setCobertura(porCp)
      setDireccionIdElegida(elegida?.id ?? null)
      setModoDireccion(elegida ? 'guardada' : 'nueva')
      setCargandoDirecciones(false)
    })
    return () => {
      vigente = false
    }
  }, [correoSesion, recargaDirecciones])

  // Datos del cliente con sesión (`CheckoutFormSingleStep.tsx:302-357`).
  useEffect(() => {
    const cargar = async () => {
      if (session?.user?.email) {
        const nombreSesion = session.user.name ?? ''
        const deLaSesion: DatosCliente = {
          nombre: nombreSesion.split(' ')[0] || '',
          apellido: nombreSesion.split(' ').slice(1).join(' ') || '',
          email: session.user.email || '',
          telefono: '',
          codigo_pais: '+52',
          rfc: '',
        }
        try {
          const r = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken ?? ''}` },
          })
          if (r.ok) {
            const u = await r.json()
            setDatos({
              nombre: u.nombre || deLaSesion.nombre,
              apellido: u.apellidos || deLaSesion.apellido,
              email: u.email || deLaSesion.email,
              telefono: u.telefono || '',
              codigo_pais: u.codigo_pais || '+52',
              rfc: '',
            })
          } else {
            setDatos(deLaSesion)
          }
        } catch {
          setDatos(deLaSesion)
        }
      }
      setCargandoDatos(false)
    }
    cargar()
  }, [session])

  // El cupón se quita si cambia lo que se compra (`CheckoutFormSingleStep.tsx:377-379`).
  useEffect(() => {
    setCupon(null)
  }, [subtotalProductos, envio, conCanasta, soloExperiencias])

  // El apartado guardado es de UN carrito (`CheckoutFormSingleStep.tsx:388-412`).
  useEffect(() => {
    if (items === null) return
    if (!firma) {
      setApartado(null)
      setApartadoVencido(false)
      return
    }
    const guardado = leerApartadoGuardado()
    if (guardado && guardado.firma === firma) {
      const guardadas = guardado.alergias ?? {}
      if (Object.keys(guardadas).length > 0) setAlergias((prev) => ({ ...guardadas, ...prev }))
      const vigente = apartadoVigente(leerCarrito())
      setApartado(vigente)
      setApartadoVencido(!vigente)
      if (!vigente) olvidarApartado()
      return
    }
    if (guardado) olvidarApartado()
    setApartado(null)
    setApartadoVencido(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma, items === null])

  // «Atrás» desde MercadoPago (bfcache): el botón no se queda en «Procesando» (`CheckoutFormSingleStep.tsx:424-433`).
  useEffect(() => {
    const alVolver = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setPagando(false)
        setCargando(false)
        enCurso.current = false
      }
    }
    window.addEventListener('pageshow', alVolver)
    return () => window.removeEventListener('pageshow', alVolver)
  }, [])

  // ─── Acciones ────────────────────────────────────────────────────────────────────────────────────────────────────────
  const mostrarError = (texto: string | null, pideSesion = false) => {
    setError(texto)
    setErrorPideSesion(pideSesion)
  }
  const mostrarErrorDelServidor = (d: { detail?: unknown; code?: unknown }, porOmision: string) => {
    mostrarError(textoDelServidor(d.detail) || porOmision, d.code === 'inicia_sesion')
  }
  const marcarVencido = useCallback(() => {
    olvidarApartado()
    setApartado(null)
    setApartadoVencido(true)
  }, [])

  const correo = () => (session?.user?.email || datos.email).trim()

  /** P-13 (D-F3-20): el foco al campo que falta. */
  const enfocar = (campo: CampoQueFalta) => {
    window.requestAnimationFrame(() => {
      let el: HTMLElement | null = null
      if (campo === 'correo') el = document.getElementById('sn-checkout-correo')
      else if (campo === 'nombre') el = document.getElementById('sn-checkout-nombre')
      else if (campo === 'apellido') el = document.getElementById('sn-checkout-apellido')
      else if (campo === 'telefono') el = document.getElementById('sn-checkout-telefono')
      else if (campo === 'dia') {
        el = document.querySelector<HTMLElement>('[data-testid="sn-checkout-calendario-dia"]:not([disabled])') ??
          document.querySelector<HTMLElement>('[data-testid="sn-checkout-calendario"]')
      } else if (modoDireccion === 'guardada') {
        // `ui/GrupoOpciones` no da `id` a sus radios (D-F3-30): el primero que se puede elegir dentro del fieldset.
        el = document.querySelector<HTMLElement>('[data-testid="sn-checkout-direccion-guardada"] input[type="radio"]:not([disabled])')
      } else if (!zonaNueva) el = document.getElementById(`${idCp}-boton`)
      else if (!camposNueva.calle.trim()) el = document.getElementById('sn-checkout-calle')
      else el = document.getElementById('sn-checkout-exterior')
      el?.focus()
    })
  }

  const revisarFormulario = (): boolean => {
    const falta = faltaEnElFormulario({
      correo: correo(),
      datos,
      hayProductos,
      hayExperiencias,
      canasta,
      recoger,
      faltaEnLaDireccion: faltaEnLaDireccion(),
      hayZona: !!zonaEntrega,
      hayDia: !!diaEntrega,
    })
    if (falta) {
      mostrarError(falta.texto)
      enfocar(falta.campo)
      return false
    }
    return true
  }

  const avisarCambios = (lineas: string[] | null) => setCambios(lineas)

  const avisarErrorDireccion = (texto: string) => {
    setErrorDireccion(texto)
    if (direccionElegida && esCpSinCobertura(texto)) {
      const porCp: Record<string, CoberturaCp> = { ...cobertura, [cpDeDireccion(direccionElegida)]: { estado: 'no' } }
      const otra = direccionPorOmision(direcciones, porCp)
      setCobertura(porCp)
      setDireccionIdElegida(otra?.id ?? null)
      setModoDireccion(otra ? 'guardada' : 'nueva')
    } else if (direccionElegida && esDireccionAjena(texto)) {
      setRecargaDirecciones((n) => n + 1)
    }
  }

  const volverAIniciarSesion = () => {
    avisarTrasNavegar('Tu sesión expiró. Inicia sesión: tu carrito se conserva.')
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent('/checkout')}`
  }

  const aplicarCupon = async () => {
    const codigo = codigoCupon.trim()
    if (!codigo) return
    setAplicandoCupon(true)
    setCuponError(null)
    try {
      const r = await fetch(`${API_URL}/api/cupones/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpoCupon(codigo, tipoEntrega, lista)),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setCupon(null)
        setCuponError(r.status === 429 ? 'Demasiados intentos. Espera un minuto y vuelve a probar.' : d.detail || 'No se pudo validar el código.')
        return
      }
      setCupon({ codigo: d.codigo, descuento: Number(d.descuento) || 0, descripcion: d.descripcion || '' })
    } catch {
      setCuponError('No se pudo validar el código. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setAplicandoCupon(false)
    }
  }

  /** El precio del servidor manda (`CheckoutFormSingleStep.tsx:559-578`). */
  const actualizarPrecios = (lineas: unknown[]) => {
    const porEvento = new Map<string, LineaExperienciaValidada>()
    for (const l of lineas || []) {
      if (esLineaExperiencia(l) && typeof l.precio_adulto === 'number' && typeof l.precio_nino === 'number') porEvento.set(l.evento_id, l)
    }
    let cambio = false
    const nuevos = leerCarrito().map((item) => {
      if (!esItemExperiencia(item)) return item
      const l = porEvento.get(item.evento_id)
      if (!l || (Math.abs(l.precio_adulto - item.price) < 0.005 && Math.abs(l.precio_nino - item.precio_nino) < 0.005)) return item
      cambio = true
      return { ...item, price: l.precio_adulto, precio_nino: l.precio_nino }
    })
    if (cambio) guardarCarrito(nuevos)
    setPrecioActualizado(cambio)
  }

  /** Apartar 10 minutos (`CheckoutFormSingleStep.tsx:586-656`). */
  const sincronizar = async (): Promise<ResultadoSync> => {
    const r = await fetch('/api/cart/sync-and-validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpoSync(lista, correo(), datos)),
    })
    const d = await r.json().catch(() => ({}))
    if (r.status === 401) {
      volverAIniciarSesion()
      return { tipo: 'error' }
    }
    if (!r.ok) {
      if (esApartadoVencido(d.detail)) {
        marcarVencido()
        return { tipo: 'error' }
      }
      mostrarErrorDelServidor(
        d,
        hayExperiencias ? 'No pudimos apartar tus lugares. Intenta de nuevo.' : 'No pudimos validar tu carrito. Intenta de nuevo.',
      )
      return { tipo: 'error' }
    }
    const respuesta = d as SyncCarritoRespuesta & { _guest_token?: string }
    const token = respuesta._guest_token ?? null
    setGuestToken(token)
    actualizarPrecios(respuesta.validated_items)
    if (carritoCambio(respuesta)) {
      const ajustado = aplicarCambiosDelServidor(respuesta)
      avisarCambios(textoCambiosCarrito(respuesta))
      if (respuesta.apartado) {
        setApartado(guardarApartado(respuesta.apartado, ajustado, alergias))
        setApartadoVencido(false)
      } else {
        olvidarApartado()
        setApartado(null)
      }
      return { tipo: 'cambio' }
    }
    if (!respuesta.apartado) {
      mostrarError(hayExperiencias ? 'No pudimos apartar tus lugares. Intenta de nuevo.' : 'No pudimos apartar tus productos. Intenta de nuevo.')
      return { tipo: 'error' }
    }
    const guardado = guardarApartado(respuesta.apartado, lista, alergias)
    setApartado(guardado)
    setApartadoVencido(false)
    return { tipo: 'apartado', apartado: guardado, token }
  }

  /** Crear el pago con el apartado (`CheckoutFormSingleStep.tsx:659-734`). */
  const crearPreferencia = async (vigente: ApartadoConAlergias, token: string | null): Promise<ResultadoPago> => {
    const cuerpo = cuerpoPreferencia({
      items: lista,
      apartadoId: vigente.id,
      correo: correo(),
      datos,
      alergias,
      token,
      entrega: {
        notas,
        tipoEntrega,
        costoEnvio: costoEnvioPagina,
        canasta,
        fechaIso: diaEntrega?.iso,
        codigoCupon: cupon?.codigo,
        direccionGuardada: direccionElegida,
        direccionNueva,
      },
    })
    guardarAlergiasDelApartado(alergias)
    const r = await fetch('/api/crear-preferencia-pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    const resultado = await r.json().catch(() => ({}))
    if (r.status === 401) {
      volverAIniciarSesion()
      return 'redirigido'
    }
    if (r.status === 409 && esApartadoVencido(resultado.detail)) return 'vencido'
    if (!r.ok) {
      if (r.status === 400 && cupon) setCupon(null)
      const texto = textoDelServidor(resultado.detail)
      if (r.status === 400 && texto && hayProductos && !canasta && esErrorDeDireccion(texto)) avisarErrorDireccion(texto)
      if (!hayExperiencias && r.status === 400 && texto) mostrarError(`No se pudo completar el pago: ${texto}`)
      else mostrarErrorDelServidor(resultado, 'No pudimos crear tu pago. Intenta de nuevo.')
      return 'error'
    }
    if (resultado.sin_costo) {
      vaciarCarrito()
      window.location.href = resultado.redirect_url || `/pago-exitoso?pedido=${resultado.numero_pedido}&sin_costo=1`
      return 'redirigido'
    }
    const url = resultado.payment_url || resultado.init_point
    if (!url) {
      mostrarError('No pudimos crear tu pago. Intenta de nuevo.')
      return 'error'
    }
    window.location.href = url
    return 'redirigido'
  }

  /** Solo productos: UN botón, sync → pago; 409 re-sincroniza UNA vez (`CheckoutFormSingleStep.tsx:737-776`). */
  const pagarSoloProductos = async () => {
    if (enCurso.current) return
    if (!revisarFormulario()) return
    enCurso.current = true
    mostrarError(null)
    avisarCambios(null)
    setCargando(true)
    let redirigiendo = false
    try {
      let vigente = apartado && !apartadoVencido ? apartadoVigente(leerCarrito()) : null
      let token = guestToken
      for (let intento = 0; intento < 2; intento++) {
        if (!vigente) {
          const sync = await sincronizar()
          if (sync.tipo !== 'apartado') return
          vigente = sync.apartado
          token = sync.token
        }
        const pago = await crearPreferencia(vigente, token)
        if (pago === 'redirigido') {
          redirigiendo = true
          return
        }
        if (pago === 'error') return
        olvidarApartado()
        setApartado(null)
        vigente = null
      }
      marcarVencido()
    } catch {
      mostrarError('No pudimos conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      if (!redirigiendo) {
        setCargando(false)
        enCurso.current = false
      }
    }
  }

  /** Con experiencias, paso 1 (`CheckoutFormSingleStep.tsx:779-795`). */
  const apartarLugares = async () => {
    if (enCurso.current) return
    if (!revisarFormulario()) return
    enCurso.current = true
    mostrarError(null)
    avisarCambios(null)
    setApartando(true)
    try {
      await sincronizar()
    } catch {
      mostrarError('No pudimos conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setApartando(false)
      enCurso.current = false
    }
  }

  /** Con experiencias, paso 2 (`CheckoutFormSingleStep.tsx:797-818`). */
  const pagarConTarjeta = async () => {
    if (enCurso.current || !apartado || apartadoVencido) return
    if (!revisarFormulario()) return
    enCurso.current = true
    mostrarError(null)
    avisarCambios(null)
    setPagando(true)
    let redirigiendo = false
    try {
      const pago = await crearPreferencia(apartado, guestToken)
      if (pago === 'redirigido') redirigiendo = true
      if (pago === 'vencido') marcarVencido()
    } catch {
      mostrarError('No pudimos conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      if (!redirigiendo) {
        setPagando(false)
        enCurso.current = false
      }
    }
  }

  // ─── Pantalla ──────────────────────────────────────────────────────────────────────────────────────────────────────
  if (status === 'loading' || items === null) return <Cargando texto="Cargando..." />

  const avisoViejas = quitadas > 0 && (
    <AvisoEnLinea tono="atencion" testId="sn-checkout-aviso-viejas">
      {textoExperienciasQuitadas(quitadas)}
    </AvisoEnLinea>
  )

  if (lista.length === 0) {
    return (
      <main data-testid="sn-checkout">
        <Encabezado titulo="Tu carrito está vacío" texto="Agrega algunos productos antes de proceder al checkout" testId="sn-checkout-vacio" />
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-6 px-6 pb-24 pt-12 text-center">
          {avisoViejas}
          {cambios && cambios.length > 0 && <AvisoCambios lineas={cambios} />}
          <ShoppingCart aria-hidden="true" className="h-16 w-16 text-sn-ink opacity-35" strokeWidth={1.25} />
          <Boton href="/tienda" forma="recta" flecha>
            Ir a la tienda
          </Boton>
        </div>
      </main>
    )
  }

  if (cargandoDatos) return <Cargando texto="Cargando tus datos..." />

  const textoEncabezado = hayExperiencias
    ? 'Completa tus datos, aparta tus lugares y paga con tarjeta o saldo de MercadoPago'
    : conSesion
      ? 'Verifica tus datos y confirma tu pedido'
      : 'Completa tus datos para continuar'
  const tituloDireccion = hayExperiencias ? 'Entrega de tus productos' : recoger ? 'Recoger tu pedido' : 'Dirección de Entrega'
  const bloqueError = error && (
    <AvisoEnLinea tono="error" as="div" testId="sn-checkout-acciones-error">
      <span className="block">{error}</span>
      {errorPideSesion && (
        <a
          href={`/auth/signin?callbackUrl=${encodeURIComponent('/checkout')}`}
          data-testid="sn-checkout-acciones-error-sesion"
          className={unirClases('mt-1 inline-block font-medium text-sn-ink underline hover:text-sn-terra', FOCO)}
        >
          Iniciar sesión (tu carrito se conserva)
        </a>
      )}
    </AvisoEnLinea>
  )

  return (
    <main data-testid="sn-checkout">
      <Encabezado titulo="Finalizar Compra" texto={textoEncabezado} />
      <Contenedor className="py-8 min-[861px]:py-12">
        <div className="mb-6">
          <Boton href="/carrito" variante="texto" testId="sn-checkout-volver">
            Carrito
          </Boton>
        </div>
        {avisoViejas && <div className="mb-6">{avisoViejas}</div>}
        <div className="grid grid-cols-1 gap-10 min-[861px]:grid-cols-[1.5fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            {!hayExperiencias && <BloqueCanasta canastas={canastas} seleccion={conCanasta} onCambio={setConCanasta} />}

            {!conCanasta && hayProductos && <BloqueEntrega valor={tipoEntrega} onCambio={setTipoEntrega} subtotal={subtotalProductos} />}

            <Bloque titulo="Información Personal" idTitulo="sn-checkout-datos-titulo" testId="sn-checkout-datos">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo
                  etiqueta="Nombre *"
                  id="sn-checkout-nombre"
                  testId="sn-checkout-datos-nombre"
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  requerido
                />
                <Campo
                  etiqueta="Apellido *"
                  id="sn-checkout-apellido"
                  testId="sn-checkout-datos-apellido"
                  value={datos.apellido}
                  onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  requerido
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div data-testid="sn-checkout-datos-lada" className="flex flex-col gap-1.5">
                  <p className="m-0 font-sn-mono text-sn-etiqueta-sm font-medium uppercase text-sn-ink">Código de país *</p>
                  <CountryCodeSelector value={datos.codigo_pais} onChange={(lada) => setDatos({ ...datos, codigo_pais: lada })} />
                </div>
                <Campo
                  etiqueta="Teléfono *"
                  tipo="tel"
                  id="sn-checkout-telefono"
                  testId="sn-checkout-datos-telefono"
                  value={datos.telefono}
                  onChange={(e) => setDatos({ ...datos, telefono: e.target.value.replace(/\D/g, '') })}
                  maxLength={MAX_TELEFONO}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  requerido
                />
              </div>
              <Campo
                etiqueta="Email *"
                tipo="email"
                id="sn-checkout-correo"
                testId="sn-checkout-datos-correo"
                value={datos.email}
                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                placeholder="tu@email.com"
                autoComplete="email"
                requerido
                deshabilitado={conSesion}
                ayuda={conSesion ? 'Email de tu cuenta iniciada' : undefined}
              />
              <Campo
                etiqueta="RFC (opcional)"
                id="sn-checkout-rfc"
                testId="sn-checkout-datos-rfc"
                value={datos.rfc}
                onChange={(e) => setDatos({ ...datos, rfc: e.target.value.toUpperCase() })}
                maxLength={MAX_RFC}
                ayuda="Requerido solo si necesitas factura fiscal"
              />
            </Bloque>

            {hayProductos && (
              <Bloque titulo={tituloDireccion} idTitulo="sn-checkout-direccion-titulo" testId="sn-checkout-direccion">
                {canasta ? (
                  <div data-testid="sn-checkout-direccion-canasta" className="flex flex-col gap-3 font-sn-texto text-sn-ink">
                    <p className="m-0 text-sn-cuerpo-sm font-medium">
                      Llega con tu canasta el{' '}
                      {formatFechaMexico(canasta.fecha_entrega, { weekday: 'long', day: 'numeric', month: 'long', year: undefined })}
                    </p>
                    <p className="m-0 text-sn-cuerpo-sm">Se entrega junto con tu canasta, en la misma dirección donde la recibes.</p>
                  </div>
                ) : (
                  <>
                    <div hidden={recoger}>
                      <BloqueDireccion
                        conSesion={conSesion}
                        cargando={cargandoDirecciones}
                        direcciones={direcciones}
                        cobertura={cobertura}
                        modo={modoDireccion}
                        direccionIdElegida={direccionIdElegida}
                        onElegirGuardada={(id) => {
                          setModoDireccion('guardada')
                          setDireccionIdElegida(id)
                          setErrorDireccion(null)
                        }}
                        onUsarOtra={() => {
                          setModoDireccion('nueva')
                          setErrorDireccion(null)
                        }}
                        campos={camposNueva}
                        onCampo={(campo, valor) => {
                          setCamposNueva((prev) => ({ ...prev, [campo]: valor }))
                          setErrorDireccion(null)
                        }}
                        zonaNueva={zonaNueva}
                        onZonaNueva={(zona) => {
                          setZonaNueva(zona)
                          setErrorDireccion(null)
                        }}
                        error={errorDireccion}
                        idCp={idCp}
                      />
                    </div>
                    {recoger && (
                      <div className="flex flex-col gap-3">
                        <p id="sn-checkout-calendario-titulo" className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">
                          Selecciona el día en que recoges tu pedido
                        </p>
                        <Calendario
                          key={CP_RECOGER}
                          modo="recoger"
                          codigoPostal=""
                          seleccionado={diaEntrega?.iso ?? null}
                          onElegir={(iso) => setDiaElegido({ cp: CP_RECOGER, iso })}
                          idTitulo="sn-checkout-calendario-titulo"
                        />
                      </div>
                    )}
                    {!recoger && zonaEntrega && (
                      <div className="flex flex-col gap-3">
                        <p id="sn-checkout-calendario-titulo" className="m-0 font-sn-texto text-sn-cuerpo-sm font-medium text-sn-ink">
                          Selecciona tu día de entrega
                        </p>
                        <Calendario
                          key={cpEntrega}
                          modo="entrega"
                          codigoPostal={cpEntrega}
                          seleccionado={diaEntrega?.iso ?? null}
                          onElegir={(iso) => setDiaElegido({ cp: cpEntrega, iso })}
                          idTitulo="sn-checkout-calendario-titulo"
                        />
                      </div>
                    )}
                  </>
                )}
                <Campo
                  etiqueta="Notas de entrega (opcional)"
                  tipo="textarea"
                  filas={canasta ? 2 : 3}
                  id="sn-checkout-notas"
                  testId="sn-checkout-direccion-notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instrucciones especiales para la entrega"
                />
              </Bloque>
            )}

            {hayExperiencias && (
              <Bloque titulo="Tus experiencias" idTitulo="sn-checkout-experiencias-titulo" testId="sn-checkout-experiencias">
                {experiencias.map((exp) => {
                  const texto = alergias[exp.evento_id] ?? ''
                  return (
                    <div
                      key={exp.evento_id}
                      data-testid="sn-checkout-experiencias-fecha"
                      data-evento-id={exp.evento_id}
                      className="flex flex-col gap-1 rounded-sn-campo bg-sn-warm p-4 font-sn-texto text-sn-ink"
                    >
                      <p className="m-0 text-sn-cuerpo font-medium">{exp.name}</p>
                      <p className="m-0 text-sn-cuerpo-sm first-letter:uppercase">{fechaYHoraLarga(exp.fecha, exp.hora, exp.hora_fin)}</p>
                      {exp.punto_encuentro && (
                        <p className="m-0 text-sn-cuerpo-sm">
                          <span className="font-medium">Punto de encuentro:</span> {exp.punto_encuentro}
                        </p>
                      )}
                      <p className="m-0 flex items-center justify-between gap-2 text-sn-cuerpo-sm">
                        <span>{textoPersonas(exp.adultos, exp.ninos)}</span>
                        <span className="font-medium">{dinero(subtotalExperiencia(exp))}</span>
                      </p>
                      <Campo
                        etiqueta="Alergias o restricciones de comida (opcional)"
                        tipo="textarea"
                        filas={2}
                        id={`sn-checkout-alergias-${exp.evento_id}`}
                        testId="sn-checkout-experiencias-alergias"
                        value={texto}
                        maxLength={MAX_ALERGIAS_PAGO}
                        onChange={(e) => setAlergias((prev) => ({ ...prev, [exp.evento_id]: e.target.value.slice(0, MAX_ALERGIAS_PAGO) }))}
                        placeholder="Por ejemplo: sin gluten, alergia a la nuez"
                        className="mt-2"
                      />
                      <p className="m-0 text-right text-sn-cuerpo-xs text-sn-ink">
                        {texto.length}/{MAX_ALERGIAS_PAGO}
                      </p>
                    </div>
                  )
                })}
                <p data-testid="sn-checkout-experiencias-pago" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
                  {TEXTO_SOLO_TARJETA}
                </p>
                {/* D-F3-20 P-3 (pregunta C38): la política de reembolso de hoy no se pinta. */}
                <p className="m-0 font-sn-texto text-sn-cuerpo-sm">
                  <Falta que="política de cancelación y reembolso de experiencias" quien="David" />
                </p>
                <p data-testid="sn-checkout-experiencias-maximo" className="m-0 font-sn-texto text-sn-cuerpo-xs text-sn-ink">
                  Máximo {MAX_LUGARES_POR_COMPRA} lugares por fecha. Para cambiar personas, vuelve a elegir la fecha en el calendario.
                </p>
              </Bloque>
            )}

            <Bloque titulo="Método de Pago" idTitulo="sn-checkout-metodo-titulo" testId="sn-checkout-metodo">
              <div className="rounded-sn-campo border border-solid border-sn-border p-4 font-sn-texto text-sn-ink">
                <p className="m-0 text-sn-cuerpo-sm font-medium">Mercado Pago</p>
                <p data-testid="sn-checkout-metodo-detalle" className="m-0 text-sn-cuerpo-sm">
                  {TEXTO_METODO_PAGO_CORTO}
                </p>
              </div>
              {hayProductos && (
                <p data-testid="sn-checkout-metodo-tienda" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
                  {TEXTO_PAGO_TIENDA}
                </p>
              )}

              <section data-testid="sn-checkout-orden" aria-labelledby="sn-checkout-orden-titulo" className="flex flex-col gap-3 rounded-sn-campo bg-sn-warm p-4">
                <h3 id="sn-checkout-orden-titulo" className="m-0 font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-ink">
                  Resumen de la orden
                </h3>
                {canasta ? (
                  <p data-testid="sn-checkout-cupon-no-aplica" className="m-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
                    Los cupones no aplican a los extras de tu suscripción.
                  </p>
                ) : soloExperiencias ? null : (
                  <div data-testid="sn-checkout-cupon" className="flex flex-col gap-2">
                    {cupon ? (
                      <div
                        data-testid="sn-checkout-cupon-aplicado"
                        className="flex items-center justify-between gap-3 rounded-sn-campo border border-solid border-sn-green bg-white px-3 py-2 font-sn-texto text-sn-cuerpo-sm text-sn-green"
                      >
                        <span>
                          Código <span className="font-medium">{cupon.codigo}</span> aplicado
                        </span>
                        <button
                          type="button"
                          data-testid="sn-checkout-cupon-quitar"
                          onClick={() => {
                            setCupon(null)
                            setCodigoCupon('')
                          }}
                          className={unirClases('bg-transparent p-0 font-sn-texto text-sn-cuerpo-sm text-sn-ink underline hover:text-sn-terra', FOCO)}
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={(e) => {
                          // Enter en el campo aplica el código, como hoy (`CheckoutFormSingleStep.tsx:1225`).
                          e.preventDefault()
                          aplicarCupon()
                        }}
                      >
                        <div className="flex items-end gap-2">
                          <Campo
                            etiqueta="¿Tienes un código de descuento?"
                            id="sn-checkout-cupon-campo"
                            testId="sn-checkout-cupon-campo"
                            value={codigoCupon}
                            onChange={(e) => {
                              setCodigoCupon(e.target.value.toUpperCase())
                              setCuponError(null)
                            }}
                            placeholder="Escribe tu código"
                            autoComplete="off"
                            className="min-w-0 flex-1"
                          />
                          <Boton
                            type="submit"
                            variante="contorno"
                            tamano="chico"
                            testId="sn-checkout-cupon-aplicar"
                            deshabilitado={aplicandoCupon || !codigoCupon.trim()}
                            className="mb-[2px] shrink-0"
                          >
                            {aplicandoCupon ? 'Validando…' : 'Aplicar'}
                          </Boton>
                        </div>
                        {cuponError && (
                          <AvisoEnLinea tono="error" testId="sn-checkout-cupon-error">
                            {cuponError}
                          </AvisoEnLinea>
                        )}
                      </form>
                    )}
                    {hayExperiencias && (
                      <p data-testid="sn-checkout-cupon-sin-experiencias" className="m-0 font-sn-texto text-sn-cuerpo-xs text-sn-ink">
                        {TEXTO_SIN_CUPONES_EXPERIENCIAS}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2 font-sn-texto text-sn-cuerpo-sm text-sn-ink">
                  {hayExperiencias ? (
                    <div data-testid="sn-checkout-orden-subtotal" className="flex flex-col gap-2">
                      {hayProductos && (
                        <span className="flex justify-between gap-3">
                          <span>Productos ({productos.length})</span>
                          <span>{dinero(subtotalProductos)}</span>
                        </span>
                      )}
                      <span className="flex justify-between gap-3">
                        <span>Experiencias ({experiencias.length})</span>
                        <span>{dinero(subtotalExperiencias)}</span>
                      </span>
                    </div>
                  ) : (
                    <div data-testid="sn-checkout-orden-subtotal" className="flex justify-between gap-3">
                      <span>
                        Subtotal ({unidadesProductos} {unidadesProductos === 1 ? 'producto' : 'productos'})
                      </span>
                      <span>{dinero(subtotal)}</span>
                    </div>
                  )}
                  {hayProductos && (
                    <div data-testid="sn-checkout-orden-envio" data-gratis={canasta || envio === 0 ? 'si' : 'no'} className="flex justify-between gap-3">
                      <span>Envío</span>
                      <span className={canasta || envio === 0 ? 'font-medium text-sn-green' : undefined}>
                        {canasta ? 'Gratis: va con tu canasta' : envio === 0 ? '¡Felicidades! Tu envío es GRATIS' : dinero(envio)}
                      </span>
                    </div>
                  )}
                  {cupon && (
                    <div data-testid="sn-checkout-orden-descuento" className="flex justify-between gap-3 text-sn-green">
                      <span>Descuento ({cupon.codigo})</span>
                      <span>−{dinero(cupon.descuento)}</span>
                    </div>
                  )}
                  <div
                    data-testid="sn-checkout-orden-total"
                    className="flex justify-between gap-3 border-0 border-t border-solid border-sn-border pt-2 font-sn-titulos text-sn-h6 font-normal"
                  >
                    <span>Total</span>
                    <span>{dinero(total)}</span>
                  </div>
                </div>
              </section>
            </Bloque>

            <div data-testid="sn-checkout-acciones" className="flex flex-col gap-3">
              {bloqueError}
              {cambios && cambios.length > 0 && <AvisoCambios lineas={cambios} />}
              {hayExperiencias && precioActualizado && apartado && (
                <AvisoEnLinea tono="info" testId="sn-checkout-acciones-precio">
                  Actualizamos el precio de tus experiencias con el de la fecha: el total ya es el que vas a pagar.
                </AvisoEnLinea>
              )}
              {apartado && !apartadoVencido && <Reloj venceLocalMs={apartado.vence_local_ms} onVencido={marcarVencido} texto={textos.reloj} />}
              {apartadoVencido && (
                <AvisoEnLinea tono="error" testId="sn-checkout-acciones-vencido">
                  {textos.vencido}
                </AvisoEnLinea>
              )}
              {hayExperiencias ? (
                <>
                  {!apartado && (
                    <Boton
                      anchoCompleto
                      variante="contorno"
                      testId="sn-checkout-acciones-apartar"
                      onClick={apartarLugares}
                      deshabilitado={pagando}
                      cargando={apartando}
                      textoCargando="Apartando…"
                    >
                      {apartadoVencido ? 'Apartar de nuevo' : 'Apartar mis lugares'}
                    </Boton>
                  )}
                  {!apartado && !apartadoVencido && (
                    <p data-testid="sn-checkout-acciones-apartar-ayuda" className="m-0 text-center font-sn-texto text-sn-cuerpo-xs text-sn-ink">
                      Apartamos tus lugares {MINUTOS_APARTADO} minutos; en ese tiempo pagas con tarjeta o saldo de MercadoPago.
                    </p>
                  )}
                  <Boton
                    anchoCompleto
                    testId="sn-checkout-acciones-pagar"
                    onClick={pagarConTarjeta}
                    deshabilitado={!apartado || apartadoVencido}
                    cargando={pagando}
                    textoCargando="Procesando…"
                  >
                    {`Pagar con tarjeta o saldo de MercadoPago ${dinero(total)}`}
                  </Boton>
                </>
              ) : (
                <Boton anchoCompleto testId="sn-checkout-acciones-pagar" onClick={pagarSoloProductos} cargando={cargando} textoCargando="Procesando...">
                  {`Pagar ${dinero(total)}`}
                </Boton>
              )}
            </div>
          </div>

          <TuPedido
            items={lista}
            envio={costoEnvioPagina}
            hayProductos={hayProductos}
            canasta={!!conCanasta}
            recoger={tipoEntrega === 'recoger_almacen'}
            descuento={cupon ? { codigo: cupon.codigo, descuento: cupon.descuento } : null}
          />
        </div>
      </Contenedor>
    </main>
  )
}
