// Utilidades de formateo consistentes para SSR
export function formatPrice(price: number): string {
  // Formateo consistente que funciona igual en servidor y cliente
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDuration(hours: number): string {
  if (hours === 1) return '1 hora';
  if (hours < 24) return `${hours} horas`;
  return `${Math.floor(hours / 24)} día${Math.floor(hours / 24) > 1 ? 's' : ''}`;
}

export function formatCapacity(min: number, max?: number): string {
  if (!max || min === max) return `${min} persona${min > 1 ? 's' : ''}`;
  return `${min}-${max} personas`;
}

