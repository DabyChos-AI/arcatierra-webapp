/**
 * WhatsApp de Arca Tierra: UN solo número para toda la web (antes vivía en `components/WhatsAppChat.tsx`, repetido
 * en `app/experiencias/[slug]/page.tsx`, y las páginas de pago pendiente/fallido tenían uno falso).
 * Fase 4 de PLAN-EXP-SIN-FALLAS (sesión 39). Lo escribe el líder.
 */
export const WHATSAPP_NUMERO = '+525510515525'

/** Link `wa.me` con el mensaje ya escrito. */
export function linkWhatsApp(texto?: string): string {
  const numero = WHATSAPP_NUMERO.replace(/\D/g, '')
  return texto ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` : `https://wa.me/${numero}`
}
