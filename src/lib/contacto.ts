/**
 * TEL3 (sesión K2, 23-oct-2026; datos de David): UNA sola fuente del teléfono y las redes de Arca Tierra para toda la
 * web (páginas, pie y JSON-LD). El número es el de WhatsApp (`WHATSAPP_NUMERO` de `lib/whatsapp.ts`, que no se repite
 * aquí). Nada de cuentas inventadas: solo las que dio David.
 */
import { WHATSAPP_NUMERO, linkWhatsApp } from '@/lib/whatsapp'

/** `+525510515525` → `+52 55 1051 5525` (lo que se lee en la página). */
function telefonoVisible(e164: string): string {
  const d = e164.replace(/\D/g, '') // 525510515525
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`
}

export const CONTACTO = {
  /** E.164: `+525510515525` (también es el de los JSON-LD, en esta forma y solo esta). */
  telefono: WHATSAPP_NUMERO,
  /** `+52 55 1051 5525` */
  telefonoVisible: telefonoVisible(WHATSAPP_NUMERO),
  /** `tel:+525510515525` */
  telefonoHref: `tel:${WHATSAPP_NUMERO}`,
  /** `https://wa.me/525510515525` */
  whatsappUrl: linkWhatsApp(),
  redes: {
    instagram: 'https://www.instagram.com/arca.tierra',
    facebook: 'https://www.facebook.com/profile.php?id=100063154154945',
    tiktok: 'https://www.tiktok.com/@arca.tierra',
    youtube: 'https://youtube.com/@arcatierra4183',
  },
} as const

/**
 * MAILC1 (David, 23-oct): DOS correos públicos. Experiencias y turismo → `CORREO_EXPERIENCIAS`; todo lo demás (pedidos,
 * pagos, canastas, suscripciones, restaurantes, dudas generales) → `CORREO_GENERAL`. (catering@ es aparte: pregunta abierta.)
 */
export const CORREO_GENERAL = 'info@arcatierra.com'
export const CORREO_EXPERIENCIAS = 'experiencias@arcatierra.com'

/** Las redes en orden, para pintar los íconos y para el `sameAs` de los JSON-LD. */
export const REDES_SOCIALES = [
  { red: 'instagram', nombre: 'Instagram', url: CONTACTO.redes.instagram },
  { red: 'facebook', nombre: 'Facebook', url: CONTACTO.redes.facebook },
  { red: 'tiktok', nombre: 'TikTok', url: CONTACTO.redes.tiktok },
  { red: 'youtube', nombre: 'YouTube', url: CONTACTO.redes.youtube },
] as const

/** `sameAs` de schema.org. */
export const SAME_AS: string[] = REDES_SOCIALES.map((r) => r.url)

/** Trazo del ícono de TikTok (viewBox 0 0 24 24; lucide no lo trae). */
export const ICONO_TIKTOK_PATH =
  'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
