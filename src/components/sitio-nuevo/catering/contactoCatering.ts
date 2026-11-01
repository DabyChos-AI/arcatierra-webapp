// R15 v2 · F4 (catering): el WhatsApp y el correo de catering de hoy, en UN solo lugar del sitio nuevo (contrato v2 §9-F4 D-F4-09 P-1).
//
// Hoy viven escritos dentro de los componentes de /catering (ninguno los exporta) y `src/lib/contacto.ts:33` dice «catering@ es aparte:
// pregunta abierta» (MAILC1), así que no van ahí: se copian AQUÍ, una sola vez, con su fuente. La prueba de la entrega
// (`f4-catering/pruebas/contacto-catering.mjs`) los compara con TODAS sus apariciones de hoy y falla si una cambia:
// - WhatsApp: `components/catering/Hero.tsx:15` (= `Services.tsx:23` = `Header.tsx:19`; y `Footer.tsx:62-63` con «+» y espacios).
// - Correo: `components/catering/CorporateRequestModal.tsx:55` (= `Footer.tsx:56-57` y `app/catering/contacto/page.tsx:109`).
// Los teléfonos y nombres de personas de `components/catering/Contact.tsx:47-60` NO se usan (son datos de personas).
// Cuando se cierre MAILC1, esto se centraliza en `lib/contacto.ts` (TASK-LIST).

/** El número de WhatsApp de catering, en la forma que lo pone hoy `wa.me` (`Hero.tsx:15-17`): solo dígitos. */
export const WHATSAPP_CATERING = '525639851733'

/** El correo de catering (`CorporateRequestModal.tsx:55`). */
export const CORREO_CATERING = 'catering@arcatierra.com'

/** El mensaje con que hoy abre el WhatsApp de catering el botón «Cotizar mi evento» (`Hero.tsx:16`). */
export const MENSAJE_WHATSAPP_CATERING = 'Hola, me interesa cotizar un evento con Arca Tierra Catering'

/** La liga `wa.me` como la arma hoy `Hero.tsx:17` (`https://wa.me/<número>?text=<mensaje codificado>`). */
export function linkWhatsAppCatering(mensaje: string = MENSAJE_WHATSAPP_CATERING): string {
  return `https://wa.me/${WHATSAPP_CATERING}?text=${encodeURIComponent(mensaje)}`
}

/** El `mailto:` de catering con el asunto y el cuerpo de hoy (`Contact.tsx:34-36`). */
export function mailtoCatering(): string {
  const asunto = encodeURIComponent('Consulta sobre servicios de catering')
  const cuerpo = encodeURIComponent('Hola, me interesa conocer más sobre sus servicios de catering para mi evento.')
  return `mailto:${CORREO_CATERING}?subject=${asunto}&body=${cuerpo}`
}
