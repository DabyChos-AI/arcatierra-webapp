// R15 v2 · F6 (cuenta, sesión 64): la lógica de «Mi perfil» de HOY (`src/app/usuario/perfil/page.tsx`) en un módulo puro, para que Datos la
// use y la prueba compare el cuerpo del PATCH con el de hoy (D-F6-11 P-11 = D; f6/cuenta-F6.md §5). Mismas llaves, mismos valores y mismo
// orden que `updateData` de hoy (`:173-185`), `direccion_principal` incluida y calculada como hoy (`:104-121`), MÁS `codigo_pais` (D-F6-23,
// DR-25: el país del perfil SE GUARDA; hoy la pantalla lo deja cambiar y no lo manda). Zona de entrega, Día favorito y Dirección no son
// campos (D-F6-11; viven en Mis Direcciones).
import type { MeCuenta } from './contexto'
import { DIAS_SEMANA } from './direcciones'

/** Una dirección de `GET /api/direcciones/` con lo que lee hoy la pantalla (`perfil:111`, `:119-121`). */
export interface DireccionDePerfil {
  activa?: boolean
  es_principal?: boolean
  codigo_postal?: string
  dia_preferido_entrega?: string
  calle?: string
  numero_exterior?: string
  colonia?: string
  alcaldia?: string
}

/** El perfil de hoy (`UserProfile`, `perfil:35-70`), solo con lo que Datos pinta o manda. */
export interface PerfilCuenta {
  /** `userData.nombre_completo || userData.nombre` tal cual (puede ser null o vacío: el cuerpo del PATCH cambia con eso, como hoy). */
  name: string | null | undefined
  email: string | null | undefined
  phone: string
  codigoPais: string
  address: string
  birthDate: string
  preferences: {
    newsletter: boolean
    notifications: boolean
    dietaryRestrictions: { vegetarian: boolean; vegan: boolean; glutenFree: boolean; lactoseFree: boolean }
  }
  memberSince: string
}

export type LlaveRestriccion = keyof PerfilCuenta['preferences']['dietaryRestrictions']

/** Las restricciones de hoy, en su orden, con el valor que guarda la API y su nombre (`perfil:127-130`, `:164-170`, `:602-607`). */
export const RESTRICCIONES: ReadonlyArray<{ llave: LlaveRestriccion; valor: string; nombre: string }> = [
  { llave: 'vegetarian', valor: 'vegetariano', nombre: 'Vegetariano' },
  { llave: 'vegan', valor: 'vegano', nombre: 'Vegano' },
  { llave: 'glutenFree', valor: 'sin_gluten', nombre: 'Sin Gluten' },
  { llave: 'lactoseFree', valor: 'sin_lactosa', nombre: 'Sin Lactosa' },
]

/** La dirección de hoy para `direccion_principal`: la primera activa o la primera (`perfil:111`, `:119-121`). */
export function direccionPrincipalDe(direcciones: unknown): string {
  const lista = Array.isArray(direcciones) ? (direcciones as DireccionDePerfil[]) : []
  const principal = lista.find((d) => d.activa) || lista[0]
  return principal ? `${principal.calle} ${principal.numero_exterior}, ${principal.colonia}, ${principal.alcaldia}` : ''
}

/**
 * El perfil como lo arma hoy (`perfil:113-138`). `codigoPais` con el respaldo de hoy «+52» (`:118`, D-F6-14 (e): también es el valor por
 * omisión de la columna y de la API, `payments.py:209-211`; «+52» está en la lista corta de F6). País se edita con el selector de hoy (D-F6-23).
 */
export function perfilDe(me: MeCuenta, direcciones: unknown, hoyIso: string): PerfilCuenta {
  const r = me.preferencias?.restricciones_dieteticas
  return {
    name: me.nombre_completo || me.nombre,
    email: me.email,
    phone: me.telefono || '',
    codigoPais: me.codigo_pais || '+52',
    address: direccionPrincipalDe(direcciones),
    birthDate: me.fecha_nacimiento || '',
    preferences: {
      newsletter: me.preferencias?.newsletter || false,
      notifications: me.preferencias?.notificaciones || false,
      dietaryRestrictions: {
        vegetarian: r?.includes('vegetariano') || false,
        vegan: r?.includes('vegano') || false,
        glutenFree: r?.includes('sin_gluten') || false,
        lactoseFree: r?.includes('sin_lactosa') || false,
      },
    },
    memberSince: me.fecha_registro || hoyIso,
  }
}

/** El cuerpo del PATCH de hoy (`perfil:163-185`), llave por llave y en su orden, más `codigo_pais` después de `telefono` (D-F6-23). */
export function cuerpoPatch(p: PerfilCuenta) {
  const restrictions: string[] = []
  if (p.preferences?.dietaryRestrictions) {
    if (p.preferences.dietaryRestrictions.vegetarian) restrictions.push('vegetariano')
    if (p.preferences.dietaryRestrictions.vegan) restrictions.push('vegano')
    if (p.preferences.dietaryRestrictions.glutenFree) restrictions.push('sin_gluten')
    if (p.preferences.dietaryRestrictions.lactoseFree) restrictions.push('sin_lactosa')
  }
  return {
    nombre: p.name?.split(' ')[0],
    apellidos: p.name?.split(' ').slice(1).join(' '),
    nombre_completo: p.name,
    telefono: p.phone,
    codigo_pais: p.codigoPais,
    direccion_principal: p.address,
    fecha_nacimiento: p.birthDate || null,
    preferencias: {
      newsletter: p.preferences?.newsletter || false,
      notificaciones: p.preferences?.notifications || false,
      restricciones_dieteticas: restrictions,
    },
  }
}

/** «DD/MM/AAAA» de hoy (`perfil:454-457`). */
export function fechaNacimientoDe(birthDate: string): string {
  const [year, month, day] = birthDate.split('-')
  return `${day}/${month}/${year}`
}

/** «Miembro desde {mes año}» de hoy (`perfil:337-340`). */
export function miembroDesdeDe(memberSince: string): string {
  return new Date(memberSince).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

/**
 * D-F6-24 (DR-26): la zona y el día favorito de la dirección PRINCIPAL (`es_principal`), de solo lectura en Datos. null = «No especificado».
 * Zona: el texto de hoy «CP {cp} - {colonia}, {municipio}» (`perfil:485`; aquí el municipio es la alcaldía de la dirección, que el selector
 * de zona llena con `zona.municipio`), sin el municipio si la dirección no lo trae, y «CP {cp}» (`perfil:489`) si tampoco trae colonia.
 * Día: el nombre de hoy del día guardado (`dashboard:845-853`; hoy `perfil:555` pinta la llave cruda con mayúscula de CSS, «Miercoles»).
 */
export function entregaPrincipalDe(direcciones: unknown): { zona: string | null; dia: string | null } {
  const lista = Array.isArray(direcciones) ? (direcciones as DireccionDePerfil[]) : []
  const p = lista.find((d) => d.es_principal)
  if (!p) return { zona: null, dia: null }
  const cp = p.codigo_postal
  const zona = !cp ? null : p.colonia && p.alcaldia ? `CP ${cp} - ${p.colonia}, ${p.alcaldia}` : p.colonia ? `CP ${cp} - ${p.colonia}` : `CP ${cp}`
  const dia = p.dia_preferido_entrega ? (DIAS_SEMANA.find((x) => x.llave === p.dia_preferido_entrega)?.nombre ?? p.dia_preferido_entrega) : null
  return { zona, dia }
}
