'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import DeliveryDatePicker, { type ZonaEntrega } from '@/components/ui/DeliveryDatePicker'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import RelojApartado, {
  apartadoVigente,
  guardarAlergiasDelApartado,
  guardarApartado,
  leerApartadoGuardado,
  type AlergiasPorFecha,
  type ApartadoConAlergias,
} from '@/components/checkout/RelojApartado'
import { formatFechaMexico, hoyMexico, sumarDias } from '@/lib/dates'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'
import { MapPin, CreditCard, User, Edit2, Calendar, CalendarDays, Tag, PackageX } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { calcularCostoEnvio, subtotalProductos as calcSubtotalProductos } from '@/lib/envio'
import {
  aplicarCambiosDelServidor,
  experienciasDelCarrito,
  firmaCarrito,
  guardarCarrito,
  leerCarrito,
  olvidarApartado,
  vaciarCarrito,
  type ItemCarrito,
} from '@/lib/carrito'
import {
  MAX_LUGARES_POR_COMPRA,
  MINUTOS_APARTADO,
  TEXTO_POLITICA_REEMBOLSO,
  TEXTO_SIN_CUPONES_EXPERIENCIAS,
  TEXTO_SOLO_TARJETA,
  esApartadoVencido,
  esItemExperiencia,
  subtotalExperiencia,
  textoPersonas,
  type ExperienciaParaPagar,
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

interface CheckoutFormProps {
  cartItems: ItemCarrito[]
  onOrderComplete: (orderId: string) => void
  tipoEntrega?: 'envio_domicilio' | 'recoger_almacen'
  costoEnvio?: number
  /** El resumen «Tu pedido» de la página muestra el mismo descuento. */
  onCuponChange?: (cupon: { codigo: string; descuento: number } | null) => void
  /** Extras que viajan con la canasta de una suscripción (SU2): envío $0, sin cupón, fecha de la canasta. */
  conCanasta?: CanastaExtras | null
  /**
   * El servidor quitó o bajó productos del carrito (DR7): los renglones del aviso, o null al limpiarlo. La página lo
   * muestra si el carrito se quedó vacío (entonces este formulario ya no se pinta).
   */
  onCarritoCambio?: (lineas: string[] | null) => void
}

/** Resultado de sincronizar el carrito (apartar). */
type ResultadoSync =
  | { tipo: 'apartado'; apartado: ApartadoConAlergias; token: string | null }
  | { tipo: 'cambio' } // el servidor quitó o bajó algo: se avisó y NO se va a pagar
  | { tipo: 'error' } // el error ya está en pantalla (o se fue a iniciar sesión)

/** Resultado de crear el pago. */
type ResultadoPago = 'redirigido' | 'vencido' | 'error'

/** Una línea de experiencia de `validated_items` con los precios del servidor. */
function esLineaExperiencia(linea: unknown): linea is LineaExperienciaValidada {
  const l = linea as Partial<LineaExperienciaValidada> | null
  return !!l && l.tipo === 'experiencia' && typeof l.evento_id === 'string'
}

const DIRECCION_ALMACEN = 'RECOGER EN ALMACÉN - Calle Gobernador Antonio Díez de Bonilla #37, San Miguel Chapultepec, CDMX'
const MAX_ALERGIAS = 500
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * El texto de error que manda el servidor (FastAPI lo pone en `detail`): una frase, o `{mensaje}` (409 del apartado).
 * Una lista (422 de validación) no es para el cliente.
 */
function textoDelServidor(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const mensaje = (detail as { mensaje?: unknown }).mensaje
    if (typeof mensaje === 'string' && mensaje.trim()) return mensaje
  }
  return null
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const

/** Día de la semana (0 = domingo) de una fecha `AAAA-MM-DD`, sin que la zona del navegador lo corra. */
function diaDeLaSemana(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay()
}

/** `AAAA-MM-DD` → medianoche LOCAL de ese día: la misma forma que usan las celdas de DeliveryDatePicker. */
function fechaLocal(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

/** «sábado, 10 de octubre de 2026 · 07:00–10:00» */
function fechaYHoraLarga(fecha: string, hora: string, horaFin: string | null): string {
  const dia = formatFechaMexico(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${dia} · ${hora}${horaFin ? `–${horaFin}` : ''}`
}

export default function CheckoutFormSingleStep({ cartItems, onOrderComplete, tipoEntrega = 'envio_domicilio', costoEnvio = 0, onCuponChange, conCanasta = null, onCarritoCambio }: CheckoutFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)
  // El resumen verde de la dirección solo es para la que VINO del perfil. Antes dependía del texto vivo: un invitado
  // escribía una letra y el editor (C.P. y calendario) se colapsaba al resumen (R2, sesión 42).
  const [direccionDelPerfil, setDireccionDelPerfil] = useState(false)

  const [customerData, setCustomerData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    codigo_pais: '+52',
    rfc: '',
  })

  // Fecha por defecto: pasado mañana (para dar tiempo de preparación)
  // Entregamos de lunes a viernes y necesitamos un día hábil de preparación.
  // El backend valida lo mismo (services/dias_habiles.py); esto solo propone un
  // default sensato para que el cliente no elija un sábado y reciba un error.
  // «Hoy» = hoyMexico() (TZ1): con toISOString() después de las 18:00 de México ya era «mañana».
  const getDefaultDate = () => {
    let fecha = sumarDias(hoyMexico(), 1)
    while (diaDeLaSemana(fecha) === 0 || diaDeLaSemana(fecha) === 6) {
      fecha = sumarDias(fecha, 1)
    }
    return fecha
  }

  const [deliveryData, setDeliveryData] = useState({
    address: '',
    postal_code: '',
    city: 'CDMX',
    preferred_date: getDefaultDate(),
    notes: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('mercado_pago')
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | null>(null)
  const [zonaEntrega, setZonaEntrega] = useState<ZonaEntrega | null>(null)
  // Código de descuento (N1, 2026-09-27). El backend lo valida con los precios
  // de la BD al aplicarlo y otra vez al pagar; aquí solo se muestra.
  const [codigoCupon, setCodigoCupon] = useState('')
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number; descripcion: string } | null>(null)
  const [cuponError, setCuponError] = useState<string | null>(null)
  const [aplicandoCupon, setAplicandoCupon] = useState(false)

  // ─── Apartado de 10 min (F4 para experiencias; R2/DR7 también para productos) y pago con tarjeta o saldo de MP ──
  const [apartado, setApartado] = useState<ApartadoConAlergias | null>(null)
  const [apartadoVencido, setApartadoVencido] = useState(false)
  const [apartando, setApartando] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null)
  // El correo tiene cuenta (o es del equipo): el error trae el enlace para iniciar sesión (code 'inicia_sesion' del proxy).
  const [errorPideSesion, setErrorPideSesion] = useState(false)
  const [precioActualizado, setPrecioActualizado] = useState(false)
  // DR7: lo que el servidor quitó o bajó del carrito en el último sync (un renglón por producto), o null.
  const [cambiosCarrito, setCambiosCarrito] = useState<string[] | null>(null)
  // AP2: se guardan con el apartado (sessionStorage) y vuelven al regresar de MercadoPago con «atrás».
  const [alergias, setAlergias] = useState<AlergiasPorFecha>({})
  // Token de invitado que dio el sync; solo en memoria. Si se pierde (recarga, «atrás» desde MercadoPago), el proxy
  // pide otro: guest-token reusa al mismo invitado por correo, así que el apartado sigue siendo suyo.
  const [guestToken, setGuestToken] = useState<string | null>(null)

  const experiencias = experienciasDelCarrito(cartItems)
  const productos = cartItems.filter((item) => !esItemExperiencia(item))
  const hayExperiencias = experiencias.length > 0
  const hayProductos = productos.length > 0
  const soloExperiencias = hayExperiencias && !hayProductos
  // Las experiencias se pagan aparte de los extras de una canasta (C3): con experiencias no hay canasta.
  const canasta = hayExperiencias ? null : conCanasta
  // R2: el apartado es del carrito COMPLETO (productos con su cantidad + experiencias).
  const firma = firmaCarrito(cartItems)
  // Reloj y «venció» según lo que se aparta (lugares, productos o los dos): textos del líder (C6).
  const textos = {
    reloj: textoApartado({ hayExperiencias, hayProductos }),
    vencido: textoApartadoVencido({ hayExperiencias, hayProductos }),
  }

  // Función para auto-validar código postal contra API de zonas
  const autoValidatePostalCode = async (cp: string): Promise<ZonaEntrega | null> => {
    if (!cp || cp.length !== 5) return null

    try {
      // Usar el endpoint que devuelve la zona completa, no solo validar
      const response = await fetch(`${API_URL}/api/zonas-entrega/${cp}`)
      if (response.ok) {
        const zona = await response.json()
        // El endpoint devuelve directamente el objeto zona
        if (zona && zona.codigo_postal) {
          return zona
        }
      }
    } catch (error) {
      console.error('Error validando CP automáticamente:', error)
    }
    return null
  }

  // Función para calcular la próxima fecha de entrega disponible (`AAAA-MM-DD`), contando desde el «hoy» de México
  const getNextDeliveryDate = (zona: ZonaEntrega | null): string | null => {
    if (!zona) return null

    const hoy = hoyMexico()
    const tiempoMinimo = zona.tiempo_minimo_dias || 2

    // Empezar desde el tiempo mínimo
    for (let i = tiempoMinimo; i < tiempoMinimo + 14; i++) {
      const fecha = sumarDias(hoy, i)
      // Verificar si ese día tiene entrega
      if (zona[DIAS_SEMANA[diaDeLaSemana(fecha)]]) {
        return fecha
      }
    }
    return null
  }

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.email) {
        try {
          const BACKEND_URL = API_URL
          const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken ?? ''}`
            },
          })

          if (response.ok) {
            const userData = await response.json()

            // Cargar datos personales
            setCustomerData({
              nombre: userData.nombre || session.user.name?.split(' ')[0] || '',
              apellido: userData.apellidos || session.user.name?.split(' ').slice(1).join(' ') || '',
              email: userData.email || session.user.email || '',
              telefono: userData.telefono || '',
              codigo_pais: userData.codigo_pais || '+52',
              rfc: '',
            })

            // Cargar dirección principal si existe
            if (userData.direccion_principal) {
              // Intentar extraer código postal de la dirección (5 dígitos)
              const cpMatch = userData.direccion_principal.match(/\b(\d{5})\b/)
              const extractedCP = cpMatch ? cpMatch[1] : ''

              setDireccionDelPerfil(true)
              setDeliveryData(prev => ({
                ...prev,
                address: userData.direccion_principal,
                postal_code: extractedCP,
                notes: userData.preferencias_entrega?.notas || '',
              }))

              // AUTO-VALIDAR: Si hay CP, validar automáticamente contra API de zonas
              if (extractedCP) {
                const zona = await autoValidatePostalCode(extractedCP)

                if (zona) {
                  setZonaEntrega(zona)

                  // Pre-seleccionar la próxima fecha de entrega disponible
                  const nextDate = getNextDeliveryDate(zona)
                  if (nextDate) {
                    setSelectedDeliveryDate(fechaLocal(nextDate))
                    setDeliveryData(prev => ({
                      ...prev,
                      preferred_date: nextDate
                    }))
                  }
                } else {
                  // CP no tiene cobertura - forzar edición
                  setEditingAddress(true)
                }
              } else {
                // No hay CP en la dirección - forzar edición
                setEditingAddress(true)
              }
            }
          } else {
            // Si falla, usar datos de sesión básicos
            setCustomerData({
              nombre: session.user.name?.split(' ')[0] || '',
              apellido: session.user.name?.split(' ').slice(1).join(' ') || '',
              email: session.user.email || '',
              telefono: '',
              codigo_pais: '+52',
              rfc: '',
            })
          }
        } catch (error) {
          console.error('Error cargando datos del usuario:', error)
          // Usar datos básicos de sesión
          setCustomerData({
            nombre: session.user.name?.split(' ')[0] || '',
            apellido: session.user.name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            telefono: '',
            codigo_pais: '+52',
            rfc: '',
          })
        }
      }
      setLoadingUserData(false)
    }

    loadUserData()
  }, [session])

  // Calcular totales. Una experiencia cuesta adultos × precio + niños × precio de niño (no price × quantity).
  // Una sola fórmula de envío, compartida con el resumen del checkout y con el backend
  // (`services/envio.py`), que es quien manda: recalcula el envío con los
  // precios que lee de la base. El envío y el cupón son solo de los productos.
  const subtotalProductos = calcSubtotalProductos(productos)
  const subtotalExperiencias = experiencias.reduce((sum, exp) => sum + subtotalExperiencia(exp), 0)
  const subtotal = subtotalProductos + subtotalExperiencias
  // Con la canasta el envío es gratis (SU2): el camión ya va.
  const shipping = canasta ? 0 : calcularCostoEnvio(subtotalProductos, tipoEntrega)
  const descuento = cupon?.descuento ?? 0
  const total = subtotal + shipping - descuento

  // Si cambia lo que se compra o el tipo de entrega, el descuento ya no es el
  // mismo: se quita y el cliente lo vuelve a aplicar.
  // Los cupones no aplican a los extras de una suscripción (SU2): elegir la canasta también lo quita.
  // Tampoco a las experiencias (D13-3): un carrito solo de experiencias no lleva cupón.
  useEffect(() => {
    setCupon(null)
  }, [subtotalProductos, shipping, conCanasta, soloExperiencias])

  useEffect(() => {
    onCuponChange?.(cupon ? { codigo: cupon.codigo, descuento: cupon.descuento } : null)
  }, [cupon, onCuponChange])

  // El apartado guardado es de UN carrito (productos con su cantidad + experiencias): si el carrito cambió (otra
  // firma), no sirve. Al volver de MercadoPago con «atrás» (o al recargar) con la misma firma: si sigue vigente, reloj
  // y «Pagar»; si ya venció, el aviso. Las alergias vuelven en los dos casos (AP2): el cliente no las reescribe.
  useEffect(() => {
    if (!firma) {
      setApartado(null)
      setApartadoVencido(false)
      return
    }
    const guardado = leerApartadoGuardado()
    if (guardado && guardado.firma === firma) {
      const guardadas = guardado.alergias ?? {}
      if (Object.keys(guardadas).length > 0) {
        // Lo que ya está en pantalla (p. ej. la página volvió de la memoria del navegador) gana.
        setAlergias((prev) => ({ ...guardadas, ...prev }))
      }
      const vigente = apartadoVigente(cartItems)
      setApartado(vigente)
      setApartadoVencido(!vigente)
      if (!vigente) olvidarApartado()
      return
    }
    if (guardado) olvidarApartado()
    setApartado(null)
    setApartadoVencido(false)
    // `cartItems` cambia de identidad con cada `cartUpdated`: la firma es lo que importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma])

  /**
   * El aviso de «actualizamos tu carrito». Se le pasa a la página EN EL MOMENTO (no en un efecto): si el servidor
   * quitó todo, la página pinta «Tu carrito está vacío» en el mismo render y este formulario ya no corre efectos.
   */
  const avisarCambiosCarrito = (lineas: string[] | null) => {
    setCambiosCarrito(lineas)
    onCarritoCambio?.(lineas)
  }

  // «Atrás» desde MercadoPago con la página guardada en memoria (bfcache): el botón no se queda en «Procesando».
  useEffect(() => {
    const alVolver = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setPagando(false)
        setLoading(false)
      }
    }
    window.addEventListener('pageshow', alVolver)
    return () => window.removeEventListener('pageshow', alVolver)
  }, [])

  const mostrarError = (texto: string | null, pideSesion = false) => {
    setErrorCheckout(texto)
    setErrorPideSesion(pideSesion)
  }

  /** Error del servidor (sync o pago): el `detail` tal cual; si el correo pide sesión, con el enlace. */
  const mostrarErrorDelServidor = (data: { detail?: unknown; code?: unknown }, porOmision: string) => {
    mostrarError(textoDelServidor(data.detail) || porOmision, data.code === 'inicia_sesion')
  }

  const marcarVencido = useCallback(() => {
    olvidarApartado()
    setApartado(null)
    setApartadoVencido(true)
  }, [])

  const aplicarCupon = async () => {
    const codigo = codigoCupon.trim()
    if (!codigo) return
    setAplicandoCupon(true)
    setCuponError(null)
    try {
      const res = await fetch(`${API_URL}/api/cupones/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          tipo_entrega: tipoEntrega,
          // Solo productos: los cupones no aplican a experiencias (D13-3).
          items: productos.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCupon(null)
        setCuponError(
          res.status === 429
            ? 'Demasiados intentos. Espera un minuto y vuelve a probar.'
            : data.detail || 'No se pudo validar el código.'
        )
        return
      }
      setCupon({ codigo: data.codigo, descuento: Number(data.descuento) || 0, descripcion: data.descripcion || '' })
    } catch {
      setCuponError('No se pudo validar el código. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setAplicandoCupon(false)
    }
  }

  const validatePostalCode = (cp: string) => {
    const cpNum = parseInt(cp)
    return cpNum >= 1000 && cpNum <= 16999
  }

  /**
   * La sesión venció (401 de nuestras propias rutas). Se avisa en español y se
   * lleva al login, que volverá aquí por el `callbackUrl`. El carrito NO hay
   * que salvarlo: vive en `localStorage.arcaTierraCart` y esta redirección no
   * lo toca. Nunca se le muestra al cliente el texto del backend.
   */
  const volverAIniciarSesion = () => {
    alert('Tu sesión expiró. Te llevamos a iniciar sesión — tu carrito se conserva.')
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent('/checkout')}`
  }

  /** Los campos de entrega de los productos (los mismos de siempre; con experiencias solo si hay productos). */
  const camposEntrega = () => ({
    delivery_address: tipoEntrega === 'recoger_almacen' ? DIRECCION_ALMACEN : deliveryData.address,
    delivery_postal_code: tipoEntrega === 'recoger_almacen' ? '11850' : deliveryData.postal_code,
    delivery_notes: deliveryData.notes,
    tipo_entrega: canasta ? canasta.tipo_entrega : tipoEntrega,
    costo_envio: canasta ? 0 : costoEnvio,
    // SU2: el backend pone la fecha, el envío y la dirección de la canasta.
    con_suscripcion: canasta?.suscripcion_id,
    // Sin esta fecha el pedido no aparece en el corte del día ni en las
    // etiquetas: el selector ya existía en el formulario pero nunca se
    // enviaba al backend.
    fecha_entrega: canasta ? canasta.fecha_entrega : deliveryData.preferred_date,
    // El backend vuelve a validar el código y calcula el descuento él mismo.
    codigo_cupon: canasta ? undefined : cupon?.codigo,
  })

  const correoDelCliente = () => (session?.user?.email || customerData.email).trim()

  // ─── Validación del formulario (los dos flujos) ───────────────────────────────────────────────────────────────
  /** null = el formulario está completo. */
  const faltaEnElFormulario = (): string | null => {
    const email = correoDelCliente()
    if (!email || !CORREO_VALIDO.test(email)) return 'Escribe un correo válido.'
    if (!customerData.nombre.trim() || !customerData.apellido.trim() || !customerData.telefono) {
      return 'Completa tu nombre, apellido y teléfono.'
    }
    // Con la canasta (SU2) la dirección, la zona y la fecha las pone el backend.
    if (hayProductos && !canasta) {
      if (!deliveryData.address) return hayExperiencias ? 'Completa la dirección de entrega de tus productos.' : 'Completa la dirección de entrega.'
      if (!zonaEntrega) return 'El código postal no tiene cobertura de entrega. Verifica tu código postal.'
      if (!selectedDeliveryDate) return hayExperiencias ? 'Elige el día de entrega de tus productos.' : 'Elige el día de entrega.'
    }
    return null
  }

  /** El precio del servidor manda: si una fecha cambió de precio, el carrito (y los dos resúmenes) se corrigen. */
  const actualizarPrecios = (lineas: unknown[]) => {
    const porEvento = new Map<string, LineaExperienciaValidada>()
    for (const l of lineas || []) {
      if (esLineaExperiencia(l) && typeof l.precio_adulto === 'number' && typeof l.precio_nino === 'number') {
        porEvento.set(l.evento_id, l)
      }
    }
    let cambio = false
    const items = leerCarrito().map((item) => {
      if (!esItemExperiencia(item)) return item
      const l = porEvento.get(item.evento_id)
      if (!l || (Math.abs(l.precio_adulto - item.price) < 0.005 && Math.abs(l.precio_nino - item.precio_nino) < 0.005)) {
        return item
      }
      cambio = true
      return { ...item, price: l.precio_adulto, precio_nino: l.precio_nino }
    })
    if (cambio) guardarCarrito(items) // no cambia la firma (cantidades, fechas, adultos, niños): el apartado sigue
    setPrecioActualizado(cambio)
  }

  // ─── Paso 1 (los dos flujos): sincronizar el carrito = apartar productos y lugares 10 minutos (§3.3) ─────────
  /**
   * POST /api/cart/sync-and-validate. Si el servidor quitó o bajó productos (`carritoCambio`), se aplican al carrito,
   * se avisa y NO se va a pagar: el cliente revisa. El apartado que el servidor ya dio (con lo que sí alcanzó) se
   * guarda atado al carrito ajustado, así el siguiente «Pagar» no vuelve a apartar.
   */
  const sincronizar = async (): Promise<ResultadoSync> => {
    const items = cartItems.map((item) =>
      esItemExperiencia(item)
        ? {
            tipo: 'experiencia' as const,
            id: item.evento_id,
            evento_id: item.evento_id,
            adultos: item.adultos,
            ninos: item.ninos,
            quantity: item.adultos + item.ninos,
            // Solo para los mensajes de error y el histórico de carrito_items (el back cotiza por evento_id).
            name: item.name,
          }
        : item
    )
    const res = await fetch('/api/cart/sync-and-validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: correoDelCliente(),
        // Para que el proxy cree al invitado con sus datos (guest-token).
        nombre: customerData.nombre,
        apellidos: customerData.apellido,
        telefono: customerData.telefono,
        items,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) {
      volverAIniciarSesion()
      return { tipo: 'error' }
    }
    if (!res.ok) {
      if (esApartadoVencido(data.detail)) {
        marcarVencido()
        return { tipo: 'error' }
      }
      // 409 sin lugares, 400 (fecha que ya no se vende, más de 10…), «tiene cuenta»: el texto del servidor tal cual.
      mostrarErrorDelServidor(
        data,
        hayExperiencias ? 'No pudimos apartar tus lugares. Intenta de nuevo.' : 'No pudimos validar tu carrito. Intenta de nuevo.'
      )
      return { tipo: 'error' }
    }
    const respuesta = data as SyncCarritoRespuesta & { _guest_token?: string }
    const token = respuesta._guest_token ?? null
    setGuestToken(token)
    actualizarPrecios(respuesta.validated_items)

    if (carritoCambio(respuesta)) {
      // El carrito lateral y los dos resúmenes dejan de sumar lo quitado (lib/carrito dispara `cartUpdated`).
      const ajustado = aplicarCambiosDelServidor(respuesta)
      avisarCambiosCarrito(textoCambiosCarrito(respuesta))
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
    const guardado = guardarApartado(respuesta.apartado, cartItems, alergias)
    setApartado(guardado)
    setApartadoVencido(false)
    return { tipo: 'apartado', apartado: guardado, token }
  }

  // ─── Paso 2 (los dos flujos): crear el pago con el apartado (§3.4) ───────────────────────────────────────────
  const crearPreferencia = async (vigente: ApartadoConAlergias, token: string | null): Promise<ResultadoPago> => {
    const experienciasParaPagar: ExperienciaParaPagar[] = experiencias.map((exp) => ({
      tipo: 'experiencia',
      evento_id: exp.evento_id,
      adultos: exp.adultos,
      ninos: exp.ninos,
      alergias: (alergias[exp.evento_id] ?? '').trim().slice(0, MAX_ALERGIAS) || null,
    }))
    const rfc = customerData.rfc.trim().toUpperCase()
    const body: Record<string, unknown> = {
      // Los productos van como siempre ({id, quantity}); el backend relee precio y stock de la base y exige que
      // las cantidades sean las del apartado.
      items: [
        ...productos.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
        ...experienciasParaPagar,
      ],
      apartado_id: vigente.id,
      email: correoDelCliente(),
      nombre: customerData.nombre,
      apellido: customerData.apellido,
      telefono: customerData.telefono,
      codigo_pais: customerData.codigo_pais,
      // TEL1: el RFC solo si el cliente lo escribió (el backend valida el formato).
      ...(rfc ? { rfc } : {}),
      // Solo experiencias: SIN fecha_entrega, delivery_*, tipo_entrega ni codigo_cupon (C3).
      ...(hayProductos ? camposEntrega() : {}),
    }
    if (token) body._guest_token = token

    // AP2: si el cliente vuelve de MercadoPago con «atrás», las alergias siguen ahí.
    guardarAlergiasDelApartado(alergias)

    const res = await fetch('/api/crear-preferencia-pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await res.json().catch(() => ({}))
    // La sesión pudo morir entre el apartado y el pago.
    if (res.status === 401) {
      volverAIniciarSesion()
      return 'redirigido'
    }
    if (res.status === 409 && esApartadoVencido(result.detail)) return 'vencido'
    if (!res.ok) {
      // Un 400 trae un mensaje para el cliente (código vencido o ya usado, fecha de entrega…). Si había código,
      // se quita para que vea el total real.
      if (res.status === 400 && cupon) setCupon(null)
      if (!hayExperiencias && res.status === 400 && textoDelServidor(result.detail)) {
        mostrarError(`No se pudo completar el pago: ${textoDelServidor(result.detail)}`)
      } else {
        mostrarErrorDelServidor(result, 'No pudimos crear tu pago. Intenta de nuevo.')
      }
      return 'error'
    }
    // Pedido sin costo: el backend no llamó a MercadoPago (MP no procesa importes de cero). El pedido ya quedó
    // 'pagado': se va directo al comprobante.
    if (result.sin_costo) {
      vaciarCarrito()
      window.location.href = result.redirect_url || `/pago-exitoso?pedido=${result.numero_pedido}&sin_costo=1`
      return 'redirigido'
    }
    const url = result.payment_url || result.init_point
    if (!url) {
      mostrarError('No pudimos crear tu pago. Intenta de nuevo.')
      return 'error'
    }
    // El apartado se queda en sessionStorage: si el cliente vuelve con «atrás», sigue el reloj.
    window.location.href = url
    return 'redirigido'
  }

  // ─── Solo productos: UN botón (sync → pago); con el apartado vigente de este carrito va directo al pago ──────
  const pagarSoloProductos = async () => {
    const falta = faltaEnElFormulario()
    if (falta) {
      mostrarError(falta)
      return
    }
    mostrarError(null)
    avisarCambiosCarrito(null)
    setLoading(true)
    let redirigiendo = false
    try {
      let vigente = apartado && !apartadoVencido ? apartadoVigente(cartItems) : null
      let token = guestToken
      // Un 409 `apartado_vencido` (venció o cambió algo) re-sincroniza UNA vez y vuelve a intentar el pago.
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
        // 409: sin mostrar «venció» todavía (se re-sincroniza en silencio).
        olvidarApartado()
        setApartado(null)
        vigente = null
      }
      // Dos 409 seguidos: el aviso de «venció» y el botón para volver a intentar.
      marcarVencido()
    } catch {
      mostrarError('No pudimos conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      if (!redirigiendo) setLoading(false)
    }
  }

  // ─── Con experiencias: (1) apartar mis lugares → (2) pagar con tarjeta o saldo de MercadoPago ────────────────
  const apartarLugares = async () => {
    const falta = faltaEnElFormulario()
    if (falta) {
      mostrarError(falta)
      return
    }
    mostrarError(null)
    avisarCambiosCarrito(null)
    setApartando(true)
    try {
      await sincronizar()
    } catch {
      mostrarError('No pudimos conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setApartando(false)
    }
  }

  const pagarConTarjeta = async () => {
    if (!apartado || apartadoVencido) return
    const falta = faltaEnElFormulario()
    if (falta) {
      mostrarError(falta)
      return
    }
    mostrarError(null)
    avisarCambiosCarrito(null)
    setPagando(true)
    let redirigiendo = false
    try {
      const pago = await crearPreferencia(apartado, guestToken)
      if (pago === 'redirigido') redirigiendo = true
      // Como en la Fase 4a: «Apartar de nuevo» (el cliente vuelve a sincronizar con un clic).
      if (pago === 'vencido') marcarVencido()
    } catch {
      mostrarError('No pudimos conectar. Revisa tu conexión e intenta de nuevo.')
    } finally {
      if (!redirigiendo) setPagando(false)
    }
  }

  // Errores del servidor y de validación de los pasos, en la pantalla (no en un alert).
  const bloqueError = errorCheckout && (
    <div className="rounded-lg bg-rojo-bg p-3 text-sm text-rojo" role="alert" data-testid="checkout-error">
      <p>{errorCheckout}</p>
      {errorPideSesion && (
        <a
          href={`/auth/signin?callbackUrl=${encodeURIComponent('/checkout')}`}
          className="mt-1 inline-block font-medium underline"
          data-testid="checkout-error-sesion"
        >
          Iniciar sesión (tu carrito se conserva)
        </a>
      )}
    </div>
  )

  // DR7: el servidor quitó o bajó productos. El carrito ya se corrigió; el cliente revisa y vuelve a pagar.
  const avisoCambios = cambiosCarrito && cambiosCarrito.length > 0 && (
    <div
      className="rounded-lg border border-amarillo bg-amarillo-bg p-3 text-sm text-verde-tipografia"
      role="alert"
      data-testid="checkout-carrito-cambio"
    >
      <p className="flex items-start gap-2 font-medium">
        <PackageX className="mt-0.5 h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
        {TEXTO_CARRITO_CAMBIO}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        {cambiosCarrito.map((linea) => (
          <li key={linea} data-testid="checkout-carrito-cambio-linea">{linea}</li>
        ))}
      </ul>
    </div>
  )

  if (loadingUserData) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#B15543] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#33503E] mb-2">Finalizar Compra</h2>
        <p className="text-sm text-gray-600">
          {hayExperiencias
            ? 'Completa tus datos, aparta tus lugares y paga con tarjeta o saldo de MercadoPago'
            : session?.user?.email ? 'Verifica tus datos y confirma tu pedido' : 'Completa tus datos para continuar'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Información Personal */}
        <div className="border-b pb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Información Personal</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="checkout-nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <Input
                id="checkout-nombre"
                value={customerData.nombre}
                onChange={(e) => setCustomerData({...customerData, nombre: e.target.value})}
                placeholder="Tu nombre"
                autoComplete="given-name"
                required
              />
            </div>

            <div>
              <label htmlFor="checkout-apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <Input
                id="checkout-apellido"
                value={customerData.apellido}
                onChange={(e) => setCustomerData({...customerData, apellido: e.target.value})}
                placeholder="Tu apellido"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de país *
              </label>
              <CountryCodeSelector
                value={customerData.codigo_pais}
                onChange={(dialCode) => setCustomerData({...customerData, codigo_pais: dialCode})}
              />
            </div>

            <div>
              <label htmlFor="checkout-telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <Input
                id="checkout-telefono"
                value={customerData.telefono}
                onChange={(e) => setCustomerData({...customerData, telefono: e.target.value.replace(/\D/g, '')})}
                placeholder="1234567890"
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel-national"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              id="checkout-email"
              value={customerData.email}
              onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
              placeholder="tu@email.com"
              type="email"
              autoComplete="email"
              required
              disabled={!!session?.user?.email}
              className={session?.user?.email ? "bg-gray-100" : ""}
            />
            {session?.user?.email && (
              <p className="text-xs text-gray-500 mt-1">
                Email de tu cuenta iniciada
              </p>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="checkout-rfc" className="block text-sm font-medium text-gray-700 mb-1">
              RFC (opcional)
            </label>
            <Input
              id="checkout-rfc"
              data-testid="checkout-rfc"
              value={customerData.rfc}
              onChange={(e) => setCustomerData({...customerData, rfc: e.target.value.toUpperCase()})}
              placeholder="XAXX010101000"
              maxLength={13}
            />
            <p className="text-xs text-gray-500 mt-1">
              Requerido solo si necesitas factura fiscal
            </p>
          </div>
        </div>

        {/* Dirección de Entrega (solo si hay productos: las experiencias no se envían) */}
        {hayProductos && (
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#B15543]" />
              <h3 className="text-lg font-semibold">{hayExperiencias ? 'Entrega de tus productos' : 'Dirección de Entrega'}</h3>
            </div>
            {direccionDelPerfil && deliveryData.address && !editingAddress && !canasta && (
              <button
                onClick={() => setEditingAddress(true)}
                className="flex items-center gap-1 text-sm text-[#B15543] hover:text-[#9a4a3a]"
              >
                <Edit2 className="w-4 h-4" />
                Cambiar
              </button>
            )}
          </div>

          {canasta ? (
            // SU2: con la canasta la dirección es la principal del cliente, la misma con la que el
            // corte manda su canasta (el backend la pone). Pedir otra aquí sería mentirle.
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800" data-testid="direccion-canasta">
              <p className="flex items-center gap-2 font-medium" data-testid="fecha-canasta">
                <Calendar className="w-5 h-5" />
                Llega con tu canasta el {formatFechaMexico(canasta.fecha_entrega, { weekday: 'long', day: 'numeric', month: 'long', year: undefined })}
              </p>
              <p className="mt-1">Se entrega junto con tu canasta, en la misma dirección donde la recibes.</p>
              <label htmlFor="checkout-notas-canasta" className="mt-3 block text-sm font-medium text-gray-700">Notas de entrega (opcional)</label>
              <textarea
                id="checkout-notas-canasta"
                value={deliveryData.notes}
                onChange={(e) => setDeliveryData({...deliveryData, notes: e.target.value})}
                placeholder="Instrucciones especiales para la entrega"
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg resize-none bg-white text-gray-800"
                rows={2}
              />
            </div>
          ) : (!direccionDelPerfil || !deliveryData.address || editingAddress) ? (
            <>
              <div className="mb-4">
                <label htmlFor="checkout-direccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección completa *
                </label>
                <Input
                  id="checkout-direccion"
                  value={deliveryData.address}
                  onChange={(e) => setDeliveryData({...deliveryData, address: e.target.value})}
                  placeholder="Calle, número, colonia"
                  autoComplete="street-address"
                  required
                />
              </div>

              {/* Selector de Código Postal ÉPICO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona de entrega *
                </label>
                <PostalCodeSelector
                  value={deliveryData.postal_code}
                  onChange={(cp, zona) => {
                    setDeliveryData({...deliveryData, postal_code: cp})
                    setZonaEntrega(zona)
                    // Limpiar fecha si cambia la zona
                    if (!zona) {
                      setSelectedDeliveryDate(null)
                    }
                  }}
                />
              </div>

              {/* Selector de fecha de entrega - Solo si hay zona seleccionada */}
              {zonaEntrega && !canasta && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-green-700" />
                    <label className="text-sm font-medium text-gray-700">
                      Selecciona tu día de entrega
                    </label>
                  </div>
                  <DeliveryDatePicker
                    codigoPostal={deliveryData.postal_code}
                    selectedDate={selectedDeliveryDate}
                    onDateSelect={(date, _zona, iso) => {
                      setSelectedDeliveryDate(date)
                      // TZ1b: el día elegido tal cual (`AAAA-MM-DD`); `toISOString()` lo corría fuera de UTC-6.
                      if (date && iso) {
                        setDeliveryData((prev) => ({ ...prev, preferred_date: iso }))
                      }
                    }}
                  />
                </div>
              )}

              <div className="mt-4">
                <label htmlFor="checkout-notas" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas de entrega (opcional)
                </label>
                <textarea
                  id="checkout-notas"
                  value={deliveryData.notes}
                  onChange={(e) => setDeliveryData({...deliveryData, notes: e.target.value})}
                  placeholder="Instrucciones especiales para la entrega"
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              {editingAddress && (
                <button
                  onClick={() => setEditingAddress(false)}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Guardar cambios
                </button>
              )}
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">{deliveryData.address}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                {deliveryData.postal_code && (
                  <p><span className="font-medium">CP:</span> {deliveryData.postal_code}</p>
                )}
                {deliveryData.preferred_date && (
                  <p><span className="font-medium">Entrega:</span> {formatFechaMexico(deliveryData.preferred_date, { day: 'numeric', month: 'long', year: undefined })}</p>
                )}
              </div>
              {deliveryData.notes && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Notas:</span> {deliveryData.notes}
                </p>
              )}
            </div>
          )}
        </div>
        )}

        {/* Experiencias: por fecha, con alergias (F4) */}
        {hayExperiencias && (
          <section className="border-b pb-6" data-testid="checkout-experiencias" aria-labelledby="checkout-titulo-experiencias">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-[#B15543]" />
              <h3 id="checkout-titulo-experiencias" className="text-lg font-semibold">Tus experiencias</h3>
            </div>
            <div className="space-y-4">
              {experiencias.map((exp) => {
                const idAlergias = `checkout-alergias-${exp.evento_id}`
                const texto = alergias[exp.evento_id] ?? ''
                return (
                  <div
                    key={exp.evento_id}
                    className="rounded-lg border border-neutro-borde bg-neutro-light p-4"
                    data-testid={`checkout-exp-${exp.evento_id}`}
                  >
                    <p className="font-semibold text-verde">{exp.name}</p>
                    <p className="text-sm text-gray-700 first-letter:uppercase" data-testid="checkout-exp-fecha">
                      {fechaYHoraLarga(exp.fecha, exp.hora, exp.hora_fin)}
                    </p>
                    {exp.punto_encuentro && (
                      <p className="text-sm text-gray-700" data-testid="checkout-exp-punto">
                        <span className="font-medium">Punto de encuentro:</span> {exp.punto_encuentro}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between gap-2 text-sm">
                      <span data-testid="checkout-exp-personas">{textoPersonas(exp.adultos, exp.ninos)}</span>
                      <span className="font-medium" data-testid="checkout-exp-subtotal">${subtotalExperiencia(exp).toFixed(2)}</span>
                    </div>
                    <label htmlFor={idAlergias} className="mt-3 mb-1 block text-sm font-medium text-gray-700">
                      Alergias o restricciones de comida (opcional)
                    </label>
                    <textarea
                      id={idAlergias}
                      data-testid={idAlergias}
                      value={texto}
                      maxLength={MAX_ALERGIAS}
                      onChange={(e) => setAlergias((prev) => ({ ...prev, [exp.evento_id]: e.target.value.slice(0, MAX_ALERGIAS) }))}
                      placeholder="Por ejemplo: sin gluten, alergia a la nuez"
                      className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm resize-none"
                      rows={2}
                    />
                    <p className="text-right text-xs text-gray-500">{texto.length}/{MAX_ALERGIAS}</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 space-y-1 text-sm text-verde-tipografia">
              <p data-testid="checkout-solo-tarjeta" className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
                {TEXTO_SOLO_TARJETA}
              </p>
              <p data-testid="checkout-politica-reembolso">{TEXTO_POLITICA_REEMBOLSO}</p>
              <p className="text-xs text-gray-500">
                Máximo {MAX_LUGARES_POR_COMPRA} lugares por fecha. Para cambiar personas, vuelve a elegir la fecha en el calendario.
              </p>
            </div>
          </section>
        )}

        {/* Método de Pago */}
        <div className="pb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-[#B15543]" />
            <h3 className="text-lg font-semibold">Método de Pago</h3>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="mercado_pago"
                checked={paymentMethod === 'mercado_pago'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-[#B15543]"
              />
              <div>
                <div className="font-medium">Mercado Pago</div>
                {/* DR7-b: la tienda, las experiencias y los extras con canasta se pagan igual (sin efectivo ni OXXO). */}
                <div className="text-sm text-gray-500" data-testid="metodo-pago-detalle">
                  {TEXTO_METODO_PAGO_CORTO}
                </div>
              </div>
            </label>
          </div>
          {hayProductos && (
            <p className="mt-2 flex items-start gap-2 text-sm text-verde-tipografia" data-testid="checkout-pago-tienda">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-terracota" aria-hidden="true" />
              {TEXTO_PAGO_TIENDA}
            </p>
          )}

          {/* Resumen de la orden */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-3">Resumen de la orden</h4>
            {canasta ? (
              <p className="mb-4 text-sm text-gray-600" data-testid="cupon-no-aplica">
                Los cupones no aplican a los extras de tu suscripción.
              </p>
            ) : soloExperiencias ? null : (
            <div className="mb-4" data-testid="cupon">
              {cupon ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm" data-testid="cupon-aplicado">
                  <span className="flex items-center gap-2 text-green-800">
                    <Tag className="w-4 h-4" />
                    Código <strong>{cupon.codigo}</strong> aplicado
                  </span>
                  <button
                    type="button"
                    onClick={() => { setCupon(null); setCodigoCupon('') }}
                    className="text-gray-600 underline hover:text-gray-800"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="codigo-cupon" className="block text-sm font-medium mb-1">
                    ¿Tienes un código de descuento?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo-cupon"
                      data-testid="cupon-input"
                      value={codigoCupon}
                      onChange={(e) => { setCodigoCupon(e.target.value.toUpperCase()); setCuponError(null) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aplicarCupon() } }}
                      placeholder="Escribe tu código"
                      autoComplete="off"
                      className="flex-1 min-w-0 bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="cupon-aplicar"
                      onClick={aplicarCupon}
                      disabled={aplicandoCupon || !codigoCupon.trim()}
                    >
                      {aplicandoCupon ? 'Validando…' : 'Aplicar'}
                    </Button>
                  </div>
                  {cuponError && (
                    <p className="mt-1 text-sm text-[#B15543]" role="alert" data-testid="cupon-error">{cuponError}</p>
                  )}
                </>
              )}
              {hayExperiencias && (
                <p className="mt-2 text-xs text-gray-600" data-testid="cupon-sin-experiencias">{TEXTO_SIN_CUPONES_EXPERIENCIAS}</p>
              )}
            </div>
            )}
            <div className="space-y-2 text-sm">
              {hayExperiencias ? (
                <>
                  {hayProductos && (
                    <div className="flex justify-between">
                      <span>Productos ({productos.length})</span>
                      <span>${subtotalProductos.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Experiencias ({experiencias.length})</span>
                    <span>${subtotalExperiencias.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} productos)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              )}
              {hayProductos && (
                <div className="flex justify-between gap-2">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium text-right" data-testid="envio-orden">
                    {canasta ? 'Gratis: va con tu canasta' : shipping === 0 ? '¡Felicidades! Tu envío es GRATIS' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              )}
              {cupon && (
                <div className="flex justify-between text-green-700" data-testid="cupon-descuento">
                  <span>Descuento ({cupon.codigo})</span>
                  <span>−${cupon.descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span data-testid="total-orden">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {hayExperiencias ? (
          /* Dos pasos: apartar (reloj de 10 min) y pagar con tarjeta */
          <div className="space-y-3" data-testid="checkout-pasos">
            {bloqueError}
            {avisoCambios}
            {precioActualizado && apartado && (
              <p className="rounded-lg bg-azul-bg p-3 text-sm text-azul" role="status" data-testid="checkout-precio-actualizado">
                Actualizamos el precio de tus experiencias con el de la fecha: el total ya es el que vas a pagar.
              </p>
            )}
            {apartado && !apartadoVencido && (
              <RelojApartado venceLocalMs={apartado.vence_local_ms} onVencido={marcarVencido} texto={textos.reloj} />
            )}
            {apartadoVencido && (
              <p className="rounded-lg border border-rojo bg-rojo-bg p-4 text-sm text-rojo" role="alert" data-testid="apartado-vencido">
                {textos.vencido}
              </p>
            )}
            {!apartado && (
              <Button
                onClick={apartarLugares}
                disabled={apartando || pagando}
                data-testid="checkout-apartar"
                className="w-full h-auto whitespace-normal bg-[#33503E] hover:bg-[#1F3024] text-white text-lg py-4"
              >
                {apartando ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                    Apartando…
                  </span>
                ) : apartadoVencido ? 'Apartar de nuevo' : 'Apartar mis lugares'}
              </Button>
            )}
            {!apartado && !apartadoVencido && (
              <p className="text-center text-xs text-gray-500" data-testid="checkout-apartar-ayuda">
                Apartamos tus lugares {MINUTOS_APARTADO} minutos; en ese tiempo pagas con tarjeta o saldo de MercadoPago.
              </p>
            )}
            <Button
              onClick={pagarConTarjeta}
              disabled={!apartado || apartadoVencido || pagando}
              data-testid="checkout-pagar"
              className="w-full h-auto whitespace-normal bg-[#B15543] hover:bg-[#9a4a3a] text-white text-lg py-4"
            >
              {pagando ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                  Procesando…
                </span>
              ) : (
                `Pagar con tarjeta o saldo de MercadoPago $${total.toFixed(2)}`
              )}
            </Button>
          </div>
        ) : (
        /* Solo productos: un botón (aparta 10 min y va a pagar) */
        <div className="space-y-3" data-testid="checkout-pago-productos">
        {bloqueError}
        {avisoCambios}
        {apartado && !apartadoVencido && (
          <RelojApartado venceLocalMs={apartado.vence_local_ms} onVencido={marcarVencido} texto={textos.reloj} />
        )}
        {apartadoVencido && (
          <p className="rounded-lg border border-rojo bg-rojo-bg p-4 text-sm text-rojo" role="alert" data-testid="apartado-vencido">
            {textos.vencido}
          </p>
        )}
        <Button
          onClick={pagarSoloProductos}
          data-testid="checkout-pagar-productos"
          disabled={loading || !customerData.nombre || !customerData.apellido || !customerData.telefono ||
                   (!canasta && (!deliveryData.address || !zonaEntrega || !selectedDeliveryDate))}
          className="w-full h-auto whitespace-normal bg-[#B15543] hover:bg-[#9a4a3a] text-white text-lg py-6"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </div>
          ) : (
            `Pagar $${total.toFixed(2)}`
          )}
        </Button>
        </div>
        )}
      </div>
    </div>
  )
}
