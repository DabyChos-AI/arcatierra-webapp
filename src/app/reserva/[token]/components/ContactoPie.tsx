'use client'

import { Mail, MessageCircle } from 'lucide-react'
import { linkWhatsApp } from '@/lib/whatsapp'
import { CORREO_EXPERIENCIAS, asuntoContacto, textoWhatsApp } from './textos'

/** Contacto del EQUIPO de Experiencias (nunca datos del cliente). Sale en todos los estados del portal. */
export default function ContactoPie({ folio }: { folio: string | null }) {
  const mailto = `mailto:${CORREO_EXPERIENCIAS}?subject=${encodeURIComponent(asuntoContacto(folio))}`
  return (
    <section
      data-testid="portal-contacto"
      aria-labelledby="portal-contacto-titulo"
      className="rounded-2xl bg-verde p-4 text-white sm:p-6"
    >
      <h2 id="portal-contacto-titulo" className="mb-1 font-heading text-xl text-white">
        ¿Dudas?
      </h2>
      <p className="mb-3 text-base text-white/90">Escríbele al equipo de Experiencias.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          data-testid="portal-contacto-correo"
          href={mailto}
          className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-verde hover:bg-neutro-light hover:text-verde"
        >
          <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="truncate">{CORREO_EXPERIENCIAS}</span>
        </a>
        <a
          data-testid="portal-contacto-whatsapp"
          href={linkWhatsApp(textoWhatsApp(folio))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-white px-4 py-2 font-semibold text-white hover:bg-white/10 hover:text-white"
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </section>
  )
}
