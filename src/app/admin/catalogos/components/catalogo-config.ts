import type { TipoCatalogo, TipoCocina, TipoFuente } from '@/types/planeacion'

// Pestañas de /admin/catalogos, en orden
export const CATALOGOS: { tipo: TipoCatalogo; label: string }[] = [
  { tipo: 'fuentes', label: 'Fuentes' },
  { tipo: 'chinampas', label: 'Chinampas' },
  { tipo: 'cocinas', label: 'Cocinas' },
]

export const NOMBRE_SINGULAR: Record<TipoCatalogo, string> = {
  fuentes: 'fuente',
  chinampas: 'chinampa',
  cocinas: 'cocina',
}

// Tipos que acepta el backend por catálogo (chinampas no tiene tipo)
export const TIPOS_POR_CATALOGO: Record<
  TipoCatalogo,
  { value: TipoFuente | TipoCocina; label: string }[]
> = {
  fuentes: [
    { value: 'canal', label: 'Canal' },
    { value: 'persona', label: 'Persona' },
  ],
  chinampas: [],
  cocinas: [
    { value: 'cocina', label: 'Cocina' },
    { value: 'chef_invitado', label: 'Chef invitado' },
  ],
}

export function etiquetaTipo(tipoCatalogo: TipoCatalogo, tipo: string | null): string {
  if (!tipo) return '—'
  return TIPOS_POR_CATALOGO[tipoCatalogo].find((t) => t.value === tipo)?.label ?? tipo
}
