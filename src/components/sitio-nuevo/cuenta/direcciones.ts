// R15 v2 · F6 (cuenta, sesión 64): la lógica de las direcciones de Mi cuenta, la de HOY (`src/app/usuario/dashboard/page.tsx`) en un módulo
// puro para que la página nueva la use y la prueba la compare (f6/cuenta-F6.md §4). Los cuerpos del POST y del PUT son `formDireccion` entero
// con las mismas llaves y en el mismo orden que hoy (`:119-131`, `:204-207`, `:262-266`). Lo que cambia (plan aprobado, D-F6-11 P-8/P-9):
// la zona se busca al editar (hoy el selector ignora su valor y el día no sale), el formulario vuelve a vacío al abrir «Agregar» (hoy se
// queda con lo de la última edición cancelada y el título dice «Editar»), y la lista se relee también después del PUT y del DELETE.
import type { ZonaEntrega } from '@/components/sitio-nuevo/tienda/zonas'
import { BODEGA } from '@/lib/bodega'
import { TEXTO_ERROR_DIRECCION } from './textos'

/** Una dirección de `GET /api/direcciones` (las llaves que usa la pantalla de hoy, `usuario/dashboard/page.tsx:71-87`). */
export interface DireccionCuenta {
  id: string
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior?: string
  colonia: string
  alcaldia?: string
  codigo_postal: string
  ciudad: string
  estado: string
  referencias?: string
  dia_preferido_entrega?: string
  alergias_restricciones?: string
  es_principal: boolean
  activa: boolean
}

/** El formulario de hoy, con sus llaves en el orden de hoy (`usuario/dashboard/page.tsx:119-131`): es el cuerpo del POST y del PUT. */
export interface FormDireccion {
  nombre_direccion: string
  calle: string
  numero_exterior: string
  numero_interior: string
  colonia: string
  alcaldia: string
  codigo_postal: string
  referencias: string
  dia_preferido_entrega: string
  alergias_restricciones: string
  es_principal: boolean
}

/** El formulario vacío de hoy (`:119-131`, y el que se pone después de guardar, `:216-228`, `:275-287`). */
export function formVacio(): FormDireccion {
  return {
    nombre_direccion: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    alcaldia: '',
    codigo_postal: '',
    referencias: '',
    dia_preferido_entrega: '',
    alergias_restricciones: '',
    es_principal: false,
  }
}

/** Al editar, el formulario con los datos de la dirección, como hoy (`handleEditarDireccion`, `:238-252`). */
export function formDeDireccion(direccion: DireccionCuenta): FormDireccion {
  return {
    nombre_direccion: direccion.nombre_direccion,
    calle: direccion.calle,
    numero_exterior: direccion.numero_exterior,
    numero_interior: direccion.numero_interior || '',
    colonia: direccion.colonia,
    alcaldia: direccion.alcaldia || '',
    codigo_postal: direccion.codigo_postal,
    referencias: direccion.referencias || '',
    dia_preferido_entrega: direccion.dia_preferido_entrega || '',
    alergias_restricciones: direccion.alergias_restricciones || '',
    es_principal: direccion.es_principal,
  }
}

/**
 * Lo que hace hoy el selector de zona al cambiar (`:789-801`): con zona, su CP, su colonia y su municipio (alcaldía) y el día vuelve a
 * vacío; sin zona (se borró el CP), solo el CP.
 */
export function formConZona(form: FormDireccion, cp: string, zona: ZonaEntrega | null): FormDireccion {
  if (zona) {
    return { ...form, codigo_postal: cp, colonia: zona.colonia, alcaldia: zona.municipio, dia_preferido_entrega: '' }
  }
  return { ...form, codigo_postal: cp }
}

/** «Recoger en matriz →» de hoy (`:803-812`, BOD1): la bodega de `lib/bodega.ts`. */
export function formConBodega(form: FormDireccion): FormDireccion {
  return { ...form, calle: BODEGA.calle, colonia: BODEGA.colonia, alcaldia: BODEGA.alcaldia, codigo_postal: BODEGA.codigoPostal }
}

/**
 * Al editar, la zona de la dirección en la MISMA lista de zonas (sin llamada nueva): la de su CP y su colonia. Así el «Día preferido de
 * entrega» se ve y se puede cambiar sin volver a elegir la zona. Si no está (p. ej. la bodega), null, y el día no se pinta, como hoy.
 */
export function zonaDeDireccion(zonas: readonly ZonaEntrega[], form: Pick<FormDireccion, 'codigo_postal' | 'colonia'>): ZonaEntrega | null {
  return zonas.find((z) => z.codigo_postal === form.codigo_postal && z.colonia === form.colonia) ?? null
}

/** El `detail` del proxy si es texto («No entregamos en el código postal …», DIR2); si no, el genérico (`textoErrorDireccion`, `:93-104`). */
export async function textoErrorDireccion(respuesta: Response): Promise<string> {
  try {
    const cuerpo: unknown = await respuesta.json()
    if (cuerpo && typeof cuerpo === 'object' && 'detail' in cuerpo) {
      const detail = (cuerpo as { detail: unknown }).detail
      if (typeof detail === 'string' && detail.trim()) return detail
    }
  } catch {
    // cuerpo vacío o no JSON
  }
  return TEXTO_ERROR_DIRECCION
}

/** Lo que se lee de `GET /api/direcciones`: una lista (el proxy responde `[]` si la API falla, `api/direcciones/route.ts:54-64`). */
export function listaDeDirecciones(datos: unknown): DireccionCuenta[] | null {
  return Array.isArray(datos) ? (datos as DireccionCuenta[]) : null
}

/** Los días de hoy en su orden, con su llave y su nombre (`usuario/dashboard/page.tsx:845-853`). */
export const DIAS_SEMANA: ReadonlyArray<{ llave: keyof Pick<ZonaEntrega, 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'>; nombre: string }> = [
  { llave: 'lunes', nombre: 'Lunes' },
  { llave: 'martes', nombre: 'Martes' },
  { llave: 'miercoles', nombre: 'Miércoles' },
  { llave: 'jueves', nombre: 'Jueves' },
  { llave: 'viernes', nombre: 'Viernes' },
  { llave: 'sabado', nombre: 'Sábado' },
  { llave: 'domingo', nombre: 'Domingo' },
]
