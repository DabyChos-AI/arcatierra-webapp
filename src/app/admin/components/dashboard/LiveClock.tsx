'use client'

import { useEffect, useState } from 'react'

interface LiveClockProps {
  /** IANA timezone. Default: America/Mexico_City (CDMX). */
  tz?: string
}

/**
 * Reloj en vivo para el welcome banner del dashboard ejecutivo.
 * Se actualiza cada segundo. Renderiza un placeholder hasta montar para
 * evitar hydration mismatch (la hora del server difiere de la del cliente).
 */
export default function LiveClock({ tz = 'America/Mexico_City' }: LiveClockProps) {
  const [hora, setHora] = useState<string>('')

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('es-MX', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const tick = () => setHora(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tz])

  return (
    <div className="flex items-center gap-2 text-white flex-shrink-0">
      <span
        className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"
        aria-hidden="true"
      />
      <span className="text-lg font-semibold tabular-nums tracking-tight">
        {hora || '--:--:--'}
      </span>
      <span className="text-[11px] font-normal opacity-70">CDMX</span>
    </div>
  )
}
