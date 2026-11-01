// R15 v2 · F5 (recetas, sesión 63): las preguntas de la FAQ nueva salen de `src/data/faq.ts` IMPORTADO (D-F5-04), en su orden, con tres
// excepciones porque su respuesta de hoy choca con una regla firmada o con una pregunta abierta (contrato v2 D-F5-06, D-F5-12;
// cadena-v2/f5/recetas-F5.md §3.8–3.10):
// - id 2 (`faq.ts:15`): «al menos 48 horas» para TODA experiencia; las privadas son 72 h (C9). La respuesta sale solo de reglas firmadas
//   (DR-3: la venta en línea de una pública cierra 48 h antes; C9: privadas con 72 h) más la segunda oración de hoy (D-F5-12 P-12 A).
// - id 4 (`faq.ts:25`): «No hacemos reembolsos» es una de las dos reglas de C38, que sigue abierta: el sitio nuevo no escribe ninguna.
//   La pregunta va y su respuesta es la marca M6 (el `que` de D-F3-20 P-3 letra por letra).
// - id 10 (`faq.ts:61`): «48 horas» para privadas; va la misma oración de hoy con 72 (C9; D-F5-12 P-13).
// «48» y «72» están en la lista corta (D-F5-12). Lo demás se importa tal cual: sus cifras cuentan como dato importado (D-F5-09 (4)).
import { faqData, type FaqCategory } from '@/data/faq'

export type OrigenRespuesta = 'hoy' | 'regla'

export type PreguntaFaq = {
  id: number
  pregunta: string
  /** `null` = no se escribe ninguna respuesta: va la marca de C38 (id 4). */
  respuesta: string | null
  origen: OrigenRespuesta
}

export type CategoriaFaq = {
  clave: FaqCategory
  titulo: string
  preguntas: PreguntaFaq[]
}

const RESPUESTAS_CON_REGLA: Readonly<Record<number, string>> = {
  2: 'Las experiencias públicas se reservan en línea hasta 48 horas antes; las privadas se solicitan con al menos 72 horas de anticipación. No contamos con servicio de restaurante, sino que operamos experiencias completas públicas y privadas.',
  10: 'Las experiencias privadas siempre se pueden agendar durante la semana con al menos 72 horas de anticipación. Las experiencias públicas solo se realizan en fin de semana normales o largos.',
}

const SIN_RESPUESTA: ReadonlySet<number> = new Set([4])

/** Las 6 categorías de hoy, en su orden, con sus preguntas (las tres excepciones de arriba ya aplicadas). */
export function categoriasDeHoy(): CategoriaFaq[] {
  return (Object.keys(faqData) as FaqCategory[]).map((clave) => ({
    clave,
    titulo: faqData[clave].title,
    preguntas: faqData[clave].questions.map((q) => {
      if (SIN_RESPUESTA.has(q.id)) return { id: q.id, pregunta: q.question, respuesta: null, origen: 'hoy' as const }
      const conRegla = RESPUESTAS_CON_REGLA[q.id]
      if (conRegla !== undefined) return { id: q.id, pregunta: q.question, respuesta: conRegla, origen: 'regla' as const }
      return { id: q.id, pregunta: q.question, respuesta: q.answer, origen: 'hoy' as const }
    }),
  }))
}
