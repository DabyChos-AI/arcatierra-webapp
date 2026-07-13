'use client'

/**
 * Renderiza una duracion estimada en horas, en gris: "~Xh est.".
 * Ej: 4.5 → "~4.5h est.".
 */
export default function DisplayDuracion({ horas }: { horas: number }) {
  return <span className="text-verde-suave">~{horas}h est.</span>
}
