// R11b · ACC1 (sesión 51, 22-oct-2026). Dueño: el líder. Contrato: docs/decisiones/R11B-CONTRATO.md §4.5.
// Mi cuenta del cliente en el sitio actual: recuperar contraseña, Mis pedidos (con detalle) y Mis suscripciones.
// Las pantallas llaman DIRECTO a `${API_URL}` con `Authorization: Bearer ${session.accessToken}`, igual que
// src/app/usuario/reservas/page.tsx (sin proxies nuevos). Recuperar contraseña es público y también va directo (el límite
// por IP necesita la IP real del cliente).

// ─── Recuperar contraseña (público) ────────────────────────────────────────────────────────────────────────────────
/** POST /api/auth/recuperar → 200 RespuestaRecuperar SIEMPRE igual (exista o no la cuenta) · 422 · 429. */
export interface RecuperarPayload {
  email: string
}
export interface RespuestaRecuperar {
  success: true
  message: string
}

/**
 * POST /api/auth/restablecer → 200 {success, message} · 400 {detail, codigo} si el enlace no sirve · 422 (contraseña corta).
 * El token llega en la URL de la página (/auth/restablecer?token=…) y se manda en el CUERPO, nunca en la URL de la API.
 */
export interface RestablecerPayload {
  token: string
  password: string // 8..128
}
export type CodigoEnlaceInvalido = 'enlace_invalido' | 'enlace_vencido' | 'enlace_usado'

export const PASSWORD_MIN = 8
/** El enlace del correo dura (minutos): */
export const RECUPERAR_MINUTOS = 60

// ─── Mis pedidos (con sesión) ───────────────────────────────────────────────────────────────────────────────────────
export type EstadoPedido = 'esperando_pago' | 'pendiente' | 'pagado' | 'entregado' | 'cancelado' | 'reembolsado'

/** Texto para el cliente; un estado que no esté aquí se muestra tal cual. */
export const ETIQUETA_ESTADO_PEDIDO: Record<string, string> = {
  esperando_pago: 'Esperando pago',
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  // R11b: para el cliente está pagado; lo del stock es interno del equipo.
  pagado_sin_stock: 'Pagado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

export interface MiPedidoResumen {
  id: string
  numero_pedido: string
  /** ISO con zona */
  fecha: string
  estado: string
  total: number
  /** 'envio_domicilio' | 'recoger_almacen' */
  tipo_entrega: string | null
  /** YYYY-MM-DD */
  fecha_entrega: string | null
  num_productos: number
}

/** GET /api/usuario/mis-pedidos?page=1&limit=20 (más nuevos primero; sin los «esperando_pago» de más de 7 días). */
export interface MisPedidosRespuesta {
  items: MiPedidoResumen[]
  total: number
}

export interface MiPedidoRenglon {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

/** GET /api/usuario/mis-pedidos/{id} → MiPedidoDetalle · 404 si no existe o NO es tuyo (misma respuesta). */
export interface MiPedidoDetalle extends MiPedidoResumen {
  renglones: MiPedidoRenglon[]
  sub_total: number | null
  costo_envio: number | null
  descuento: number | null
  /** Dirección de entrega (la tuya) o la de la bodega si recoges. */
  direccion_entrega: string | null
  notas_entrega: string | null
  /** Texto del pago para el cliente («Pagado con tarjeta», «Esperando pago»…), sin ids de MercadoPago. */
  pago_texto: string | null
}

// ─── Mis suscripciones (con sesión) ─────────────────────────────────────────────────────────────────────────────────
/**
 * GET /api/usuario/mis-suscripciones → MisSuscripcionesRespuesta.
 * Las acciones (`acciones`) las decide el servidor; la pantalla solo pinta los botones que vengan.
 * SUB6 (David, 22-oct: opción B): ya no hay pausa; solo `cancelar`. Para volver, el cliente se suscribe de nuevo.
 * POST /api/subscriptions/{id}/cancelar → 200 {success, message} · 400 {detail} · 403 con token de invitado.
 * POST …/pausar y …/reanudar → 410 {detail}.
 */
export type AccionSuscripcion = 'cancelar'

export interface MiSuscripcion {
  id: string
  nombre: string
  tipo_canasta: string | null
  frecuencia: string | null
  estado: string
  precio: number | null
  fecha_inicio: string | null
  fecha_fin: string | null
  /** Día de entrega para el cliente («Martes») o null */
  dia_entrega: string | null
  /** YYYY-MM-DD de la próxima canasta programada, o null */
  proxima_entrega: string | null
  /** SUB7 (R11b): ISO con zona del primer cobro rechazado del episodio; null = al corriente. Mientras no sea null, las canastas
   *  se retienen: la pantalla avisa «No pudimos cobrar tu suscripción…» (texto de `TEXTO_COBRO_FALLIDO`). */
  cobro_fallido_desde: string | null
  acciones: AccionSuscripcion[]
}

/** SUB7: aviso al cliente mientras su cobro está fallando (MercadoPago reintenta solo). */
export const TEXTO_COBRO_FALLIDO =
  'No pudimos cobrar tu suscripción. MercadoPago lo volverá a intentar en los próximos días; revisa que tu tarjeta tenga saldo y esté vigente. Tus canastas salen en cuanto se apruebe el cobro.'

export interface MisSuscripcionesRespuesta {
  items: MiSuscripcion[]
}

// ─── SUBF1: la fecha real de la primera entrega ─────────────────────────────────────────────────────────────────────
/** GET /api/subscriptions/primera-entrega?dia_preferido=<Lunes..Viernes|''> → {fecha: YYYY-MM-DD} (público). */
export interface PrimeraEntregaRespuesta {
  fecha: string
}
