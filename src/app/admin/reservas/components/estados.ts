import type { ReservaEstado } from '@/types/reservas'

// Estados de una reserva tal como los guarda la base (CHECK de reservas_experiencias.estado).
// Ojo: es 'tentativo'. El filtro mandaba 'tentativa' y el backend respondía 400.
export const ESTADO_OPTIONS: { value: ReservaEstado; label: string }[] = [
  { value: 'tentativo', label: 'Tentativa' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'reagendada', label: 'Reagendada' },
]

// Lo que se ve por defecto en la tabla y SIEMPRE en el calendario: todo menos las canceladas
// (29-sep, pedido de David: "ya están canceladas, solo estorban visualmente"). En la tabla siguen
// a un clic marcando "Cancelada" en el filtro de Estado.
export const ESTADOS_VISIBLES: ReservaEstado[] = ESTADO_OPTIONS.map((o) => o.value).filter(
  (v) => v !== 'cancelada',
)
