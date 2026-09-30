'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import DeliveryDatePicker from '@/components/ui/DeliveryDatePicker'
import type { CanastaExtras } from '@/components/ui/ConMiCanasta'
import RelojApartado, { apartadoVigente, guardarApartado, leerApartadoGuardado } from '@/components/checkout/RelojApartado'
import { formatFechaMexico, hoyMexico, sumarDias } from '@/lib/dates'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'
import { MapPin, CreditCard, User, Edit2, Calendar, CalendarDays, Tag } from 'lucide-react'
import { API_URL } from '@/lib/api'
import { calcularCostoEnvio, subtotalProductos as calcSubtotalProductos } from '@/lib/envio'
import { experienciasDelCarrito, guardarCarrito, leerCarrito, olvidarApartado, vaciarCarrito } from '@/lib/carrito'
import {
  MAX_LUGARES_POR_COMPRA,
  MINUTOS_APARTADO,
  TEXTO_APARTADO_VENCIDO,
  TEXTO_POLITICA_REEMBOLSO,
  TEXTO_SIN_CUPONES_EXPERIENCIAS,
  TEXTO_SOLO_TARJETA,
  esApartadoVencido,
  esItemExperiencia,
  firmaCarritoExperiencias,
  subtotalExperiencia,
  textoPersonas,
  type ApartadoGuardado,
  type ExperienciaParaPagar,
  type LineaExperienciaValidada,
  type SyncValidateResponse,
} from '@/types/compra-experiencias'

interface CheckoutFormProps {
  cartItems: any[]
  onOrderComplete: (orderId: string) => void
  tipoEntrega?: 'envio_domicilio' | 'recoger_almacen'
  costoEnvio?: number
  /** El resumen «Tu pedido» de la página muestra el mismo descuento. */
  onCuponChange?: (cupon: { codigo: string; descuento: number } | null) => void
  /** Extras que viajan con la canasta de una suscripción (SU2): envío $0, sin cupón, fecha de la canasta. */
  conCanasta?: CanastaExtras | null
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

export default function CheckoutFormSingleStep({ cartItems, onOrderComplete, tipoEntrega = 'envio_domicilio', costoEnvio = 0, onCuponChange, conCanasta = null }: CheckoutFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [editingAddress, setEditingAddress] = useState(false)

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
  const [zonaEntrega, setZonaEntrega] = useState<any>(null)
  // Código de descuento (N1, 2026-09-27). El backend lo valida con los precios
  // de la BD al aplicarlo y otra vez al pagar; aquí solo se muestra.
  const [codigoCupon, setCodigoCupon] = useState('')
  const [cupon, setCupon] = useState<{ codigo: string; descuento: number; descripcion: string } | null>(null)
  const [cuponError, setCuponError] = useState<string | null>(null)
  const [aplicandoCupon, setAplicandoCupon] = useState(false)

  // ─── Experiencias (F4, Fase 4 de PLAN-EXP-SIN-FALLAS): apartar 10 min y pagar con tarjeta ──────────────────
  const [apartado, setApartado] = useState<ApartadoGuardado | null>(null)
  const [apartadoVencido, setApartadoVencido] = useState(false)
  const [apartando, setApartando] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null)
  // El correo tiene cuenta (o es del equipo): el error trae el enlace para iniciar sesión (code 'inicia_sesion' del proxy).
  const [errorPideSesion, setErrorPideSesion] = useState(false)
  const [precioActualizado, setPrecioActualizado] = useState(false)
  const [alergias, setAlergias] = useState<Record<string, string>>({})
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
  const firma = firmaCarritoExperiencias(cartItems)

  // Función para auto-validar código postal contra API de zonas
  const autoValidatePostalCode = async (cp: string) => {
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
  const getNextDeliveryDate = (zona: any): string | null => {
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
              'Authorization': `Bearer ${(session as any).accessToken}`
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

  // El apartado guardado es de UNAS experiencias: si el carrito cambió (otra firma), no sirve. Al volver de
  // MercadoPago con «atrás» (o al recargar) con la misma firma: si sigue vigente, reloj y «Pagar»; si ya venció, el aviso.
  useEffect(() => {
    if (!firma) {
      setApartado(null)
      setApartadoVencido(false)
      return
    }
    const guardado = leerApartadoGuardado()
    if (guardado && guardado.firma === firma) {
      const vigente = apartadoVigente(experiencias)
      setApartado(vigente)
      setApartadoVencido(!vigente)
      if (!vigente) olvidarApartado()
      return
    }
    if (guardado) olvidarApartado()
    setApartado(null)
    setApartadoVencido(false)
    // `experiencias` sale de cartItems y cambia de identidad en cada render: la firma es lo que importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma])

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

  // ─── Solo productos: el flujo de siempre (un botón) ──────────────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    const email = correoDelCliente()
    if (!email) {
      alert('Por favor proporciona un email válido')
      return
    }

    if (!customerData.nombre || !customerData.apellido || !customerData.telefono) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    if (!canasta && !deliveryData.address) {
      alert('Por favor completa la dirección de entrega')
      return
    }

    if (!canasta && !zonaEntrega) {
      alert('El código postal no tiene cobertura de entrega. Por favor verifica tu código postal.')
      return
    }

    if (!canasta && !selectedDeliveryDate) {
      alert('Por favor selecciona una fecha de entrega')
      return
    }

    mostrarError(null)
    setLoading(true)

    try {
      // Usa proxy local que inyecta JWT desde la sesion
      const syncResponse = await fetch(`/api/cart/sync-and-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          // Para que el proxy cree al invitado con sus datos (guest-token).
          nombre: customerData.nombre,
          apellidos: customerData.apellido,
          telefono: customerData.telefono,
          items: cartItems
        })
      })

      if (!syncResponse.ok) {
        const error = await syncResponse.json().catch(() => ({}))
        if (syncResponse.status === 401) {
          volverAIniciarSesion()
          return
        }
        // En la pantalla (checkout-error), no en un alert: p. ej. «Este email tiene cuenta registrada…» + enlace.
        mostrarErrorDelServidor(error, 'No se pudo validar el carrito. Intenta de nuevo.')
        setLoading(false)
        return
      }

      const syncResult = await syncResponse.json()
      const { validated_items, _guest_token } = syncResult

      // NO agregar envío aquí - el backend lo agrega como item separado
      // basándose en costo_envio para evitar duplicación
      const paymentData: Record<string, unknown> = {
        items: validated_items,
        email: email,
        nombre: customerData.nombre,
        apellido: customerData.apellido,
        telefono: customerData.telefono,
        codigo_pais: customerData.codigo_pais,
        ...camposEntrega(),
      }

      // Si fue guest checkout, pasar el token al siguiente paso para reusarlo
      if (_guest_token) {
        paymentData._guest_token = _guest_token
      }

      // Usa proxy local que inyecta JWT desde la sesion
      const response = await fetch(`/api/crear-preferencia-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json().catch(() => ({}))

      // La sesión pudo morir entre la validación del carrito y el pago.
      if (response.status === 401) {
        volverAIniciarSesion()
        return
      }

      // Un 400 trae un mensaje para el cliente (código vencido o ya usado, stock,
      // fecha de entrega). Si había código, se quita para que vea el total real.
      if (response.status === 400 && result.detail) {
        if (cupon) setCupon(null)
        mostrarError(`No se pudo completar el pago: ${textoDelServidor(result.detail) || 'revisa tu pedido e intenta de nuevo.'}`)
        return
      }
      if (!response.ok && textoDelServidor(result.detail)) {
        mostrarErrorDelServidor(result, 'No se pudo completar el pago. Intenta de nuevo.')
        return
      }

      // Pedido sin costo: el backend no llamó a MercadoPago porque el total es
      // $0 y MP no procesa importes de cero. El pedido ya quedó 'pagado', así
      // que no hay a dónde redirigir a pagar — se va directo al comprobante.
      if (result.sin_costo) {
        vaciarCarrito()
        window.location.href = result.redirect_url
          || `/pago-exitoso?pedido=${result.numero_pedido}&sin_costo=1`
        return
      }

      if (result.init_point || result.payment_url) {
        window.location.href = result.payment_url || result.init_point
      } else {
        throw new Error('Error creando preferencia de pago')
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Error procesando la orden. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Con experiencias: (1) apartar mis lugares → (2) pagar con tarjeta ───────────────────────────────────────
  /** null = el formulario está completo. */
  const faltaEnElFormulario = (): string | null => {
    const email = correoDelCliente()
    if (!email || !CORREO_VALIDO.test(email)) return 'Escribe un correo válido.'
    if (!customerData.nombre.trim() || !customerData.apellido.trim() || !customerData.telefono) {
      return 'Completa tu nombre, apellido y teléfono.'
    }
    if (hayProductos) {
      if (!deliveryData.address) return 'Completa la dirección de entrega de tus productos.'
      if (!zonaEntrega) return 'El código postal no tiene cobertura de entrega. Verifica tu código postal.'
      if (!selectedDeliveryDate) return 'Elige el día de entrega de tus productos.'
    }
    return null
  }

  /** El precio del servidor manda: si una fecha cambió de precio, el carrito (y los dos resúmenes) se corrigen. */
  const actualizarPrecios = (lineas: SyncValidateResponse['validated_items']) => {
    const porEvento = new Map<string, LineaExperienciaValidada>()
    for (const linea of lineas || []) {
      if ((linea as LineaExperienciaValidada).tipo === 'experiencia') {
        const l = linea as LineaExperienciaValidada
        if (typeof l.precio_adulto === 'number' && typeof l.precio_nino === 'number') porEvento.set(l.evento_id, l)
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
    if (cambio) guardarCarrito(items) // no cambia la firma (fechas, adultos, niños): el apartado sigue
    setPrecioActualizado(cambio)
  }

  const apartarLugares = async () => {
    const falta = faltaEnElFormulario()
    if (falta) {
      mostrarError(falta)
      return
    }
    mostrarError(null)
    setApartando(true)
    try {
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
          nombre: customerData.nombre,
          apellidos: customerData.apellido,
          telefono: customerData.telefono,
          items,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) {
        volverAIniciarSesion()
        return
      }
      if (!res.ok) {
        if (esApartadoVencido(data.detail)) {
          marcarVencido()
          return
        }
        // 409 sin lugares, 400 (fecha que ya no se vende, más de 10…): el texto del servidor tal cual.
        mostrarErrorDelServidor(data, 'No pudimos apartar tus lugares. Intenta de nuevo.')
        return
      }
      const respuesta = data as SyncValidateResponse & { _guest_token?: string }
      if (!respuesta.apartado) {
        mostrarError('No pudimos apartar tus lugares. Intenta de nuevo.')
        return
      }
      setGuestToken(respuesta._guest_token ?? null)
      setApartado(guardarApartado(respuesta.apartado, cartItems))
      setApartadoVencido(false)
      actualizarPrecios(respuesta.validated_items)
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
    setPagando(true)
    let redirigiendo = false
    try {
      const experienciasParaPagar: ExperienciaParaPagar[] = experiencias.map((exp) => ({
        tipo: 'experiencia',
        evento_id: exp.evento_id,
        adultos: exp.adultos,
        ninos: exp.ninos,
        alergias: (alergias[exp.evento_id] ?? '').trim().slice(0, MAX_ALERGIAS) || null,
      }))
      const body: Record<string, unknown> = {
        // Los productos van como siempre ({id, quantity}); el backend relee precio y stock de la base.
        items: [
          ...productos.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          ...experienciasParaPagar,
        ],
        apartado_id: apartado.id,
        email: correoDelCliente(),
        nombre: customerData.nombre,
        apellido: customerData.apellido,
        telefono: customerData.telefono,
        codigo_pais: customerData.codigo_pais,
        // Solo experiencias: SIN fecha_entrega, delivery_*, tipo_entrega ni codigo_cupon (C3).
        ...(hayProductos ? camposEntrega() : {}),
      }
      if (guestToken) body._guest_token = guestToken

      const res = await fetch('/api/crear-preferencia-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json().catch(() => ({}))
      if (res.status === 401) {
        volverAIniciarSesion()
        return
      }
      if (res.status === 409 && esApartadoVencido(result.detail)) {
        marcarVencido()
        return
      }
      if (!res.ok) {
        if (res.status === 400 && cupon) setCupon(null)
        mostrarErrorDelServidor(result, 'No pudimos crear tu pago. Intenta de nuevo.')
        return
      }
      if (result.sin_costo) {
        vaciarCarrito()
        redirigiendo = true
        window.location.href = result.redirect_url || `/pago-exitoso?pedido=${result.numero_pedido}&sin_costo=1`
        return
      }
      const url = result.payment_url || result.init_point
      if (!url) {
        mostrarError('No pudimos crear tu pago. Intenta de nuevo.')
        return
      }
      // El apartado se queda en sessionStorage: si el cliente vuelve con «atrás», sigue el reloj.
      redirigiendo = true
      window.location.href = url
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
            ? 'Completa tus datos, aparta tus lugares y paga con tarjeta'
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
            {deliveryData.address && !editingAddress && !canasta && (
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
          ) : (!deliveryData.address || editingAddress) ? (
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
                    onDateSelect={(date, zona) => {
                      setSelectedDeliveryDate(date)
                      if (date) {
                        setDeliveryData({...deliveryData, preferred_date: date.toISOString().split('T')[0]})
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
                <div className="text-sm text-gray-500" data-testid="metodo-pago-detalle">
                  {hayExperiencias
                    ? 'Tarjeta de crédito o débito: se paga al momento'
                    : canasta
                      ? 'Tarjeta o saldo de Mercado Pago: se paga al momento'
                      : 'Tarjetas, OXXO, transferencias bancarias'}
                </div>
              </div>
            </label>
          </div>

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
            {precioActualizado && apartado && (
              <p className="rounded-lg bg-azul-bg p-3 text-sm text-azul" role="status" data-testid="checkout-precio-actualizado">
                Actualizamos el precio de tus experiencias con el de la fecha: el total ya es el que vas a pagar.
              </p>
            )}
            {apartado && !apartadoVencido && (
              <RelojApartado venceLocalMs={apartado.vence_local_ms} onVencido={marcarVencido} />
            )}
            {apartadoVencido && (
              <p className="rounded-lg border border-rojo bg-rojo-bg p-4 text-sm text-rojo" role="alert" data-testid="apartado-vencido">
                {TEXTO_APARTADO_VENCIDO}
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
                Apartamos tus lugares {MINUTOS_APARTADO} minutos; en ese tiempo pagas con tarjeta.
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
                `Pagar con tarjeta $${total.toFixed(2)}`
              )}
            </Button>
          </div>
        ) : (
        /* Botón de pago */
        <div className="space-y-3">
        {bloqueError}
        <Button
          onClick={handleSubmitOrder}
          disabled={loading || !customerData.nombre || !customerData.apellido || !customerData.telefono ||
                   (!canasta && (!deliveryData.address || !zonaEntrega || !selectedDeliveryDate))}
          className="w-full bg-[#B15543] hover:bg-[#9a4a3a] text-white text-lg py-6"
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
